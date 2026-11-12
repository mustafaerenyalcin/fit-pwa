import { useState, useEffect, useCallback } from 'react';

const LANG_KEY = 'fit-lang-v1';

export const LANGUAGES = [
  { code: 'tr', flag: '🇹🇷', short: 'TR', name: 'Türkçe', speechLang: 'tr-TR', locale: 'tr-TR' },
  { code: 'en', flag: '🇬🇧', short: 'EN', name: 'English', speechLang: 'en-US', locale: 'en-US' },
  { code: 'de', flag: '🇩🇪', short: 'DE', name: 'Deutsch', speechLang: 'de-DE', locale: 'de-DE' },
  { code: 'es', flag: '🇪🇸', short: 'ES', name: 'Español', speechLang: 'es-ES', locale: 'es-ES' }
];

const DICT = {
  tr: {
    // Nav & Layout
    'nav.today': 'Ana Sayfa',
    'nav.training': 'Antrenman',
    'nav.nutrition': 'Beslenme',
    'nav.tools': 'Araçlar',
    'nav.progress': 'Gelişim',
    'nav.coach': 'Koç',
    'nav.settings': 'Ayarlar',
    'header.today': 'Bugün',
    'header.prevDay': 'Önceki gün',
    'header.nextDay': 'Sonraki gün',
    'header.backToday': 'Bugüne dön →',
    'header.online': 'Çevrimiçi — veriler bulutla eşitleniyor',
    'header.offline': 'Çevrimdışı — yerel çalışıyor',
    'header.themeLight': 'Açık temaya geç',
    'header.themeDark': 'Koyu temaya geç',

    // Sub-tabs
    'sub.program': 'Program',
    'sub.week': 'Haftalık Takvim',
    'sub.report': 'Haftalık Rapor',
    'sub.body': 'Ölçümler & Değişim',
    'sub.habits': 'Alışkanlıklar & Bildirim',

    // AuthScreen
    'auth.badge': 'FIT AI · PRO KOÇLUK PLATFORMU v4.0 GLOBAL',
    'auth.heroTitle1': 'Vücudunu şansa değil,',
    'auth.heroTitle2': 'yapay zeka bilimine',
    'auth.heroTitle3': 'emanet et.',
    'auth.heroSub': 'Sıradan bir kalori sayacı değil. Uyku, kas ağrısı ve ekipmanına göre her sabah antrenmanını yeniden yazan, yediğin yemeği fotoğrafından tanıyan kişisel performans laboratuvarın.',
    'auth.tabCheckin': '⚡ Sabah AI Check-in',
    'auth.tabMeal': '🍲 AI Mutfak Analizi',
    'auth.tabMuscle': '🧬 Kas & Adonis Analizi',
    'auth.stat1Val': '1.618',
    'auth.stat1Lbl': 'Adonis Altın Oran & FFMI',
    'auth.stat2Val': '%100',
    'auth.stat2Lbl': 'İzole & Şifreli Bulut',
    'auth.stat3Val': '7/24',
    'auth.stat3Lbl': 'Canlı AI Performans Koçu',
    'auth.loginTab': 'Giriş Yap',
    'auth.signupTab': 'Ücretsiz Kayıt Ol',
    'auth.welcomeBack': 'Tekrar Hoş Geldin',
    'auth.createAccount': 'Pro Hesabını Oluştur',
    'auth.forgotTitle': 'Şifreni Sıfırla',
    'auth.loginSub': 'Kaldığın yerden antrenman ve makro takibine devam et.',
    'auth.signupSub': '30 saniyede kişisel AI koçunu ve bulut profilini başlat.',
    'auth.instantSavedTitle': 'Kayıtlı Profilinle Anında Devam Et',
    'auth.instantNewTitle': 'Şifresiz Hızlı Başlangıç (Anında Giriş)',
    'auth.instantSavedSub': 'Bu cihazdaki tüm verilerin hazır, tek tıkla aç.',
    'auth.instantNewSub': 'E-posta onayı beklemeden uygulamayı hemen şimdi kullanmaya başla.',
    'auth.email': 'E-posta Adresi',
    'auth.password': 'Şifre',
    'auth.name': 'Adın veya Hitap Şeklin',
    'auth.forgotLink': 'Şifremi unuttum',
    'auth.submitLogin': 'Hesabıma Giriş Yap',
    'auth.submitSignup': 'Hesabımı Oluştur ve Başla',
    'auth.submitForgot': 'Sıfırlama Bağlantısı Gönder',

    // TodayView
    'today.greetNight': 'İyi geceler',
    'today.greetMorning': 'Günaydın',
    'today.greetDay': 'İyi günler',
    'today.greetEvening': 'İyi akşamlar',
    'today.champ': 'Şampiyon',
    'today.remSub': 'Hedefe {pro}g protein ve {cal} kcal kaldı',
    'today.doneSub': 'Günlük protein hedefin tamamlandı, harika gidiyorsun!',
    'today.askCoach': 'AI Koça Sor',
    'today.thisWeek': 'Bu hafta',
    'today.workoutLabel': 'antrenman',
    'today.waterLabel': 'su',
    'today.quickMealTitle': '1-Tık Hızlı Beslenme',
    'today.aiCamera': 'AI Kamera',
    'today.logMeal': 'Öğün Yaz',
    'today.workoutDone': 'Antrenman Tamamlandı',
    'today.restDay': 'Aktif Dinlenme & Mobilite Günü',
    'today.scheduledWorkout': 'Günün Programlı Antrenmanı',
    'today.startWorkout': 'Antrenmana Başla',
    'today.openProgram': 'Tüm haftalık programı ve özel rutinleri aç',

    // StreakBar
    'streak.dayStreak': 'Gün Seri',
    'streak.best': 'En iyi',
    'streak.days': 'gün',
    'streak.level': 'Seviye',
    'streak.badges': 'Kazanılan Başarı Rozetleri',

    // DailyCheckin
    'checkin.title': 'Günlük AI Check-in',
    'checkin.subtitle': '4 hızlı soru → bugüne özel antrenman ve öğün uyarlaması',
    'checkin.startBtn': 'Günü Planla',
    'checkin.Generating': 'AI koçun bugünkü planını hazırlıyor…',
    'checkin.startAdapted': 'Bu antrenmanı başlat',
    'checkin.mealsToday': 'Bugün için öğün fikirleri',

    // AiMealLogger
    'meal.title': 'Ne yedin? (Yaz, Konuş veya Çek)',
    'meal.subtitle': 'Sesle anlat, yaz ya da tabağının fotoğrafını çek; makroları AI hesaplasın.',
    'meal.placeholder': 'Örn: 200g ızgara tavuk, yarım tabak pilav ve salata',
    'meal.listening': 'Dinleniyor… Yediğin öğünü söyleyebilirsin.',
    'meal.voiceBtn': 'Sesle Anlat',
    'meal.stopVoice': 'Durdur',
    'meal.photoBtn': 'Fotoğraf',
    'meal.calcBtn': 'Hesapla',
    'meal.analyzing': 'Analiz ediliyor…',
    'meal.confirmTitle': 'Bunu mu yedin?',
    'meal.confirmSub': 'Değerleri kontrol et, gerekirse düzelt ve kaydet.',
    'meal.saveBtn': 'Kaydet',

    // FastingTimer
    'fasting.title': 'Aralıklı Oruç (Intermittent Fasting) & Otofaji Saati',
    'fasting.subtitle': 'İnsülin kontrolü, yağ yakım fazı ve hücresel yenilenme takibi',
    'fasting.startNow': 'Orucu Şimdi Başlat',
    'fasting.started2hAgo': '2 Saat Önce Yedim',
    'fasting.plus1h': '+1 Saat Önce Başladım',
    'fasting.stopBtn': 'Orucu Bitir (Yeme Penceresi)',

    // StrengthOverload
    'overload.title': '1RM Güç & Progressive Overload Motoru',
    'overload.subtitle': 'Epley biyomekanik formülüyle maksimum güç ve sonraki antrenman ağırlık hedeflerin',
    'overload.calcBtn': '1RM Hesapla',
    'overload.closeCalc': 'Hesaplayıcıyı Kapat',
    'overload.newTarget': 'Yeni Hedef',

    // Settings
    'settings.langTitle': 'Dil & Küresel Bölge (Language)',
    'settings.langSub': 'Uygulama arayüzü, sesli dikte ve AI Koç yanıt dili anında değişir'
  },

  en: {
    'nav.today': 'Home',
    'nav.training': 'Workouts',
    'nav.nutrition': 'Nutrition',
    'nav.tools': 'Tools',
    'nav.progress': 'Progress',
    'nav.coach': 'AI Coach',
    'nav.settings': 'Settings',
    'header.today': 'Today',
    'header.prevDay': 'Previous day',
    'header.nextDay': 'Next day',
    'header.backToday': 'Back to today →',
    'header.online': 'Online — syncing with encrypted cloud',
    'header.offline': 'Offline — working locally',
    'header.themeLight': 'Switch to light mode',
    'header.themeDark': 'Switch to dark mode',

    'sub.program': 'Program',
    'sub.week': 'Weekly Schedule',
    'sub.report': 'AI Weekly Report',
    'sub.body': 'Body & Transformation',
    'sub.habits': 'Habits & Alerts',

    'auth.badge': 'FIT AI · PRO COACHING PLATFORM v4.0 GLOBAL',
    'auth.heroTitle1': 'Don’t leave your physique to chance,',
    'auth.heroTitle2': 'trust AI sports science',
    'auth.heroTitle3': 'every single day.',
    'auth.heroSub': 'More than a calorie counter. Your personal performance lab that adapts your daily workout to your sleep, soreness, and equipment—and logs meals from a single photo or voice note.',
    'auth.tabCheckin': '⚡ Morning AI Check-in',
    'auth.tabMeal': '🍲 AI Vision Meal Log',
    'auth.tabMuscle': '🧬 Muscle & Adonis Ratio',
    'auth.stat1Val': '1.618',
    'auth.stat1Lbl': 'Adonis Golden Ratio & FFMI',
    'auth.stat2Val': '100%',
    'auth.stat2Lbl': 'Isolated Encrypted Cloud',
    'auth.stat3Val': '24/7',
    'auth.stat3Lbl': 'Live AI Performance Coach',
    'auth.loginTab': 'Sign In',
    'auth.signupTab': 'Create Free Account',
    'auth.welcomeBack': 'Welcome Back',
    'auth.createAccount': 'Create Your Pro Account',
    'auth.forgotTitle': 'Reset Password',
    'auth.loginSub': 'Pick up your training and macro tracking right where you left off.',
    'auth.signupSub': 'Launch your personal AI coach and cloud profile in 30 seconds.',
    'auth.instantSavedTitle': 'Continue Instantly With Saved Profile',
    'auth.instantNewTitle': '1-Click Instant Start (No Password Needed)',
    'auth.instantSavedSub': 'Your local profile is ready on this device—open in one tap.',
    'auth.instantNewSub': 'Start using the full app right now without waiting for email verification.',
    'auth.email': 'Email Address',
    'auth.password': 'Password',
    'auth.name': 'Your Name or Nickname',
    'auth.forgotLink': 'Forgot password?',
    'auth.submitLogin': 'Sign In to My Account',
    'auth.submitSignup': 'Create Account & Start',
    'auth.submitForgot': 'Send Reset Link',

    'today.greetNight': 'Good night',
    'today.greetMorning': 'Good morning',
    'today.greetDay': 'Good afternoon',
    'today.greetEvening': 'Good evening',
    'today.champ': 'Athlete',
    'today.remSub': '{pro}g protein and {cal} kcal left to hit today’s goal',
    'today.doneSub': 'Daily protein goal crushed—awesome discipline today!',
    'today.askCoach': 'Ask AI Coach',
    'today.thisWeek': 'This week',
    'today.workoutLabel': 'workouts',
    'today.waterLabel': 'water',
    'today.quickMealTitle': '1-Tap Quick Nutrition',
    'today.aiCamera': 'AI Camera',
    'today.logMeal': 'Log Meal',
    'today.workoutDone': 'Workout Completed',
    'today.restDay': 'Active Recovery & Mobility Day',
    'today.scheduledWorkout': 'Today’s Scheduled Workout',
    'today.startWorkout': 'Start Workout',
    'today.openProgram': 'Open full weekly program & custom routines',

    'streak.dayStreak': 'Day Streak',
    'streak.best': 'Best',
    'streak.days': 'days',
    'streak.level': 'Level',
    'streak.badges': 'Unlocked Achievement Badges',

    'checkin.title': 'Daily AI Readiness Check-in',
    'checkin.subtitle': '4 quick questions → personalized daily workout & meal adaptation',
    'checkin.startBtn': 'Plan My Day',
    'checkin.Generating': 'Your AI coach is calibrating today’s plan…',
    'checkin.startAdapted': 'Start Adapted Workout',
    'checkin.mealsToday': 'Smart meal ideas for today',

    'meal.title': 'What did you eat? (Type, Speak or Snap)',
    'meal.subtitle': 'Dictate by voice, type, or snap a photo of your plate; AI calculates all macros.',
    'meal.placeholder': 'e.g., 200g grilled chicken breast, 1 cup rice and Greek yogurt',
    'meal.listening': 'Listening… Speak your meal clearly.',
    'meal.voiceBtn': 'Voice Input',
    'meal.stopVoice': 'Stop',
    'meal.photoBtn': 'Photo',
    'meal.calcBtn': 'Analyze',
    'meal.analyzing': 'Analyzing…',
    'meal.confirmTitle': 'Did you eat this?',
    'meal.confirmSub': 'Review values, adjust if needed, and save.',
    'meal.saveBtn': 'Save Meal',

    'fasting.title': 'Intermittent Fasting & Autophagy Timer',
    'fasting.subtitle': 'Real-time insulin control, fat oxidation stage & cellular renewal tracker',
    'fasting.startNow': 'Start Fast Now',
    'fasting.started2hAgo': 'Ate 2 Hours Ago',
    'fasting.plus1h': '+1h Earlier Start',
    'fasting.stopBtn': 'End Fast (Feeding Window)',

    'overload.title': '1RM Strength & Progressive Overload Engine',
    'overload.subtitle': 'Estimated 1-Rep Max via Epley biomechanics & your next session weight targets',
    'overload.calcBtn': '1RM Calculator',
    'overload.closeCalc': 'Close Calculator',
    'overload.newTarget': 'Next Target',

    'settings.langTitle': 'Language & Global Region',
    'settings.langSub': 'Instantly switches UI language, voice recognition locale & AI Coach responses'
  },

  de: {
    'nav.today': 'Heute',
    'nav.training': 'Training',
    'nav.nutrition': 'Ernährung',
    'nav.tools': 'Tools',
    'nav.progress': 'Fortschritt',
    'nav.coach': 'KI-Coach',
    'nav.settings': 'Optionen',
    'header.today': 'Heute',
    'header.prevDay': 'Vorheriger Tag',
    'header.nextDay': 'Nächster Tag',
    'header.backToday': 'Zurück zu Heute →',
    'header.online': 'Online — Cloud-Synchronisierung aktiv',
    'header.offline': 'Offline — Lokal gespeichert',
    'header.themeLight': 'Helles Design',
    'header.themeDark': 'Dunkles Design',

    'sub.program': 'Programm',
    'sub.week': 'Wochenplan',
    'sub.report': 'KI-Wochenbericht',
    'sub.body': 'Maße & Transformation',
    'sub.habits': 'Gewohnheiten',

    'auth.badge': 'FIT AI · PRO COACHING PLATTFORM v4.0 GLOBAL',
    'auth.heroTitle1': 'Überlass deinen Körper nicht dem Zufall,',
    'auth.heroTitle2': 'vertraue auf KI-Sportwissenschaft',
    'auth.heroTitle3': 'jeden einzelnen Tag.',
    'auth.heroSub': 'Mehr als ein Kalorienzähler. Dein persönliches Performance-Labor, das dein Training jeden Morgen an Schlaf und Erholung anpasst.',
    'auth.tabCheckin': '⚡ Morgen KI-Check-in',
    'auth.tabMeal': '🍲 KI-Mahlzeiten-Scan',
    'auth.tabMuscle': '🧬 Muskel & Adonis-Index',
    'auth.stat1Val': '1.618',
    'auth.stat1Lbl': 'Adonis Goldener Schnitt',
    'auth.stat2Val': '100%',
    'auth.stat2Lbl': 'Verschlüsselte Cloud',
    'auth.stat3Val': '24/7',
    'auth.stat3Lbl': 'Live KI-Performance-Coach',
    'auth.loginTab': 'Anmelden',
    'auth.signupTab': 'Kostenlos Registrieren',
    'auth.welcomeBack': 'Willkommen zurück',
    'auth.createAccount': 'Pro-Konto erstellen',
    'auth.forgotTitle': 'Passwort zurücksetzen',
    'auth.loginSub': 'Setze dein Training und Makro-Tracking nahtlos fort.',
    'auth.signupSub': 'Starte deinen persönlichen KI-Coach in 30 Sekunden.',
    'auth.instantSavedTitle': 'Sofort mit gespeichertem Profil fortfahren',
    'auth.instantNewTitle': '1-Klick Schnellstart (Ohne Passwort)',
    'auth.instantSavedSub': 'Deine lokalen Daten sind bereit.',
    'auth.instantNewSub': 'Starte sofort ohne E-Mail-Bestätigung.',
    'auth.email': 'E-Mail-Adresse',
    'auth.password': 'Passwort',
    'auth.name': 'Dein Name',
    'auth.forgotLink': 'Passwort vergessen?',
    'auth.submitLogin': 'Jetzt Anmelden',
    'auth.submitSignup': 'Konto erstellen & starten',
    'auth.submitForgot': 'Link senden',

    'today.greetNight': 'Gute Nacht',
    'today.greetMorning': 'Guten Morgen',
    'today.greetDay': 'Guten Tag',
    'today.greetEvening': 'Guten Abend',
    'today.champ': 'Champion',
    'today.remSub': 'Noch {pro}g Protein und {cal} kcal bis zum Tagesziel',
    'today.doneSub': 'Tagesziel für Protein erreicht — starke Leistung!',
    'today.askCoach': 'KI-Coach fragen',
    'today.thisWeek': 'Diese Woche',
    'today.workoutLabel': 'Workouts',
    'today.waterLabel': 'Wasser',
    'today.quickMealTitle': '1-Klick Schnell-Ernährung',
    'today.aiCamera': 'KI-Kamera',
    'today.logMeal': 'Mahlzeit',
    'today.workoutDone': 'Training abgeschlossen',
    'today.restDay': 'Aktive Erholung & Mobilität',
    'today.scheduledWorkout': 'Heutiges geplantes Training',
    'today.startWorkout': 'Training starten',
    'today.openProgram': 'Kompletten Wochenplan & eigene Routinen öffnen',

    'streak.dayStreak': 'Tage Serie',
    'streak.best': 'Rekord',
    'streak.days': 'Tage',
    'streak.level': 'Stufe',
    'streak.badges': 'Erfolgsabzeichen',

    'checkin.title': 'Täglicher KI-Check-in',
    'checkin.subtitle': '4 kurze Fragen → individuelles Tages-Workout & Ernährung',
    'checkin.startBtn': 'Tag planen',
    'checkin.Generating': 'Dein KI-Coach erstellt deinen Tagesplan…',
    'checkin.startAdapted': 'Angepasstes Training starten',
    'checkin.mealsToday': 'Mahlzeiten-Ideen für heute',

    'meal.title': 'Was hast du gegessen? (Tippen, Sprechen, Foto)',
    'meal.subtitle': 'Per Sprache diktieren, tippen oder fotografieren; KI berechnet alle Makros.',
    'meal.placeholder': 'z.B. 200g Hähnchenbrust, Reis und Salat',
    'meal.listening': 'Höre zu… Sprich deine Mahlzeit ein.',
    'meal.voiceBtn': 'Spracheingabe',
    'meal.stopVoice': 'Stopp',
    'meal.photoBtn': 'Foto',
    'meal.calcBtn': 'Berechnen',
    'meal.analyzing': 'Analysiere…',
    'meal.confirmTitle': 'Hast du das gegessen?',
    'meal.confirmSub': 'Werte prüfen und speichern.',
    'meal.saveBtn': 'Speichern',

    'fasting.title': 'Intervallfasten (16:8 / 18:6) & Autophagie-Uhr',
    'fasting.subtitle': 'Insulinkontrolle, Fettverbrennung & Zellregeneration',
    'fasting.startNow': 'Fasten jetzt starten',
    'fasting.started2hAgo': 'Vor 2 Std. gegessen',
    'fasting.plus1h': '+1 Std. früher',
    'fasting.stopBtn': 'Fasten beenden',

    'overload.title': '1RM Kraft & Progressive Overload Motor',
    'overload.subtitle': 'Berechnetes 1-Rep-Maximum & nächste Trainingsziele',
    'overload.calcBtn': '1RM Rechner',
    'overload.closeCalc': 'Schließen',
    'overload.newTarget': 'Nächstes Ziel',

    'settings.langTitle': 'Sprache & Region (Language)',
    'settings.langSub': 'Ändert sofort App-Sprache, Spracherkennung und KI-Coach-Antworten'
  },

  es: {
    'nav.today': 'Hoy',
    'nav.training': 'Entreno',
    'nav.nutrition': 'Nutrición',
    'nav.tools': 'Herramientas',
    'nav.progress': 'Progreso',
    'nav.coach': 'Coach IA',
    'nav.settings': 'Ajustes',
    'header.today': 'Hoy',
    'header.prevDay': 'Día anterior',
    'header.nextDay': 'Día siguiente',
    'header.backToday': 'Volver a hoy →',
    'header.online': 'En línea — sincronizado en la nube',
    'header.offline': 'Sin conexión — modo local',
    'header.themeLight': 'Modo claro',
    'header.themeDark': 'Modo oscuro',

    'sub.program': 'Programa',
    'sub.week': 'Calendario Semanal',
    'sub.report': 'Informe IA',
    'sub.body': 'Medidas y Cambio',
    'sub.habits': 'Hábitos y Alertas',

    'auth.badge': 'FIT AI · PLATAFORMA PRO DE COACHING v4.0 GLOBAL',
    'auth.heroTitle1': 'No dejes tu físico al azar,',
    'auth.heroTitle2': 'confía en la ciencia deportiva IA',
    'auth.heroTitle3': 'cada día.',
    'auth.heroSub': 'Mucho más que un contador de calorías. Tu laboratorio de rendimiento personal que adapta tu entrenamiento diario y analiza tus comidas por foto o voz.',
    'auth.tabCheckin': '⚡ Check-in IA Matutino',
    'auth.tabMeal': '🍲 Escáner IA de Comidas',
    'auth.tabMuscle': '🧬 Músculo y Ratio Adonis',
    'auth.stat1Val': '1.618',
    'auth.stat1Lbl': 'Ratio Áureo Adonis y FFMI',
    'auth.stat2Val': '100%',
    'auth.stat2Lbl': 'Nube Cifrada Aislada',
    'auth.stat3Val': '24/7',
    'auth.stat3Lbl': 'Coach IA en Vivo',
    'auth.loginTab': 'Iniciar Sesión',
    'auth.signupTab': 'Registro Gratis',
    'auth.welcomeBack': 'Bienvenido de Nuevo',
    'auth.createAccount': 'Crea tu Cuenta Pro',
    'auth.forgotTitle': 'Recuperar Contraseña',
    'auth.loginSub': 'Continúa tu entrenamiento y control de macros donde lo dejaste.',
    'auth.signupSub': 'Inicia tu coach IA personal en 30 segundos.',
    'auth.instantSavedTitle': 'Continuar al Instante con Perfil Guardado',
    'auth.instantNewTitle': 'Inicio Rápido en 1 Clic (Sin Contraseña)',
    'auth.instantSavedSub': 'Tus datos están listos en este dispositivo.',
    'auth.instantNewSub': 'Empieza ahora mismo sin esperar confirmación por correo.',
    'auth.email': 'Correo Electrónico',
    'auth.password': 'Contraseña',
    'auth.name': 'Tu Nombre o Apodo',
    'auth.forgotLink': '¿Olvidaste tu contraseña?',
    'auth.submitLogin': 'Entrar a mi Cuenta',
    'auth.submitSignup': 'Crear Cuenta y Empezar',
    'auth.submitForgot': 'Enviar Enlace',

    'today.greetNight': 'Buenas noches',
    'today.greetMorning': 'Buenos días',
    'today.greetDay': 'Buenas tardes',
    'today.greetEvening': 'Buenas noches',
    'today.champ': 'Campeón',
    'today.remSub': 'Faltan {pro}g de proteína y {cal} kcal para tu meta de hoy',
    'today.doneSub': '¡Meta diaria de proteína completada, excelente trabajo!',
    'today.askCoach': 'Preguntar al Coach IA',
    'today.thisWeek': 'Esta semana',
    'today.workoutLabel': 'entrenos',
    'today.waterLabel': 'agua',
    'today.quickMealTitle': 'Nutrición Rápida 1-Clic',
    'today.aiCamera': 'Cámara IA',
    'today.logMeal': 'Anotar Comida',
    'today.workoutDone': 'Entrenamiento Completado',
    'today.restDay': 'Día de Descanso Activo y Movilidad',
    'today.scheduledWorkout': 'Entrenamiento Programado de Hoy',
    'today.startWorkout': 'Iniciar Entreno',
    'today.openProgram': 'Abrir programa semanal completo y rutinas',

    'streak.dayStreak': 'Días de Racha',
    'streak.best': 'Mejor',
    'streak.days': 'días',
    'streak.level': 'Nivel',
    'streak.badges': 'Insignias Desbloqueadas',

    'checkin.title': 'Check-in Diario con IA',
    'checkin.subtitle': '4 preguntas rápidas → entrenamiento y comidas adaptadas a hoy',
    'checkin.startBtn': 'Planificar mi Día',
    'checkin.Generating': 'Tu coach IA está preparando el plan de hoy…',
    'checkin.startAdapted': 'Iniciar Entreno Adaptado',
    'checkin.mealsToday': 'Ideas de comidas para hoy',

    'meal.title': '¿Qué comiste? (Escribe, Habla o Toma Foto)',
    'meal.subtitle': 'Dicta por voz, escribe o fotografía tu plato; la IA calcula tus macros.',
    'meal.placeholder': 'Ej: 200g pechuga de pollo, arroz y ensalada',
    'meal.listening': 'Escuchando… Di lo que comiste.',
    'meal.voiceBtn': 'Dictar por Voz',
    'meal.stopVoice': 'Detener',
    'meal.photoBtn': 'Foto',
    'meal.calcBtn': 'Calcular',
    'meal.analyzing': 'Analizando…',
    'meal.confirmTitle': '¿Comiste esto?',
    'meal.confirmSub': 'Revisa los valores y guarda.',
    'meal.saveBtn': 'Guardar',

    'fasting.title': 'Ayuno Intermitente (16:8 / 18:6) y Autofagia',
    'fasting.subtitle': 'Control de insulina, quema de grasa y renovación celular en vivo',
    'fasting.startNow': 'Iniciar Ayuno Ahora',
    'fasting.started2hAgo': 'Comí hace 2 Horas',
    'fasting.plus1h': '+1h Antes',
    'fasting.stopBtn': 'Terminar Ayuno',

    'overload.title': 'Motor de Fuerza 1RM y Sobrecarga Progresiva',
    'overload.subtitle': 'Cálculo biomecánico de 1RM y objetivos de peso para tu próxima sesión',
    'overload.calcBtn': 'Calculadora 1RM',
    'overload.closeCalc': 'Cerrar',
    'overload.newTarget': 'Nueva Meta',

    'settings.langTitle': 'Idioma y Región Global (Language)',
    'settings.langSub': 'Cambia al instante el idioma de la interfaz, voz y respuestas del Coach IA'
  }
};

export function getLang() {
  try {
    const saved = localStorage.getItem(LANG_KEY);
    if (saved && DICT[saved]) return saved;
  } catch {}
  return 'tr';
}

export function setLang(code) {
  if (!DICT[code]) return;
  try {
    localStorage.setItem(LANG_KEY, code);
    if (typeof document !== 'undefined') {
      document.documentElement.lang = code;
    }
    window.dispatchEvent(new CustomEvent('fit-lang-change', { detail: code }));
  } catch {}
}

export function getLangMeta(code = getLang()) {
  return LANGUAGES.find((l) => l.code === code) || LANGUAGES[0];
}

export function translate(key, vars = {}, lang = getLang()) {
  const table = DICT[lang] || DICT.tr;
  let str = table[key] ?? DICT.tr[key] ?? key;
  for (const [k, v] of Object.entries(vars)) {
    str = str.replace(`{${k}}`, String(v));
  }
  return str;
}

export function useI18n() {
  const [lang, setLangState] = useState(getLang);

  useEffect(() => {
    const handler = () => setLangState(getLang());
    window.addEventListener('fit-lang-change', handler);
    return () => window.removeEventListener('fit-lang-change', handler);
  }, []);

  const t = useCallback((key, vars) => translate(key, vars, lang), [lang]);
  const meta = getLangMeta(lang);

  return {
    lang,
    setLang,
    t,
    locale: meta.locale,
    speechLang: meta.speechLang,
    languages: LANGUAGES
  };
}
