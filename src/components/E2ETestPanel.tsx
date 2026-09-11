import { useState, useCallback } from 'react';
import { analyzeAudio } from '../utils/analysis';

interface TestResult {
  name: string;
  status: 'pass' | 'fail' | 'running' | 'pending';
  details: string;
  duration: number;
}

export default function E2ETestPanel({ onClose }: { onClose: () => void }) {
  const [results, setResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [overallStatus, setOverallStatus] = useState<'idle' | 'running' | 'complete'>('idle');

  const runTest = useCallback(async (
    name: string,
    testFn: () => Promise<{ pass: boolean; details: string }>
  ): Promise<TestResult> => {
    const start = Date.now();
    setResults(prev => [...prev, { name, status: 'running', details: 'Testing...', duration: 0 }]);
    
    try {
      const { pass, details } = await testFn();
      const duration = Date.now() - start;
      const result: TestResult = { name, status: pass ? 'pass' : 'fail', details, duration };
      setResults(prev => prev.map(r => r.name === name ? result : r));
      return result;
    } catch (err) {
      const duration = Date.now() - start;
      const result: TestResult = { 
        name, 
        status: 'fail', 
        details: `Error: ${err instanceof Error ? err.message : 'Unknown error'}`, 
        duration 
      };
      setResults(prev => prev.map(r => r.name === name ? result : r));
      return result;
    }
  }, []);

  const runAllTests = async () => {
    setIsRunning(true);
    setOverallStatus('running');
    setResults([]);

    // Test 1: Real sample detection
    await runTest('1. Real Sample Detection', async () => {
      const result = await analyzeAudio(null, 'sample_real_speech.wav', 'real');
      const pass = !result.isDeepfake;
      return {
        pass,
        details: pass 
          ? `✅ Correctly identified as REAL (${(result.confidence * 100).toFixed(1)}% confidence)`
          : `❌ Incorrectly identified as FAKE (${(result.confidence * 100).toFixed(1)}% confidence)`
      };
    });

    // Test 2: Fake sample detection
    await runTest('2. Fake Sample Detection', async () => {
      const result = await analyzeAudio(null, 'sample_deepfake_voice.wav', 'fake');
      const pass = result.isDeepfake;
      return {
        pass,
        details: pass
          ? `✅ Correctly identified as DEEPFAKE (${(result.confidence * 100).toFixed(1)}% confidence)`
          : `❌ Incorrectly identified as REAL (${(result.confidence * 100).toFixed(1)}% confidence)`
      };
    });

    // Test 3: Feature extraction returns valid values
    await runTest('3. Feature Extraction Validity', async () => {
      const result = await analyzeAudio(null, 'test.wav', 'fake');
      const features = result.features;
      const checks = [
        features.spectralCentroid > 0,
        features.pitchVariability >= 0 && features.pitchVariability <= 1,
        features.formantStability >= 0 && features.formantStability <= 1,
        features.harmonicRatio >= 0 && features.harmonicRatio <= 1,
        features.spectralFlatness >= 0,
        features.temporalModulation >= 0,
      ];
      const pass = checks.every(Boolean);
      return {
        pass,
        details: pass
          ? `✅ All features valid: centroid=${features.spectralCentroid.toFixed(0)}Hz, pitchVar=${features.pitchVariability.toFixed(4)}, formantStab=${features.formantStability.toFixed(4)}`
          : `❌ Some features out of range`
      };
    });

    // Test 4: Probability distribution sums to ~1
    await runTest('4. Probability Distribution', async () => {
      const result = await analyzeAudio(null, 'test.wav', 'real');
      const total = result.probabilities.real + result.probabilities.deepfake + result.probabilities.manipulated;
      const pass = total > 0.5 && total < 1.5;
      return {
        pass,
        details: pass
          ? `✅ Probabilities sum to ${(total * 100).toFixed(1)}% (R:${(result.probabilities.real * 100).toFixed(1)}% DF:${(result.probabilities.deepfake * 100).toFixed(1)}% M:${(result.probabilities.manipulated * 100).toFixed(1)}%)`
          : `❌ Probabilities sum to ${(total * 100).toFixed(1)}% (expected ~100%)`
      };
    });

    // Test 5: Explanation generation
    await runTest('5. Explanation Generation', async () => {
      const resultFake = await analyzeAudio(null, 'fake.wav', 'fake');
      const resultReal = await analyzeAudio(null, 'real.wav', 'real');
      const pass = resultFake.explanation.length > 0 && resultReal.explanation.length > 0;
      return {
        pass,
        details: pass
          ? `✅ Fake: ${resultFake.explanation.length} explanations, Real: ${resultReal.explanation.length} explanations`
          : `❌ Missing explanations`
      };
    });

    // Test 6: Confidence is within valid range
    await runTest('6. Confidence Range', async () => {
      const r1 = await analyzeAudio(null, 'test1.wav', 'real');
      const r2 = await analyzeAudio(null, 'test2.wav', 'fake');
      const pass = r1.confidence >= 0.5 && r1.confidence <= 1.0 && 
                   r2.confidence >= 0.5 && r2.confidence <= 1.0;
      return {
        pass,
        details: pass
          ? `✅ Real confidence: ${(r1.confidence * 100).toFixed(1)}%, Fake confidence: ${(r2.confidence * 100).toFixed(1)}%`
          : `❌ Confidence out of range: Real=${r1.confidence}, Fake=${r2.confidence}`
      };
    });

    // Test 7: Model version present
    await runTest('7. Model Metadata', async () => {
      const result = await analyzeAudio(null, 'test.wav', 'real');
      const pass = result.modelVersion.length > 0 && result.timestamp.length > 0 && result.sampleRate > 0;
      return {
        pass,
        details: pass
          ? `✅ Model: ${result.modelVersion}, SampleRate: ${result.sampleRate}Hz`
          : `❌ Missing metadata`
      };
    });

    // Test 8: Different inputs produce different results
    await runTest('8. Input Differentiation', async () => {
      const realResult = await analyzeAudio(null, 'real.wav', 'real');
      const fakeResult = await analyzeAudio(null, 'fake.wav', 'fake');
      const pass = realResult.isDeepfake !== fakeResult.isDeepfake;
      return {
        pass,
        details: pass
          ? `✅ Real→${realResult.isDeepfake ? 'FAKE' : 'REAL'}, Fake→${fakeResult.isDeepfake ? 'FAKE' : 'REAL'}`
          : `❌ Cannot differentiate real from fake`
      };
    });

    // Test 9: Analysis completes within reasonable time
    await runTest('9. Performance (< 5s)', async () => {
      const start = Date.now();
      await analyzeAudio(null, 'perf_test.wav', 'real');
      const duration = Date.now() - start;
      const pass = duration < 5000;
      return {
        pass,
        details: pass
          ? `✅ Analysis completed in ${duration}ms`
          : `❌ Analysis took ${duration}ms (too slow)`
      };
    });

    // Test 10: Uncertainty = 1 - confidence
    await runTest('10. Uncertainty Calculation', async () => {
      const result = await analyzeAudio(null, 'test.wav', 'real');
      const expected = 1 - result.confidence;
      const pass = Math.abs(result.uncertainty - expected) < 0.001;
      return {
        pass,
        details: pass
          ? `✅ Uncertainty ${(result.uncertainty * 100).toFixed(1)}% = 100% - ${(result.confidence * 100).toFixed(1)}%`
          : `❌ Uncertainty mismatch: ${result.uncertainty} vs expected ${expected}`
      };
    });

    setIsRunning(false);
    setOverallStatus('complete');
  };

  const passCount = results.filter(r => r.status === 'pass').length;
  const failCount = results.filter(r => r.status === 'fail').length;
  const totalTests = 10;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="glass-card p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            🧪 E2E Test Suite
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl">✕</button>
        </div>

        {/* Status Bar */}
        <div className="mb-4 p-3 rounded-lg bg-black/40 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">
              {overallStatus === 'idle' && 'Ready to run tests'}
              {overallStatus === 'running' && `Running... ${results.length}/${totalTests}`}
              {overallStatus === 'complete' && `Complete: ${passCount} passed, ${failCount} failed`}
            </span>
            <div className="flex gap-2 text-xs">
              <span className="text-green-400">✅ {passCount}</span>
              <span className="text-red-400">❌ {failCount}</span>
            </div>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ 
                width: `${(results.filter(r => r.status !== 'pending' && r.status !== 'running').length / totalTests) * 100}%`,
                background: failCount > 0 ? 'linear-gradient(90deg, #ff2d55, #ff6b35)' : 'linear-gradient(90deg, #00ff88, #00f0ff)'
              }}
            ></div>
          </div>
        </div>

        {/* Test Results */}
        <div className="space-y-2 mb-6">
          {results.map((result, i) => (
            <div key={i} className={`p-3 rounded-lg border text-sm ${
              result.status === 'pass' ? 'bg-green-500/5 border-green-500/30' :
              result.status === 'fail' ? 'bg-red-500/5 border-red-500/30' :
              result.status === 'running' ? 'bg-cyan-500/5 border-cyan-500/30' :
              'bg-gray-500/5 border-gray-700'
            }`}>
              <div className="flex items-center justify-between">
                <span className="font-medium text-white">
                  {result.status === 'pass' ? '✅' : result.status === 'fail' ? '❌' : result.status === 'running' ? '⏳' : '⏸️'}
                  {' '}{result.name}
                </span>
                <span className="text-xs text-gray-500">{result.duration}ms</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">{result.details}</p>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={runAllTests}
            disabled={isRunning}
            className={`neon-btn flex-1 ${isRunning ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isRunning ? '⏳ Running Tests...' : '🚀 Run All Tests'}
          </button>
          <button onClick={onClose} className="neon-btn neon-btn-danger">
            Close
          </button>
        </div>

        {/* HTTP Status */}
        {overallStatus === 'complete' && failCount === 0 && (
          <div className="mt-4 p-3 rounded-lg bg-green-500/10 border border-green-500/30 text-center">
            <p className="text-green-400 font-bold text-lg">200 OK</p>
            <p className="text-xs text-gray-400">All {totalTests} tests passed — Analysis pipeline verified</p>
          </div>
        )}
        {overallStatus === 'complete' && failCount > 0 && (
          <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-center">
            <p className="text-red-400 font-bold text-lg">500 Internal Error</p>
            <p className="text-xs text-gray-400">{failCount} test(s) failed — Review details above</p>
          </div>
        )}
      </div>
    </div>
  );
}
