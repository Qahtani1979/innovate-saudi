import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Mic, MicOff, VolumeX } from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import { toast } from 'sonner';

export function VoiceAssistant({ onCommand }) {
  const { language } = useLanguage();
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    // Check browser support
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setSupported(true);
    }
  }, []);

  const startListening = () => {
    if (!supported) {
      toast.error('Speech recognition not supported in this browser');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.lang = language === 'ar' ? 'ar-SA' : 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setListening(true);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      onCommand?.(transcript);
      setListening(false);
    };

    recognition.onerror = () => {
      setListening(false);
      toast.error('Voice recognition failed');
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognition.start();
  };

  const speak = (text) => {
    if ('speechSynthesis' in window) {
      setSpeaking(true);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === 'ar' ? 'ar-SA' : 'en-US';
      utterance.onend = () => setSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
    }
  };

  if (!supported) return null;

  return (
    <div className="flex gap-2">
      <Button
        size="icon"
        variant={listening ? "default" : "outline"}
        onClick={startListening}
        disabled={listening}
        className={listening ? "animate-pulse bg-red-600" : ""}
      >
        {listening ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
      </Button>
      
      {speaking && (
        <Button
          size="icon"
          variant="outline"
          onClick={stopSpeaking}
          className="animate-pulse"
        >
          <VolumeX className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

export const useVoiceAssistant = () => {
  const { language } = useLanguage();

  const speak = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === 'ar' ? 'ar-SA' : 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  return { speak };
};