# FIT — Kişisel Spor ve Sağlık Asistanı (PWA v0.6.0)

Fit, ticari bir SaaS olmayan, tamamen kişisel kullanım için geliştirilmiş, mobil öncelikli bir **Progressive Web App (PWA)** fitness ve sağlık asistanıdır.

---

## 🚀 Hızlı Başlangıç

### 1. Gereksinimler
- Node.js 20+ ve npm

### 2. Bağımlılıkları Kur ve Geliştirme Modunda Başlat
```bash
npm install
npm run dev
```
Uygulama yerel olarak `http://localhost:5173` adresinde açılır.

### 3. Üretime Hazır Derleme (Build)
```bash
npm run build
```
Statik PWA dosyaları `dist/` klasörüne optimize edilmiş, sıkıştırılmış ve hash'lenmiş olarak derlenir.

---

## 📱 Cihazlara Kurulum (PWA)

### iPhone (iOS Safari)
1. Fit uygulamasının yayınlandığı HTTPS adresini Safari ile aç.
2. Ekranın altındaki **Paylaş (Share)** simgesine dokun.
3. Menüden **Ana Ekrana Ekle (Add to Home Screen)** seçeneğini seç.
4. **Ekle** butonuna bas.
- Uygulama ana ekranda bağımsız simgeyle yer alır.
- Safari tarayıcı çubuğu olmadan tam ekran (standalone) çalışır.
- iPhone çentik, dinamik ada ve alt safe-area alanlarına tam uyumludur.

### Windows (Chrome / Edge)
1. Fit sitesini Google Chrome veya Microsoft Edge ile aç.
2. Adres çubuğundaki **Uygulamayı Yükle** simgesine veya tarayıcı menüsünden "Fit uygulamasını yükle" seçeneğine tıkla.
- Masaüstü kısayoluyla bağımsız bir profesyonel panel olarak açılır.

---

## ☁️ Bulut Senkronizasyonu & Supabase (Opsiyonel)

Uygulama **Offline-First** mimaridedir; internet veya Supabase bağlantısı olmadan da yerel hafızada (`localStorage`) tam fonksiyonel çalışır. Cihazlar arası senkronizasyon için:

1. [Supabase](https://supabase.com) üzerinde ücretsiz bir proje oluştur.
2. Supabase SQL Editor sekmesinde `supabase/schema.sql` dosyasındaki SQL sorgularını çalıştır (Row Level Security tablosu ve indeksler oluşturulur).
3. `.env.example` dosyasını `.env` olarak kopyala ve değerleri doldur:
   ```env
   VITE_SUPABASE_URL=https://projeniz.supabase.co
   VITE_SUPABASE_ANON_KEY=anonim_anahtarınız
   ```
   *(DİKKAT: `service_role` secret veya OpenAI anahtarını asla `.env` içine yazmayın!)*
4. Supabase Auth ayarlarından Email provider'ını aktif et.
5. Uygulama içerisindeki **Senkronizasyon** sekmesinden hesabına giriş yap.

---

## 🤖 Fit AI Koç (Opsiyonel)

AI Koç, istemci tarafında API anahtarı saklamaz. Supabase Edge Function üzerinden güvenle çalışır:

1. Supabase CLI ile fonksiyonu deploy edin:
   ```bash
   supabase functions deploy fit-coach
   ```
2. OpenAI anahtarınızı sunucu ortam değişkeni (secret) olarak ekleyin:
   ```bash
   supabase secrets set OPENAI_API_KEY=sk-...
   ```
3. Deploy edilen fonksiyon JWT doğrulaması ile çalışır ve yalnızca giriş yapmış kullanıcılara yanıt verir.

---

## 🌟 Öne Çıkan Özellikler

1. **Dashboard (Genel Bakış):**
   - Bugünün antrenmanına tek dokunuşla başlama.
   - Günlük kalori ve protein ilerleme çubukları.
   - Hızlı su ekleme (+250ml, +500ml butonları).
   - Haftalık tamamlanan antrenman sayısı ve son tartı farkı.
   - Fit AI Koç'un dinamik günlük tavsiyesi.

2. **Akıllı Antrenman Sistemi & Canlı Oturum:**
   - 5 günlük evde dambılla bilimsel hipertrofi programı (Omuz ve karın odaklı).
   - 3 günlük spor salonu alternatif programı.
   - Her hareket için doğru form rehberi, yaygın teknik hatalar ve temsili siluet animasyonu.
   - **Canlı Antrenman Deneyimi:** Otomatik dinlenme sayacı, set tamamlama onayları, sesli bildirim ve kazara sayfa kapanmasına karşı localStorage oturum koruması.
   - **Progressive Overload Önerisi:** Hedef tekrarlar aşıldığında bir sonraki seans için kontrollü ağırlık artışı önerisi.
   - **Kişisel Rekorlar (PR):** Hareket bazında en yüksek ağırlık takibi.

3. **Beslenme & Türk Mutfağı Veritabanı:**
   - Dahili Türk mutfağı ve sporcu besinleri veritabanı (Tavuk göğsü, yumurta, lor, yulaf, mercimek, balık vb.).
   - Gramaj seçimiyle anlık kalori, protein, karbonhidrat ve yağ hesabı.
   - Sık tüketilen favori öğünler ve tek tıkla bugüne ekleme.
   - Bilimsel takviye takibi (Kreatin, Protein tozu, BCAA).

4. **Vücut Gelişimi & Ölçümler:**
   - Kilo, bel, omuz, göğüs, kol ve bacak çevre ölçüm kayıtları.
   - 7 günlük, 30 günlük, 90 günlük ve tüm zamanlar grafik filtreleri.
   - Hareket bazlı güç artış grafiği (Bench, Press, Row vb.).
   - **Özel Gelişim Fotoğrafları:** Yalnızca cihazda yerel şifrelenen, hiçbir sunucuya yüklenmeyen güvenli albüm.

5. **Sağlıklı Yaşam & Toparlanma:**
   - Su, uyku süresi, adım ve 1-5 enerji seviyesi takibi.
   - Akıllı toparlanma ve aşırı yüklenme (overtraining) uyarıları.

6. **Yedekleme & Gizlilik:**
   - Tek tıkla JSON tam veri yedeği indirme ve geri yükleme.
   - Sıfır reklam, sıfır ticari izleme.
