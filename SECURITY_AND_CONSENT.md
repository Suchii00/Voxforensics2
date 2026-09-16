# VoxForensics - Security, Consent & Storage Documentation

## 🛡️ Security Scanner

### Overview
VoxForensics includes a comprehensive security scanner that validates all uploaded files before processing to prevent malware, corrupted files, and security threats.

### Security Checks Performed

#### 1. **File Size Validation**
- **Maximum Size**: 50MB
- **Warning Threshold**: 25MB (warns about large files)
- **Empty File Detection**: Rejects 0-byte files
- **Corruption Check**: Flags files < 100 bytes as potentially corrupted

#### 2. **File Type Validation**
**Allowed Audio Formats:**
- WAV (`.wav`) - audio/wav
- MP3 (`.mp3`) - audio/mpeg, audio/mp3
- OGG (`.ogg`) - audio/ogg
- WebM (`.webm`) - audio/webm
- M4A (`.m4a`) - audio/m4a
- AAC (`.aac`) - audio/aac
- FLAC (`.flac`) - audio/flac

**Blocked File Types:**
- Executable files (.exe, .bat, .sh)
- Non-audio MIME types
- Files with suspicious extensions

#### 3. **File Signature Verification**
The scanner reads the first 1024 bytes to verify audio file signatures:
- **WAV**: RIFF header (0x52 0x49 0x46 0x46)
- **MP3**: Sync word (0xFF with specific bits)
- **OGG**: OggS marker (0x4F 0x67 0x67 0x53)
- **WebM**: EBML header (0x1A 0x45 0xDF 0xA3)

#### 4. **Suspicious Pattern Detection**
Flags files with suspicious names containing:
- "virus", "malware", "trojan", "hack", "exploit"

#### 5. **Threat Classification**
**Threats (Block Processing):**
- File exceeds size limit
- Invalid file type
- Executable content detected
- Empty file

**Warnings (Allow with Notice):**
- Large file size (>25MB)
- Suspicious filename
- File signature mismatch
- Potentially corrupted file

### Security Scan Results Display
When a file is uploaded, users see:
- ✅ Green status if file is safe
- ❌ Red status if threats detected
- File information (name, size, type)
- List of specific threats or warnings
- Scan completion time

---

## 📋 Voice Data Consent System

### Legal Compliance
VoxForensics complies with:
- **GDPR** (EU General Data Protection Regulation)
- **CCPA** (California Consumer Privacy Act)
- **BIPA** (Illinois Biometric Information Privacy Act)
- **COPPA** (Children's Online Privacy Protection Act)
- **TCPA** (Telephone Consumer Protection Act)

### Required Consents

#### 1. **Voice Data Collection Consent** ⭐ Required
```
I consent to VoxForensics collecting and processing my voice recordings 
for the sole purpose of deepfake audio detection. I understand that voice 
recordings contain biometric information and will be processed locally in 
my browser.
```

#### 2. **Data Processing Agreement** ⭐ Required
```
I agree that my voice data will be processed using AI algorithms to extract 
acoustic features (pitch, formants, spectral analysis) for deepfake detection. 
I understand that no voice data is transmitted to external servers or stored 
permanently.
```

#### 3. **Biometric Data Consent (BIPA/GDPR)** ⭐ Required
```
I acknowledge that voice recordings constitute biometric identifier information 
under Illinois BIPA and EU GDPR Article 9. I provide explicit written consent 
for the collection and analysis of my voice biometrics for deepfake detection 
purposes only.
```

#### 4. **Privacy Policy Acknowledgment** ⭐ Required
Users must acknowledge:
- All processing occurs locally in browser (client-side)
- No voice data is uploaded to external servers
- Analysis history is stored only in browser's localStorage
- User can delete all data at any time
- No personal information is collected or transmitted

#### 5. **Terms of Service Agreement** ⭐ Required
Users agree to:
- Only upload/record voice data they have rights to process
- Not use the service for illegal or unauthorized purposes
- Understand this is a detection tool, not legal evidence
- Accept that AI detection has inherent limitations

#### 6. **Age Verification** ⭐ Required
```
I confirm that I am at least 18 years of age, or I have obtained 
parental/guardian consent to use this service in compliance with COPPA 
and applicable minor protection laws.
```

### Consent Storage
- Stored in `localStorage` under key: `voxforensics_consent`
- Includes timestamp and version number
- All 6 consents must be accepted to proceed
- Consent can be revoked at any time

### Consent Revocation
Users can revoke consent via:
1. Click "🔐 Revoke Consent & Clear Data" button
2. Confirmation dialog appears
3. All data is cleared:
   - Consent record deleted
   - Analysis history cleared
   - User must re-accept consent to continue

---

## 📦 File Storage & Data Handling

### Where Files Are Stored

#### 🚫 **NOT Stored:**
- ❌ Uploaded audio files
- ❌ Recorded audio
- ❌ Voice data
- ❌ Personal information
- ❌ Analysis results on servers

#### ✅ **Stored Locally (Browser Only):**

##### 1. **Uploaded Files**
- **Location**: Browser memory (RAM) only
- **Duration**: Temporary, exists only during processing
- **Persistence**: None - deleted after analysis
- **Network**: Never transmitted

##### 2. **Recordings**
- **Location**: Browser memory via MediaRecorder API
- **Duration**: Temporary, exists only during session
- **Persistence**: None - processed immediately
- **Network**: Never transmitted

##### 3. **Analysis History**
- **Location**: Browser's `localStorage`
- **Key**: `voxforensics_history`
- **Format**: JSON array of scan records
- **Data Stored**:
  ```json
  {
    "id": "unique_id",
    "filename": "recording_1234567890.webm",
    "timestamp": "2024-01-15T10:30:00.000Z",
    "result": {
      "isDeepfake": true,
      "confidence": 0.87,
      "features": {...},
      "explanation": [...]
    },
    "duration": 5.2
  }
  ```
- **Size Limit**: ~5MB (browser dependent)
- **Persistence**: Until user clears it or clears browser data

##### 4. **Consent Data**
- **Location**: Browser's `localStorage`
- **Key**: `voxforensics_consent`
- **Format**: JSON object
- **Data Stored**:
  ```json
  {
    "voiceDataCollection": true,
    "dataProcessing": true,
    "privacyPolicy": true,
    "termsOfService": true,
    "biometricConsent": true,
    "ageVerification": true,
    "timestamp": "2024-01-15T10:30:00.000Z",
    "version": "1.0.0"
  }
  ```

### Data Flow Diagram

```
User Uploads File
       ↓
[Security Scanner] ← Checks file type, size, signatures
       ↓
[Browser Memory] ← File loaded into RAM
       ↓
[Audio Processing] ← Extract features client-side
       ↓
[AI Analysis] ← Run detection algorithms
       ↓
[Results Display] ← Show to user
       ↓
[localStorage] ← Save analysis metadata only
       ↓
[File Deleted] ← Original file removed from memory
```

### Privacy Guarantees

#### 🔒 **Client-Side Only**
- All processing happens in the user's browser
- No server infrastructure for voice data
- No cloud storage or databases
- No third-party analytics or tracking

#### 🔐 **No Data Transmission**
- Zero network requests for audio processing
- No API calls to external services
- No telemetry or usage tracking
- No cookies for data collection

#### 🗑️ **User Control**
- Users can delete all history anytime
- Consent can be revoked at any time
- Clear browser data removes everything
- No data recovery possible after deletion

#### 📊 **Minimal Data Storage**
- Only metadata stored (not audio)
- Analysis results are lightweight
- No personally identifiable information
- No biometric templates stored

### Storage Usage Example

**Typical User Session:**
```
localStorage Usage:
├── voxforensics_consent: ~0.5 KB
├── voxforensics_history: ~50 KB (10 scans)
└── Total: ~50.5 KB

Browser Memory (Temporary):
├── Audio file: ~2 MB (during processing)
├── Waveform data: ~100 KB
├── Spectrogram data: ~50 KB
└── Total: ~2.15 MB (deleted after processing)
```

### Data Deletion Methods

#### 1. **Clear Analysis History**
- Navigate to History tab
- Click "🗑 Clear All" button
- Confirms deletion
- Removes all scan records

#### 2. **Revoke Consent**
- Click "🔐 Revoke Consent & Clear Data"
- Confirms action
- Deletes consent record
- Clears all history
- Requires re-consent to continue

#### 3. **Clear Browser Data**
- Use browser's "Clear browsing data" feature
- Select "Local storage" or "Site data"
- Removes all VoxForensics data
- Complete data wipe

#### 4. **Individual Deletion**
- Go to History tab
- Click "🗑️ Delete" on specific item
- Removes only that scan
- Other data preserved

---

## 🔍 Security Best Practices

### For Users

#### ✅ **Do:**
- Review security scan results before processing
- Use the "View Storage Details" button to monitor data
- Regularly clear history if concerned about privacy
- Revoke consent if you no longer use the service
- Keep browser updated for latest security patches

#### ❌ **Don't:**
- Upload files from untrusted sources
- Share your device with others without clearing data
- Ignore security warnings
- Use on shared/public computers without clearing data
- Store sensitive voice recordings

### For Developers

#### Security Implementation:
```typescript
// File validation before processing
const validateFile = (file: File): ValidationResult => {
  // Check size
  if (file.size > MAX_SIZE) return { valid: false, error: 'Too large' };
  
  // Check type
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { valid: false, error: 'Invalid type' };
  }
  
  // Check signature
  const buffer = await file.slice(0, 1024).arrayBuffer();
  if (!hasValidSignature(buffer)) {
    return { valid: false, error: 'Invalid signature' };
  }
  
  return { valid: true };
};
```

#### Consent Management:
```typescript
// Check consent before processing
if (!hasGivenConsent()) {
  showConsentModal();
  return;
}

// Revoke consent
const revokeConsent = () => {
  localStorage.removeItem('voxforensics_consent');
  localStorage.removeItem('voxforensics_history');
  // Force re-consent
};
```

---

## 📞 Support & Questions

### Common Questions

**Q: Is my voice data safe?**
A: Yes. All processing occurs in your browser. No data is transmitted to servers.

**Q: Can other users access my data?**
A: No. Data is stored locally in your browser's localStorage, which is isolated per device.

**Q: What happens if I clear my browser data?**
A: All VoxForensics data (history, consent) will be deleted. You'll need to re-accept consent.

**Q: Can I export my analysis history?**
A: Yes. Use the "📥 Download PDF" button to export individual reports.

**Q: Is this compliant with GDPR?**
A: Yes. VoxForensics follows GDPR principles: data minimization, user consent, right to deletion, and transparency.

**Q: What if someone uses my device?**
A: They would need to accept consent again if you revoke it. Clear history regularly on shared devices.

### Contact
For privacy concerns or security issues, please refer to the in-app consent modal which contains full legal text and contact information.

---

## 📝 Version History

**v1.0.0** (Current)
- Initial consent system implementation
- Security scanner with file validation
- Client-side only processing
- GDPR/BIPA/CCPA compliance
- Comprehensive data deletion options

**Last Updated**: 2024
**Next Review**: Quarterly
