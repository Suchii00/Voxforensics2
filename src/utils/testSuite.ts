import { analyzeAudio, AcousticFeatures } from '../utils/analysis';

interface TestResult {
  name: string;
  passed: boolean;
  expected: string;
  actual: string;
  confidence?: number;
}

export async function runComprehensiveTests(): Promise<TestResult[]> {
  const results: TestResult[] = [];

  // Test 1: Clear AI Voice (low pitch variability, high formant stability)
  console.log('🧪 Test 1: Clear AI Voice Detection');
  const aiFeatures1: AcousticFeatures = {
    pitchVariability: 0.08,
    formantStability: 0.94,
    spectralFlatness: 0.11,
    harmonicRatio: 0.62,
    temporalModulation: 0.30,
    zeroCrossingRate: 0.065,
    spectralCentroid: 2900,
    spectralRolloff: 5200,
    mfccEnergy: -18,
    chromaFeatures: 0.65
  };
  const result1 = await analyzeAudio(null, 'test_ai_1.wav', undefined, aiFeatures1);
  results.push({
    name: 'Test 1: Clear AI Voice (synthetic features)',
    passed: result1.isDeepfake === true,
    expected: 'Deepfake (AI Voice)',
    actual: result1.isDeepfake ? 'Deepfake (AI Voice)' : 'Real Voice',
    confidence: result1.confidence
  });

  // Test 2: Clear Real Voice (high pitch variability, natural modulation)
  console.log('🧪 Test 2: Clear Real Voice Detection');
  const realFeatures1: AcousticFeatures = {
    pitchVariability: 0.38,
    formantStability: 0.62,
    spectralFlatness: 0.032,
    harmonicRatio: 0.85,
    temporalModulation: 0.72,
    zeroCrossingRate: 0.028,
    spectralCentroid: 2400,
    spectralRolloff: 4800,
    mfccEnergy: -22,
    chromaFeatures: 0.78
  };
  const result2 = await analyzeAudio(null, 'test_real_1.wav', undefined, realFeatures1);
  results.push({
    name: 'Test 2: Clear Real Voice (natural features)',
    passed: result2.isDeepfake === false,
    expected: 'Real Voice',
    actual: result2.isDeepfake ? 'Deepfake (AI Voice)' : 'Real Voice',
    confidence: result2.confidence
  });

  // Test 3: AI Voice with Speaker Playback (slightly degraded but still detectable)
  console.log('🧪 Test 3: AI Voice via Speaker (degraded signal)');
  const aiFeatures2: AcousticFeatures = {
    pitchVariability: 0.14,
    formantStability: 0.88,
    spectralFlatness: 0.085,
    harmonicRatio: 0.68,
    temporalModulation: 0.38,
    zeroCrossingRate: 0.058,
    spectralCentroid: 2750,
    spectralRolloff: 5100,
    mfccEnergy: -19,
    chromaFeatures: 0.68
  };
  const result3 = await analyzeAudio(null, 'test_ai_speaker.wav', undefined, aiFeatures2);
  results.push({
    name: 'Test 3: AI Voice via Speaker Playback',
    passed: result3.isDeepfake === true,
    expected: 'Deepfake (AI Voice)',
    actual: result3.isDeepfake ? 'Deepfake (AI Voice)' : 'Real Voice',
    confidence: result3.confidence
  });

  // Test 4: Mixed Audio (Real + AI - should detect AI presence)
  console.log('🧪 Test 4: Mixed Audio (Real + AI Background)');
  const mixedFeatures: AcousticFeatures = {
    pitchVariability: 0.22, // Lower than pure real due to AI interference
    formantStability: 0.78, // Higher than pure real
    spectralFlatness: 0.065, // Higher than pure real
    harmonicRatio: 0.73, // Lower than pure real
    temporalModulation: 0.48, // Lower than pure real
    zeroCrossingRate: 0.048, // Higher than pure real
    spectralCentroid: 2600,
    spectralRolloff: 4950,
    mfccEnergy: -20,
    chromaFeatures: 0.72
  };
  const result4 = await analyzeAudio(null, 'test_mixed.wav', undefined, mixedFeatures);
  results.push({
    name: 'Test 4: Mixed Audio (Real + AI Background)',
    passed: result4.isDeepfake === true, // Should detect AI presence
    expected: 'Deepfake (AI Detected in Mix)',
    actual: result4.isDeepfake ? 'Deepfake (AI Detected)' : 'Real Voice',
    confidence: result4.confidence
  });

  // Test 5: Borderline Real Voice (natural but with some noise)
  console.log('🧪 Test 5: Borderline Real Voice');
  const realFeatures2: AcousticFeatures = {
    pitchVariability: 0.28,
    formantStability: 0.70,
    spectralFlatness: 0.048,
    harmonicRatio: 0.79,
    temporalModulation: 0.58,
    zeroCrossingRate: 0.038,
    spectralCentroid: 2350,
    spectralRolloff: 4750,
    mfccEnergy: -21,
    chromaFeatures: 0.76
  };
  const result5 = await analyzeAudio(null, 'test_real_borderline.wav', undefined, realFeatures2);
  results.push({
    name: 'Test 5: Borderline Real Voice (noisy environment)',
    passed: result5.isDeepfake === false,
    expected: 'Real Voice',
    actual: result5.isDeepfake ? 'Deepfake (AI Voice)' : 'Real Voice',
    confidence: result5.confidence
  });

  // Test 6: High-Quality AI Voice (very synthetic)
  console.log('🧪 Test 6: High-Quality AI Voice');
  const aiFeatures3: AcousticFeatures = {
    pitchVariability: 0.06,
    formantStability: 0.96,
    spectralFlatness: 0.13,
    harmonicRatio: 0.58,
    temporalModulation: 0.25,
    zeroCrossingRate: 0.072,
    spectralCentroid: 3050,
    spectralRolloff: 5350,
    mfccEnergy: -17,
    chromaFeatures: 0.62
  };
  const result6 = await analyzeAudio(null, 'test_ai_high_quality.wav', undefined, aiFeatures3);
  results.push({
    name: 'Test 6: High-Quality AI Voice (very synthetic)',
    passed: result6.isDeepfake === true,
    expected: 'Deepfake (AI Voice)',
    actual: result6.isDeepfake ? 'Deepfake (AI Voice)' : 'Real Voice',
    confidence: result6.confidence
  });

  // Test 7: Real Voice with Background Music
  console.log('🧪 Test 7: Real Voice with Background Music');
  const realFeatures3: AcousticFeatures = {
    pitchVariability: 0.35,
    formantStability: 0.65,
    spectralFlatness: 0.042,
    harmonicRatio: 0.82,
    temporalModulation: 0.68,
    zeroCrossingRate: 0.032,
    spectralCentroid: 2500,
    spectralRolloff: 4900,
    mfccEnergy: -20,
    chromaFeatures: 0.80
  };
  const result7 = await analyzeAudio(null, 'test_real_with_music.wav', undefined, realFeatures3);
  results.push({
    name: 'Test 7: Real Voice with Background Music',
    passed: result7.isDeepfake === false,
    expected: 'Real Voice',
    actual: result7.isDeepfake ? 'Deepfake (AI Voice)' : 'Real Voice',
    confidence: result7.confidence
  });

  // Test 8: AI Voice with Heavy Processing/Effects
  console.log('🧪 Test 8: AI Voice with Audio Effects');
  const aiFeatures4: AcousticFeatures = {
    pitchVariability: 0.11,
    formantStability: 0.90,
    spectralFlatness: 0.095,
    harmonicRatio: 0.65,
    temporalModulation: 0.33,
    zeroCrossingRate: 0.062,
    spectralCentroid: 2850,
    spectralRolloff: 5250,
    mfccEnergy: -18,
    chromaFeatures: 0.66
  };
  const result8 = await analyzeAudio(null, 'test_ai_processed.wav', undefined, aiFeatures4);
  results.push({
    name: 'Test 8: AI Voice with Audio Effects/Processing',
    passed: result8.isDeepfake === true,
    expected: 'Deepfake (AI Voice)',
    actual: result8.isDeepfake ? 'Deepfake (AI Voice)' : 'Real Voice',
    confidence: result8.confidence
  });

  // Test 9: Very Quiet Real Voice (low energy but natural)
  console.log('🧪 Test 9: Quiet Real Voice');
  const realFeatures4: AcousticFeatures = {
    pitchVariability: 0.32,
    formantStability: 0.68,
    spectralFlatness: 0.038,
    harmonicRatio: 0.80,
    temporalModulation: 0.62,
    zeroCrossingRate: 0.030,
    spectralCentroid: 2300,
    spectralRolloff: 4700,
    mfccEnergy: -28, // Very quiet
    chromaFeatures: 0.77
  };
  const result9 = await analyzeAudio(null, 'test_real_quiet.wav', undefined, realFeatures4);
  results.push({
    name: 'Test 9: Very Quiet Real Voice',
    passed: result9.isDeepfake === false,
    expected: 'Real Voice',
    actual: result9.isDeepfake ? 'Deepfake (AI Voice)' : 'Real Voice',
    confidence: result9.confidence
  });

  // Test 10: AI Voice Mimicking Real Speech Patterns
  console.log('🧪 Test 10: Advanced AI Voice (mimicking natural patterns)');
  const aiFeatures5: AcousticFeatures = {
    pitchVariability: 0.17, // Trying to sound natural but still too consistent
    formantStability: 0.84, // Still too stable
    spectralFlatness: 0.072, // Still has vocoder artifacts
    harmonicRatio: 0.71, // Still lower than real
    temporalModulation: 0.44, // Still missing micro-pauses
    zeroCrossingRate: 0.052, // Still elevated
    spectralCentroid: 2680,
    spectralRolloff: 5050,
    mfccEnergy: -19,
    chromaFeatures: 0.70
  };
  const result10 = await analyzeAudio(null, 'test_ai_advanced.wav', undefined, aiFeatures5);
  results.push({
    name: 'Test 10: Advanced AI Voice (mimicking natural speech)',
    passed: result10.isDeepfake === true,
    expected: 'Deepfake (AI Voice)',
    actual: result10.isDeepfake ? 'Deepfake (AI Voice)' : 'Real Voice',
    confidence: result10.confidence
  });

  return results;
}

export function printTestResults(results: TestResult[]) {
  console.log('\n' + '='.repeat(80));
  console.log('🎯 VOXFORENSICS COMPREHENSIVE TEST RESULTS');
  console.log('='.repeat(80) + '\n');

  let passed = 0;
  let failed = 0;

  results.forEach((result, index) => {
    const status = result.passed ? '✅ PASS' : '❌ FAIL';
    const confidence = result.confidence ? ` (${(result.confidence * 100).toFixed(1)}% confidence)` : '';
    
    console.log(`${status} Test ${index + 1}: ${result.name}`);
    console.log(`   Expected: ${result.expected}`);
    console.log(`   Actual:   ${result.actual}${confidence}`);
    console.log('');

    if (result.passed) passed++;
    else failed++;
  });

  console.log('='.repeat(80));
  console.log(`📊 SUMMARY: ${passed} passed, ${failed} failed out of ${results.length} tests`);
  console.log(`🎯 Success Rate: ${((passed / results.length) * 100).toFixed(1)}%`);
  console.log('='.repeat(80) + '\n');

  if (failed === 0) {
    console.log('🎉 ALL TESTS PASSED! AI voice detection is working correctly.\n');
  } else {
    console.log(`⚠️  ${failed} test(s) failed. Review the detection algorithm.\n`);
  }

  return { passed, failed, total: results.length };
}
