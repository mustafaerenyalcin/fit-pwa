import React, { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { Card } from './ui.jsx';
import { generateProgram } from '../lib/programGenerator.js';

export default function ProgramGenerator({ profile, program, onDone }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const run = async () => {
    if (program && !confirm('Mevcut kişisel programın yenisiyle değiştirilecek. Devam edilsin mi?')) return;
    setBusy(true);
    setError('');
    try {
      const p = await generateProgram(profile);
      onDone?.(p);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const trainingDays = program?.days?.filter((d) => !d.rest).length || 0;

  return (
    <Card
      tone="accent"
      title={program ? program.name : 'Sana özel program oluştur'}
      subtitle={
        program
          ? `${trainingDays} gün antrenman · ${program.summary || 'Ekipmanına ve hedefine göre hazırlandı'}`
          : `${profile.trainingFrequency || 4} gün, ${profile.equipmentDumbbells || 'ekipmanın'} ve hedefine göre AI tarafından hazırlanır.`
      }
      action={
        <button type="button" className="fx-btn fx-btn--primary" onClick={run} disabled={busy}>
          {busy ? <Loader2 size={16} className="fx-spin" /> : <Sparkles size={16} />}
          {busy ? 'Hazırlanıyor…' : program ? 'Yeniden oluştur' : 'Oluştur'}
        </button>
      }
    >
      {error && <div className="fx-alert fx-alert--error">{error}</div>}
      {program && (
        <div className="fx-weekStrip">
          {program.days.map((d) => (
            <div key={d.dayIndex} className={`fx-weekDay ${d.rest ? 'rest' : ''}`}>
              <b>{['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'][d.dayIndex]}</b>
              <small>{d.rest ? 'Dinlen' : (d.name || '').split('·').pop().trim().slice(0, 14)}</small>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
