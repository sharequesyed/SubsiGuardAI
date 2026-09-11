/**
 * SubsiGuard Mine Data, Mesh Network Topology & Pre-sets
 * Team MineNova6 - SIH 2026 PS 26025
 */

export const MINE_FIELDS = [
  {
    id: 'jharia-p14',
    name: 'Jharia Coalfield (BCCL) - Panel 14',
    location: 'Dhanbad, Jharkhand',
    operator: 'Bharat Coking Coal Limited (CIL)',
    seamName: 'Seam IX/X Composite',
    depthH: 160, // meters
    thicknessM: 5.2, // meters
    angleOfDraw: 21, // degrees (Barakar Sandstone)
    centerLat: 23.7485,
    centerLng: 86.4170,
    defaultZoom: 16,
    surfaceAssets: ['National Highway 19 (NH-19)', 'Kusunda Village (Pop: ~4,200)', '400kV HVDC Power Pylons'],
    extractionStatus: 'Active Depillaring with Hydraulic Stowing',
    baselineRisk: 'High (Historic Underground Fires Nearby)',
    gatewayLocation: { 
      name: 'Central Pithead LoRa Base Station',
      lat: 23.7525, 
      lng: 86.4170,
      x: 50, 
      y: 15 
    },
    panelPolygon: [
      [23.7510, 86.4130],
      [23.7515, 86.4210],
      [23.7445, 86.4215],
      [23.7440, 86.4135]
    ],
    crackLine: [
      [23.7480, 86.4140],
      [23.7478, 86.4165],
      [23.7475, 86.4190],
      [23.7472, 86.4210]
    ]
  },
  {
    id: 'raniganj-p8',
    name: 'Raniganj Coalfield (ECL) - Panel 8',
    location: 'Asansol, West Bengal',
    operator: 'Eastern Coalfields Limited (CIL)',
    seamName: 'Dishergarh Seam VII',
    depthH: 125,
    thicknessM: 3.8,
    angleOfDraw: 19,
    centerLat: 23.6850,
    centerLng: 86.9720,
    defaultZoom: 16,
    surfaceAssets: ['Asansol-Barakar Bypass Corridor', 'Agricultural Farmland (Paddy)', 'Canal Water Channel'],
    extractionStatus: 'Continuous Miner Depillaring',
    baselineRisk: 'Moderate (Surface Crack Initiation)',
    gatewayLocation: { 
      name: 'Substation Edge Mesh Gateway',
      lat: 23.6890, 
      lng: 86.9720,
      x: 50, 
      y: 15 
    },
    panelPolygon: [
      [23.6875, 86.9680],
      [23.6880, 86.9760],
      [23.6815, 86.9765],
      [23.6810, 86.9685]
    ],
    crackLine: [
      [23.6850, 86.9690],
      [23.6848, 86.9720],
      [23.6845, 86.9750]
    ]
  },
  {
    id: 'korba-west',
    name: 'SECL Korba Basin - West Extraction Panel',
    location: 'Korba, Chhattisgarh',
    operator: 'South Eastern Coalfields Limited (CIL)',
    seamName: 'Gevra Deep Underground Seam',
    depthH: 210,
    thicknessM: 6.5,
    angleOfDraw: 24,
    centerLat: 22.3610,
    centerLng: 82.7520,
    defaultZoom: 16,
    surfaceAssets: ['Heavy Coal Haul Road Corridor', 'Railway Siding Track #4', 'Industrial Water Mains'],
    extractionStatus: 'Longwall Caving Method',
    baselineRisk: 'High Ground Strain Potential',
    gatewayLocation: { 
      name: 'Mine Rescue Room Tower Gateway',
      lat: 22.3650, 
      lng: 82.7520,
      x: 50, 
      y: 15 
    },
    panelPolygon: [
      [22.3635, 82.7480],
      [22.3640, 82.7560],
      [22.3575, 82.7565],
      [22.3570, 82.7485]
    ],
    crackLine: [
      [22.3605, 82.7490],
      [22.3602, 82.7520],
      [22.3600, 82.7550]
    ]
  }
];

/**
 * Generate 36 Surface Mesh Nodes with both relative XY and real Lat/Lng coordinates
 */
export function generateInitialNodes(mine = MINE_FIELDS[0]) {
  const nodes = [];
  const cLat = mine.centerLat;
  const cLng = mine.centerLng;

  // Tier 1: Nodes N01 to N12 - Dense Cluster over Highway & Critical Crack Zone (ESP-NOW Mesh)
  const tier1Configs = [
    { id: 'N01', dLat: 0.0008, dLng: -0.0028, x: 28, y: 48, label: 'NH-19 North Shoulder' },
    { id: 'N02', dLat: 0.0006, dLng: -0.0020, x: 34, y: 46, label: 'NH-19 Culvert Bridge' },
    { id: 'N03', dLat: 0.0004, dLng: -0.0012, x: 40, y: 47, label: 'Highway Milepost 241' },
    { id: 'N04', dLat: 0.0001, dLng: -0.0005, x: 46, y: 49, label: 'Active Crack Perimeter #1' },
    { id: 'N05', dLat: -0.0001, dLng: 0.0002, x: 52, y: 50, label: 'Active Crack Perimeter #2' },
    { id: 'N06', dLat: 0.0003, dLng: 0.0010, x: 58, y: 48, label: 'Village Approach Road' },
    { id: 'N07', dLat: 0.0006, dLng: 0.0018, x: 64, y: 46, label: 'Kusunda School Perimeter' },
    { id: 'N08', dLat: 0.0003, dLng: 0.0026, x: 70, y: 48, label: 'Village Water Tank' },
    { id: 'N09', dLat: -0.0007, dLng: -0.0015, x: 38, y: 56, label: 'Tensile Zone Left Flank' },
    { id: 'N10', dLat: -0.0009, dLng: -0.0004, x: 46, y: 57, label: 'Trough Centerline Alpha' },
    { id: 'N11', dLat: -0.0008, dLng: 0.0006, x: 54, y: 56, label: 'Trough Centerline Beta' },
    { id: 'N12', dLat: -0.0006, dLng: 0.0016, x: 62, y: 55, label: 'Tensile Zone Right Flank' }
  ];

  tier1Configs.forEach((item, idx) => {
    nodes.push({
      id: item.id,
      name: `Node ${item.id} (${item.label})`,
      tier: 'Tier 1 (Dense Cluster)',
      tech: 'ESP-NOW + LoRa Relay',
      lat: +(cLat + item.dLat).toFixed(6),
      lng: +(cLng + item.dLng).toFixed(6),
      x: item.x,
      y: item.y,
      parent: idx < 6 ? 'N18' : 'N19',
      rssi: -62 - Math.floor(Math.random() * 12),
      battery: 92 - Math.floor(Math.random() * 8),
      tiltX: +(Math.random() * 0.12 - 0.06).toFixed(2),
      tiltY: +(Math.random() * 0.10 - 0.05).toFixed(2),
      crackWidthMm: +(0.4 + Math.random() * 0.5).toFixed(2),
      strainMmM: +(0.8 + Math.random() * 0.6).toFixed(2),
      vibrationG: +(0.02 + Math.random() * 0.03).toFixed(3),
      vibrationHz: Math.floor(6 + Math.random() * 6),
      status: 'SAFE',
      isGateway: false
    });
  });

  // Tier 2: Nodes N13 to N30 - Coarse Regional Grid over Mining Panel (LoRa Mesh)
  const tier2Configs = [
    { id: 'N13', dLat: 0.0022, dLng: -0.0035, x: 18, y: 32 },
    { id: 'N14', dLat: 0.0024, dLng: -0.0022, x: 28, y: 30 },
    { id: 'N15', dLat: 0.0026, dLng: -0.0010, x: 38, y: 28 },
    { id: 'N16', dLat: 0.0028, dLng: 0.0001, x: 48, y: 26 },
    { id: 'N17', dLat: 0.0026, dLng: 0.0012, x: 58, y: 28 },
    { id: 'N18', dLat: 0.0024, dLng: 0.0024, x: 68, y: 30 },
    { id: 'N19', dLat: 0.0022, dLng: 0.0036, x: 78, y: 32 },
    { id: 'N20', dLat: -0.0018, dLng: -0.0034, x: 20, y: 64 },
    { id: 'N21', dLat: -0.0020, dLng: -0.0021, x: 30, y: 66 },
    { id: 'N22', dLat: -0.0022, dLng: -0.0008, x: 42, y: 68 },
    { id: 'N23', dLat: -0.0024, dLng: 0.0002, x: 50, y: 70 },
    { id: 'N24', dLat: -0.0022, dLng: 0.0013, x: 58, y: 68 },
    { id: 'N25', dLat: -0.0020, dLng: 0.0025, x: 70, y: 66 },
    { id: 'N26', dLat: -0.0018, dLng: 0.0037, x: 80, y: 64 },
    { id: 'N27', dLat: -0.0032, dLng: -0.0022, x: 28, y: 78 },
    { id: 'N28', dLat: -0.0036, dLng: -0.0007, x: 42, y: 82 },
    { id: 'N29', dLat: -0.0036, dLng: 0.0012, x: 58, y: 82 },
    { id: 'N30', dLat: -0.0032, dLng: 0.0026, x: 72, y: 78 }
  ];

  tier2Configs.forEach((item) => {
    nodes.push({
      id: item.id,
      name: `Node ${item.id} (Regional Panel Grid)`,
      tier: 'Tier 2 (Regional Grid)',
      tech: 'LoRa 868MHz Mesh',
      lat: +(cLat + item.dLat).toFixed(6),
      lng: +(cLng + item.dLng).toFixed(6),
      x: item.x,
      y: item.y,
      parent: item.dLat > 0.0015 ? 'GATEWAY' : (item.dLng < 0 ? 'N15' : 'N17'),
      rssi: -74 - Math.floor(Math.random() * 15),
      battery: 88 - Math.floor(Math.random() * 12),
      tiltX: +(Math.random() * 0.08 - 0.04).toFixed(2),
      tiltY: +(Math.random() * 0.08 - 0.04).toFixed(2),
      crackWidthMm: +(0.1 + Math.random() * 0.2).toFixed(2),
      strainMmM: +(0.4 + Math.random() * 0.4).toFixed(2),
      vibrationG: +(0.015 + Math.random() * 0.02).toFixed(3),
      vibrationHz: Math.floor(5 + Math.random() * 8),
      status: 'SAFE',
      isGateway: false
    });
  });

  // Tier 3: Nodes N31 to N36 - Stable Bedrock Reference Nodes outside Angle of Draw
  const tier3Configs = [
    { id: 'N31', dLat: 0.0042, dLng: -0.0045, x: 10, y: 18, label: 'West Stable Bedrock Reference' },
    { id: 'N32', dLat: 0.0042, dLng: 0.0045, x: 90, y: 18, label: 'East Stable Bedrock Reference' },
    { id: 'N33', dLat: 0.0001, dLng: -0.0050, x: 8, y: 50, label: 'North-West Baseline Zero' },
    { id: 'N34', dLat: 0.0001, dLng: 0.0050, x: 92, y: 50, label: 'North-East Baseline Zero' },
    { id: 'N35', dLat: -0.0048, dLng: -0.0042, x: 12, y: 88, label: 'South-West Far Field' },
    { id: 'N36', dLat: -0.0048, dLng: 0.0042, x: 88, y: 88, label: 'South-East Far Field' }
  ];

  tier3Configs.forEach((item) => {
    nodes.push({
      id: item.id,
      name: `Node ${item.id} (${item.label})`,
      tier: 'Tier 3 (Zero Reference)',
      tech: 'LoRa Reference Base',
      lat: +(cLat + item.dLat).toFixed(6),
      lng: +(cLng + item.dLng).toFixed(6),
      x: item.x,
      y: item.y,
      parent: 'GATEWAY',
      rssi: -68 - Math.floor(Math.random() * 8),
      battery: 98 - Math.floor(Math.random() * 4),
      tiltX: 0.01,
      tiltY: 0.01,
      crackWidthMm: 0.02,
      strainMmM: 0.05,
      vibrationG: 0.01,
      vibrationHz: 4,
      status: 'SAFE',
      isGateway: false
    });
  });

  return nodes;
}

export const BOM_DATA = [
  { item: 'ESP32-WROOM-32 Microcontroller', role: 'Dual-core MCU, ultra-low power deep sleep (15µA), hardware interrupts', unitCostInr: 340, qty: 1 },
  { item: 'SX1276 LoRa 868MHz Transceiver Module', role: 'Sub-GHz wireless mesh communication (3-5 km line-of-sight range)', unitCostInr: 420, qty: 1 },
  { item: 'MPU6050 6-Axis Accelerometer & Inclinometer', role: 'Ground tilt measurement (0.01° precision) + micro-seismic motion', unitCostInr: 120, qty: 1 },
  { item: 'VL53L1X ToF Laser / Draw-Wire Extensometer', role: 'Micro-crack initiation and inter-node strain displacement gauge', unitCostInr: 310, qty: 1 },
  { item: 'SW-420 High-Sensitivity Vibration Sensor', role: 'Always-on analog vibration comparator for instant interrupt wakeup', unitCostInr: 45, qty: 1 },
  { item: '3.2V 3200mAh LiFePO4 Battery Cell', role: 'Non-combustible, 2000+ cycle life, operates up to 60°C coalfield heat', unitCostInr: 260, qty: 1 },
  { item: '5V 2W Monocrystalline Solar Panel + TP5000', role: 'Solar energy harvester and integrated LiFePO4 charge controller', unitCostInr: 180, qty: 1 },
  { item: 'IP67 Polycarbonate Enclosure + Gore-Tex Vent', role: 'Waterproof, dustproof against PM10 coal dust, pressure equalizing', unitCostInr: 110, qty: 1 },
  { item: '1-Meter Galvanized Ground Anchor Rod & Mount', role: 'Rigid mechanical bedrock coupling (prevents topsoil wind false drift)', unitCostInr: 65, qty: 1 }
];

export const TOTAL_NODE_BOM_INR = BOM_DATA.reduce((acc, curr) => acc + (curr.unitCostInr * curr.qty), 0);
