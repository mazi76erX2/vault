import React, { useState, useRef } from "react";
import { Mic, Square, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Api from "@/services/Instance";

interface VoiceRecorderProps {
  chatId: string;
  onTranscription: (text: string) => void;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  chatId,
  onTranscription,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
        await uploadAudio(audioBlob);

        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      toast.success("Recording started");
    } catch (error) {
      console.error("Error starting recording:", error);
      toast.error("Failed to access microphone");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const uploadAudio = async (audioBlob: Blob) => {
    try {
      setIsProcessing(true);

      const formData = new FormData();
      formData.append("audio", audioBlob, "recording.webm");
      formData.append("chat_id", chatId);

      const response = await Api.post("/api/v1/helper/upload_voice", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.transcription) {
        onTranscription(response.data.transcription);
        toast.success("Voice transcribed");
      }
    } catch (error: any) {
      console.error("Error uploading audio:", error);
      toast.error(error.response?.data?.detail || "Failed to transcribe audio");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {isProcessing ? (
        <Button disabled size="icon" variant="outline">
          <Loader2 className="w-4 h-4 animate-spin" />
        </Button>
      ) : isRecording ? (
        <Button
          onClick={stopRecording}
          size="icon"
          variant="destructive"
          className="animate-pulse"
        >
          <Square className="w-4 h-4" />
        </Button>
      ) : (
        <Button onClick={startRecording} size="icon" variant="outline">
          <Mic className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
};
