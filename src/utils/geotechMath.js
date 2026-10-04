
function erf(x) {
  const sign = x >= 0 ? 1 : -1;
  x = Math.abs(x);
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const t = 1.0 / (1.0 + p * x);
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
  return sign * y;
}

export function calculateKnotheProfile(x, depth = 150, thickness = 4.5, angleOfDraw = 21, subsidenceFactor = 0.72) {
  const S_max = subsidenceFactor * thickness * 1000;
  
  const betaRad = ((90 - angleOfDraw) * Math.PI) / 180;
  const R = depth / Math.tan(betaRad);

  const arg = (Math.sqrt(Math.PI) * x) / R;
  const normalizedS = 0.5 * (1 + erf(arg));
  const subsidence = S_max * normalizedS;

  const tilt = (S_max / R) * Math.exp(-Math.PI * Math.pow(x / R, 2));

  const b = 0.35;
  const strain = -2 * Math.PI * b * (S_max / Math.pow(R, 2)) * x * Math.exp(-Math.PI * Math.pow(x / R, 2));

  return {
    subsidence: Math.round(subsidence),
    tilt: +(tilt).toFixed(2),
    strain: +(strain).toFixed(2),
    S_max: Math.round(S_max),
    R: Math.round(R)
  };
}

export function estimateTimeToFailure(velocityHistory, currentTiltX = 0.04, currentStrain = 0.85) {
  if (currentTiltX < 0.20 && currentStrain < 2.0) {
    return {
      ttfHours: null,
      displayStr: 'STABLE',
      confidence: 96,
      isAccelerating: false,
      stage: 'Stage 1: Stable Elastic Strata'
    };
  }

  if (currentTiltX <= 0.57 && currentStrain <= 5.0) {
    const progress = (currentTiltX - 0.20) / (0.57 - 0.20);
    const hours = Math.max(8, Math.round(36 - progress * 24));
    return {
      ttfHours: hours,
      displayStr: `${hours}h`,
      confidence: Math.round(78 + progress * 10),
      isAccelerating: false,
      stage: 'Stage 2: Secondary Steady Creep (Warning)'
    };
  }

  const excessTilt = Math.max(0.01, currentTiltX - 0.57);
  
  let hours = 0;
  let displayStr = '';

  if (excessTilt < 0.25) {
    hours = +(8.5 - (excessTilt / 0.25) * 3.5).toFixed(1);
    displayStr = `${hours}h`;
  } else if (excessTilt < 0.90) {
    hours = +(5.0 - ((excessTilt - 0.25) / 0.65) * 3.2).toFixed(1);
    displayStr = `${hours}h`;
  } else if (excessTilt < 1.80) {
    const mins = Math.max(25, Math.round(100 - ((excessTilt - 0.90) / 0.90) * 65));
    hours = +(mins / 60).toFixed(1);
    displayStr = `${mins}m`;
  } else if (excessTilt < 2.80) {
    const mins = Math.max(8, Math.round(35 - ((excessTilt - 1.80) / 1.0) * 23));
    hours = +(mins / 60).toFixed(1);
    displayStr = `${mins}m`;
  } else {
    hours = 0.1;
    displayStr = 'IMMINENT (<5m)';
  }

  const confidence = Math.min(99, Math.round(85 + Math.min(14, excessTilt * 5)));

  return {
    ttfHours: hours,
    displayStr,
    confidence,
    isAccelerating: true,
    stage: 'Stage 3: Tertiary Accelerating Creep (CRITICAL)'
  };
}

export function discriminateVibrationSource(signal) {
  const { peakFreqHz, rmsG, permanentTiltDelta, multiNodeCoincidence } = signal;

  if (peakFreqHz > 30) {
    return {
      isGenuineSubsidence: false,
      reason: `Surface Vehicle/Machinery Noise (${peakFreqHz}Hz high-frequency band detected). Filtered out.`,
      layerFail: 1
    };
  }

  if (!multiNodeCoincidence) {
    return {
      isGenuineSubsidence: false,
      reason: 'Isolated single-node disturbance (no spatial wave correlation on adjacent mesh nodes). Filtered out.',
      layerFail: 2
    };
  }

  if (Math.abs(permanentTiltDelta) < 0.08) {
    return {
      isGenuineSubsidence: false,
      reason: 'Elastic vibration transient without permanent plastic ground tilt shift. Filtered out.',
      layerFail: 3
    };
  }

  return {
    isGenuineSubsidence: true,
    reason: `Confirmed Underground Strata Fracture: Low-freq pulse (${peakFreqHz}Hz), multi-node mesh arrival, permanent plastic tilt (${permanentTiltDelta}°).`,
    layerFail: 0
  };
}

export function calculatePowerBudget(reportingIntervalSec = 60, batteryCapacityMah = 3200) {
  const sleepCurrentMa = 0.015;
  const txCurrentMa = 110.0;
  const activeDurationSec = 0.06;

  const dutyCycle = activeDurationSec / Math.max(reportingIntervalSec, activeDurationSec);
  const avgCurrentMa = (txCurrentMa * dutyCycle) + (sleepCurrentMa * (1 - dutyCycle));

  const usableCapacityMah = batteryCapacityMah * 0.85;
  const hoursOfLife = usableCapacityMah / avgCurrentMa;
  const batteryLifeDaysZeroSolar = Math.round(hoursOfLife / 24);

  const dailySolarHarvestWh = 2.0 * 4.5 * 0.7;
  const dailyConsumptionWh = (avgCurrentMa * 3.3 * 24) / 1000;

  return {
    avgCurrentMa: +(avgCurrentMa).toFixed(3),
    batteryLifeDaysZeroSolar,
    dailySolarHarvestWh: +(dailySolarHarvestWh).toFixed(2),
    dailyConsumptionWh: +(dailyConsumptionWh).toFixed(3),
    surplusRatio: Math.round(dailySolarHarvestWh / dailyConsumptionWh)
  };
}
