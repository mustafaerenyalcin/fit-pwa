# FIT. ATELIER — App Store & Google Play Yayın Rehberi

Kod tarafı, ikon boyutları, yasal metinler, KVKK/GDPR veri silme, 4 kişilik Aile Planı ve Google/Apple OAuth altyapısı üretime hazır duruma getirildi. Yayına çıkmak için kalan dış servis ve mağaza adımları aşağıdadır:

---

## 1. API & Veritabanı Ayarları (Tek Kalan Yapılandırma)

### A. AI API Anahtarları (Netlify / Sunucu Ortam Değişkenleri)
İstemci kodunda hiçbir API anahtarı saklanmaz. Tüm AI çağrıları `netlify/functions/fit-coach.js` üzerinden geçer:
1. Netlify Dashboard → **Site configuration → Environment variables** bölümüne girin:
   - `GEMINI_API_KEY` (Yemek fotoğrafı analizi, barkod/tarif destekleri ve sohbet yedeği için)
   - `DEEPSEEK_API_KEY` *(opsiyonel)* (Metin koçluk yanıtları için birincil hızlı model)
2. Yerelde test etmek isterseniz proje kökündeki `.env` içine ekleyebilirsiniz (`vite.config.js` içindeki dev middleware otomatik proxy yapar).

### B. Supabase SQL & OAuth Sağlayıcıları
1. **Temel Şema:** Supabase Dashboard → SQL Editor içinde `supabase/schema.sql` dosyasını çalıştırın (`fit_data`, `ai_usage`, `delete_my_account()`).
2. **Aile Planı (4 Kişilik Çoklu Hesap) Şeması:** Yine SQL Editor içinde `supabase/family_migration.sql` dosyasını çalıştırın (`family_groups`, `family_members`, RPC fonksiyonları).
3. **Google & Apple SSO:**
   - Supabase Dashboard → **Authentication → Providers → Google**: Google Cloud OAuth Client ID/Secret ekleyin.
   - Supabase Dashboard → **Authentication → Providers → Apple**: Apple Developer Service ID + Private Key (p8) ekleyin.
   - **Redirect URLs** listesine canlı domaininizi (ör. `https://siteniz.netlify.app/**`) ve native paket kullanıyorsanız `com.fitatelier.app://**` ekleyin.

---

## 2. Apple App Store Connect (iOS Yayını)

### A. Native Paketleme (Capacitor iOS — Mac / Xcode gerekir)
```bash
npm run build
npm install @capacitor/core @capacitor/cli @capacitor/ios
npx cap add ios
npx cap sync ios
npx cap open ios
```
1. **Bundle Identifier:** `com.fitatelier.app` (`capacitor.config.json` ile aynı).
2. **Uygulama İkonu:** `public/icons/app-icon-1024.png` (`1024×1024`, alfa kanalsız düz PNG) Xcode → `Assets.xcassets/AppIcon` içine sürüklenir.
3. **Capabilities:** Xcode → Signing & Capabilities içinden **Sign in with Apple** eklenir (App Store, Google girişi varsa Apple girişi de ister — her ikisi uygulamada mevcut).
4. **Universal Links (Opsiyonel Aile Davet Linki):** Apple Developer Team ID'nizi `public/.well-known/apple-app-site-association` dosyasındaki `TEAMID` yerine yazın ve Xcode Associated Domains'e `applinks:siteniz.com` ekleyin.
5. **İzin Metinleri (`Info.plist`):** Barkod tarayıcı ve yemek fotoğrafı yükleme için `NSCameraUsageDescription` ve `NSPhotoLibraryUsageDescription` açıklamalarını ekleyin.

### B. App Store İnceleme Kontrol Listesi
- **Guideline 5.1.1(v) Hesap Silme:** **Ayarlar → Hesap ve veriler → Hesabımı ve verilerimi sil** hem bulut hesaplarını (`delete_my_account`) hem yerel/çevrimdışı hesapları kalıcı siler.
- **Gizlilik URL:** `https://siteniz.com/gizlilik.html`
- **Tıbbi Uyarı:** Hem `gizlilik.html`, `kosullar.html` hem uygulama içi `LegalModal` üzerinde yer alır (fitness/sağlık kategorisi gerekliliği).

---

## 3. Google Play Console (Android Yayını)

### Seçenek A: Capacitor Android (Önerilen Native AAB)
```bash
npm run build
npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap add android
npx cap sync android
npx cap open android
```
Android Studio → **Build → Generate Signed Bundle / APK → Android App Bundle (.aab)**.

### Seçenek B: Trusted Web Activity (Bubblewrap / PWABuilder)
1. Canlı HTTPS PWA adresinizi [PWABuilder](https://www.pwabuilder.com) veya `@bubblewrap/cli` aracına verin (`public/manifest.webmanifest` tam Play Store uyumludur: `192×192`, `512×512 any`, `512×512 maskable`).
2. Play Console → App Signing'den aldığınız **SHA-256 parmak izini** `public/.well-known/assetlinks.json` dosyasına yapıştırıp deploy edin (URL çubuğunun kalkması için).

### Play Console Varlıkları & Veri Güvenliği (Data Safety)
- **Uygulama İkonu (512×512 PNG):** `public/icons/app-icon.png` (ve Adaptive için `public/icons/icon-maskable-512.png`).
- **Gizlilik Politikası URL:** `https://siteniz.com/gizlilik.html`
- **Hesap Silme URL:** `https://siteniz.com/#settings` veya gizlilik sayfasındaki adımlar.
- **Data Safety Beyanı:** Hesap E-postası (Hesap yönetimi + Aile koltuğu, şifreli aktarım, satılmaz), Sağlık/Fitness Aktivite Verileri (uygulama işlevselliği, kullanıcı isteğiyle silinebilir), İsteğe bağlı Fotoğraf (yalnızca yemek fotoğrafı AI analizi anlık işlenir; ilerleme fotoğrafları cihaz içi saklanır).
