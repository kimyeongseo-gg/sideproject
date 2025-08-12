import { useState } from 'react';
import { Settings, Bell } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DetectionSettings, NotificationSettings } from '@/types/posture';

interface SettingsPanelProps {
  detectionSettings: DetectionSettings;
  notificationSettings: NotificationSettings;
  onDetectionSettingsChange: (settings: DetectionSettings) => void;
  onNotificationSettingsChange: (settings: NotificationSettings) => void;
}

export function SettingsPanel({
  detectionSettings,
  notificationSettings,
  onDetectionSettingsChange,
  onNotificationSettingsChange,
}: SettingsPanelProps) {
  
  const handleDetectionChange = (key: keyof DetectionSettings, value: any) => {
    onDetectionSettingsChange({
      ...detectionSettings,
      [key]: value,
    });
  };

  const handleNotificationChange = (key: keyof NotificationSettings, value: any) => {
    onNotificationSettingsChange({
      ...notificationSettings,
      [key]: value,
    });
  };

  return (
    <div className="space-y-6">
      {/* Detection Settings */}
      <div className="glassmorphism dark:glassmorphism-dark rounded-3xl p-6 shadow-xl">
        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center">
          <Settings className="text-secondary mr-2 h-5 w-5" />
          감지 설정
        </h3>
        
        <div className="space-y-4">
          {/* Turtle Neck Detection */}
          <div className="bg-white/50 dark:bg-slate-700/50 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <label className="font-medium text-slate-700 dark:text-slate-200">거북목 감지</label>
              <Switch
                checked={detectionSettings.turtleNeckEnabled}
                onCheckedChange={(checked) => handleDetectionChange('turtleNeckEnabled', checked)}
                data-testid="switch-turtle-neck-detection"
              />
            </div>
            {detectionSettings.turtleNeckEnabled && (
              <div className="space-y-2">
                <label className="text-sm text-slate-600 dark:text-slate-400">민감도</label>
                <Slider
                  value={[detectionSettings.turtleNeckSensitivity]}
                  onValueChange={(value) => handleDetectionChange('turtleNeckSensitivity', value[0])}
                  min={1}
                  max={10}
                  step={1}
                  className="w-full"
                  data-testid="slider-turtle-neck-sensitivity"
                />
                <div className="flex justify-between text-xs text-slate-500">
                  <span>낮음</span>
                  <span>높음</span>
                </div>
              </div>
            )}
          </div>
          
          {/* Nail Biting Detection */}
          <div className="bg-white/50 dark:bg-slate-700/50 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <label className="font-medium text-slate-700 dark:text-slate-200">손톱 물어뜯기 감지</label>
              <Switch
                checked={detectionSettings.nailBitingEnabled}
                onCheckedChange={(checked) => handleDetectionChange('nailBitingEnabled', checked)}
                data-testid="switch-nail-biting-detection"
              />
            </div>
            {detectionSettings.nailBitingEnabled && (
              <div className="space-y-2">
                <label className="text-sm text-slate-600 dark:text-slate-400">민감도</label>
                <Slider
                  value={[detectionSettings.nailBitingSensitivity]}
                  onValueChange={(value) => handleDetectionChange('nailBitingSensitivity', value[0])}
                  min={1}
                  max={10}
                  step={1}
                  className="w-full"
                  data-testid="slider-nail-biting-sensitivity"
                />
                <div className="flex justify-between text-xs text-slate-500">
                  <span>낮음</span>
                  <span>높음</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Notification Settings */}
      <div className="glassmorphism dark:glassmorphism-dark rounded-3xl p-6 shadow-xl">
        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center">
          <Bell className="text-warning mr-2 h-5 w-5" />
          알림 설정
        </h3>
        
        <div className="space-y-4">
          {/* Sound Notifications */}
          <div className="bg-white/50 dark:bg-slate-700/50 rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <label className="font-medium text-slate-700 dark:text-slate-200">소리 알림</label>
              <Switch
                checked={notificationSettings.soundEnabled}
                onCheckedChange={(checked) => handleNotificationChange('soundEnabled', checked)}
                data-testid="switch-sound-notifications"
              />
            </div>
          </div>
          
          {/* Visual Notifications */}
          <div className="bg-white/50 dark:bg-slate-700/50 rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <label className="font-medium text-slate-700 dark:text-slate-200">시각적 알림</label>
              <Switch
                checked={notificationSettings.visualEnabled}
                onCheckedChange={(checked) => handleNotificationChange('visualEnabled', checked)}
                data-testid="switch-visual-notifications"
              />
            </div>
          </div>
          
          {/* Notification Frequency */}
          <div className="bg-white/50 dark:bg-slate-700/50 rounded-2xl p-4">
            <label className="block font-medium text-slate-700 dark:text-slate-200 mb-2">알림 주기</label>
            <Select
              value={notificationSettings.frequency}
              onValueChange={(value: "immediate" | "5s" | "10s" | "30s") => handleNotificationChange('frequency', value)}
            >
              <SelectTrigger className="w-full" data-testid="select-notification-frequency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="immediate">즉시</SelectItem>
                <SelectItem value="5s">5초 후</SelectItem>
                <SelectItem value="10s">10초 후</SelectItem>
                <SelectItem value="30s">30초 후</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}
