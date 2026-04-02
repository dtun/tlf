import React from 'react';
import { motion } from 'framer-motion';

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

const STEP_LABELS = [
  'Welcome',
  'Your Info',
  'AZ Tax Credit',
  'UBI Pledge',
  'Foundation Fund',
  'Comingle',
  'Review',
];

export const ProgressBar: React.FC<ProgressBarProps> = ({ currentStep, totalSteps }) => {
  const pct = ((currentStep - 1) / (totalSteps - 1)) * 100;

  return (
    <div className="w-full px-4 pt-4 pb-2">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs text-textMuted font-medium">
          Step {currentStep} of {totalSteps}
        </span>
        <span className="text-xs text-accent font-semibold">
          {STEP_LABELS[currentStep - 1]}
        </span>
      </div>
      <div className="w-full h-1.5 bg-surfaceHigh rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-accent rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      </div>
      {/* Step dots */}
      <div className="flex justify-between mt-2">
        {STEP_LABELS.map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              i + 1 < currentStep
                ? 'bg-accent'
                : i + 1 === currentStep
                ? 'bg-accent ring-2 ring-accent/30'
                : 'bg-border'
            }`}
          />
        ))}
      </div>
    </div>
  );
};
