import { beforeEach, describe, expect, it, vi } from 'vitest'
import { applyTheme, getPreferredTheme, THEME_STORAGE_KEY } from '../utils/themeUtils.js'

const storage = new Map()
const themeColor = { setAttribute: vi.fn() }

beforeEach(() => {
  storage.clear()
  themeColor.setAttribute.mockClear()
  vi.stubGlobal('window', {
    localStorage: {
      getItem: (key) => storage.get(key) ?? null,
      setItem: (key, value) => storage.set(key, value),
    },
    matchMedia: () => ({ matches: true }),
  })
  vi.stubGlobal('document', {
    documentElement: { dataset: {}, style: {} },
    querySelector: () => themeColor,
  })
})

describe('preferencia de tema', () => {
  it('usa el tema guardado antes que la preferencia del sistema', () => {
    storage.set(THEME_STORAGE_KEY, 'light')
    expect(getPreferredTheme()).toBe('light')
  })

  it('usa la preferencia oscura del sistema cuando no hay tema guardado', () => {
    expect(getPreferredTheme()).toBe('dark')
  })

  it('aplica y persiste el tema', () => {
    applyTheme('dark')
    expect(document.documentElement.dataset.theme).toBe('dark')
    expect(document.documentElement.style.colorScheme).toBe('dark')
    expect(storage.get(THEME_STORAGE_KEY)).toBe('dark')
    expect(themeColor.setAttribute).toHaveBeenCalledWith('content', '#0d141b')
  })
})
