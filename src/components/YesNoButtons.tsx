import React from 'react';
import { motion } from 'framer-motion';

interface YesNoButtonsProps {
  value: boolean | null;
  onChange: (val: boolean) => void;
  yesLabel?: string;
  noLabel?: string;
}

export const YesNoButtons: React.FC<YesNoButtonsProps> = ({
  value,
  onChange,
  yesLabel = 'Yes',
  noLabel = 'No',
}) => {
  return (
    <div className="flex gap-3 mt-4">
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={() => onChange(true)}
        className={`yes-no-btn yes ${value === true ? 'active' : ''}`}
      >
        {yesLabel}
      </motion.button>
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={() => onChange(false)}
        className={`yes-no-btn no ${value === false ? 'active' : ''}`}
      >
        {noLabel}
      </motion.button>
    </div>
  );
};
