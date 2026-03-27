import React, { useRef, useState } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { StepWrapper } from './StepWrapper';

interface ResearchProps {
  onBack: () => void;
  onGetStarted?: () => void;
}

const FadeIn: React.FC<{ children: React.ReactNode; delay?: number; className?: string }> = ({ children, delay = 0, className = '' }) => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-30px' });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 16 }} animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay, duration: 0.4 }} className={className}>
      {children}
    </motion.div>
  );
};

const Citation: React.FC<{ source: string; finding: string; delay?: number }> = ({ source, finding, delay = 0 }) => (
  <FadeIn delay={delay} className="border-l-2 border-accent/40 pl-4 py-1">
    <p className="text-sm text-textPrimary leading-relaxed mb-1">{finding}</p>
    <p className="text-xs text-textMuted font-medium">{source}</p>
  </FadeIn>
);

const PILOTS = [
  { name: 'London, UK', org: "St Mungo's / Broadway", n: '13', result: '11 of 13 moved off the streets permanently' },
  { name: 'Vancouver, BC', org: 'New Leaf Project', n: '239', result: '40% more nights in stable housing, 85% more savings retained, 21% higher wages' },
  { name: 'Winnipeg, MB', org: 'Miracle Money', n: '20', result: '16 of 20 housed within 12 months' },
  { name: 'Denver, CO', org: 'Denver UBI Project', n: '820', result: '43% housed (vs 25% control), employment up, substance use down' },
  { name: 'Los Angeles, CA', org: 'Trust Youth Initiative', n: '30', result: 'All participants housed within 6 months' },
  { name: 'Phoenix, AZ', org: 'The Logical Foundation', n: '6', result: '6 of 6 (100%) regained stable housing' },
];

type Section = 'overview' | 'homelessness';

export const Research: React.FC<ResearchProps> = ({ onBack, onGetStarted }) => {
  const [section, setSection] = useState<Section>('overview');

  return (
    <StepWrapper stepKey="research">
      <div className="px-4 py-2">
        <button onClick={onBack} className="text-textMuted hover:text-textPrimary transition-colors text-sm mb-6 block">← Back</button>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">🔬</span>
            <h2 className="text-3xl font-bold text-textPrimary">Research</h2>
          </div>
          <p className="text-textSecondary text-base mb-4">
            Over 300 rigorous studies consistently show that giving people unconditional cash improves their lives.
          </p>
        </motion.div>

        {/* Section tabs */}
        <div className="flex gap-2 mb-6">
          {([
            { id: 'overview', label: 'UBI Evidence' },
            { id: 'homelessness', label: 'Homelessness' },
          ] as { id: Section; label: string }[]).map(t => (
            <button key={t.id} onClick={() => setSection(t.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${section === t.id ? 'bg-accent text-white' : 'bg-surface text-textSecondary border border-border hover:text-textPrimary'}`}>
              {t.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">

          {/* ── UBI OVERVIEW ── */}
          {section === 'overview' && (
            <motion.div key="overview" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>

              <FadeIn className="card border-accent/30 bg-accentDim/10 mb-8 text-center">
                <p className="text-5xl font-bold text-accent mb-2">300+</p>
                <p className="text-textSecondary text-sm">peer-reviewed studies on Universal Basic Income programs worldwide</p>
              </FadeIn>

              <FadeIn className="mb-8">
                <h3 className="text-xl font-bold text-textPrimary mb-2">UBI Creates Consistently Positive Effects</h3>
                <p className="text-textSecondary text-sm leading-relaxed mb-4">
                  Across hundreds of studies spanning dozens of countries and decades of research, Universal Basic Income programs
                  show remarkably consistent positive outcomes in health, education, nutrition, income, and wellbeing.
                </p>
                <div className="rounded-2xl overflow-hidden border border-border mb-4">
                  <img
                    src="https://thelogicalfoundation.org/wp-content/uploads/2023/05/image-3-1024x614.png"
                    alt="Chart showing positive outcomes across UBI studies"
                    className="w-full"
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                </div>
                <p className="text-sm text-textSecondary text-center">Outcomes across 300+ UBI studies</p>
              </FadeIn>

              <FadeIn className="mb-8">
                <h3 className="text-xl font-bold text-textPrimary mb-4">UBI is Rarely Spent Wastefully</h3>
                <p className="text-textSecondary text-sm leading-relaxed mb-4">
                  A common concern is that recipients will spend cash on alcohol, tobacco, or other temptation goods.
                  The evidence consistently shows this does not happen.
                </p>
                <div className="space-y-4">
                  <Citation delay={0.05} source="World Bank (Evans & Popova, 2014)"
                    finding="A review of 19 studies found that cash transfers do not increase spending on alcohol or tobacco. In 82% of cases, spending on these goods actually decreased." />
                  <Citation delay={0.1} source="American Agricultural Economics Association"
                    finding="Cash transfers in Mexico increased spending on food, education, and health, not temptation goods." />
                  <Citation delay={0.15} source="MIT Poverty Action Lab"
                    finding="Recipients of unconditional cash in Kenya invested in livestock, business assets, and home improvements, generating lasting economic returns." />
                </div>
              </FadeIn>

              <FadeIn className="mb-8">
                <h3 className="text-xl font-bold text-textPrimary mb-4">Independent Experts Agree</h3>
                <div className="space-y-4">
                  <Citation delay={0.05} source="Overseas Development Institute"
                    finding="Cash transfers are among the most effective tools for reducing poverty and improving wellbeing in low- and middle-income countries." />
                  <Citation delay={0.1} source="Cochrane Systematic Review"
                    finding="Unconditional cash transfers improve food security, school attendance, and health outcomes with no evidence of harm." />
                  <Citation delay={0.15} source="World Bank (Gentilini et al., 2020)"
                    finding="During COVID-19, 215 countries implemented cash transfer programs, the largest global expansion of direct cash assistance in history." />
                  <Citation delay={0.2} source="Campbell Collaboration"
                    finding="A meta-analysis of 21 randomized controlled trials found that unconditional cash transfers significantly reduce poverty and improve wellbeing." />
                </div>
              </FadeIn>

              <FadeIn className="mb-8">
                <h3 className="text-xl font-bold text-textPrimary mb-3">The Most Cost-Effective Way to Fight Poverty</h3>
                <div className="card">
                  <p className="text-textSecondary text-sm leading-relaxed mb-3">
                    Traditional anti-poverty programs spend significant resources on administration, eligibility verification,
                    and service delivery. Direct cash transfers cut through this overhead, putting more money in the hands
                    of people who need it.
                  </p>
                  <p className="text-textSecondary text-sm leading-relaxed mb-3">
                    GiveDirectly, one of the most studied cash transfer programs, delivers over 80 cents of every dollar
                    directly to recipients. Most traditional programs deliver far less.
                  </p>
                  <p className="text-textSecondary text-sm leading-relaxed italic">
                    "The big reason poor people are poor is because they don't have enough money, and it shouldn't come
                    as a huge surprise that giving them money is a great way to reduce that problem."
                  </p>
                  <p className="text-accent text-sm font-semibold mt-2">- Charles Kenny, Center for Global Development</p>
                </div>
              </FadeIn>

              <FadeIn className="mb-6">
                <button onClick={() => setSection('homelessness')} className="btn-primary w-full py-4 text-base">
                  Homelessness Deep Dive →
                </button>
              </FadeIn>
            </motion.div>
          )}

          {/* ── HOMELESSNESS ── */}
          {section === 'homelessness' && (
            <motion.div key="homelessness" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>

              {/* Scott Santens article feature */}
              <FadeIn className="mb-8">
                <a
                  href="https://scottsantens.substack.com/p/we-gave-homeless-people-cash-they"
                  target="_blank" rel="noopener noreferrer"
                  className="block card border-accent/40 bg-accentDim/10 hover:border-accent/70 transition-colors group"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <span className="text-2xl flex-shrink-0">📰</span>
                    <div>
                      <p className="text-xs font-semibold text-accent uppercase tracking-wider mb-1">Featured Article</p>
                      <h3 className="text-base font-bold text-textPrimary group-hover:text-accent transition-colors leading-snug">
                        We Gave Homeless People Cash. They Bought Housing Not Drugs.
                      </h3>
                    </div>
                  </div>
                  <p className="text-textSecondary text-sm leading-relaxed mb-3">
                    The evidence from Vancouver to Denver is undeniable: when people in crisis receive money, substance use goes down, employment goes up, and homelessness ends.
                  </p>
                  <p className="text-sm text-textMuted">Scott Santens, Foreword to Civilization - Jan 2026</p>
                  <p className="text-xs text-accent mt-2 group-hover:text-accentHover">Read on Substack →</p>
                </a>
              </FadeIn>

              <FadeIn className="card border-accent/30 bg-accentDim/10 mb-8">
                <h3 className="text-lg font-bold text-textPrimary mb-3">The True Cost of Homelessness</h3>
                <p className="text-textSecondary text-sm leading-relaxed mb-3">
                  Leaving someone on the streets costs society <span className="font-semibold text-textPrimary">$45,000-$180,000 per person per year</span> in emergency services, healthcare, law enforcement, and lost productivity.
                </p>
                <p className="text-textSecondary text-sm leading-relaxed">
                  A UBI program that houses someone costs a fraction of that and produces lasting results.
                </p>
              </FadeIn>

              <FadeIn className="mb-8">
                <h3 className="text-xl font-bold text-textPrimary mb-3">New Leaf Project (Vancouver)</h3>
                <div className="card mb-4">
                  <p className="text-textSecondary text-sm leading-relaxed mb-3">
                    239 recently homeless individuals received a one-time cash transfer of $7,500 CAD with no conditions. Results after 12 months:
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { stat: '40%', label: 'more nights in stable housing' },
                      { stat: '$8,100', label: 'saved per person vs. shelter system' },
                      { stat: '85%', label: 'more savings retained' },
                      { stat: '39%', label: 'drop in substance use spending' },
                    ].map(item => (
                      <div key={item.stat} className="text-center p-3 rounded-xl bg-surfaceHigh">
                        <p className="text-2xl font-bold text-accent">{item.stat}</p>
                        <p className="text-sm text-textSecondary mt-1 leading-snug">{item.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <p className="text-sm text-textMuted italic px-1">
                  "Unconditional cash support led to rapid, measurable gains in housing stability, financial security, food stability, and employment, without reducing labor force participation or increasing irresponsible spending." - New Leaf Impact Report 2025
                </p>
              </FadeIn>

              <FadeIn className="mb-8">
                <h3 className="text-xl font-bold text-textPrimary mb-4">Denver UBI Project</h3>
                <p className="text-textSecondary text-sm leading-relaxed mb-4">
                  The largest U.S. homeless UBI pilot (820 participants, 2022-2023). The $1,000/month group vs. $50/month comparison group:
                </p>
                <div className="space-y-2">
                  {[
                    '43% housed (vs. 25% in comparison group)',
                    'Full-time employment increased from 18% to 23%',
                    'Emergency room visits decreased significantly',
                    'Mental health outcomes improved across all measures',
                    'Substance use decreased in cash recipient groups',
                    'Results held across all demographic groups',
                  ].map((item, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }} transition={{ delay: i * 0.06, duration: 0.3 }}
                      className="flex items-start gap-3 p-3 rounded-xl bg-surfaceHigh">
                      <span className="text-accent mt-0.5 flex-shrink-0">✓</span>
                      <p className="text-sm text-textSecondary">{item}</p>
                    </motion.div>
                  ))}
                </div>
              </FadeIn>

              <FadeIn className="mb-8">
                <h3 className="text-xl font-bold text-textPrimary mb-4">Cash Pilots for Homeless Individuals</h3>
                <div className="overflow-x-auto -mx-4 px-4">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 pr-3 text-textMuted font-medium text-xs">Location</th>
                        <th className="text-left py-2 pr-3 text-textMuted font-medium text-xs">N</th>
                        <th className="text-left py-2 text-textMuted font-medium text-xs">Key Result</th>
                      </tr>
                    </thead>
                    <tbody>
                      {PILOTS.map((pilot, i) => (
                        <motion.tr key={pilot.name} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
                          viewport={{ once: true }} transition={{ delay: i * 0.07 }}
                          className={`border-b border-border/50 ${pilot.org === 'The Logical Foundation' ? 'bg-accentDim/10' : ''}`}>
                          <td className="py-3 pr-3">
                            <p className={`font-medium ${pilot.org === 'The Logical Foundation' ? 'text-accent' : 'text-textPrimary'}`}>{pilot.name}</p>
                            <p className="text-xs text-textMuted">{pilot.org}</p>
                          </td>
                          <td className="py-3 pr-3 text-textSecondary">{pilot.n}</td>
                          <td className="py-3 text-textSecondary text-sm leading-snug">{pilot.result}</td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </FadeIn>

              <FadeIn className="mb-8">
                <h3 className="text-xl font-bold text-textPrimary mb-3">A Worst-Case Scenario</h3>
                <div className="card">
                  <p className="text-textSecondary text-sm leading-relaxed mb-3">
                    Simon, a participant in the London pilot, had been homeless for over a decade with severe mental health challenges and substance dependency.
                  </p>
                  <p className="text-textSecondary text-sm leading-relaxed mb-3">
                    Given £3,000 with no conditions, Simon used the money to reconnect with his estranged daughter, pay for a bus ticket to visit her, and eventually secure housing near her family.
                  </p>
                  <p className="text-textPrimary text-sm leading-relaxed italic mb-3">
                    "The Economist reported that the total cost of Simon's homelessness to the state over the previous decade exceeded £400,000. The cash transfer that changed his life cost £3,000."
                  </p>
                  <p className="text-accent text-xs font-semibold">- The Economist</p>
                </div>
              </FadeIn>

              <FadeIn className="mb-8">
                <h3 className="text-xl font-bold text-textPrimary mb-4">The Arizona Crisis</h3>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {[
                    { stat: '14.2%', label: 'annual mortality rate among homeless Arizonans' },
                    { stat: '1,286', label: 'deaths in Maricopa County alone in 2022' },
                    { stat: '$20M', label: 'could end homelessness in Pima County' },
                    { stat: '$150M', label: 'could end homelessness statewide' },
                  ].map(item => (
                    <div key={item.stat} className="text-center p-4 rounded-2xl bg-surface border border-border">
                      <p className="text-2xl font-bold text-accent">{item.stat}</p>
                      <p className="text-sm text-textSecondary mt-1 leading-snug">{item.label}</p>
                    </div>
                  ))}
                </div>
                <div className="card">
                  <p className="text-textSecondary text-sm leading-relaxed">
                    Arizona's homeless population faces the <span className="font-semibold text-textPrimary">highest preventable mortality rate in the United States</span>. The heat, lack of shelter, and inadequate services create a crisis that costs lives every day.
                  </p>
                  <p className="text-textSecondary text-sm leading-relaxed mt-3">
                    Our vision: start in Pima County, prove the model, then scale to end homelessness across Arizona and eventually the nation.
                  </p>
                </div>
              </FadeIn>

              <FadeIn className="space-y-3 mb-6">
                <button onClick={onGetStarted} className="btn-primary w-full py-4 text-base">
                  Make Your Pledge →
                </button>
                <button onClick={() => setSection('overview')} className="btn-secondary w-full">
                  ← UBI Evidence
                </button>
              </FadeIn>
            </motion.div>
          )}

        </AnimatePresence>

        <button onClick={onBack} className="btn-secondary w-full mt-2">← Back</button>
      </div>
    </StepWrapper>
  );
};
