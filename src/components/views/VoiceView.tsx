import React, { useState, useEffect, useRef } from "react";
import { useApp } from "../../context/AppContext";
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Radio,
  Play,
  Square,
  Sparkles,
  Settings2,
  RefreshCw,
} from "lucide-react";
import { synthesizeTTS } from "../../services/api";

export const VoiceView: React.FC = () => {
  const { t, trackUsage, addNotification } = useApp();

  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [voiceSpeed, setVoiceSpeed] = useState(1.0);
  const [selectedVoice, setSelectedVoice] = useState("Kore");
  const [transcriptHistory, setTranscriptHistory] = useState<
    Array<{ speaker: "user" | "nexa"; text: string; time: string }>
  >([
    {
      speaker: "nexa",
      text: "Voice mode active. Speak clearly into your microphone, and I will assist you immediately.",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  const recognitionRef = useRef<any>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const rec = new SpeechRec();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = "en-US";

      rec.onstart = () => {
        setIsListening(true);
      };

      rec.onresult = async (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (!transcript.trim()) return;

        const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        setTranscriptHistory((prev) => [...prev, { speaker: "user", text: transcript, time }]);

        setIsListening(false);
        setIsThinking(true);

        // Simulate intelligent voice response or invoke backend TTS
        setTimeout(() => {
          setIsThinking(false);
          const responseText = `Understood. Processing your inquiry: "${transcript}". All systems are functioning optimally.`;
          setTranscriptHistory((prev) => [...prev, { speaker: "nexa", text: responseText, time }]);
          speakText(responseText);
          trackUsage("message");
        }, 1200);
      };

      rec.onerror = () => {
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }
  }, []);

  const speakText = (text: string) => {
    if (isMuted) return;
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = voiceSpeed;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleToggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current?.start();
      } catch {
        addNotification("Mic Warning", "Speech recognition unavailable or permission denied.", "warning");
      }
    }
  };

  const handleStopSpeaking = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  return (
    <div id="voice-mode-view-container" className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-300 text-xs font-semibold border border-rose-200 dark:border-rose-800">
          <Radio className="w-3.5 h-3.5 animate-pulse" />
          <span>Real-time Conversational Voice</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
          {t.voice.title}
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-md mx-auto">
          {t.voice.subtitle}
        </p>
      </div>

      {/* Main Interactive Stage */}
      <div className="p-8 md:p-12 rounded-3xl bg-white dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800 shadow-sm flex flex-col items-center justify-center space-y-8 relative overflow-hidden">
        {/* Animated Waveform Orb */}
        <div className="relative flex items-center justify-center">
          {/* Outer Ripple Rings */}
          {(isListening || isSpeaking) && (
            <>
              <div className="absolute w-44 h-44 rounded-full bg-rose-500/10 dark:bg-rose-500/20 animate-ping" />
              <div className="absolute w-36 h-36 rounded-full bg-neutral-900/10 dark:bg-white/10 animate-pulse" />
            </>
          )}

          <button
            id="voice-stage-mic-btn"
            onClick={handleToggleListening}
            className={`w-28 h-28 rounded-full flex flex-col items-center justify-center transition-all duration-300 shadow-xl ${
              isListening
                ? "bg-rose-500 text-white scale-105 shadow-rose-500/30 ring-4 ring-rose-200 dark:ring-rose-900"
                : isSpeaking
                ? "bg-blue-600 text-white animate-pulse"
                : isThinking
                ? "bg-purple-600 text-white animate-bounce"
                : "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:scale-105"
            }`}
            title="Click to talk"
          >
            {isListening ? (
              <Mic className="w-10 h-10 animate-pulse" />
            ) : isSpeaking ? (
              <Volume2 className="w-10 h-10" />
            ) : isThinking ? (
              <Sparkles className="w-10 h-10" />
            ) : (
              <Mic className="w-10 h-10" />
            )}
          </button>
        </div>

        {/* State Label */}
        <div className="text-center space-y-1">
          <p className="font-semibold text-sm text-neutral-900 dark:text-white">
            {isListening
              ? t.voice.listening
              : isSpeaking
              ? t.voice.speaking
              : isThinking
              ? t.voice.thinking
              : "Tap microphone to speak"}
          </p>
          <p className="text-xs text-neutral-400">
            {isListening ? "Listening to your voice..." : "Hands-free voice recognition with low-latency response"}
          </p>
        </div>

        {/* Floating Audio Wave Visualizer Bars */}
        <div className="flex items-center gap-1.5 h-8">
          {[40, 75, 95, 60, 85, 100, 70, 50, 90, 65, 45].map((h, i) => (
            <div
              key={i}
              className={`w-1 rounded-full transition-all duration-150 ${
                isListening || isSpeaking
                  ? "bg-rose-500 dark:bg-rose-400"
                  : "bg-neutral-200 dark:bg-neutral-700 h-2"
              }`}
              style={{
                height: isListening || isSpeaking ? `${Math.max(8, (h * (Math.sin(Date.now() / 200 + i) + 1.2)) / 2.2)}px` : "6px",
              }}
            />
          ))}
        </div>

        {/* Controls Bar */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-4 border-t border-neutral-100 dark:border-neutral-800 w-full max-w-md">
          {/* Mute toggle */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`p-2.5 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-colors ${
              isMuted
                ? "bg-rose-50 dark:bg-rose-950/40 text-rose-600 border-rose-200 dark:border-rose-800"
                : "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700"
            }`}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            <span>{isMuted ? "Muted" : "Audio On"}</span>
          </button>

          {/* Stop playback */}
          {isSpeaking && (
            <button
              onClick={handleStopSpeaking}
              className="p-2.5 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-medium flex items-center gap-1.5"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>Stop Speaking</span>
            </button>
          )}

          {/* Speed selector */}
          <select
            value={voiceSpeed}
            onChange={(e) => setVoiceSpeed(parseFloat(e.target.value))}
            className="px-3 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs text-neutral-800 dark:text-neutral-200 font-mono"
          >
            <option value={0.75}>0.75x Speed</option>
            <option value={1.0}>1.0x Speed</option>
            <option value={1.25}>1.25x Speed</option>
            <option value={1.5}>1.5x Speed</option>
          </select>

          {/* Voice model selector */}
          <select
            value={selectedVoice}
            onChange={(e) => setSelectedVoice(e.target.value)}
            className="px-3 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs text-neutral-800 dark:text-neutral-200 font-mono"
          >
            <option value="Kore">Voice: Kore (Natural)</option>
            <option value="Fenrir">Voice: Fenrir (Warm Deep)</option>
            <option value="Aoede">Voice: Aoede (Expressive)</option>
            <option value="Puck">Voice: Puck (Energetic)</option>
          </select>
        </div>
      </div>

      {/* Real-time Voice Transcript Stack */}
      <div className="p-6 rounded-3xl bg-white dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
          Live Session Transcript
        </h3>
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {transcriptHistory.map((item, idx) => (
            <div
              key={idx}
              className={`p-3.5 rounded-2xl text-xs ${
                item.speaker === "user"
                  ? "bg-neutral-100 dark:bg-neutral-800 ml-8 text-neutral-900 dark:text-white"
                  : "bg-neutral-50 dark:bg-neutral-900/60 mr-8 text-neutral-800 dark:text-neutral-200 border border-neutral-200/60 dark:border-neutral-800"
              }`}
            >
              <div className="flex items-center justify-between text-[10px] text-neutral-400 mb-1 font-mono">
                <span className="uppercase font-bold">
                  {item.speaker === "user" ? "You" : "NEXA AI"}
                </span>
                <span>{item.time}</span>
              </div>
              <p className="leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
