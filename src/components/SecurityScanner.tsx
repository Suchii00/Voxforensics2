import { useState } from 'react';

interface SecurityScanResult {
  filename: string;
  size: number;
  type: string;
  isValid: boolean;
  threats: string[];
  warnings: string[];
  scanTime: number;
}

export default function SecurityScanner({ file, onScanComplete }: { 
  file: File | null; 
  onScanComplete: (result: SecurityScanResult) => void;
}) {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<SecurityScanResult | null>(null);

  const scanFile = async (fileToScan: File) => {
    setIsScanning(true);
    const startTime = Date.now();
    const threats: string[] = [];
    const warnings: string[] = [];

    // 1. File size check (max 50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (fileToScan.size > maxSize) {
      threats.push('File exceeds maximum size limit (50MB)');
    } else if (fileToScan.size > 25 * 1024 * 1024) {
      warnings.push('Large file size (>25MB) - may affect processing speed');
    }

    // 2. File type validation
    const allowedTypes = ['audio/wav', 'audio/mp3', 'audio/mpeg', 'audio/ogg', 'audio/webm', 'audio/m4a', 'audio/aac', 'audio/flac'];
    const validAudioExtensions = ['.wav', '.mp3', '.ogg', '.webm', '.m4a', '.aac', '.flac'];
    
    const fileExtension = '.' + fileToScan.name.split('.').pop()?.toLowerCase();
    const isValidType = allowedTypes.includes(fileToScan.type) || validAudioExtensions.includes(fileExtension);
    
    if (!isValidType) {
      threats.push(`Invalid file type: ${fileToScan.type || fileExtension}`);
    }

    // 3. Check for executable content
    if (fileToScan.type.includes('executable') || 
        fileToScan.name.endsWith('.exe') || 
        fileToScan.name.endsWith('.bat') ||
        fileToScan.name.endsWith('.sh')) {
      threats.push('Executable file detected - potential security risk');
    }

    // 4. Check for suspicious file names
    const suspiciousPatterns = ['virus', 'malware', 'trojan', 'hack', 'exploit'];
    const lowerName = fileToScan.name.toLowerCase();
    if (suspiciousPatterns.some(pattern => lowerName.includes(pattern))) {
      warnings.push('Suspicious filename pattern detected');
    }

    // 5. File integrity check (read first bytes)
    try {
      const buffer = await fileToScan.slice(0, 1024).arrayBuffer();
      const bytes = new Uint8Array(buffer);
      
      // Check for audio file signatures
      const isWav = bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46; // RIFF
      const isMp3 = bytes[0] === 0xFF && (bytes[1] & 0xE0) === 0xE0; // MP3 sync
      const isOgg = bytes[0] === 0x4F && bytes[1] === 0x67 && bytes[2] === 0x67 && bytes[3] === 0x53; // OggS
      const isWebM = bytes[0] === 0x1A && bytes[1] === 0x45 && bytes[2] === 0xDF && bytes[3] === 0xA3; // WebM
      
      const hasValidSignature = isWav || isMp3 || isOgg || isWebM || fileToScan.type.startsWith('audio/');
      
      if (!hasValidSignature && threats.length === 0) {
        warnings.push('File signature does not match expected audio format');
      }
    } catch (err) {
      warnings.push('Unable to verify file integrity');
    }

    // 6. Check for zero-byte file
    if (fileToScan.size === 0) {
      threats.push('Empty file detected');
    }

    // 7. Check for corrupted file (very small but not empty)
    if (fileToScan.size > 0 && fileToScan.size < 100) {
      warnings.push('File appears to be corrupted or incomplete');
    }

    const scanTime = Date.now() - startTime;
    const isValid = threats.length === 0;

    const result: SecurityScanResult = {
      filename: fileToScan.name,
      size: fileToScan.size,
      type: fileToScan.type,
      isValid,
      threats,
      warnings,
      scanTime
    };

    setScanResult(result);
    setIsScanning(false);
    onScanComplete(result);
  };

  // Auto-scan when file is provided
  if (file && !scanResult && !isScanning) {
    scanFile(file);
  }

  if (!file && !scanResult) {
    return null;
  }

  return (
    <div className="glass-card p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          🛡️ Security Scan
        </h3>
        {isScanning && (
          <div className="spinner w-4 h-4"></div>
        )}
      </div>

      {scanResult && (
        <div className="space-y-2">
          {/* Status */}
          <div className={`p-3 rounded-lg border ${
            scanResult.isValid 
              ? 'bg-green-500/10 border-green-500/30' 
              : 'bg-red-500/10 border-red-500/30'
          }`}>
            <div className="flex items-center gap-2">
              <span className="text-lg">
                {scanResult.isValid ? '✅' : '❌'}
              </span>
              <div>
                <p className={`text-sm font-medium ${
                  scanResult.isValid ? 'text-green-400' : 'text-red-400'
                }`}>
                  {scanResult.isValid ? 'File is safe' : 'Security threat detected'}
                </p>
                <p className="text-xs text-gray-400">
                  Scanned in {scanResult.scanTime}ms
                </p>
              </div>
            </div>
          </div>

          {/* File Info */}
          <div className="text-xs text-gray-400 space-y-1">
            <p><span className="text-gray-500">File:</span> {scanResult.filename}</p>
            <p><span className="text-gray-500">Size:</span> {(scanResult.size / 1024).toFixed(2)} KB</p>
            <p><span className="text-gray-500">Type:</span> {scanResult.type || 'Unknown'}</p>
          </div>

          {/* Threats */}
          {scanResult.threats.length > 0 && (
            <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/20">
              <p className="text-xs font-semibold text-red-400 mb-2">⚠️ Threats Detected:</p>
              <ul className="text-xs text-red-300 space-y-1">
                {scanResult.threats.map((threat, i) => (
                  <li key={i}>• {threat}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Warnings */}
          {scanResult.warnings.length > 0 && (
            <div className="p-3 rounded-lg bg-yellow-500/5 border border-yellow-500/20">
              <p className="text-xs font-semibold text-yellow-400 mb-2">⚡ Warnings:</p>
              <ul className="text-xs text-yellow-300 space-y-1">
                {scanResult.warnings.map((warning, i) => (
                  <li key={i}>• {warning}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export type { SecurityScanResult };
