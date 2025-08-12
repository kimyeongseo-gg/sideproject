import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PostureStatus } from '@/types/posture';

interface NotificationToastProps {
  status: PostureStatus;
  isVisible: boolean;
  onDismiss: () => void;
}

export function NotificationToast({ status, isVisible, onDismiss }: NotificationToastProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setMounted(true);
    } else {
      const timer = setTimeout(() => setMounted(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  const getNotificationData = (status: PostureStatus) => {
    switch (status) {
      case 'turtle_neck':
        return {
          icon: '⚠️',
          title: '자세 교정이 필요해요!',
          message: '목이 앞으로 나와있어요. 어깨를 뒤로 젖히고 턱을 당겨보세요.',
        };
      case 'nail_biting':
        return {
          icon: '🚫',
          title: '손톱 물어뜯기가 감지되었어요!',
          message: '손을 입에서 떨어뜨리고 다른 활동으로 주의를 돌려보세요.',
        };
      default:
        return {
          icon: '✅',
          title: '좋은 자세예요!',
          message: '현재 자세를 계속 유지해 주세요.',
        };
    }
  };

  if (!mounted) return null;

  const notificationData = getNotificationData(status);

  return (
    <div 
      className={`fixed top-4 right-4 glassmorphism dark:glassmorphism-dark rounded-2xl p-4 shadow-xl z-50 max-w-sm transition-transform duration-300 ${
        isVisible ? 'translate-x-0' : 'translate-x-full'
      }`}
      data-testid="notification-toast"
    >
      <div className="flex items-start space-x-3">
        <div className="text-2xl">{notificationData.icon}</div>
        <div className="flex-1">
          <h4 className="font-bold text-slate-800 dark:text-slate-100">
            {notificationData.title}
          </h4>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
            {notificationData.message}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onDismiss}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
          data-testid="button-dismiss-notification"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
