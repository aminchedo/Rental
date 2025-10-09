/**
 * Voice Chat Component
 * 
 * Provides Persian voice interaction:
 * - Microphone button for recording
 * - Audio playback for TTS responses
 * - Persists last 3 recordings locally
 */

import React, { useState, useRef, useEffect } from 'react';

interface VoiceChatProps {
  onTranscript: (text: string) => void;
  lastAssistantMessage?: string;
  apiUrl?: string;
}

interface Recording {
  id: string;
  blob: Blob;
  timestamp: number;
}

const VoiceChat: React.FC<VoiceChatProps> = ({
  onTranscript,
  lastAssistantMessage,
  apiUrl = 'http://localhost:3001'
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Load recordings from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('voice_recordings');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setRecordings(parsed.slice(0, 3));
      } catch (e) {
        console.error('Failed to load recordings:', e);
      }
    }
  }, []);

  // Save recordings to localStorage (keep last 3)
  useEffect(() => {
    if (recordings.length > 0) {
      const toStore = recordings.slice(0, 3).map(r => ({
        id: r.id,
        timestamp: r.timestamp,
        // Don't store blob in localStorage (too large)
      }));
      localStorage.setItem('voice_recordings', JSON.stringify(toStore));
    }
  }, [recordings]);

  const startRecording = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        } 
      });

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        
        // Save recording (keep last 3)
        const newRecording: Recording = {
          id: `recording_${Date.now()}`,
          blob: audioBlob,
          timestamp: Date.now(),
        };
        setRecordings(prev => [newRecording, ...prev].slice(0, 3));

        // Send to STT
        await processSTT(audioBlob);

        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Error starting recording:', err);
      setError('خطا در شروع ضبط صدا. لطفاً دسترسی به میکروفون را بررسی کنید.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const processSTT = async (audioBlob: Blob) => {
    setIsProcessing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.wav');
      formData.append('sample_rate', '16000');

      const response = await fetch(`${apiUrl}/api/stt`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`STT failed: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.text) {
        onTranscript(result.text);
      } else {
        throw new Error('No transcript returned');
      }
    } catch (err) {
      console.error('STT error:', err);
      setError('خطا در تبدیل گفتار به متن');
    } finally {
      setIsProcessing(false);
    }
  };

  const speakText = async (text: string) => {
    setIsProcessing(true);
    setError(null);

    try {
      const response = await fetch(`${apiUrl}/api/tts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          lang: 'fa',
          speed: 1.0,
        }),
      });

      if (!response.ok) {
        throw new Error(`TTS failed: ${response.statusText}`);
      }

      const audioBlob = await response.blob();
      const url = URL.createObjectURL(audioBlob);
      
      // Clean up previous audio URL
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      
      setAudioUrl(url);

      // Auto-play
      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.play().catch(err => {
          console.error('Auto-play failed:', err);
          setError('برای پخش صدا، روی دکمه پخش کلیک کنید');
        });
      }
    } catch (err) {
      console.error('TTS error:', err);
      setError('خطا در تبدیل متن به گفتار');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="voice-chat-container" dir="rtl">
      <div className="voice-controls flex gap-2 items-center">
        {/* Microphone Button */}
        <button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isProcessing}
          className={`mic-button ${isRecording ? 'recording' : ''} ${isProcessing ? 'disabled' : ''}`}
          aria-label={isRecording ? 'توقف ضبط' : 'شروع ضبط صدا'}
          title={isRecording ? 'توقف ضبط' : 'شروع ضبط صدا'}
        >
          {isRecording ? (
            <svg className="w-6 h-6 text-red-500 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          )}
        </button>

        {/* Play TTS Button */}
        {lastAssistantMessage && (
          <button
            onClick={() => speakText(lastAssistantMessage)}
            disabled={isProcessing || isRecording}
            className="play-button"
            aria-label="پخش پاسخ"
            title="پخش پاسخ دستیار"
          >
            {isProcessing ? (
              <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </button>
        )}

        {/* Status Text */}
        {isRecording && (
          <span className="text-sm text-red-500 animate-pulse">در حال ضبط...</span>
        )}
        {isProcessing && !isRecording && (
          <span className="text-sm text-blue-500">در حال پردازش...</span>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-message text-sm text-red-500 mt-2" role="alert">
          {error}
        </div>
      )}

      {/* Hidden Audio Element */}
      <audio ref={audioRef} className="hidden" />

      {/* Recording History (for debugging) */}
      {recordings.length > 0 && (
        <div className="recording-history mt-4 text-xs text-gray-500">
          <details>
            <summary>ضبط‌های اخیر ({recordings.length})</summary>
            <ul className="mt-2 space-y-1">
              {recordings.map(rec => (
                <li key={rec.id}>
                  {new Date(rec.timestamp).toLocaleTimeString('fa-IR')}
                </li>
              ))}
            </ul>
          </details>
        </div>
      )}
    </div>
  );
};

export default VoiceChat;
