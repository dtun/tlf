import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { UserInfo, GiverType, AddressType } from '../types';
import { NavButtons } from '../components/NavButtons';
import { StepWrapper } from '../components/StepWrapper';

interface Step2Props {
  userInfo: UserInfo;
  onChange: (patch: Partial<UserInfo>) => void;
  onNext: () => void;
  onBack: () => void;
  subStep: number;
  onSubStep: (n: number) => void;
}


const GIVER_TYPES: { value: GiverType; label: string; desc: string }[] = [
  { value: 'individual', label: 'Individual', desc: 'Personal giving' },
  { value: 'company', label: 'Company', desc: 'Corporate giving program' },
  { value: 'foundation', label: 'Charitable Institution', desc: 'Church, family foundation, or private foundation' },
  { value: 'government', label: 'Government Entity', desc: 'Public agency or municipality' },
];

export const Step2UserInfo: React.FC<Step2Props> = ({
  userInfo,
  onChange,
  onNext,
  onBack,
  subStep,
  onSubStep,
}) => {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate21 = () => {
    const e: Record<string, string> = {};
    if (!userInfo.firstName.trim()) e.firstName = 'First name is required';
    if (!userInfo.lastName.trim()) e.lastName = 'Last name is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validate22 = () => {
    const e: Record<string, string> = {};
    if (!userInfo.email.trim()) {
      e.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userInfo.email)) {
      e.email = 'Enter a valid email address';
    }
    if (!userInfo.phone.trim()) {
      e.phone = 'Phone number is required';
    } else if (!/^\+?[\d\s\-().]{7,15}$/.test(userInfo.phone.trim())) {
      e.phone = 'Enter a valid phone number';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validate23 = () => {
    const e: Record<string, string> = {};
    if (!userInfo.addressType) {
      e.addressType = 'Please select an address option';
    } else if (userInfo.addressType === 'full') {
      if (!userInfo.street.trim()) e.street = 'Street address is required';
      if (!userInfo.city.trim()) e.city = 'City is required';
      if (!userInfo.country.trim()) e.country = 'Country is required';
    } else if (userInfo.addressType === 'homeless') {
      if (!userInfo.homelessDescription.trim()) e.homelessDescription = 'Please describe where you stay';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validate24 = () => {
    const e: Record<string, string> = {};
    if (!userInfo.giverType) e.giverType = 'Please select a type';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubNext = () => {
    setErrors({});
    if (subStep === 1 && validate21()) onSubStep(2);
    else if (subStep === 2 && validate22()) onSubStep(3);
    else if (subStep === 3 && validate23()) onSubStep(4);
    else if (subStep === 4 && validate24()) onNext();
  };

  const handleSubBack = () => {
    setErrors({});
    if (subStep === 1) onBack();
    else onSubStep(subStep - 1);
  };

  const subLabels = ['Name', 'Contact', 'Address', 'Type'];

  return (
    <StepWrapper stepKey={`step2-${subStep}`}>
      <div className="px-4 py-2">
        {/* Sub-step indicator */}
        <div className="flex gap-2 mb-6">
          {subLabels.map((label, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div
                className={`w-full h-1 rounded-full transition-all duration-300 ${
                  i + 1 <= subStep ? 'bg-accent' : 'bg-border'
                }`}
              />
              <span className={`text-xs ${i + 1 === subStep ? 'text-accent' : 'text-textMuted'}`}>
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* Sub-step 2.1: Name */}
        {subStep === 1 && (
          <div>
            <h2 className="text-2xl font-bold text-textPrimary mb-1">Your Name</h2>
            <p className="text-textSecondary text-sm mb-6">Let's start with the basics.</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-textSecondary mb-1">
                  First Name <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Jane"
                  value={userInfo.firstName}
                  onChange={e => onChange({ firstName: e.target.value })}
                  autoFocus
                />
                {errors.firstName && (
                  <p className="text-danger text-xs mt-1">{errors.firstName}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-textSecondary mb-1">
                  Last Name <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Doe"
                  value={userInfo.lastName}
                  onChange={e => onChange({ lastName: e.target.value })}
                />
                {errors.lastName && (
                  <p className="text-danger text-xs mt-1">{errors.lastName}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Sub-step 2.2: Contact */}
        {subStep === 2 && (
          <div>
            <h2 className="text-2xl font-bold text-textPrimary mb-1">Contact Info</h2>
            <p className="text-textSecondary text-sm mb-6">
              Both email and phone are required.
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-textSecondary mb-1">
                  Email Address <span className="text-danger">*</span>
                </label>
                <input
                  type="email"
                  className="input-field"
                  placeholder="jane@example.com"
                  value={userInfo.email}
                  onChange={e => onChange({ email: e.target.value })}
                  autoFocus
                />
                {errors.email && (
                  <p className="text-danger text-xs mt-1">{errors.email}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-textSecondary mb-1">
                  Phone Number <span className="text-danger">*</span>
                </label>
                <input
                  type="tel"
                  className="input-field"
                  placeholder="(602) 555-0100"
                  value={userInfo.phone}
                  onChange={e => onChange({ phone: e.target.value })}
                />
                {errors.phone && (
                  <p className="text-danger text-xs mt-1">{errors.phone}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Sub-step 2.3: Address */}
        {subStep === 3 && (
          <div>
            <h2 className="text-2xl font-bold text-textPrimary mb-1">Your Address</h2>
            <p className="text-textSecondary text-sm mb-4">
              Used to match you with geographic programs.
            </p>

            <div className="space-y-3 mb-4">
              {(
                [
                  { value: 'full', label: 'Full Mailing Address', icon: '🏠' },
                  { value: 'homeless', label: "I'm Homeless", icon: '🤝' },
                  { value: 'prefer_not', label: 'I prefer not to share', icon: '🔒' },
                ] as { value: AddressType; label: string; icon: string }[]
              ).map(opt => (
                <motion.div
                  key={opt.value}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => onChange({ addressType: opt.value })}
                  className={`radio-option ${userInfo.addressType === opt.value ? 'selected' : ''}`}
                >
                  <span className="text-xl">{opt.icon}</span>
                  <div>
                    <p className="font-medium text-textPrimary">{opt.label}</p>
                    {opt.value === 'prefer_not' && (
                      <p className="text-xs font-semibold text-white/90">
                        Note: We can't distribute your UBI if we can't verify your address.
                      </p>
                    )}
                  </div>
                  <div className="ml-auto">
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        userInfo.addressType === opt.value
                          ? 'border-accent bg-accent'
                          : 'border-border'
                      }`}
                    >
                      {userInfo.addressType === opt.value && (
                        <div className="w-2 h-2 rounded-full bg-white" />
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {errors.addressType && (
              <p className="text-danger text-xs mb-3">{errors.addressType}</p>
            )}

            {userInfo.addressType === 'full' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-textSecondary mb-1">
                    Street Address <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="123 Main St / Apt 4B"
                    value={userInfo.street}
                    onChange={e => onChange({ street: e.target.value })}
                  />
                  {errors.street && <p className="text-danger text-xs mt-1">{errors.street}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-textSecondary mb-1">
                    City / Town <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Phoenix"
                    value={userInfo.city}
                    onChange={e => onChange({ city: e.target.value })}
                  />
                  {errors.city && <p className="text-danger text-xs mt-1">{errors.city}</p>}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-textSecondary mb-1">
                      State / Region / Province
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="Arizona"
                      value={userInfo.stateRegion}
                      onChange={e => onChange({ stateRegion: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-textSecondary mb-1">
                      Postal / ZIP Code
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="85001"
                      value={userInfo.postalCode}
                      onChange={e => onChange({ postalCode: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-textSecondary mb-1">
                    Country <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="United States"
                    value={userInfo.country}
                    onChange={e => onChange({ country: e.target.value })}
                  />
                  {errors.country && <p className="text-danger text-xs mt-1">{errors.country}</p>}
                </div>
              </div>
            )}

            {userInfo.addressType === 'homeless' && (
              <div>
                <label className="block text-sm font-medium text-textSecondary mb-1">
                  Where do you currently stay? <span className="text-danger">*</span>
                </label>
                <textarea
                  className="input-field resize-none"
                  rows={3}
                  placeholder="Cross streets, shelter name, or general area..."
                  value={userInfo.homelessDescription}
                  onChange={e => onChange({ homelessDescription: e.target.value })}
                />
                {errors.homelessDescription && (
                  <p className="text-danger text-xs mt-1">{errors.homelessDescription}</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Sub-step 2.4: Giver Type */}
        {subStep === 4 && (
          <div>
            <h2 className="text-2xl font-bold text-textPrimary mb-1">Type of Giver</h2>
            <p className="text-textSecondary text-sm mb-6">
              This helps us tailor your giving options.
            </p>
            <div className="space-y-3">
              {GIVER_TYPES.map(opt => (
                <motion.div
                  key={opt.value}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => onChange({ giverType: opt.value })}
                  className={`radio-option ${userInfo.giverType === opt.value ? 'selected' : ''}`}
                >
                  <div className="flex-1">
                    <p className="font-semibold text-textPrimary">{opt.label}</p>
                    <p className="text-sm text-textSecondary">{opt.desc}</p>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      userInfo.giverType === opt.value
                        ? 'border-accent bg-accent'
                        : 'border-border'
                    }`}
                  >
                    {userInfo.giverType === opt.value && (
                      <div className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
            {errors.giverType && (
              <p className="text-danger text-xs mt-2">{errors.giverType}</p>
            )}
          </div>
        )}

        <NavButtons
          onNext={handleSubNext}
          onBack={handleSubBack}
          nextLabel={subStep === 4 ? 'Continue' : 'Next'}
        />
      </div>
    </StepWrapper>
  );
};
