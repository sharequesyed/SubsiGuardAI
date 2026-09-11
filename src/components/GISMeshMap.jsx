import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { 
  Layers, 
  Radio, 
  MapPin, 
  Maximize2, 
  RotateCcw, 
  ZapOff, 
  Activity, 
  Globe, 
  Compass,
  AlertTriangle,
  Info,
  X,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export function GISMeshMap({ 
  nodes, 
  activeMine, 
  onSelectNode, 
  selectedNode,
  onToggleNodeDisabled,
  disabledNodeIds = []
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layerGroupRef = useRef(null);

  const [mapType, setMapType] = useState('satellite'); // 'satellite' | 'carto' | 'osm'
  const [showMeshLinks, setShowMeshLinks] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showUndergroundPanel, setShowUndergroundPanel] = useState(true);
  const [isLegendOpen, setIsLegendOpen] = useState(false);

  // Initialize or re-center Leaflet Map when activeMine changes
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Create new Leaflet map
      const map = L.map(mapContainerRef.current, {
        center: [activeMine.centerLat, activeMine.centerLng],
        zoom: activeMine.defaultZoom || 16,
        zoomControl: false,
        attributionControl: false
      });

      // Add Zoom Control at top-right
      L.control.zoom({ position: 'topright' }).addTo(map);

      // Layer group for all our dynamic overlays
      const layerGroup = L.layerGroup().addTo(map);
      layerGroupRef.current = layerGroup;
      mapInstanceRef.current = map;
    } else {
      // Center existing map on activeMine
      mapInstanceRef.current.setView(
        [activeMine.centerLat, activeMine.centerLng],
        activeMine.defaultZoom || 16,
        { animate: true }
      );
    }
  }, [activeMine]);

  // Handle Base Tile Layer switching
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Remove existing tile layers
    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    let tileUrl = '';
    let maxZoom = 19;

    if (mapType === 'satellite') {
      tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      maxZoom = 18;
    } else if (mapType === 'carto') {
      tileUrl = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
    } else {
      tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    }

    const tileLayer = L.tileLayer(tileUrl, { maxZoom, subdomains: 'abcd' });
    tileLayer.addTo(map);
    tileLayer.bringToBack();
  }, [mapType]);

  // Render / Update GeoJSON Overlays, Mesh Links, Knothe Heatmap, and Node Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layerGroup = layerGroupRef.current;
    if (!map || !layerGroup) return;

    layerGroup.clearLayers();

    const gateway = activeMine.gatewayLocation;

    // 1. Underground Coal Seam Extraction Panel Polygon
    if (showUndergroundPanel && activeMine.panelPolygon) {
      const panelPoly = L.polygon(activeMine.panelPolygon, {
        color: '#0284c7',
        weight: 2,
        dashArray: '6, 6',
        fillColor: '#0284c7',
        fillOpacity: 0.15
      }).bindTooltip(
        `<b>UNDERGROUND PANEL BOUNDARY</b><br>Seam: ${activeMine.seamName}<br>Depth: ${activeMine.depthH}m | Thickness: ${activeMine.thicknessM}m`,
        { permanent: false, direction: 'top' }
      );
      layerGroup.addLayer(panelPoly);
    }

    // 2. Active Surface Tensile Crack Fault Line
    if (activeMine.crackLine) {
      const crackPolyline = L.polyline(activeMine.crackLine, {
        color: '#ef4444',
        weight: 3.5,
        dashArray: '4, 4'
      }).bindTooltip(
        `<b>ACTIVE TENSILE CRACK ZONE</b><br>Overlying ${activeMine.surfaceAssets[0]}`,
        { permanent: false }
      );
      layerGroup.addLayer(crackPolyline);
    }

    // 3. Knothe Subsidence Trough Heatmap Circles
    if (showHeatmap) {
      // Critical Center Trough
      const centerTrough = L.circle([activeMine.centerLat - 0.0003, activeMine.centerLng], {
        radius: 140,
        fillColor: '#ef4444',
        fillOpacity: 0.32,
        stroke: true,
        color: '#ef4444',
        weight: 1.5,
        dashArray: '3, 3'
      }).bindTooltip('<b>Critical Subsidence Zone</b> (S &gt; 300 mm)');
      layerGroup.addLayer(centerTrough);

      // Warning Intermediate Zone
      const warningTrough = L.circle([activeMine.centerLat - 0.0003, activeMine.centerLng], {
        radius: 260,
        fillColor: '#f59e0b',
        fillOpacity: 0.18,
        stroke: true,
        color: '#f59e0b',
        weight: 1,
        dashArray: '5, 5'
      }).bindTooltip('<b>Secondary Creep Zone</b> (S: 100–300 mm)');
      layerGroup.addLayer(warningTrough);
    }

    // 4. Mesh Hop Links
    if (showMeshLinks) {
      nodes.forEach(node => {
        if (disabledNodeIds.includes(node.id)) return;

        let targetLat = gateway.lat;
        let targetLng = gateway.lng;

        if (node.parent && node.parent !== 'GATEWAY') {
          const parentNode = nodes.find(n => n.id === node.parent);
          if (parentNode && !disabledNodeIds.includes(parentNode.id)) {
            targetLat = parentNode.lat;
            targetLng = parentNode.lng;
          }
        }

        const isTier1 = node.tier.includes('Tier 1');
        const isSelected = selectedNode?.id === node.id;

        const link = L.polyline([[node.lat, node.lng], [targetLat, targetLng]], {
          color: isSelected ? '#38bdf8' : (isTier1 ? '#06b6d4' : '#0284c7'),
          weight: isSelected ? 2.5 : (isTier1 ? 1.8 : 1.2),
          dashArray: isTier1 ? undefined : '4, 4',
          opacity: isSelected ? 0.95 : 0.65
        });
        layerGroup.addLayer(link);
      });
    }

    // 5. Central Pithead LoRa Gateway Marker
    const gatewayIcon = L.divIcon({
      className: 'custom-gateway-icon',
      html: `
        <div style="
          position: relative;
          width: 32px;
          height: 32px;
          background: #0284c7;
          border: 3px solid #ffffff;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 15px rgba(2, 132, 199, 0.8);
          color: white;
          font-weight: 800;
          font-size: 11px;
        ">
          GW
          <span style="
            position: absolute;
            width: 46px;
            height: 46px;
            border: 2px solid #0284c7;
            border-radius: 50%;
            top: -10px;
            left: -10px;
            animation: pulseAnimation 2s infinite;
          "></span>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });

    const gwMarker = L.marker([gateway.lat, gateway.lng], { icon: gatewayIcon })
      .bindPopup(`
        <div style="font-family: var(--font-body); font-size: 12px; line-height: 1.4;">
          <strong style="color: #0284c7; font-size: 13px;">${gateway.name}</strong><br>
          Frequency: 868MHz LoRa Gateway • Status: ONLINE<br>
          Connected Nodes: 36 • Backhaul: 4G LTE / Fiber
        </div>
      `);
    layerGroup.addLayer(gwMarker);

    // 6. The 36 Surface Mesh Nodes
    nodes.forEach(node => {
      const isDisabled = disabledNodeIds.includes(node.id);
      const isSelected = selectedNode?.id === node.id;
      const isCritical = node.status === 'CRITICAL';
      const isWarning = node.status === 'WARNING';

      let color = '#10b981'; // Safe
      if (isDisabled) color = '#64748b';
      else if (isCritical) color = '#ef4444';
      else if (isWarning) color = '#f59e0b';

      const size = isCritical ? (isSelected ? 30 : 24) : (isSelected ? 24 : 18);

      const nodeHtml = `
        <div style="
          position: relative;
          width: ${size}px;
          height: ${size}px;
          background: ${color};
          border: 2px solid #ffffff;
          border-radius: 50%;
          box-shadow: ${isCritical ? '0 0 16px rgba(239, 68, 68, 0.95)' : '0 2px 6px rgba(0,0,0,0.4)'};
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          font-family: var(--font-mono);
          font-size: ${isCritical ? '9.5px' : '8px'};
          font-weight: 800;
          cursor: pointer;
          transition: all 0.2s;
        ">
          ${node.id.replace('N', '')}
          ${isCritical ? `
            <span style="
              position: absolute;
              width: ${size + 14}px;
              height: ${size + 14}px;
              border: 2.5px solid #ef4444;
              border-radius: 50%;
              animation: pulseAnimation 1.2s infinite;
              pointer-events: none;
            "></span>
          ` : ''}
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-node-icon',
        html: nodeHtml,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2]
      });

      const marker = L.marker([node.lat, node.lng], { icon: customIcon });

      marker.on('click', () => {
        onSelectNode(node);
      });

      marker.bindPopup(`
        <div style="font-family: var(--font-body); font-size: 12px; min-width: 190px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <strong style="font-size: 13px;">${node.name}</strong>
            <span style="
              padding: 2px 6px; 
              border-radius: 10px; 
              font-size: 10px; 
              font-weight: 700; 
              background: ${isDisabled ? '#e2e8f0' : (node.status === 'CRITICAL' ? '#fee2e2' : (node.status === 'WARNING' ? '#fef3c7' : '#dcfce7'))};
              color: ${isDisabled ? '#64748b' : (node.status === 'CRITICAL' ? '#b91c1c' : (node.status === 'WARNING' ? '#b45309' : '#15803d'))};
            ">${isDisabled ? 'OFFLINE' : node.status}</span>
          </div>
          <div style="color: #64748b; font-size: 11px; margin-bottom: 6px;">${node.tier} • ${node.tech}</div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; font-size: 11px; background: #f8fafc; padding: 6px; border-radius: 4px; margin-bottom: 6px;">
            <div>Tilt: <b>${node.tiltX}° / ${node.tiltY}°</b></div>
            <div>Crack: <b>${node.crackWidthMm} mm</b></div>
            <div>Strain: <b>${node.strainMmM} mm/m</b></div>
            <div>Vib: <b>${node.vibrationG}g</b></div>
          </div>
          <div style="font-size: 10.5px; color: #475569;">
            Battery: <b>${node.battery}%</b> | RSSI: <b>${node.rssi} dBm</b><br>
            Next Mesh Hop: <b>${node.parent}</b>
          </div>
        </div>
      `);

      layerGroup.addLayer(marker);
    });

  }, [nodes, activeMine, showMeshLinks, showHeatmap, showUndergroundPanel, selectedNode, disabledNodeIds]);

  const handleRecenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([activeMine.centerLat, activeMine.centerLng], activeMine.defaultZoom || 16);
    }
  };

  return (
    <div className="card" style={{ padding: '1rem', position: 'relative' }}>
      {/* Top Map Action Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.85rem' }}>
        <div>
          <h2 className="card-title">
            <Compass size={18} style={{ color: 'var(--brand-primary)' }} />
            Interactive Geospatial Surface Mesh GIS & Deformation Heatmap
          </h2>
          <div className="card-desc">
            Centred at {activeMine.location} ({activeMine.centerLat.toFixed(4)}°N, {activeMine.centerLng.toFixed(4)}°E) • Underground Seam Depth: {activeMine.depthH}m
          </div>
        </div>

        {/* Map Type & Layer Toggles */}
        <div className="map-controls-row">
          {/* Base Map Selector */}
          <div style={{ display: 'flex', background: 'var(--bg-tertiary)', padding: '0.2rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <button 
              className={`btn-secondary ${mapType === 'satellite' ? 'active' : ''}`}
              onClick={() => setMapType('satellite')}
              style={{ padding: '0.25rem 0.55rem', fontSize: '0.75rem', border: 'none' }}
              title="High-Resolution Satellite Imagery"
            >
              <Globe size={13} />
              <span>Satellite</span>
            </button>
            <button 
              className={`btn-secondary ${mapType === 'carto' ? 'active' : ''}`}
              onClick={() => setMapType('carto')}
              style={{ padding: '0.25rem 0.55rem', fontSize: '0.75rem', border: 'none' }}
              title="Clean Cartographic Terrain Map"
            >
              <Layers size={13} />
              <span>Terrain</span>
            </button>
            <button 
              className={`btn-secondary ${mapType === 'osm' ? 'active' : ''}`}
              onClick={() => setMapType('osm')}
              style={{ padding: '0.25rem 0.55rem', fontSize: '0.75rem', border: 'none' }}
              title="OpenStreetMap Streets & Infrastructure"
            >
              <span>Street</span>
            </button>
          </div>

          {/* Layer toggles */}
          <button 
            className={`btn-secondary ${showMeshLinks ? 'active' : ''}`}
            onClick={() => setShowMeshLinks(!showMeshLinks)}
            style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
          >
            <Radio size={13} />
            <span>Mesh: {showMeshLinks ? 'ON' : 'OFF'}</span>
          </button>

          <button 
            className={`btn-secondary ${showHeatmap ? 'active' : ''}`}
            onClick={() => setShowHeatmap(!showHeatmap)}
            style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
          >
            <Activity size={13} />
            <span>Trough: {showHeatmap ? 'ON' : 'OFF'}</span>
          </button>

          <button 
            className={`btn-secondary ${showUndergroundPanel ? 'active' : ''}`}
            onClick={() => setShowUndergroundPanel(!showUndergroundPanel)}
            style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
          >
            <MapPin size={13} />
            <span>Panel Void</span>
          </button>

          <button 
            className="btn-icon"
            onClick={handleRecenter}
            title="Recenter Map on Active Mining Panel"
            style={{ width: '32px', height: '32px' }}
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </div>

      {/* Active Critical / Warning Subsidence Alert Banner */}
      {(() => {
        const criticalNodes = nodes.filter(n => n.status === 'CRITICAL');
        const warningNodes = nodes.filter(n => n.status === 'WARNING');
        if (criticalNodes.length > 0) {
          return (
            <div style={{
              background: 'var(--color-critical-bg)',
              border: '1.5px solid var(--color-critical)',
              borderRadius: 'var(--radius-md)',
              padding: '0.65rem 1rem',
              marginBottom: '0.85rem',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.75rem',
              boxShadow: '0 0 15px rgba(239, 68, 68, 0.25)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ef4444', fontWeight: 700, fontSize: '0.85rem' }}>
                <AlertTriangle size={18} />
                <span>
                  CRITICAL SUBSIDENCE FAULT ZONE: Nodes {criticalNodes.map(n => n.id).join(', ')} Breached DGMS Safe Limits (Tilt &gt;0.8°, Crack &gt;7mm)!
                </span>
              </div>
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                {criticalNodes.slice(0, 4).map(cn => (
                  <button 
                    key={cn.id}
                    className="btn-secondary"
                    style={{ 
                      fontSize: '0.72rem', 
                      padding: '0.2rem 0.55rem', 
                      borderColor: selectedNode?.id === cn.id ? '#ef4444' : 'var(--border-color)',
                      background: selectedNode?.id === cn.id ? '#ef4444' : 'var(--bg-secondary)',
                      color: selectedNode?.id === cn.id ? '#ffffff' : '#ef4444',
                      fontWeight: 700
                    }}
                    onClick={() => onSelectNode(cn)}
                  >
                    Node {cn.id}
                  </button>
                ))}
              </div>
            </div>
          );
        } else if (warningNodes.length > 0) {
          return (
            <div style={{
              background: 'var(--color-warning-bg)',
              border: '1px solid var(--color-warning-border)',
              borderRadius: 'var(--radius-md)',
              padding: '0.55rem 1rem',
              marginBottom: '0.85rem',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.75rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#d97706', fontWeight: 700, fontSize: '0.82rem' }}>
                <AlertTriangle size={16} />
                <span>
                  SECONDARY CREEP DETECTED: Nodes {warningNodes.map(n => n.id).join(', ')} showing micro-tilt drift.
                </span>
              </div>
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                {warningNodes.slice(0, 3).map(wn => (
                  <button 
                    key={wn.id}
                    className="btn-secondary"
                    style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem' }}
                    onClick={() => onSelectNode(wn)}
                  >
                    Node {wn.id}
                  </button>
                ))}
              </div>
            </div>
          );
        }
        return null;
      })()}

      {/* Main Leaflet Map Viewport */}
      <div className="map-viewport-container">
        <div 
          ref={mapContainerRef} 
          style={{ width: '100%', height: '100%', zIndex: 1 }}
        />

        {/* Legend Toggle Button (Mobile & Quick-Access) */}
        <button 
          className="map-legend-toggle-btn"
          onClick={() => setIsLegendOpen(prev => !prev)}
          title="Toggle GIS Map Legend"
          aria-label="Toggle GIS Map Legend"
        >
          <Layers size={13} />
          <span>GIS Legend</span>
          {isLegendOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>

        {/* Floating Map Legend (Bottom-Left on Desktop, Collapsible on Mobile) */}
        <div 
          className={`map-legend-box ${!isLegendOpen ? 'mobile-hidden' : ''}`}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
            <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
              GIS Layer Legend
            </div>
            <button 
              onClick={() => setIsLegendOpen(false)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '2px',
                display: 'flex',
                alignItems: 'center'
              }}
              title="Close Legend"
              aria-label="Close Legend"
            >
              <X size={13} />
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#10b981', flexShrink: 0 }}></span>
              <span>Stable Surface Node (&lt;0.17° Tilt)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#f59e0b', flexShrink: 0 }}></span>
              <span>Warning Node (Secondary Creep)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#ef4444', flexShrink: 0 }}></span>
              <span>Critical Node (Tertiary Acceleration)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ width: '14px', height: '2px', background: '#06b6d4', flexShrink: 0 }}></span>
              <span>ESP-NOW Dense Cluster Link</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ width: '14px', height: '2px', background: '#0284c7', borderTop: '1px dashed', flexShrink: 0 }}></span>
              <span>LoRa 868MHz Regional Mesh Hop</span>
            </div>
          </div>
        </div>

        {/* Selected Node Floating Drawer (Top-Right on Desktop, Docked Bottom Sheet on Mobile) */}
        {selectedNode && (
          <div 
            className="map-node-drawer"
            style={{
              border: selectedNode.status === 'CRITICAL' ? '2px solid #ef4444' : (selectedNode.status === 'WARNING' ? '2px solid #f59e0b' : '1px solid var(--border-color)'),
              boxShadow: selectedNode.status === 'CRITICAL' ? '0 0 20px rgba(239, 68, 68, 0.4)' : 'var(--shadow-lg)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', minWidth: 0, overflow: 'hidden' }}>
                <div style={{ fontWeight: 700, fontSize: '0.88rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {selectedNode.name}
                </div>
                <span className={`badge ${selectedNode.status === 'CRITICAL' ? 'badge-critical' : (selectedNode.status === 'WARNING' ? 'badge-warning' : 'badge-safe')}`}>
                  {disabledNodeIds.includes(selectedNode.id) ? 'OFFLINE' : selectedNode.status}
                </span>
              </div>
              <button 
                onClick={() => onSelectNode(null)}
                style={{
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  padding: '3px 6px',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
                title="Dismiss Details (Clear Selection)"
                aria-label="Close"
              >
                <X size={14} />
              </button>
            </div>

            {selectedNode.status === 'CRITICAL' && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '4px', padding: '0.35rem 0.5rem', color: '#b91c1c', fontWeight: 700, fontSize: '0.72rem', marginBottom: '0.6rem' }}>
                🚨 ACTIVE GROUND SUBSIDENCE (DGMS LIMIT EXCEEDED)
              </div>
            )}
            {selectedNode.status === 'WARNING' && (
              <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '4px', padding: '0.35rem 0.5rem', color: '#b45309', fontWeight: 700, fontSize: '0.72rem', marginBottom: '0.6rem' }}>
                ⚠️ SECONDARY CREEP (MICRO-DISPLACEMENT WATCH)
              </div>
            )}

            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.6rem' }}>
              GPS: {selectedNode.lat.toFixed(5)}°N, {selectedNode.lng.toFixed(5)}°E • {selectedNode.tech}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem', fontSize: '0.75rem', marginBottom: '0.75rem' }}>
              <div style={{ background: 'var(--bg-tertiary)', padding: '0.45rem', borderRadius: '4px' }}>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.65rem' }}>TILT (PITCH/ROLL)</span>
                <strong style={{ color: selectedNode.status === 'CRITICAL' ? '#ef4444' : 'inherit' }}>
                  {selectedNode.tiltX}° / {selectedNode.tiltY}°
                </strong>
              </div>
              <div style={{ background: 'var(--bg-tertiary)', padding: '0.45rem', borderRadius: '4px' }}>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.65rem' }}>CRACK DISPLACEMENT</span>
                <strong style={{ color: selectedNode.crackWidthMm > 5 ? '#ef4444' : 'inherit' }}>
                  {selectedNode.crackWidthMm} mm
                </strong>
              </div>
              <div style={{ background: 'var(--bg-tertiary)', padding: '0.45rem', borderRadius: '4px' }}>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.65rem' }}>STRAIN (Δd)</span>
                <strong style={{ color: selectedNode.strainMmM > 3 ? '#ef4444' : 'inherit' }}>
                  {selectedNode.strainMmM} mm/m
                </strong>
              </div>
              <div style={{ background: 'var(--bg-tertiary)', padding: '0.45rem', borderRadius: '4px' }}>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.65rem' }}>MICRO-VIBRATION</span>
                <strong style={{ color: selectedNode.vibrationG > 0.3 ? '#ef4444' : 'inherit' }}>
                  {selectedNode.vibrationG}g @ {selectedNode.vibrationHz}Hz
                </strong>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: '0.7rem' }}>
              <span>Battery: <strong>{selectedNode.battery}%</strong></span>
              <span>RSSI: <strong>{selectedNode.rssi} dBm</strong></span>
              <span>Parent Hop: <strong>{selectedNode.parent}</strong></span>
            </div>

            {/* Test Node Disable / Mesh Re-route button */}
            <button 
              className="btn-secondary"
              onClick={() => onToggleNodeDisabled(selectedNode.id)}
              style={{ width: '100%', fontSize: '0.75rem', justifyContent: 'center' }}
            >
              <ZapOff size={13} />
              <span>{disabledNodeIds.includes(selectedNode.id) ? 'Restore Node Online' : 'Simulate Node Failure (Test Re-route)'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
