# GeoLearn — reklama (landing) sayti

GeoLearn ta'lim platformasi uchun 3D elementlarga boy landing sahifa.
**Vue 3 + Vite + JavaScript + Tailwind CSS v4 + Three.js + GSAP ScrollTrigger + Lenis.**
Matnlar o'zbek (lotin) va rus tillarida, qorong'i va yorug' rejimlar bilan.

## Ishga tushirish

Talab: **Node.js 20.19+** (yoki 22.12+).

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # tayyor sayt → dist/
npm run preview    # build natijasini lokal ko'rish
```

## Portal havolalarini o'zgartirish

Saytdagi barcha «Kirish», «Panelga kirish», «Ro'yxatdan o'tish» tugmalari bitta fayldan oladi:
`src/config/links.js`.

Domenni o'zgartirish uchun `.env` faylini tahrirlang (namuna — `.env.example`):

```env
VITE_ADMIN_URL=https://geolearn-modified1-admin.vercel.app   # O'qituvchi paneli  → /dashboard
VITE_USER_URL=https://geolearn-modified1.vercel.app   # O'quvchi portali   → /login, /register
VITE_SITE_URL=https://geolearn.uz          # Landingning o'z domeni (canonical, OG rasm)
```

Natija:

| Tugma | Havola |
| --- | --- |
| O'qituvchi paneli / Panelga kirish | `${VITE_ADMIN_URL}/dashboard` |
| O'quvchi sifatida kirish / Kirish | `${VITE_USER_URL}/login` |
| Ro'yxatdan o'tish | `${VITE_USER_URL}/register` |

Barcha havolalar shu tabning o'zida ochiladi. Kartochka bosilganda qisqa «uchib kirish»
animatsiyasi bo'ladi (Ctrl/Cmd + bosish — odatdagidek yangi tabda ochadi).

> Vercel'da `.env` o'rniga **Settings → Environment Variables** bo'limida ham berish mumkin —
> u yerdagi qiymatlar ustun turadi. O'zgartirgandan keyin qayta deploy qiling.

## Skrinshotlarni almashtirish

Hozir `public/screens/` ichida namuna (placeholder) rasmlar turibdi — o'zingizning haqiqiy
skrinshotlaringizni **xuddi shu nom bilan** qo'ying:

| Fayl | Qayerda | Tavsiya etilgan o'lcham |
| --- | --- | --- |
| `public/screens/admin.png` | O'qituvchilar bo'limi, 3D noutbuk ekrani | 1600 × 1040 (16 : 10.4) |
| `public/screens/student.png` | O'quvchilar bo'limi, 3D planshet ekrani | 1600 × 1200 (4 : 3) |

Rasm ekranni to'liq qoplaydi (`object-fit: cover`, yuqori-chap burchakdan), shuning uchun
nisbat biroz farq qilsa ham buzilmaydi. WebP ishlatmoqchi bo'lsangiz — fayl nomini
`TeachersSection.vue` / `StudentsSection.vue` dagi `src` qatorida ham almashtiring.

## Matnlarni tahrirlash

| Nima | Fayl |
| --- | --- |
| Barcha matnlar (UZ / RU) | `src/i18n/uz.json`, `src/i18n/ru.json` |
| FAQ savol-javoblari | `src/content/faq.js` (`TODO` belgili javoblarni to'ldiring) |
| Aloqa: Telegram, email, telefon | `src/config/site.js` |
| Xaritadagi yozuvlar (3D relyef) | `src/content/geo.js` |
| Brend ranglari | `src/styles/main.css` (`:root` va `.dark`) |

Til `?lang=ru` parametri bilan ham ochiladi (masalan, `https://geolearn.uz/?lang=ru`).

## 3D sahnalar

| Sahna | Fayl |
| --- | --- |
| Hero: interaktiv Yer shari, O'rta Osiyo + Toshkent markeri, orbitadagi kartochkalar | `components/three/HeroGlobe.vue`, `engine/heroGlobe.js`, `engine/earth.js` |
| Skroll bilan O'rta Osiyoga «sho'ng'ish» → low-poly relyef xarita | `components/sections/DiveSection.vue`, `engine/diveScene.js`, `engine/terrain.js` |
| Imkoniyatlar: 7 ta aylanuvchi 3D ikonka (bitta canvas, scissor) | `components/sections/FeaturesSection.vue`, `engine/featureIcons.js` |
| AI yordamchi: shisha «orb» | `components/sections/AiSection.vue`, `engine/aiOrb.js` |
| Noutbuk / planshet / jonli o'yin paneli / rol kartochkalari | CSS 3D + GSAP (`components/devices`, `components/role`) |

Ishlash tezligi uchun:

- three.js alohida chunk'da va **dangasa yuklanadi**: sahna faqat ekranga yaqinlashganda
  dinamik `import()` qilinadi; ungacha skeleton yoki oldindan chizilgan statik rasm turadi.
  Hero globusi birinchi harakatgacha (sichqoncha, skroll, teginish) yoki ~3.5 s gacha statik
  rasm bilan turadi — sahifa tez ochiladi.
- Ko'rinmayotgan sahnalar render qilinmaydi (IntersectionObserver + Page Visibility).
- DPR `[1, 2]` (telefonda 1.5 gacha), teksturalar WebP/PNG, jami ~0.5 MB.
- Qurilma darajasi avtomatik tanlanadi (`src/composables/useDevice.js`):
  - **full** — kuchli kompyuter: yuqori poligon, yulduzlar, tungi chiroqlar, 2K teksturalar;
  - **lite** — telefon/planshet yoki kuchsiz qurilma: kamroq poligon, zarrachalarsiz, 1K teksturalar;
  - **static** — WebGL yo'q, `prefers-reduced-motion`, Save-Data yoki juda kuchsiz qurilma:
    3D o'rniga statik rasmlar, animatsiyalar o'chadi, sayt to'liq ishlaydi.
- Tekshirish uchun URL'ga `?tier=full`, `?tier=lite` yoki `?tier=static` qo'shing.

## SEO

- `index.html` — title, description, canonical, hreflang (uz/ru), Open Graph, Twitter card, JSON-LD.
- `public/og-image.png` (1200 × 630), `favicon.svg`, `apple-touch-icon.png`, `site.webmanifest`.
- `public/robots.txt` va `public/sitemap.xml` ichidagi `https://geolearn.uz` ni **o'z domeningizga
  almashtiring** (bu ikki fayl statik, `.env` dan o'qilmaydi).

## Deploy (Vercel)

1. Loyihani GitHub'ga yuklang va Vercel'da **Import Project** qiling (framework: Vite — avtomatik).
2. Environment Variables: `VITE_ADMIN_URL`, `VITE_USER_URL`, `VITE_SITE_URL`.
3. Deploy. `vercel.json` SPA rewrite va kesh sarlavhalarini sozlaydi.

Boshqa hostinglarda ham ishlaydi: `npm run build` → `dist/` papkasini istalgan statik hostingga qo'ying.

## Papkalar tuzilishi

```
src/
  config/links.js          ← portal havolalari (bitta joyda)
  config/site.js           ← aloqa ma'lumotlari, menyu
  content/faq.js           ← FAQ
  content/geo.js           ← xarita yozuvlari
  i18n/uz.json, ru.json    ← tarjimalar
  components/
    layout/                ← Header, Footer
    sections/              ← sahifa bo'limlari (yuqoridan pastga)
    three/                 ← 3D komponentlar
    three/engine/          ← three.js sahnalari (lazy chunk)
    devices/, role/, ui/   ← noutbuk/planshet, rol kartochkalari, UI elementlar
  composables/             ← tema, qurilma darajasi, skroll, tilt, lazy 3D
public/
  textures/, geo/          ← Yer teksturalari, O'rta Osiyo relyef ma'lumotlari
  images/                  ← statik fallback rasmlar, kontur chiziqlar
  screens/                 ← dashboard skrinshotlari (almashtiring)
```

## Manbalar va litsenziyalar

- Yer teksturalari: NASA Visible Earth — Blue Marble / Black Marble (public domain),
  [three-globe](https://github.com/vasturiano/three-globe) namunalari orqali.
- Chegaralar, ko'llar, daryolar: [Natural Earth](https://www.naturalearthdata.com/) (public domain).
- Relyef balandliklari: NASA topografiya xaritasi (public domain).
- Shrift: Inter (SIL Open Font License) — `@fontsource-variable/inter`.
- GLSL simplex noise: Ashima Arts / Stefan Gustavson (MIT).
