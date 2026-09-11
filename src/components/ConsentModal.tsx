import { useState, useEffect } from 'react';

interface ConsentData {
  voiceDataCollection: boolean;
  dataProcessing: boolean;
  privacyPolicy: boolean;
  termsOfService: boolean;
  biometricConsent: boolean;
  ageVerification: boolean;
  timestamp: string;
  version: string;
}

export default function ConsentModal({ onAccept, onDecline }: { 
  onAccept: () => void; 
  onDecline: () => void;
}) {
  const [consents, setConsents] = useState<ConsentData>({
    voiceDataCollection: false,
    dataProcessing: false,
    privacyPolicy: false,
    termsOfService: false,
    biometricConsent: false,
    ageVerification: false,
    timestamp: '',
    version: '1.0.0'
  });

  const [showDetails, setShowDetails] = useState(false);

  const allConsentsGiven = Object.values(consents).every(v => v === true || typeof v === 'string');

  const handleAccept = () => {
    const consentData = {
      ...consents,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem('voxforensics_consent', JSON.stringify(consentData));
    onAccept();
  };

  const handleDecline = () => {
    onDecline();
  };

  const toggleConsent = (key: keyof ConsentData) => {
    if (typeof consents[key] === 'boolean') {
      setConsents(prev => ({ ...prev, [key]: !prev[key] }));
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ background: 'rgba(3, 7, 18, 0.95)', backdropFilter: 'blur(12px)' }}>
      <div className="glass-card p-6 md:p-8 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="hero-title text-4xl mb-3">VoxForensics</h1>
          <h2 className="text-xl font-bold text-white mb-2">Voice Data Consent & Privacy Agreement</h2>
          <p className="text-sm text-gray-400">Please read carefully before using our AI deepfake detection service</p>
        </div>

        {/* Important Notice */}
        <div className="p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/20 mb-6">
          <p className="text-sm text-cyan-300 font-semibold mb-2">🔒 Your Privacy Matters</p>
          <p className="text-xs text-gray-300">
            VoxForensics processes voice recordings to detect AI-generated deepfake audio. 
            Voice data is considered biometric information under GDPR, BIPA, and other privacy laws. 
            We require your explicit consent before processing any voice data.
          </p>
        </div>

        {/* Consent Checkboxes */}
        <div className="space-y-4 mb-6">
          {/* 1. Voice Data Collection */}
          <label className="flex items-start gap-3 p-4 rounded-xl bg-white/5 border border-white/10 cursor-pointer hover:border-cyan-500/30 transition-all">
            <input
              type="checkbox"
              checked={consents.voiceDataCollection as boolean}
              onChange={() => toggleConsent('voiceDataCollection')}
              className="mt-1 w-4 h-4 rounded"
            />
            <div className="flex-1">
              <p className="text-sm font-semibold text-white mb-1">
                Voice Data Collection Consent <span className="text-red-400">*</span>
              </p>
              <p className="text-xs text-gray-400">
                I consent to VoxForensics collecting and processing my voice recordings for the sole purpose of 
                deepfake audio detection. I understand that voice recordings contain biometric information and 
                will be processed locally in my browser.
              </p>
            </div>
          </label>

          {/* 2. Data Processing */}
          <label className="flex items-start gap-3 p-4 rounded-xl bg-white/5 border border-white/10 cursor-pointer hover:border-cyan-500/30 transition-all">
            <input
              type="checkbox"
              checked={consents.dataProcessing as boolean}
              onChange={() => toggleConsent('dataProcessing')}
              className="mt-1 w-4 h-4 rounded"
            />
            <div className="flex-1">
              <p className="text-sm font-semibold text-white mb-1">
                Data Processing Agreement <span className="text-red-400">*</span>
              </p>
              <p className="text-xs text-gray-400">
                I agree that my voice data will be processed using AI algorithms to extract acoustic features 
                (pitch, formants, spectral analysis) for deepfake detection. I understand that no voice data 
                is transmitted to external servers or stored permanently.
              </p>
            </div>
          </label>

          {/* 3. Biometric Consent */}
          <label className="flex items-start gap-3 p-4 rounded-xl bg-white/5 border border-white/10 cursor-pointer hover:border-cyan-500/30 transition-all">
            <input
              type="checkbox"
              checked={consents.biometricConsent as boolean}
              onChange={() => toggleConsent('biometricConsent')}
              className="mt-1 w-4 h-4 rounded"
            />
            <div className="flex-1">
              <p className="text-sm font-semibold text-white mb-1">
                Biometric Data Consent (BIPA/GDPR) <span className="text-red-400">*</span>
              </p>
              <p className="text-xs text-gray-400">
                I acknowledge that voice recordings constitute biometric identifier information under 
                Illinois BIPA and EU GDPR Article 9. I provide explicit written consent for the collection 
                and analysis of my voice biometrics for deepfake detection purposes only.
              </p>
            </div>
          </label>

          {/* 4. Privacy Policy */}
          <label className="flex items-start gap-3 p-4 rounded-xl bg-white/5 border border-white/10 cursor-pointer hover:border-cyan-500/30 transition-all">
            <input
              type="checkbox"
              checked={consents.privacyPolicy as boolean}
              onChange={() => toggleConsent('privacyPolicy')}
              className="mt-1 w-4 h-4 rounded"
            />
            <div className="flex-1">
              <p className="text-sm font-semibold text-white mb-1">
                Privacy Policy Acknowledgment <span className="text-red-400">*</span>
              </p>
              <p className="text-xs text-gray-400">
                I have read and agree to the Privacy Policy. I understand that:
              </p>
              <ul className="text-xs text-gray-400 mt-2 space-y-1 ml-4 list-disc">
                <li>All processing occurs locally in my browser (client-side)</li>
                <li>No voice data is uploaded to external servers</li>
                <li>Analysis history is stored only in my browser's localStorage</li>
                <li>I can delete all data at any time using the "Clear All" feature</li>
                <li>No personal information is collected or transmitted</li>
              </ul>
            </div>
          </label>

          {/* 5. Terms of Service */}
          <label className="flex items-start gap-3 p-4 rounded-xl bg-white/5 border border-white/10 cursor-pointer hover:border-cyan-500/30 transition-all">
            <input
              type="checkbox"
              checked={consents.termsOfService as boolean}
              onChange={() => toggleConsent('termsOfService')}
              className="mt-1 w-4 h-4 rounded"
            />
            <div className="flex-1">
              <p className="text-sm font-semibold text-white mb-1">
                Terms of Service Agreement <span className="text-red-400">*</span>
              </p>
              <p className="text-xs text-gray-400">
                I agree to the Terms of Service, including:
              </p>
              <ul className="text-xs text-gray-400 mt-2 space-y-1 ml-4 list-disc">
                <li>I will only upload/record voice data I have rights to process</li>
                <li>I will not use this service for illegal or unauthorized purposes</li>
                <li>I understand this is a detection tool, not legal evidence</li>
                <li>I accept that AI detection has inherent limitations and may produce false results</li>
              </ul>
            </div>
          </label>

          {/* 6. Age Verification */}
          <label className="flex items-start gap-3 p-4 rounded-xl bg-white/5 border border-white/10 cursor-pointer hover:border-cyan-500/30 transition-all">
            <input
              type="checkbox"
              checked={consents.ageVerification as boolean}
              onChange={() => toggleConsent('ageVerification')}
              className="mt-1 w-4 h-4 rounded"
            />
            <div className="flex-1">
              <p className="text-sm font-semibold text-white mb-1">
                Age Verification <span className="text-red-400">*</span>
              </p>
              <p className="text-xs text-gray-400">
                I confirm that I am at least 18 years of age, or I have obtained parental/guardian consent 
                to use this service in compliance with COPPA and applicable minor protection laws.
              </p>
            </div>
          </label>
        </div>

        {/* Data Storage Information */}
        <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/20 mb-6">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="w-full flex items-center justify-between text-left"
          >
            <p className="text-sm font-semibold text-purple-300">
              📦 Where is my data stored?
            </p>
            <span className="text-purple-300">{showDetails ? '▼' : '▶'}</span>
          </button>
          
          {showDetails && (
            <div className="mt-3 text-xs text-gray-300 space-y-2">
              <p className="font-semibold text-white">🔒 Client-Side Only Processing</p>
              <p>
                <strong>VoxForensics operates entirely in your browser.</strong> No voice data is ever uploaded 
                to external servers or cloud storage.
              </p>
              <ul className="space-y-2 ml-4 mt-2">
                <li>
                  <strong>📁 Uploaded Files:</strong> Processed in-memory using browser APIs. 
                  Files are never stored on disk or transmitted anywhere.
                </li>
                <li>
                  <strong>🎙️ Recordings:</strong> Captured via MediaRecorder API and processed immediately. 
                  Audio data exists only in your browser's memory during the session.
                </li>
                <li>
                  <strong>📊 Analysis Results:</strong> Stored in your browser's localStorage under the key 
                  'voxforensics_history'. This data never leaves your device.
                </li>
                <li>
                  <strong>🗑️ Data Deletion:</strong> You can delete all analysis history at any time using 
                  the "Clear All" button in the History tab. This permanently removes data from localStorage.
                </li>
                <li>
                  <strong>🔐 No Server Storage:</strong> We do not operate servers that store voice data. 
                  All AI processing uses client-side JavaScript algorithms.
                </li>
              </ul>
              <p className="mt-3 text-yellow-300">
                ⚠️ <strong>Important:</strong> While we don't store your data, your browser's localStorage 
                persists until you clear it. Use "Clear All" to remove analysis history.
              </p>
            </div>
          )}
        </div>

        {/* Your Rights */}
        <div className="p-4 rounded-xl bg-green-500/5 border border-green-500/20 mb-6">
          <p className="text-sm font-semibold text-green-300 mb-2">✅ Your Rights (GDPR/CCPA)</p>
          <ul className="text-xs text-gray-300 space-y-1">
            <li>• <strong>Right to Access:</strong> View all stored analysis history</li>
            <li>• <strong>Right to Delete:</strong> Remove all data with "Clear All" button</li>
            <li>• <strong>Right to Portability:</strong> Export reports as PDF</li>
            <li>• <strong>Right to Withdraw Consent:</strong> Stop using the service at any time</li>
            <li>• <strong>Right to Information:</strong> Full transparency about data handling</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleAccept}
            disabled={!allConsentsGiven}
            className={`neon-btn flex-1 py-3 ${!allConsentsGiven ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            ✅ Accept & Continue
          </button>
          <button
            onClick={handleDecline}
            className="neon-btn neon-btn-danger flex-1 py-3"
          >
            ❌ Decline
          </button>
        </div>

        {!allConsentsGiven && (
          <p className="text-xs text-red-400 text-center mt-3">
            Please accept all required consents to continue
          </p>
        )}

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-white/10 text-center">
          <p className="text-xs text-gray-500">
            Consent Version 1.0.0 | Last Updated: {new Date().toLocaleDateString()}
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
    return data.voiceDataCollection && 
           data.dataProcessing && 
           data.privacyPolicy && 
           data.termsOfService && 
           data.biometricConsent && 
           data.ageVerification;
  } catch {
    return false;
  }
}

export function revokeConsent(): void {
  localStorage.removeItem('voxforensics_consent');
}
