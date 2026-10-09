// O'qituvchilar bo'limidagi noutbuk ekranida ko'rsatiladigan CRM namoyishi uchun demo ma'lumotlar.
// Raqamlar umumiy, matnlar o'zbek va rus tillarida. Bo'limlar tartibi i18n'dagi «teachers.items» bilan bir xil.

export const crmViews = ['dashboard', 'active', 'classes', 'lessons', 'homework', 'games', 'results', 'videos', 'ai', 'logs', 'settings']
export const crmIcons = ['dashboard', 'activity', 'users', 'book', 'clipboard', 'gamepad', 'trophy', 'video', 'bot', 'shield', 'sliders']

const names = {
  uz: [
    'Aziza Karimova',
    'Bekzod Rahimov',
    'Dilnoza Yusupova',
    'Jasur Toshmatov',
    'Malika Nazarova',
    'Sardor Aliyev',
    'Nilufar Qodirova',
    'Otabek Ergashev',
    'Kamola Sobirova',
    'Shahzod Umarov',
  ],
  ru: [
    'Азиза Каримова',
    'Бекзод Рахимов',
    'Дилноза Юсупова',
    'Жасур Тошматов',
    'Малика Назарова',
    'Сардор Алиев',
    'Нилуфар Кодирова',
    'Отабек Эргашев',
    'Камола Собирова',
    'Шахзод Умаров',
  ],
}
const cls = { uz: ['7-A', '7-B', '7-V', '7-G', '8-A', '8-B'], ru: ['7-А', '7-Б', '7-В', '7-Г', '8-А', '8-Б'] }
const avatarHues = [174, 205, 290, 36, 330, 150, 12, 255, 190, 60]

function build(lang) {
  const n = names[lang]
  const c = cls[lang]
  const uz = lang === 'uz'
  const L = (a, b) => (uz ? a : b)
  const person = (i, extra = {}) => ({ name: n[i], initial: n[i][0], hue: avatarHues[i], ...extra })

  return {
    brand: { school: L('12-maktab', 'Школа №12'), role: L("O'qituvchi paneli", 'Панель учителя'), user: 'MA' },
    search: L("O'quvchi, sinf yoki mavzu qidirish", 'Поиск ученика, класса или темы'),
    date: L('Bugun, 8-oktabr — 7-sinf geografiya', 'Сегодня, 8 октября — география, 7 класс'),
    hint: L("Bo'limlarni bosing", 'Нажмите на разделы'),
    subtitles: {
      dashboard: L('Umumiy statistika va faollik', 'Общая статистика и активность'),
      active: L("Real vaqtda kim nima qilyapti", 'Кто чем занят в реальном времени'),
      classes: L("6 ta sinf · 164 o'quvchi", '6 классов · 164 ученика'),
      lessons: L("O'rta Osiyo tabiiy geografik o'lkasi", 'Природный географический край Средней Азии'),
      homework: L('Topshirish, muddat va baholash', 'Сдача, сроки и оценки'),
      games: L('Kahoot uslubidagi viktorina', 'Викторина в стиле Kahoot'),
      results: L("O'quvchilar va sinflar reytingi", 'Рейтинг учеников и классов'),
      videos: L("YouTube darslari va ko'rishlar", 'Уроки YouTube и просмотры'),
      ai: L("Platforma ma'lumotlariga tayanadi", 'Опирается на данные платформы'),
      logs: L("O'quvchilarning AI yozishmalari", 'Переписка учеников с AI'),
      settings: L('Mavzu, til va maktab logotipi', 'Тема, язык и логотип школы'),
    },

    dashboard: {
      stats: [
        { label: L("O'quvchilar", 'Ученики'), value: '164', note: L('+12 bu oy', '+12 в этом месяце'), badge: L('6 sinf', '6 классов'), tone: 'up' },
        { label: L('Hozir onlayn', 'Сейчас онлайн'), value: '23', note: L(`${c[0]} sinfida 11 kishi`, `В ${c[0]} — 11 человек`), badge: L('jonli', 'live'), live: true },
        { label: L("O'rtacha natija", 'Средний результат'), value: '78%', note: L("+4% o'tgan haftaga nisbatan", '+4% к прошлой неделе'), tone: 'up' },
        { label: L('Tekshirilmagan uy ishlari', 'Непроверенные ДЗ'), value: '9', note: L('3 tasi kech topshirilgan', '3 сданы с опозданием'), tone: 'warn' },
      ],
      chartTitle: L('Faollik', 'Активность'),
      legend: [L('Testlar', 'Тесты'), L('Darslar', 'Уроки')],
      periods: [L('Hafta', 'Неделя'), L('Oy', 'Месяц')],
      week: {
        labels: uz ? ['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh', 'Ya'] : ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
        a: [58, 74, 66, 92, 84, 48, 22],
        b: [40, 52, 58, 64, 72, 36, 14],
      },
      month: {
        labels: uz ? ['1-hafta', '2-hafta', '3-hafta', '4-hafta'] : ['1 неделя', '2 неделя', '3 неделя', '4 неделя'],
        a: [62, 78, 71, 94],
        b: [48, 55, 66, 70],
      },
      activeTitle: L("Faol o'quvchilar", 'Активные ученики'),
      activeTag: L('real vaqtda', 'в реальном времени'),
      active: [
        person(0, { cls: c[0], doing: L('Test: Iqlim', 'Тест: Климат') }),
        person(1, { cls: c[0], doing: L("Jonli o'yin", 'Живая игра') }),
        person(2, { cls: c[1], doing: L('Dars: Havo massalari', 'Урок: Воздушные массы') }),
        person(3, { cls: c[2], doing: L('AI yordamchi', 'AI-помощник') }),
        person(4, { cls: c[0], doing: L('Videodars', 'Видеоурок') }),
      ],
      hwTitle: L('Uy ishlari', 'Домашние задания'),
      hwTag: L('muddati yaqin', 'скоро срок'),
      hw: [
        { title: L(`Havo massalari — ${c[0]}`, `Воздушные массы — ${c[0]}`), badge: L('ertaga', 'завтра'), tone: 'warn' },
        { title: L(`Topografik xarita — ${c[1]}`, `Топографическая карта — ${c[1]}`), badge: L('3 kun', '3 дня'), tone: 'info' },
        { title: L(`O'rta Osiyo suvlari — ${c[2]}`, `Воды Средней Азии — ${c[2]}`), badge: L('baholandi', 'оценено'), tone: 'ok' },
      ],
    },

    active: {
      title: L('Hozir onlayn', 'Сейчас онлайн'),
      all: L('Hammasi', 'Все'),
      filters: [c[0], c[1], c[2]],
      online: L('daq', 'мин'),
      rows: [
        person(0, { cls: c[0], doing: L('Test: Iqlim', 'Тест: Климат'), progress: 60, detail: '6/10', min: 14 }),
        person(1, { cls: c[0], doing: L("Jonli o'yin: Daryolar", 'Живая игра: Реки'), progress: 80, detail: '12/15', min: 9 }),
        person(2, { cls: c[1], doing: L('Dars: Havo massalari', 'Урок: Воздушные массы'), progress: 45, detail: '45%', min: 21 }),
        person(3, { cls: c[2], doing: L('AI yordamchi bilan suhbat', 'Чат с AI-помощником'), progress: 30, detail: L('4 savol', '4 вопроса'), min: 6 }),
        person(4, { cls: c[0], doing: L('Videodars: Tyan-Shan', 'Видеоурок: Тянь-Шань'), progress: 72, detail: '8:40', min: 17 }),
        person(5, { cls: c[1], doing: L('Uy ishi: Topografik xarita', 'ДЗ: Топографическая карта'), progress: 90, detail: '90%', min: 32 }),
        person(6, { cls: c[2], doing: L('Test: Relyef', 'Тест: Рельеф'), progress: 20, detail: '2/10', min: 3 }),
        person(7, { cls: c[1], doing: L("Dars: Orol dengizi", 'Урок: Аральское море'), progress: 55, detail: '55%', min: 12 }),
      ],
    },

    classes: {
      add: L('+ Yangi sinf', '+ Новый класс'),
      upload: L('Fayldan yuklash', 'Загрузить из файла'),
      students: L("o'quvchi", 'учеников'),
      avg: L("o'rtacha", 'средний'),
      topic: L('Faol mavzu', 'Активная тема'),
      listTitle: L("Sinf o'quvchilari", 'Ученики класса'),
      items: [
        { name: c[0], count: 28, avg: 84, topic: L('Havo massalari', 'Воздушные массы'), top: [0, 1, 4, 9] },
        { name: c[1], count: 27, avg: 79, topic: L('Topografik xaritalar', 'Топографические карты'), top: [2, 5, 7, 8] },
        { name: c[2], count: 30, avg: 72, topic: L('Iqlim', 'Климат'), top: [3, 6, 0, 2] },
        { name: c[3], count: 26, avg: 76, topic: L('Soat mintaqalari', 'Часовые пояса'), top: [8, 9, 1, 5] },
        { name: c[4], count: 29, avg: 81, topic: L('Geologik tuzilish', 'Геологическое строение'), top: [4, 7, 3, 6] },
        { name: c[5], count: 24, avg: 74, topic: L('Foydali qazilmalar', 'Полезные ископаемые'), top: [5, 0, 2, 9] },
      ].map((item, i) => ({ ...item, students: item.top.map((p, k) => person(p, { score: 96 - k * 5 - i })) })),
    },

    lessons: {
      unit: L("7-sinf · O'rta Osiyo tabiiy geografik o'lkasi", '7 класс · Природный край Средней Азии'),
      published: L('Nashr qilingan', 'Опубликовано'),
      draft: L('Qoralama', 'Черновик'),
      fromPdf: L("PDF'dan ajratildi", 'Извлечено из PDF'),
      questions: L('savol', 'вопросов'),
      statLabels: [L('Savollar', 'Вопросы'), L("O'rtacha", 'Средний'), L("Ko'rildi", 'Просмотры')],
      sample: L('Namuna savol', 'Пример вопроса'),
      topics: [
        {
          title: L("Geografik o'rni va chegaralari", 'Географическое положение и границы'),
          status: 'published',
          q: 12,
          avg: 84,
          views: 158,
          question: L("O'rta Osiyo qaysi okeanga chiqmaydi?", 'К какому океану нет выхода у Средней Азии?'),
          options: uz ? ['Hech qaysi okeanga', 'Hind okeani', 'Shimoliy Muz okeani', 'Tinch okeani'] : ['Ни к какому', 'Индийский', 'Северный Ледовитый', 'Тихий'],
          correct: 0,
        },
        {
          title: L('Relyef va foydali qazilmalar', 'Рельеф и полезные ископаемые'),
          status: 'published',
          q: 15,
          avg: 77,
          views: 149,
          question: L("O'rta Osiyodagi eng baland cho'qqi qaysi?", 'Какая вершина самая высокая в Средней Азии?'),
          options: uz ? ['Xon-Tengri', 'Ismoil Somoniy', 'Lenin cho\'qqisi', 'Hazrati Sulton'] : ['Хан-Тенгри', 'Исмаил Сомони', 'Пик Ленина', 'Хазрати Султан'],
          correct: 1,
        },
        {
          title: L('Iqlimi', 'Климат'),
          status: 'published',
          q: 10,
          avg: 64,
          views: 131,
          question: L("O'rta Osiyo iqlimi qanday?", 'Какой климат в Средней Азии?'),
          options: uz ? ['Keskin kontinental', "Mo''tadil dengiz", 'Musson', 'Ekvatorial'] : ['Резко континентальный', 'Умеренный морской', 'Муссонный', 'Экваториальный'],
          correct: 0,
        },
        {
          title: L('Ichki suvlari: Amudaryo va Sirdaryo', 'Внутренние воды: Амударья и Сырдарья'),
          status: 'published',
          q: 14,
          avg: 81,
          views: 126,
          question: L('Amudaryo qayerga quyiladi?', 'Куда впадает Амударья?'),
          options: uz ? ['Orol dengiziga', 'Kaspiy dengiziga', "Issiqko'lga", "Balxash ko'liga"] : ['В Аральское море', 'В Каспийское море', 'В Иссык-Куль', 'В Балхаш'],
          correct: 0,
        },
        {
          title: L("Orol dengizi muammosi", 'Проблема Аральского моря'),
          status: 'published',
          q: 8,
          avg: 88,
          views: 117,
          question: L('Orol dengizi qurishining asosiy sababi?', 'Главная причина высыхания Арала?'),
          options: uz ? ["Sug'orish uchun suv olinishi", 'Zilzilalar', "Yog'ingarchilik ko'pligi", 'Muzliklar ortishi'] : ['Забор воды на орошение', 'Землетрясения', 'Избыток осадков', 'Рост ледников'],
          correct: 0,
        },
        {
          title: L("Tabiat zonalari: cho'llar", 'Природные зоны: пустыни'),
          status: 'draft',
          q: 11,
          avg: 0,
          views: 0,
          question: L("Qizilqum qaysi daryolar oralig'ida joylashgan?", 'Между какими реками расположен Кызылкум?'),
          options: uz ? ['Amudaryo va Sirdaryo', 'Zarafshon va Qashqadaryo', 'Chu va Ili', 'Murgʻob va Tajan'] : ['Амударья и Сырдарья', 'Зарафшан и Кашкадарья', 'Чу и Или', 'Мургаб и Теджен'],
          correct: 0,
        },
        {
          title: L("Tog'lar: Tyan-Shan va Pomir", 'Горы: Тянь-Шань и Памир'),
          status: 'draft',
          q: 9,
          avg: 0,
          views: 0,
          question: L('"Dunyo tomi" deb qaysi tog\'lar ataladi?', 'Какие горы называют «крышей мира»?'),
          options: uz ? ['Pomir', 'Kopetdog\'', 'Hisor', 'Turkiston'] : ['Памир', 'Копетдаг', 'Гиссар', 'Туркестанский хребет'],
          correct: 0,
        },
      ],
    },

    homework: {
      cols: [L('Vazifa', 'Задание'), L('Sinf', 'Класс'), L('Muddat', 'Срок'), L('Topshirildi', 'Сдали'), L('Holat', 'Статус')],
      rows: [
        { title: L('Havo massalari', 'Воздушные массы'), cls: c[0], due: L('9-okt', '9 окт'), done: 24, total: 28, late: 2, status: L('Jarayonda', 'В процессе'), tone: 'info' },
        { title: L('Topografik xarita', 'Топографическая карта'), cls: c[1], due: L('11-okt', '11 окт'), done: 15, total: 27, late: 0, status: L('Jarayonda', 'В процессе'), tone: 'info' },
        { title: L("O'rta Osiyo suvlari", 'Воды Средней Азии'), cls: c[2], due: L('5-okt', '5 окт'), done: 30, total: 30, late: 3, status: L('Baholandi', 'Оценено'), tone: 'ok' },
        { title: L('Iqlim xaritasi', 'Климатическая карта'), cls: c[4], due: L('7-okt', '7 окт'), done: 27, total: 29, late: 1, status: L('Tekshirish kerak', 'Нужно проверить'), tone: 'warn' },
        { title: L('Soat mintaqalari', 'Часовые пояса'), cls: c[3], due: L('14-okt', '14 окт'), done: 6, total: 26, late: 0, status: L('Yangi', 'Новое'), tone: 'muted' },
        { title: L('Foydali qazilmalar', 'Полезные ископаемые'), cls: c[5], due: L('3-okt', '3 окт'), done: 24, total: 24, late: 4, status: L('Baholandi', 'Оценено'), tone: 'ok' },
      ],
      late: L('kech', 'поздно'),
      reviewTitle: L('Tekshirish', 'Проверка'),
      reviewStudent: person(5, { cls: c[4] }),
      reviewTask: L('Iqlim xaritasi', 'Климатическая карта'),
      reviewLate: L('1 kun kech topshirildi', 'Сдано с опозданием на 1 день'),
      scoreLabel: L('Ball', 'Балл'),
      comment: L("Yaxshi! Yanvar izotermalarini aniqroq belgilang.", 'Хорошо! Отметьте январские изотермы точнее.'),
      save: L('Saqlash', 'Сохранить'),
      saved: L('Saqlandi', 'Сохранено'),
    },

    games: {
      code: L("O'yin kodi", 'Код игры'),
      joining: L("O'quvchilar qo'shilmoqda", 'Ученики подключаются'),
      settings: [
        { label: L('Mavzu', 'Тема'), value: L('Daryolar va ko\'llar', 'Реки и озёра') },
        { label: L('Savollar', 'Вопросы'), value: '15' },
        { label: L('Vaqt', 'Время'), value: L('20 soniya', '20 секунд') },
      ],
      start: L("O'yinni boshlash", 'Начать игру'),
      again: L('Yangi o\'yin', 'Новая игра'),
      finished: L("O'yin yakunlandi", 'Игра завершена'),
      points: L('ball', 'очков'),
      players: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => person(i)),
      podium: [
        person(1, { score: 1240 }),
        person(0, { score: 1385 }),
        person(4, { score: 1105 }),
      ],
      rest: [person(3, { score: 980 }), person(7, { score: 920 }), person(2, { score: 870 })],
    },

    results: {
      tabs: [L("O'quvchilar", 'Ученики'), L('Sinflar', 'Классы')],
      pts: L('ball', 'баллов'),
      students: [
        person(0, { cls: c[0], score: 98, trend: '+3' }),
        person(4, { cls: c[0], score: 95, trend: '+1' }),
        person(2, { cls: c[1], score: 93, trend: '+5' }),
        person(1, { cls: c[0], score: 91, trend: '-1' }),
        person(9, { cls: c[3], score: 89, trend: '+2' }),
        person(7, { cls: c[4], score: 87, trend: '+4' }),
      ],
      classes: [
        { name: c[0], avg: 84 },
        { name: c[4], avg: 81 },
        { name: c[1], avg: 79 },
        { name: c[3], avg: 76 },
        { name: c[5], avg: 74 },
        { name: c[2], avg: 72 },
      ],
    },

    videos: {
      add: L('YouTube havolasini qo\'ying…', 'Вставьте ссылку YouTube…'),
      addBtn: L("Qo'shish", 'Добавить'),
      watched: L("ko'rdi", 'посмотрели'),
      items: [
        { title: L("Tyan-Shan tog'lari", 'Горы Тянь-Шань'), dur: '12:40', seen: 142, hue: 200 },
        { title: L('Orol dengizi fojiasi', 'Трагедия Аральского моря'), dur: '9:15', seen: 128, hue: 174 },
        { title: L('Havo massalari qanday harakatlanadi', 'Как движутся воздушные массы'), dur: '7:52', seen: 96, hue: 36 },
        { title: L('Amudaryo: manbadan Orolgacha', 'Амударья: от истока до Арала'), dur: '14:05', seen: 77, hue: 255 },
        { title: L("Qizilqum va Qoraqum cho'llari", 'Пустыни Кызылкум и Каракум'), dur: '10:22', seen: 64, hue: 28 },
        { title: L("Farg'ona vodiysi", 'Ферганская долина'), dur: '8:47', seen: 58, hue: 140 },
        { title: L('Soat mintaqalari qanday ishlaydi', 'Как работают часовые пояса'), dur: '6:30', seen: 41, hue: 300 },
        { title: L("Pomir: dunyo tomi", 'Памир: крыша мира'), dur: '11:58', seen: 23, hue: 220 },
      ],
    },

    ai: {
      caps: [L('Rasm tahlili', 'Анализ фото'), L('Rasm yaratish', 'Создание картинок'), L('Ovozli javob', 'Голосовой ответ'), L('Fayl qabul qiladi', 'Принимает файлы')],
      placeholder: L('Savol yozing…', 'Напишите вопрос…'),
      suggestions: L('Tavsiya etilgan savollar', 'Подсказки'),
      chats: [
        {
          q: L(`${c[1]} sinfida qaysi mavzu eng qiyin bo'ldi?`, `Какая тема далась ${c[1]} труднее всего?`),
          a: L(
            `«Iqlimi» mavzusi — o'rtacha natija 64%. Eng ko'p xato 3- va 7-savollarda. 9 nafar o'quvchiga takrorlash testini yuborishni tavsiya qilaman.`,
            `Тема «Климат» — средний результат 64%. Больше всего ошибок в 3-м и 7-м вопросах. Рекомендую отправить повторный тест 9 ученикам.`,
          ),
        },
        {
          q: L("Orol dengizi bo'yicha 5 ta test savoli tuzib ber", 'Составь 5 тестовых вопросов по Аральскому морю'),
          a: L(
            `Tayyor: 5 ta savol, har birida 4 ta variant. «Orol dengizi muammosi» mavzusiga qoralama sifatida qo'shdim — tekshirib, nashr qilishingiz mumkin.`,
            `Готово: 5 вопросов по 4 варианта. Добавил черновиком в тему «Проблема Аральского моря» — можно проверить и опубликовать.`,
          ),
        },
        {
          q: L('Bu haftada kim uy ishini topshirmadi?', 'Кто не сдал ДЗ на этой неделе?'),
          a: L(
            `${c[1]}: 12 nafar o'quvchi «Topografik xarita» vazifasini hali topshirmagan, muddat 11-oktabr. Ularga eslatma yuboraymi?`,
            `${c[1]}: 12 учеников ещё не сдали «Топографическую карту», срок — 11 октября. Отправить им напоминание?`,
          ),
        },
      ],
    },

    logs: {
      all: L('Hammasi', 'Все'),
      flagged: L('Ogohlantirishlar', 'Предупреждения'),
      ok: L('Normal', 'Норма'),
      warn: L('Ogohlantirish', 'Предупреждение'),
      rows: [
        person(3, { cls: c[2], time: '10:42', text: L('Pomir tog\'lari qanday paydo bo\'lgan?', 'Как образовались горы Памира?'), answer: L("Pomir Hind va Yevroosiyo plitalari to'qnashuvi natijasida…", 'Памир образовался в результате столкновения Индийской и Евразийской плит…'), flag: false }),
        person(7, { cls: c[1], time: '10:31', text: L('Uy ishini men uchun yozib ber', 'Сделай за меня домашку'), answer: L("Men vazifani bajarib bermayman, lekin rejani birga tuzamiz: 1) …", 'Я не буду делать задание за тебя, но давай составим план: 1) …'), flag: true }),
        person(0, { cls: c[0], time: '10:18', text: L('Havo massasi nima?', 'Что такое воздушная масса?'), answer: L("Havo massasi — bir xil xususiyatli katta havo hajmi…", 'Воздушная масса — большой объём воздуха с однородными свойствами…'), flag: false }),
        person(9, { cls: c[3], time: '09:56', text: L('*** (nojo\'ya so\'z aniqlandi)', '*** (обнаружено недопустимое слово)'), answer: L("Iltimos, hurmat bilan yozing. Geografiya bo'yicha savolingiz bormi?", 'Пожалуйста, пиши уважительно. Есть вопрос по географии?'), flag: true }),
        person(5, { cls: c[4], time: '09:51', text: L('Orol dengizini qayta tiklash mumkinmi?', 'Можно ли восстановить Аральское море?'), answer: L("Shimoliy Orol Ko'karal to'g'oni tufayli qisman tiklandi…", 'Северный Арал частично восстановлен благодаря Кокаральской плотине…'), flag: false }),
        person(8, { cls: c[3], time: '09:47', text: L('Toshkentda soat necha, Londonda-chi?', 'Который час в Ташкенте и в Лондоне?'), answer: L("Toshkent UTC+5, London UTC+0 (yozda +1) — farq 4–5 soat.", 'Ташкент UTC+5, Лондон UTC+0 (летом +1) — разница 4–5 часов.'), flag: false }),
        person(2, { cls: c[1], time: '09:40', text: L('Amudaryoning uzunligi qancha?', 'Какова длина Амударьи?'), answer: L('Amudaryoning uzunligi taxminan 1415 km (Panj bilan 2540 km).', 'Длина Амударьи около 1415 км (с Пянджем — 2540 км).'), flag: false }),
      ],
    },

    settings: {
      theme: L('Mavzu', 'Тема'),
      themes: [L("Qorong'i", 'Тёмная'), L("Yorug'", 'Светлая')],
      language: L('Til', 'Язык'),
      languages: ["O'zbekcha", 'Русский'],
      logo: L('Maktab logotipi', 'Логотип школы'),
      logoHint: L('PNG yoki SVG, 512×512 gacha', 'PNG или SVG, до 512×512'),
      change: L('Almashtirish', 'Заменить'),
      notifications: L('Bildirishnomalar', 'Уведомления'),
      toggles: [
        L('Uy ishi topshirilganda', 'Когда сдано ДЗ'),
        L('AI ogohlantirishlari', 'Предупреждения AI'),
        L('Haftalik hisobot (email)', 'Еженедельный отчёт (email)'),
      ],
    },
  }
}

export const crmData = { uz: build('uz'), ru: build('ru') }
