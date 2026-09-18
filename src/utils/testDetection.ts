// Comprehensive test suite for voice detection accuracy
import { analyzeAudio } from './analysis';

interface TestCase {
  name: string;
  description: string;
  features: {
    pitchVariability: number;
    formantStability: number;
    spectralFlatness: number;
    harmonicRatio: number;
    temporalModulation: number;
    zeroCrossingRate: number;
    spectralCentroid: number;
  };
  expected: 'real' | 'fake';
  reason: string;
}

const testCases: TestCase[] = [
  // REAL VOICES - Should be detected as REAL
  {
    name: 'Natural Human Voice - Average',
    description: 'Typical human speech with natural variation',
    features: {
      pitchVariability: 0.35,
      formantStability: 0.65,
      spectralFlatness: 0.04,
      harmonicRatio: 0.82,
      temporalModulation: 0.68,
      zeroCrossingRate: 0.035,
      spectralCentroid: 2200,
    },
    expected: 'real',
    reason: 'All features in normal human range',
  },
  {
    name: 'Calm/Monotone Speaker',
    description: 'Real voice with low pitch variation (common in calm speakers)',
    features: {
      pitchVariability: 0.18,
      formantStability: 0.72,
      spectralFlatness: 0.05,
      harmonicRatio: 0.78,
      temporalModulation: 0.55,
      zeroCrossingRate: 0.04,
      spectralCentroid: 2100,
    },
    expected: 'real',
    reason: 'Low pitch variability but other features are natural',
  },
  {
    name: 'Professional Speaker',
    description: 'Trained speaker with controlled voice',
    features: {
      pitchVariability: 0.22,
      formantStability: 0.78,
      spectralFlatness: 0.045,
      harmonicRatio: 0.85,
      temporalModulation: 0.62,
      zeroCrossingRate: 0.032,
      spectralCentroid: 2400,
    },
    expected: 'real',
    reason: 'High formant stability but natural harmonic content',
  },
  {
    name: 'Breathy Voice',
    description: 'Real voice with breathy quality (lower harmonic ratio)',
    features: {
      pitchVariability: 0.28,
      formantStability: 0.68,
      spectralFlatness: 0.06,
      harmonicRatio: 0.68,
      temporalModulation: 0.58,
      zeroCrossingRate: 0.045,
      spectralCentroid: 2300,
    },
    expected: 'real',
    reason: 'Lower harmonic ratio but natural pitch and temporal patterns',
  },
  {
    name: 'Noisy Recording - Real Voice',
    description: 'Real voice recorded with background noise',
    features: {
      pitchVariability: 0.32,
      formantStability: 0.70,
      spectralFlatness: 0.08,
      harmonicRatio: 0.75,
      temporalModulation: 0.65,
      zeroCrossingRate: 0.065,
      spectralCentroid: 2500,
    },
    expected: 'real',
    reason: 'Higher spectral flatness and ZCR due to noise, but voice patterns are natural',
  },
  {
    name: 'Room Echo - Real Voice',
    description: 'Real voice recorded in room with echo/reverb',
    features: {
      pitchVariability: 0.30,
      formantStability: 0.75,
      spectralFlatness: 0.07,
      harmonicRatio: 0.72,
      temporalModulation: 0.60,
      zeroCrossingRate: 0.055,
      spectralCentroid: 2600,
    },
    expected: 'real',
    reason: 'Slightly degraded features due to acoustics, but still natural patterns',
  },
  {
    name: 'Steady Paced Speaker',
    description: 'Real voice with very steady pacing (low temporal modulation)',
    features: {
      pitchVariability: 0.25,
      formantStability: 0.73,
      spectralFlatness: 0.05,
      harmonicRatio: 0.80,
      temporalModulation: 0.38,
      zeroCrossingRate: 0.038,
      spectralCentroid: 2250,
    },
    expected: 'real',
    reason: 'Low temporal modulation but other features are clearly human',
  },
  {
    name: 'Deep Voice - Male',
    description: 'Real deep male voice (lower spectral centroid)',
    features: {
      pitchVariability: 0.28,
      formantStability: 0.68,
      spectralFlatness: 0.04,
      harmonicRatio: 0.85,
      temporalModulation: 0.65,
      zeroCrossingRate: 0.030,
      spectralCentroid: 1650,
    },
    expected: 'real',
    reason: 'Lower spectral centroid is normal for deep voices',
  },
  {
    name: 'High Voice - Female',
    description: 'Real high-pitched female voice',
    features: {
      pitchVariability: 0.38,
      formantStability: 0.70,
      spectralFlatness: 0.045,
      harmonicRatio: 0.88,
      temporalModulation: 0.72,
      zeroCrossingRate: 0.042,
      spectralCentroid: 2800,
    },
    expected: 'real',
    reason: 'Higher spectral centroid is normal for high-pitched voices',
  },

  // FAKE VOICES - Should be detected as FAKE
  {
    name: 'Clear AI Voice - ElevenLabs',
    description: 'Typical AI-generated voice from ElevenLabs',
    features: {
      pitchVariability: 0.08,
      formantStability: 0.92,
      spectralFlatness: 0.12,
      harmonicRatio: 0.58,
      temporalModulation: 0.25,
      zeroCrossingRate: 0.075,
      spectralCentroid: 2400,
    },
    expected: 'fake',
    reason: 'Multiple strong AI indicators: very low pitch variability, high formant stability, high spectral flatness',
  },
  {
    name: 'Clear AI Voice - Murf',
    description: 'AI-generated voice from Murf.ai',
    features: {
      pitchVariability: 0.06,
      formantStability: 0.94,
      spectralFlatness: 0.14,
      harmonicRatio: 0.52,
      temporalModulation: 0.22,
      zeroCrossingRate: 0.082,
      spectralCentroid: 2500,
    },
    expected: 'fake',
    reason: 'Very strong AI signature across all features',
  },
  {
    name: 'High-Quality AI Voice',
    description: 'Premium AI voice with better quality',
    features: {
      pitchVariability: 0.10,
      formantStability: 0.89,
      spectralFlatness: 0.10,
      harmonicRatio: 0.62,
      temporalModulation: 0.30,
      zeroCrossingRate: 0.068,
      spectralCentroid: 2350,
    },
    expected: 'fake',
    reason: 'Still shows clear AI patterns despite higher quality',
  },
  {
    name: 'AI Voice with Effects',
    description: 'AI voice with audio processing/effects applied',
    features: {
      pitchVariability: 0.09,
      formantStability: 0.91,
      spectralFlatness: 0.11,
      harmonicRatio: 0.55,
      temporalModulation: 0.28,
      zeroCrossingRate: 0.072,
      spectralCentroid: 2600,
    },
    expected: 'fake',
    reason: 'AI patterns persist even with audio effects',
  },
  {
    name: 'AI Voice - Background Noise',
    description: 'AI voice with added background noise',
    features: {
      pitchVariability: 0.07,
      formantStability: 0.93,
      spectralFlatness: 0.13,
      harmonicRatio: 0.56,
      temporalModulation: 0.24,
      zeroCrossingRate: 0.085,
      spectralCentroid: 2450,
    },
    expected: 'fake',
    reason: 'AI signature remains despite noise',
  },
];

export async function runComprehensiveTests(): Promise<{
  passed: number;
  failed: number;
  results: Array<{
    test: TestCase;
    predicted: 'real' | 'fake';
    confidence: number;
    passed: boolean;
  }>;
}> {
  const results = [];
  let passed = 0;
  let failed = 0;

  console.log('\n🧪 Running Comprehensive Voice Detection Tests\n');
  console.log('='.repeat(80));

  for (const test of testCases) {
    // Create a mock audio buffer with the test features
    const mockResult = await analyzeFeatures(test.features);
    
    const testResult = {
      test,
      predicted: mockResult.isDeepfake ? 'fake' as const : 'real' as const,
      confidence: mockResult.confidence,
      passed: (mockResult.isDeepfake ? 'fake' : 'real') === test.expected,
    };
    
    results.push(testResult);
    
    if (testResult.passed) {
      passed++;
      console.log(`✅ PASS: ${test.name}`);
    } else {
      failed++;
      console.log(`❌ FAIL: ${test.name}`);
    }
    
    console.log(`   Expected: ${test.expected.toUpperCase()} | Predicted: ${testResult.predicted.toUpperCase()} | Confidence: ${(testResult.confidence * 100).toFixed(1)}%`);
    console.log(`   Reason: ${test.reason}`);
    console.log('-'.repeat(80));
  }

  console.log('='.repeat(80));
  console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed out of ${testCases.length} tests`);
  console.log(`📈 Accuracy: ${((passed / testCases.length) * 100).toFixed(1)}%\n`);

  if (failed === 0) {
    console.log('🎉 All tests passed! Detection algorithm is working correctly.\n');
  } else {
    console.log(`⚠️  ${failed} test(s) failed. Review the algorithm thresholds.\n`);
  }

  return { passed, failed, results };
}

// Helper function to analyze features without audio buffer
async function analyzeFeatures(features: any): Promise<{ isDeepfake: boolean; confidence: number }> {
  // Import the actual analyzeFeatures function from analysis.ts
  // For testing, we'll simulate the analysis
  const { analyzeAudio } = await import('./analysis');
  
  // Create a minimal mock audio buffer
  const sampleRate = 44100;
  const duration = 1; // 1 second
  const length = sampleRate * duration;
  const channelData = new Float32Array(length);
  
  // Generate synthetic audio based on features
  for (let i = 0; i < length; i++) {
    const t = i / sampleRate;
    // Base frequency with pitch variability
    const baseFreq = 150 + Math.sin(t * features.pitchVariability * 10) * 50;
    channelData[i] = Math.sin(2 * Math.PI * baseFreq * t) * 0.5;
    
    // Add harmonics
    channelData[i] += Math.sin(2 * Math.PI * baseFreq * 2 * t) * 0.3 * features.harmonicRatio;
    channelData[i] += Math.sin(2 * Math.PI * baseFreq * 3 * t) * 0.2 * features.harmonicRatio;
    
    // Add noise based on spectral flatness
    channelData[i] += (Math.random() - 0.5) * features.spectralFlatness * 0.5;
  }
  
  // Create AudioBuffer
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const audioBuffer = audioContext.createBuffer(1, length, sampleRate);
  audioBuffer.getChannelData(0).set(channelData);
  
  // Analyze the audio
  const result = await analyzeAudio(audioBuffer, 'test.wav');
  
  await audioContext.close();
  
  return {
    isDeepfake: result.isDeepfake,
    confidence: result.confidence,
  };
}
