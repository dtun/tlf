import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAppState } from '../useAppState'
import { defaultState } from '../../types'

const STORAGE_KEY = 'tlf-app-state'

const PII_KEYS: (keyof typeof defaultState.userInfo)[] = [
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

beforeEach(() => {
  localStorage.clear()
})

describe('useAppState', () => {
  it('returns defaultState when localStorage is empty', () => {
    const { result } = renderHook(() => useAppState())
    expect(result.current.state).toEqual(defaultState)
  })

  it('persists state to localStorage on change', () => {
    const { result } = renderHook(() => useAppState())

    act(() => {
      result.current.update('activated', true)
    })

    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!)
    expect(stored.activated).toBe(true)
  })

  it('does NOT persist PII fields to localStorage (fix #15)', () => {
    const { result } = renderHook(() => useAppState())

    act(() => {
      result.current.updateNested('userInfo', {
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane@test.com',
        phone: '555-1234',
        street: '123 Main St',
        city: 'Tempe',
        stateRegion: 'AZ',
        postalCode: '85281',
        country: 'US',
        homelessDescription: 'some description',
      })
    })

    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!)

    for (const key of PII_KEYS) {
      expect(stored.userInfo[key]).toBe('')
    }
  })

  it('update correctly sets a top-level key', () => {
    const { result } = renderHook(() => useAppState())

    act(() => {
      result.current.update('activated', true)
    })

    expect(result.current.state.activated).toBe(true)
  })

  it('updateNested patches a nested object', () => {
    const { result } = renderHook(() => useAppState())

    act(() => {
      result.current.updateNested('userInfo', { firstName: 'Alice' })
    })

    expect(result.current.state.userInfo.firstName).toBe('Alice')
    // Other fields remain default
    expect(result.current.state.userInfo.lastName).toBe('')
  })

  it('goToStep sets step and resets subStep', () => {
    const { result } = renderHook(() => useAppState())

    act(() => {
      result.current.update('currentSubStep', 3)
    })

    act(() => {
      result.current.goToStep(5)
    })

    expect(result.current.state.currentStep).toBe(5)
    expect(result.current.state.currentSubStep).toBe(1)
  })

  it('nextStep increments step', () => {
    const { result } = renderHook(() => useAppState())

    act(() => {
      result.current.nextStep()
    })

    expect(result.current.state.currentStep).toBe(2)
  })

  it('prevStep decrements step (min 1)', () => {
    const { result } = renderHook(() => useAppState())

    // Already at step 1
    act(() => {
      result.current.prevStep()
    })
    expect(result.current.state.currentStep).toBe(1)

    // Go to step 3, then back
    act(() => {
      result.current.goToStep(3)
    })
    act(() => {
      result.current.prevStep()
    })
    expect(result.current.state.currentStep).toBe(2)
  })

  it('reset clears localStorage and returns to defaultState', () => {
    const { result } = renderHook(() => useAppState())

    act(() => {
      result.current.update('activated', true)
      result.current.update('currentStep', 5)
    })

    act(() => {
      result.current.reset()
    })

    expect(result.current.state).toEqual(defaultState)
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
  })

  it('restores non-PII state from localStorage on mount', () => {
    // Pre-populate localStorage with some state (no PII)
    const saved = {
      ...defaultState,
      currentStep: 4,
      activated: true,
      userInfo: {
        ...defaultState.userInfo,
        giverType: 'individual',
      },
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved))

    const { result } = renderHook(() => useAppState())

    expect(result.current.state.currentStep).toBe(4)
    expect(result.current.state.activated).toBe(true)
    expect(result.current.state.userInfo.giverType).toBe('individual')
  })
})
