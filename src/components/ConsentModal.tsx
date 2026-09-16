import { useState } from 'react';

export default function ConsentModal({ onAccept, onDecline }: { 
  onAccept: () => void; 
  onDecline: () => void;
}) {
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showStorage, setShowStorage] = useState(false);
  const [hasReadAll, setHasReadAll] = useState(false);

  const handleAgree = () => {
    const consentData = {
      agreed: true,
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    };
    localStorage.setItem('voxforensics_consent', JSON.stringify(consentData));
    onAccept();
  };

  const handleDecline = () => {
    onDecline();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ background: 'rgba(3, 7, 18, 0.95)', backdropFilter: 'blur(12px)' }}>
      <div className="glass-card p-6 md:p-8 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="hero-title text-4xl mb-3">VoxForensics</h1>
          <h2 className="text-xl font-bold text-white mb-2">Voice Data Usage Agreement</h2>
          <p className="text-sm text-gray-400">Please read the following before using our service</p>
        </div>

        {/* Important Notice */}
        <div className="p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/20 mb-6">
          <p className="text-sm text-cyan-300 font-semibold mb-2">🔒 Your Privacy Matters</p>
          <p className="text-xs text-gray-300">
            VoxForensics processes voice recordings to detect AI-generated deepfake audio. 
            Voice data is considered biometric information under GDPR, BIPA, and other privacy laws. 
            By clicking "I Agree", you confirm that you have read and understood the terms below.
          </p>
        </div>

        {/* Main Agreement Text */}
        <div className="space-y-4 mb-6">
          {/* Voice Usage */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
              🎙️ Voice Data Usage
            </h3>
            <p className="text-xs text-gray-300 leading-relaxed">
              By using VoxForensics, you acknowledge that we will process your voice recordings for the sole purpose of 
              deepfake audio detection. Your voice contains biometric information, and we require your explicit consent 
              to analyze it. All processing occurs locally in your browser using AI algorithms that extract acoustic 
              features (pitch, formants, spectral analysis) for detection purposes only.
            </p>
          </div>

          {/* Privacy Policy */}
          <div className="rounded-xl bg-white/5 border border-white/10 overflow-hidden">
            <button
              onClick={() => setShowPrivacy(!showPrivacy)}
              className="w-full p-4 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
            >
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                🔐 Privacy Policy
              </h3>
              <span className="text-gray-400">{showPrivacy ? '▼' : '▶'}</span>
            </button>
            {showPrivacy && (
              <div className="p-4 pt-0 text-xs text-gray-300 space-y-2 leading-relaxed">
                <p><strong className="text-white">Data Collection:</strong> We collect voice recordings only when you actively upload or record them.</p>
                <p><strong className="text-white">Data Processing:</strong> All processing occurs client-side in your browser. No voice data is transmitted to external servers.</p>
                <p><strong className="text-white">Data Storage:</strong> Analysis results (metadata only, not audio) are stored in your browser's localStorage. You can delete this data at any time.</p>
                <p><strong className="text-white">Data Sharing:</strong> We do not share, sell, or transmit your voice data to any third parties.</p>
                <p><strong className="text-white">Your Rights:</strong> You have the right to access, delete, and port your data. You can withdraw consent at any time by revoking access and clearing all data.</p>
                <p><strong className="text-white">Compliance:</strong> We comply with GDPR (EU), CCPA (California), BIPA (Illinois), COPPA (Children's Privacy), and TCPA regulations.</p>
              </div>
            )}
          </div>

          {/* Terms of Service */}
          <div className="rounded-xl bg-white/5 border border-white/10 overflow-hidden">
            <button
              onClick={() => setShowTerms(!showTerms)}
              className="w-full p-4 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
            >
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                📜 Terms of Service
              </h3>
              <span className="text-gray-400">{showTerms ? '▼' : '▶'}</span>
            </button>
            {showTerms && (
              <div className="p-4 pt-0 text-xs text-gray-300 space-y-2 leading-relaxed">
                <p><strong className="text-white">Permitted Use:</strong> You may only upload or record voice data that you have the legal right to process. You must not use this service for illegal or unauthorized purposes.</p>
                <p><strong className="text-white">Accuracy Disclaimer:</strong> VoxForensics is a detection tool, not legal evidence. AI detection has inherent limitations and may produce false positives or negatives. Results should not be used as sole proof in legal proceedings.</p>
                <p><strong className="text-white">Age Requirement:</strong> You must be at least 18 years of age, or have obtained parental/guardian consent, to use this service in compliance with COPPA and applicable minor protection laws.</p>
                <p><strong className="text-white">Biometric Consent:</strong> By using this service, you provide explicit written consent for the collection and analysis of voice biometrics under Illinois BIPA and EU GDPR Article 9.</p>
                <p><strong className="text-white">Limitation of Liability:</strong> VoxForensics is provided "as is" without warranties. We are not liable for any damages arising from use of the service or reliance on detection results.</p>
              </div>
            )}
          </div>

          {/* Data Storage */}
          <div className="rounded-xl bg-white/5 border border-white/10 overflow-hidden">
            <button
              onClick={() => setShowStorage(!showStorage)}
              className="w-full p-4 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
            >
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                📦 Where is my data stored?
              </h3>
              <span className="text-gray-400">{showStorage ? '▼' : '▶'}</span>
            </button>
            {showStorage && (
              <div className="p-4 pt-0 text-xs text-gray-300 space-y-2 leading-relaxed">
                <p className="font-semibold text-cyan-300">🔒 Client-Side Only Processing</p>
                <p>VoxForensics operates entirely in your browser. No voice data is ever uploaded to external servers or cloud storage.</p>
                <ul className="space-y-2 ml-4 mt-2">
                  <li><strong className="text-white">📁 Uploaded Files:</strong> Processed in-memory using browser APIs. Files are never stored on disk or transmitted anywhere. Deleted immediately after processing.</li>
                  <li><strong className="text-white">🎙️ Recordings:</strong> Captured via MediaRecorder API and processed immediately. Audio data exists only in your browser's memory during the session.</li>
                  <li><strong className="text-white">📊 Analysis Results:</strong> Stored in your browser's localStorage under the key 'voxforensics_history'. This data never leaves your device. Only metadata (filename, timestamp, results) is stored - not the actual audio.</li>
                  <li><strong className="text-white">🗑️ Data Deletion:</strong> You can delete all analysis history at any time using the "Clear All" button in the History tab. This permanently removes data from localStorage.</li>
                  <li><strong className="text-white">🔐 No Server Storage:</strong> We do not operate servers that store voice data. All AI processing uses client-side JavaScript algorithms.</li>
                </ul>
                <p className="mt-3 text-yellow-300">
                  ⚠️ <strong>Important:</strong> While we don't store your data on servers, your browser's localStorage persists until you clear it. Use "Clear All" to remove analysis history.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Read Confirmation */}
        <div className="mb-6 p-4 rounded-xl bg-purple-500/5 border border-purple-500/20">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={hasReadAll}
              onChange={(e) => setHasReadAll(e.target.checked)}
              className="mt-1 w-4 h-4 rounded accent-purple-500"
            />
            <div className="flex-1">
              <p className="text-sm font-semibold text-white mb-1">
                I confirm that I have read and understood the above information
              </p>
              <p className="text-xs text-gray-400">
                Please expand and read all sections above before proceeding
              </p>
            </div>
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleAgree}
            disabled={!hasReadAll}
            className={`neon-btn flex-1 py-4 text-base font-semibold ${!hasReadAll ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            ✅ I Agree
          </button>
          <button
            onClick={handleDecline}
            className="neon-btn neon-btn-danger flex-1 py-4 text-base font-semibold"
          >
            ❌ I Don't Agree
          </button>
        </div>

        {!hasReadAll && (
          <p className="text-xs text-gray-500 text-center mt-3">
            Please confirm that you have read the agreement above
          </p>
        )}

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-white/10 text-center">
          <p className="text-xs text-gray-500">
            Agreement Version 1.0.0 | Last Updated: {new Date().toLocaleDateString()}
          </p>
          <p className="text-xs text-gray-600 mt-1">
            Compliant with GDPR, CCPA, BIPA, COPPA, and TCPA regulations
          </p>
        </div>
      </div>
    </div>
  );
}

export function hasGivenConsent(): boolean {
  try {
    const consent = localStorage.getItem('voxforensics_consent');
    if (!consent) return false;
    
    const data = JSON.parse(consent);
    return data.agreed === true;
  } catch {
    return false;
  }
}

export function revokeConsent(): void {
  localStorage.removeItem('voxforensics_consent');
}
