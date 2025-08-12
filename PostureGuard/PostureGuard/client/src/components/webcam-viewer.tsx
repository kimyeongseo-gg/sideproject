import { useRef, useEffect } from 'react';
import { Camera, RotateCcw, Download, Play, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWebcam } from '@/hooks/use-webcam';
import { usePostureDetection } from '@/hooks/use-posture-detection';
import { DetectionSettings } from '@/types/posture';

interface WebcamViewerProps {
  detectionSettings: DetectionSettings;
  onPostureChange: (status: string) => void;
}

export function WebcamViewer({ detectionSettings, onPostureChange }: WebcamViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const {
    videoRef,
    isActive,
    error,
    startCamera,
    stopCamera,
    switchCamera,
    captureScreenshot,
  } = useWebcam();

  const { currentPosture, error: detectionError } = usePostureDetection({
    videoElement: videoRef.current,
    canvasElement: canvasRef.current,
    isActive,
    turtleNeckEnabled: detectionSettings.turtleNeckEnabled,
    nailBitingEnabled: detectionSettings.nailBitingEnabled,
    turtleNeckSensitivity: detectionSettings.turtleNeckSensitivity,
    nailBitingSensitivity: detectionSettings.nailBitingSensitivity,
  });

  useEffect(() => {
    onPostureChange(currentPosture.status);
  }, [currentPosture.status, onPostureChange]);

  const handleToggleCamera = () => {
    if (isActive) {
      stopCamera();
    } else {
      startCamera();
    }
  };

  const handleCapture = () => {
    const dataUrl = captureScreenshot();
    if (dataUrl) {
      const link = document.createElement('a');
      link.download = `posture-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    }
  };

  return (
    <div className="glassmorphism dark:glassmorphism-dark rounded-3xl p-6 shadow-xl">
      <div className="relative aspect-video bg-slate-100 dark:bg-slate-700 rounded-2xl overflow-hidden">
        {/* Video Element */}
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="w-full h-full object-cover"
          data-testid="video-webcam-feed"
        />
        
        {/* Canvas Overlay for Pose Detection */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none"
          width={640}
          height={480}
          data-testid="canvas-pose-overlay"
        />
        
        {/* Status Indicator */}
        <div className="absolute top-4 right-4 glassmorphism dark:glassmorphism-dark rounded-2xl px-4 py-2">
          <div className="flex items-center space-x-2">
            <div 
              className={`w-3 h-3 rounded-full animate-pulse ${
                currentPosture.status === 'good' 
                  ? 'bg-success' 
                  : currentPosture.status === 'turtle_neck'
                  ? 'bg-warning'
                  : 'bg-danger'
              }`}
              data-testid="indicator-posture-status"
            />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
              {currentPosture.status === 'good' && '정상 자세'}
              {currentPosture.status === 'turtle_neck' && '거북목 감지'}
              {currentPosture.status === 'nail_biting' && '손톱 물어뜯기 감지'}
            </span>
          </div>
        </div>
        
        {/* Error Display */}
        {(error || detectionError) && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="glassmorphism dark:glassmorphism-dark rounded-2xl p-6 text-center">
              <p className="text-white mb-4">{error || detectionError}</p>
              {error && (
                <Button 
                  onClick={() => startCamera()} 
                  variant="outline"
                  data-testid="button-retry-camera"
                >
                  다시 시도
                </Button>
              )}
            </div>
          </div>
        )}
        
        {/* Camera Controls */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
          <div className="glassmorphism dark:glassmorphism-dark rounded-2xl px-6 py-3">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleToggleCamera}
                className="hover:scale-105 transition-transform p-2"
                data-testid="button-toggle-camera"
              >
                {isActive ? (
                  <Square className="h-5 w-5 text-slate-700 dark:text-slate-200" />
                ) : (
                  <Play className="h-5 w-5 text-slate-700 dark:text-slate-200" />
                )}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={switchCamera}
                disabled={!isActive}
                className="hover:scale-105 transition-transform p-2"
                data-testid="button-switch-camera"
              >
                <RotateCcw className="h-5 w-5 text-slate-700 dark:text-slate-200" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCapture}
                disabled={!isActive}
                className="hover:scale-105 transition-transform p-2"
                data-testid="button-capture-screenshot"
              >
                <Download className="h-5 w-5 text-slate-700 dark:text-slate-200" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
