import React from 'react';
import {
  Smartphone,
  Download,
  Upload,
  Wifi,
  WifiOff,
  ShieldCheck,
  HardDrive
} from 'lucide-react';
import Panel from '../components/Panel.jsx';
import SyncPanel from '../SyncPanel.jsx';

export default function SyncView({
  online,
  installed,
  onReload,
  setMessage
}) {
  return (
    <div className="syncView">
      {/* PWA Installation Guidance */}
      <Panel
        title="Uygulamayı Cihazlarına Yükle"
        sub="iPhone Safari · Windows Edge / Chrome"
      >
        <div className="installGrid">
          <div>
            <Smartphone size={32} />
            <h4>iPhone (iOS Safari)</h4>
            <p>
              Fit sitesini Safari ile aç → Alt kısımdaki <b>Paylaş</b> simgesine dokun →{' '}
              <b>Ana Ekrana Ekle</b> seçeneğine tıkla. Fit, telefonunda tıpkı yerel bir App Store
              uygulaması gibi tam ekran, çentik ve safe-area uyumuyla çalışır.
            </p>
          </div>

          <div>
            <Download size={32} />
            <h4>Bilgisayar (Windows Edge/Chrome)</h4>
            <p>
              Fit sitesini Chrome veya Edge ile aç → Adres çubuğundaki <b>Uygulamayı Yükle</b>{' '}
              simgesine veya tarayıcı menüsünden "Fit uygulamasını yükle" seçeneğine tıkla.
              Masaüstü kısayoluyla bağımsız bir profesyonel panel olarak açılır.
            </p>
          </div>
        </div>

        <div className="connectionStatusRow">
          <div className="statusItem">
            {online ? <Wifi size={16} className="textSuccess" /> : <WifiOff size={16} className="textDanger" />}
            <span>{online ? 'İnternet Bağlantısı Aktif' : 'Çevrimdışı Mod (Veriler yerelde saklanır)'}</span>
          </div>
          <div className="statusItem">
            <ShieldCheck size={16} className="textSuccess" />
            <span>{installed ? 'PWA Yüklü (Standalone Görünüm)' : 'Tarayıcı Görünümündesin'}</span>
          </div>
        </div>
      </Panel>

      {/* Manual JSON Backup & Restore */}
      <Panel
        title="Manuel Veri Yedeği & Geri Yükleme"
        sub="İnternetin veya hesabın olmasa bile tüm antrenman ve sağlık verilerini tek tıkla yedekle"
      >
        <div className="backupActions">
          <button
            type="button"
            className="secondary"
            onClick={async () => {
              try {
                await window.fit.exportBackup();
                setMessage('JSON yedeği başarıyla indirildi.');
              } catch (e) {
                setMessage(e.message);
              }
            }}
          >
            <Download size={16} /> JSON Yedeği İndir
          </button>

          <label className="secondary uploadLabel">
            <Upload size={16} /> Yedeği Geri Yükle
            <input
              type="file"
              accept="application/json,.json"
              hidden
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                try {
                  if (
                    !confirm(
                      'Seçtiğin yedek dosyasındaki veriler mevcut kayıtlarının üzerine yazılacak. Devam edilsin mi?'
                    )
                  )
                    return;

                  await window.fit.importBackup(await file.text());
                  if (onReload) onReload();
                  setMessage('Yedek başarıyla geri yüklendi.');
                } catch (err) {
                  setMessage('Yedek yüklenemedi: ' + err.message);
                } finally {
                  e.target.value = '';
                }
              }}
            />
          </label>
        </div>

        <p className="smallHelp">
          İndirilen yedek dosyası antrenman setlerini, kilo/çevre ölçümlerini, öğün kayıtlarını ve
          profil ayarlarını içerir. Dosyayı güvenli bir yerde saklayabilir ve istediğin zaman geri
          yükleyebilirsin.
        </p>
      </Panel>

      {/* Cloud Account Sync Panel */}
      <SyncPanel onReload={onReload} />
    </div>
  );
}
