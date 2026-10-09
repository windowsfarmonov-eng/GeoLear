// ─────────────────────────────────────────────────────────────────────────────
//  FAQ — savol-javoblar. Shu faylni tahrirlang: matnlar saytda avtomatik
//  yangilanadi. «TODO» belgisi bor javoblarni o'z ma'lumotingiz bilan to'ldiring.
//  Javobda oddiy matn yozing; yangi qator uchun \n ishlating.
// ─────────────────────────────────────────────────────────────────────────────

export const faq = {
  uz: [
    {
      id: 'price',
      q: 'Platforma pullikmi?',
      // TODO: narx va ulanish shartlarini yozing
      a: "Narxlar va maktabingizni ulash shartlari bo'yicha biz bilan bog'laning — Telegram, email yoki telefon orqali. Aloqa ma'lumotlari sahifa pastida.",
    },
    {
      id: 'grades',
      q: 'Qaysi sinflar uchun?',
      a: "Platforma 1–11-sinflar uchun mo'ljallangan. Hozir 7-sinf geografiyasi — «O'rta Osiyo tabiiy geografik o'lkasi» bo'yicha 20+ mavzu tayyor. O'qituvchi o'z darslari va mavzularini ham qo'sha oladi.",
    },
    {
      id: 'russian',
      q: 'Rus sinflari uchun ham bormi?',
      a: "Ha. O'zbek va rus sinflari uchun kontent alohida bo'limlarda joylashgan.",
    },
    {
      id: 'register',
      q: "O'quvchi qanday ro'yxatdan o'tadi?",
      a: "O'quvchi «Ro'yxatdan o'tish» tugmasini bosib, o'zi ro'yxatdan o'tadi. O'qituvchi esa sinf o'quvchilari ro'yxatini fayldan yuklashi mumkin.",
    },
    {
      id: 'teacher-account',
      q: "O'qituvchi akkaunti qanday olinadi?",
      // TODO: akkaunt berish tartibini yozing
      a: "O'qituvchi akkaunti uchun biz bilan bog'laning — maktabingiz va sinflaringiz haqida qisqacha yozing, ulanish tartibini tushuntiramiz.",
    },
    {
      id: 'mobile',
      q: 'Telefonda ishlaydimi?',
      a: 'Ha. Platforma brauzer orqali ochiladi — telefon, planshet yoki kompyuterdan foydalanish mumkin.',
    },
    {
      id: 'ai-safety',
      q: 'AI yordamchi xavfsizmi?',
      a: "Ha. O'qituvchi «AI Logs» bo'limida o'quvchilarning AI bilan yozishmalarini nazorat qiladi va nojo'ya so'zlar ishlatilganda ogohlantirish oladi.",
    },
    {
      id: 'author',
      q: "GeoLearn'ni kim yaratgan?",
      a: "GeoLearn'ni Toshkent shahridagi 279-maktab o'quvchisi yaratgan. Platforma geografiya darslari va testlari uchun mo'ljallangan — undan istalgan maktab o'qituvchi va o'quvchilari foydalanishi mumkin.",
    },
  ],
  ru: [
    {
      id: 'price',
      q: 'Платформа платная?',
      // TODO: укажите стоимость и условия подключения
      a: 'По стоимости и условиям подключения школы свяжитесь с нами — через Telegram, email или по телефону. Контакты внизу страницы.',
    },
    {
      id: 'grades',
      q: 'Для каких классов?',
      a: 'Платформа рассчитана на 1–11 классы. Сейчас готово 20+ тем по географии 7 класса — «Средняя Азия — природно-географическая область». Учитель может добавлять и свои уроки и темы.',
    },
    {
      id: 'russian',
      q: 'Есть ли контент для русских классов?',
      a: 'Да. Для узбекских и русских классов контент находится в отдельных разделах.',
    },
    {
      id: 'register',
      q: 'Как ученику зарегистрироваться?',
      a: 'Ученик регистрируется сам — по кнопке «Регистрация». Учитель также может загрузить список учеников класса из файла.',
    },
    {
      id: 'teacher-account',
      q: 'Как получить аккаунт учителя?',
      // TODO: опишите порядок выдачи аккаунта
      a: 'Свяжитесь с нами: коротко расскажите о школе и классах — мы объясним порядок подключения.',
    },
    {
      id: 'mobile',
      q: 'Работает ли на телефоне?',
      a: 'Да. Платформа открывается в браузере — можно пользоваться с телефона, планшета или компьютера.',
    },
    {
      id: 'ai-safety',
      q: 'Безопасен ли ИИ-помощник?',
      a: 'Да. Учитель контролирует переписку учеников с ИИ в разделе «AI Logs» и получает предупреждения, если используются недопустимые слова.',
    },
    {
      id: 'author',
      q: 'Кто создал GeoLearn?',
      a: 'GeoLearn создал ученик школы №279 города Ташкента. Платформа предназначена для уроков и тестов по географии — ею могут пользоваться учителя и ученики любой школы.',
    },
  ],
}

/** Google uchun FAQPage strukturalangan ma'lumoti (JSON-LD) */
export function faqJsonLd(lang) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    inLanguage: lang,
    mainEntity: faq[lang].map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  }
}
