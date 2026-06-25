"use client";

import { useState, useEffect, useRef } from "react";
import { Mic, Square, Loader2, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
const useToast = () => ({
  toast: (options: any) => alert(`${options.title}\n${options.description || ""}`)
});
import { submitIssueAction } from "@/app/(dashboard)/report/actions";
import { useRouter } from "next/navigation";

export function VoiceReportFAB() {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef<any>(null);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    // Initialize Web Speech API if supported
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          let currentTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
          }
          setTranscript(currentTranscript);
        };

        recognition.onerror = (event: any) => {
          console.warn("Speech recognition error:", event.error);
          setIsRecording(false);
          
          if (event.error === 'not-allowed') {
            toast({
              title: "Microphone Blocked",
              description: "Please click the lock icon in your URL bar and allow microphone access.",
              variant: "destructive"
            });
          } else {
            toast({
              title: "Microphone Error",
              description: `Could not start recording. Error: ${event.error}`,
              variant: "destructive"
            });
          }
        };

        recognitionRef.current = recognition;
      }
    }
  }, [toast]);

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      toast({
        title: "Not Supported",
        description: "Voice reporting is not supported in this browser. Please use Chrome.",
        variant: "destructive"
      });
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
      processRecording();
    } else {
      setTranscript("");
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  const processRecording = async () => {
    if (!transcript.trim()) {
      toast({
        title: "No speech detected",
        description: "Please try again and speak clearly.",
      });
      return;
    }

    setIsProcessing(true);
    
    // Simulate AI parsing the voice command (we can use our existing AI route or just mock it)
    try {
      const mockParsedData = {
        title: "Voice Reported Issue",
        description: transcript,
        category: "other",
        severity_score: 5,
        lat: 28.6139, // Delhi
        lng: 77.2090,
        formatted_address: "Extracted from voice"
      };

      const result = await submitIssueAction(mockParsedData);
      
      setIsProcessing(false);
      
      if (result.success) {
        setIsSuccess(true);
        setTimeout(() => {
          setIsSuccess(false);
          setTranscript("");
          router.push(`/issues/${result.issueId}`); // Assuming it returns issueId, or just to dashboard
        }, 3000);
      } else {
        toast({
          title: "Submission Failed",
          description: result.error || "Something went wrong.",
          variant: "destructive"
        });
      }
    } catch (error) {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
      <AnimatePresence>
        {(isRecording || isProcessing || isSuccess) && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="bg-card border shadow-xl rounded-xl p-4 w-72 origin-bottom-right"
          >
            {isRecording && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-red-500 font-semibold animate-pulse">
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                  Recording...
                </div>
                <p className="text-sm text-muted-foreground italic h-16 overflow-y-auto">
                  {transcript || "Listening..."}
                </p>
              </div>
            )}
            
            {isProcessing && (
              <div className="flex flex-col items-center justify-center py-4 space-y-3">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-sm font-medium">AI is structuring your report...</p>
              </div>
            )}

            {isSuccess && (
              <div className="flex flex-col items-center justify-center py-4 space-y-3">
                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                <p className="text-sm font-medium text-emerald-600">Report Filed Successfully!</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleRecording}
        disabled={isProcessing || isSuccess}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-colors ${
          isRecording 
            ? "bg-red-500 text-white hover:bg-red-600" 
            : "bg-primary text-primary-foreground hover:bg-primary/90"
        }`}
      >
        {isRecording ? <Square className="w-6 h-6 fill-current" /> : <Mic className="w-6 h-6" />}
      </motion.button>
    </div>
  );
}
