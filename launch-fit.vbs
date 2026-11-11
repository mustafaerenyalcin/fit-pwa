Set WshShell = CreateObject("WScript.Shell")
projectDir = "C:\Users\ereny\Desktop\PROJELER\Fit_PWA_v0.6.0 (1)"
WshShell.CurrentDirectory = projectDir

' Arka planda terminal penceresi göstermeden Vite sunucusunu başlat
WshShell.Run "cmd /c npm run dev", 0, False

' Sunucunun hazır olması için kısa bir süre bekle
WScript.Sleep 1800

' Microsoft Edge veya Chrome ile saf bağımsız uygulama penceresi (PWA penceresi) aç
edgePath = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
WshShell.Run """" & edgePath & """ --app=https://lighthearted-gaufre-61028a.netlify.app", 1, False
