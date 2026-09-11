# SubsiGuard Wokwi Simulation Guide
### Team MineNova6 • SIH 2026 Problem Statement 26025

This folder contains the complete simulation setup for testing and presenting the SubsiGuard IoT architecture using Wokwi.

---

### Step 1: Open Wokwi
Go to [wokwi.com/projects/new/esp32](https://wokwi.com/projects/new/esp32)

### Step 2: Paste the Code & Circuit
1. In the **sketch.ino** tab, replace the code with the contents of `sketch.ino`.
2. In the **diagram.json** tab, replace the contents with `diagram.json`.
3. In the **Library Manager** tab (or `libraries.txt`), add:
   - `PubSubClient`
   - `Adafruit MPU6050`
   - `Adafruit Unified Sensor`

### Step 3: Run the Simulation
1. Click the green **Start Simulation** button in Wokwi.
2. In the SubsiGuard web dashboard, switch the top mode to **Wokwi IoT Cloud**.
3. Turn the potentiometer knob in Wokwi (Crack Extensometer) or tilt the MPU-6050:
   - The SubsiGuard Speedometer Gauge swings to Red!
   - Node N05 displays Critical Alert!
   - Time-to-Failure (TTF) predicts ground collapse!
