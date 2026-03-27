import '@testing-library/jest-dom'

// Node 22+ ships a native `localStorage` that conflicts with jsdom's.
// Replace global localStorage with a simple in-memory implementation for tests.
const storage = new Map<string, string>()
const localStorageMock: Storage = {
  get length() {
    return storage.size
  },
  clear() {
    storage.clear()
  },
  getItem(key: string) {
    return storage.get(key) ?? null
  },
  key(index: number) {
    return [...storage.keys()][index] ?? null
  },
  removeItem(key: string) {
    storage.delete(key)
  },
  setItem(key: string, value: string) {
    storage.set(key, value)
  },
}
Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock, writable: true })
