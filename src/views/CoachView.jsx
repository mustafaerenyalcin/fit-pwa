import React, { useState } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  Lock,
  User,
  Check,
  AlertCircle,
  HelpCircle,
  Lightbulb,
  ArrowRight,
  ChefHat,
  RotateCcw
} from 'lucide-react';
import Panel from '../components/Panel.jsx';

export default function CoachView({
  profile,
  entries,
  target,
  totals,
  onApplyProfileRecommendation
}) {
  const [messages, setMessages] = useState([
    {
      sender: 'coach',
      text: `Merhaba! Ben senin Fit AI Spor ve Beslenme Koçunum. Profilini, dambıl ekipmanını ve son kayıtlarını inceleyebilirim. Omuz genişliği, karın kası belirginliği, antrenman formu veya evdeki malzemelere göre yemek tarifleri hakkında dilediğin soruyu sorabilirsin.`
    }
  ]);
  const [inputQuestion, setInputQuestion] = useState('');
  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Recipe Wizard state
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const commonPantry = [
    'Tavuk Göğsü',
    'Yumurta',
    'Süzme Yoğurt',
    'Yulaf',
    'Pirinç / Bulgur',
    'Lor Peyniri',
    'Ton Balığı',
    'Kırmızı Mercimek',
    'Muz',
    'Fıstık Ezmesi'
  ];

  const quickQuestions = [
    'Bugünkü antrenmanım için önerin ne?',
    'Geniş omuz ve karın için programım yeterli mi?',
    'Evde dambıllarla progressive overload nasıl uygularım?',
    'Bu haftaki antrenman ve protein gelişimimi değerlendir.'
  ];

  const toggleIngredient = (ing) => {
    if (selectedIngredients.includes(ing)) {
      setSelectedIngredients(selectedIngredients.filter((i) => i !== ing));
    } else {
      setSelectedIngredients([...selectedIngredients, ing]);
    }
  };

  const handleAsk = async (questionText) => {
    const q = questionText || inputQuestion;
    if (!q.trim() || busy) return;

    setErrorMsg('');
    const userMsg = { sender: 'user', text: q.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInputQuestion('');
    setBusy(true);

    try {
      if (!window.fit?.aiAsk) {
        throw new Error('AI istemcisi hazır değil.');
      }

      // Prepare comprehensive, structured context
      const recentWorkouts = entries.workout.slice(0, 5).map((w) => `${w.day}: ${w.payload?.name} (${Object.keys(w.payload?.sets || {}).length} hareket)`);
      const recentWeights = entries.weight.slice(0, 5).map((w) => `${w.day}: ${w.payload?.weight} kg (bel: ${w.payload?.waist || '-'} cm)`);
      const summary = `
[Antrenman Geçmişi]: ${recentWorkouts.join('; ') || 'Henüz kayıt yok'}
[Son Kilo Kayıtları]: ${recentWeights.join('; ') || `${profile.weight || 77} kg`}
[Bugünkü Beslenme]: ${totals.calories} kcal, ${totals.protein} g protein (Hedef: ${target.protein} g)
[Kullanıcı Ekipmanı]: ${profile.equipmentDumbbells || 'Dambıl'}
[Sakatlık / Hassasiyet]: ${profile.injuries || 'Yok'}
[Öncelik]: ${profile.focus || 'Omuz ve karın kasları'}
      `.trim();

      const answer = await window.fit.aiAsk(profile, summary, q.trim());
      setMessages((prev) => [...prev, { sender: 'coach', text: answer }]);
    } catch (err) {
      const msg = err.message || 'İstek başarısız oldu.';
      setErrorMsg(msg);
      setMessages((prev) => [
        ...prev,
        {
          sender: 'coach',
          text: `İstek gerçekleştirilemedi: ${msg}\n\n(Not: AI Koç, Supabase Edge Function üzerinden çalışır. Bulut hesabına giriş yapıldığından ve sunucu secret'larında OPENAI_API_KEY tanımlandığından emin olun.)`
        }
      ]);
    } finally {
      setBusy(false);
    }
  };

  const askRecipeWithIngredients = () => {
    if (!selectedIngredients.length) return;
    const q = `Evde şu malzemelerim var: ${selectedIngredients.join(', ')}. Kas kazanımı hedefime uygun, pratik ve lezzetli bir öğün tarifi ver. Yaklaşık kalori ve protein değerini de belirt.`;
    handleAsk(q);
    setSelectedIngredients([]);
  };

  return (
    <div className="coachView">
      <div className="intro">
        <div className="introHeaderRow">
          <div>
            <h2>Fit AI Kişisel Koç</h2>
            <p>
              Senin fiziksel özelliklerini, antrenman sıklığını ve beslenme verilerini analiz eden
              yapay zekâ asistanın. Sorular sor, haftalık karneni incelet veya evdeki malzemelere göre
              yemek önerisi al.
            </p>
          </div>

          {messages.length > 1 && (
            <button
              type="button"
              className="secondary iconTextBtn"
              onClick={() =>
                setMessages([
                  {
                    sender: 'coach',
                    text: 'Sohbet sıfırlandı. Yeni bir soru veya konuyla devam edebiliriz.'
                  }
                ])
              }
              title="Sohbeti Temizle"
            >
              <RotateCcw size={14} /> Temizle
            </button>
          )}
        </div>
      </div>

      {/* Security & Architecture Banner */}
      <div className="securityNotice" style={{ marginBottom: 18 }}>
        <Lock size={16} />
        <div>
          <b>Maksimum Güvenlik: </b>
          <span>
            API anahtarları hiçbir zaman tarayıcıda veya telefonda saklanmaz; yalnızca güvenli Supabase
            Edge Function üzerinde çalışır. Koçun önerileri doğrudan veritabanına yazılmaz, daima
            senin onayına sunulur. Tıbbi teşhis niteliği taşımaz.
          </span>
        </div>
      </div>

      {/* Pantry Recipe Assistant Card */}
      <div className="recipeWizardCard">
        <div className="recipeWizardHeader">
          <ChefHat size={18} className="chefIcon" />
          <b>Evdeki Malzemelere Göre Yemek Sihirbazı</b>
        </div>
        <p className="smallHelp" style={{ margin: '4px 0 10px' }}>
          Dolabında olan malzemelere tıkla, AI Koç senin için en uygun yüksek proteinli tarifi hazırlasın:
        </p>

        <div className="ingredientChips">
          {commonPantry.map((ing) => {
            const isSelected = selectedIngredients.includes(ing);
            return (
              <button
                key={ing}
                type="button"
                className={`ingChip ${isSelected ? 'active' : ''}`}
                onClick={() => toggleIngredient(ing)}
              >
                {isSelected ? '✓ ' : '+ '}
                {ing}
              </button>
            );
          })}
        </div>

        {selectedIngredients.length > 0 && (
          <button
            type="button"
            className="primary recipeSubmitBtn"
            disabled={busy}
            onClick={askRecipeWithIngredients}
          >
            <Sparkles size={14} /> Seçili ({selectedIngredients.length}) Malzemeyle Tarif İste
          </button>
        )}
      </div>

      {/* Quick Suggestion Pills */}
      <div className="aiSuggestions" style={{ marginTop: 14 }}>
        {quickQuestions.map((q) => (
          <button
            key={q}
            type="button"
            className="suggestionPill"
            disabled={busy}
            onClick={() => handleAsk(q)}
          >
            <Lightbulb size={13} /> {q}
          </button>
        ))}
      </div>

      {/* Chat Messages Log */}
      <div className="chatContainer">
        <div className="chatMessages">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`chatBubbleWrapper ${m.sender === 'user' ? 'isUser' : 'isCoach'}`}
            >
              <div className="bubbleAvatar">
                {m.sender === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div className="chatBubble">
                <div className="chatBubbleHeader">
                  <b>{m.sender === 'user' ? (profile.name || 'Sporcu') : 'Fit AI Koç'}</b>
                </div>
                <div className="chatBubbleBody">{m.text}</div>
              </div>
            </div>
          ))}

          {busy && (
            <div className="chatBubbleWrapper isCoach">
              <div className="bubbleAvatar">
                <Bot size={16} />
              </div>
              <div className="chatBubble thinking">
                <div className="typingDots">
                  <span />
                  <span />
                  <span />
                </div>
                <small>Koç verilerini analiz ediyor ve yanıt hazırlıyor…</small>
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <form
          className="chatInputBar"
          onSubmit={(e) => {
            e.preventDefault();
            handleAsk();
          }}
        >
          <input
            type="text"
            placeholder="Koçuna bir şey sor… (Örn: Omuz antrenmanımda dambıl ağırlığını ne zaman artırmalıyım?)"
            value={inputQuestion}
            onChange={(e) => setInputQuestion(e.target.value)}
            disabled={busy}
          />
          <button
            type="submit"
            className="primary sendBtn"
            disabled={busy || !inputQuestion.trim()}
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
