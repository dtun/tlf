import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UBIPledge, PledgeItem, PledgeType, PledgeCadence, ImpactZone, defaultPledgeItem } from '../types';
import { NavButtons } from '../components/NavButtons';
import { YesNoButtons } from '../components/YesNoButtons';
import { InfoBox } from '../components/InfoBox';
import { StepWrapper } from '../components/StepWrapper';

interface Step4Props {
  ubiPledge: UBIPledge;
  onChange: (patch: Partial<UBIPledge>) => void;
  onNext: () => void;
  onBack: () => void;
}

type Phase = 'intro' | 'zone' | 'pledges' | 'summary' | 'priority';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PLEDGE_TYPES: { value: PledgeType; label: string; icon: string }[] = [
  { value: 'income_based', label: 'Income-Based', icon: '💰' },
  { value: 'wealth_based', label: 'Wealth-Based', icon: '📈' },
  { value: 'vehicle', label: 'Vehicle Donation', icon: '🚗' },
  { value: 'real_estate', label: 'House / Real Estate', icon: '🏡' },
  { value: 'crypto', label: 'Crypto Donation', icon: '₿' },
  { value: 'other', label: 'Other Gift', icon: '🎁' },
];

const CADENCES: { value: PledgeCadence; label: string }[] = [
  { value: 'annual', label: 'Annual' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'planned', label: 'One-Time' },
];

const VEHICLE_CONDITIONS = ['Excellent', 'Good', 'Fair', 'Poor', 'Non-running'];
const PROPERTY_TYPES = ['Single Family', 'Condo/Townhouse', 'Multi-Family', 'Land/Lot', 'Commercial', 'Other'];

function pledgeLabel(p: PledgeItem): string {
  switch (p.pledgeType) {
    case 'income_based':
      return p.estimatedIncome && p.incomePercent
        ? `${p.incomePercent}% of $${Number(p.estimatedIncome).toLocaleString()} income`
        : 'Income-based pledge';
    case 'wealth_based':
      return p.estimatedNetWorth && p.wealthPercent
        ? `${p.wealthPercent}% of $${Number(p.estimatedNetWorth).toLocaleString()} net worth`
        : 'Wealth-based pledge';
    case 'vehicle':
      return [p.vehicleYear, p.vehicleMake, p.vehicleModel].filter(Boolean).join(' ') || 'Vehicle donation';
    case 'real_estate':
      return p.propertyAddress || 'Real estate donation';
    case 'crypto':
      return 'Crypto donation via every.org';
    case 'other':
      return p.otherDescription || 'Other gift';
    default:
      return 'Pledge';
  }
}

function computeAnnualValue(p: PledgeItem): number {
  switch (p.pledgeType) {
    case 'income_based': {
      const inc = parseFloat(p.estimatedIncome) || 0;
      const pct = parseFloat(p.incomePercent) || 0;
      const annual = inc * (pct / 100);
      return p.cadence === 'monthly' ? annual : annual;
    }
    case 'wealth_based': {
      const nw = parseFloat(p.estimatedNetWorth) || 0;
      const pct = parseFloat(p.wealthPercent) || 0;
      return nw * (pct / 100);
    }
    case 'real_estate':
      return parseFloat(p.estimatedPropertyValue) || 0;
    default:
      return 0;
  }
}

function buildPledgeSummaryText(pledges: PledgeItem[], zone: string): string {
  if (!pledges.length) return '';
  const parts = pledges.map(p => pledgeLabel(p));
  const total = pledges.reduce((sum, p) => sum + computeAnnualValue(p), 0);
  const zoneLabel = zone || 'Arizona statewide';
  let text = `I pledge to the people of ${zoneLabel}: ${parts.join('; ')}`;
  if (total > 0) text += `. Estimated annual value: $${Math.round(total).toLocaleString()}`;
  text += '.';
  return text;
}

// ─── Single pledge editor ─────────────────────────────────────────────────────

const PledgeEditor: React.FC<{
  pledge: PledgeItem;
  index: number;
  onChange: (patch: Partial<PledgeItem>) => void;
  onRemove: () => void;
  canRemove: boolean;
}> = ({ pledge, index, onChange, onRemove, canRemove }) => {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="card mb-3 border-border">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <button onClick={() => setExpanded(v => !v)}
          className="flex items-center gap-2 flex-1 text-left">
          <span className="text-accent font-bold text-sm">Pledge {index + 1}</span>
          {!expanded && pledge.pledgeType && (
            <span className="text-textMuted text-xs truncate">{pledgeLabel(pledge)}</span>
          )}
          <span className="text-textMuted text-xs ml-auto">{expanded ? '▲' : '▼'}</span>
        </button>
        {canRemove && (
          <button onClick={onRemove}
            className="ml-3 text-xs text-danger hover:text-red-400 transition-colors">
            Remove
          </button>
        )}
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }}>

            {/* Type selector */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {PLEDGE_TYPES.map(opt => (
                <button key={opt.value}
                  onClick={() => onChange({ pledgeType: opt.value })}
                  className={`p-2 rounded-xl border text-xs font-medium transition-all flex flex-col items-center gap-1 ${
                    pledge.pledgeType === opt.value
                      ? 'border-accent bg-accentDim/30 text-accent'
                      : 'border-border text-textSecondary hover:border-accent/40'
                  }`}>
                  <span className="text-lg">{opt.icon}</span>
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Type-specific fields */}
            {pledge.pledgeType === 'income_based' && (
              <div className="space-y-3 mb-4">
                <div>
                  <label className="block text-xs font-medium text-textSecondary mb-1">
                    Estimated Annual Income
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted text-sm">$</span>
                    <input type="number" min="0" className="input-field pl-7 py-2 text-sm"
                      placeholder="55,000"
                      value={pledge.estimatedIncome}
                      onChange={e => onChange({ estimatedIncome: e.target.value })} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-textSecondary mb-1">
                    % of Income to Pledge
                  </label>
                  <div className="relative">
                    <input type="number" min="0" max="100" className="input-field pr-7 py-2 text-sm"
                      placeholder="1"
                      value={pledge.incomePercent}
                      onChange={e => onChange({ incomePercent: e.target.value })} />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-textMuted text-sm">%</span>
                  </div>
                  {pledge.estimatedIncome && pledge.incomePercent && (
                    <p className="text-accent text-xs mt-1">
                      = ${Math.round(parseFloat(pledge.estimatedIncome) * parseFloat(pledge.incomePercent) / 100).toLocaleString()} / year
                    </p>
                  )}
                </div>
              </div>
            )}

            {pledge.pledgeType === 'wealth_based' && (
              <div className="space-y-3 mb-4">
                <div>
                  <label className="block text-xs font-medium text-textSecondary mb-1">
                    Estimated Net Worth (Assets − Debts)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted text-sm">$</span>
                    <input type="number" min="0" className="input-field pl-7 py-2 text-sm"
                      placeholder="250,000"
                      value={pledge.estimatedNetWorth}
                      onChange={e => onChange({ estimatedNetWorth: e.target.value })} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-textSecondary mb-1">
                    % of Net Worth to Pledge
                  </label>
                  <div className="relative">
                    <input type="number" min="0" max="100" className="input-field pr-7 py-2 text-sm"
                      placeholder="1"
                      value={pledge.wealthPercent}
                      onChange={e => onChange({ wealthPercent: e.target.value })} />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-textMuted text-sm">%</span>
                  </div>
                  {pledge.estimatedNetWorth && pledge.wealthPercent && (
                    <p className="text-accent text-xs mt-1">
                      = ${Math.round(parseFloat(pledge.estimatedNetWorth) * parseFloat(pledge.wealthPercent) / 100).toLocaleString()} / year
                    </p>
                  )}
                </div>
              </div>
            )}

            {pledge.pledgeType === 'vehicle' && (
              <div className="space-y-3 mb-4">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-textSecondary mb-1">Year</label>
                    <input type="text" className="input-field py-2 text-sm" placeholder="2018" maxLength={4}
                      value={pledge.vehicleYear} onChange={e => onChange({ vehicleYear: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-textSecondary mb-1">Make</label>
                    <input type="text" className="input-field py-2 text-sm" placeholder="Toyota"
                      value={pledge.vehicleMake} onChange={e => onChange({ vehicleMake: e.target.value })} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-textSecondary mb-1">Model</label>
                  <input type="text" className="input-field py-2 text-sm" placeholder="Camry"
                    value={pledge.vehicleModel} onChange={e => onChange({ vehicleModel: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-textSecondary mb-1">Mileage</label>
                  <input type="number" min="0" className="input-field py-2 text-sm" placeholder="85,000"
                    value={pledge.vehicleMileage} onChange={e => onChange({ vehicleMileage: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-textSecondary mb-2">Condition</label>
                  <div className="flex flex-wrap gap-2">
                    {VEHICLE_CONDITIONS.map(c => (
                      <button key={c} onClick={() => onChange({ vehicleCondition: c })}
                        className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all ${
                          pledge.vehicleCondition === c
                            ? 'border-accent bg-accentDim/30 text-accent'
                            : 'border-border text-textSecondary'
                        }`}>{c}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-textSecondary mb-1">Estimated Value</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted text-sm">$</span>
                    <input type="number" min="0" className="input-field pl-7 py-2 text-sm" placeholder="8,000"
                      value={pledge.vehicleEstimatedValue}
                      onChange={e => onChange({ vehicleEstimatedValue: e.target.value })} />
                  </div>
                </div>
              </div>
            )}

            {pledge.pledgeType === 'real_estate' && (
              <div className="space-y-3 mb-4">
                <div>
                  <label className="block text-xs font-medium text-textSecondary mb-1">Property Address</label>
                  <input type="text" className="input-field py-2 text-sm" placeholder="123 Main St, Phoenix, AZ"
                    value={pledge.propertyAddress} onChange={e => onChange({ propertyAddress: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-textSecondary mb-2">Property Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    {PROPERTY_TYPES.map(pt => (
                      <button key={pt} onClick={() => onChange({ propertyType: pt })}
                        className={`py-2 px-3 rounded-lg text-sm font-semibold border text-left transition-all ${
                          pledge.propertyType === pt
                            ? 'border-accent bg-accentDim/30 text-accent'
                            : 'border-border text-textPrimary hover:border-accent/50'
                        }`}>{pt}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-textSecondary mb-1">Estimated Value</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted text-sm">$</span>
                    <input type="number" min="0" className="input-field pl-7 py-2 text-sm" placeholder="350,000"
                      value={pledge.estimatedPropertyValue}
                      onChange={e => onChange({ estimatedPropertyValue: e.target.value })} />
                  </div>
                </div>
              </div>
            )}

            {pledge.pledgeType === 'crypto' && (
              <div className="space-y-3 mb-4">
                <a href="https://www.every.org/thelogicalfoundation" target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-accentDim/20 border border-accent/40 text-accent font-semibold px-4 py-3 rounded-xl text-sm hover:bg-accentDim/40 transition-all">
                  ₿ Donate at every.org/thelogicalfoundation →
                </a>
                <p className="text-textSecondary text-xs">Bitcoin, Ethereum, and 50+ coins accepted.</p>
                <div>
                  <label className="block text-xs font-medium text-textSecondary mb-1">Estimated Value</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted text-sm">$</span>
                    <input type="number" min="0" className="input-field pl-7 py-2 text-sm" placeholder="500"
                      value={pledge.cryptoEstimatedValue}
                      onChange={e => onChange({ cryptoEstimatedValue: e.target.value })} />
                  </div>
                </div>
              </div>
            )}

            {pledge.pledgeType === 'other' && (
              <div className="space-y-3 mb-4">
                <div>
                  <label className="block text-xs font-medium text-textSecondary mb-1">Describe your gift</label>
                  <textarea className="input-field resize-none text-sm" rows={3}
                    placeholder="Describe your gift..."
                    value={pledge.otherDescription}
                    onChange={e => onChange({ otherDescription: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-textSecondary mb-1">Estimated Value</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted text-sm">$</span>
                    <input type="number" min="0" className="input-field pl-7 py-2 text-sm" placeholder="1,000"
                      value={pledge.otherEstimatedValue}
                      onChange={e => onChange({ otherEstimatedValue: e.target.value })} />
                  </div>
                </div>
              </div>
            )}

            {/* Frequency */}
            {pledge.pledgeType && (
              <div>
                <label className="block text-xs font-medium text-textSecondary mb-2">Frequency</label>
                <div className="flex gap-2">
                  {CADENCES.map(c => (
                    <button key={c.value} onClick={() => onChange({ cadence: c.value })}
                      className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-all ${
                        pledge.cadence === c.value
                          ? 'border-accent bg-accentDim/30 text-accent'
                          : 'border-border text-textSecondary hover:border-accent/40'
                      }`}>{c.label}</button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Commitment summary ───────────────────────────────────────────────────────

const CommitmentSummary: React.FC<{ pledges: PledgeItem[]; zone: string }> = ({ pledges, zone }) => {
  const total = pledges.reduce((s, p) => s + computeAnnualValue(p), 0);
  const summaryText = buildPledgeSummaryText(pledges, zone);

  return (
    <div className="card border-accent/30 bg-accentDim/10 mb-4">
      <p className="text-xs text-accent font-semibold uppercase tracking-wider mb-3">Your Pledge Summary</p>
      {pledges.map((p) => {
        const val = computeAnnualValue(p);
        return (
          <div key={p.id} className="flex justify-between items-start py-2 border-b border-border last:border-0">
            <div>
              <p className="text-sm font-medium text-textPrimary">{pledgeLabel(p)}</p>
              {p.cadence && <p className="text-xs text-textSecondary capitalize">{p.cadence === 'planned' ? 'One-Time' : p.cadence}</p>}
            </div>
            {val > 0 && (
              <span className="text-accent text-sm font-semibold ml-3 shrink-0">
                ${Math.round(val).toLocaleString()}/yr
              </span>
            )}
          </div>
        );
      })}
      {total > 0 && (
        <div className="flex justify-between items-center pt-3 mt-1">
          <span className="text-sm font-bold text-textPrimary">Total estimated annual value</span>
          <span className="text-accent font-bold text-lg">${Math.round(total).toLocaleString()}</span>
        </div>
      )}
      <div className="mt-3 bg-surface rounded-xl p-3">
        <p className="text-sm text-textSecondary mb-1">Your pledge wording:</p>
        <p className="text-sm text-textSecondary leading-relaxed italic">"{summaryText}"</p>
      </div>
    </div>
  );
};

// ─── Main Step 4 ──────────────────────────────────────────────────────────────

export const Step3UBIPledge: React.FC<Step4Props> = ({ ubiPledge, onChange, onNext, onBack }) => {
  const [phase, setPhase] = useState<Phase>('intro');
  const [zoneErr, setZoneErr] = useState('');

  const pledges = ubiPledge.pledges;

  const updatePledge = (id: string, patch: Partial<PledgeItem>) => {
    onChange({
      pledges: pledges.map(p => p.id === id ? { ...p, ...patch } : p),
    });
  };

  const addPledge = () => {
    onChange({ pledges: [...pledges, defaultPledgeItem()] });
  };

  const removePledge = (id: string) => {
    onChange({ pledges: pledges.filter(p => p.id !== id) });
  };

  const zoneLabel =
    ubiPledge.impactZone === 'arizona' ? 'Arizona'
    : ubiPledge.impactZone === 'america' ? 'the United States'
    : ubiPledge.impactZone === 'earth' ? 'the world'
    : ubiPledge.customImpactZone || '';

  return (
    <StepWrapper stepKey={`step3-${phase}`}>
      <div className="px-4 py-2">

        {/* ── Intro ── */}
        {phase === 'intro' && (
          <div>
            <h2 className="text-2xl font-bold text-textPrimary mb-4">UBI Giving Pledge</h2>
            <div className="card border-accent/30 bg-accentDim/10 mb-6">
              <p className="text-textPrimary text-base leading-relaxed">
                Pledge to support your community directly. We will distribute the money evenly
                across your chosen area and combine it with every other giving pledge.
              </p>
            </div>
            <div className="space-y-3 mb-6">
              {[
                { icon: '🌍', title: 'Choose your impact zone', desc: 'Arizona, America, Earth, or custom' },
                { icon: '🎁', title: 'Add one or more pledges', desc: 'Income, wealth, vehicle, property, crypto' },
                { icon: '📊', title: 'See your commitment', desc: 'Auto-calculated from your details' },
              ].map(item => (
                <div key={item.title} className="flex items-start gap-3 p-3 rounded-xl bg-surfaceHigh">
                  <span className="text-2xl">{item.icon}</span>
                  <div>
                    <p className="text-sm font-semibold text-textPrimary">{item.title}</p>
                    <p className="text-sm text-textSecondary">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-8">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={onBack}
                className="btn-secondary flex-1 sm:flex-none sm:w-32"
              >
                Not Now
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => setPhase('zone')}
                className="btn-primary flex-1"
              >
                Let's do it! →
              </motion.button>
            </div>
          </div>
        )}

        {/* ── Zone ── */}
        {phase === 'zone' && (
          <div>
            <h2 className="text-2xl font-bold text-textPrimary mb-1">Impact Zone</h2>
            <p className="text-textSecondary text-sm mb-4">Where should your pledge make an impact?</p>

            {/* Preset zones */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              {([
                { value: 'arizona' as ImpactZone, label: 'Arizona', icon: '🌵' },
                { value: 'america' as ImpactZone, label: 'America', icon: '🇺🇸' },
                { value: 'earth' as ImpactZone, label: 'Earth', icon: '🌍' },
              ]).map(opt => (
                <motion.button key={opt.value} whileTap={{ scale: 0.97 }}
                  onClick={() => { onChange({ impactZone: opt.value, customImpactZone: '' }); setZoneErr(''); }}
                  className={`p-4 rounded-xl border-2 text-sm font-medium transition-all flex flex-col items-center gap-1 ${
                    ubiPledge.impactZone === opt.value
                      ? 'border-accent bg-accentDim/30 text-accent'
                      : 'border-border text-textSecondary hover:border-accent/40'
                  }`}>
                  <span className="text-2xl">{opt.icon}</span>
                  {opt.label}
                </motion.button>
              ))}
            </div>

            {/* Custom zone option */}
            <motion.button whileTap={{ scale: 0.97 }}
              onClick={() => { onChange({ impactZone: 'custom' }); setZoneErr(''); }}
              className={`w-full p-3 rounded-xl border-2 text-sm font-medium transition-all flex items-center gap-2 mb-4 ${
                ubiPledge.impactZone === 'custom'
                  ? 'border-accent bg-accentDim/30 text-accent'
                  : 'border-border text-textSecondary hover:border-accent/40'
              }`}>
              <span className="text-lg">📍</span>
              Custom Zone
            </motion.button>

            {ubiPledge.impactZone === 'custom' && (
              <input type="text" className="input-field mb-4"
                placeholder="e.g. Maricopa County, Tucson metro..."
                value={ubiPledge.customImpactZone}
                onChange={e => onChange({ customImpactZone: e.target.value })} />
            )}

            {/* Expansion notice */}
            <div className="rounded-xl border border-accent/30 bg-accentDim/10 p-4 mb-4">
              <p className="text-sm text-textSecondary leading-relaxed">
                <span className="font-semibold text-accent">Starting in Arizona.</span>{' '}
                As we expand, we'll do our best to distribute funds to any area you choose 
                but we are beginning our programs in Arizona. Selecting America or Earth means
                your pledge will be directed here first as we grow our reach.
              </p>
            </div>

            {zoneErr && <p className="text-danger text-xs mb-2">{zoneErr}</p>}
            <NavButtons
              onNext={() => {
                if (!ubiPledge.impactZone) { setZoneErr('Please select an impact zone'); return; }
                if (ubiPledge.impactZone === 'custom' && !ubiPledge.customImpactZone.trim()) {
                  setZoneErr('Please describe your impact zone'); return;
                }
                if (pledges.length === 0) onChange({ pledges: [defaultPledgeItem()] });
                setPhase('pledges');
              }}
              onBack={() => setPhase('intro')}
            />
          </div>
        )}

        {/* ── Pledges ── */}
        {phase === 'pledges' && (
          <div>
            <h2 className="text-2xl font-bold text-textPrimary mb-1">Your Pledges</h2>
            <p className="text-textSecondary text-sm mb-3">
              Add as many pledge types as you like, a vehicle, a percentage of income, real estate, and more.
            </p>
            <InfoBox variant="info">
              Can't contribute now? Your pledge accumulates as a virtual commitment.
            </InfoBox>
            <div className="mt-4">
            {pledges.map((p, i) => (
              <PledgeEditor key={p.id} pledge={p} index={i}
                onChange={patch => updatePledge(p.id, patch)}
                onRemove={() => removePledge(p.id)}
                canRemove={pledges.length > 1} />
            ))}
            <motion.button whileTap={{ scale: 0.97 }} onClick={addPledge}
              className="w-full py-3 rounded-xl border-2 border-dashed border-accent/40 text-accent text-sm font-semibold hover:border-accent hover:bg-accentDim/10 transition-all mb-4">
              + Add Another Pledge
            </motion.button>
            </div>
            <NavButtons
              onNext={() => setPhase('summary')}
              onBack={() => setPhase('zone')}
              nextLabel="Review Summary"
            />
          </div>
        )}

        {/* ── Summary ── */}
        {phase === 'summary' && (
          <div>
            <h2 className="text-2xl font-bold text-textPrimary mb-1">Commitment Summary</h2>
            <p className="text-textSecondary text-sm mb-4">
              Based on your pledge details, here's your combined commitment.
            </p>
            <CommitmentSummary pledges={pledges} zone={zoneLabel} />
            <NavButtons
              onNext={() => setPhase('priority')}
              onBack={() => setPhase('pledges')}
              nextLabel="Almost Done"
            />
          </div>
        )}

        {/* ── Priority ── */}
        {phase === 'priority' && (
          <div>
            <h2 className="text-2xl font-bold text-textPrimary mb-1">Homelessness Priority</h2>
            <p className="text-textSecondary text-sm mb-6">
              Direct your pledge specifically toward ending homelessness?
            </p>
            <YesNoButtons
              value={ubiPledge.homelessnessPriority}
              onChange={val => onChange({ homelessnessPriority: val })}
              yesLabel="Yes, prioritize homelessness"
              noLabel="General UBI distribution"
            />
            <NavButtons
              onNext={() => { if (ubiPledge.homelessnessPriority !== null) onNext(); }}
              onBack={() => setPhase('summary')}
              nextLabel="Finish Pledge"
              nextDisabled={ubiPledge.homelessnessPriority === null}
            />
          </div>
        )}

      </div>
    </StepWrapper>
  );
};
