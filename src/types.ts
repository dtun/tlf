export type GiverType = 'individual' | 'company' | 'foundation' | 'government' | '';

export type AddressType = 'full' | 'homeless' | 'prefer_not' | '';

export type PledgeType =
  | 'income_based'
  | 'wealth_based'
  | 'vehicle'
  | 'real_estate'
  | 'crypto'
  | 'other'
  | '';

export type PledgeCadence = 'annual' | 'monthly' | 'planned' | '';

export type ImpactZone = 'arizona' | 'america' | 'earth' | 'custom' | '';

export interface UserInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  addressType: AddressType;
  street: string;
  city: string;
  stateRegion: string;
  postalCode: string;
  country: string;
  homelessDescription: string;
  giverType: GiverType;
}

export interface AZTaxCredit {
  filesAZTax: boolean | null;
  willUseCredit: boolean | null;
  wantsCarryForward: boolean | null;
}

export interface PledgeItem {
  id: string;
  pledgeType: PledgeType;
  pledgeTypeOther: string;
  // Income-based
  estimatedIncome: string;
  incomePercent: string;
  // Wealth-based
  estimatedNetWorth: string;
  wealthPercent: string;
  // Vehicle
  vehicleYear: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleMileage: string;
  vehicleCondition: string;
  // Real estate
  propertyAddress: string;
  propertyType: string;
  estimatedPropertyValue: string;
  // Crypto / other
  otherDescription: string;
  otherEstimatedValue: string;
  cryptoEstimatedValue: string;
  vehicleEstimatedValue: string;
  // Cadence per item
  cadence: PledgeCadence;
}

export const defaultPledgeItem = (): PledgeItem => ({
  id: Math.random().toString(36).slice(2),
  pledgeType: '',
  pledgeTypeOther: '',
  estimatedIncome: '',
  incomePercent: '1',
  estimatedNetWorth: '',
  wealthPercent: '1',
  vehicleYear: '',
  vehicleMake: '',
  vehicleModel: '',
  vehicleMileage: '',
  vehicleCondition: '',
  propertyAddress: '',
  propertyType: '',
  estimatedPropertyValue: '',
  otherDescription: '',
  otherEstimatedValue: '',
  cryptoEstimatedValue: '',
  vehicleEstimatedValue: '',
  cadence: '',
});

export interface UBIPledge {
  impactZone: ImpactZone;
  customImpactZone: string;
  pledges: PledgeItem[];
  homelessnessPriority: boolean | null;
}

export interface FoundationFund {
  opinion: 'terrible' | 'good' | null;
  comment: string;
}

export interface Comingle {
  opinion: 'terrible' | 'good' | null;
  comment: string;
}

export interface AuthState {
  password: string;
  confirmPassword: string;
  verifyMethod: 'email' | 'text' | '';
  verificationCode: string;
  codeEntered: string;
  verified: boolean;
}

export interface VolunteerStatus {
  id: string;
  points: number;
  tier: string;
}

export interface AppState {
  currentStep: number;
  currentSubStep: number;
  activated: boolean;
  isPublic: boolean | null;
  userRole: 'user' | 'admin';
  volunteerStatus: VolunteerStatus | null;
  userInfo: UserInfo;
  azTaxCredit: AZTaxCredit;
  ubiPledge: UBIPledge;
  foundationFund: FoundationFund;
  comingle: Comingle;
  auth: AuthState;
}

export const defaultState: AppState = {
  currentStep: 1,
  currentSubStep: 1,
  activated: false,
  isPublic: null,
  userRole: 'user',
  volunteerStatus: null,
  auth: {
    password: '',
    confirmPassword: '',
    verifyMethod: '',
    verificationCode: '',
    codeEntered: '',
    verified: false,
  },
  userInfo: {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    addressType: '',
    street: '',
    city: '',
    stateRegion: '',
    postalCode: '',
    country: '',
    homelessDescription: '',
    giverType: '',
  },
  azTaxCredit: {
    filesAZTax: null,
    willUseCredit: null,
    wantsCarryForward: null,
  },
  ubiPledge: {
    impactZone: '',
    customImpactZone: '',
    pledges: [],
    homelessnessPriority: null,
  },
  foundationFund: {
    opinion: null,
    comment: '',
  },
  comingle: {
    opinion: null,
    comment: '',
  },
};
