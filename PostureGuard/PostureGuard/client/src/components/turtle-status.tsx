import { PostureStatus } from '@/types/posture';

interface TurtleStatusProps {
  status: PostureStatus;
}

export function TurtleStatus({ status }: TurtleStatusProps) {
  const getStatusData = (status: PostureStatus) => {
    switch (status) {
      case 'good':
        return {
          emoji: '🐢',
          title: '완벽한 자세예요!',
          message: '목과 어깨가 올바른 위치에 있어요. 계속 유지해 주세요! 🎉',
          glowColor: 'bg-success/20'
        };
      case 'turtle_neck':
        return {
          emoji: '😰🐢',
          title: '거북목이 감지되었어요!',
          message: '목이 앞으로 나와있어요. 어깨를 뒤로 젖히고 턱을 당겨보세요.',
          glowColor: 'bg-warning/20'
        };
      case 'nail_biting':
        return {
          emoji: '⚠️🐢',
          title: '손톱 물어뜯기가 감지되었어요!',
          message: '손을 입에서 떨어뜨리고 다른 활동으로 주의를 돌려보세요.',
          glowColor: 'bg-danger/20'
        };
      default:
        return {
          emoji: '🐢',
          title: '자세를 확인 중이에요',
          message: '카메라를 켜고 자세를 확인해보세요.',
          glowColor: 'bg-slate-300/20'
        };
    }
  };

  const statusData = getStatusData(status);

  return (
    <div className="glassmorphism dark:glassmorphism-dark rounded-3xl p-8 shadow-xl">
      <div className="text-center">
        {/* Turtle Character Display */}
        <div className="relative inline-block">
          <div className={`text-8xl ${status === 'good' ? 'animate-float' : status === 'turtle_neck' ? 'animate-bounce' : 'animate-pulse'}`}>
            {statusData.emoji}
          </div>
          
          {/* Status Glow Effect */}
          <div className={`absolute -inset-4 ${statusData.glowColor} rounded-full blur-xl animate-pulse-slow`} />
        </div>
        
        {/* Status Message */}
        <div className="mt-6 space-y-2" data-testid="text-posture-status">
          <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            {statusData.title}
          </h3>
          <p className="text-slate-600 dark:text-slate-300 text-lg">
            {statusData.message}
          </p>
        </div>
      </div>
    </div>
  );
}
