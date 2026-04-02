import React from 'react';
import { motion } from 'framer-motion';

interface NavButtonsProps {
  onNext: () => void;
  onBack?: () => void;
  nextLabel?: string;
  backLabel?: string;
  nextDisabled?: boolean;
  hideBack?: boolean;
}

export const NavButtons: React.FC<NavButtonsProps> = ({
  onNext,
  onBack,
  nextLabel = 'Next',
  backLabel = 'Back',
  nextDisabled = false,
  hideBack = false,
}) => {
  return (
    <div className="flex gap-3 mt-8">
      {!hideBack && onBack && (
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onBack}
          className="btn-secondary flex-1 sm:flex-none sm:w-28"
        >
          ← {backLabel}
        </motion.button>
      )}
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={onNext}
        disabled={nextDisabled}
        className="btn-primary flex-1"
      >
        {nextLabel} →
      </motion.button>
    </div>
  );
};
