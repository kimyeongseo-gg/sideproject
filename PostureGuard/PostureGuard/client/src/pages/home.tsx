import { useState, useEffect, useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Play, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { WebcamViewer } from '@/components/webcam-viewer';
import { TurtleStatus } from '@/components/turtle-status';
import { StatsPanel } from '@/components/stats-panel';
import { SettingsPanel } from '@/components/settings-panel';
import { NotificationToast } from '@/components/notification-toast';
import { DetectionSettings, NotificationSettings, PostureStatus } from '@/types/posture';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

const DEFAULT_USER_ID = 'demo-user'; // For demo purposes

export default function Home() {
  const [currentPosture, setCurrentPosture] = useState<PostureStatus>('good');
  const [sessionActive, setSessionActive] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [showNotification, setShowNotification] = useState(false);
  const [lastNotificationTime, setLastNotificationTime] = useState<number>(0);
  
  const [detectionSettings, setDetectionSettings] = useState<DetectionSettings>({
    turtleNeckEnabled: true,
    nailBitingEnabled: true,
    turtleNeckSensitivity: 7,
    nailBitingSensitivity: 5,
  });

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    soundEnabled: true,
    visualEnabled: true,
    frequency: '5s',
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Load user settings
  const { data: userSettings } = useQuery({
    queryKey: ['/api/settings', DEFAULT_USER_ID],
  });

  // Update settings when loaded
  useEffect(() => {
    if (userSettings) {
      setDetectionSettings({
        turtleNeckEnabled: userSettings.turtleNeckDetectionEnabled,
        nailBitingEnabled: userSettings.nailBitingDetectionEnabled,
        turtleNeckSensitivity: userSettings.turtleNeckSensitivity,
        nailBitingSensitivity: userSettings.nailBitingSensitivity,
      });
      
      setNotificationSettings({
        soundEnabled: userSettings.soundNotificationsEnabled,
        visualEnabled: userSettings.visualNotificationsEnabled,
        frequency: userSettings.notificationFrequency as "immediate" | "5s" | "10s" | "30s",
      });
    }
  }, [userSettings]);

  // Start session mutation
  const startSessionMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/sessions', {
        userId: DEFAULT_USER_ID,
      });
      return response.json();
    },
    onSuccess: (session) => {
      setCurrentSessionId(session.id);
      setSessionActive(true);
      toast({
        title: '세션이 시작되었습니다',
        description: '자세 감지를 시작합니다.',
      });
    },
    onError: () => {
      toast({
        title: '세션 시작 실패',
        description: '다시 시도해 주세요.',
        variant: 'destructive',
      });
    },
  });

  // Update session mutation
  const updateSessionMutation = useMutation({
    mutationFn: async (updates: any) => {
      if (!currentSessionId) return;
      const response = await apiRequest('PATCH', `/api/sessions/${currentSessionId}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sessions', DEFAULT_USER_ID] });
    },
  });

  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (settings: any) => {
      const response = await apiRequest('PATCH', `/api/settings/${DEFAULT_USER_ID}`, settings);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/settings', DEFAULT_USER_ID] });
    },
  });

  // Handle posture change
  const handlePostureChange = useCallback((status: string) => {
    const newStatus = status as PostureStatus;
    setCurrentPosture(newStatus);

    // Update session if active
    if (sessionActive && currentSessionId) {
      if (newStatus !== 'good') {
        updateSessionMutation.mutate({
          totalWarnings: (userSettings?.totalWarnings || 0) + 1,
          turtleNeckWarnings: newStatus === 'turtle_neck' ? (userSettings?.turtleNeckWarnings || 0) + 1 : undefined,
          nailBitingWarnings: newStatus === 'nail_biting' ? (userSettings?.nailBitingWarnings || 0) + 1 : undefined,
        });
      }
    }

    // Show notification
    if (newStatus !== 'good' && notificationSettings.visualEnabled) {
      const now = Date.now();
      const frequencyMs = notificationSettings.frequency === 'immediate' ? 0 :
                         notificationSettings.frequency === '5s' ? 5000 :
                         notificationSettings.frequency === '10s' ? 10000 : 30000;

      if (now - lastNotificationTime > frequencyMs) {
        setShowNotification(true);
        setLastNotificationTime(now);
        
        // Auto dismiss after 5 seconds
        setTimeout(() => setShowNotification(false), 5000);
      }
    }

    // Play notification sound
    if (newStatus !== 'good' && notificationSettings.soundEnabled) {
      // Create audio context for notification sound
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.2);
      } catch (error) {
        console.warn('Audio notification failed:', error);
      }
    }
  }, [sessionActive, currentSessionId, notificationSettings, lastNotificationTime, updateSessionMutation, userSettings]);

  // Handle settings changes
  const handleDetectionSettingsChange = useCallback((settings: DetectionSettings) => {
    setDetectionSettings(settings);
    updateSettingsMutation.mutate({
      turtleNeckDetectionEnabled: settings.turtleNeckEnabled,
      nailBitingDetectionEnabled: settings.nailBitingEnabled,
      turtleNeckSensitivity: settings.turtleNeckSensitivity,
      nailBitingSensitivity: settings.nailBitingSensitivity,
    });
  }, [updateSettingsMutation]);

  const handleNotificationSettingsChange = useCallback((settings: NotificationSettings) => {
    setNotificationSettings(settings);
    updateSettingsMutation.mutate({
      soundNotificationsEnabled: settings.soundEnabled,
      visualNotificationsEnabled: settings.visualEnabled,
      notificationFrequency: settings.frequency,
    });
  }, [updateSettingsMutation]);

  const handleStartSession = () => {
    if (sessionActive) {
      // End current session
      if (currentSessionId) {
        updateSessionMutation.mutate({ endTime: new Date() });
      }
      setSessionActive(false);
      setCurrentSessionId(null);
      toast({
        title: '세션이 종료되었습니다',
        description: '자세 감지를 중단합니다.',
      });
    } else {
      // Start new session
      startSessionMutation.mutate();
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      {/* Header Section */}
      <header className="text-center mb-8">
        <div className="glassmorphism dark:glassmorphism-dark rounded-2xl p-6 shadow-lg">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="text-4xl animate-bounce-gentle">🐢</div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                자세교정 도우미
              </h1>
            </div>
            
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* Main Webcam and Status Section */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Webcam Viewer */}
          <WebcamViewer
            detectionSettings={detectionSettings}
            onPostureChange={handlePostureChange}
          />
          
          {/* Turtle Status Character */}
          <TurtleStatus status={currentPosture} />
        </div>
        
        {/* Right Sidebar - Controls and Stats */}
        <div className="space-y-6">
          
          {/* Quick Stats */}
          <StatsPanel userId={DEFAULT_USER_ID} />
          
          {/* Detection Settings */}
          <SettingsPanel
            detectionSettings={detectionSettings}
            notificationSettings={notificationSettings}
            onDetectionSettingsChange={handleDetectionSettingsChange}
            onNotificationSettingsChange={handleNotificationSettingsChange}
          />
          
          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={handleStartSession}
              disabled={startSessionMutation.isPending}
              className="w-full bg-gradient-to-r from-primary to-secondary text-white font-bold py-4 px-6 rounded-2xl hover:scale-[1.02] transition-transform shadow-lg"
              data-testid="button-toggle-session"
            >
              <Play className="mr-2 h-5 w-5" />
              {sessionActive ? '세션 종료' : '세션 시작'}
            </Button>
            
            <Button
              variant="ghost"
              className="w-full glassmorphism dark:glassmorphism-dark text-slate-700 dark:text-slate-200 font-semibold py-4 px-6 rounded-2xl hover:scale-[1.02] transition-transform border-0"
              data-testid="button-view-statistics"
            >
              <BarChart3 className="mr-2 h-5 w-5" />
              상세 통계 보기
            </Button>
          </div>
        </div>
      </div>
      
      {/* Notification Toast */}
      <NotificationToast
        status={currentPosture}
        isVisible={showNotification}
        onDismiss={() => setShowNotification(false)}
      />
    </div>
  );
}
