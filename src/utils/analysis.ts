// Simulated AI analysis for deepfake audio detection
export interface AnalysisResult {
  isDeepfake: boolean;
  confidence: number;
  uncertainty: number;
  probabilities: { real: number; deepfake: number; manipulated: number };
  features: AcousticFeatures;
  explanation: string[];
  modelVersion: string;
  timestamp: string;
  audioDuration: number;
  sampleRate: number;
}

export interface AcousticFeatures {
  spectralCentroid: number;
  spectralRolloff: number;
  zeroCrossingRate: number;
  mfccEnergy: number;
  pitchVariability: number;
  formantStability: number;
  harmonicRatio: number;
  temporalModulation: number;
  spectralFlatness: number;
  chromaFeatures: number;
}

export interface ScanRecord {
  id: string;
  filename: string;
  timestamp: string;
  result: AnalysisResult;
  duration: number;
}

// Generate realistic acoustic features
function generateFeatures(isDeepfake: boolean): AcousticFeatures {
  if (isDeepfake) {
    return {
      spectralCentroid: 2800 + Math.random() * 400,
      spectralRolloff: 5200 + Math.random() * 300,
      zeroCrossingRate: 0.04 + Math.random() * 0.02,
      mfccEnergy: -15 + Math.random() * 5,
      pitchVariability: 0.12 + Math.random() * 0.08,
      formantStability: 0.85 + Math.random() * 0.1,
      harmonicRatio: 0.72 + Math.random() * 0.1,
      temporalModulation: 0.35 + Math.random() * 0.15,
      spectralFlatness: 0.08 + Math.random() * 0.06,
      chromaFeatures: 0.6 + Math.random() * 0.15,
    };
  }
  return {
    spectralCentroid: 2200 + Math.random() * 600,
    spectralRolloff: 4800 + Math.random() * 800,
    zeroCrossingRate: 0.02 + Math.random() * 0.03,
    mfccEnergy: -20 + Math.random() * 8,
    pitchVariability: 0.25 + Math.random() * 0.2,
    formantStability: 0.65 + Math.random() * 0.15,
    harmonicRatio: 0.85 + Math.random() * 0.1,
    temporalModulation: 0.55 + Math.random() * 0.2,
    spectralFlatness: 0.03 + Math.random() * 0.04,
    chromaFeatures: 0.75 + Math.random() * 0.15,
  };
}

// Generate explanation based on features
function generateExplanation(features: AcousticFeatures, isDeepfake: boolean): string[] {
  const explanations: string[] = [];
  
  if (isDeepfake) {
    if (features.pitchVariability < 0.18) {
      explanations.push('⚠️ Unnatural pitch consistency detected — human speech typically shows more micro-variations in fundamental frequency');
    }
    if (features.formantStability > 0.9) {
      explanations.push('⚠️ Formant transitions are unusually stable — suggests synthetic vocal tract modeling');
    }
    if (features.temporalModulation < 0.45) {
      explanations.push('⚠️ Reduced temporal modulation energy — indicates missing natural breath patterns and micro-pauses');
    }
    if (features.spectralFlatness > 0.1) {
      explanations.push('⚠️ Elevated spectral flatness — characteristic of vocoder-based synthesis artifacts');
    }
    if (features.harmonicRatio < 0.78) {
      explanations.push('⚠️ Lower harmonic-to-noise ratio — suggests phase discontinuities from neural vocoder output');
    }
    explanations.push('🔬 Spectral analysis reveals periodic artifacts consistent with neural audio codec reconstruction');
  } else {
    if (features.pitchVariability > 0.3) {
      explanations.push('✅ Natural pitch variability detected — consistent with organic vocal cord vibration patterns');
    }
    if (features.formantStability < 0.8) {
      explanations.push('✅ Formant transitions show natural coarticulation effects — typical of human speech production');
    }
    if (features.temporalModulation > 0.5) {
      explanations.push('✅ Normal temporal modulation profile — includes natural breathing patterns and prosodic variation');
    }
    if (features.spectralFlatness < 0.06) {
      explanations.push('✅ Low spectral flatness — indicates clean harmonic structure from natural voice source');
    }
    if (features.harmonicRatio > 0.85) {
      explanations.push('✅ High harmonic-to-noise ratio — consistent with clean glottal excitation');
    }
    explanations.push('🔬 No synthetic artifacts detected in spectral domain — audio appears to be from natural recording');
  }
  
  return explanations;
}

// Main analysis function with simulated delay
export async function analyzeAudio(
  audioBuffer: AudioBuffer | null,
  filename: string,
  forceResult?: 'real' | 'fake'
): Promise<AnalysisResult> {
  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 1500));

  // Determine if deepfake (use force result or random with slight real bias)
  let isDeepfake: boolean;
  if (forceResult) {
    isDeepfake = forceResult === 'fake';
  } else if (filename.toLowerCase().includes('fake') || filename.toLowerCase().includes('deepfake')) {
    isDeepfake = true;
  } else if (filename.toLowerCase().includes('real') || filename.toLowerCase().includes('genuine')) {
    isDeepfake = false;
  } else {
    isDeepfake = Math.random() > 0.45;
  }

  const confidence = isDeepfake 
    ? 0.78 + Math.random() * 0.18 
    : 0.75 + Math.random() * 0.2;

  const features = generateFeatures(isDeepfake);
  const explanation = generateExplanation(features, isDeepfake);

  const result: AnalysisResult = {
    isDeepfake,
    confidence,
    uncertainty: 1 - confidence,
    probabilities: isDeepfake 
      ? { real: 0.05 + Math.random() * 0.1, deepfake: confidence * 0.85, manipulated: confidence * 0.15 + Math.random() * 0.05 }
      : { real: confidence * 0.9, deepfake: 0.03 + Math.random() * 0.07, manipulated: 0.02 + Math.random() * 0.05 },
    features,
    explanation,
    modelVersion: 'VoxNet-v3.2.1-Ensemble',
    timestamp: new Date().toISOString(),
    audioDuration: audioBuffer ? audioBuffer.duration : 3 + Math.random() * 7,
    sampleRate: audioBuffer ? audioBuffer.sampleRate : 44100,
  };

  return result;
}

// Get scan history from localStorage
export function getScanHistory(): ScanRecord[] {
  try {
    const data = localStorage.getItem('voxforensics_history');
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

// Save scan to history
export function saveScanToHistory(filename: string, result: AnalysisResult, duration: number): ScanRecord {
  const record: ScanRecord = {
    id: Date.now().toString(36) + Math.random().toString(36).substr(2),
    filename,
    timestamp: new Date().toISOString(),
    result,
    duration,
  };
  
  const history = getScanHistory();
  history.unshift(record);
  if (history.length > 50) history.pop();
  localStorage.setItem('voxforensics_history', JSON.stringify(history));
  
  return record;
}

// Clear history
export function clearHistory(): void {
  localStorage.removeItem('voxforensics_history');
}
