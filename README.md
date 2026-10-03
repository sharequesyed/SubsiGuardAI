# SubsiGuard: AI/IoT-Powered Ground Subsidence Monitoring & Early Warning System

[![Smart India Hackathon 2026](https://img.shields.io/badge/SIH-2026-blue.svg)](https://sih.gov.in/)
[![Problem Statement](https://img.shields.io/badge/Problem%20Statement-SIH26025-orange.svg)](https://sih.gov.in/)
[![Ministry](https://img.shields.io/badge/Ministry-Ministry%20of%20Coal-green.svg)](https://coal.nic.in/)
[![Organization](https://img.shields.io/badge/Organization-Coal%20India%20Limited-darkgreen.svg)](https://www.coalindia.in/)
[![Team](https://img.shields.io/badge/Team-DIEMS__MineNova6-purple.svg)]()
[![Team ID](https://img.shields.io/badge/Team%20ID-150683-blueviolet.svg)]()
[![Node BOM](https://img.shields.io/badge/Node%20BOM-~₹2%2C100-brightgreen.svg)]()
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **SubsiGuard** is an industrial-grade, AI/IoT-powered real-time ground subsidence early warning and prediction system specifically engineered for Indian underground coal mining operations (bord-and-pillar panels, depillaring zones, and deep longwall faces). 
> Developed for **Smart India Hackathon 2026** under **Problem Statement ID: SIH26025** (Ministry of Coal / Coal India Limited).

---

## Executive Summary

Underground coal mining causes progressive void collapses (goaf settlement) that propagate upward through rock strata, causing catastrophic surface subsidence bowls, railway/highway shearing, and building structural failures across coalfields like **Jharia (BCCL)** and **Raniganj (ECL)**.

Traditional monitoring relies on **intermittent total-station surveys** or **satellite InSAR passes (12-day revisit latency)**, completely missing acute acceleration phases preceding collapses. SubsiGuard solves this with an autonomous, solar-powered **surface wireless sensor mesh** paired with **edge-computed inverse-velocity prediction** and an **autonomous hardware fail-safe**.

| Feature | Conventional InSAR / Manual Surveys | SubsiGuard AI/IoT System |
| :--- | :--- | :--- |
| **Sampling Frequency** | Intermittent (Every 6–12 days or monthly) | **Continuous Real-Time (1 Hz edge stream)** |
| **Failure Prediction** | Historical retrospective reporting | **Saito Inverse-Velocity ($1/v \to 0$) TTF Countdown** |
| **False Alarm Rejection** | None (Raw noisy measurements) | **3-Stage DSP (15–50 Hz dumper tremor band-stop)** |
| **Offline Reliability** | Dependent on cloud and external uplink | **72h Local SPI Flash + Direct Siren Relay (<100ms)** |
| **Node Deployment Cost** | > ₹1,50,000 (Commercial GNSS/Inclinometers) | **< ₹2,100 per node (BOM optimized)** |
| **Network Redundancy** | Single point of cellular failure | **865–868 MHz LoRa Multi-Hop Mesh (WPC compliant)** |

---

## System Architecture

```
                           [ COAL MINING SUBSIDENCE BOWL ]
                                         │
        ┌────────────────────────────────┼────────────────────────────────┐
        ▼                                ▼                                ▼
  [ SENSOR NODE 01 ]               [ SENSOR NODE 02 ]               [ SENSOR NODE 03 ]
  • MPU-6050 Dual Inclinometer    • MPU-6050 Dual Inclinometer    • MPU-6050 Dual Inclinometer
  • Linear Crack Extensometer     • Linear Crack Extensometer     • Linear Crack Extensometer
  • SW-420 Seismic Transducer     • SW-420 Seismic Transducer     • SW-420 Seismic Transducer
  • ESP32 240MHz + DSP Filter     • ESP32 240MHz + DSP Filter     • ESP32 240MHz + DSP Filter
  • SX1276 LoRa Transceiver       • SX1276 LoRa Transceiver       • SX1276 LoRa Transceiver
        │                                │                                │
        └───────────────► 865–868 MHz LoRa Mesh Network ◄─────────────────┘
                                         │
                                         ▼
                            [ LOCAL PITHEAD GATEWAY ]
        ┌────────────────────────────────┼────────────────────────────────┐
        ▼                                                                 ▼
[ EDGE PREDICTIVE ENGINE ]                                    [ INDEPENDENT FAIL-SAFE PATH ]
• Saito / Fukuzono Inverse-Velocity ($1/v$)                   • Hardwired 110dB Pithead Siren Relay
• Knothe Empirical Basin Cross-Section                        • Triggered directly if threshold breached
• 3-Layer Spatial Verification ($\ge 2$ Nodes)                • Zero internet dependency (<100ms latency)
        │
        ▼
[ DISPATCH & DASHBOARD ]
• Web Serial Live USB Hardware Bridge (115200 baud)
• Real-Time GIS Heatmap & Geological Strata Flexure
• Geo-Fenced SMS & WhatsApp Worker Evacuation Dispatch
```

---

## Core Innovations & Engineering Highlights

### 1. Saito & Fukuzono Inverse-Velocity TTF Engine
SubsiGuard implements geomechanical rock-fracture physics based on **Saito's creep rupture law** and **Fukuzono's inverse-velocity method**:
$$\lim_{t \to t_f} \frac{1}{v(t)} = \lim_{t \to t_f} \left(\frac{ds}{dt}\right)^{-1} = 0$$
- In tertiary accelerating creep, ground velocity $v$ surges asymptotically.
- By tracking the linear descent of $1/v$ against time, the system computes the exact **Time-to-Failure ($t_f$)** countdown hours before catastrophic cave-in, enabling scheduled mine evacuations.

### 2. 3-Layer Intelligent False Alarm Discrimination
To prevent costly false evacuations caused by surface mining equipment:
- **Layer 1 (Frequency Discrimination)**: Software DSP band-stop filter rejects high-frequency surface tremors caused by **100-ton haul dumpers (15–50 Hz)** and blasting echoes, isolating true low-frequency deep strata rock fracturing (**0.5–10 Hz**).
- **Layer 2 (Kinematic Velocity Derivative)**: Validates continuous displacement rate acceleration ($d^2s/dt^2 > 0$) rather than transient physical impacts.
- **Layer 3 (Spatial Cross-Correlation)**: Evacuation alarms require spatial confirmation across at least **two adjacent mesh nodes** within the subsidence trough.

### 3. Dual-Path Hardware Fail-Safe
- **Edge Analytics Path**: Full statistical and predictive telemetry streamed to the Web GIS dashboard.
- **Direct Hardware Interlock**: An independent hardware GPIO relay triggers a pithead warning horn within **<100ms** if raw tilt exceeds $0.57^\circ$ or crack width exceeds $5.0\text{ mm}$, guaranteeing life safety even during catastrophic telecom failure.

### 4. Live Physical Prototype Integration via Web Serial
- Plug-and-play hardware demonstration firmware included in [`ESP32/subsiguard_demo/`](./ESP32/subsiguard_demo/).
- Connect any ESP32/ESP8266 board via USB to the web dashboard: telemetry syncs live in exact mathematical lockstep with the physical board's OLED display, status LEDs, and alarm buzzer.

---

## Bill of Materials (BOM) — Student Prototype

SubsiGuard is engineered for rapid, cost-effective scaling across remote Indian coalfields under **~ ₹2,100 per node** (as detailed in Slide 4 of the official SIH presentation):

| Component | Model / Specification | Purpose | Indian Sourcing Cost |
| :--- | :--- | :--- | :---: |
| **ESP32 Dev Module** | ESP32-WROOM-32 | Dual-core MCU, edge DSP sampling & deep sleep | ₹450 |
| **Tilt Sensor** | MPU6050 (IMU) | High-resolution surface tilt measurement ($\pm 0.01^\circ$) | ₹180 |
| **Vibration Sensor** | SW-420 | Always-on analog vibration comparator for instant interrupt | ₹70 |
| **Displacement Sensor** | String Potentiometer / Ultrasonic (HC-SR04) | Micro-crack & inter-node strain displacement gauge | ₹250 |
| **Crack Sensor** | Strain Gauge Module | Continuous fissure opening detection | ₹200 |
| **LoRa Module** | SX1276 (865–868 MHz) | Sub-GHz long-range wireless multi-hop mesh (3–5 km) | ₹350 |
| **GPS Module (Optional)** | Neo-6M | Satellite positioning for initial spatial coordinates | ₹200 |
| **Power Management** | TP4056 + Lithium Battery | Charge controller & 72h zero-sunlight energy buffer | ₹250 |
| **Solar Panel (5W) + Enclosure** | 5W Solar + Weatherproof Enclosure | Continuous solar harvesting + rugged dust/rain protection | ₹200 |
| **TOTAL (APPROX.)** | | | **~ ₹2,100 per node** |

---

## Project Directory Structure

```
├── ESP32/
│   └── subsiguard_demo/
│       └── subsiguard_demo.ino        # Prototype demonstration firmware (OLED, Buzzer, LEDs)
├── Presentstion/
│   ├── SubsiGuard_SIH_Redesigned.pdf  # Official SIH 2026 Presentation (Final Redesigned Deck)
│   └── Icons/                         # High-resolution presentation diagram assets
├── scripts/
│   ├── generate_presentation.py       # Automated PPTX slide generator
│   └── generate_pitch_docx.py         # Pitch script and Q&A document generator
├── src/
│   ├── components/
│   │   ├── OverviewDashboard.jsx      # Live telemetry metrics & GIS node summary
│   │   ├── GISMeshMap.jsx             # Interactive mine field map with subsidence contours
│   │   ├── LiveTelemetrySimulator.jsx # Real-time sensor stream charts & waveform visualizer
│   │   ├── AIPredictiveCenter.jsx     # Saito inverse-velocity calculation & failure countdown
│   │   ├── HardwareStudio.jsx         # Sensor node pinout, CAD specs & BOM calculator
│   │   ├── AlertDispatcher.jsx        # Siren relay trigger & geo-fenced SMS alert panel
│   │   ├── UsbLiveGatewayBar.jsx      # Web Serial live hardware connect & sync bar
│   │   └── Interactive3DRigSimulator.jsx # 2.5D strata flexure & 3D circuit rig
│   ├── services/
│   │   ├── usbGateway.js              # Web Serial API driver & prototype synchronization
│   │   ├── offlineStorage.js          # IndexedDB 72-hour offline telemetry cache
│   │   ├── soundEffects.js            # Synthesized Web Audio siren and alert beeps
│   │   └── notificationService.js     # Desktop emergency notification service
│   ├── utils/
│   │   └── geotechMath.js             # Knothe subsidence profile & Saito TTF estimation
│   ├── App.jsx                        # Main state container & mode coordinator
│   ├── index.css                      # Industrial design system & high-contrast tokens
│   └── main.jsx                       # React 18 application root
├── package.json                       # Frontend dependencies & scripts
├── vite.config.js                     # Vite build configuration
└── README.md                          # Repository documentation
```

---

## Getting Started Locally

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- Modern Chromium browser (Google Chrome, Microsoft Edge, Brave) for Web Serial hardware access

### Installation & Run

```bash
# 1. Clone repository
git clone https://github.com/sharequesyed/SubsiGuardAI.git
cd SubsiGuardAI

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev
```

Navigate to `http://localhost:5173` in your browser.

### Building for Production
```bash
npm run build
```
The compiled, minified bundle will be generated in `dist/`.

---

## Flashing the Hardware Prototype

To test live hardware synchronization:
1. Open [`ESP32/subsiguard_demo/subsiguard_demo.ino`](./ESP32/subsiguard_demo/subsiguard_demo.ino) in the Arduino IDE.
2. Select your target board (`ESP8266 Boards -> NodeMCU 1.0` or `ESP32 Dev Module`).
3. Connect your board via USB and click **Upload**.
4. In the SubsiGuard web dashboard, select **Live USB Gateway** mode and click **Connect USB Device**.
5. Telemetry, alert levels, and audible alarms will lock into synchronized real-time execution with the physical board.

---

## Hackathon Submission Artifacts

All formal submission assets are organized inside this repository:
- **Official Presentation**: [`Presentstion/SubsiGuard_SIH_Redesigned.pdf`](./Presentstion/SubsiGuard_SIH_Redesigned.pdf)
- **Firmware Sketch**: [`ESP32/subsiguard_demo/subsiguard_demo.ino`](./ESP32/subsiguard_demo/subsiguard_demo.ino)
- **License**: [`LICENSE`](./LICENSE) (MIT License)

---

## Team DIEMS_MineNova6

- **Team ID**: 150683
- **Team Name**: DIEMS_MineNova6
- **College**: Deogiri Institute of Engineering and Management Studies, Aurangabad
- **Problem Statement ID**: SIH26025
- **Ministry**: Ministry of Coal / Coal India Limited
- **Category**: Hardware / Software Integrated Solution
- **License**: MIT

### Team Members
| Member Name | Role |
| :--- | :--- |
| **Syed Shareque Yaseen** | Team Leader |
| **Monika Suri** | Team Member |
| **Atharva Thete** | Team Member |
| **Aditya Ubale** | Team Member |
| **Syed Farhan Hashmi** | Team Member |
| **Mohammad Affan Sabir** | Team Member |
