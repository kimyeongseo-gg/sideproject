import { useState, useEffect, useRef } from 'react';

export function useWebcam() {
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [currentDeviceId, setCurrentDeviceId] = useState<string>('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const getDevices = async () => {
    try {
      const deviceList = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = deviceList.filter(device => device.kind === 'videoinput');
      setDevices(videoDevices);
      
      if (videoDevices.length > 0 && !currentDeviceId) {
        setCurrentDeviceId(videoDevices[0].deviceId);
      }
    } catch (err) {
      console.error('Error getting devices:', err);
      setError('카메라 장치를 찾을 수 없습니다.');
    }
  };

  const startCamera = async (deviceId?: string) => {
    try {
      setError(null);
      
      const constraints: MediaStreamConstraints = {
        video: {
          deviceId: deviceId || currentDeviceId,
          width: { ideal: 640 },
          height: { ideal: 480 },
          frameRate: { ideal: 30 }
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsActive(true);
      }
    } catch (err) {
      console.error('Error starting camera:', err);
      setError('카메라에 접근할 수 없습니다. 권한을 확인해 주세요.');
      setIsActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setIsActive(false);
  };

  const switchCamera = async () => {
    if (devices.length <= 1) return;
    
    const currentIndex = devices.findIndex(device => device.deviceId === currentDeviceId);
    const nextIndex = (currentIndex + 1) % devices.length;
    const nextDeviceId = devices[nextIndex].deviceId;
    
    stopCamera();
    setCurrentDeviceId(nextDeviceId);
    await startCamera(nextDeviceId);
  };

  const captureScreenshot = (): string | null => {
    if (!videoRef.current || !isActive) return null;
    
    const canvas = document.createElement('canvas');
    const video = videoRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    
    ctx.drawImage(video, 0, 0);
    return canvas.toDataURL('image/png');
  };

  useEffect(() => {
    getDevices();
    
    return () => {
      stopCamera();
    };
  }, []);

  return {
    videoRef,
    isActive,
    error,
    devices,
    currentDeviceId,
    startCamera,
    stopCamera,
    switchCamera,
    captureScreenshot,
    setCurrentDeviceId
  };
}
