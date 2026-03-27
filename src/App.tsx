import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useAppState } from './hooks/useAppState';
import { Nav } from './components/Nav';
import { ProgressBar } from './components/ProgressBar';
import { Step1Welcome } from './steps/Step1Welcome';
import { Step2UserInfo } from './steps/Step2UserInfo';
import { Step3UBIPledge } from './steps/Step3UBIPledge';
import { Step4AZTaxCredit } from './steps/Step4AZTaxCredit';
import { Step5FoundationFund } from './steps/Step5FoundationFund';
import { Step6Comingle } from './steps/Step6Comingle';
import { Step7Review } from './steps/Step7Review';
import { StepAuth } from './steps/StepAuth';
import { StepLogin } from './steps/StepLogin';
import { BoardOfDirectors } from './components/BoardOfDirectors';
import { AboutUs } from './components/AboutUs';
import { ProgramUBIPledge } from './components/ProgramUBIPledge';
import { ProgramAZTaxCredit } from './components/ProgramAZTaxCredit';
import { ProgramComingle } from './components/ProgramComingle';
import { ProgramFoundationFund } from './components/ProgramFoundationFund';
import { Research } from './components/Research';
import { DonatePage } from './components/DonatePage';
import { GetInvolved } from './components/GetInvolved';
import { StayInformed } from './components/StayInformed';
import { PrivacyPolicy } from './components/PrivacyPolicy';
import { Financials } from './components/Financials';
import { FAQPage } from './components/FAQPage';
import { AdminPanel } from './components/AdminPanel';
import { VolunteerPortal } from './components/VolunteerPortal';
import { auth as authApi, profile as profileApi, pledge as pledgeApi, programs as programsApi } from './lib/api';
import { supabase } from './lib/supabase';

const TOTAL_STEPS = 7;

// Hash <-> step mapping for public/linkable pages
const HASH_TO_STEP: Record<string, number> = {
  'about':           90,
  'programs':        91,
  'programs/ubi':    91,
  'programs/aztax':  92,
  'programs/comingle': 93,
  'programs/foundation-fund': 94,
  'research':        95,
  'donate':          97,
  'board':           99,
  'get-involved':    100,
  'stay-informed':   101,
  'privacy':         102,
  'financials':      105,
  'volunteer':       104,
  'faq':             106,
};
const STEP_TO_HASH: Record<number, string> = Object.fromEntries(
  Object.entries(HASH_TO_STEP).map(([h, s]) => [s, h])
);

export default function App() {
  const { state, setState, update, updateNested, goToStep, nextStep, prevStep, reset } = useAppState();
  const [restoring, setRestoring] = useState(false);

  // On mount: restore session via Supabase auth state
  useEffect(() => {
    if (state.activated) return;

    const restoreSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      setRestoring(true);
      try {
        const [meData, profileData, pledgeData] = await Promise.all([
          authApi.me().catch(() => null),
          profileApi.get().catch(() => null),
          pledgeApi.get().catch(() => null),
        ]);
        if (!meData) { authApi.logout(); return; }
        const isAdmin = meData.role === 'admin';
        setState(prev => {
          const next = {
            ...prev,
            activated: true,
            currentStep: isAdmin ? 103 : 7,
            userRole: (isAdmin ? 'admin' : 'user') as typeof prev.userRole,
            volunteerStatus: meData.volunteerStatus ?? null,
          };
          if (profileData) {
            next.userInfo = {
              ...prev.userInfo,
              firstName: profileData.firstName ?? '',
              lastName: profileData.lastName ?? '',
              addressType: (profileData.addressType as typeof prev.userInfo.addressType) ?? '',
              street: profileData.street ?? '',
              city: profileData.city ?? '',
              stateRegion: profileData.stateRegion ?? '',
              postalCode: profileData.postalCode ?? '',
              country: profileData.country ?? '',
              homelessDescription: profileData.homelessDescription ?? '',
              giverType: (profileData.giverType as typeof prev.userInfo.giverType) ?? '',
            };
          }
          if (pledgeData && (pledgeData as { pledges?: unknown[] }).pledges) {
            next.ubiPledge = {
              ...prev.ubiPledge,
              impactZone: (pledgeData.impactZone as typeof prev.ubiPledge.impactZone) ?? '',
              customImpactZone: pledgeData.customImpactZone ?? '',
              homelessnessPriority: pledgeData.homelessnessPriority ?? null,
            };
          }
          return next;
        });
      } finally {
        setRestoring(false);
      }
    };

    restoreSession();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // On mount: read hash and navigate to the matching page
  useEffect(() => {
    const hash = window.location.hash.replace(/^#\/?/, '');
    if (hash && HASH_TO_STEP[hash] !== undefined) {
      goToStep(HASH_TO_STEP[hash]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When step changes: update the URL hash for public pages
  useEffect(() => {
    const hash = STEP_TO_HASH[state.currentStep];
    if (hash) {
      window.history.replaceState(null, '', `#/${hash}`);
    } else if (state.currentStep === 1 || state.currentStep === 7) {
      // Home / dashboard -- clear the hash
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, [state.currentStep]);

  // Listen for browser back/forward navigation
  useEffect(() => {
    const onHashChange = () => {
      const hash = window.location.hash.replace(/^#\/?/, '');
      if (!hash) { goToStep(state.activated ? 7 : 1); return; }
      const step = HASH_TO_STEP[hash];
      if (step !== undefined) goToStep(step);
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.activated]);

  if (restoring) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-textMuted text-sm">
          Restoring your session...
        </motion.div>
      </div>
    );
  }

  const handleStep1Answer = (_yes: boolean) => {
    // Both yes and no advance, we want everyone's information
    goToStep(2, 1);
  };

  // Called when a returning user successfully logs in, merge their saved data and go to dashboard
  const handleLoggedIn = (patch: Partial<typeof state>) => {
    const pendingStep = sessionStorage.getItem('tlf_post_auth_step');
    if (pendingStep) sessionStorage.removeItem('tlf_post_auth_step');
    setState(prev => {
      const isAdmin = (patch.userRole ?? prev.userRole) === 'admin';
      const defaultStep = isAdmin ? 103 : 7;
      return {
        ...prev,
        ...patch,
        userInfo: { ...prev.userInfo, ...(patch.userInfo ?? {}) },
        ubiPledge: { ...prev.ubiPledge, ...(patch.ubiPledge ?? {}) },
        azTaxCredit: { ...prev.azTaxCredit, ...(patch.azTaxCredit ?? {}) },
        activated: true,
        currentStep: pendingStep ? parseInt(pendingStep) : defaultStep,
      };
    });
  };

  /**
   * Called after identity verification succeeds.
   * Syncs all collected data to the backend in one shot, then marks activated.
   */
  const handleActivate = async () => {
    try {
      await profileApi.save({
        firstName: state.userInfo.firstName,
        lastName: state.userInfo.lastName,
        addressType: state.userInfo.addressType || 'prefer_not',
        street: state.userInfo.street || undefined,
        city: state.userInfo.city || undefined,
        stateRegion: state.userInfo.stateRegion || undefined,
        postalCode: state.userInfo.postalCode || undefined,
        country: state.userInfo.country || undefined,
        homelessDescription: state.userInfo.homelessDescription || undefined,
        giverType: state.userInfo.giverType || 'individual',
      });

      if (state.ubiPledge.pledges.length > 0) {
        await pledgeApi.save({
          impactZone: state.ubiPledge.impactZone || 'arizona',
          customImpactZone: state.ubiPledge.customImpactZone || undefined,
          homelessnessPriority: state.ubiPledge.homelessnessPriority,
          pledges: state.ubiPledge.pledges,
        });
      }

      if (state.azTaxCredit.filesAZTax !== null) {
        await programsApi.saveAZTaxCredit({
          filesAZTax: state.azTaxCredit.filesAZTax,
          willUseCredit: state.azTaxCredit.willUseCredit,
          wantsCarryForward: state.azTaxCredit.wantsCarryForward,
        });
      }

      if (state.foundationFund.opinion) {
        await programsApi.saveFoundationFund({
          opinion: state.foundationFund.opinion,
          comment: state.foundationFund.comment || undefined,
        });
      }

      if (state.comingle.opinion) {
        await programsApi.saveComingle({
          opinion: state.comingle.opinion,
          comment: state.comingle.comment || undefined,
        });
      }
    } catch {
      // API unavailable, data is safe in localStorage, will sync on next session
    }

    update('activated', true);
    goToStep(7);
  };

  const handleSetPublic = async (val: boolean) => {
    update('isPublic', val);
    try {
      await profileApi.setVisibility(val);
    } catch {
      // Non-critical, preference stored locally
    }
  };

  const handleEditSection = (step: number, subStep = 1) => {
    goToStep(step, subStep);
  };

  const handleSignOut = () => {
    reset();
  };

  // Navigate to a public info page, remembering where to return
  const goToPage = (page: number) => goToStep(page);
  const backFromPage = () => {
    if (state.activated) goToStep(7);
    else goToStep(1);
  };

  const showProgress = state.currentStep > 1 && !state.activated && state.currentStep < 8;

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      {/* Nav shown on all pages except the sign-up flow steps 2-8 on mobile (still shown on desktop) */}
      <Nav
        activated={state.activated}
        currentStep={state.currentStep}
        userRole={state.userRole}
        onNavigate={goToPage}
        onSignOut={handleSignOut}
        onGetStarted={() => goToStep(2, 1)}
      />

      {showProgress && (
        <ProgressBar
          currentStep={Math.min(state.currentStep, TOTAL_STEPS)}
          totalSteps={TOTAL_STEPS}
        />
      )}

      {/* pb-20 on mobile to clear the bottom tab bar */}
      <main className="flex-1 w-full max-w-lg mx-auto pb-20 md:pb-12">
        {/* Step 0: returning user login */}
        {state.currentStep === 0 && !state.activated && (
          <StepLogin
            onLoggedIn={handleLoggedIn}
            onBack={() => goToStep(1)}
          />
        )}

        {state.currentStep === 1 && !state.activated && (
          <Step1Welcome
            onAnswer={handleStep1Answer}
            onReturningUser={() => goToStep(0)}
            onBoardOfDirectors={() => goToStep(99)}
            onNavigate={goToPage}
          />
        )}

        {state.currentStep === 2 && !state.activated && (
          <Step2UserInfo
            userInfo={state.userInfo}
            onChange={patch => updateNested('userInfo', patch)}
            onNext={nextStep}
            onBack={prevStep}
            subStep={state.currentSubStep}
            onSubStep={n => update('currentSubStep', n)}
          />
        )}

        {/* Step 3: UBI Giving Pledge (moved before AZ Tax Credit) */}
        {state.currentStep === 3 && !state.activated && (
          <Step3UBIPledge
            ubiPledge={state.ubiPledge}
            onChange={patch => updateNested('ubiPledge', patch)}
            onNext={nextStep}
            onBack={prevStep}
          />
        )}

        {/* Step 4: AZ Tax Credit (non-individuals skip this step) */}
        {state.currentStep === 4 && !state.activated && (
          <Step4AZTaxCredit
            azTaxCredit={state.azTaxCredit}
            onChange={patch => updateNested('azTaxCredit', patch)}
            onNext={() => {
              nextStep();
            }}
            onBack={() => {
              if (state.userInfo.giverType && state.userInfo.giverType !== 'individual') {
                goToStep(3);
              } else {
                prevStep();
              }
            }}
          />
        )}

        {state.currentStep === 5 && !state.activated && (
          <Step5FoundationFund
            foundationFund={state.foundationFund}
            onChange={patch => updateNested('foundationFund', patch)}
            onNext={nextStep}
            onBack={prevStep}
          />
        )}

        {state.currentStep === 6 && !state.activated && (
          <Step6Comingle
            comingle={state.comingle}
            onChange={patch => updateNested('comingle', patch)}
            onNext={nextStep}
            onBack={prevStep}
          />
        )}

        {/* Step 7: pre-activation review */}
        {state.currentStep === 7 && !state.activated && (
          <Step7Review
            state={state}
            onActivate={() => goToStep(8)}
            onSetPublic={handleSetPublic}
            onEdit={handleEditSection}
            onReset={reset}
          />
        )}

        {/* Step 8: password + verification */}
        {state.currentStep === 8 && !state.activated && (
          <StepAuth
            auth={state.auth}
            email={state.userInfo.email}
            phone={state.userInfo.phone}
            onChange={patch => updateNested('auth', patch)}
            onVerified={handleActivate}
            onBack={() => goToStep(7)}
          />
        )}

        {/* Activated dashboard, shown when no public page is active */}
        {state.activated && (state.currentStep < 7 || state.currentStep === 7) && (
          <Step7Review
            state={state}
            onActivate={handleActivate}
            onSetPublic={handleSetPublic}
            onEdit={handleEditSection}
            onReset={reset}
            onNavigate={goToStep}
          />
        )}

        {/* -- Public info pages (90s range) -- */}
        {state.currentStep === 90 && (
          <AboutUs onBack={backFromPage} />
        )}
        {state.currentStep === 91 && (
          <ProgramUBIPledge
            onBack={backFromPage}
            onGetStarted={() => goToStep(state.activated ? 3 : 2)}
            onNavigate={goToPage}
          />
        )}
        {state.currentStep === 92 && (
          <ProgramAZTaxCredit
            onBack={backFromPage}
            onGetStarted={() => {
              if (state.activated) {
                goToStep(4);
              } else {
                // Store intent so login/register can redirect back
                sessionStorage.setItem('tlf_post_auth_step', '4');
                goToStep(0); // go to login
              }
            }}
          />
        )}
        {state.currentStep === 93 && (
          <ProgramComingle onBack={backFromPage} onStayInformed={() => goToStep(101)} />
        )}
        {state.currentStep === 94 && (
          <ProgramFoundationFund onBack={backFromPage} onStayInformed={() => goToStep(101)} />
        )}
        {state.currentStep === 95 && (
          <Research onBack={backFromPage} onGetStarted={() => goToStep(state.activated ? 3 : 2)} />
        )}
        {state.currentStep === 97 && (
          <DonatePage onBack={backFromPage} pledges={state.ubiPledge.pledges} onNavigate={goToPage} />
        )}
        {state.currentStep === 99 && (
          <BoardOfDirectors onBack={backFromPage} />
        )}
        {state.currentStep === 100 && (
          <GetInvolved onBack={backFromPage} />
        )}
        {state.currentStep === 101 && (
          <StayInformed onBack={backFromPage} />
        )}
        {state.currentStep === 102 && (
          <PrivacyPolicy onBack={backFromPage} />
        )}
        {state.currentStep === 105 && (
          <Financials onBack={backFromPage} onNavigate={goToPage} />
        )}
        {state.currentStep === 106 && (
          <FAQPage onBack={backFromPage} onNavigate={goToPage} />
        )}
        {state.currentStep === 103 && state.userRole === 'admin' && (
          <AdminPanel onBack={backFromPage} />
        )}
        {state.currentStep === 103 && state.userRole !== 'admin' && (
          <div className="px-4 py-8 text-center">
            <p className="text-4xl mb-4">🔒</p>
            <p className="text-textPrimary font-semibold mb-2">Admin access required</p>
            <p className="text-textSecondary text-sm mb-6">This area is restricted to TLF staff.</p>
            <button onClick={backFromPage} className="btn-secondary">&larr; Back</button>
          </div>
        )}
        {state.currentStep === 104 && (
          <VolunteerPortal onBack={backFromPage} />
        )}
      </main>
    </div>
  );
}
