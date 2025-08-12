import { useState, useEffect, useRef, useCallback } from 'react';
import { poseDetection } from '@/lib/pose-detection';
import { postureAnalyzer } from '@/lib/posture-analysis';
import { PostureStatus, PostureData, TurtleNeckData, NailBitingData } from '@/types/posture';
import { Keypoint } from '@tensorflow-models/posenet';

interface UsePostureDetectionProps {
  videoElement: HTMLVideoElement | null;
  canvasElement: HTMLCanvasElement | null;
  isActive: boolean;
  turtleNeckEnabled: boolean;
  nailBitingEnabled: boolean;
  turtleNeckSensitivity: number;
  nailBitingSensitivity: number;
}

export function usePostureDetection({
  videoElement,
  canvasElement,
  isActive,
  turtleNeckEnabled,
  nailBitingEnabled,
  turtleNeckSensitivity,
  nailBitingSensitivity
}: UsePostureDetectionProps) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentPosture, setCurrentPosture] = useState<PostureData>({
    status: 'good',
    confidence: 0,
    timestamp: Date.now()
  });
  const [turtleNeckData, setTurtleNeckData] = useState<TurtleNeckData>({
    neckAngle: 0,
    shoulderAngle: 0,
    isDetected: false,
    confidence: 0
  });
  const [nailBitingData, setNailBitingData] = useState<NailBitingData>({
    handToFaceDistance: 0,
    isDetected: false,
    confidence: 0
  });
  const [error, setError] = useState<string | null>(null);
  
  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastDetectionTime = useRef<number>(0);

  const initializePoseDetection = useCallback(async () => {
    try {
      setError(null);
      await poseDetection.initialize();
      setIsInitialized(true);
    } catch (err) {
      console.error('Failed to initialize pose detection:', err);
      setError('자세 감지를 초기화할 수 없습니다.');
    }
  }, []);

  const detectPosture = useCallback(async () => {
    if (!videoElement || !canvasElement || !isInitialized || !isActive) {
      return;
    }

    // Throttle detection to avoid performance issues
    const now = Date.now();
    if (now - lastDetectionTime.current < 200) { // 5 FPS
      return;
    }
    lastDetectionTime.current = now;

    try {
      const pose = await poseDetection.detectPose(videoElement);
      
      if (!pose || !pose.keypoints) {
        return;
      }

      // Draw pose on canvas
      poseDetection.drawKeypoints(canvasElement, pose.keypoints);

      // Analyze posture
      const turtleNeck = postureAnalyzer.analyzeTurtleNeck(pose.keypoints, turtleNeckSensitivity);
      const nailBiting = postureAnalyzer.analyzeNailBiting(pose.keypoints, nailBitingSensitivity);
      
      setTurtleNeckData(turtleNeck);
      setNailBitingData(nailBiting);

      // Determine overall posture status
      const status = postureAnalyzer.analyzePosture(
        pose.keypoints,
        turtleNeckSensitivity,
        nailBitingSensitivity,
        turtleNeckEnabled,
        nailBitingEnabled
      );

      // Calculate overall confidence
      const confidence = pose.score || 0;

      setCurrentPosture({
        status,
        confidence,
        timestamp: now
      });

    } catch (err) {
      console.error('Error during posture detection:', err);
    }
  }, [
    videoElement,
    canvasElement,
    isInitialized,
    isActive,
    turtleNeckEnabled,
    nailBitingEnabled,
    turtleNeckSensitivity,
    nailBitingSensitivity
  ]);

  useEffect(() => {
    if (isActive && !isInitialized) {
      initializePoseDetection();
    }
  }, [isActive, isInitialized, initializePoseDetection]);

  useEffect(() => {
    if (isActive && isInitialized) {
      // Start detection loop
      detectionIntervalRef.current = setInterval(detectPosture, 200);
    } else {
      // Stop detection loop
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
        detectionIntervalRef.current = null;
      }
    }

    return () => {
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }
    };
  }, [isActive, isInitialized, detectPosture]);

  useEffect(() => {
    return () => {
      poseDetection.dispose();
    };
  }, []);

  return {
    isInitialized,
    currentPosture,
    turtleNeckData,
    nailBitingData,
    error
  };
}
