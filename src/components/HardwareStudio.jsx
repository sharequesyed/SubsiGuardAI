import React, { useState } from 'react';
import { 
  Cpu, 
  BatteryCharging, 
  Radio, 
  Gauge, 
  Sun, 
  Shield, 
  Layers, 
  DollarSign, 
  Sliders, 
  Zap, 
  CheckCircle2 
} from 'lucide-react';
import { BOM_DATA, TOTAL_NODE_BOM_INR } from '../data/mineData';
import { calculatePowerBudget } from '../utils/geotechMath';

export function HardwareStudio() {
  const [reportingInterval, setReportingInterval] = useState(60); // 60 seconds
  const powerBudget = calculatePowerBudget(reportingInterval);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Top Banner */}
      <div className="innovation-banner">
        <div className="innovation-banner-text">
          <h4>
            <Cpu size={18} />
            SubsiGuard Smart Mesh Node • Hardware Architecture & Indian Market BOM
          </h4>
          <p>
            Designed for harsh Indian coalfield climates (45°C heat, heavy monsoons, PM10 coal dust). Built with readily accessible components to keep unit costs under <strong>~₹1,850 ($22 USD)</strong>.
          </p>
        </div>
        <span className="badge badge-safe">BOM: ₹{TOTAL_NODE_BOM_INR} / NODE</span>
      </div>

      {/* Interactive Hardware Block Diagram */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">
              <Layers size={16} />
              Modular Smart Sensor Node Schematic
            </h3>
            <div className="card-desc">Low-power hardware architecture & sensor interfaces</div>
          </div>
          <span className="badge badge-safe">IP67 SEALED</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
          {/* Microcontroller */}
          <div style={{ background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--brand-primary)', fontWeight: 700 }}>
              <Cpu size={18} />
              <span>ESP32-WROOM-32 (Core MCU)</span>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              Dual-core 240MHz MCU with ultra-low power ULP co-processor. Deep sleep current: <strong>15 µA</strong>. Dedicated hardware interrupts for vibration detection.
            </p>
          </div>

          {/* LoRa Transceiver */}
          <div style={{ background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--color-mesh)', fontWeight: 700 }}>
              <Radio size={18} />
              <span>SX1276 LoRa 868MHz</span>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              Sub-GHz frequency band penetrates vegetation, coal dust, and undulations. Long-range link up to <strong>3–5 km</strong> line-of-sight.
            </p>
          </div>

          {/* Sensors Group */}
          <div style={{ background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: '#10b981', fontWeight: 700 }}>
              <Gauge size={18} />
              <span>MPU6050 + SW-420 + ToF</span>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              6-axis tilt inclinometer (0.01° resolution), analog vibration comparator for instant wake-up, and laser ToF/draw-wire for micro-crack displacement.
            </p>
          </div>

          {/* Power System */}
          <div style={{ background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: '#f59e0b', fontWeight: 700 }}>
              <BatteryCharging size={18} />
              <span>LiFePO4 + 2W Solar Harvester</span>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              3.2V 3200mAh Lithium Iron Phosphate cell. Safe against 60°C thermal runaway. <strong>35+ days battery autonomy</strong> with zero sunlight.
            </p>
          </div>
        </div>
      </div>

      {/* BOM Table & Power Budget Calculator Grid */}
      <div className="grid-2col">
        {/* BOM Table */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">
                <DollarSign size={16} />
                Itemized Bill of Materials (BOM)
              </h3>
              <div className="card-desc">Indian vendor quotation breakdown per smart node</div>
            </div>
            <span className="badge badge-safe">TOTAL: ₹{TOTAL_NODE_BOM_INR}</span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '0.4rem 0.5rem' }}>Component</th>
                  <th style={{ padding: '0.4rem 0.5rem' }}>Specification / Role</th>
                  <th style={{ padding: '0.4rem 0.5rem', textAlign: 'right' }}>Cost (INR)</th>
                </tr>
              </thead>
              <tbody>
                {BOM_DATA.map((row, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '0.45rem 0.5rem', fontWeight: 600 }}>{row.item}</td>
                    <td style={{ padding: '0.45rem 0.5rem', color: 'var(--text-secondary)', fontSize: '0.72rem' }}>{row.role}</td>
                    <td style={{ padding: '0.45rem 0.5rem', textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>₹{row.unitCostInr}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Power Budget & Autonomy Calculator */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">
                <Sun size={16} />
                Solar & Battery Autonomy Calculator
              </h3>
              <div className="card-desc">Calculates continuous runtime during prolonged monsoon cloudiness</div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.3rem' }}>
                <span>Telemetry Transmit Interval:</span>
                <strong>{reportingInterval} Seconds</strong>
              </div>
              <input 
                type="range" 
                min="10" 
                max="300" 
                step="10" 
                value={reportingInterval} 
                onChange={(e) => setReportingInterval(+e.target.value)}
                style={{ width: '100%', cursor: 'pointer' }}
              />
            </div>

            <div className="grid-2col" style={{ gap: '0.75rem' }}>
              <div style={{ background: 'var(--bg-tertiary)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>AVERAGE CURRENT DRAW</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--brand-primary)' }}>
                  {powerBudget.avgCurrentMa} mA
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                  Duty-cycled sleep mode
                </div>
              </div>

              <div style={{ background: 'var(--bg-tertiary)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>ZERO-SUNLIGHT AUTONOMY</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#10b981' }}>
                  {powerBudget.batteryLifeDaysZeroSolar} Days
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                  Survives weeks of overcast monsoons
                </div>
              </div>
            </div>

            <div style={{ background: 'var(--bg-primary)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              <strong>Daily Solar Energy Balance:</strong>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.3rem' }}>
                <span>Daily 2W Solar Harvest: <strong>{powerBudget.dailySolarHarvestWh} Wh</strong></span>
                <span>Daily Consumption: <strong>{powerBudget.dailyConsumptionWh} Wh</strong></span>
              </div>
              <div style={{ color: '#10b981', fontWeight: 600, marginTop: '0.3rem' }}>
                ✓ Energy Surplus Ratio: {powerBudget.surplusRatio}x overconsumption (100% self-sustaining)
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
