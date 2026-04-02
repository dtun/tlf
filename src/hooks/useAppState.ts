import { useState, useCallback } from 'react'
import { AppState, defaultState, UserInfo } from '../types'

const STORAGE_KEY = 'tlf-app-state'

/** PII fields that must NOT be persisted to localStorage (fix #15) */
const PII_KEYS: (keyof UserInfo)[] = [
  'firstName',
  'lastName',
  'email',
  'phone',
  'street',
  'city',
  'stateRegion',
  'postalCode',
  'country',
  'homelessDescription',
]

function sanitizeForStorage(state: AppState): AppState {
  const sanitized = JSON.parse(JSON.stringify(state)) as AppState
  for (const key of PII_KEYS) {
    sanitized.userInfo[key] = '' as never
  }
  return sanitized
}

function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...defaultState }
    const parsed = JSON.parse(raw) as Partial<AppState>
    return {
      ...defaultState,
      ...parsed,
      userInfo: { ...defaultState.userInfo, ...parsed.userInfo },
      auth: { ...defaultState.auth, ...parsed.auth },
      azTaxCredit: { ...defaultState.azTaxCredit, ...parsed.azTaxCredit },
      ubiPledge: { ...defaultState.ubiPledge, ...parsed.ubiPledge },
      foundationFund: { ...defaultState.foundationFund, ...parsed.foundationFund },
      comingle: { ...defaultState.comingle, ...parsed.comingle },
    }
  } catch {
    return { ...defaultState }
  }
}

function persistState(state: AppState): void {
  const sanitized = sanitizeForStorage(state)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized))
}

export function useAppState() {
  const [state, setState] = useState<AppState>(loadState)

  const update = useCallback(<K extends keyof AppState>(key: K, value: AppState[K]) => {
    setState((prev) => {
      const next = { ...prev, [key]: value }
      persistState(next)
      return next
    })
  }, [])

  const updateNested = useCallback(<K extends keyof AppState>(
    key: K,
    patch: Partial<AppState[K]>
  ) => {
    setState((prev) => {
      const nested = prev[key]
      const next = {
        ...prev,
        [key]: typeof nested === 'object' && nested !== null
          ? { ...nested, ...patch }
          : patch,
      }
      persistState(next)
      return next
    })
  }, [])

  const goToStep = useCallback((step: number, subStep = 1) => {
    setState((prev) => {
      const next = { ...prev, currentStep: step, currentSubStep: subStep }
      persistState(next)
      return next
    })
  }, [])

  const nextStep = useCallback(() => {
    setState((prev) => {
      const next = { ...prev, currentStep: prev.currentStep + 1, currentSubStep: 1 }
      persistState(next)
      return next
    })
  }, [])

  const prevStep = useCallback(() => {
    setState((prev) => {
      const step = Math.max(1, prev.currentStep - 1)
      const next = { ...prev, currentStep: step, currentSubStep: 1 }
      persistState(next)
      return next
    })
  }, [])

  const reset = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setState({ ...defaultState })
  }, [])

  return {
    state,
    setState,
    update,
    updateNested,
    goToStep,
    nextStep,
    prevStep,
    reset,
  }
}
