import { useState } from 'react';
import { runComprehensiveTests, printTestResults } from '../utils/testSuite';

interface TestResult {
  name: string;
  passed: boolean;
  expected: string;
  actual: string;
  confidence?: number;
}

export default function E2ETestPanel({ onClose }: { onClose: () => void }) {
  const [results, setResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [summary, setSummary] = useState<{ passed: number; failed: number; total: number } | null>(null);

  const runTests = async () => {
    setIsRunning(true);
    setResults([]);
    setSummary(null);

    console.log('\n🚀 Starting VoxForensics Comprehensive Test Suite...\n');
    
    const testResults = await runComprehensiveTests();
    setResults(testResults);
    
    const testSummary = printTestResults(testResults);
    setSummary(testSummary);
    
    setIsRunning(false);
  };

  const passedCount = results.filter(r => r.passed).length;
  const failedCount = results.filter(r => !r.passed).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="glass-card p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">🧪 Comprehensive AI Detection Tests</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">×</button>
        </div>

        <div className="mb-6">
          <p className="text-gray-300 mb-4">
            Run 10 comprehensive tests to validate AI voice detection accuracy across various scenarios:
          </p>
          <ul className="text-sm text-gray-400 space-y-1 mb-4">
            <li>• Clear AI voice detection</li>
            <li>• Clear real voice detection</li>
            <li>• AI voice via speaker playback</li>
            <li>• Mixed audio (real + AI background)</li>
            <li>• Borderline cases and edge scenarios</li>
            <li>• High-quality AI voices</li>
            <li>• Real voice with background noise/music</li>
            <li>• AI voice with audio effects</li>
            <li>• Quiet real voice</li>
            <li>• Advanced AI mimicking natural speech</li>
          </ul>
        </div>

        {!isRunning && results.length === 0 && (
          <button
            onClick={runTests}
            className="neon-btn w-full py-4 text-lg font-semibold"
          >
            🚀 Run All 10 Tests
          </button>
        )}

        {isRunning && (
          <div className="text-center py-8">
            <div className="spinner w-12 h-12 mx-auto mb-4"></div>
            <p className="text-gray-300">Running comprehensive tests...</p>
          </div>
        )}

        {results.length > 0 && (
          <div className="space-y-3">
            {results.map((result, index) => (
              <div
                key={index}
                className={`p-4 rounded-xl border ${
                  result.passed
                    ? 'bg-green-500/5 border-green-500/30'
                    : 'bg-red-500/5 border-red-500/30'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-white">
                    {result.passed ? '✅' : '❌'} Test {index + 1}: {result.name}
                  </h3>
                  {result.confidence && (
                    <span className="text-xs text-gray-400">
                      {(result.confidence * 100).toFixed(1)}% confidence
                    </span>
                  )}
                </div>
                <div className="text-sm space-y-1">
                  <p className="text-gray-400">
                    <span className="text-gray-500">Expected:</span> {result.expected}
                  </p>
                  <p className={result.passed ? 'text-green-400' : 'text-red-400'}>
                    <span className="text-gray-500">Actual:</span> {result.actual}
                  </p>
                </div>
              </div>
            ))}

            {summary && (
              <div className={`mt-6 p-6 rounded-xl border ${
                summary.failed === 0
                  ? 'bg-green-500/10 border-green-500/30'
                  : 'bg-red-500/10 border-red-500/30'
              }`}>
                <h3 className="text-xl font-bold text-white mb-3">📊 Test Summary</h3>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-3xl font-bold text-white">{summary.total}</p>
                    <p className="text-sm text-gray-400">Total Tests</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-green-400">{summary.passed}</p>
                    <p className="text-sm text-gray-400">Passed</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-red-400">{summary.failed}</p>
                    <p className="text-sm text-gray-400">Failed</p>
                  </div>
                </div>
                <div className="mt-4 text-center">
                  <p className="text-lg font-semibold text-white">
                    Success Rate: {((summary.passed / summary.total) * 100).toFixed(1)}%
                  </p>
                  {summary.failed === 0 ? (
                    <p className="text-green-400 mt-2">🎉 All tests passed! AI detection is working correctly.</p>
                  ) : (
                    <p className="text-red-400 mt-2">⚠️ {summary.failed} test(s) failed. Review detection algorithm.</p>
                  )}
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button
                onClick={runTests}
                disabled={isRunning}
                className="neon-btn flex-1"
              >
                🔄 Run Tests Again
              </button>
              <button onClick={onClose} className="neon-btn neon-btn-danger flex-1">
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
