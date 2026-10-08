(function ()
{
    'use strict';

    const translations = {
        en: {
            contentType: 'Content type', typeText: 'Text', typeEmail: 'Email', urlLabel: 'Website URL',
            textLabel: 'Your text', textPlaceholder: 'Write your message…', textHint: 'Share a message, note, or any plain text.',
            wifiSsid: 'Network name (SSID)', wifiSecurity: 'Security', wifiOpen: 'No password', wifiPassword: 'Network password',
            wifiHidden: 'Hidden network', wifiHint: 'Scan the QR to join this network.',
            emailAddress: 'Email address', emailSubject: 'Subject', emailBody: 'Message', emailHint: 'Scan to open an email draft with these details.',
            invalidUrl: 'Enter a valid website URL starting with https:// or http://.', invalidEmail: 'Enter a valid email address.',
            wifiSsidTooLong: 'The network name must be at most 32 UTF-8 bytes. Some characters use more than one byte.',
            wifiPasswordRequired: 'Enter the network password or select “No password” for an open network.',
            wifiPasswordTooLong: 'The network password must be at most 64 UTF-8 bytes.', wifiSecurityInvalid: 'Select a supported security type.',
            checkContent: 'Check your content',
            pageTitle: 'QR Code Generator · Axinomyus', companySite: 'Axinomyus website', brandBy: 'by Axinomyus',
            deviceOnly: 'Made on your device', language: 'Language', eyebrow: 'SMALL CODE. BIG POSSIBILITIES.',
            headline: 'Make a connection', intro: 'A link, a thought, an invitation. Make it scannable.',
            content: 'Your content', contentLabel: 'Link or text', required: 'Required',
            contentHint: 'Use a full https:// link to open a website.', customize: 'Make it yours', optional: 'Optional',
            title: 'Card title', caption: 'Short message', defaultTitle: 'A little scan.\nA new connection.',
            titlePlaceholder: 'A little scan. A new connection.', defaultCaption: "Scan to see what's next.",
            palette: 'QR palette', paletteLime: 'Lime', paletteClassic: 'Classic', paletteLavender: 'Lavender', paletteIce: 'Ice', paletteCustom: 'Custom',
            downloadSettings: 'Download settings', format: 'File format', formatPng: 'PNG · best for QR codes',
            formatJpeg: 'JPEG · smaller image', formatWebp: 'WebP · compact & flexible',
            transparent: 'Transparent background', transparencyHint: 'QR background only. Cards keep their design.',
            jpegHint: 'JPEG uses a solid background. Choose PNG or WebP for transparency.',
            watermark: 'Card watermark', watermarkHint: 'Add the Axinomyus signature to the card. QR-only downloads stay unbranded.',
            fineTune: 'Fine-tune your QR', size: 'QR size (px)', level: 'Error correction',
            levelL: 'Low · 7%', levelM: 'Balanced · 15%', levelQ: 'High · 25%', levelH: 'Highest · 30%',
            foreground: 'QR color', background: 'Background', foregroundAlpha: 'QR opacity', backgroundAlpha: 'Background opacity', padding: 'Extra margin (px)',
            marginHint: 'A safe border is always included. Keep colors contrasting for easy scanning.',
            lifetimeTitle: 'One QR. Unlimited possibilities.', lifetimeHint: 'No expiry. No scan limits. Always free.',
            livePreview: 'LIVE PREVIEW', waiting: 'Waiting for your content', ready: 'Ready to share', cardPreview: 'Your QR card preview',
            scanConnect: 'SCAN & CONNECT', qrImage: 'Generated QR code', emptyTitle: 'Your QR goes here', emptyHint: 'Add a link or text to get started.',
            noExpiry: 'No expiry', madeToShare: 'Made to be shared', textInside: 'Text inside', downloadQr: 'Download QR only', saveCard: 'Download card',
            plainQrHint: 'QR only: a square image for business cards and print, without the card design or watermark.',
            privacy: 'Your content stays in your browser', companyLinks: 'Axinomyus links', product: 'Product page', github: 'Code on GitHub',
            invalidNumber: '{field}: use a value from {min} to {max} in steps of {step}.',
            marginError: 'Reduce the extra margin or increase the QR size to leave enough room for your QR.',
            contrastError: 'Choose a darker QR color, a lighter background, or a higher QR opacity for a readable code.',
            checkSettings: 'Check your settings', exportDetails: '{format} · QR image {width} × {height} px',
            contentTooLong: 'This content is too long ({bytes} bytes). Use up to {capacity} bytes or choose a lower error correction level.',
            shorten: 'Shorten your content', generationError: 'Your QR could not be generated. Check the content and settings, then try again.',
            generationFailed: 'Unable to generate', preparing: 'Preparing your {format}…',
            downloadReady: 'Your {format} is ready. Check your browser downloads.', exportError: 'The image could not be created. Try a smaller size or choose PNG.'
        },
        tr: {
            contentType: 'İçerik türü', typeText: 'Metin', typeEmail: 'E-posta', urlLabel: 'Web sitesi bağlantısı',
            textLabel: 'Metnin', textPlaceholder: 'Mesajını yaz…', textHint: 'Bir mesajı, notu veya düz metni paylaş.',
            wifiSsid: 'Ağ adı (SSID)', wifiSecurity: 'Güvenlik', wifiOpen: 'Şifresiz', wifiPassword: 'Ağ şifresi',
            wifiHidden: 'Gizli ağ', wifiHint: 'Bu ağa katılmak için QR kodunu okut.',
            emailAddress: 'E-posta adresi', emailSubject: 'Konu', emailBody: 'Mesaj', emailHint: 'Bu bilgilerle e-posta taslağı açmak için okut.',
            invalidUrl: 'https:// veya http:// ile başlayan geçerli bir web sitesi bağlantısı gir.', invalidEmail: 'Geçerli bir e-posta adresi gir.',
            wifiSsidTooLong: 'Ağ adı en fazla 32 UTF-8 bayt olabilir. Bazı karakterler birden fazla bayt kullanır.',
            wifiPasswordRequired: 'Ağ şifresini gir veya açık ağ için “Şifresiz” seç.',
            wifiPasswordTooLong: 'Ağ şifresi en fazla 64 UTF-8 bayt olabilir.', wifiSecurityInvalid: 'Desteklenen bir güvenlik türü seç.',
            checkContent: 'İçeriğini kontrol et',
            pageTitle: 'QR Kod Oluşturucu · Axinomyus', companySite: 'Axinomyus web sitesi', brandBy: 'Axinomyus tarafından',
            deviceOnly: 'Cihazında oluşturulur', language: 'Dil', eyebrow: 'KÜÇÜK BİR KOD. BÜYÜK OLASILIKLAR.',
            headline: 'Bir bağlantı kur', intro: 'Bir bağlantı, bir düşünce, bir davet. QR koda dönüştür.',
            content: 'İçeriğin', contentLabel: 'Bağlantı veya metin', required: 'Zorunlu',
            contentHint: 'Bir siteyi açmak için https:// ile başlayan tam bağlantıyı yaz.', customize: 'Kişiselleştir', optional: 'İsteğe bağlı',
            title: 'Kart başlığı', caption: 'Kısa mesaj', defaultTitle: 'Küçük bir tarama.\nYeni bir bağlantı.',
            titlePlaceholder: 'Küçük bir tarama. Yeni bir bağlantı.', defaultCaption: 'Sırada ne var? Okut ve keşfet.',
            palette: 'QR renkleri', paletteLime: 'Limon', paletteClassic: 'Klasik', paletteLavender: 'Lavanta', paletteIce: 'Buz', paletteCustom: 'Özel',
            downloadSettings: 'İndirme ayarları', format: 'Dosya biçimi', formatPng: 'PNG · QR kodlar için ideal',
            formatJpeg: 'JPEG · daha küçük görsel', formatWebp: 'WebP · kompakt ve esnek',
            transparent: 'Şeffaf arka plan', transparencyHint: 'Yalnızca QR arka planı. Kartın tasarımı korunur.',
            jpegHint: 'JPEG düz renk arka plan kullanır. Şeffaflık için PNG veya WebP seç.',
            watermark: 'Kart filigranı', watermarkHint: 'Karta Axinomyus imzasını ekle. Yalnızca QR indirmeleri filigran içermez.',
            fineTune: 'QR ince ayarları', size: 'QR boyutu (px)', level: 'Hata düzeltme',
            levelL: 'Düşük · %7', levelM: 'Dengeli · %15', levelQ: 'Yüksek · %25', levelH: 'En yüksek · %30',
            foreground: 'QR rengi', background: 'Arka plan', foregroundAlpha: 'QR opaklığı', backgroundAlpha: 'Arka plan opaklığı', padding: 'Ek kenar boşluğu (px)',
            marginHint: 'Güvenli kenar boşluğu her zaman eklenir. Kolay okuma için zıt renkler seç.',
            lifetimeTitle: 'Tek QR. Sınırsız olasılık.', lifetimeHint: 'Süre sınırı yok. Okutma sınırı yok. Her zaman ücretsiz.',
            livePreview: 'CANLI ÖNİZLEME', waiting: 'İçeriğin bekleniyor', ready: 'Paylaşmaya hazır', cardPreview: 'QR kartının önizlemesi',
            scanConnect: 'OKUT VE BAĞLAN', qrImage: 'Oluşturulan QR kod', emptyTitle: 'QR kodun burada görünecek', emptyHint: 'Başlamak için bağlantı veya metin ekle.',
            noExpiry: 'Süresiz', madeToShare: 'Paylaşmak için hazır', textInside: 'Metin içerir', downloadQr: 'Yalnızca QR indir', saveCard: 'Kartı indir',
            plainQrHint: 'Yalnızca QR: kartvizit ve baskı için, kart tasarımı veya filigran içermeyen kare görsel.',
            privacy: 'İçeriğin tarayıcında kalır', companyLinks: 'Axinomyus bağlantıları', product: 'Ürün sayfası', github: 'GitHub kaynak kodu',
            invalidNumber: '{field}: {min} ile {max} arasında, {step} adımlı bir değer gir.',
            marginError: 'QR koduna yer açmak için ek kenar boşluğunu azalt veya QR boyutunu artır.',
            contrastError: 'Okunabilir bir kod için daha koyu QR rengi, daha açık arka plan veya daha yüksek QR opaklığı seç.',
            checkSettings: 'Ayarlarını kontrol et', exportDetails: '{format} · QR görseli {width} × {height} px',
            contentTooLong: 'Bu içerik çok uzun ({bytes} bayt). En fazla {capacity} bayt kullan veya hata düzeltme düzeyini düşür.',
            shorten: 'İçeriğini kısalt', generationError: 'QR oluşturulamadı. İçeriği ve ayarları kontrol edip tekrar dene.',
            generationFailed: 'Oluşturulamadı', preparing: '{format} hazırlanıyor…',
            downloadReady: '{format} hazır. Tarayıcının indirilenler bölümünü kontrol et.', exportError: 'Görsel oluşturulamadı. Daha küçük bir boyut veya PNG seç.'
        },
        ru: {
            contentType: 'Тип содержимого', typeText: 'Текст', typeEmail: 'Почта', urlLabel: 'Адрес сайта',
            textLabel: 'Твой текст', textPlaceholder: 'Напиши сообщение…', textHint: 'Поделись сообщением, заметкой или обычным текстом.',
            wifiSsid: 'Имя сети (SSID)', wifiSecurity: 'Защита', wifiOpen: 'Без пароля', wifiPassword: 'Пароль сети',
            wifiHidden: 'Скрытая сеть', wifiHint: 'Отсканируй QR, чтобы подключиться к этой сети.',
            emailAddress: 'Адрес электронной почты', emailSubject: 'Тема', emailBody: 'Сообщение', emailHint: 'Отсканируй, чтобы открыть черновик письма с этими данными.',
            invalidUrl: 'Укажи корректный адрес сайта, начинающийся с https:// или http://.', invalidEmail: 'Укажи корректный адрес электронной почты.',
            wifiSsidTooLong: 'Имя сети должно занимать не более 32 байт UTF-8. Некоторые символы занимают несколько байт.',
            wifiPasswordRequired: 'Укажи пароль сети или выбери «Без пароля» для открытой сети.',
            wifiPasswordTooLong: 'Пароль сети должен занимать не более 64 байт UTF-8.', wifiSecurityInvalid: 'Выбери поддерживаемый тип защиты.',
            checkContent: 'Проверь содержимое',
            pageTitle: 'Генератор QR-кодов · Axinomyus', companySite: 'Сайт Axinomyus', brandBy: 'от Axinomyus',
            deviceOnly: 'Создаётся на устройстве', language: 'Язык', eyebrow: 'МАЛЕНЬКИЙ КОД. БОЛЬШИЕ ВОЗМОЖНОСТИ.',
            headline: 'Создавай связи', intro: 'Ссылка, мысль, приглашение. Преврати их в QR-код.',
            content: 'Твой контент', contentLabel: 'Ссылка или текст', required: 'Обязательно',
            contentHint: 'Чтобы открыть сайт, укажи полную ссылку с https://.', customize: 'Добавь свой стиль', optional: 'Необязательно',
            title: 'Заголовок карточки', caption: 'Короткое сообщение', defaultTitle: 'Одно сканирование.\nНовая связь.',
            titlePlaceholder: 'Одно сканирование. Новая связь.', defaultCaption: 'Отсканируй и узнай, что дальше.',
            palette: 'Цвета QR', paletteLime: 'Лайм', paletteClassic: 'Классика', paletteLavender: 'Лаванда', paletteIce: 'Лёд', paletteCustom: 'Свои',
            downloadSettings: 'Настройки скачивания', format: 'Формат файла', formatPng: 'PNG · оптимально для QR-кодов',
            formatJpeg: 'JPEG · меньший размер', formatWebp: 'WebP · компактный и гибкий',
            transparent: 'Прозрачный фон', transparencyHint: 'Только фон QR. Дизайн карточки сохраняется.',
            jpegHint: 'JPEG использует непрозрачный фон. Для прозрачности выбери PNG или WebP.',
            watermark: 'Водяной знак на карточке', watermarkHint: 'Добавить подпись Axinomyus на карточку. Отдельный QR скачивается без водяного знака.',
            fineTune: 'Точные настройки QR', size: 'Размер QR (px)', level: 'Коррекция ошибок',
            levelL: 'Низкая · 7%', levelM: 'Средняя · 15%', levelQ: 'Высокая · 25%', levelH: 'Максимальная · 30%',
            foreground: 'Цвет QR', background: 'Фон', foregroundAlpha: 'Непрозрачность QR', backgroundAlpha: 'Непрозрачность фона', padding: 'Дополнительное поле (px)',
            marginHint: 'Защитное поле добавляется всегда. Выбирай контрастные цвета для удобного сканирования.',
            lifetimeTitle: 'Один QR. Безграничные возможности.', lifetimeHint: 'Без срока действия. Без лимита сканирований. Бесплатно.',
            livePreview: 'ПРЕДПРОСМОТР', waiting: 'Добавь контент', ready: 'Можно делиться', cardPreview: 'Предпросмотр QR-карточки',
            scanConnect: 'СКАНИРУЙ И ПОДКЛЮЧАЙСЯ', qrImage: 'Созданный QR-код', emptyTitle: 'Здесь появится твой QR', emptyHint: 'Добавь ссылку или текст, чтобы начать.',
            noExpiry: 'Бессрочно', madeToShare: 'Чтобы делиться', textInside: 'Содержит текст', downloadQr: 'Скачать только QR', saveCard: 'Скачать карточку',
            plainQrHint: 'Только QR: квадратное изображение для визиток и печати, без оформления карточки и водяного знака.',
            privacy: 'Твой контент остаётся в браузере', companyLinks: 'Ссылки Axinomyus', product: 'Страница продукта', github: 'Код на GitHub',
            invalidNumber: '{field}: укажи значение от {min} до {max} с шагом {step}.',
            marginError: 'Уменьши дополнительное поле или увеличь размер QR, чтобы коду хватило места.',
            contrastError: 'Для читаемого кода выбери более тёмный цвет QR, светлый фон или увеличь непрозрачность QR.',
            checkSettings: 'Проверь настройки', exportDetails: '{format} · QR-изображение {width} × {height} px',
            contentTooLong: 'Контент слишком длинный ({bytes} байт). Используй не более {capacity} байт или снизь уровень коррекции ошибок.',
            shorten: 'Сократи контент', generationError: 'Не удалось создать QR. Проверь контент и настройки и попробуй снова.',
            generationFailed: 'Не удалось создать', preparing: 'Подготовка {format}…',
            downloadReady: '{format} готов. Проверь загрузки браузера.', exportError: 'Не удалось создать изображение. Уменьши размер или выбери PNG.'
        },
        uk: {
            contentType: 'Тип вмісту', typeText: 'Текст', typeEmail: 'Пошта', urlLabel: 'Адреса сайту',
            textLabel: 'Твій текст', textPlaceholder: 'Напиши повідомлення…', textHint: 'Поділися повідомленням, нотаткою або звичайним текстом.',
            wifiSsid: 'Назва мережі (SSID)', wifiSecurity: 'Захист', wifiOpen: 'Без пароля', wifiPassword: 'Пароль мережі',
            wifiHidden: 'Прихована мережа', wifiHint: 'Відскануй QR, щоб приєднатися до цієї мережі.',
            emailAddress: 'Адреса електронної пошти', emailSubject: 'Тема', emailBody: 'Повідомлення', emailHint: 'Відскануй, щоб відкрити чернетку листа з цими даними.',
            invalidUrl: 'Вкажи коректну адресу сайту, що починається з https:// або http://.', invalidEmail: 'Вкажи коректну адресу електронної пошти.',
            wifiSsidTooLong: 'Назва мережі має займати не більше 32 байтів UTF-8. Деякі символи займають кілька байтів.',
            wifiPasswordRequired: 'Вкажи пароль мережі або вибери «Без пароля» для відкритої мережі.',
            wifiPasswordTooLong: 'Пароль мережі має займати не більше 64 байтів UTF-8.', wifiSecurityInvalid: 'Вибери підтримуваний тип захисту.',
            checkContent: 'Перевір вміст',
            pageTitle: 'Генератор QR-кодів · Axinomyus', companySite: 'Сайт Axinomyus', brandBy: 'від Axinomyus',
            deviceOnly: 'Створюється на пристрої', language: 'Мова', eyebrow: 'МАЛЕНЬКИЙ КОД. ВЕЛИКІ МОЖЛИВОСТІ.',
            headline: 'Створюй зв’язки', intro: 'Посилання, думка, запрошення. Перетвори їх на QR-код.',
            content: 'Твій вміст', contentLabel: 'Посилання або текст', required: 'Обов’язково',
            contentHint: 'Щоб відкрити сайт, вкажи повне посилання з https://.', customize: 'Додай свій стиль', optional: 'Необов’язково',
            title: 'Заголовок картки', caption: 'Коротке повідомлення', defaultTitle: 'Одне сканування.\nНовий зв’язок.',
            titlePlaceholder: 'Одне сканування. Новий зв’язок.', defaultCaption: 'Відскануй і дізнайся, що далі.',
            palette: 'Кольори QR', paletteLime: 'Лайм', paletteClassic: 'Класика', paletteLavender: 'Лаванда', paletteIce: 'Лід', paletteCustom: 'Власні',
            downloadSettings: 'Налаштування завантаження', format: 'Формат файлу', formatPng: 'PNG · найкраще для QR-кодів',
            formatJpeg: 'JPEG · менший розмір', formatWebp: 'WebP · компактний і гнучкий',
            transparent: 'Прозоре тло', transparencyHint: 'Лише тло QR. Дизайн картки зберігається.',
            jpegHint: 'JPEG використовує непрозоре тло. Для прозорості вибери PNG або WebP.',
            watermark: 'Водяний знак на картці', watermarkHint: 'Додати підпис Axinomyus на картку. Окремий QR завантажується без водяного знака.',
            fineTune: 'Точні налаштування QR', size: 'Розмір QR (px)', level: 'Корекція помилок',
            levelL: 'Низька · 7%', levelM: 'Середня · 15%', levelQ: 'Висока · 25%', levelH: 'Максимальна · 30%',
            foreground: 'Колір QR', background: 'Тло', foregroundAlpha: 'Непрозорість QR', backgroundAlpha: 'Непрозорість тла', padding: 'Додаткове поле (px)',
            marginHint: 'Захисне поле додається завжди. Вибирай контрастні кольори для зручного сканування.',
            lifetimeTitle: 'Один QR. Безмежні можливості.', lifetimeHint: 'Без терміну дії. Без ліміту сканувань. Безкоштовно.',
            livePreview: 'ПЕРЕДПЕРЕГЛЯД', waiting: 'Додай вміст', ready: 'Можна ділитися', cardPreview: 'Попередній перегляд QR-картки',
            scanConnect: 'СКАНУЙ І ПІДКЛЮЧАЙСЯ', qrImage: 'Створений QR-код', emptyTitle: 'Тут з’явиться твій QR', emptyHint: 'Додай посилання або текст, щоб почати.',
            noExpiry: 'Безстроково', madeToShare: 'Щоб ділитися', textInside: 'Містить текст', downloadQr: 'Завантажити лише QR', saveCard: 'Завантажити картку',
            plainQrHint: 'Лише QR: квадратне зображення для візиток і друку, без оформлення картки й водяного знака.',
            privacy: 'Твій вміст залишається у браузері', companyLinks: 'Посилання Axinomyus', product: 'Сторінка продукту', github: 'Код на GitHub',
            invalidNumber: '{field}: вкажи значення від {min} до {max} із кроком {step}.',
            marginError: 'Зменш додаткове поле або збільш розмір QR, щоб коду вистачило місця.',
            contrastError: 'Для читабельного коду вибери темніший колір QR, світліше тло або збільш непрозорість QR.',
            checkSettings: 'Перевір налаштування', exportDetails: '{format} · QR-зображення {width} × {height} px',
            contentTooLong: 'Вміст задовгий ({bytes} байт). Використай не більше {capacity} байт або знизь рівень корекції помилок.',
            shorten: 'Скороти вміст', generationError: 'Не вдалося створити QR. Перевір вміст і налаштування та спробуй знову.',
            generationFailed: 'Не вдалося створити', preparing: 'Підготовка {format}…',
            downloadReady: '{format} готовий. Перевір завантаження браузера.', exportError: 'Не вдалося створити зображення. Зменш розмір або вибери PNG.'
        },
        de: {
            contentType: 'Inhaltstyp', typeText: 'Text', typeEmail: 'E-Mail', urlLabel: 'Website-URL',
            textLabel: 'Dein Text', textPlaceholder: 'Schreibe deine Nachricht…', textHint: 'Teile eine Nachricht, Notiz oder einfachen Text.',
            wifiSsid: 'Netzwerkname (SSID)', wifiSecurity: 'Sicherheit', wifiOpen: 'Ohne Passwort', wifiPassword: 'Netzwerkpasswort',
            wifiHidden: 'Verstecktes Netzwerk', wifiHint: 'Scanne den QR-Code, um diesem Netzwerk beizutreten.',
            emailAddress: 'E-Mail-Adresse', emailSubject: 'Betreff', emailBody: 'Nachricht', emailHint: 'Scannen, um einen E-Mail-Entwurf mit diesen Angaben zu öffnen.',
            invalidUrl: 'Gib eine gültige Website-URL mit https:// oder http:// ein.', invalidEmail: 'Gib eine gültige E-Mail-Adresse ein.',
            wifiSsidTooLong: 'Der Netzwerkname darf höchstens 32 UTF-8-Bytes lang sein. Manche Zeichen belegen mehrere Bytes.',
            wifiPasswordRequired: 'Gib das Netzwerkpasswort ein oder wähle „Ohne Passwort“ für ein offenes Netzwerk.',
            wifiPasswordTooLong: 'Das Netzwerkpasswort darf höchstens 64 UTF-8-Bytes lang sein.', wifiSecurityInvalid: 'Wähle einen unterstützten Sicherheitstyp.',
            checkContent: 'Prüfe deinen Inhalt',
            pageTitle: 'QR-Code-Generator · Axinomyus', companySite: 'Axinomyus-Website', brandBy: 'von Axinomyus',
            deviceOnly: 'Auf deinem Gerät erstellt', language: 'Sprache', eyebrow: 'KLEINER CODE. GROSSE MÖGLICHKEITEN.',
            headline: 'Schaffe Verbindungen', intro: 'Ein Link, ein Gedanke, eine Einladung. Mach sie scannbar.',
            content: 'Dein Inhalt', contentLabel: 'Link oder Text', required: 'Erforderlich',
            contentHint: 'Nutze einen vollständigen https://-Link, um eine Website zu öffnen.', customize: 'Dein eigener Stil', optional: 'Optional',
            title: 'Kartentitel', caption: 'Kurze Nachricht', defaultTitle: 'Ein kleiner Scan.\nEine neue Verbindung.',
            titlePlaceholder: 'Ein kleiner Scan. Eine neue Verbindung.', defaultCaption: 'Scannen und Neues entdecken.',
            palette: 'QR-Farben', paletteLime: 'Limette', paletteClassic: 'Klassisch', paletteLavender: 'Lavendel', paletteIce: 'Eis', paletteCustom: 'Eigene',
            downloadSettings: 'Download-Einstellungen', format: 'Dateiformat', formatPng: 'PNG · ideal für QR-Codes',
            formatJpeg: 'JPEG · kleinere Bilddatei', formatWebp: 'WebP · kompakt und flexibel',
            transparent: 'Transparenter Hintergrund', transparencyHint: 'Nur der QR-Hintergrund. Das Kartendesign bleibt erhalten.',
            jpegHint: 'JPEG hat einen deckenden Hintergrund. Für Transparenz wähle PNG oder WebP.',
            watermark: 'Wasserzeichen auf der Karte', watermarkHint: 'Axinomyus-Signatur auf der Karte anzeigen. Der reine QR-Code bleibt ohne Wasserzeichen.',
            fineTune: 'QR-Einstellungen', size: 'QR-Größe (px)', level: 'Fehlerkorrektur',
            levelL: 'Niedrig · 7%', levelM: 'Ausgewogen · 15%', levelQ: 'Hoch · 25%', levelH: 'Maximal · 30%',
            foreground: 'QR-Farbe', background: 'Hintergrund', foregroundAlpha: 'QR-Deckkraft', backgroundAlpha: 'Hintergrunddeckkraft', padding: 'Zusätzlicher Rand (px)',
            marginHint: 'Ein Sicherheitsrand ist immer enthalten. Wähle kontrastreiche Farben für einfaches Scannen.',
            lifetimeTitle: 'Ein QR. Unbegrenzte Möglichkeiten.', lifetimeHint: 'Kein Ablaufdatum. Unbegrenzte Scans. Immer kostenlos.',
            livePreview: 'LIVE-VORSCHAU', waiting: 'Füge deinen Inhalt hinzu', ready: 'Bereit zum Teilen', cardPreview: 'Vorschau deiner QR-Karte',
            scanConnect: 'SCANNEN & VERBINDEN', qrImage: 'Erstellter QR-Code', emptyTitle: 'Hier erscheint dein QR', emptyHint: 'Füge einen Link oder Text hinzu.',
            noExpiry: 'Unbefristet', madeToShare: 'Zum Teilen gemacht', textInside: 'Enthält Text', downloadQr: 'Nur QR herunterladen', saveCard: 'Karte herunterladen',
            plainQrHint: 'Nur QR: ein quadratisches Bild für Visitenkarten und Druck, ohne Kartendesign oder Wasserzeichen.',
            privacy: 'Dein Inhalt bleibt in deinem Browser', companyLinks: 'Axinomyus-Links', product: 'Produktseite', github: 'Code auf GitHub',
            invalidNumber: '{field}: Wähle einen Wert von {min} bis {max} in Schritten von {step}.',
            marginError: 'Verringere den zusätzlichen Rand oder erhöhe die QR-Größe, damit genug Platz für den Code bleibt.',
            contrastError: 'Wähle eine dunklere QR-Farbe, einen helleren Hintergrund oder eine höhere QR-Deckkraft für einen lesbaren Code.',
            checkSettings: 'Prüfe deine Einstellungen', exportDetails: '{format} · QR-Bild {width} × {height} px',
            contentTooLong: 'Dieser Inhalt ist zu lang ({bytes} Bytes). Nutze höchstens {capacity} Bytes oder eine niedrigere Fehlerkorrektur.',
            shorten: 'Kürze deinen Inhalt', generationError: 'Der QR konnte nicht erstellt werden. Prüfe Inhalt und Einstellungen und versuche es erneut.',
            generationFailed: 'Erstellung fehlgeschlagen', preparing: '{format} wird vorbereitet…',
            downloadReady: 'Dein {format} ist bereit. Prüfe die Downloads deines Browsers.', exportError: 'Das Bild konnte nicht erstellt werden. Wähle eine kleinere Größe oder PNG.'
        }
    };

    const storageKey = 'qr-studio-language';
    let language     = 'en';

    function getInitialLanguage()
    {
        try
        {
            const savedLanguage = localStorage.getItem(storageKey);

            if (Object.hasOwn(translations, savedLanguage))
            {
                return savedLanguage;
            }
        }
        catch (error)
        {
            console.warn('The saved language could not be read; using the browser language.', error);
        }

        for (const preferredLanguage of navigator.languages)
        {
            const supportedLanguage = preferredLanguage.toLowerCase().split('-')[0];

            if (Object.hasOwn(translations, supportedLanguage))
            {
                return supportedLanguage;
            }
        }

        return 'en';
    }

    function translate(key, parameters = {})
    {
        const text = translations[language][key] || translations.en[key];

        if (!text)
        {
            throw new Error('Missing translation: ' + key);
        }

        return text.replace(/\{(\w+)\}/g, function (match, name)
        {
            if (Object.hasOwn(parameters, name))
            {
                return String(parameters[name]);
            }

            return match;
        });
    }

    function applyLanguage()
    {
        document.documentElement.lang = language;
        document.title                = translate('pageTitle');

        for (const element of document.querySelectorAll('[data-i18n]'))
        {
            element.textContent = translate(element.dataset.i18n);
        }

        for (const element of document.querySelectorAll('[data-i18n-placeholder]'))
        {
            element.setAttribute('placeholder', translate(element.dataset.i18nPlaceholder));
        }

        for (const element of document.querySelectorAll('[data-i18n-aria]'))
        {
            element.setAttribute('aria-label', translate(element.dataset.i18nAria));
        }

        document.getElementById('language').value = language;
    }

    document.getElementById('language').addEventListener('change', function (event)
    {
        if (!Object.hasOwn(translations, event.target.value))
        {
            return;
        }

        language = event.target.value;
        applyLanguage();

        try
        {
            localStorage.setItem(storageKey, language);
        }
        catch (error)
        {
            console.warn('Language changed for this session, but the preference could not be saved.', error);
        }

        document.dispatchEvent(new Event('languagechange'));
    });

    language      = getInitialLanguage();
    window.QrI18n = Object.freeze({ translate: translate });
    applyLanguage();
})();
