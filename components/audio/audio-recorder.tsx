'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { 
  Mic, 
  MicOff, 
  Play, 
  Pause, 
  Square, 
  Download, 
  Trash2, 
  Volume2,
  FileAudio,
  Type,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AudioRecorderProps {
  onSave: (audioUrl: string, transcription?: string) => void;
  onTranscription?: (text: string) => void;
  maxDuration?: number; // in seconds
  enableTranscription?: boolean;
  initialAudioUrl?: string;
  readonly?: boolean;
}

export function AudioRecorder({ 
  onSave, 
  onTranscription, 
  maxDuration = 300, // 5 minutes
  enableTranscription = true,
  initialAudioUrl,
  readonly = false 
}: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(initialAudioUrl || null);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcription, setTranscription] = useState<string>('');
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);

  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const { toast } = useToast();

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Audio playback time updates
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [audioUrl]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      });
      
      streamRef.current = stream;
      chunksRef.current = [];

      mediaRecorder.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      mediaRecorder.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.current.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm;codecs=opus' });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        setAudioBlob(blob);
        
        // Auto-transcribe if enabled
        if (enableTranscription && !readonly) {
          await transcribeAudio(blob);
        }

        // Stop all tracks
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
      };

      mediaRecorder.current.start(100); // Capture audio in 100ms chunks
      setIsRecording(true);
      setCurrentTime(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= maxDuration) {
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);

      toast({
        title: "Recording started",
        description: "Speak clearly into your microphone",
      });

    } catch (error) {
      toast({
        title: "Recording failed",
        description: "Could not access microphone. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const pauseRecording = () => {
    if (mediaRecorder.current && isRecording) {
      if (isPaused) {
        mediaRecorder.current.resume();
        if (timerRef.current) {
          timerRef.current = setInterval(() => {
            setCurrentTime(prev => {
              if (prev >= maxDuration) {
                stopRecording();
                return prev;
              }
              return prev + 1;
            });
          }, 1000);
        }
      } else {
        mediaRecorder.current.pause();
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      }
      setIsPaused(!isPaused);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      toast({
        title: "Recording stopped",
        description: "Your audio has been saved",
      });
    }
  };

  const playAudio = () => {
    const audio = audioRef.current;
    if (audio) {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        audio.play();
        setIsPlaying(true);
      }
    }
  };

  const seekAudio = (percentage: number) => {
    const audio = audioRef.current;
    if (audio && duration) {
      const newTime = (percentage / 100) * duration;
      audio.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const transcribeAudio = async (blob: Blob) => {
    if (!enableTranscription) return;

    setIsTranscribing(true);
    try {
      // This is a placeholder for actual transcription service
      // You would integrate with services like:
      // - Web Speech API (for real-time)
      // - OpenAI Whisper API
      // - Google Cloud Speech-to-Text
      // - Azure Speech Services
      
      // Simulated transcription for now
      await new Promise(resolve => setTimeout(resolve, 2000));
      const mockTranscription = "This is a transcribed version of your audio recording.";
      
      setTranscription(mockTranscription);
      if (onTranscription) {
        onTranscription(mockTranscription);
      }

      toast({
        title: "Transcription complete",
        description: "Audio has been converted to text",
      });

    } catch (error) {
      toast({
        title: "Transcription failed",
        description: "Could not convert audio to text",
        variant: "destructive",
      });
    } finally {
      setIsTranscribing(false);
    }
  };

  const saveAudio = () => {
    if (audioUrl) {
      onSave(audioUrl, transcription);
      toast({
        title: "Audio saved",
        description: "Your recording has been saved to the note",
      });
    }
  };

  const downloadAudio = () => {
    if (audioUrl) {
      const link = document.createElement('a');
      link.href = audioUrl;
      link.download = `recording_${new Date().toISOString().slice(0, 19)}.webm`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const deleteAudio = () => {
    setAudioUrl(null);
    setAudioBlob(null);
    setTranscription('');
    setCurrentTime(0);
    setDuration(0);
    setIsPlaying(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <FileAudio className="h-5 w-5" />
          Audio Recorder
        </h3>
        {audioUrl && (
          <div className="text-sm text-muted-foreground">
            Duration: {formatTime(duration)}
          </div>
        )}
      </div>

      {/* Recording Controls */}
      {!readonly && (
        <div className="flex items-center justify-center gap-2">
          {!isRecording ? (
            <Button
              onClick={startRecording}
              disabled={isRecording}
              className="h-12 px-6"
            >
              <Mic className="h-5 w-5 mr-2" />
              Start Recording
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                onClick={pauseRecording}
                variant="outline"
                className="h-12 px-4"
              >
                {isPaused ? <Mic className="h-5 w-5" /> : <Pause className="h-5 w-5" />}
              </Button>
              <Button
                onClick={stopRecording}
                variant="destructive"
                className="h-12 px-4"
              >
                <Square className="h-5 w-5" />
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Recording Status */}
      {isRecording && (
        <div className="space-y-2">
          <div className="flex items-center justify-center gap-2 text-red-500">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            <span className="font-medium">
              {isPaused ? 'PAUSED' : 'RECORDING'} {formatTime(currentTime)}
            </span>
          </div>
          <Progress 
            value={(currentTime / maxDuration) * 100} 
            className="w-full"
          />
        </div>
      )}

      {/* Audio Playback */}
      {audioUrl && (
        <div className="space-y-4">
          <audio ref={audioRef} src={audioUrl} preload="metadata" />
          
          <div className="flex items-center gap-4">
            <Button
              onClick={playAudio}
              variant="outline"
              size="sm"
              className="h-10 w-10 p-0"
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            
            <div className="flex-1 space-y-1">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
              <Progress 
                value={duration ? (currentTime / duration) * 100 : 0}
                className="cursor-pointer"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const percentage = ((e.clientX - rect.left) / rect.width) * 100;
                  seekAudio(percentage);
                }}
              />
            </div>
          </div>

          {/* Audio Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {!readonly && (
                <Button onClick={saveAudio} size="sm">
                  Save
                </Button>
              )}
              <Button onClick={downloadAudio} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-1" />
                Download
              </Button>
            </div>
            
            {!readonly && (
              <Button 
                onClick={deleteAudio} 
                variant="ghost" 
                size="sm"
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Transcription */}
      {enableTranscription && (transcription || isTranscribing) && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Type className="h-4 w-4" />
            <span className="font-medium text-sm">Transcription</span>
            {isTranscribing && <Loader2 className="h-4 w-4 animate-spin" />}
          </div>
          
          {isTranscribing ? (
            <div className="p-3 bg-muted rounded-md">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Converting speech to text...
              </div>
            </div>
          ) : (
            <div className="p-3 bg-muted rounded-md text-sm">
              {transcription}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
