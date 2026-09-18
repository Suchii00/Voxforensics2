import { useState } from 'react';
import { runComprehensiveTests } from '../utils/testDetection';

export default function TestPanel() {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<any>(null);

  const handleRunTests = async () => {
    setIsRunning(true);
    console.log('\n🚀 Starting comprehensive voice detection tests...\n');
    
    const testResults = await runComprehensiveTests();
    setResults(testResults);
    setIsRunning(false);
    
    console.log('\n✅ Tests completed! Check console for detailed results.\n');
  };

  return (
    <div className="glass-panel p-6">
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
        <span>🧪</span>
        Voice Detection Test Suite
      </h3>
      
      <p className="text-gray-400 mb-4 text-sm">
        Run comprehensive tests to validate the AI detection algorithm accuracy. 
        Tests include 9 real voice scenarios and 5 AI voice scenarios.
      </p>

      <div className="mb-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
        <p className="text-blue-300 text-sm font-semibold mb-2">ℹ️ About This Test</p>
        <ul className="text-gray-400 text-xs space-y-1">
          <li>• Tests various real voice types (calm, professional, breathy, noisy, etc.)</li>
          <li>• Tests various AI voice types (ElevenLabs, Murf, high-quality, etc.)</li>
          <li>• Validates that real voices are NOT falsely detected as AI</li>
          <li>• Validates that AI voices ARE correctly detected</li>
          <li>• Results are displayed in the browser console (F12)</li>
        </ul>
      </div>

      <button
        onClick={handleRunTests}
        disabled={isRunning}
        className={`px-6 py-3 rounded-lg font-semibold transition-all ${
          isRunning
            ? 'bg-gray-600 cursor-not-allowed'
            : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600'
        }`}
      >
        {isRunning ? '⏳ Running Tests...' : '🚀 Run Tests'}
      </button>

      {results && (
        <div className="mt-6 p-4 bg-gray-800/50 rounded-lg">
          <h4 className="font-bold mb-3 text-lg">📊 Test Results</h4>
          
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
              <div className="text-2xl font-bold text-green-400">{results.passed}</div>
              <div className="text-xs text-gray-400">Passed</div>
            </div>
            <div className="text-center p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <div className="text-2xl font-bold text-red-400">{results.failed}</div>
              <div className="text-xs text-gray-400">Failed</div>
            </div>
            <div className="text-center p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <div className="text-2xl font-bold text-blue-400">
                {((results.passed / results.results.length) * 100).toFixed(1)}%
              </div>
              <div className="text-xs text-gray-400">Accuracy</div>
            </div>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {results.results.map((result: any, index: number) => (
              <div
                key={index}
                className={`p-3 rounded-lg border ${
                  result.passed
                    ? 'bg-green-500/5 border-green-500/20'
                    : 'bg-red-500/5 border-red-500/20'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span>{result.passed ? '✅' : '❌'}</span>
                      <span className="font-semibold text-sm">{result.test.name}</span>
                    </div>
                    <p className="text-xs text-gray-400 mb-1">{result.test.description}</p>
                    <div className="flex gap-4 text-xs">
                      <span className="text-gray-500">
                        Expected: <span className={result.test.expected === 'real' ? 'text-green-400' : 'text-red-400'}>
                          {result.test.expected.toUpperCase()}
                        </span>
                      </span>
                      <span className="text-gray-500">
                        Predicted: <span className={result.predicted === 'real' ? 'text-green-400' : 'text-red-400'}>
                          {result.predicted.toUpperCase()}
                        </span>
                      </span>
                      <span className="text-gray-500">
                        Confidence: <span className="text-blue-400">{(result.confidence * 100).toFixed(1)}%</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <p className="text-yellow-300 text-xs">
              💡 <strong>Tip:</strong> Open browser console (F12) to see detailed test output with feature values and analysis.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
