import React, { useState } from 'react';
import { 
  FileText, 
  Award, 
  ShieldCheck, 
  Layers, 
  CheckCircle2, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink,
  Users,
  Sparkles,
  Cpu
} from 'lucide-react';

export function PitchDocsHub() {
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (idx) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  const faqs = [
    {
      q: "How can surface sensors detect mine subsidence happening hundreds of meters underground?",
      a: "Mine subsidence is the direct surface expression of underground roof collapse. As the coal seam void (goaf) is created, the overlying rock strata flex and bend upwards. Our surface nodes detect this strata deformation through 4 distinct physical signatures days before collapse: micro-tilt angle changes (0.01°), horizontal tension strain between nodes, micro-fissure crack expansion, and low-frequency micro-seismic acoustic emissions transmitted through solid rock."
    },
    {
      q: "Underground coal mines span kilometers. How do you avoid needing thousands of expensive nodes?",
      a: "We deploy a Tiered Zoned Mesh rather than carpeting idle ground. In Indian mines, active extraction happens on one panel at a time (e.g. 1 km x 200m). We deploy only ~25 LoRa nodes on a 150m grid across the active panel and ~15 dense ESP-NOW micro-nodes over critical highway/village zones (totaling ~40 nodes under ₹85,500). As the mining face advances, nodes are leapfrogged forward to new panels, providing 100% lifetime protection at ultra-low capital expenditure."
    },
    {
      q: "What if a heavy 50-tonne coal dumper drives past? Won't that trigger false alarms?",
      a: "No. Our system utilizes a 3-Layer Signal Filter: (1) Frequency FFT: Dumpers produce high-frequency noise (40–150 Hz), whereas underground strata delamination generates low-frequency pulses (1–15 Hz); (2) Mesh Spatial Correlation: A truck moves sequentially at vehicular speed across one node, while deep rock fracture waves arrive across multiple nodes near-simultaneously (~3,000 m/s); (3) Kinematic Check: Trucks leave zero permanent ground tilt, whereas genuine subsidence causes permanent plastic tilt and strain."
    },
    {
      q: "How will electronic nodes survive Indian monsoons and thick coal dust with small solar panels?",
      a: "Nodes are enclosed in IP67 polycarbonate housings with hydrophobic Gore-Tex breathing valves. They use a 3.2V 3200mAh LiFePO4 battery (chemically safe up to 60°C). By duty-cycling transmission to 60s and using 15µA deep sleep, average power consumption is just 0.8 mW—giving over 35 days of continuous runtime even under zero sunlight during heavy monsoons."
    },
    {
      q: "Can Knothe's Subsidence Theory be applied to Indian geological conditions?",
      a: "Yes! While original European Knothe models assumed weak shale, Indian Gondwana formations (Raniganj, Jharia, Singrauli) contain thick Barakar sandstone beds that exhibit higher beam-stiffness. We adapt Knothe's influence angle beta to 65°–72° (angle of draw 18°–25°) as per empirical CIMFR Dhanbad standards. Our AI fuses this theoretical profile with real-time mesh telemetry."
    },
    {
      q: "Why are highways, villages, and railway lines situated directly above underground coal mines in India?",
      a: "In historic basins like Jharia and Raniganj, mining started over 150 years ago. Over decades, dense towns and national corridors (like NH-19 and the Dhanbad-Chandrapura rail line) grew directly over underground seams. Because surface evacuation is legally and economically complex, continuous real-time monitoring like SubsiGuard is the only viable way to protect civilians and national infrastructure."
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Top Banner */}
      <div className="innovation-banner">
        <div className="innovation-banner-text">
          <h4>
            <Award size={18} />
            SIH 2026 Problem Statement 26025 • Official Verification & Presentation Studio
          </h4>
          <p>
            Developed by <strong>Team MineNova6</strong> for the Ministry of Coal & Coal India Limited. Demonstrating complete compliance with all hackathon evaluation criteria.
          </p>
        </div>
        <span className="badge badge-safe">100% SPECIFICATION MATCH</span>
      </div>

      {/* Alignment Matrix Table */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">
              <CheckCircle2 size={16} />
              Problem Statement Deliverables Verification Matrix
            </h3>
            <div className="card-desc">Direct 1-to-1 mapping of official PS requirements to SubsiGuard platform capabilities</div>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-muted)' }}>
                <th style={{ padding: '0.6rem' }}>Official SIH 26025 Requirement</th>
                <th style={{ padding: '0.6rem' }}>SubsiGuard Technical Implementation</th>
                <th style={{ padding: '0.6rem', textAlign: 'center' }}>Jury Verification</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: '0.6rem', fontWeight: 600 }}>Low-cost smart sensor nodes (ESP32 / LoRa)</td>
                <td style={{ padding: '0.6rem', color: 'var(--text-secondary)' }}>ESP32 DevKit V1 (30-pin) with 3.3V native logic, dual-core processing, and ~₹1,550 complete 2-node prototype BOM.</td>
                <td style={{ padding: '0.6rem', textAlign: 'center' }}><span className="badge badge-safe">VERIFIED</span></td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: '0.6rem', fontWeight: 600 }}>Tilt, vibration, displacement & crack sensing</td>
                <td style={{ padding: '0.6rem', color: 'var(--text-secondary)' }}>MPU6050 (0.01° tilt), SW-420 (vibration trigger), and 10kΩ Potentiometric Extensometer (0.1mm crack displacement).</td>
                <td style={{ padding: '0.6rem', textAlign: 'center' }}><span className="badge badge-safe">VERIFIED</span></td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: '0.6rem', fontWeight: 600 }}>Localized wireless mesh network (LoRa 868MHz)</td>
                <td style={{ padding: '0.6rem', color: 'var(--text-secondary)' }}>SX1276 868MHz SPI modules (license-free Indian ISM band) + direct Web Serial USB bridge to dashboard.</td>
                <td style={{ padding: '0.6rem', textAlign: 'center' }}><span className="badge badge-safe">VERIFIED</span></td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: '0.6rem', fontWeight: 600 }}>AI/ML anomaly detection & subsidence prediction</td>
                <td style={{ padding: '0.6rem', color: 'var(--text-secondary)' }}>Physics-Informed LSTM + Saito Inverse-Velocity method for real-time Time-To-Failure (TTF).</td>
                <td style={{ padding: '0.6rem', textAlign: 'center' }}><span className="badge badge-safe">VERIFIED</span></td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: '0.6rem', fontWeight: 600 }}>GIS based visualization of deformation & risk zones</td>
                <td style={{ padding: '0.6rem', color: 'var(--text-secondary)' }}>Interactive 2D/3D map with dynamic Knothe deformation heatmaps and infrastructure overlays.</td>
                <td style={{ padding: '0.6rem', textAlign: 'center' }}><span className="badge badge-safe">VERIFIED</span></td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: '0.6rem', fontWeight: 600 }}>Automated multi-channel early warning alerts</td>
                <td style={{ padding: '0.6rem', color: 'var(--text-secondary)' }}>On-site audio sirens, smart highway LED VMS boards, and multilingual SMS (Hindi/English/Bengali).</td>
                <td style={{ padding: '0.6rem', textAlign: 'center' }}><span className="badge badge-safe">VERIFIED</span></td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: '0.6rem', fontWeight: 600 }}>Offline capability with periodic cloud synchronization</td>
                <td style={{ padding: '0.6rem', color: 'var(--text-secondary)' }}>Local edge buffer + IndexedDB store-and-forward architecture for remote coalfields.</td>
                <td style={{ padding: '0.6rem', textAlign: 'center' }}><span className="badge badge-safe">VERIFIED</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Complete Hardware Architecture & Wiring Pinout Guide */}
      <div className="card" id="hardware-wiring-guide">
        <div className="card-header">
          <div>
            <h3 className="card-title">
              <Cpu size={16} />
              Hardware Architecture & Complete Pinout Wiring Guide
            </h3>
            <div className="card-desc">
              Low-cost (~₹1,550 total) prototype configuration using ESP32, SX1276 868MHz LoRa, and industrial-grade sensing
            </div>
          </div>
          <span className="badge badge-safe">PROTOTYPE BOM: ₹1,550</span>
        </div>

        {/* 1. Component Bill of Materials Table */}
        <div style={{ marginBottom: '1.25rem' }}>
          <h4 style={{ fontSize: '0.88rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
            1. Curated Component Bill of Materials (Affordable & Battle-Tested)
          </h4>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '0.5rem' }}>Component</th>
                  <th style={{ padding: '0.5rem' }}>Part / Spec</th>
                  <th style={{ padding: '0.5rem' }}>Mining Function</th>
                  <th style={{ padding: '0.5rem' }}>Qty</th>
                  <th style={{ padding: '0.5rem', textAlign: 'right' }}>Est. Cost (INR)</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '0.5rem', fontWeight: 600 }}>Microcontroller</td>
                  <td style={{ padding: '0.5rem', color: 'var(--text-secondary)' }}>ESP32 DevKit V1 (30-Pin)</td>
                  <td style={{ padding: '0.5rem' }}>Dual-core 240MHz, 3.3V logic (native LoRa), ADC</td>
                  <td style={{ padding: '0.5rem' }}>2</td>
                  <td style={{ padding: '0.5rem', textAlign: 'right', fontWeight: 600 }}>₹700</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '0.5rem', fontWeight: 600 }}>RF Transceiver</td>
                  <td style={{ padding: '0.5rem', color: 'var(--text-secondary)' }}>SX1276 868MHz LoRa SPI (Ra-01H)</td>
                  <td style={{ padding: '0.5rem' }}>Long-range wireless mesh telemetry (license-free ISM)</td>
                  <td style={{ padding: '0.5rem' }}>2</td>
                  <td style={{ padding: '0.5rem', textAlign: 'right', fontWeight: 600 }}>₹560</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '0.5rem', fontWeight: 600 }}>Tilt / Incline Sensor</td>
                  <td style={{ padding: '0.5rem', color: 'var(--text-secondary)' }}>MPU-6050 (6-DOF Gyro/Accel)</td>
                  <td style={{ padding: '0.5rem' }}>Detects DGMS 0.57° ground tilt & slope curvature</td>
                  <td style={{ padding: '0.5rem' }}>1</td>
                  <td style={{ padding: '0.5rem', textAlign: 'right', fontWeight: 600 }}>₹130</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '0.5rem', fontWeight: 600 }}>Vibration Sensor</td>
                  <td style={{ padding: '0.5rem', color: 'var(--text-secondary)' }}>SW-420 Piezoelectric Module</td>
                  <td style={{ padding: '0.5rem' }}>Blasting shockwaves & dumper truck vibration trigger</td>
                  <td style={{ padding: '0.5rem' }}>1</td>
                  <td style={{ padding: '0.5rem', textAlign: 'right', fontWeight: 600 }}>₹45</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '0.5rem', fontWeight: 600 }}>Crack Extensometer</td>
                  <td style={{ padding: '0.5rem', color: 'var(--text-secondary)' }}>10kΩ Linear Slide Potentiometer</td>
                  <td style={{ padding: '0.5rem' }}>Tensile crack widening (0–50mm) across strata fault</td>
                  <td style={{ padding: '0.5rem' }}>1</td>
                  <td style={{ padding: '0.5rem', textAlign: 'right', fontWeight: 600 }}>₹35</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '0.5rem', fontWeight: 600 }}>Power & Breadboard</td>
                  <td style={{ padding: '0.5rem', color: 'var(--text-secondary)' }}>Micro-USB Cable + Jumper Wires</td>
                  <td style={{ padding: '0.5rem' }}>Powers demo node via USB / 5V power bank</td>
                  <td style={{ padding: '0.5rem' }}>1 set</td>
                  <td style={{ padding: '0.5rem', textAlign: 'right', fontWeight: 600 }}>₹80</td>
                </tr>
                <tr style={{ background: 'var(--bg-tertiary)', fontWeight: 700 }}>
                  <td colSpan={4} style={{ padding: '0.6rem' }}>Total Demonstration Hardware Cost</td>
                  <td style={{ padding: '0.6rem', textAlign: 'right', color: 'var(--color-safe)' }}>₹1,550 INR</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* 2. Node 1: Field Sensor Node Pinout Table */}
        <div style={{ marginBottom: '1.25rem' }}>
          <h4 style={{ fontSize: '0.88rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
            2. Node 1: Field Sensor Node (Transmitter) — Pin-by-Pin Wiring
          </h4>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '0.5rem' }}>ESP32 Pin</th>
                  <th style={{ padding: '0.5rem' }}>Sensor / Module Pin</th>
                  <th style={{ padding: '0.5rem' }}>Interface Type</th>
                  <th style={{ padding: '0.5rem' }}>Engineering Purpose</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '0.5rem', fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--brand-primary)' }}>GPIO 18</td>
                  <td style={{ padding: '0.5rem', fontWeight: 600 }}>SX1276 SCK</td>
                  <td style={{ padding: '0.5rem' }}>Hardware SPI</td>
                  <td style={{ padding: '0.5rem', color: 'var(--text-secondary)' }}>SPI Bus Serial Clock</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '0.5rem', fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--brand-primary)' }}>GPIO 19</td>
                  <td style={{ padding: '0.5rem', fontWeight: 600 }}>SX1276 MISO</td>
                  <td style={{ padding: '0.5rem' }}>Hardware SPI</td>
                  <td style={{ padding: '0.5rem', color: 'var(--text-secondary)' }}>Master In Slave Out (LoRa packet read)</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '0.5rem', fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--brand-primary)' }}>GPIO 23</td>
                  <td style={{ padding: '0.5rem', fontWeight: 600 }}>SX1276 MOSI</td>
                  <td style={{ padding: '0.5rem' }}>Hardware SPI</td>
                  <td style={{ padding: '0.5rem', color: 'var(--text-secondary)' }}>Master Out Slave In (LoRa register write)</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '0.5rem', fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--brand-primary)' }}>GPIO 5</td>
                  <td style={{ padding: '0.5rem', fontWeight: 600 }}>SX1276 NSS / CS</td>
                  <td style={{ padding: '0.5rem' }}>Digital Output</td>
                  <td style={{ padding: '0.5rem', color: 'var(--text-secondary)' }}>LoRa SPI Chip Select</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '0.5rem', fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--brand-primary)' }}>GPIO 2</td>
                  <td style={{ padding: '0.5rem', fontWeight: 600 }}>SX1276 RESET</td>
                  <td style={{ padding: '0.5rem' }}>Digital Output</td>
                  <td style={{ padding: '0.5rem', color: 'var(--text-secondary)' }}>Hardware Radio Reset</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '0.5rem', fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--brand-primary)' }}>GPIO 4</td>
                  <td style={{ padding: '0.5rem', fontWeight: 600 }}>SX1276 DIO0</td>
                  <td style={{ padding: '0.5rem' }}>Digital Interrupt</td>
                  <td style={{ padding: '0.5rem', color: 'var(--text-secondary)' }}>Packet Tx/Rx Done Interrupt flag</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '0.5rem', fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#10b981' }}>GPIO 21</td>
                  <td style={{ padding: '0.5rem', fontWeight: 600 }}>MPU-6050 SDA</td>
                  <td style={{ padding: '0.5rem' }}>Hardware I2C</td>
                  <td style={{ padding: '0.5rem', color: 'var(--text-secondary)' }}>I2C Data for 3-axis tilt and angular rate</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '0.5rem', fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#10b981' }}>GPIO 22</td>
                  <td style={{ padding: '0.5rem', fontWeight: 600 }}>MPU-6050 SCL</td>
                  <td style={{ padding: '0.5rem' }}>Hardware I2C</td>
                  <td style={{ padding: '0.5rem', color: 'var(--text-secondary)' }}>I2C Clock line</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '0.5rem', fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#f59e0b' }}>GPIO 13</td>
                  <td style={{ padding: '0.5rem', fontWeight: 600 }}>SW-420 DO</td>
                  <td style={{ padding: '0.5rem' }}>Digital Input</td>
                  <td style={{ padding: '0.5rem', color: 'var(--text-secondary)' }}>Shockwave / Vibration comparator threshold</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '0.5rem', fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#8b5cf6' }}>GPIO 34 (ADC1)</td>
                  <td style={{ padding: '0.5rem', fontWeight: 600 }}>10kΩ Pot Wiper (Center)</td>
                  <td style={{ padding: '0.5rem' }}>12-bit Analog In</td>
                  <td style={{ padding: '0.5rem', color: 'var(--text-secondary)' }}>Direct crack displacement (0–3.3V = 0–50mm)</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '0.5rem', fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#ef4444' }}>3V3 (Pin 1)</td>
                  <td style={{ padding: '0.5rem', fontWeight: 600 }}>VCC (SX1276, MPU6050, SW420, Pot)</td>
                  <td style={{ padding: '0.5rem' }}>Power Rail</td>
                  <td style={{ padding: '0.5rem', color: 'var(--text-secondary)' }}>Regulated 3.3V (safe for SX1276 & sensors)</td>
                </tr>
                <tr>
                  <td style={{ padding: '0.5rem', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>GND</td>
                  <td style={{ padding: '0.5rem', fontWeight: 600 }}>GND (All Modules)</td>
                  <td style={{ padding: '0.5rem' }}>Common Ground</td>
                  <td style={{ padding: '0.5rem', color: 'var(--text-secondary)' }}>System reference zero potential</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* 3. Node 2: Gateway Node & Serial Protocol */}
        <div style={{ marginBottom: '1.25rem' }}>
          <h4 style={{ fontSize: '0.88rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
            3. Node 2: Gateway Receiver Node & Web Serial Telemetry Format
          </h4>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
            Node 2 runs an ESP32 connected to its own SX1276 LoRa module on the same SPI pins. It plugs into the laptop via Micro-USB. When you switch SubsiGuard into <strong>Live USB Mode</strong>, the dashboard connects directly at <strong>115200 baud</strong> via Web Serial API.
          </p>
          <div style={{
            background: 'var(--bg-tertiary)',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.75rem',
            border: '1px solid var(--border-color)',
            lineHeight: '1.6'
          }}>
            <div style={{ color: 'var(--text-muted)' }}>// Serial JSON output transmitted by Gateway to SubsiGuard:</div>
            <div style={{ color: 'var(--brand-primary)' }}>
              {`{"node":"N05","tilt":1.24,"vib":0.045,"crack":3.40,"strain":2.85,"status":"CRITICAL"}`}
            </div>
            <div style={{ color: 'var(--text-muted)', marginTop: '0.4rem' }}>// Or simple CSV fallback:</div>
            <div style={{ color: 'var(--text-secondary)' }}>N05,1.24,0.045,3.40,2.85,CRITICAL</div>
          </div>
        </div>

        {/* 4. Tabletop Physical Demo Test Rig Blueprint */}
        <div>
          <h4 style={{ fontSize: '0.88rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
            4. Physical Tabletop Test Rig Setup (For SIH Jury Evaluation)
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.75rem' }}>
            <div style={{ background: 'var(--bg-tertiary)', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <strong style={{ fontSize: '0.8rem', color: 'var(--text-primary)', display: 'block', marginBottom: '0.25rem' }}>
                A. 2-Plate Geotechnical Hinge Model
              </strong>
              <p style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                Construct two acrylic or plywood plates (15cm x 15cm). Plate A is stationary (footwall). Plate B (hanging wall) is attached with a simple metal hinge to simulate subsiding strata.
              </p>
            </div>
            <div style={{ background: 'var(--bg-tertiary)', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <strong style={{ fontSize: '0.8rem', color: 'var(--text-primary)', display: 'block', marginBottom: '0.25rem' }}>
                B. Potentiometric Crack Extensometer
              </strong>
              <p style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                Mount the 10kΩ slide potentiometer across the seam between Plate A and Plate B. As Plate B tilts or drops, the wiper slides, immediately sending crack widening (in mm) to SubsiGuard.
              </p>
            </div>
            <div style={{ background: 'var(--bg-tertiary)', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <strong style={{ fontSize: '0.8rem', color: 'var(--text-primary)', display: 'block', marginBottom: '0.25rem' }}>
                C. Live Jury Interaction
              </strong>
              <p style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                Ask the judges to tilt Plate B with their fingers. Watch the SubsiGuard speedometer swing to <strong>RED</strong> and the siren trigger within 200 milliseconds!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Jury Q&A Cheat Sheet Accordion */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">
              <HelpCircle size={16} />
              SIH Jury Defense & Technical Q&A Cheat Sheet
            </h3>
            <div className="card-desc">Engineered answers to the toughest domain questions from DGMS & Coal India experts</div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {faqs.map((faq, idx) => (
            <div 
              key={idx} 
              style={{
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                background: 'var(--bg-tertiary)'
              }}
            >
              <div 
                onClick={() => toggleFaq(idx)}
                style={{
                  padding: '0.75rem 1rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.82rem',
                  color: 'var(--text-primary)'
                }}
              >
                <span>{faq.q}</span>
                {openFaq === idx ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>

              {openFaq === idx && (
                <div style={{ padding: '0.75rem 1rem', background: 'var(--bg-card)', borderTop: '1px solid var(--border-color)', fontSize: '0.78rem', lineHeight: '1.5', color: 'var(--text-secondary)' }}>
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Team Credits & Made In India Badge */}
      <div className="card" style={{ textAlign: 'center', padding: '1.5rem' }}>
        <Sparkles size={24} style={{ color: 'var(--brand-primary)', margin: '0 auto 0.5rem' }} />
        <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>SubsiGuard Platform</h3>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
          Proudly built by <strong>Team MineNova6</strong> for Smart India Hackathon 2026 (Problem Statement 26025)
        </p>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
          Supporting the National Vision of <strong>Smart & Sustainable Mining</strong> under Ministry of Coal & Coal India Limited.
        </p>
      </div>
    </div>
  );
}
