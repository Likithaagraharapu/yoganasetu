'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, AlertCircle } from 'lucide-react';

interface VoiceInputButtonProps {
  onTranscript: (text: string) => void;
  className?: string;
}

// Typing for Web Speech API
interface IWindow extends Window {
  SpeechRecognition?: any;
  webkitSpeechRecognition?: any;
}

export default function VoiceInputButton({ onTranscript, className = '' }: VoiceInputButtonProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const win = window as unknown as IWindow;
    const SpeechRecognition = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-IN'; // Indian English / Hindi mix support

      recognition.onstart = () => {
        setIsListening(true);
        setErrorMessage(null);
      };

      recognition.onresult = (event: any) => {
        const current = event.resultIndex;
        const transcript = event.results[current][0].transcript;
        if (event.results[current].isFinal) {
          onTranscript(transcript);
          setIsListening(false);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          setErrorMessage('Microphone access denied. Please allow microphone permissions.');
        } else if (event.error !== 'no-speech') {
          setErrorMessage(`Speech recognition error: ${event.error}`);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } catch (err) {
      setIsSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }
    };
  }, [onTranscript]);

  const toggleListening = () => {
    if (!isSupported) {
      alert('Voice input is not supported in this browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    if (isListening) {
      try {
        recognitionRef.current?.stop();
      } catch {
        setIsListening(false);
      }
    } else {
      setErrorMessage(null);
      try {
        recognitionRef.current?.start();
      } catch (e) {
        console.error('Error starting recognition:', e);
      }
    }
  };

  return (
    <div className="relative inline-flex items-center">
      <button
        type="button"
        onClick={toggleListening}
        aria-label={isListening ? 'Stop listening' : 'Start voice input'}
        title={
          !isSupported
            ? 'Voice input not supported in this browser'
            : isListening
            ? 'Listening... Click to stop'
            : 'Click to speak your question'
        }
        className={`relative p-2.5 rounded-xl transition-all duration-200 flex items-center justify-center ${
          isListening
            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 shadow-[0_0_15px_rgba(244,63,94,0.4)] animate-pulse'
            : isSupported
            ? 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-amber-400 border border-white/10'
            : 'bg-slate-900/50 text-slate-600 border border-white/5 cursor-not-allowed'
        } ${className}`}
      >
        {isListening ? (
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            <MicOff className="w-4 h-4" />
          </div>
        ) : (
          <Mic className="w-4 h-4" />
        )}
      </button>

      {/* Floating listening wave indicator */}
      {isListening && (
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap bg-rose-950/90 text-rose-300 text-xs px-2.5 py-1 rounded-full border border-rose-500/30 flex items-center gap-1.5 shadow-lg backdrop-blur-md">
          <span className="flex gap-0.5">
            <span className="w-1 h-3 bg-rose-400 animate-pulse rounded-full" />
            <span className="w-1 h-4 bg-rose-400 animate-pulse [animation-delay:0.15s] rounded-full" />
            <span className="w-1 h-2 bg-rose-400 animate-pulse [animation-delay:0.3s] rounded-full" />
          </span>
          Listening... speak now
        </div>
      )}

      {/* Error alert badge */}
      {errorMessage && (
        <div className="absolute top-12 left-0 right-auto z-20 whitespace-nowrap bg-slate-900 text-rose-400 text-xs px-3 py-1.5 rounded-lg border border-rose-500/30 shadow-xl flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
}
