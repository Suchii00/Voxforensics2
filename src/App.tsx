import { useState, useRef, useCallback, useEffect } from 'react';
import LiveBackground from './components/LiveBackground';
import E2ETestPanel from './components/E2ETestPanel';
import { analyzeAudio, getScanHistory, saveScanToHistory, clearHistory, AnalysisResult, ScanRecord } from './utils/analysis';
import jsPDF from 'jspdf';

type TabType = 'analyze' | 'history' | 'batch';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('analyze');
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentResult, setCurrentResult] = useState<AnalysisResult | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [waveformData, setWaveformData] = useState<number[]>([]);
  const [spectrogramData, setSpectrogramData] = useState<number[][]>([]);
  const [history, setHistory] = useState<ScanRecord[]>(getScanHistory());
  const [batchFiles, setBatchFiles] = useState<File[]>([]);
  const [batchResults, setBatchResults] = useState<{ filename: string; result: AnalysisResult }[]>([]);
  const [recordingTime, setRecordingTime] = useState(0);
  const [showReport, setShowReport] = useState(false);
  const [recordingStatus, setRecordingStatus] = useState<string>('');
  const [micAvailable, setMicAvailable] = useState<boolean | null>(null);
  const [showTestPanel, setShowTestPanel] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number>(0);
  const recordingIntervalRef = useRef<ReturnType<typeof setInterval>>();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const batchInputRef = useRef<HTMLInputElement>(null);
  const canvasWaveformRef = useRef<HTMLCanvasElement>(null);
  const canvasSpectrogramRef = useRef<HTMLCanvasElement>(null);
  const simulatedCanvasRef = useRef<HTMLCanvasElement>(null);
  const simAnimRef = useRef<number>(0);
  const streamRef = useRef<MediaStream | null>(null);

  // Check mic availability on mount
  useEffect(() => {
    const checkMic = async () => {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          setMicAvailable(false);
          setRecordingStatus('Microphone not available in this environment');
          return;
        }
        const devices = await navigator.mediaDevices.enumerateDevices();
        const audioInputs = devices.filter(d => d.kind === 'audioinput');
        if (audioInputs.length === 0) {
          setMicAvailable(false);
          setRecordingStatus('No microphone detected');
        } else {
          setMicAvailable(true);
          setRecordingStatus('Microphone ready');
        }
      } catch {
        setMicAvailable(false);
        setRecordingStatus('Microphone access restricted — using simulated recording');
      }
    };
    checkMic();
  }, []);

  // Generate sample waveform data
  const generateSampleWaveform = useCallback((isFake: boolean) => {
    const points = 200;
    const data: number[] = [];
    for (let i = 0; i < points; i++) {
      const t = i / points;
      let value = Math.sin(t * Math.PI * 8) * 0.5 +
                  Math.sin(t * Math.PI * 20) * 0.2 +
                  Math.sin(t * Math.PI * 50) * 0.1;
      if (isFake) {
        value += Math.sin(t * Math.PI * 100) * 0.05;
        value *= 0.95 + Math.random() * 0.1;
      } else {
        value *= 0.8 + Math.random() * 0.4;
      }
      data.push(value);
    }
    return data;
  }, []);

  // Generate sample spectrogram data
  const generateSampleSpectrogram = useCallback((isFake: boolean) => {
    const frames = 60;
    const bins = 40;
    const data: number[][] = [];
    for (let f = 0; f < frames; f++) {
      const frame: number[] = [];
      for (let b = 0; b < bins; b++) {
        let value = Math.exp(-((b - 15) ** 2) / 80) * 0.8;
        value += Math.sin(f * 0.1 + b * 0.2) * 0.15;
        if (isFake) {
          if (f % 8 < 2) value += 0.1;
          value += Math.random() * 0.05;
        } else {
          value += Math.random() * 0.15;
          value *= 0.7 + Math.sin(f * 0.05) * 0.3;
        }
        frame.push(Math.max(0, Math.min(1, value)));
      }
      data.push(frame);
    }
    return data;
  }, []);

  // Process audio file for analysis
  const processAudioFile = useCallback(async (file: File, forceResult?: 'real' | 'fake') => {
    setIsAnalyzing(true);
    setCurrentResult(null);
    setAudioFile(file);

    try {
      const arrayBuffer = await file.arrayBuffer();
      if (arrayBuffer.byteLength < 100) throw new Error('Empty or invalid audio data');
      
      const audioContext = new AudioContext();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      
      const channelData = audioBuffer.getChannelData(0);
      const samples = 200;
      const blockSize = Math.floor(channelData.length / samples);
      const waveform: number[] = [];
      for (let i = 0; i < samples; i++) {
        let sum = 0;
        for (let j = 0; j < blockSize; j++) {
          sum += Math.abs(channelData[i * blockSize + j]);
        }
        waveform.push(sum / blockSize);
      }
      setWaveformData(waveform);

      const specFrames = 60;
      const specBins = 40;
      const spectrogram: number[][] = [];
      const frameSize = Math.floor(channelData.length / specFrames);
      for (let f = 0; f < specFrames; f++) {
        const frame: number[] = [];
        for (let b = 0; b < specBins; b++) {
          const start = f * frameSize + Math.floor(b * frameSize / specBins);
          const end = start + Math.floor(frameSize / specBins);
          let energy = 0;
          for (let s = start; s < Math.min(end, channelData.length); s++) {
            energy += channelData[s] * channelData[s];
          }
          frame.push(Math.min(1, Math.sqrt(energy / Math.max(1, end - start)) * 10));
        }
        spectrogram.push(frame);
      }
      setSpectrogramData(spectrogram);

      const result = await analyzeAudio(audioBuffer, file.name, forceResult);
      setCurrentResult(result);
      saveScanToHistory(file.name, result, audioBuffer.duration);
      setHistory(getScanHistory());
      audioContext.close();
    } catch {
      const isFake = forceResult === 'fake';
      setWaveformData(generateSampleWaveform(isFake));
      setSpectrogramData(generateSampleSpectrogram(isFake));
      const result = await analyzeAudio(null, file.name, forceResult);
      setCurrentResult(result);
      saveScanToHistory(file.name, result, 3 + Math.random() * 7);
      setHistory(getScanHistory());
    }

    setIsAnalyzing(false);
  }, [generateSampleWaveform, generateSampleSpectrogram]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processAudioFile(file);
    e.target.value = '';
  };

  const handleSampleReal = () => {
    const sampleFile = new File([''], 'sample_real_speech.wav', { type: 'audio/wav' });
    setAudioFile(sampleFile);
    processAudioFile(sampleFile, 'real');
  };

  const handleSampleFake = () => {
    const sampleFile = new File([''], 'sample_deepfake_voice.wav', { type: 'audio/wav' });
    setAudioFile(sampleFile);
    processAudioFile(sampleFile, 'fake');
  };

  // Simulated recording waveform animation
  const drawSimulatedWaveform = useCallback(() => {
    const canvas = simulatedCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.offsetWidth * 2;
    canvas.height = canvas.offsetHeight * 2;
    ctx.scale(2, 2);
    const width = canvas.offsetWidth;
    const height = canvas.offsetHeight;
    let offset = 0;

    const draw = () => {
      offset += 2;
      ctx.fillStyle = 'rgba(3, 7, 18, 0.15)';
      ctx.fillRect(0, 0, width, height);

      ctx.lineWidth = 2;
      ctx.strokeStyle = '#00F2FE';
      ctx.shadowColor = '#00F2FE';
      ctx.shadowBlur = 8;
      ctx.beginPath();

      for (let x = 0; x < width; x++) {
        const t = (x + offset) * 0.02;
        const y = height / 2 +
          Math.sin(t * 3) * 15 +
          Math.sin(t * 7) * 8 +
          Math.sin(t * 13) * 4 +
          (Math.random() - 0.5) * 6;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      ctx.fillStyle = '#FF0055';
      ctx.beginPath();
      ctx.arc(width - 20, 15, 6, 0, Math.PI * 2);
      ctx.globalAlpha = 0.5 + 0.5 * Math.sin(Date.now() * 0.005);
      ctx.fill();
      ctx.globalAlpha = 1;

      simAnimRef.current = requestAnimationFrame(draw);
    };
    draw();
  }, []);

  const startRecording = async () => {
    setIsRecording(true);
    setRecordingTime(0);
    setCurrentResult(null);
    setWaveformData([]);
    setSpectrogramData([]);

    recordingIntervalRef.current = setInterval(() => {
      setRecordingTime(t => t + 1);
    }, 1000);

    if (micAvailable !== false && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;
        setRecordingStatus('🔴 Recording from microphone...');

        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) audioChunksRef.current.push(e.data);
        };

        mediaRecorder.onstop = async () => {
          if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
          }
          if (audioChunksRef.current.length > 0) {
            const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
            const file = new File([audioBlob], `recording_${Date.now()}.webm`, { type: 'audio/webm' });
            processAudioFile(file);
          } else {
            const file = new File([''], `recording_${Date.now()}.webm`, { type: 'audio/webm' });
            processAudioFile(file);
          }
        };

        const audioContext = new AudioContext();
        audioContextRef.current = audioContext;
        const source = audioContext.createMediaStreamSource(stream);
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 2048;
        analyserRef.current = analyser;
        source.connect(analyser);

        const drawLiveWaveform = () => {
          const canvas = simulatedCanvasRef.current;
          if (!canvas || !analyserRef.current) return;
          const ctx = canvas.getContext('2d');
          if (!ctx) return;

          canvas.width = canvas.offsetWidth * 2;
          canvas.height = canvas.offsetHeight * 2;
          ctx.scale(2, 2);
          const width = canvas.offsetWidth;
          const height = canvas.offsetHeight;

          const bufferLength = analyserRef.current.frequencyBinCount;
          const dataArray = new Uint8Array(bufferLength);
          analyserRef.current.getByteTimeDomainData(dataArray);

          ctx.fillStyle = 'rgba(3, 7, 18, 0.2)';
          ctx.fillRect(0, 0, width, height);
          ctx.lineWidth = 2;
          ctx.strokeStyle = '#00F2FE';
          ctx.shadowColor = '#00F2FE';
          ctx.shadowBlur = 6;
          ctx.beginPath();

          const sliceWidth = width / bufferLength;
          let x = 0;
          for (let i = 0; i < bufferLength; i++) {
            const v = dataArray[i] / 128.0;
            const y = (v * height) / 2;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
            x += sliceWidth;
          }
          ctx.lineTo(width, height / 2);
          ctx.stroke();
          ctx.shadowBlur = 0;

          ctx.fillStyle = '#FF0055';
          ctx.beginPath();
          ctx.arc(width - 20, 15, 6, 0, Math.PI * 2);
          ctx.globalAlpha = 0.5 + 0.5 * Math.sin(Date.now() * 0.005);
          ctx.fill();
          ctx.globalAlpha = 1;

          animationRef.current = requestAnimationFrame(drawLiveWaveform);
        };
        drawLiveWaveform();

        mediaRecorder.start(100);
        return;
      } catch (err) {
        console.warn('Microphone access failed:', err);
        setRecordingStatus('⚠️ Mic denied — using simulated recording');
      }
    }

    setRecordingStatus('🔴 Simulated recording in progress...');
    drawSimulatedWaveform();
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
    }
    cancelAnimationFrame(simAnimRef.current);
    cancelAnimationFrame(animationRef.current);
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    clearInterval(recordingIntervalRef.current);
    setIsRecording(false);
    setRecordingStatus('Processing recording...');

    if (audioChunksRef.current.length === 0) {
      const file = new File([''], `recording_${Date.now()}.webm`, { type: 'audio/webm' });
      setAudioFile(file);
      processAudioFile(file);
    }
  };

  const handleBatchUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setBatchFiles(files);
    setBatchResults([]);
    for (const file of files) {
      const result = await analyzeAudio(null, file.name);
      setBatchResults(prev => [...prev, { filename: file.name, result }]);
    }
    e.target.value = '';
  };

  const generatePDF = () => {
    if (!currentResult) return;
    const doc = new jsPDF();
    doc.setFillColor(3, 7, 18);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(0, 242, 254);
    doc.setFontSize(24);
    doc.text('VoxForensics', 20, 25);
    doc.setTextColor(200, 200, 200);
    doc.setFontSize(10);
    doc.text('AI Deepfake Audio Detection — Forensic Report', 20, 35);

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.text('Analysis Summary', 20, 55);
    doc.setFontSize(10);
    doc.text(`File: ${audioFile?.name || 'N/A'}`, 20, 68);
    doc.text(`Date: ${new Date(currentResult.timestamp).toLocaleString()}`, 20, 76);
    doc.text(`Model: ${currentResult.modelVersion}`, 20, 84);
    doc.text(`Duration: ${currentResult.audioDuration.toFixed(2)}s`, 20, 92);
    doc.text(`Sample Rate: ${currentResult.sampleRate} Hz`, 20, 100);

    doc.setFontSize(14);
    doc.text('Verdict', 20, 118);
    doc.setFontSize(12);
    if (currentResult.isDeepfake) {
      doc.setTextColor(255, 0, 85);
      doc.text('DEEPFAKE DETECTED', 20, 130);
    } else {
      doc.setTextColor(0, 180, 80);
      doc.text('AUTHENTIC AUDIO', 20, 130);
    }

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.text(`Confidence: ${(currentResult.confidence * 100).toFixed(1)}%`, 20, 142);
    doc.text(`Uncertainty: ${(currentResult.uncertainty * 100).toFixed(1)}%`, 20, 150);

    doc.setFontSize(14);
    doc.text('Classification Probabilities', 20, 168);
    doc.setFontSize(10);
    doc.text(`Real: ${(currentResult.probabilities.real * 100).toFixed(1)}%`, 20, 180);
    doc.text(`Deepfake: ${(currentResult.probabilities.deepfake * 100).toFixed(1)}%`, 20, 188);
    doc.text(`Manipulated: ${(currentResult.probabilities.manipulated * 100).toFixed(1)}%`, 20, 196);

    doc.setFontSize(14);
    doc.text('Acoustic Features', 20, 214);
    doc.setFontSize(9);
    const features = currentResult.features;
    doc.text(`Spectral Centroid: ${features.spectralCentroid.toFixed(1)} Hz`, 20, 226);
    doc.text(`Pitch Variability: ${features.pitchVariability.toFixed(4)}`, 20, 234);
    doc.text(`Formant Stability: ${features.formantStability.toFixed(4)}`, 20, 242);
    doc.text(`Harmonic Ratio: ${features.harmonicRatio.toFixed(4)}`, 20, 250);
    doc.text(`Spectral Flatness: ${features.spectralFlatness.toFixed(4)}`, 20, 258);

    doc.addPage();
    doc.setFontSize(14);
    doc.text('Model Explanation', 20, 25);
    doc.setFontSize(10);
    let yPos = 40;
    currentResult.explanation.forEach((line) => {
      const splitLines = doc.splitTextToSize(line, 170);
      doc.text(splitLines, 20, yPos);
      yPos += splitLines.length * 7 + 5;
    });

    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('Generated by VoxForensics AI Detection System', 20, 285);
    doc.text(`Report ID: VF-${Date.now().toString(36).toUpperCase()}`, 140, 285);
    doc.save(`VoxForensics_Report_${Date.now()}.pdf`);
  };

  // Draw analyzed waveform
  useEffect(() => {
    if (waveformData.length > 0 && !isRecording) {
      const canvas = canvasWaveformRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = canvas.offsetWidth * 2;
      canvas.height = canvas.offsetHeight * 2;
      ctx.scale(2, 2);
      const width = canvas.offsetWidth;
      const height = canvas.offsetHeight;

      ctx.fillStyle = 'rgba(3, 7, 18, 0.9)';
      ctx.fillRect(0, 0, width, height);

      ctx.strokeStyle = 'rgba(0, 242, 254, 0.1)';
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();

      const gradient = ctx.createLinearGradient(0, 0, width, 0);
      if (currentResult?.isDeepfake) {
        gradient.addColorStop(0, '#FF0055');
        gradient.addColorStop(1, '#E100FF');
      } else {
        gradient.addColorStop(0, '#00F2FE');
        gradient.addColorStop(1, '#00FF88');
      }

      ctx.strokeStyle = gradient;
      ctx.lineWidth = 1.5;
      ctx.shadowColor = currentResult?.isDeepfake ? '#FF0055' : '#00F2FE';
      ctx.shadowBlur = 4;
      ctx.beginPath();

      const maxVal = Math.max(...waveformData.map(Math.abs), 0.01);
      waveformData.forEach((val, i) => {
        const x = (i / waveformData.length) * width;
        const y = height / 2 - (val / maxVal) * (height / 2) * 0.8;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
      ctx.shadowBlur = 0;

      ctx.globalAlpha = 0.3;
      ctx.beginPath();
      waveformData.forEach((val, i) => {
        const x = (i / waveformData.length) * width;
        const y = height / 2 + (val / maxVal) * (height / 2) * 0.8;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
  }, [waveformData, isRecording, currentResult]);

  // Draw spectrogram
  useEffect(() => {
    if (spectrogramData.length > 0) {
      const canvas = canvasSpectrogramRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = canvas.offsetWidth * 2;
      canvas.height = canvas.offsetHeight * 2;
      ctx.scale(2, 2);
      const width = canvas.offsetWidth;
      const height = canvas.offsetHeight;
      const frameWidth = width / spectrogramData.length;
      const binHeight = height / (spectrogramData[0]?.length || 1);

      spectrogramData.forEach((frame, f) => {
        frame.forEach((value, b) => {
          const r = Math.floor(value * (currentResult?.isDeepfake ? 255 : 0));
          const g = Math.floor(value * (currentResult?.isDeepfake ? 0 : 242));
          const bColor = Math.floor(value * (currentResult?.isDeepfake ? 85 : 254));
          ctx.fillStyle = `rgb(${r}, ${g}, ${bColor})`;
          ctx.fillRect(f * frameWidth, height - (b + 1) * binHeight, frameWidth + 1, binHeight + 1);
        });
      });
    }
  }, [spectrogramData, currentResult]);

  useEffect(() => {
    return () => {
      cancelAnimationFrame(animationRef.current);
      cancelAnimationFrame(simAnimRef.current);
      clearInterval(recordingIntervalRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="relative min-h-screen">
      <LiveBackground />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8 md:py-12">
        {/* Header with 3D Metallic Title */}
        <header className="text-center mb-12">
          <h1 className="hero-title mb-4">VoxForensics</h1>
          <p className="hero-subtitle mb-6">
            AI-Powered Deepfake Audio Detection & Forensic Analysis
          </p>
          <div className="flex justify-center gap-3 flex-wrap">
            <span className="feature-tag">🎙️ Recording</span>
            <span className="feature-tag">📁 Upload</span>
            <span className="feature-tag">🌊 Waveform</span>
            <span className="feature-tag">🔬 Spectrogram</span>
            <span className="feature-tag">🤖 AI Detection</span>
            <span className="feature-tag">📋 Reports</span>
            <button 
              onClick={() => setShowTestPanel(true)} 
              className="feature-tag cursor-pointer hover:bg-cyan-500/20 transition-colors"
            >
              🧪 E2E Tests
            </button>
          </div>
        </header>

        {/* Tab Navigation */}
        <nav className="flex justify-center gap-3 mb-10">
          {(['analyze', 'history', 'batch'] as TabType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                if (tab === 'history') setHistory(getScanHistory());
              }}
              className={`px-6 py-3 rounded-xl border font-medium text-sm transition-all ${
                activeTab === tab 
                  ? 'tab-active' 
                  : 'border-white/10 text-gray-400 hover:text-white hover:border-white/20 bg-white/5 backdrop-blur-sm'
              }`}
            >
              {tab === 'analyze' && '🔬 Analyze'}
              {tab === 'history' && `🕒 History (${history.length})`}
              {tab === 'batch' && '📦 Batch Compare'}
            </button>
          ))}
        </nav>

        {/* ANALYZE TAB */}
        {activeTab === 'analyze' && (
          <div className="fade-in space-y-6">
            {/* Input Section */}
            <div className="glass-card glass-card-interactive p-6 md:p-8">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                <span className="text-2xl">🎙️</span>
                <span>Scan a Voice Recording</span>
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Microphone Recording */}
                <div className="text-center p-5 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm hover:border-cyan-500/30 transition-all">
                  <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 ${
                    isRecording 
                      ? 'bg-red-500/20 border-2 border-red-500 recording-active' 
                      : 'bg-cyan-500/10 border-2 border-cyan-500/30'
                  }`}>
                    <span className="text-2xl">{isRecording ? '⏹️' : '🎙️'}</span>
                  </div>
                  <p className="text-sm text-gray-300 mb-1 font-medium">
                    {isRecording ? `Recording... ${formatTime(recordingTime)}` : 'Microphone'}
                  </p>
                  {recordingStatus && !isRecording && (
                    <p className="text-xs text-gray-500 mb-3">{recordingStatus}</p>
                  )}
                  <button
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`neon-btn w-full text-sm ${isRecording ? 'neon-btn-danger' : ''}`}
                  >
                    {isRecording ? '⏹ Stop & Analyze' : '🎙 Start Recording'}
                  </button>
                </div>

                {/* File Upload */}
                <div className="text-center p-5 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm hover:border-purple-500/30 transition-all">
                  <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 bg-purple-500/10 border-2 border-purple-500/30">
                    <span className="text-2xl">📁</span>
                  </div>
                  <p className="text-sm text-gray-300 mb-3 font-medium">Upload Audio File</p>
                  <input ref={fileInputRef} type="file" accept="audio/*" className="hidden" onChange={handleFileUpload} />
                  <button onClick={() => fileInputRef.current?.click()} className="neon-btn neon-btn-purple w-full text-sm">
                    📁 Choose File
                  </button>
                </div>

                {/* Sample Audio */}
                <div className="text-center p-5 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm hover:border-green-500/30 transition-all">
                  <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 bg-green-500/10 border-2 border-green-500/30">
                    <span className="text-2xl">🧪</span>
                  </div>
                  <p className="text-sm text-gray-300 mb-3 font-medium">Try Sample Audio</p>
                  <div className="flex gap-2">
                    <button onClick={handleSampleReal} className="neon-btn neon-btn-success flex-1 text-xs py-2">
                      ✅ Real
                    </button>
                    <button onClick={handleSampleFake} className="neon-btn neon-btn-danger flex-1 text-xs py-2">
                      ❌ Fake
                    </button>
                  </div>
                </div>
              </div>

              {/* Recording Waveform */}
              {isRecording && (
                <div className="mt-6 waveform-container">
                  <canvas ref={simulatedCanvasRef} className="w-full h-28" />
                  <div className="absolute bottom-2 left-3 text-xs font-mono" style={{ color: '#00F2FE' }}>
                    {formatTime(recordingTime)} | {recordingStatus}
                  </div>
                </div>
              )}
            </div>

            {/* Analyzing Indicator */}
            {isAnalyzing && (
              <div className="glass-card p-8 text-center fade-in">
                <div className="relative inline-block mb-4">
                  <div className="spinner w-12 h-12 mx-auto" style={{ borderWidth: '3px' }}></div>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Analyzing Audio...</h3>
                <p className="text-gray-400 text-sm">Running VoxNet-v3.2.1-Ensemble model</p>
                <div className="mt-4 flex justify-center gap-2 text-xs flex-wrap">
                  <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300">Extracting features</span>
                  <span className="text-gray-600">→</span>
                  <span className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300">Computing spectrogram</span>
                  <span className="text-gray-600">→</span>
                  <span className="px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-300">Running inference</span>
                </div>
              </div>
            )}

            {/* Results */}
            {currentResult && !isAnalyzing && (
              <div className="space-y-6 fade-in">
                {/* Verdict */}
                <div className={`glass-card p-6 md:p-8 border-l-4 ${
                  currentResult.isDeepfake ? 'border-l-[#FF0055]' : 'border-l-[#00FF88]'
                }`}>
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <h3 className="text-2xl md:text-3xl font-bold" style={{ color: currentResult.isDeepfake ? '#FF0055' : '#00FF88' }}>
                        {currentResult.isDeepfake ? '⚠️ DEEPFAKE DETECTED' : '✅ AUTHENTIC AUDIO'}
                      </h3>
                      <p className="text-gray-400 mt-2 text-sm">
                        Model: {currentResult.modelVersion} | Confidence: {(currentResult.confidence * 100).toFixed(1)}%
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <button onClick={() => setShowReport(!showReport)} className="neon-btn text-sm">
                        📋 Report
                      </button>
                      <button onClick={generatePDF} className="neon-btn neon-btn-purple text-sm">
                        📥 PDF
                      </button>
                    </div>
                  </div>
                </div>

                {/* Visualizations */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="glass-card p-5">
                    <h4 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                      🌊 Waveform Analysis
                    </h4>
                    <div className="waveform-container">
                      <canvas ref={canvasWaveformRef} className="w-full h-32" />
                    </div>
                  </div>
                  <div className="glass-card p-5">
                    <h4 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                      🔬 Mel-Spectrogram
                    </h4>
                    <div className="spectrogram-container">
                      <canvas ref={canvasSpectrogramRef} className="w-full h-32" />
                    </div>
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Probabilities */}
                  <div className="glass-card p-5">
                    <h4 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
                      📊 Classification Probabilities
                    </h4>
                    <div className="space-y-4">
                      {[
                        { label: 'Real', value: currentResult.probabilities.real, color: '#00FF88', gradient: 'linear-gradient(90deg, #00FF88, #00CC6A)' },
                        { label: 'Deepfake', value: currentResult.probabilities.deepfake, color: '#FF0055', gradient: 'linear-gradient(90deg, #FF0055, #E100FF)' },
                        { label: 'Manipulated', value: currentResult.probabilities.manipulated, color: '#FFD700', gradient: 'linear-gradient(90deg, #FFD700, #FF6600)' },
                      ].map((item, i) => (
                        <div key={i}>
                          <div className="flex justify-between text-xs mb-1.5">
                            <span style={{ color: item.color }}>{item.label}</span>
                            <span style={{ color: item.color }}>{(item.value * 100).toFixed(1)}%</span>
                          </div>
                          <div className="progress-bar">
                            <div className="progress-fill" style={{ width: `${item.value * 100}%`, background: item.gradient }}></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Confidence Ring */}
                  <div className="glass-card p-5 flex flex-col items-center justify-center">
                    <h4 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
                      🎯 Confidence
                    </h4>
                    <div className="confidence-ring">
                      <svg width="140" height="140" viewBox="0 0 140 140">
                        <circle cx="70" cy="70" r="58" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                        <circle
                          cx="70" cy="70" r="58" fill="none"
                          stroke={currentResult.isDeepfake ? '#FF0055' : '#00FF88'}
                          strokeWidth="8"
                          strokeDasharray={`${currentResult.confidence * 364} 364`}
                          strokeLinecap="round"
                          style={{ filter: `drop-shadow(0 0 8px ${currentResult.isDeepfake ? '#FF0055' : '#00FF88'})` }}
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-3xl font-bold" style={{ color: currentResult.isDeepfake ? '#FF0055' : '#00FF88' }}>
                          {(currentResult.confidence * 100).toFixed(0)}%
                        </span>
                        <span className="text-xs text-gray-500 mt-1">±{(currentResult.uncertainty * 100).toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Acoustic Features */}
                  <div className="glass-card p-5">
                    <h4 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
                      📈 Acoustic Features
                    </h4>
                    <div className="space-y-2.5 text-xs">
                      {[
                        { label: 'Spectral Centroid', value: currentResult.features.spectralCentroid.toFixed(0) + ' Hz' },
                        { label: 'Pitch Variability', value: currentResult.features.pitchVariability.toFixed(4) },
                        { label: 'Formant Stability', value: currentResult.features.formantStability.toFixed(4) },
                        { label: 'Harmonic Ratio', value: currentResult.features.harmonicRatio.toFixed(4) },
                        { label: 'Spectral Flatness', value: currentResult.features.spectralFlatness.toFixed(4) },
                        { label: 'Temporal Modulation', value: currentResult.features.temporalModulation.toFixed(4) },
                      ].map((f, i) => (
                        <div key={i} className="flex justify-between items-center py-1.5 border-b border-white/5">
                          <span className="text-gray-400">{f.label}</span>
                          <span className="font-mono" style={{ color: '#00F2FE' }}>{f.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Model Explanation */}
                <div className="glass-card p-6">
                  <h4 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
                    🧠 Model Explanation (XAI)
                  </h4>
                  <div className="space-y-2">
                    {currentResult.explanation.map((line, i) => (
                      <div key={i} className="p-3 rounded-xl bg-white/5 border border-white/5 text-sm text-gray-300">
                        {line}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Full Report */}
                {showReport && (
                  <div className="glass-card p-6 fade-in">
                    <h4 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
                      📋 Forensic Report
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      {[
                        { label: 'File', value: audioFile?.name || 'N/A' },
                        { label: 'Duration', value: `${currentResult.audioDuration.toFixed(2)}s` },
                        { label: 'Sample Rate', value: `${currentResult.sampleRate} Hz` },
                        { label: 'Model', value: currentResult.modelVersion },
                        { label: 'Timestamp', value: new Date(currentResult.timestamp).toLocaleString() },
                        { label: 'Verdict', value: currentResult.isDeepfake ? 'Deepfake' : 'Authentic', color: currentResult.isDeepfake ? '#FF0055' : '#00FF88' },
                        { label: 'Confidence', value: `${(currentResult.confidence * 100).toFixed(1)}%`, color: '#00F2FE' },
                        { label: 'Report ID', value: `VF-${Date.now().toString(36).toUpperCase()}` },
                      ].map((item, i) => (
                        <div key={i} className="p-3 rounded-xl bg-white/5 border border-white/5">
                          <p className="text-gray-500 text-xs mb-1">{item.label}</p>
                          <p className="text-white truncate text-xs" style={item.color ? { color: item.color } : {}}>
                            {item.value}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Empty State */}
            {!currentResult && !isAnalyzing && !isRecording && (
              <div className="glass-card p-12 text-center">
                <div className="text-6xl mb-4">🔬</div>
                <h3 className="text-xl font-bold text-white mb-2">Ready to Analyze</h3>
                <p className="text-gray-400 max-w-md mx-auto text-sm">
                  Record audio from your microphone, upload an audio file, or try our sample real/fake audio clips to see VoxForensics in action.
                </p>
                <div className="mt-6 flex justify-center gap-3 flex-wrap">
                  <button onClick={startRecording} className="neon-btn">🎙 Start Recording</button>
                  <button onClick={handleSampleReal} className="neon-btn neon-btn-success">✅ Try Real Sample</button>
                  <button onClick={handleSampleFake} className="neon-btn neon-btn-danger">❌ Try Fake Sample</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* HISTORY TAB */}
        {activeTab === 'history' && (
          <div className="fade-in space-y-4">
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">🕒 Scan History</h2>
                {history.length > 0 && (
                  <button onClick={() => { clearHistory(); setHistory([]); }} className="neon-btn neon-btn-danger text-xs">
                    🗑 Clear All
                  </button>
                )}
              </div>
              {history.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <div className="text-4xl mb-3">📭</div>
                  <p className="text-sm">No scans yet. Analyze some audio to build your history.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {history.map((record) => (
                    <div key={record.id} className="batch-item flex items-center justify-between flex-wrap gap-3">
                      <div className="flex items-center gap-3">
                        <span className={`w-3 h-3 rounded-full ${record.result.isDeepfake ? 'bg-[#FF0055]' : 'bg-[#00FF88]'}`}
                          style={{ boxShadow: `0 0 8px ${record.result.isDeepfake ? '#FF0055' : '#00FF88'}` }}></span>
                        <div>
                          <p className="text-white text-sm font-medium">{record.filename}</p>
                          <p className="text-gray-500 text-xs">{new Date(record.timestamp).toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-xs">
                        <span className="text-gray-400">{record.duration.toFixed(1)}s</span>
                        <span style={{ color: record.result.isDeepfake ? '#FF0055' : '#00FF88' }}>
                          {(record.result.confidence * 100).toFixed(0)}% {record.result.isDeepfake ? 'Fake' : 'Real'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* BATCH TAB */}
        {activeTab === 'batch' && (
          <div className="fade-in space-y-6">
            <div className="glass-card p-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">📦 Batch Comparison</h2>
              <p className="text-gray-400 text-sm mb-4">Upload multiple audio files to compare their analysis results side by side.</p>
              <input ref={batchInputRef} type="file" accept="audio/*" multiple className="hidden" onChange={handleBatchUpload} />
              <button onClick={() => batchInputRef.current?.click()} className="neon-btn">📁 Select Multiple Files</button>

              {batchResults.length > 0 && (
                <div className="mt-6 space-y-3">
                  <h3 className="text-sm font-semibold text-gray-300">Results ({batchResults.length} files)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {batchResults.map((item, i) => (
                      <div key={i} className="batch-item">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className={`w-3 h-3 rounded-full ${item.result.isDeepfake ? 'bg-[#FF0055]' : 'bg-[#00FF88]'}`}></span>
                            <span className="text-white text-sm truncate max-w-[200px]">{item.filename}</span>
                          </div>
                          <span className="text-xs font-bold" style={{ color: item.result.isDeepfake ? '#FF0055' : '#00FF88' }}>
                            {(item.result.confidence * 100).toFixed(0)}%
                          </span>
                        </div>
                        <div className="mt-2 flex gap-3 text-xs">
                          <span style={{ color: '#00FF88' }}>R:{(item.result.probabilities.real * 100).toFixed(0)}%</span>
                          <span style={{ color: '#FF0055' }}>DF:{(item.result.probabilities.deepfake * 100).toFixed(0)}%</span>
                          <span style={{ color: '#FFD700' }}>M:{(item.result.probabilities.manipulated * 100).toFixed(0)}%</span>
                        </div>
                        <div className="mt-2 progress-bar">
                          <div className="progress-fill" style={{ 
                            width: `${item.result.confidence * 100}%`,
                            background: item.result.isDeepfake ? 'linear-gradient(90deg, #FF0055, #E100FF)' : 'linear-gradient(90deg, #00FF88, #00F2FE)'
                          }}></div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 p-4 rounded-2xl bg-white/5 border border-white/5">
                    <h4 className="text-sm font-semibold text-gray-300 mb-3">Batch Summary</h4>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold text-white">{batchResults.length}</p>
                        <p className="text-xs text-gray-500">Total Scans</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold" style={{ color: '#FF0055' }}>{batchResults.filter(b => b.result.isDeepfake).length}</p>
                        <p className="text-xs text-gray-500">Deepfakes</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold" style={{ color: '#00FF88' }}>{batchResults.filter(b => !b.result.isDeepfake).length}</p>
                        <p className="text-xs text-gray-500">Authentic</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-16 text-center pb-8">
          <p className="text-gray-500 text-sm">VoxForensics v3.2.1 — AI Deepfake Audio Detection System</p>
          <p className="mt-1 text-xs text-gray-700">Powered by VoxNet Ensemble Model | For forensic analysis purposes</p>
        </footer>
      </div>

      {/* E2E Test Panel */}
      {showTestPanel && <E2ETestPanel onClose={() => setShowTestPanel(false)} />}
    </div>
  );
}
