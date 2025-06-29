import React, { useState, useRef } from 'react';
import { Video, Mic, Play, Pause, Upload, Download, Trash2 } from 'lucide-react';
import { Button } from '../../ui/Button';
import { Card } from '../../ui/Card';

interface VideoResumeStepProps {
  videoUrl?: string;
  voiceUrl?: string;
  onVideoChange: (url: string) => void;
  onVoiceChange: (url: string) => void;
}

export const VideoResumeStep: React.FC<VideoResumeStepProps> = ({
  videoUrl,
  voiceUrl,
  onVideoChange,
  onVoiceChange,
}) => {
  const [isRecordingVideo, setIsRecordingVideo] = useState(false);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startVideoRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      const chunks: BlobPart[] = [];
      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        onVideoChange(url);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
        if (videoRef.current) {
          videoRef.current.srcObject = null;
        }
      };

      mediaRecorder.start();
      setIsRecordingVideo(true);
      startTimer();
    } catch (error) {
      console.error('Error starting video recording:', error);
    }
  };

  const stopVideoRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    setIsRecordingVideo(false);
    setRecordingTime(0);
  };

  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      const chunks: BlobPart[] = [];
      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        onVoiceChange(url);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecordingVoice(true);
      startTimer();
    } catch (error) {
      console.error('Error starting voice recording:', error);
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    setIsRecordingVoice(false);
    setRecordingTime(0);
  };

  const startTimer = () => {
    const interval = setInterval(() => {
      setRecordingTime(prev => {
        if (prev >= 30) { // 30 second limit
          if (isRecordingVideo) stopVideoRecording();
          if (isRecordingVoice) stopVoiceRecording();
          clearInterval(interval);
          return 0;
        }
        return prev + 1;
      });
    }, 1000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Video & Voice Resume
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Stand out with a personal video introduction or voice message (30 seconds max)
        </p>
      </div>

      {/* Video Resume Section */}
      <Card>
        <div className="flex items-center space-x-2 mb-4">
          <Video className="w-5 h-5 text-blue-600" />
          <h4 className="text-md font-medium text-gray-900 dark:text-white">
            Video Resume
          </h4>
        </div>

        {isRecordingVideo ? (
          <div className="space-y-4">
            <video
              ref={videoRef}
              autoPlay
              muted
              className="w-full max-w-md mx-auto rounded-lg bg-gray-900"
            />
            <div className="text-center">
              <div className="text-2xl font-mono text-red-600 mb-4">
                {formatTime(recordingTime)} / 0:30
              </div>
              <Button
                variant="danger"
                onClick={stopVideoRecording}
                icon={<Pause className="w-4 h-4" />}
              >
                Stop Recording
              </Button>
            </div>
          </div>
        ) : videoUrl ? (
          <div className="space-y-4">
            <video
              src={videoUrl}
              controls
              className="w-full max-w-md mx-auto rounded-lg"
            />
            <div className="flex justify-center space-x-2">
              <Button
                variant="outline"
                onClick={startVideoRecording}
                icon={<Video className="w-4 h-4" />}
              >
                Re-record
              </Button>
              <Button
                variant="outline"
                onClick={() => onVideoChange('')}
                icon={<Trash2 className="w-4 h-4" />}
              >
                Delete
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <Video className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Record a short video introducing yourself
            </p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <Button
                variant="primary"
                onClick={startVideoRecording}
                icon={<Video className="w-4 h-4" />}
              >
                Start Recording
              </Button>
              <Button
                variant="outline"
                icon={<Upload className="w-4 h-4" />}
              >
                Upload Video
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Voice Resume Section */}
      <Card>
        <div className="flex items-center space-x-2 mb-4">
          <Mic className="w-5 h-5 text-green-600" />
          <h4 className="text-md font-medium text-gray-900 dark:text-white">
            Voice Resume
          </h4>
        </div>

        {isRecordingVoice ? (
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center animate-pulse">
                <Mic className="w-8 h-8 text-white" />
              </div>
            </div>
            <div className="text-2xl font-mono text-red-600">
              {formatTime(recordingTime)} / 0:30
            </div>
            <Button
              variant="danger"
              onClick={stopVoiceRecording}
              icon={<Pause className="w-4 h-4" />}
            >
              Stop Recording
            </Button>
          </div>
        ) : voiceUrl ? (
          <div className="space-y-4">
            <audio
              src={voiceUrl}
              controls
              className="w-full max-w-md mx-auto"
            />
            <div className="flex justify-center space-x-2">
              <Button
                variant="outline"
                onClick={startVoiceRecording}
                icon={<Mic className="w-4 h-4" />}
              >
                Re-record
              </Button>
              <Button
                variant="outline"
                onClick={() => onVoiceChange('')}
                icon={<Trash2 className="w-4 h-4" />}
              >
                Delete
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <Mic className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Record a voice message highlighting your key strengths
            </p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <Button
                variant="secondary"
                onClick={startVoiceRecording}
                icon={<Mic className="w-4 h-4" />}
              >
                Start Recording
              </Button>
              <Button
                variant="outline"
                icon={<Upload className="w-4 h-4" />}
              >
                Upload Audio
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Tips */}
      <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <h4 className="text-md font-medium text-blue-900 dark:text-blue-300 mb-2">
          Recording Tips
        </h4>
        <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-1">
          <li>• Keep it concise - you have 30 seconds maximum</li>
          <li>• Speak clearly and at a moderate pace</li>
          <li>• Mention your key skills and what makes you unique</li>
          <li>• Smile and maintain good posture for video</li>
          <li>• Test your microphone and camera beforehand</li>
        </ul>
      </Card>
    </div>
  );
};