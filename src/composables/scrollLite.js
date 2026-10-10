// Silliq skroll (Lenis + GSAP ScrollTrigger, ~50 KB gzip) birinchi ekran chizilishini kutdirmasin:
// bu yengil fasad og'ir modulni faqat kerak bo'lganda (yoki sahifa chizilgach) yuklaydi.

let heavy = null
/** useSmoothScroll.js (Lenis, GSAP) — bir marta yuklanadi */
export const loadSmoothScroll = () => (heavy ??= import('./useSmoothScroll'))

// Pastdagi bo'limlar bosqichma-bosqich chiziladi (App.vue) — #bo'limga o'tish ularni kutadi
let sectionsReady = Promise.resolve()
let hurry = () => {}
/** start — bo'limlarni kutmasdan chizishni boshlaydi */
export function setSectionsReady(promise, start = () => {}) {
  sectionsReady = promise
  hurry = start
}

export function scrollToSection(id) {
  hurry()
  Promise.all([loadSmoothScroll(), sectionsReady]).then(([scroll]) => scroll.scrollToSection(id))
}

export function scrollToElement(el, offset = 0) {
  loadSmoothScroll().then((scroll) => scroll.scrollToElement(el, offset))
}

export function stopScroll() {
  document.documentElement.classList.add('scroll-locked')
  loadSmoothScroll().then((scroll) => scroll.stopScroll())
}

export function startScroll() {
  document.documentElement.classList.remove('scroll-locked')
  loadSmoothScroll().then((scroll) => scroll.startScroll())
}
