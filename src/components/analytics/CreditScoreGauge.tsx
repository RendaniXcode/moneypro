import { useMemo } from 'react';

interface CreditScoreGaugeProps {
  score: number;
  maxScore?: number;
}

const CreditScoreGauge = ({ score, maxScore = 100 }: CreditScoreGaugeProps) => {
  // Calculate percentage and color based on score
  const percentage = useMemo(() => (score / maxScore) * 100, [score, maxScore]);
  
  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return { color: 'text-green-600', bg: 'bg-green-500' };
    if (percentage >= 65) return { color: 'text-blue-600', bg: 'bg-blue-500' };
    if (percentage >= 50) return { color: 'text-yellow-600', bg: 'bg-yellow-500' };
    if (percentage >= 35) return { color: 'text-orange-600', bg: 'bg-orange-500' };
    return { color: 'text-red-600', bg: 'bg-red-500' };
  };
  
  const getScoreLabel = (percentage: number) => {
    if (percentage >= 80) return 'Excellent';
    if (percentage >= 65) return 'Good';
    if (percentage >= 50) return 'Average';
    if (percentage >= 35) return 'Below Average';
    return 'Poor';
  };
  
  const { color, bg } = getScoreColor(percentage);
  const label = getScoreLabel(percentage);
  
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-48 h-48">
        {/* Background semicircle */}
        <div className="absolute w-full h-full rounded-full border-[16px] border-slate-200 clip-semicircle"></div>
        
        {/* Colored progress semicircle */}
        <div 
          className={`absolute w-full h-full rounded-full border-[16px] ${bg} clip-semicircle`}
          style={{ 
            clipPath: `polygon(50% 50%, 50% 0%, ${percentage > 50 ? '100% 0%' : `${percentage * 2}% 0%`}, ${percentage > 50 ? `${(percentage - 50) * 2}% ${(percentage - 50) * 2}%` : '50% 50%'})` 
          }}
        ></div>
        
        {/* Center white circle */}
        <div className="absolute top-[15%] left-[15%] w-[70%] h-[70%] bg-white rounded-full flex flex-col items-center justify-center">
          <div className={`text-3xl font-bold ${color}`}>{score}</div>
          <div className="text-sm text-slate-500">/{maxScore}</div>
        </div>
      </div>
      
      <div className="mt-4 text-center">
        <div className="text-lg font-semibold">Credit Score</div>
        <div className={`text-lg font-bold ${color}`}>{label}</div>
      </div>
      
      {/* Score scale */}
      <div className="w-48 flex justify-between mt-2">
        <div className="text-xs text-slate-500">0</div>
        <div className="text-xs text-slate-500">{maxScore/2}</div>
        <div className="text-xs text-slate-500">{maxScore}</div>
      </div>
      <div className="w-48 h-1 bg-slate-200 rounded-full mt-1 overflow-hidden">
        <div className={`h-full ${bg}`} style={{ width: `${percentage}%` }}></div>
      </div>
    </div>
  );
};

export default CreditScoreGauge;
