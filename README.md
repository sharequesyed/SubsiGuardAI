# SubsiGuard: AI/IoT-Powered Ground Subsidence Monitoring & Early Warning System

[![Smart India Hackathon 2026](https://img.shields.io/badge/SIH-2026-blue.svg)](https://sih.gov.in/)
[![Problem Statement](https://img.shields.io/badge/Problem%20Statement-SIH26025-orange.svg)](https://sih.gov.in/)
[![Ministry](https://img.shields.io/badge/Ministry-Ministry%20of%20Coal-green.svg)](https://coal.nic.in/)
[![Team](https://img.shields.io/badge/Team-MineNova6-purple.svg)]()
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **SubsiGuard** is an AI/IoT-powered real-time mine subsidence early warning and prediction system designed for Indian underground coal mining operations (bord-and-pillar & depillaring panels). Built for **Smart India Hackathon 2026** (Problem Statement ID: **SIH26025**).

---

## Key Highlights

- **Dual-Path Architecture**: High-accuracy hybrid analytics on the gateway (Random Forest risk classification + Saito inverse-velocity trend forecasting) backed by an **independent hardware threshold fail-safe** on the ESP32 that sounds local sirens even without internet or gateway connectivity.
- **2.5D Geotechnical Strata Simulator**: Interactive visual flexure cross-section modeling 180m Barakar sandstone strata flexure, goaf void collapse, and tensile surface fissures calibrated with Knothe's empirical theory.
- **Interactive 3D Circuit Rig**: Wokwi-compatible interactive 3D breadboard module with live artificial horizon MPU-6050 tilt, rotary linear crack extensometer, and 3-layer DSP bandstop filter suppressing 15–50 Hz dumper vibrations.
- **Resilient LoRa Mesh**: Custom multi-hop 865–868 MHz P2P mesh network compliant with Indian WPC / DoT de-licensed Short Range Device regulations.
- **Ultra Low-Cost Hardware**: Estimated student prototype BOM under **₹2,100 per node** with solar-assisted battery power.

---

## System Architecture

```
[ Surface Sensor Nodes ]
  ├── MPU-6050 Dual-Axis Tilt (±0.05° precision)
  ├── Linear Potentiometer Crack Extensometer (0.01mm resolution)
  └── ESP32 Dual-Core (100 Hz DSP sampling + 15-50 Hz dumper tremor filter)
        │
        ▼ (865–868 MHz LoRa Multi-Hop Mesh)
[ Local Mine Gateway ]
  ├── Feature Ingestion & 72h Offline SPI Flash Buffer
  ├── Random Forest Risk Classifier (Normal / Warning / Critical)
  ├── Saito Inverse-Velocity Model (1/v → 0 failure countdown)
  └── Knothe Empirical Strata Basin Profiling
        │
        ├── [Independent Hardware Path] ──► 110dB Pithead Siren Relay (<100ms)
        └── [Connected Dispatch]        ──► Geo-Fenced SMS & Web GIS Dashboard
```

---

## Project Structure

```
├── public/                     # Static assets and icons
├── src/
│   ├── components/
│   │   ├── Interactive3DRigSimulator.jsx  # 2.5D strata flexure, 3D mesh & Wokwi circuit rig
│   │   ├── OverviewDashboard.jsx          # Live sensor telemetry & GIS map
│   │   └── ...
│   ├── App.jsx                 # Main layout & simulation mode state
│   ├── main.jsx                # Application root entry
│   └── index.css               # Design system & styling tokens
├── wokwi/                      # Physical prototype simulation
│   ├── diagram.json            # Circuit schematic (ESP32, MPU6050, Pot, LED, Button)
│   ├── sketch.ino              # C++ FreeRTOS edge firmware
│   └── libraries.txt           # Native firmware dependencies
├── scripts/                    # Automation and PPT generation scripts
│   ├── generate_presentation.py # Official SIH 2026 PPTX generator (20"x11.25")
│   └── generate_pitch_docx.py   # Word (.docx) pitch script generator
├── SubsiGuard_SIH2026_Official_Presentation.pptx # Official SIH 2026 6-Slide Presentation
├── SubsiGuard_Pitch_Script_MineNova6.docx        # Word document pitch guide & Q&A
├── vite.config.js              # Vite bundler configuration
└── package.json                # Project dependencies and build scripts
```

---

## Getting Started Locally

### Prerequisites
- Node.js 18+ and npm
- Python 3.10+ (for presentation and script utilities)

### Installation
```bash
# Clone the repository
git clone https://github.com/sharequesyed/SubsiGuardAI.git

# Navigate into the project directory
cd SubsiGuardAI

# Install frontend dependencies
npm install

# Run the local development server
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### Building for Production
```bash
npm run build
```

---

## Hackathon Pitch Deck & Scripts
- **Presentation**: `SubsiGuard_SIH2026_Official_Presentation.pptx` (Formatted to official SIH 2026 guidelines, 20" × 11.25" widescreen).
- **Pitch Delivery Guide**: `SubsiGuard_Pitch_Script_MineNova6.docx` (Word-for-word 5-minute presentation script and judge Q&A defense).

---

## Team MineNova6
- **Problem Statement**: SIH26025
- **Organization**: Ministry of Coal / Coal India Limited
- **Category**: Hardware / Software Integrated Solution
