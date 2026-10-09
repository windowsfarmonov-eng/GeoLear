// Oyna (modal) ochilganda orqadagi 3D sahnalarni to'xtatish uchun umumiy bayroq.
// three.js'ni import qilmaydi — asosiy bundle'ga yengil qo'shiladi.
const listeners = new Set()
export const pauseState = { background: false }

export function pauseBackgroundStages(paused) {
  pauseState.background = paused
  for (const fn of listeners) fn()
}

export function onPauseChange(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}
