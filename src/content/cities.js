// «O'rta Osiyoga sho'ng'ish» xaritasidagi shaharlar va suv obyektlari: bosilganda ochiladigan GEOGRAFIK ma'lumot
// (relyef, daryolar, iqlim) va 3D galereya (tabiat manzaralari).
// Rasmlar: /public/cities/<shahar>/<n>.webp — Wikimedia Commons'dan, erkin litsenziyalar ostida
// (muallif va litsenziya cityPhotos.json'da; galereyada har rasm ostida ko'rsatiladi).
// Iqlim ko'rsatkichlari — ko'p yillik o'rtacha, taxminiy qiymatlar.

import photos from './cityPhotos.json'
import { landformKeys, landforms } from './landforms'
import { countries, moreWaters } from './places'

const raw = {
  tashkent: {
    elevation: 455,
    jan: 2,
    jul: 28,
    rain: 440,
    uz: {
      name: 'Toshkent',
      country: "O'zbekiston",
      text: "Chirchiq daryosi vodiysida, G'arbiy Tyan-Shanning Chotqol va Qurama tizmalari etagida joylashgan. Tog' oldi tekisligi — sug'oriladigan unumdor yerlar.",
      facts: [
        "Chirchiq daryosi — Sirdaryoning o'ng irmog'i, Chorvoq suv omboridan boshlanadi",
        "Shahardan 80 km sharqda Katta Chimyon cho'qqisi (3309 m) ko'tariladi",
        "Seysmik faol hudud: tog' burmalanishi hali davom etmoqda",
      ],
      captions: ['Chirchiq daryosi', 'Chorvoq suv ombori', 'Katta Chimyon tog\'i', 'Ugom-Chotqol qo\'riqxonasi qishda', 'Toypan dovoni'],
    },
    ru: {
      name: 'Ташкент',
      country: 'Узбекистан',
      text: 'Расположен в долине реки Чирчик у подножия Чаткальского и Кураминского хребтов Западного Тянь-Шаня. Предгорная равнина — плодородные орошаемые земли.',
      facts: [
        'Чирчик — правый приток Сырдарьи, берёт начало из Чарвакского водохранилища',
        'В 80 км к востоку возвышается вершина Большой Чимган (3309 м)',
        'Сейсмически активный район: горообразование продолжается',
      ],
      captions: ['Река Чирчик', 'Чарвакское водохранилище', 'Гора Большой Чимган', 'Угам-Чаткальский заповедник зимой', 'Перевал Тойпан'],
    },
  },
  samarkand: {
    elevation: 700,
    jan: 1,
    jul: 26,
    rain: 360,
    uz: {
      name: 'Samarqand',
      country: "O'zbekiston",
      text: "Zarafshon daryosi vodiysida, Zarafshon va Turkiston tizmalari orasidagi keng botiqda joylashgan. Janubida Zarafshon tizmasining tog'lari ko'tariladi.",
      facts: [
        "Zarafshon daryosi Tojikistondagi Zarafshon muzligidan boshlanadi",
        "Daryo suvi vodiydagi vohalarni sug'oradi, lekin Amudaryoga yetib bormaydi",
        "Iqlimi kontinental: yozi issiq va quruq, qishi salqin",
      ],
      captions: ['Zarafshon daryosi', "Zarafshon tizmasi etaklari", "Omonqo'ton vodiysidagi o'rmon", "Zarafshon tizmasining janubiy yonbag'irlari", "Samarqand atrofidagi adirlar"],
    },
    ru: {
      name: 'Самарканд',
      country: 'Узбекистан',
      text: 'Расположен в долине Зарафшана, в широкой котловине между Зарафшанским и Туркестанским хребтами. С юга поднимаются горы Зарафшанского хребта.',
      facts: [
        'Река Зарафшан берёт начало из Зарафшанского ледника в Таджикистане',
        'Воды реки орошают оазисы долины и не доходят до Амударьи',
        'Климат континентальный: лето жаркое и сухое, зима прохладная',
      ],
      captions: ['Река Зарафшан', 'Предгорья Зарафшанского хребта', 'Лес в долине Аманкутан', 'Южные склоны Зарафшанского хребта', 'Холмы вокруг Самарканда'],
    },
  },
  bukhara: {
    elevation: 225,
    jan: 1,
    jul: 29,
    rain: 135,
    uz: {
      name: 'Buxoro',
      country: "O'zbekiston",
      text: "Zarafshon daryosining quyi oqimidagi vohada, Qizilqum cho'lining janubi-g'arbiy chekkasida joylashgan. Atrofi tekis, qumli va sho'rxok yerlar.",
      facts: [
        "Qizilqum — Amudaryo va Sirdaryo oralig'idagi ulkan qumli cho'l",
        "Yillik yog'in atigi ~135 mm — suv Amu-Buxoro kanali orqali Amudaryodan keladi",
        "Shimolida Aydarko'l — cho'l o'rtasida paydo bo'lgan katta ko'l",
      ],
      captions: ["Qizilqumda tun", 'Qizilqum barxanlari', "Qizilqumning o'simlikli qumlari", "Aydarko'l", "Qizilqum cho'li"],
    },
    ru: {
      name: 'Бухара',
      country: 'Узбекистан',
      text: 'Расположена в оазисе нижнего течения Зарафшана на юго-западной окраине пустыни Кызылкум. Вокруг — плоские песчаные и солончаковые земли.',
      facts: [
        'Кызылкум — огромная песчаная пустыня между Амударьёй и Сырдарьёй',
        'Осадков всего ~135 мм в год — вода поступает из Амударьи по Аму-Бухарскому каналу',
        'К северу — Айдаркуль, крупное озеро посреди пустыни',
      ],
      captions: ['Ночь в Кызылкуме', 'Барханы Кызылкума', 'Закреплённые пески Кызылкума', 'Озеро Айдаркуль', 'Пустыня Кызылкум'],
    },
  },
  khiva: {
    elevation: 100,
    jan: -3,
    jul: 28,
    rain: 90,
    uz: {
      name: 'Xiva',
      country: "O'zbekiston, Xorazm",
      text: "Amudaryoning quyi oqimidagi Xorazm vohasida, Qoraqum va Qizilqum cho'llari orasida joylashgan. Voha butunlay daryo suvi bilan sug'oriladi.",
      facts: [
        "Yillik yog'in ~90 mm — mamlakatdagi eng quruq hududlardan",
        "Xorazm vohasi Amudaryoning qadimiy delta yotqiziqlarida vujudga kelgan",
        "Iqlimi keskin kontinental: qishi sovuq, yozi juda issiq",
      ],
      captions: ['Amudaryo Xorazmda', "Qoraqum cho'li", 'Amudaryo manzarasi', 'Amudaryodagi kema', "Qoraqum cho'li chekkasi"],
    },
    ru: {
      name: 'Хива',
      country: 'Узбекистан, Хорезм',
      text: 'Расположена в Хорезмском оазисе в низовьях Амударьи между пустынями Каракум и Кызылкум. Оазис полностью орошается водой реки.',
      facts: [
        'Осадков ~90 мм в год — один из самых засушливых районов страны',
        'Хорезмский оазис возник на древних дельтовых отложениях Амударьи',
        'Климат резко континентальный: холодная зима, очень жаркое лето',
      ],
      captions: ['Амударья в Хорезме', 'Пустыня Каракум', 'Панорама Амударьи', 'Судно на Амударье', 'Окраина пустыни Каракум'],
    },
  },
  nukus: {
    elevation: 75,
    jan: -5,
    jul: 28,
    rain: 100,
    uz: {
      name: 'Nukus',
      country: "O'zbekiston, Qoraqalpog'iston",
      text: "Amudaryo deltasining boshida joylashgan, Orol dengiziga eng yaqin yirik shahar. G'arbida Ustyurt platosi, sharqida Qizilqum cho'li.",
      facts: [
        "Orol dengizi 1960 yildan buyon maydonining 90% ga yaqinini yo'qotdi",
        "Qurigan dengiz tubidan ko'tarilgan tuz va chang bo'ronlari iqlimni keskinlashtirdi",
        "Ustyurt platosining tik jarliklari (chinklari) 150 m gacha balandlikda",
      ],
      captions: ["Orol dengizi: 1989 va 2008 yillar", "Ustyurtdan Orol dengizi", 'Amudaryo deltasi (kosmosdan)', 'Amudaryo Nukus yonida', "Mo'ynoq: qurigan dengiz tubi"],
    },
    ru: {
      name: 'Нукус',
      country: 'Узбекистан, Каракалпакстан',
      text: 'Расположен у начала дельты Амударьи, ближайший крупный город к Аральскому морю. На западе — плато Устюрт, на востоке — пустыня Кызылкум.',
      facts: [
        'С 1960 года Аральское море потеряло около 90% площади',
        'Солевые и пыльные бури с высохшего дна сделали климат суровее',
        'Отвесные обрывы (чинки) плато Устюрт достигают 150 м',
      ],
      captions: ['Аральское море: 1989 и 2008 годы', 'Арал с плато Устюрт', 'Дельта Амударьи (из космоса)', 'Амударья у Нукуса', 'Муйнак: высохшее дно моря'],
    },
  },
  termez: {
    elevation: 300,
    jan: 4,
    jul: 32,
    rain: 135,
    uz: {
      name: 'Termiz',
      country: "O'zbekiston, Surxondaryo",
      text: "Surxondaryo vodiysining janubida, Amudaryo bo'yida joylashgan — O'zbekistonning eng janubiy shahri. Shimolida Hisor, g'arbida Ko'hitang va Boysuntog' tog'lari.",
      facts: [
        "Mamlakatdagi eng issiq joy: iyulda o'rtacha +32 °C, rekord ~+50 °C",
        "Surxondaryo Termiz yonida Amudaryoga quyiladi",
        "Amudaryo bu yerda O'zbekiston va Afg'oniston chegarasini hosil qiladi",
      ],
      captions: ['Surxondaryo', "Surxon tog'lari ustida bulutlar", "Amudaryo: O'zbekiston–Afg'oniston chegarasi", "Surxon qo'riqxonasi daralari", "Ko'hitang tog'lari"],
    },
    ru: {
      name: 'Термез',
      country: 'Узбекистан, Сурхандарья',
      text: 'Расположен на юге Сурхандарьинской долины на берегу Амударьи — самый южный город Узбекистана. С севера — Гиссарский хребет, с запада — горы Кугитанг и Байсунтау.',
      facts: [
        'Самое жаркое место страны: в июле в среднем +32 °C, рекорд около +50 °C',
        'Сурхандарья впадает в Амударью возле Термеза',
        'Амударья здесь образует границу Узбекистана и Афганистана',
      ],
      captions: ['Река Сурхандарья', 'Облака над Сурханскими горами', 'Амударья: граница Узбекистана и Афганистана', 'Ущелья Сурханского заповедника', 'Горы Кугитанг'],
    },
  },
  andijan: {
    elevation: 450,
    jan: -2,
    jul: 27,
    rain: 230,
    uz: {
      name: 'Andijon',
      country: "O'zbekiston, Farg'ona vodiysi",
      text: "Farg'ona vodiysining sharqiy qismida, Qoradaryo bo'yida joylashgan. Vodiy uch tomondan Chotqol, Farg'ona va Oloy tog' tizmalari bilan o'ralgan.",
      facts: [
        "Norin va Qoradaryo qo'shilib Sirdaryoni hosil qiladi",
        "Andijon suv ombori Qoradaryo ustida, tog'dan chiqish joyida qurilgan",
        "Tog'lar sovuq shamollarni to'sadi — vodiy iqlimi yumshoq va unumdor",
      ],
      captions: ["Farg'ona vodiysi (kosmosdan)", 'Andijon suv ombori', "Norin va Qoradaryoning qo'shilishi", "Farg'ona tizmasi", 'Norin daryosi vodiysi'],
    },
    ru: {
      name: 'Андижан',
      country: 'Узбекистан, Ферганская долина',
      text: 'Расположен в восточной части Ферганской долины на реке Карадарья. Долину с трёх сторон окружают Чаткальский, Ферганский и Алайский хребты.',
      facts: [
        'Слияние Нарына и Карадарьи образует Сырдарью',
        'Андижанское водохранилище построено на Карадарье при выходе из гор',
        'Горы задерживают холодные ветры — климат долины мягкий и плодородный',
      ],
      captions: ['Ферганская долина (из космоса)', 'Андижанское водохранилище', 'Слияние Нарына и Карадарьи', 'Ферганский хребет', 'Долина реки Нарын'],
    },
  },
  qarshi: {
    elevation: 375,
    jan: 2,
    jul: 29,
    rain: 240,
    uz: {
      name: 'Qarshi',
      country: "O'zbekiston, Qashqadaryo",
      text: "Qashqadaryo bo'yida, keng Qarshi cho'lining sharqiy chekkasida joylashgan. Sharqda Hisor tizmasining g'arbiy tarmoqlari ko'tariladi.",
      facts: [
        "Qashqadaryo Hisor va Zarafshon tizmalaridan boshlanadi",
        "Qarshi cho'li Amudaryodan nasoslar bilan suv ko'taruvchi Qarshi magistral kanali orqali o'zlashtirilgan",
        "Tog'li qismida yaylovlar va archazorlar, tekislikda cho'l o'simliklari",
      ],
      captions: ['Qashqadaryo', "Shahrisabz tumanidagi tog'lar", "Qashqadaryo (kosmosdan)", "Tog' yonbag'irlaridagi o'simliklar", "Tog' daryosi va qorli cho'qqilar"],
    },
    ru: {
      name: 'Карши',
      country: 'Узбекистан, Кашкадарья',
      text: 'Расположен на реке Кашкадарья у восточного края обширной Каршинской степи. На востоке поднимаются западные отроги Гиссарского хребта.',
      facts: [
        'Кашкадарья берёт начало с Гиссарского и Зарафшанского хребтов',
        'Каршинская степь освоена благодаря Каршинскому магистральному каналу с насосными станциями',
        'В горах — пастбища и арчовники, на равнине — пустынная растительность',
      ],
      captions: ['Река Кашкадарья', 'Горы Шахрисабзского района', 'Кашкадарья из космоса', 'Растительность горных склонов', 'Горная река и снежные вершины'],
    },
  },
  almaty: {
    elevation: 800,
    jan: -5,
    jul: 24,
    rain: 650,
    uz: {
      name: 'Olmaota',
      country: "Qozog'iston",
      text: "Ili Olatovi tizmasining shimoliy etagida, tog'dan tushadigan konuslar ustida joylashgan. Shahar janubga qarab ko'tarilib, tog'larga tutashadi.",
      facts: [
        "Ili Olatovining eng baland nuqtasi — Talg'ar cho'qqisi (4979 m)",
        "Tog' daryolarida sel xavfi bor — Medeu to'g'oni shaharni sellardan himoya qiladi",
        "Charin kanyoni shahardan 200 km sharqda, uzunligi ~154 km",
      ],
      captions: ["Katta Olmaota ko'li", 'Ili Olatovi', 'Charin kanyoni', "Ko'lsay ko'llari", 'Medeu darasi'],
    },
    ru: {
      name: 'Алматы',
      country: 'Казахстан',
      text: 'Расположен у северного подножия Заилийского Алатау на конусах выноса горных рек. Город поднимается к югу и переходит в горы.',
      facts: [
        'Высшая точка Заилийского Алатау — пик Талгар (4979 м)',
        'Горные реки селеопасны — плотина Медеу защищает город от селей',
        'Чарынский каньон — в 200 км к востоку, длина около 154 км',
      ],
      captions: ['Большое Алматинское озеро', 'Заилийский Алатау', 'Чарынский каньон', 'Кольсайские озёра', 'Ущелье Медеу'],
    },
  },
  bishkek: {
    elevation: 800,
    jan: -3,
    jul: 25,
    rain: 440,
    uz: {
      name: 'Bishkek',
      country: "Qirg'iziston",
      text: "Chu vodiysida, Qirg'iz Olatovi tizmasining shimoliy etagida joylashgan. Janubda 4000 m dan baland qorli cho'qqilar ko'rinib turadi.",
      facts: [
        "Chu daryosi Qirg'iziston va Qozog'iston chegarasi bo'ylab oqadi",
        "Ala-Archa daryosi shahardan atigi 40 km janubdagi daradan boshlanadi",
        "Issiqko'l — dunyodagi eng katta baland tog' ko'llaridan biri (1607 m), shahardan sharqda",
      ],
      captions: ['Ala-Archa darasi', "Qirg'iz Olatovi tizmasi", 'Chu vodiysi', "Issiqko'l", 'Chu daryosi'],
    },
    ru: {
      name: 'Бишкек',
      country: 'Кыргызстан',
      text: 'Расположен в Чуйской долине у северного подножия Киргизского Алатоо. На юге видны снежные вершины выше 4000 м.',
      facts: [
        'Река Чу течёт вдоль границы Кыргызстана и Казахстана',
        'Река Ала-Арча начинается в ущелье всего в 40 км к югу от города',
        'Иссык-Куль — одно из крупнейших высокогорных озёр мира (1607 м), к востоку от города',
      ],
      captions: ['Ущелье Ала-Арча', 'Киргизский Алатоо', 'Чуйская долина', 'Озеро Иссык-Куль', 'Река Чу'],
    },
  },
  dushanbe: {
    elevation: 800,
    jan: 2,
    jul: 27,
    rain: 650,
    uz: {
      name: 'Dushanbe',
      country: 'Tojikiston',
      text: "Hisor vodiysida, Varzob daryosi bo'yida joylashgan. Shimolida Hisor tizmasi 4000 m dan oshadi — undan sovuq havo massalari kam o'tadi.",
      facts: [
        "Varzob daryosi Hisor tizmasining muzliklaridan boshlanadi",
        "Iskandarko'l — Fon tog'laridagi 2195 m balandlikdagi ko'l",
        "Norak GESi to'g'oni (~300 m) — dunyodagi eng baland to'g'onlardan biri, Vaxsh daryosida",
      ],
      captions: ['Varzob darasi', "Temurdara ko'li", "Iskandarko'l", "Norak to'g'oni", 'Varzob daryosi'],
    },
    ru: {
      name: 'Душанбе',
      country: 'Таджикистан',
      text: 'Расположен в Гиссарской долине на реке Варзоб. С севера Гиссарский хребет поднимается выше 4000 м и защищает от холодных воздушных масс.',
      facts: [
        'Река Варзоб берёт начало с ледников Гиссарского хребта',
        'Искандеркуль — озеро в Фанских горах на высоте 2195 м',
        'Плотина Нурекской ГЭС (~300 м) на Вахше — одна из самых высоких в мире',
      ],
      captions: ['Ущелье Варзоб', 'Озеро Тимурдара', 'Озеро Искандеркуль', 'Нурекская плотина', 'Река Варзоб'],
    },
  },
  ashgabat: {
    elevation: 220,
    jan: 2,
    jul: 31,
    rain: 210,
    uz: {
      name: 'Ashxobod',
      country: 'Turkmaniston',
      text: "Ko'petdog' tog'larining shimoliy etagida, Qoraqum cho'lining janubiy chekkasida joylashgan. Tog' va cho'l chegarasidagi vohada.",
      facts: [
        "Qoraqum — O'rta Osiyodagi eng katta cho'l (~350 ming km²)",
        "Suvni Amudaryodan boshlanuvchi 1100 km dan uzun Qoraqum kanali keltiradi",
        "Ko'petdog' — seysmik faol tog'lar, 1948 yilda kuchli zilzila bo'lgan",
      ],
      captions: ["Ko'petdog' tog'lari", "Qoraqum cho'li", 'Darvoza gaz krateri', 'Xonhovuz suv ombori', "Ko'w-Ota yer osti ko'li"],
    },
    ru: {
      name: 'Ашхабад',
      country: 'Туркменистан',
      text: 'Расположен у северного подножия Копетдага на южной окраине пустыни Каракум — в оазисе на границе гор и пустыни.',
      facts: [
        'Каракум — крупнейшая пустыня Средней Азии (~350 тыс. км²)',
        'Воду подаёт Каракумский канал длиной более 1100 км, начинающийся от Амударьи',
        'Копетдаг — сейсмически активные горы, в 1948 году произошло сильное землетрясение',
      ],
      captions: ['Горы Копетдаг', 'Пустыня Каракум', 'Газовый кратер Дарваза', 'Водохранилище Ханховуз', 'Подземное озеро Ков-Ата'],
    },
  },
}

// ── Suv obyektlari: dengiz, ko'llar, daryolar (xaritadagi yozuvlar bosilganda)
const waters = {
  caspian: {
    uz: {
      name: 'Kaspiy dengizi',
      country: "Dengiz-ko'l · Qozog'iston, Turkmaniston, Ozarbayjon, Rossiya, Eron",
      stats: [['Maydoni', '371 ming km²'], ['Eng chuqur joyi', '1025 m'], ['Sathi', '−28 m'], ["Sho'rligi", '~13 ‰']],
      text: "Yer yuzidagi eng katta berk ko'l. Okean bilan bog'lanmagan, lekin suvi sho'r va hajmi juda katta bo'lgani uchun dengiz deb ataladi.",
      facts: [
        'Sathi okean sathidan 28 m pastda joylashgan',
        'Kelayotgan suvning ~80% ini Volga daryosi beradi',
        "Sharqiy qirg'og'idagi Qorabo'g'ozko'l qo'ltig'ida suv kuchli bug'lanib, tuz to'planadi",
      ],
      captions: ['Kaspiy dengizi kosmosdan', "Kaspiyda suv o'tlarining gullashi", "Mang'ishloq qirg'og'i", "Turkmanboshi qirg'og'i", 'Aqtovda quyosh botishi'],
    },
    ru: {
      name: 'Каспийское море',
      country: 'Море-озеро · Казахстан, Туркменистан, Азербайджан, Россия, Иран',
      stats: [['Площадь', '371 тыс. км²'], ['Наибольшая глубина', '1025 м'], ['Уровень', '−28 м'], ['Солёность', '~13 ‰']],
      text: 'Крупнейшее бессточное озеро Земли. Не связано с океаном, но из-за солёной воды и огромных размеров называется морем.',
      facts: [
        'Уровень лежит на 28 м ниже уровня океана',
        'Около 80% притока даёт река Волга',
        'В заливе Кара-Богаз-Гол на восточном берегу вода сильно испаряется и накапливается соль',
      ],
      captions: ['Каспийское море из космоса', 'Цветение водорослей в Каспии', 'Побережье Мангышлака', 'Побережье Туркменбаши', 'Закат в Актау'],
    },
  },
  aral: {
    uz: {
      name: 'Orol dengizi',
      country: "Berk ko'l · O'zbekiston, Qozog'iston",
      stats: [['Maydoni (1960)', '68 ming km²'], ['Hozirgi maydoni', '~8 ming km²'], ['Eng chuqur (1960)', '69 m'], ['Daryolari', 'Amudaryo, Sirdaryo']],
      text: "1960 yilda dunyodagi to'rtinchi eng katta ko'l edi. Amudaryo va Sirdaryo suvlari sug'orishga olingach, tez qurib, bir necha qismga bo'linib ketdi.",
      facts: [
        "Qurigan tubida yangi cho'l — Orolqum paydo bo'ldi",
        "Tuz va chang bo'ronlari atrofdagi hududlar iqlimi va tuprog'iga zarar yetkazadi",
        "Shimoliy (Kichik) Orol Ko'karal to'g'oni (2005) tufayli qisman tiklandi",
      ],
      captions: ['Orol: 1989 va 2008 yillar', 'Orol 1997 yilda (kosmosdan)', 'Orol dengizi 2019 yilda', 'Orol XKSdan', 'Orolqum: qurigan tubdagi tuz'],
    },
    ru: {
      name: 'Аральское море',
      country: 'Бессточное озеро · Узбекистан, Казахстан',
      stats: [['Площадь (1960)', '68 тыс. км²'], ['Сейчас', '~8 тыс. км²'], ['Глубина (1960)', '69 м'], ['Реки', 'Амударья, Сырдарья']],
      text: 'В 1960 году было четвёртым по величине озером мира. После забора вод Амударьи и Сырдарьи на орошение быстро высохло и распалось на части.',
      facts: [
        'На высохшем дне появилась новая пустыня — Аралкум',
        'Солевые и пыльные бури вредят климату и почвам окрестностей',
        'Северный (Малый) Арал частично восстановлен благодаря Кокаральской плотине (2005)',
      ],
      captions: ['Арал: 1989 и 2008 годы', 'Арал в 1997 году (из космоса)', 'Аральское море в 2019 году', 'Арал с МКС', 'Аралкум: соль на высохшем дне'],
    },
  },
  amu: {
    uz: {
      name: 'Amudaryo',
      country: "Daryo · Tojikiston, Afg'oniston, Turkmaniston, O'zbekiston",
      stats: [['Uzunligi', '1415 km'], ['Panj bilan', '2540 km'], ['Boshlanishi', 'Pomir'], ['Quyilishi', 'Orol dengizi']],
      text: "O'rta Osiyodagi eng sersuv daryo. Pomirdan boshlanuvchi Panj va Vaxsh daryolarining qo'shilishidan hosil bo'ladi va Turon pasttekisligi orqali Orol tomon oqadi.",
      facts: [
        "Asosan qor va muzliklar suvidan to'yinadi — eng ko'p suv yozda oqadi",
        'Quyi oqimida keng delta hosil qilgan, lekin hozir suvi ko\'pincha Orolga yetib bormaydi',
        "Suvi Qoraqum, Amu-Buxoro va Qarshi kanallari orqali cho'llarga taqsimlanadi",
      ],
      captions: ['Amudaryo deltasi (kosmosdan)', 'Panj — Amudaryoning boshlanishi', 'Amudaryo manzarasi', 'Vaxsh daryosi', 'Amudaryo kosmosdan'],
    },
    ru: {
      name: 'Амударья',
      country: 'Река · Таджикистан, Афганистан, Туркменистан, Узбекистан',
      stats: [['Длина', '1415 км'], ['С Пянджем', '2540 км'], ['Исток', 'Памир'], ['Устье', 'Аральское море']],
      text: 'Самая полноводная река Средней Азии. Образуется слиянием Пянджа и Вахша, начинающихся на Памире, и течёт через Туранскую низменность к Аралу.',
      facts: [
        'Питается в основном снегами и ледниками — больше всего воды летом',
        'В низовьях образует широкую дельту, но сейчас часто не доходит до Арала',
        'Воду распределяют по пустыням Каракумский, Аму-Бухарский и Каршинский каналы',
      ],
      captions: ['Дельта Амударьи (из космоса)', 'Пяндж — начало Амударьи', 'Панорама Амударьи', 'Река Вахш', 'Амударья из космоса'],
    },
  },
  syr: {
    uz: {
      name: 'Sirdaryo',
      country: "Daryo · Qirg'iziston, O'zbekiston, Tojikiston, Qozog'iston",
      stats: [['Uzunligi', '2212 km'], ['Norin bilan', '3019 km'], ['Boshlanishi', "Farg'ona vodiysi"], ['Quyilishi', 'Shimoliy Orol']],
      text: "O'rta Osiyodagi eng uzun daryo. Farg'ona vodiysida Norin va Qoradaryoning qo'shilishidan boshlanadi, Qizilqumning shimoli-sharqi bo'ylab Orolga oqadi.",
      facts: [
        "Tyan-Shan tog'larining qor va muzliklaridan to'yinadi",
        "Yo'lida To'xtag'ul, Qayroqqum va Chordara suv omborlari qurilgan",
        "Suvi Mirzacho'l va Farg'ona vodiysidagi dalalarni sug'oradi",
      ],
      captions: ['Sirdaryoda quyosh botishi', 'Sirdaryo', 'Sirdaryo qayirlari (kosmosdan)', 'Norin daryosi vodiysi', "Sirdaryo Boyqo'ng'ir yonida"],
    },
    ru: {
      name: 'Сырдарья',
      country: 'Река · Кыргызстан, Узбекистан, Таджикистан, Казахстан',
      stats: [['Длина', '2212 км'], ['С Нарыном', '3019 км'], ['Исток', 'Ферганская долина'], ['Устье', 'Северный Арал']],
      text: 'Самая длинная река Средней Азии. Начинается в Ферганской долине от слияния Нарына и Карадарьи и течёт вдоль северо-востока Кызылкума к Аралу.',
      facts: [
        'Питается снегами и ледниками Тянь-Шаня',
        'На реке построены Токтогульское, Кайраккумское и Чардаринское водохранилища',
        'Её воды орошают Голодную степь и Ферганскую долину',
      ],
      captions: ['Закат на Сырдарье', 'Сырдарья', 'Пойма Сырдарьи (из космоса)', 'Долина реки Нарын', 'Сырдарья у Байконура'],
    },
  },
  zarafshon: {
    uz: {
      name: 'Zarafshon',
      country: "Daryo · Tojikiston, O'zbekiston",
      stats: [['Uzunligi', '~877 km'], ['Boshlanishi', 'Zarafshon muzligi'], ['Tugashi', 'Qizilqum'], ["O'tadi", 'Samarqand, Buxoro']],
      text: "Zarafshon va Turkiston tizmalari orasidagi muzlikdan boshlanadi. Tog'dan chiqqach, keng vodiy bo'ylab oqib, Samarqand va Buxoro vohalarini sug'oradi.",
      facts: [
        "Nomi «oltin sochuvchi» degani — qadimda qumidan oltin yuvilgan",
        'Suvi to\'liq sug\'orishga sarflanadi va Qizilqumda tugaydi — Amudaryoga yetmaydi',
        'Yuqori oqimi tor tog\' darasida, quyi oqimi keng tekislikda',
      ],
      captions: ['Zarafshon Panjakent yonida', 'Zarafshon vodiysi', 'Zarafshon Navoiy yonida', 'Zarafshon qayiri', 'Zarafshon darasi'],
    },
    ru: {
      name: 'Зарафшан',
      country: 'Река · Таджикистан, Узбекистан',
      stats: [['Длина', '~877 км'], ['Исток', 'Зарафшанский ледник'], ['Конец', 'Кызылкум'], ['Протекает', 'Самарканд, Бухара']],
      text: 'Начинается с ледника между Зарафшанским и Туркестанским хребтами. Выйдя из гор, течёт по широкой долине и орошает Самаркандский и Бухарский оазисы.',
      facts: [
        'Название означает «рассыпающий золото» — в древности из песка намывали золото',
        'Вода полностью уходит на орошение, река теряется в Кызылкуме и не доходит до Амударьи',
        'Верхнее течение — в узком ущелье, нижнее — на широкой равнине',
      ],
      captions: ['Зарафшан у Пенджикента', 'Долина Зарафшана', 'Зарафшан у Навои', 'Пойма Зарафшана', 'Ущелье Зарафшана'],
    },
  },
  issykkul: {
    uz: {
      name: "Issiqko'l",
      country: "Tog' ko'li · Qirg'iziston",
      stats: [['Maydoni', '6236 km²'], ['Eng chuqur joyi', '668 m'], ['Sathi', '1607 m'], ["Sho'rligi", '~6 ‰']],
      text: "Tyan-Shanning Kungey va Terskey Olatovi tizmalari orasidagi chuqur botiqdagi berk ko'l. Dunyodagi eng katta baland tog' ko'llaridan biri.",
      facts: [
        "Qishda ham muzlamaydi — nomi «issiq ko'l» shundan",
        "Ko'lga 80 dan ortiq daryo quyiladi, lekin birorta daryo oqib chiqmaydi",
        "Suvi biroz sho'r va juda tiniq — 20 m chuqurlikkacha ko'rinadi",
      ],
      captions: ["Issiqko'l sohili", "Issiqko'l", "Issiqko'l kosmosdan", "Ko'l atrofidagi tog'lar", "Qoraqo'l darasi"],
    },
    ru: {
      name: 'Иссык-Куль',
      country: 'Горное озеро · Кыргызстан',
      stats: [['Площадь', '6236 км²'], ['Наибольшая глубина', '668 м'], ['Уровень', '1607 м'], ['Солёность', '~6 ‰']],
      text: 'Бессточное озеро в глубокой котловине между хребтами Кюнгей-Алатоо и Терскей-Алатоо Тянь-Шаня. Одно из крупнейших высокогорных озёр мира.',
      facts: [
        'Не замерзает даже зимой — отсюда название «тёплое озеро»',
        'В озеро впадает более 80 рек, но ни одна не вытекает',
        'Вода слегка солёная и очень прозрачная — видно на глубину до 20 м',
      ],
      captions: ['Берег Иссык-Куля', 'Иссык-Куль', 'Иссык-Куль из космоса', 'Горы вокруг озера', 'Ущелье Каракол'],
    },
  },
  balkhash: {
    uz: {
      name: "Balxash ko'li",
      country: "Ko'l · Qozog'iston",
      stats: [['Maydoni', '~16,4 ming km²'], ['Uzunligi', '~600 km'], ['Eng chuqur joyi', '26 m'], ['Sathi', '341 m']],
      text: "Qozog'iston sharqidagi uzun va sayoz berk ko'l. Unga asosan Xitoy va Qozog'iston tog'laridan keluvchi Ili daryosi quyiladi.",
      facts: [
        "G'arbiy qismi chuchuk, sharqiy qismi sho'r — bir ko'lda ikki xil suv",
        "Ikki qismini tor Uzinarol bo'g'ozi bog'lab turadi",
        'Ili daryosi ko\'lga quyilishda katta qamishzor delta hosil qiladi',
      ],
      captions: ["Balxash qirg'og'i yuqoridan", 'Balxash kosmosdan (yoz)', 'Balxash kosmosdan (bahor)', 'Ili daryosi', 'Balxash 1991 yilda kosmosdan'],
    },
    ru: {
      name: 'Озеро Балхаш',
      country: 'Озеро · Казахстан',
      stats: [['Площадь', '~16,4 тыс. км²'], ['Длина', '~600 км'], ['Наибольшая глубина', '26 м'], ['Уровень', '341 м']],
      text: 'Длинное и мелкое бессточное озеро на востоке Казахстана. Главный приток — река Или, текущая с гор Китая и Казахстана.',
      facts: [
        'Западная часть пресная, восточная — солёная: два вида воды в одном озере',
        'Части соединяет узкий пролив Узынарал',
        'При впадении река Или образует большую тростниковую дельту',
      ],
      captions: ['Берег Балхаша сверху', 'Балхаш из космоса (лето)', 'Балхаш из космоса (весна)', 'Река Или', 'Балхаш в 1991 году из космоса'],
    },
  },
}

Object.assign(waters, moreWaters)

const fmtTemp = (v) => `${v > 0 ? '+' : v < 0 ? '−' : ''}${Math.abs(v)} °C`

/** Shahar yoki suv obyekti ma'lumoti joriy tilda, rasmlar mualliflari bilan birga */
export function cityInfo(key, lang) {
  const ru = lang === 'ru'
  const water = waters[key] ?? countries[key]
  if (water) {
    const info = water[lang] ?? water.uz
    return {
      key,
      kind: countries[key] ? 'country' : 'water',
      ...info,
      stats: info.stats.map(([label, value]) => ({ label, value })),
      photos: (photos[key] ?? []).map((p, i) => ({ ...p, caption: info.captions[i] ?? '' })),
    }
  }
  const land = landforms[key]
  if (land) {
    const info = land[lang] ?? land.uz
    return {
      key,
      kind: 'landform',
      type: land.type,
      badge: land.badge ?? land.type,
      look: land.look,
      high: Boolean(land.high),
      low: Boolean(land.low),
      profile: land.profile,
      ...info,
      stats: info.stats.map(([label, value]) => ({ label, value })),
      numbers: info.numbers.map(([value, label]) => ({ value, label })),
      photos: [],
    }
  }
  const entry = raw[key]
  if (!entry) return null
  const info = entry[lang] ?? entry.uz
  return {
    key,
    kind: 'city',
    ...info,
    stats: [
      { label: ru ? 'Высота' : 'Balandligi', value: `${entry.elevation} ${ru ? 'м' : 'm'}` },
      { label: ru ? 'Январь' : 'Yanvar', value: fmtTemp(entry.jan) },
      { label: ru ? 'Июль' : 'Iyul', value: fmtTemp(entry.jul) },
      { label: ru ? 'Осадки' : "Yog'in", value: `${entry.rain} ${ru ? 'мм/год' : 'mm/yil'}` },
    ],
    photos: (photos[key] ?? []).map((p, i) => ({ ...p, caption: info.captions[i] ?? '' })),
  }
}

export const cityKeys = Object.keys(raw)
/** Bosiladigan suv obyektlari (geo.js'dagi mapLabels kalitlari) */
export const waterKeys = Object.keys(waters)
/** Bosiladigan relyef obyektlari: cho'llar, tog'lar, vodiy, plato */
export { landformKeys }
/** Bosiladigan davlat nomlari */
export const countryKeys = Object.keys(countries)
