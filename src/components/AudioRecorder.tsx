import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Loader } from 'lucide-react';
import { OpenAISettings } from './SettingsModal';

interface AudioRecorderProps {
  onTranscription: (text: string) => void;
  settings: OpenAISettings;
  disabled?: boolean;
}

export const AudioRecorder: React.FC<AudioRecorderProps> = ({ onTranscription, settings, disabled }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const convertToWav = async (audioBlob: Blob): Promise<Blob> => {
    const TARGET_SAMPLE_RATE = 16000;
    
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const arrayBuffer = await audioBlob.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    
    // Create offline context for resampling
    const offlineContext = new OfflineAudioContext(
      1, // mono
      audioBuffer.duration * TARGET_SAMPLE_RATE,
      TARGET_SAMPLE_RATE
    );
    
    // Create buffer source
    const source = offlineContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(offlineContext.destination);
    source.start();
    
    // Render the resampled audio
    const resampledBuffer = await offlineContext.startRendering();
    
    // Create WAV file
    const length = resampledBuffer.length * 2; // 16-bit samples
    const buffer = new ArrayBuffer(44 + length);
    const view = new DataView(buffer);
    
    // WAV header
    const writeString = (view: DataView, offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };
    
    writeString(view, 0, 'RIFF'); // ChunkID
    view.setUint32(4, 36 + length, true); // ChunkSize
    writeString(view, 8, 'WAVE'); // Format
    writeString(view, 12, 'fmt '); // Subchunk1ID
    view.setUint32(16, 16, true); // Subchunk1Size
    view.setUint16(20, 1, true); // AudioFormat (PCM)
    view.setUint16(22, 1, true); // NumChannels (mono)
    view.setUint32(24, TARGET_SAMPLE_RATE, true); // SampleRate
    view.setUint32(28, TARGET_SAMPLE_RATE * 2, true); // ByteRate
    view.setUint16(32, 2, true); // BlockAlign
    view.setUint16(34, 16, true); // BitsPerSample
    writeString(view, 36, 'data'); // Subchunk2ID
    view.setUint32(40, length, true); // Subchunk2Size
    
    // Write audio data
    const samples = resampledBuffer.getChannelData(0);
    let offset = 44;
    for (let i = 0; i < samples.length; i++) {
      const sample = Math.max(-1, Math.min(1, samples[i]));
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
      offset += 2;
    }
    
    return new Blob([buffer], { type: 'audio/wav' });
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          channelCount: 1,
          sampleRate: { ideal: 16000 }
        }
      });
      streamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const wavBlob = await convertToWav(audioBlob);
        await transcribeAudio(wavBlob);
        
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Unable to access microphone. Please ensure you have granted permission.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const transcribeAudio = async (audioBlob: Blob) => {
    if (!settings.useOllama && !settings.apiKey) {
      alert('Please configure OpenAI settings first');
      return;
    }

    setIsProcessing(true);
    try {
      let response;

      if (settings.useOllama && settings.useWhisperCpp) {
        // Use Whisper.cpp
        const formData = new FormData();
        formData.append('file', audioBlob, 'audio.wav');

        response = await fetch(`${settings.whisperCppEndpoint}/inference`, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Whisper.cpp transcription failed');
        }

        const data = await response.json();
        if (data.text) {
          onTranscription(data.text);
          if (settings.autoSendTranscription) {
            requestAnimationFrame(() => {
              const form = document.querySelector('form');
              if (form) {
                const submitEvent = new Event('submit', {
                  bubbles: true,
                  cancelable: true,
                });
                form.dispatchEvent(submitEvent);
              }
            });
          }
        }
      } else {
        // Use OpenAI Whisper API
        const formData = new FormData();
        formData.append('file', audioBlob, 'audio.wav');
        formData.append('model', 'whisper-1');

        response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${settings.apiKey}`,
          },
          body: formData,
        });

        if (!response.ok) {
          throw new Error('OpenAI transcription failed');
        }

        const data = await response.json();
        if (data.text) {
          onTranscription(data.text);
          if (settings.autoSendTranscription) {
            requestAnimationFrame(() => {
              const form = document.querySelector('form');
              if (form) {
                const submitEvent = new Event('submit', {
                  bubbles: true,
                  cancelable: true,
                });
                form.dispatchEvent(submitEvent);
              }
            });
          }
        }
      }
    } catch (error) {
      console.error('Transcription error:', error);
      alert('Failed to transcribe audio');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <button
      onClick={isRecording ? stopRecording : startRecording}
      disabled={disabled || isProcessing}
      className={`p-2 rounded-full transition-colors ${
        isRecording 
          ? 'bg-red-500 hover:bg-red-600' 
          : 'bg-blue-500 hover:bg-blue-600'
      } ${disabled || isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
      title={isRecording ? 'Stop recording' : 'Start recording'}
      type="button"
    >
      {isProcessing ? (
        <Loader className="h-5 w-5 text-white animate-spin" />
      ) : isRecording ? (
        <Square className="h-5 w-5 text-white" />
      ) : (
        <Mic className="h-5 w-5 text-white" />
      )}
    </button>
  );
};