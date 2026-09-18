import { useState, createContext, useContext, ReactNode } from 'react';

interface ConsentContextType {
  hasConsented: boolean;
  giveConsent: () => void;
  revokeConsent: () => void;
}

const ConsentContext = createContext<ConsentContextType | null>(null);

export function useConsent() {
  const context = useContext(ConsentContext);
  if (!context) throw new Error('useConsent must be used within ConsentProvider');
  return context;
}

export function ConsentProvider({ children }: { children: ReactNode }) {
  const [hasConsented, setHasConsented] = useState(() => {
    const saved = localStorage.getItem('voxforensics_consent');
    return saved === 'true';
  });

  const giveConsent = () => {
    setHasConsented(true);
    localStorage.setItem('voxforensics_consent', 'true');
  };

  const revokeConsent = () => {
    setHasConsented(false);
    localStorage.removeItem('voxforensics_consent');
  };

  return (
    <ConsentContext.Provider value={{ hasConsented, giveConsent, revokeConsent }}>
      {children}
      {!hasConsented && <ConsentModal onAccept={giveConsent} />}
    </ConsentContext.Provider>
  );
}

export default function ConsentModal({ onAccept }: { onAccept: () => void }) {
  const [hasReadAll, setHasReadAll] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showStorage, setShowStorage] = useState(false);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ background: 'rgba(5, 9, 20, 0.95)', backdropFilter: 'blur(12px)' }}>
      <div className="glass-panel p-6 md:p-8 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#00d4ff] to-[#a855f7] flex items-center justify-center">
            <i className="fa-solid fa-shield-halved text-white text-2xl"></i>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Voice Data Usage Agreement</h2>
          <p className="text-sm text-gray-400">Please read the following before using our service</p>
        </div>

        <div className="p-4 rounded-xl bg-[#00d4ff]/5 border border-[#00d4ff]/20 mb-6">
          <p className="text-sm text-[#00d4ff] font-semibold mb-2">🔒 Your Privacy Matters</p>
          <p className="text-xs text-gray-300">
            VoxForensics processes voice recordings to detect AI-generated deepfake audio. 
            All processing happens locally in your browser. No data is sent to external servers.
          </p>
        </div>

        <div className="space-y-4 mb-6">
          <div className="p-4 rounded-xl bg-[#0a1128]/40 border border-[#1a2a4a]">
            <h3 className="text-sm font-semibold text-white mb-2">🎙️ Voice Data Usage</h3>
            <p className="text-xs text-gray-300">
              Your voice recordings are processed locally for deepfake detection. We extract acoustic features 
              (pitch, formants, spectral analysis) but never store or transmit your actual audio.
            </p>
          </div>

          <div className="rounded-xl bg-[#0a1128]/40 border border-[#1a2a4a] overflow-hidden">
            <button
              onClick={() => setShowPrivacy(!showPrivacy)}
              className="w-full p-4 flex items-center justify-between text-left hover:bg-[#1a2a4a]/20 transition"
            >
              <h3 className="text-sm font-semibold text-white">🔐 Privacy Policy</h3>
              <i className={`fa-solid fa-chevron-${showPrivacy ? 'up' : 'down'} text-gray-400`}></i>
            </button>
            {showPrivacy && (
              <div className="p-4 pt-0 text-xs text-gray-300 space-y-2">
                <p>• All processing occurs client-side in your browser</p>
                <p>• No voice data is transmitted to external servers</p>
                <p>• Analysis results stored only in your browser's localStorage</p>
                <p>• You can delete all data at any time</p>
                <p>• Compliant with GDPR, CCPA, BIPA regulations</p>
              </div>
            )}
          </div>

          <div className="rounded-xl bg-[#0a1128]/40 border border-[#1a2a4a] overflow-hidden">
            <button
              onClick={() => setShowTerms(!showTerms)}
              className="w-full p-4 flex items-center justify-between text-left hover:bg-[#1a2a4a]/20 transition"
            >
              <h3 className="text-sm font-semibold text-white">📜 Terms of Service</h3>
              <i className={`fa-solid fa-chevron-${showTerms ? 'up' : 'down'} text-gray-400`}></i>
            </button>
            {showTerms && (
              <div className="p-4 pt-0 text-xs text-gray-300 space-y-2">
                <p>• Only upload audio you have rights to process</p>
                <p>• This is a detection tool, not legal evidence</p>
                <p>• Must be 18+ or have parental consent</p>
                <p>• AI detection has inherent limitations</p>
              </div>
            )}
          </div>

          <div className="rounded-xl bg-[#0a1128]/40 border border-[#1a2a4a] overflow-hidden">
            <button
              onClick={() => setShowStorage(!showStorage)}
              className="w-full p-4 flex items-center justify-between text-left hover:bg-[#1a2a4a]/20 transition"
            >
              <h3 className="text-sm font-semibold text-white">📦 Data Storage</h3>
              <i className={`fa-solid fa-chevron-${showStorage ? 'up' : 'down'} text-gray-400`}></i>
            </button>
            {showStorage && (
              <div className="p-4 pt-0 text-xs text-gray-300 space-y-2">
                <p>• Uploaded files: Processed in-memory, never stored</p>
                <p>• Recordings: Processed immediately, not saved</p>
                <p>• Analysis history: Stored in localStorage only</p>
                <p>• No server storage, no cloud backup</p>
              </div>
            )}
          </div>
        </div>

        <div className="mb-6 p-4 rounded-xl bg-[#a855f7]/5 border border-[#a855f7]/20">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={hasReadAll}
              onChange={(e) => setHasReadAll(e.target.checked)}
              className="mt-1 w-4 h-4 rounded accent-[#a855f7]"
            />
            <div>
              <p className="text-sm font-semibold text-white">I confirm I have read and understood</p>
              <p className="text-xs text-gray-400">Please expand and read all sections above</p>
            </div>
          </label>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onAccept}
            disabled={!hasReadAll}
            className={`flex-1 neon-btn py-4 text-base font-semibold ${
              !hasReadAll ? 'opacity-50 cursor-not-allowed' : 'neon-btn-primary'
            }`}
          >
            ✅ I Agree
          </button>
        </div>

        {!hasReadAll && (
          <p className="text-xs text-gray-500 text-center mt-3">
            Please confirm you have read the agreement
          </p>
        )}
      </div>
    </div>
  );
}
