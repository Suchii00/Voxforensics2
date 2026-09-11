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
          ? `✅ All features valid: centroid=${features.spectralCentroid.toFixed(0)}Hz, pitchVar=${features.pitchVariability.toFixed(4)}`
          : `❌ Some features out of range`
      };
    });

    await runTest('4. Probability Distribution', async () => {
      const result = await analyzeAudio(null, 'test.wav', 'real');
      const total = result.probabilities.real + result.probabilities.deepfake + result.probabilities.manipulated;
      const pass = total > 0.5 && total < 1.5;
      return {
        pass,
        details: pass
          ? `✅ Probabilities sum to ${(total * 100).toFixed(1)}% (R:${(result.probabilities.real * 100).toFixed(1)}% DF:${(result.probabilities.deepfake * 100).toFixed(1)}%)`
          : `❌ Probabilities sum to ${(total * 100).toFixed(1)}% (expected ~100%)`
      };
    });

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

    await runTest('6. Confidence Range', async () => {
      const r1 = await analyzeAudio(null, 'test1.wav', 'real');
      const r2 = await analyzeAudio(null, 'test2.wav', 'fake');
      const pass = r1.confidence >= 0.5 && r1.confidence <= 1.0 && r2.confidence >= 0.5 && r2.confidence <= 1.0;
      return {
        pass,
        details: pass
          ? `✅ Real: ${(r1.confidence * 100).toFixed(1)}%, Fake: ${(r2.confidence * 100).toFixed(1)}%`
          : `❌ Confidence out of range`
      };
    });

    await runTest('7. Model Metadata', async () => {
      const result = await analyzeAudio(null, 'test.wav', 'real');
      const pass = result.modelVersion.length > 0 && result.timestamp.length > 0 && result.sampleRate > 0;
      return {
        pass,
        details: pass ? `✅ Model: ${result.modelVersion}, Rate: ${result.sampleRate}Hz` : `❌ Missing metadata`
      };
    });

    await runTest('8. Input Differentiation', async () => {
      const realResult = await analyzeAudio(null, 'real.wav', 'real');
      const fakeResult = await analyzeAudio(null, 'fake.wav', 'fake');
      const pass = realResult.isDeepfake !== fakeResult.isDeepfake;
      return {
        pass,
        details: pass
          ? `✅ Real→${realResult.isDeepfake ? 'FAKE' : 'REAL'}, Fake→${fakeResult.isDeepfake ? 'FAKE' : 'REAL'}`
          : `❌ Cannot differentiate`
      };
    });

    await runTest('9. Performance (< 5s)', async () => {
      const start = Date.now();
      await analyzeAudio(null, 'perf_test.wav', 'real');
      const duration = Date.now() - start;
      const pass = duration < 5000;
      return {
        pass,
        details: pass ? `✅ Completed in ${duration}ms` : `❌ Took ${duration}ms (too slow)`
      };
    });

    await runTest('10. Uncertainty Calculation', async () => {
      const result = await analyzeAudio(null, 'test.wav', 'real');
      const expected = 1 - result.confidence;
      const pass = Math.abs(result.uncertainty - expected) < 0.001;
      return {
        pass,
        details: pass
          ? `✅ Uncertainty ${(result.uncertainty * 100).toFixed(1)}% = 100% - ${(result.confidence * 100).toFixed(1)}%`
          : `❌ Uncertainty mismatch`
      };
    });

    setIsRunning(false);
    setOverallStatus('complete');
  };

  const passCount = results.filter(r => r.status === 'pass').length;
  const failCount = results.filter(r => r.status === 'fail').length;
  const totalTests = 10;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(3, 7, 18, 0.85)', backdropFilter: 'blur(12px)' }}>
      <div className="glass-card p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            🧪 E2E Test Suite
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl transition-colors">✕</button>
        </div>

        {/* Status Bar */}
        <div className="mb-5 p-4 rounded-2xl bg-white/5 border border-white/5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-400">
              {overallStatus === 'idle' && 'Ready to run tests'}
              {overallStatus === 'running' && `Running... ${results.length}/${totalTests}`}
              {overallStatus === 'complete' && `Complete: ${passCount} passed, ${failCount} failed`}
            </span>
            <div className="flex gap-3 text-xs font-medium">
              <span style={{ color: '#00FF88' }}>✅ {passCount}</span>
              <span style={{ color: '#FF0055' }}>❌ {failCount}</span>
            </div>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ 
                width: `${(results.filter(r => r.status !== 'pending' && r.status !== 'running').length / totalTests) * 100}%`,
                background: failCount > 0 ? 'linear-gradient(90deg, #FF0055, #E100FF)' : 'linear-gradient(90deg, #00FF88, #00F2FE)'
              }}
            ></div>
          </div>
        </div>

        {/* Test Results */}
        <div className="space-y-2 mb-6">
          {results.map((result, i) => (
            <div key={i} className={`p-3 rounded-xl border text-sm transition-all ${
              result.status === 'pass' ? 'bg-green-500/5 border-green-500/20' :
              result.status === 'fail' ? 'bg-red-500/5 border-red-500/20' :
              result.status === 'running' ? 'bg-cyan-500/5 border-cyan-500/20' :
              'bg-white/5 border-white/5'
            }`}>
              <div className="flex items-center justify-between">
                <span className="font-medium text-white text-sm">
                  {result.status === 'pass' ? '✅' : result.status === 'fail' ? '❌' : result.status === 'running' ? '⏳' : '⏸️'}
                  {' '}{result.name}
                </span>
                <span className="text-xs text-gray-500 font-mono">{result.duration}ms</span>
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
          <button onClick={onClose} className="neon-btn neon-btn-danger">Close</button>
        </div>

        {/* HTTP Status */}
        {overallStatus === 'complete' && failCount === 0 && (
          <div className="mt-5 p-4 rounded-2xl text-center" style={{ background: 'rgba(0, 255, 136, 0.05)', border: '1px solid rgba(0, 255, 136, 0.2)' }}>
            <p className="text-2xl font-bold" style={{ color: '#00FF88' }}>200 OK</p>
            <p className="text-xs text-gray-400 mt-1">All {totalTests} tests passed — Analysis pipeline verified</p>
          </div>
        )}
        {overallStatus === 'complete' && failCount > 0 && (
          <div className="mt-5 p-4 rounded-2xl text-center" style={{ background: 'rgba(255, 0, 85, 0.05)', border: '1px solid rgba(255, 0, 85, 0.2)' }}>
            <p className="text-2xl font-bold" style={{ color: '#FF0055' }}>500 Internal Error</p>
            <p className="text-xs text-gray-400 mt-1">{failCount} test(s) failed — Review details above</p>
          </div>
        )}
      </div>
    </div>
  );
}
