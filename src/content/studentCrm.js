// O'quvchilar bo'limidagi planshet ekranida ko'rsatiladigan o'quvchi portali namoyishi uchun demo ma'lumotlar.
// Bo'limlar tartibi i18n'dagi «students.items» bilan bir xil.

export const studentViews = ['dashboard', 'strengths', 'lessons', 'homework', 'games', 'rating', 'videos', 'ai']
export const studentIcons = ['dashboard', 'chart', 'book', 'clipboard', 'gamepad', 'trophy', 'video', 'bot']

function build(lang) {
  const uz = lang === 'uz'
  const L = (a, b) => (uz ? a : b)

  return {
    hint: L("Bo'limlarni bosing — planshetda ochiladi", 'Нажмите на раздел — он откроется на планшете'),
    nav: [
      L('Dashboard', 'Дашборд'),
      L('Tahlil', 'Анализ'),
      L('Darslar', 'Уроки'),
      L('Uy ishlari', 'ДЗ'),
      L("O'yinlar", 'Игры'),
      L('Reyting', 'Рейтинг'),
      L('Video', 'Видео'),
      'AI',
    ],
    user: { initial: L('A', 'А'), points: '2 480' },

    dashboard: {
      hello: L('Salom, Aziza!', 'Привет, Азиза!'),
      sub: L('7-A sinf · Bugun 2 ta yangi topshiriq bor', '7-А класс · Сегодня 2 новых задания'),
      rank: { label: L("Reytingdagi o'rningiz", 'Ваше место в рейтинге'), value: L("3-o'rin", '3-е место'), note: L("sinfda 28 o'quvchi orasida", 'среди 28 учеников класса') },
      stats: [
        { label: L('Ballar', 'Баллы'), value: '2 480', note: L('+320 shu hafta', '+320 за неделю') },
        { label: L("O'rtacha natija", 'Средний результат'), value: '86%', note: L("sinf o'rtachasi 78%", 'в среднем по классу 78%') },
        { label: L('Ishlangan testlar', 'Пройдено тестов'), value: '34', note: L("20+ mavzu bo'yicha", 'по 20+ темам'), plain: true },
      ],
      chartTitle: L('Oxirgi 14 kunlik faollik', 'Активность за 14 дней'),
      chartNote: L('testlar soni', 'кол-во тестов'),
      bars: [2, 3, 1, 4, 0, 3, 5, 2, 4, 6, 3, 5, 4, 7],
      periods: [L('14 kun', '14 дней'), L('7 kun', '7 дней')],
      nextTitle: L('Bugungi vazifalar', 'Задания на сегодня'),
      next: [
        { title: L('Topografik xarita', 'Топографическая карта'), tag: L('Uy ishi', 'ДЗ'), view: 'homework' },
        { title: L("Tog' iqlimi — test", 'Горный климат — тест'), tag: L('Dars', 'Урок'), view: 'lessons' },
      ],
    },

    strengths: {
      strongTitle: L('Kuchli tomonlar', 'Сильные стороны'),
      weakTitle: L('Takrorlash kerak', 'Нужно повторить'),
      strong: [
        { name: L('Iqlim', 'Климат'), me: 94, cls: 76 },
        { name: L('Soat mintaqalari', 'Часовые пояса'), me: 91, cls: 72 },
        { name: L("Geografik o'rni", 'Географическое положение'), me: 89, cls: 80 },
      ],
      weak: [
        { name: L('Havo massalari', 'Воздушные массы'), me: 58, cls: 71 },
        { name: L('Siklon va antisiklonlar', 'Циклоны и антициклоны'), me: 62, cls: 69 },
      ],
      legend: [L('Siz', 'Вы'), L("Sinf o'rtachasi", 'Среднее по классу')],
      repeat: L('Takrorlash', 'Повторить'),
      compareTitle: L("Sinf o'rtachasi bilan taqqoslash", 'Сравнение со средним по классу'),
      compare: [
        { label: L('Siz', 'Вы'), value: 86 },
        { label: L("Sinf o'rtachasi", 'Среднее по классу'), value: 78 },
      ],
    },

    lessons: {
      unit: L("O'rta Osiyo tabiiy geografik o'lkasi", 'Природный географический край Средней Азии'),
      topics: [
        {
          title: L("Geografik o'rni va chegaralari", 'Географическое положение и границы'),
          progress: 100,
          text: L(
            "O'rta Osiyo Yevrosiyo materigining ichki qismida, okeanlardan uzoqda joylashgan. G'arbda Kaspiy dengizi, sharqda Tyan-Shan va Pomir tog'lari bilan chegaralanadi.",
            'Средняя Азия расположена во внутренней части Евразии, вдали от океанов. На западе её ограничивает Каспийское море, на востоке — горы Тянь-Шань и Памир.',
          ),
        },
        {
          title: L('Relyefi va foydali qazilmalari', 'Рельеф и полезные ископаемые'),
          progress: 100,
          text: L(
            "Hududning g'arbi — Turon pasttekisligi, sharqi — baland tog'lar. Neft, gaz, oltin va mis konlari bilan boy.",
            'Запад территории — Туранская низменность, восток — высокие горы. Край богат нефтью, газом, золотом и медью.',
          ),
        },
        {
          title: L('Iqlimi', 'Климат'),
          progress: 70,
          text: L(
            "Iqlimi keskin kontinental: yozi issiq va quruq, qishi sovuq. Yog'in asosan tog'larda yog'adi.",
            'Климат резко континентальный: лето жаркое и сухое, зима холодная. Осадки выпадают в основном в горах.',
          ),
        },
        {
          title: L('Ichki suvlari', 'Внутренние воды'),
          progress: 30,
          text: L(
            "Eng yirik daryolari — Amudaryo va Sirdaryo. Ular tog' muzliklaridan boshlanib, Orol dengizi havzasiga oqadi.",
            'Крупнейшие реки — Амударья и Сырдарья. Они берут начало в горных ледниках и текут в бассейн Аральского моря.',
          ),
        },
        {
          title: L('Tabiat zonalari', 'Природные зоны'),
          progress: 0,
          text: L(
            "Tekisliklarda cho'l va chala cho'l, tog'larda balandlik mintaqalari almashinadi.",
            'На равнинах — пустыни и полупустыни, в горах сменяются высотные пояса.',
          ),
        },
      ],
      read: L("O'qildi", 'Прочитано'),
      start: L('Testni boshlash', 'Начать тест'),
      question: L("O'rta Osiyoning eng uzun daryosi qaysi?", 'Какая река Средней Азии самая длинная?'),
      answers: [L('Zarafshon', 'Зарафшан'), L('Sirdaryo', 'Сырдарья'), L('Amudaryo', 'Амударья'), L('Chirchiq', 'Чирчик')],
      correct: 1,
      right: L("To'g'ri! +20 ball", 'Верно! +20 баллов'),
      wrong: L("Noto'g'ri — to'g'ri javob: Sirdaryo", 'Неверно — правильный ответ: Сырдарья'),
      back: L('Mavzuga qaytish', 'Вернуться к теме'),
    },

    homework: {
      title: L('Uy ishlari', 'Домашние задания'),
      statuses: [L('Yangi', 'Новое'), L('Topshirildi', 'Сдано'), L('Baholandi', 'Оценено')],
      submit: L('Topshirish', 'Сдать'),
      waiting: L('Tekshirilmoqda', 'На проверке'),
      items: [
        { title: L('Topografik xarita', 'Топографическая карта'), due: L('Muddat: 10-oktabr', 'Срок: 10 октября'), status: 0 },
        { title: L('Amudaryo havzasi xaritasi', 'Карта бассейна Амударьи'), due: L('Muddat: 12-oktabr', 'Срок: 12 октября'), status: 0 },
        { title: L("O'rta Osiyo suvlari", 'Воды Средней Азии'), due: L('Topshirildi: 6-oktabr', 'Сдано: 6 октября'), status: 1 },
        { title: L("Tog' iqlimi", 'Горный климат'), due: L('Baho: 92 / 100', 'Оценка: 92 / 100'), status: 2 },
        { title: L('Soat mintaqalari', 'Часовые пояса'), due: L('Baho: 88 / 100', 'Оценка: 88 / 100'), status: 2 },
      ],
    },

    games: {
      title: L("Jonli o'yinga qo'shilish", 'Присоединиться к игре'),
      text: L("O'qituvchi doskada ko'rsatgan 6 xonali kodni kiriting", 'Введите 6-значный код, который учитель показал на доске'),
      code: '482913',
      type: L('Kodni kiritish', 'Ввести код'),
      join: L("Qo'shilish", 'Войти'),
      joined: L("Siz o'yindasiz!", 'Вы в игре!'),
      wait: L("O'qituvchi o'yinni boshlashini kuting…", 'Ждём, пока учитель начнёт игру…'),
      players: L("o'yinchi qo'shildi", 'игроков подключилось'),
      leave: L('Chiqish', 'Выйти'),
      topic: L("Mavzu: Daryolar va ko'llar · 15 savol", 'Тема: Реки и озёра · 15 вопросов'),
    },

    rating: {
      tabs: [L('Sinf', 'Класс'), L('Maktab', 'Школа')],
      you: L('Siz', 'Вы'),
      pts: L('ball', 'баллов'),
      lists: [
        [
          { name: L('Bekzod Rahimov', 'Бекзод Рахимов'), score: 2710, hue: 205 },
          { name: L('Malika Nazarova', 'Малика Назарова'), score: 2595, hue: 330 },
          { name: L('Aziza Karimova', 'Азиза Каримова'), score: 2480, hue: 174, me: true },
          { name: L('Jasur Toshmatov', 'Жасур Тошматов'), score: 2340, hue: 36 },
          { name: L('Dilnoza Yusupova', 'Дилноза Юсупова'), score: 2205, hue: 290 },
          { name: L('Sardor Aliyev', 'Сардор Алиев'), score: 2090, hue: 150 },
        ],
        [
          { name: L('Otabek Ergashev · 8-A', 'Отабек Эргашев · 8-А'), score: 3120, hue: 255 },
          { name: L('Kamola Sobirova · 8-B', 'Камола Собирова · 8-Б'), score: 2980, hue: 190 },
          { name: L('Bekzod Rahimov · 7-A', 'Бекзод Рахимов · 7-А'), score: 2710, hue: 205 },
          { name: L('Malika Nazarova · 7-A', 'Малика Назарова · 7-А'), score: 2595, hue: 330 },
          { name: L('Shahzod Umarov · 7-B', 'Шахзод Умаров · 7-Б'), score: 2540, hue: 60 },
          { name: L('Aziza Karimova · 7-A', 'Азиза Каримова · 7-А'), score: 2480, hue: 174, me: true, place: 9 },
        ],
      ],
    },

    videos: {
      title: L('Videodarslar', 'Видеоуроки'),
      watch: L("Ko'rilmoqda…", 'Идёт просмотр…'),
      watched: L("Ko'rildi", 'Просмотрено'),
      items: [
        { title: L('Amudaryo va Sirdaryo', 'Амударья и Сырдарья'), time: '8:24', hue: 198, done: true },
        { title: L('Tyan-Shan va Pomir', 'Тянь-Шань и Памир'), time: '11:05', hue: 262, done: false },
        { title: L("Qizilqum cho'li", 'Пустыня Кызылкум'), time: '6:40', hue: 32, done: false },
        { title: L('Orol dengizi muammosi', 'Проблема Аральского моря'), time: '9:12', hue: 174, done: false },
      ],
    },

    ai: {
      title: L('AI yordamchi', 'AI-помощник'),
      online: L('24/7 onlayn', 'онлайн 24/7'),
      hello: L("Salom! Geografiya bo'yicha istalgan savolingizni bering.", 'Привет! Задайте любой вопрос по географии.'),
      placeholder: L('Savolingizni yozing…', 'Напишите вопрос…'),
      chats: [
        {
          q: L('Orol dengizi nega qurib qoldi?', 'Почему высохло Аральское море?'),
          a: L(
            "Amudaryo va Sirdaryo suvlari paxta dalalarini sug'orishga olingani uchun dengizga suv deyarli yetib bormay qoldi. 1960 yildan beri maydoni taxminan 10 baravar kichraydi.",
            'Воду Амударьи и Сырдарьи стали забирать на орошение хлопковых полей, и до моря она почти перестала доходить. С 1960 года его площадь уменьшилась примерно в 10 раз.',
          ),
        },
        {
          q: L('Kontinental iqlim nima?', 'Что такое континентальный климат?'),
          a: L(
            "Bu okeanlardan uzoq hududlar iqlimi: yozi issiq, qishi sovuq, yog'in kam. O'rta Osiyo iqlimi — keskin kontinental.",
            'Это климат территорий, удалённых от океанов: жаркое лето, холодная зима и мало осадков. В Средней Азии климат резко континентальный.',
          ),
        },
        {
          q: L("Testga qanday tayyorlanay?", 'Как подготовиться к тесту?'),
          a: L(
            "Avval «Havo massalari» mavzusini takrorlang — u yerda natijangiz 58%. Keyin 10 savollik mashq testini ishlab ko'ring.",
            'Сначала повторите тему «Воздушные массы» — там ваш результат 58%. Затем пройдите тренировочный тест из 10 вопросов.',
          ),
        },
      ],
    },
  }
}

export const studentData = { uz: build('uz'), ru: build('ru') }
