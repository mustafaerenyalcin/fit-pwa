import React, { useState, useRef } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  User,
  Lightbulb,
  ChefHat,
  RotateCcw,
  Mic,
  MicOff
} from 'lucide-react';
import { RichText } from '../components/ui.jsx';
import { askCoach } from '../lib/aiCoach.js';
import { buildContext } from '../lib/api.js';

export default function CoachView({
  profile,
  entries,
  target,
  totals
}) {
  const [messages, setMessages] = useState([
    {
      sender: 'coach',
      text: `Merhaba${profile.name ? ` ${profile.name}` : ''}! Ben Fit Koç. Profilini, ekipmanını ve son kayıtlarını görebiliyorum. Antrenman, form, beslenme ya da evdeki malzemelerle tarif — yazarak ya da mikrofona konuşarak sorabilirsin.`
    }
  ]);
  const [inputQuestion, setInputQuestion] = useState('');
  const [busy, setBusy] = useState(false);
  const [listening, setListening] = useState(false);
  const recRef = useRef(null);

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
    'Bugün ne yemeliyim?',
    'Programım hedefime uygun mu?',
    'Ağırlıkları ne zaman artırmalıyım?',
    'Bu haftaki gidişatımı değerlendir.'
  ];

  const toggleVoice = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    if (listening && recRef.current) {
      recRef.current.stop();
      setListening(false);
      return;
    }

    const rec = new SpeechRecognition();
    rec.lang = 'tr-TR';
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.onstart = () => setListening(true);
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    rec.onresult = (e) => {
      const transcript = e.results?.[0]?.[0]?.transcript || '';
      if (transcript) {
        setInputQuestion((prev) => (prev ? `${prev} ${transcript}` : transcript));
      }
    };
    recRef.current = rec;
    rec.start();
  };

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

    const userMsg = { sender: 'user', text: q.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInputQuestion('');
    setBusy(true);

    try {
      const context = buildContext({ entries, target, totals, days: 14 });
      const answer = await askCoach(profile, context, q.trim());
      setMessages((prev) => [...prev, { sender: 'coach', text: answer }]);
    } catch (err) {
      const msg = err.message || 'İstek başarısız oldu.';
      setMessages((prev) => [...prev, { sender: 'coach', text: `⚠️ ${msg}` }]);
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
      {messages.length > 1 && (
        <div className="fx-rowEnd">
          <button
            type="button"
            className="fx-btn fx-btn--text fx-btn--sm"
            onClick={() =>
              setMessages([
                {
                  sender: 'coach',
                  text: 'Sohbet sıfırlandı. Yeni bir soru veya konuyla devam edebiliriz.'
                }
              ])
            }
          >
            <RotateCcw size={14} /> Sohbeti temizle
          </button>
        </div>
      )}

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
                <div className="chatBubbleBody">
                  {m.sender === 'coach' ? <RichText text={m.text} /> : m.text}
                </div>
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
          <button
            type="button"
            className={`fx-iconBtn ${listening ? 'fx-btn--listening' : ''}`}
            onClick={toggleVoice}
            title="Sesle sor (Türkçe)"
          >
            {listening ? <MicOff size={18} /> : <Mic size={18} />}
          </button>
          <input
            type="text"
            placeholder={
              listening
                ? 'Dinleniyor… Sorunu Türkçe söyleyebilirsin'
                : 'Koçuna bir şey sor… (Örn: Omuz antrenmanımda ağırlığı ne zaman artırmalıyım?)'
            }
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
