// «O'rta Osiyoga sho'ng'ish» xaritasidagi qo'shimcha bosiladigan yozuvlar: kichikroq ko'llar va daryolar
// hamda davlatlar. Tuzilishi cities.js'dagi suv obyektlari bilan bir xil: 4 ta ko'rsatkich, matn,
// 3 ta geografik xususiyat va galereyadagi 5 ta rasm uchun izohlar (rasmlar — cityPhotos.json).
// Raqamlar — ensiklopedik, yaxlitlangan qiymatlar.

// ── Ko'llar va daryolar
export const moreWaters = {
  aydarkul: {
    uz: {
      name: "Aydarko'l",
      country: "Sun'iy ko'l · O'zbekiston",
      stats: [['Maydoni', '~3500 km²'], ['Uzunligi', '~250 km'], ["Paydo bo'lgan", '1969 yil'], ["Sho'rligi", '2–8 ‰']],
      text: "Qizilqumning janubi-sharqiy chekkasidagi Arnasoy botig'ida, Nurota tog'lari etagida joylashgan. 1969 yilgi kuchli toshqinda Sirdaryodagi Chordara suv omboridan ortiqcha suv tashlanganda paydo bo'lgan.",
      facts: [
        "Aydar, Arnasoy va Tuzkon ko'llari birgalikda Aydar-Arnasoy ko'llar tizimini tashkil etadi",
        "Hozir ko'lni asosan Mirzacho'l dalalaridan keladigan zovur suvlari to'ldirib turadi",
        "2008 yildan Ramsar ro'yxatida: saqoqush, qoravoy va ko'plab ko'chmanchi qushlar qishlaydi",
      ],
      captions: ["Aydarko'l", "Arnasoy ko'llari va qamishzor orollar", "Aydarko'lda quyosh botishi", "Aydarko'ldagi baliqchilar", "Ko'l va osmon tutashgan joy"],
    },
    ru: {
      name: 'Айдаркуль',
      country: 'Искусственное озеро · Узбекистан',
      stats: [['Площадь', '~3500 км²'], ['Длина', '~250 км'], ['Возникло', '1969 год'], ['Солёность', '2–8 ‰']],
      text: 'Лежит в Арнасайской впадине на юго-восточной окраине Кызылкума, у подножия Нуратинских гор. Возникло в 1969 году, когда во время сильного паводка сюда сбросили избыток воды из Чардаринского водохранилища на Сырдарье.',
      facts: [
        'Озёра Айдар, Арнасай и Тузкан вместе образуют Айдаро-Арнасайскую систему озёр',
        'Сейчас озеро пополняют в основном коллекторно-дренажные воды с полей Голодной степи',
        'С 2008 года в Рамсарском списке: здесь зимуют пеликаны, бакланы и многие перелётные птицы',
      ],
      captions: ['Айдаркуль', 'Арнасайские озёра и тростниковые острова', 'Закат на Айдаркуле', 'Рыбаки на Айдаркуле', 'Там, где озеро сливается с небом'],
    },
  },
  sarygamysh: {
    uz: {
      name: "Sariqamish ko'li",
      country: "Berk ko'l · Turkmaniston, O'zbekiston",
      stats: [['Maydoni', '~5000 km²'], ['Eng chuqur joyi', '~40 m'], ["Sho'rligi", '10–15 ‰'], ['Suv manbai', 'zovur suvlari']],
      text: "Ustyurt platosi bilan Qoraqum oralig'idagi Sariqamish botig'ida joylashgan berk ko'l. Qadimda Amudaryo bu yerga bir necha bor burilib oqqan; XX asr boshida botiq deyarli qurib qolgan edi.",
      facts: [
        "1960-yillardan Xorazm va Toshhovuz vohalaridan keladigan zovur suvlari hisobiga qayta to'lgan",
        "Qadimgi O'zboy o'zani shu botiqdan boshlanib, Kaspiy dengizi tomon ketgan",
        "Dalalardan kelgan suvda tuz va o'g'it qoldiqlari ko'p — ko'l asta-sekin sho'rlanmoqda",
      ],
      captions: ['Sariqamish sohili', "Ko'lda quyosh botishi", "Sariqamish ko'li kosmosdan", "Shimoliy qirg'oq (XKSdan)", "Ko'lga suv keltiruvchi o'zan (XKSdan)"],
    },
    ru: {
      name: 'Сарыкамышское озеро',
      country: 'Бессточное озеро · Туркменистан, Узбекистан',
      stats: [['Площадь', '~5000 км²'], ['Наибольшая глубина', '~40 м'], ['Солёность', '10–15 ‰'], ['Питание', 'дренажные воды']],
      text: 'Бессточное озеро в Сарыкамышской впадине между плато Устюрт и Каракумами. В древности Амударья не раз поворачивала сюда; к началу XX века впадина почти высохла.',
      facts: [
        'С 1960-х годов заново наполнилось коллекторными водами Хорезмского и Ташаузского оазисов',
        'Отсюда начиналось древнее русло Узбой, уходившее к Каспийскому морю',
        'В воде с полей много солей и остатков удобрений — озеро постепенно осолоняется',
      ],
      captions: ['Берег Сарыкамыша', 'Закат на озере', 'Сарыкамышское озеро из космоса', 'Северный берег (с МКС)', 'Русло, несущее воду в озеро (с МКС)'],
    },
  },
  karabogaz: {
    uz: {
      name: "Qorabo'g'ozko'l",
      country: "Sho'r qo'ltiq-ko'l · Turkmaniston",
      stats: [['Maydoni', '~18 ming km²'], ['Chuqurligi', '10 m gacha'], ["Sho'rligi", '~300 ‰'], ['Sathi', '−29 m atrofida']],
      text: "Kaspiy dengizining sharqiy qirg'og'idagi sayoz qo'ltiq-laguna. Dengiz bilan tor va uzun bo'g'oz orqali tutashgan: Kaspiy suvi bu yerga oqib kirib, jazirama cho'lda tez bug'lanadi.",
      facts: [
        "Dunyodagi eng sho'r suv havzalaridan biri — suvi okean suvidan qariyb 10 baravar sho'r",
        "1980 yilda bo'g'oz to'g'on bilan yopilgach, qo'ltiq uch yilda qurib, tuz cho'liga aylangan; 1992 yilda to'g'on buzilib, suv qaytgan",
        "Tubida mirabilit (Glauber tuzi) ning dunyodagi eng yirik zaxiralari to'plangan",
      ],
      captions: ["Qorabo'g'ozko'l kosmosdan", "Kaspiy bilan bog'lovchi bo'g'oz", "Sho'r suv va tuzli qirg'oqlar (XKSdan)", "Kaspiyning sharqiy qirg'og'idagi qo'ltiq", "Tuz bilan qoplangan sayozliklar"],
    },
    ru: {
      name: 'Кара-Богаз-Гол',
      country: 'Солёный залив-лагуна · Туркменистан',
      stats: [['Площадь', '~18 тыс. км²'], ['Глубина', 'до 10 м'], ['Солёность', '~300 ‰'], ['Уровень', 'около −29 м']],
      text: 'Мелководный залив-лагуна на восточном берегу Каспийского моря. Соединён с морем узким длинным проливом: каспийская вода втекает сюда и быстро испаряется в знойной пустыне.',
      facts: [
        'Один из самых солёных водоёмов мира — вода почти в 10 раз солонее океанской',
        'В 1980 году пролив перекрыли дамбой, и залив за три года высох, превратившись в соляную пустыню; в 1992 году дамбу разрушили, вода вернулась',
        'На дне сосредоточены крупнейшие в мире запасы мирабилита (глауберовой соли)',
      ],
      captions: ['Кара-Богаз-Гол из космоса', 'Пролив, соединяющий залив с Каспием', 'Рассол и соляные берега (с МКС)', 'Залив на восточном берегу Каспия', 'Отмели, покрытые солью'],
    },
  },
  atrek: {
    uz: {
      name: 'Atrek',
      country: 'Daryo · Eron, Turkmaniston',
      stats: [['Uzunligi', '669 km'], ['Havzasi', '~27 ming km²'], ['Boshlanishi', "Ko'petdog' (Eron)"], ['Quyilishi', 'Kaspiy dengizi']],
      text: "Erondagi Turkman-Xuroson tog'laridan boshlanadi. Quyi oqimida Eron bilan Turkmaniston chegarasi daryo bo'ylab o'tadi. Suvi sug'orishga olingani uchun Kaspiyga faqat bahorgi toshqin paytida yetib boradi.",
      facts: [
        "Eng yirik irmog'i — Ko'petdog'dan oqib tushuvchi Sumbar daryosi",
        "Suvi juda loyqa — daryo har yili vodiyga ko'p miqdorda unumdor loy olib keladi",
        "Quyi oqimi — Turkmanistonning eng iliq, quruq subtropik o'lkasi: bu yerda zaytun, anor va anjir yetishtiriladi",
      ],
      captions: ['Atrek daryosi (Eron)', 'Atrekning boshlanishi', "Yuqori oqimdagi Yadak qishlog'i", "Atrek boshlanadigan tog'lar", "Atrek quyiladigan Kaspiy qirg'og'i (kosmosdan)"],
    },
    ru: {
      name: 'Атрек',
      country: 'Река · Иран, Туркменистан',
      stats: [['Длина', '669 км'], ['Бассейн', '~27 тыс. км²'], ['Исток', 'Копетдаг (Иран)'], ['Устье', 'Каспийское море']],
      text: 'Начинается в Туркмено-Хорасанских горах в Иране. В нижнем течении по реке проходит граница Ирана и Туркменистана. Воду разбирают на орошение, поэтому до Каспия река доходит только в весеннее половодье.',
      facts: [
        'Крупнейший приток — река Сумбар, стекающая с Копетдага',
        'Вода очень мутная — каждый год река приносит в долину много плодородного ила',
        'Низовья — самый тёплый район Туркменистана, сухие субтропики: здесь выращивают маслины, гранат и инжир',
      ],
      captions: ['Река Атрек (Иран)', 'Истоки Атрека', 'Село Ядак в верховьях', 'Горы, где начинается Атрек', 'Берег Каспия, куда впадает Атрек (из космоса)'],
    },
  },
  harirud: {
    uz: {
      name: 'Tajan (Harirud)',
      country: "Daryo · Afg'oniston, Eron, Turkmaniston",
      stats: [['Uzunligi', '~1100 km'], ['Boshlanishi', 'Hindukush'], ['Tugashi', 'Qoraqum'], ["O'tadi", 'Hirot, Tajan']],
      text: "Afg'oniston markazidagi Ko'hi Bobo tog'laridan boshlanib, g'arbga — Hirot vohasi tomon oqadi. So'ng shimolga burilib, avval Afg'oniston–Eron, keyin Eron–Turkmaniston chegarasi bo'ylab oqadi va Qoraqum qumlarida tugaydi.",
      facts: [
        "Yuqori oqimi Harirud, Turkmanistondagi quyi oqimi Tajan deb ataladi",
        "Daryo sohilida XII asrga oid 65 metrli Jom minorasi turibdi (YuNESKO merosi)",
        "Eron va Turkmaniston chegarasida «Do'stlik» to'g'oni va suv ombori qurilgan (2005)",
      ],
      captions: ["Hirot yaqinidagi ko'prik", "Qadimiy Molon ko'prigi (Hirot)", "«Do'stlik» suv ombori (XKSdan)", 'Chisht vodiysi', "Harirudning o'rta oqimi, Chisht"],
    },
    ru: {
      name: 'Теджен (Герируд)',
      country: 'Река · Афганистан, Иран, Туркменистан',
      stats: [['Длина', '~1100 км'], ['Исток', 'Гиндукуш'], ['Конец', 'Каракумы'], ['Протекает', 'Герат, Теджен']],
      text: 'Начинается в горах Кохи-Баба в центре Афганистана и течёт на запад, к Гератскому оазису. Затем поворачивает на север, идёт вдоль границы Афганистана с Ираном, потом Ирана с Туркменистаном и теряется в песках Каракумов.',
      facts: [
        'Верхнее течение называют Герируд, нижнее, в Туркменистане, — Теджен',
        'На берегу реки стоит 65-метровый Джамский минарет XII века (наследие ЮНЕСКО)',
        'На границе Ирана и Туркменистана построены плотина и водохранилище «Достлук» (2005)',
      ],
      captions: ['Мост близ Герата', 'Древний мост Малан (Герат)', 'Водохранилище «Достлук» (с МКС)', 'Долина Чишт', 'Среднее течение Герируда, Чишт'],
    },
  },
}

// ── Davlatlar
export const countries = {
  uzbekistan: {
    uz: {
      name: "O'zbekiston",
      country: "Davlat · O'rta Osiyo markazi",
      stats: [['Maydoni', '448,9 ming km²'], ['Aholisi', '~37 mln'], ['Poytaxti', 'Toshkent'], ['Eng baland nuqtasi', '4643 m']],
      text: "O'rta Osiyoning markazida, Amudaryo va Sirdaryo oralig'ida joylashgan. Hududining qariyb beshdan to'rt qismi tekislik (Turon pasttekisligi, Qizilqum), sharqi va janubi-sharqi — Tyan-Shan va Hisor-Oloy tog'lari.",
      facts: [
        "Okeanga chiqish uchun kamida ikki davlatni kesib o'tish kerak bo'lgan dunyodagi ikki davlatdan biri (ikkinchisi — Lixtenshteyn)",
        "O'rta Osiyoning qolgan to'rtta davlati va Afg'oniston bilan chegaradosh",
        "Eng baland nuqtasi — Hazrati Sulton cho'qqisi (4643 m), eng past joyi — Qizilqumdagi Mingbuloq botig'i (−12 m)",
      ],
      captions: ["G'arbiy Tyan-Shan: Chimyon tog'lari va Chorvoq", 'Qizilqumda kovrak (ferula)', "Zomin milliy bog'i", "Hisor qo'riqxonasi", 'Ustyurt jarliklari'],
    },
    ru: {
      name: 'Узбекистан',
      country: 'Государство · центр Средней Азии',
      stats: [['Площадь', '448,9 тыс. км²'], ['Население', '~37 млн'], ['Столица', 'Ташкент'], ['Высшая точка', '4643 м']],
      text: 'Расположен в центре Средней Азии, в междуречье Амударьи и Сырдарьи. Около четырёх пятых территории — равнины (Туранская низменность, Кызылкум), восток и юго-восток заняты горами Тянь-Шаня и Гиссаро-Алая.',
      facts: [
        'Одна из двух стран мира, которым для выхода к океану нужно пересечь не менее двух государств (вторая — Лихтенштейн)',
        'Граничит со всеми четырьмя остальными странами Средней Азии и с Афганистаном',
        'Высшая точка — пик Хазрет-Султан (4643 м), низшая — впадина Мингбулак в Кызылкуме (−12 м)',
      ],
      captions: ['Западный Тянь-Шань: Чимган и Чарвак', 'Ферула в Кызылкуме', 'Зааминский национальный парк', 'Гиссарский заповедник', 'Обрывы Устюрта'],
    },
  },
  kazakhstan: {
    uz: {
      name: "Qozog'iston",
      country: "Davlat · O'rta Osiyo va Sharqiy Yevropa",
      stats: [['Maydoni', '2,72 mln km²'], ['Aholisi', '~20 mln'], ['Poytaxti', 'Ostona'], ['Eng baland nuqtasi', '6995 m']],
      text: "Maydoni bo'yicha dunyoda to'qqizinchi davlat. Kaspiy dengizidan Oltoy tog'larigacha cho'zilgan: shimolida dashtlar, markazi va janubida chala cho'l va cho'llar, janubi-sharqida Tyan-Shan tog'lari.",
      facts: [
        'Okeanga chiqish yo\'li bo\'lmagan davlatlar ichida dunyodagi eng kattasi',
        "Eng baland nuqtasi — Xon Tangri cho'qqisi (6995 m), eng past joyi — Qoraqiya botig'i (−132 m)",
        "Shimoldan janubga tabiat zonalari almashinadi: o'rmon-dasht, dasht, chala cho'l va cho'l",
      ],
      captions: ['Sharin kanyoni', "Ko'lsoy ko'li", "Bo'zjira (Mang'istov)", '«Kuylovchi barxan», Oltinemel', "Burabay ko'li"],
    },
    ru: {
      name: 'Казахстан',
      country: 'Государство · Средняя Азия и Восточная Европа',
      stats: [['Площадь', '2,72 млн км²'], ['Население', '~20 млн'], ['Столица', 'Астана'], ['Высшая точка', '6995 м']],
      text: 'Девятая по площади страна мира. Протянулась от Каспийского моря до Алтая: на севере — степи, в центре и на юге — полупустыни и пустыни, на юго-востоке — горы Тянь-Шаня.',
      facts: [
        'Крупнейшая в мире страна, не имеющая выхода к океану',
        'Высшая точка — пик Хан-Тенгри (6995 м), низшая — впадина Карагие (−132 м)',
        'С севера на юг сменяются природные зоны: лесостепь, степь, полупустыня и пустыня',
      ],
      captions: ['Чарынский каньон', 'Озеро Кольсай', 'Бозжыра (Мангистау)', '«Поющий бархан», Алтын-Эмель', 'Озеро Боровое (Бурабай)'],
    },
  },
  turkmenistan: {
    uz: {
      name: 'Turkmaniston',
      country: "Davlat · O'rta Osiyoning janubi-g'arbi",
      stats: [['Maydoni', '491,2 ming km²'], ['Aholisi', '~7 mln'], ['Poytaxti', 'Ashxobod'], ['Eng baland nuqtasi', '3139 m']],
      text: "Kaspiy dengizi bilan Amudaryo oralig'ida joylashgan. Hududining qariyb 80% ini Qoraqum cho'li egallaydi; janubida Ko'petdog' tizmasi, sharqiy chekkasida Ko'hitang tog'lari ko'tariladi.",
      facts: [
        "Qoraqum kanali (1100 km dan ortiq) Amudaryo suvini cho'l orqali Ashxobodgacha yetkazadi",
        "Eng baland nuqtasi — Ayribobo cho'qqisi (3139 m), eng past joyi — Oqchaqoya botig'i (−81 m)",
        "Tabiiy gaz zaxiralari bo'yicha dunyoda yetakchi davlatlardan biri",
      ],
      captions: ["Yangiqal'a kanyoni", 'Darvoza gaz krateri', 'Qoraqum barxanlari', "Ko'petdog' tog'lari", 'Qoraqum kanali'],
    },
    ru: {
      name: 'Туркменистан',
      country: 'Государство · юго-запад Средней Азии',
      stats: [['Площадь', '491,2 тыс. км²'], ['Население', '~7 млн'], ['Столица', 'Ашхабад'], ['Высшая точка', '3139 м']],
      text: 'Расположен между Каспийским морем и Амударьёй. Около 80% территории занимает пустыня Каракумы; на юге поднимается Копетдаг, на восточной окраине — горы Койтендаг.',
      facts: [
        'Каракумский канал (более 1100 км) несёт воду Амударьи через пустыню до Ашхабада',
        'Высшая точка — гора Айрибаба (3139 м), низшая — впадина Акчакая (−81 м)',
        'Одна из ведущих стран мира по запасам природного газа',
      ],
      captions: ['Каньон Янгикала', 'Газовый кратер Дарваза', 'Барханы Каракумов', 'Горы Копетдага', 'Каракумский канал'],
    },
  },
  kyrgyzstan: {
    uz: {
      name: "Qirg'iziston",
      country: "Davlat · Tyan-Shan tog'lari",
      stats: [['Maydoni', '199,9 ming km²'], ['Aholisi', '~7 mln'], ['Poytaxti', 'Bishkek'], ['Eng baland nuqtasi', '7439 m']],
      text: "Deyarli butunlay tog'lardan iborat mamlakat: Tyan-Shan va Pomir-Oloy tizmalari hududining to'rtdan uch qismidan ko'prog'ini egallaydi. Tizmalar orasida Issiqko'l, Chu, Talas va Farg'ona botiqlari joylashgan.",
      facts: [
        "Hududining 90% dan ortig'i dengiz sathidan 1000 m dan balandda",
        "Eng baland nuqtasi — Jengish-Chokusu (G'alaba cho'qqisi, 7439 m)",
        "Norin daryosidagi To'xtag'ul va boshqa GESlar mamlakat elektr energiyasining asosiy qismini beradi",
      ],
      captions: ["Sonko'l yaylovidagi o'tovlar", 'Ola-Archa darasi', "Yettio'g'iz qoyalari", "Sarichelak ko'li", 'Norin viloyati manzarasi'],
    },
    ru: {
      name: 'Кыргызстан',
      country: 'Государство · горы Тянь-Шаня',
      stats: [['Площадь', '199,9 тыс. км²'], ['Население', '~7 млн'], ['Столица', 'Бишкек'], ['Высшая точка', '7439 м']],
      text: 'Почти целиком горная страна: хребты Тянь-Шаня и Памиро-Алая занимают более трёх четвертей территории. Между хребтами лежат Иссык-Кульская, Чуйская, Таласская и Ферганская котловины.',
      facts: [
        'Более 90% территории лежит выше 1000 м над уровнем моря',
        'Высшая точка — пик Дженгиш-Чокусу (Победы, 7439 м)',
        'Токтогульская и другие ГЭС на Нарыне дают основную часть электроэнергии страны',
      ],
      captions: ['Юрты на джайлоо Сон-Куль', 'Ущелье Ала-Арча', 'Скалы Джети-Огуз', 'Озеро Сары-Челек', 'Пейзаж Нарынской области'],
    },
  },
  tajikistan: {
    uz: {
      name: 'Tojikiston',
      country: "Davlat · Pomir va Hisor-Oloy tog'lari",
      stats: [['Maydoni', '~142 ming km²'], ['Aholisi', '~10 mln'], ['Poytaxti', 'Dushanbe'], ['Eng baland nuqtasi', '7495 m']],
      text: "O'rta Osiyoning eng baland tog'li mamlakati: hududining 93% i tog'lar. Sharqida Pomir, markazida Hisor-Oloy tizmalari; shimolda Farg'ona vodiysining g'arbiy qismi, janubi-g'arbda issiq vodiylar joylashgan.",
      facts: [
        "Eng baland nuqtasi — Ismoil Somoniy cho'qqisi (7495 m)",
        "Pomirdagi Fedchenko muzligi (77 km) — qutb o'lkalaridan tashqaridagi eng uzun vodiy muzligi",
        "Vaxsh daryosidagi Norak to'g'oni (300 m) — dunyodagi eng baland to'g'onlardan biri",
      ],
      captions: ["Fon tog'laridagi ko'l", "Fon tog'lari", "Pomir: Langar–Murg'ob yo'li", "Qorako'l ko'li (Sharqiy Pomir)", 'Norak suv ombori'],
    },
    ru: {
      name: 'Таджикистан',
      country: 'Государство · горы Памира и Гиссаро-Алая',
      stats: [['Площадь', '~142 тыс. км²'], ['Население', '~10 млн'], ['Столица', 'Душанбе'], ['Высшая точка', '7495 м']],
      text: 'Самая высокогорная страна Средней Азии: 93% территории — горы. На востоке — Памир, в центре — хребты Гиссаро-Алая; на севере лежит западная часть Ферганской долины, на юго-западе — жаркие долины.',
      facts: [
        'Высшая точка — пик Исмоила Сомони (7495 м)',
        'Ледник Федченко на Памире (77 км) — самый длинный долинный ледник вне полярных областей',
        'Нурекская плотина на Вахше (300 м) — одна из высочайших плотин мира',
      ],
      captions: ['Озеро в Фанских горах', 'Фанские горы', 'Памир: дорога Лянгар — Мургаб', 'Озеро Каракуль (Восточный Памир)', 'Нурекское водохранилище'],
    },
  },
  afghanistan: {
    uz: {
      name: "Afg'oniston",
      country: "Davlat · Hindukush tog'lari",
      stats: [['Maydoni', '652,9 ming km²'], ['Aholisi', '~42 mln'], ['Poytaxti', 'Kobul'], ['Eng baland nuqtasi', '7492 m']],
      text: "Hindukush tog'lari mamlakatni shimoli-sharqdan janubi-g'arbga kesib o'tadi. Shimolida Amudaryo bo'yidagi tekisliklar, janubi va g'arbida cho'l va chala cho'llar (Registon, Dashti Margo) joylashgan.",
      facts: [
        "Shimoliy chegarasi Amudaryo va Panj bo'ylab o'tadi — Tojikiston, O'zbekiston va Turkmaniston bilan",
        "Tor Vaxon yo'lagi sharqda Xitoy chegarasigacha cho'zilgan",
        "Bandi Amir ko'llari — mamlakatning birinchi milliy bog'i (2009)",
      ],
      captions: ["Bandi Amir ko'llari", "Vaxon yo'lagi", "Hindukush tog'lari", 'Bomiyon vodiysi', 'Panjsher vodiysi'],
    },
    ru: {
      name: 'Афганистан',
      country: 'Государство · горы Гиндукуша',
      stats: [['Площадь', '652,9 тыс. км²'], ['Население', '~42 млн'], ['Столица', 'Кабул'], ['Высшая точка', '7492 м']],
      text: 'Гиндукуш пересекает страну с северо-востока на юго-запад. На севере — равнины вдоль Амударьи, на юге и западе — пустыни и полупустыни (Регистан, Дашти-Марго).',
      facts: [
        'Северная граница идёт по Амударье и Пянджу — с Таджикистаном, Узбекистаном и Туркменистаном',
        'Узкий Ваханский коридор тянется на восток до границы с Китаем',
        'Озёра Банде-Амир — первый национальный парк страны (2009)',
      ],
      captions: ['Озёра Банде-Амир', 'Ваханский коридор', 'Горы Гиндукуша', 'Бамианская долина', 'Панджшерская долина'],
    },
  },
  iran: {
    uz: {
      name: 'Eron',
      country: 'Davlat · Eron tog\'ligi',
      stats: [['Maydoni', '1,65 mln km²'], ['Aholisi', '~90 mln'], ['Poytaxti', 'Tehron'], ['Eng baland nuqtasi', '5609 m']],
      text: "Hududining katta qismi — Elburs va Zagros tog'lari bilan o'ralgan Eron tog'ligi. Ichki qismida Dashti Kavir va Dashti Lut cho'llari yotadi. Shimoli-sharqda Turkmaniston bilan chegarasi Ko'petdog' bo'ylab o'tadi.",
      facts: [
        "Eng baland nuqtasi — Damovand so'ngan vulqoni (5609 m)",
        "Dashti Lut — Yerdagi eng issiq joylardan biri: yer yuzasi 70 °C dan ortiq qiziydi",
        "Kaspiy bo'yidagi nam Girkan o'rmonlari YuNESKO merosi ro'yxatiga kiritilgan (2019)",
      ],
      captions: ['Damovand vulqoni', "Dashti Lut cho'li", 'Dashti Kavir barxanlari', "Elburs tog'lari", "Kaspiybo'yi Girkan o'rmonlari"],
    },
    ru: {
      name: 'Иран',
      country: 'Государство · Иранское нагорье',
      stats: [['Площадь', '1,65 млн км²'], ['Население', '~90 млн'], ['Столица', 'Тегеран'], ['Высшая точка', '5609 м']],
      text: 'Большую часть страны занимает Иранское нагорье, окаймлённое горами Эльбурс и Загрос. Во внутренних районах лежат пустыни Деште-Кевир и Деште-Лут. На северо-востоке граница с Туркменистаном идёт по Копетдагу.',
      facts: [
        'Высшая точка — потухший вулкан Демавенд (5609 м)',
        'Деште-Лут — одно из самых жарких мест на Земле: поверхность нагревается выше 70 °C',
        'Влажные Гирканские леса у Каспия включены в список наследия ЮНЕСКО (2019)',
      ],
      captions: ['Вулкан Демавенд', 'Пустыня Деште-Лут', 'Барханы Деште-Кевир', 'Горы Эльбурс', 'Гирканские леса у Каспия'],
    },
  },
  china: {
    uz: {
      name: 'Xitoy',
      country: "Davlat · Sharqiy va Markaziy Osiyo",
      stats: [['Maydoni', '~9,6 mln km²'], ['Aholisi', '~1,41 mlrd'], ['Poytaxti', 'Pekin'], ['Eng baland nuqtasi', '8849 m']],
      text: "Xaritada Xitoyning eng g'arbiy o'lkasi — Shinjon ko'rinadi. U Tyan-Shan tizmalari bilan ikkiga bo'lingan: shimolida Jung'oriya, janubida Taklamakon cho'li joylashgan Tarim botig'i. Qozog'iston, Qirg'iziston va Tojikiston bilan chegaradosh.",
      facts: [
        "Taklamakon — dunyodagi eng katta ko'chma qumli cho'llardan biri (~337 ming km²)",
        "Turfon botig'i dengiz sathidan 154 m pastda — Xitoyning eng past joyi",
        "Tarim (2179 km) — Xitoydagi okeanga yetib bormaydigan eng uzun daryo",
      ],
      captions: ["Taklamakon cho'li", "Qorako'l va Muztog'ota (Shinjon)", 'Markaziy Tyan-Shan', 'Tarim daryosi', "Turfon yaqinidagi «Olovli tog'lar»"],
    },
    ru: {
      name: 'Китай',
      country: 'Государство · Восточная и Центральная Азия',
      stats: [['Площадь', '~9,6 млн км²'], ['Население', '~1,41 млрд'], ['Столица', 'Пекин'], ['Высшая точка', '8849 м']],
      text: 'На карте виден самый западный край Китая — Синьцзян. Хребты Тянь-Шаня делят его надвое: на севере — Джунгария, на юге — Таримская впадина с пустыней Такла-Макан. Граничит с Казахстаном, Кыргызстаном и Таджикистаном.',
      facts: [
        'Такла-Макан — одна из крупнейших пустынь с подвижными песками (~337 тыс. км²)',
        'Турфанская впадина лежит на 154 м ниже уровня моря — самое низкое место Китая',
        'Тарим (2179 км) — самая длинная река Китая, не доходящая до океана',
      ],
      captions: ['Пустыня Такла-Макан', 'Озеро Каракуль и Музтагата (Синьцзян)', 'Центральный Тянь-Шань', 'Река Тарим', '«Огненные горы» близ Турфана'],
    },
  },
}
