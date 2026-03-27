import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface StepWrapperProps {
  stepKey: string | number;
  children: React.ReactNode;
}

export const StepWrapper: React.FC<StepWrapperProps> = ({ stepKey, children }) => {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={stepKey}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -16 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="w-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};
