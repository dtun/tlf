import React from 'react';
import { motion } from 'framer-motion';
import { AZTaxCredit } from '../types';
import { NavButtons } from '../components/NavButtons';
import { YesNoButtons } from '../components/YesNoButtons';
import { InfoBox } from '../components/InfoBox';
import { StepWrapper } from '../components/StepWrapper';

interface Step3Props {
  azTaxCredit: AZTaxCredit;
  onChange: (patch: Partial<AZTaxCredit>) => void;
  onNext: () => void;
  onBack: () => void;
}

export const Step4AZTaxCredit: React.FC<Step3Props> = ({
  azTaxCredit,
  onChange,
  onNext,
  onBack,
}) => {
  const canProceed = azTaxCredit.filesAZTax !== null;

  const handleNext = () => {
    if (canProceed) onNext();
  };

  return (
    <StepWrapper stepKey="step3">
      <div className="px-4 py-2">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-2xl">🌵</span>
          <h2 className="text-2xl font-bold text-textPrimary">Arizona's Charitable Tax Credit</h2>
        </div>
        <p className="text-textSecondary text-sm mb-6">
          Arizona offers one of the most generous charitable tax credits in the country.
        </p>

        <div className="card mb-6">
          <p className="text-sm font-semibold text-accent mb-2 uppercase tracking-wider">
            Tax Year 2025
          </p>
          <p className="text-textSecondary text-sm leading-relaxed">
            You can still claim the 2025 credit until April 15th, 2026.
            The Logical Foundation is a Qualifying Charitable Organization (QCO).
          </p>
        </div>

        <h3 className="text-lg font-semibold text-textPrimary mb-3">
          Do you file and pay Arizona state income tax?
        </h3>
        <YesNoButtons
          value={azTaxCredit.filesAZTax}
          onChange={val => onChange({ filesAZTax: val })}
        />

        {azTaxCredit.filesAZTax === true && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-6 space-y-6"
          >
            <InfoBox variant="success">
              <p className="font-semibold text-green-300 mb-2">
                Excellent! You qualify for the Arizona QCO Tax Credit.
              </p>
              <p className="mb-3">
                You must owe Arizona state income tax for the QCO credit to apply
                dollar-for-dollar against what you owe. As an Arizona taxpayer, you can give:
              </p>
              <ul className="space-y-1 text-sm">
                <li>
                  <span className="font-semibold text-accent">$495</span> - Single / Head of Household
                </li>
                <li>
                  <span className="font-semibold text-accent">$987</span> - Married Filing Jointly
                </li>
              </ul>
              <p className="mt-3 text-xs text-green-300/70">
                Form 321, Code 22852. Next year's limits: $506 (single) / $1,009 (married).
              </p>
            </InfoBox>

            <div>
              <h3 className="text-lg font-semibold text-textPrimary mb-3">
                Will you commit to diverting your Arizona tax liability directly to people in need?
              </h3>
              <YesNoButtons
                value={azTaxCredit.willUseCredit}
                onChange={val => onChange({ willUseCredit: val })}
              />
            </div>

            {azTaxCredit.willUseCredit === true && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div>
                  <h3 className="text-lg font-semibold text-textPrimary mb-2">
                    Would you like carry-forward reminders?
                  </h3>
                  <p className="text-textSecondary text-sm mb-3">
                    Unused credit can carry forward up to 5 years via Form 301.
                  </p>
                  <YesNoButtons
                    value={azTaxCredit.wantsCarryForward}
                    onChange={val => onChange({ wantsCarryForward: val })}
                  />
                </div>

                <InfoBox variant="info">
                  <span className="font-semibold">Coming next year:</span> AI-powered free tax
                  service to help you file and claim your QCO credit automatically.
                </InfoBox>
              </motion.div>
            )}
          </motion.div>
        )}

        {azTaxCredit.filesAZTax === false && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-4"
          >
            <InfoBox variant="info">
              No problem, you can still participate in all other programs. We'll skip the
              tax credit section.
            </InfoBox>
          </motion.div>
        )}

        <NavButtons
          onNext={handleNext}
          onBack={onBack}
          nextDisabled={!canProceed}
          nextLabel="Continue"
        />
      </div>
    </StepWrapper>
  );
};
