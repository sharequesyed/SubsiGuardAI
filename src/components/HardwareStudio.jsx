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
              <span>Hybrid Energy Architecture</span>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              Rechargeable 3.2V LiFePO4 cell buffer paired with 2W solar harvester and auxiliary DC terminal. ULP deep-sleep duty cycling keeps average current draw under <strong>~1 mA</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* BOM Table & Power Architecture Grid */}
      <div className="grid-2col">
        {/* BOM Table */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">
                <DollarSign size={16} />
                Hackathon Benchmarking BOM (COTS Hardware)
              </h3>
              <div className="card-desc">Off-the-shelf component breakdown for rapid functional validation</div>
            </div>
            <span className="badge badge-safe">PROTOTYPE: ₹{TOTAL_NODE_BOM_INR}</span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '0.4rem 0.5rem' }}>Component</th>
                  <th style={{ padding: '0.4rem 0.5rem' }}>Benchmarking Role</th>
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

        {/* Adaptive Duty-Cycle Power Management */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">
                <Sun size={16} />
                Adaptive Duty-Cycle Power Management
              </h3>
              <div className="card-desc">Dynamic transmission duty-cycling based on strata deformation state</div>
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
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>ESTIMATED AVERAGE DRAW</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--brand-primary)' }}>
                  {powerBudget.avgCurrentMa} mA
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                  ULP Sleep (15 µA) + 120ms TX Burst
                </div>
              </div>

              <div style={{ background: 'var(--bg-tertiary)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>OPERATIONAL TOPOLOGY</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#10b981' }}>
                  Hybrid Powered
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                  Solar + LiFePO4 Buffer + DC In
                </div>
              </div>
            </div>

            <div style={{ background: 'var(--bg-primary)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              <strong>Adaptive Power States:</strong>
              <ul style={{ paddingLeft: '1.1rem', marginTop: '0.3rem', lineHeight: '1.4' }}>
                <li><strong>Baseline Mode (&lt;0.17° Tilt):</strong> 60–120s transmit interval (conserve power).</li>
                <li><strong>Event-Triggered Wakeup:</strong> Instant hardware interrupt on vibration / tilt burst.</li>
                <li><strong>Emergency Mode (&gt;0.57° Tilt):</strong> Continuous 1 Hz burst streaming for evacuation.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* NEW: Prototype Reliability & Industrial Deployment Roadmap */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">
              <Shield size={16} />
              COTS Prototype Reliability vs. Industrial Field Deployment Roadmap
            </h3>
            <div className="card-desc">
              How SubsiGuard mitigates prototype sensor drift and scales to certified mining hardware
            </div>
          </div>
          <span className="badge badge-safe">ENGINEERING ROADMAP</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
          {/* Mitigation 1: Algorithmic Denoising */}
          <div style={{ background: 'var(--bg-tertiary)', padding: '0.85rem', borderRadius: 'var(--radius-md)', borderTop: '3px solid var(--brand-primary)' }}>
            <strong style={{ fontSize: '0.82rem', color: 'var(--brand-primary)', display: 'block', marginBottom: '0.3rem' }}>
              1. Software Tare & Kalman Calibration
            </strong>
            <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
              Consumer MEMS (MPU6050) have offset drift over temperature. Our firmware runs an exponential moving-average filter and temperature calibration curve, taring the initial deployment angle to establish a stable differential datum (Δθ).
            </p>
          </div>

          {/* Mitigation 2: Multi-Node Spatial Coincidence */}
          <div style={{ background: 'var(--bg-tertiary)', padding: '0.85rem', borderRadius: 'var(--radius-md)', borderTop: '3px solid #10b981' }}>
            <strong style={{ fontSize: '0.82rem', color: '#10b981', display: 'block', marginBottom: '0.3rem' }}>
              2. Mesh Spatial Coincidence
            </strong>
            <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
              Single-sensor glitches are mathematically filtered. Genuine underground strata flexion creates a continuous depression basin (Knothe trough). An alert requires co-located corroboration across 2+ neighboring mesh nodes.
            </p>
          </div>

          {/* Mitigation 3: Dual-Frequency FFT Filter */}
          <div style={{ background: 'var(--bg-tertiary)', padding: '0.85rem', borderRadius: 'var(--radius-md)', borderTop: '3px solid #f59e0b' }}>
            <strong style={{ fontSize: '0.82rem', color: '#f59e0b', display: 'block', marginBottom: '0.3rem' }}>
              3. Frequency Discrimination
            </strong>
            <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
              Surface vehicular vibrations (dumpers, trucks) peak at 40–120 Hz, whereas deep strata tensile fracture produces low-frequency micro-seismic shock waves (1–15 Hz), preventing false alarms.
            </p>
          </div>
        </div>

        {/* Industrial Grade Upgrade Roadmap Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-muted)', background: 'var(--bg-tertiary)' }}>
                <th style={{ padding: '0.5rem 0.65rem' }}>Subsystem</th>
                <th style={{ padding: '0.5rem 0.65rem' }}>Hackathon Benchmarking PoC</th>
                <th style={{ padding: '0.5rem 0.65rem' }}>Commercial / DGMS Industrial Target</th>
                <th style={{ padding: '0.5rem 0.65rem' }}>Industrial Advantage</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: '0.5rem 0.65rem', fontWeight: 600 }}>Inclinometer (Tilt)</td>
                <td style={{ padding: '0.5rem 0.65rem', color: 'var(--text-secondary)' }}>MPU-6050 (0.01° resolution, I2C)</td>
                <td style={{ padding: '0.5rem 0.65rem', fontWeight: 600, color: 'var(--brand-primary)' }}>Murata SCA103T / ST IIS3DWB</td>
                <td style={{ padding: '0.5rem 0.65rem', color: 'var(--text-secondary)' }}>0.001° resolution, ultra-low temp drift (&lt;0.002°/°C)</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: '0.5rem 0.65rem', fontWeight: 600 }}>Microcontroller</td>
                <td style={{ padding: '0.5rem 0.65rem', color: 'var(--text-secondary)' }}>ESP32-WROOM-32 (Commercial 0°–70°C)</td>
                <td style={{ padding: '0.5rem 0.65rem', fontWeight: 600, color: 'var(--brand-primary)' }}>ESP32-S3-WROOM-1U / STM32L4</td>
                <td style={{ padding: '0.5rem 0.65rem', color: 'var(--text-secondary)' }}>Industrial operating range (-40°C to +85°C), hardware crypto</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: '0.5rem 0.65rem', fontWeight: 600 }}>Enclosure & Sealing</td>
                <td style={{ padding: '0.5rem 0.65rem', color: 'var(--text-secondary)' }}>IP67 Polycarbonate + Cable Glands</td>
                <td style={{ padding: '0.5rem 0.65rem', fontWeight: 600, color: 'var(--brand-primary)' }}>IP68 Die-cast Aluminum + Conformal Coating</td>
                <td style={{ padding: '0.5rem 0.65rem', color: 'var(--text-secondary)' }}>ATEX / IECEx intrinsically safe certified for coal mines</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: '0.5rem 0.65rem', fontWeight: 600 }}>Wireless RF Link</td>
                <td style={{ padding: '0.5rem 0.65rem', color: 'var(--text-secondary)' }}>SX1276 868MHz PCB Header</td>
                <td style={{ padding: '0.5rem 0.65rem', fontWeight: 600, color: 'var(--brand-primary)' }}>Semtech SX1262 LoRaWAN Industrial Node</td>
                <td style={{ padding: '0.5rem 0.65rem', color: 'var(--text-secondary)' }}>+22 dBm high TX power, integrated TCXO crystal oscillator</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
