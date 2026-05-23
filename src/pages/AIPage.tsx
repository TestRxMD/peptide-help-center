import { useState, useRef, useEffect } from 'react';
import { peptides, categories } from '../data/peptides';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

function getContextualResponse(query: string): string {
  const q = query.toLowerCase();

  if (q.includes('bpc') || q.includes('bpc-157')) {
    return `**BPC-157** (Body Protection Compound-157) is one of the most versatile healing peptides available.\n\n**Key facts:**\n- 15-amino acid sequence derived from human gastric juice\n- Half-life: ~4–6 hours\n- Typical dose: 250–500 mcg/day\n- Routes: SubQ, IM, or oral (for gut-specific effects)\n\n**Primary uses:** Tendon/ligament repair, gut healing (IBD, leaky gut), muscle tears, neuroprotection\n\n**Synergizes well with:** TB-500 (the Wolverine Blend), GHK-Cu (the GLOW Blend)\n\n⚠️ Theoretical caution in active malignancy due to angiogenic effects.`;
  }

  if (q.includes('tb-500') || q.includes('tb500')) {
    return `**TB-500** (Thymosin Beta-4 fragment) provides systemic healing that BPC-157 cannot.\n\n**Key facts:**\n- Active fragment: Ac-SDKP\n- Works systemically — mobilizes progenitor cells throughout the body\n- Half-life: ~6–8 days\n- Loading: 2–5 mg/week × 4–6 weeks; Maintenance: 2 mg every 2 weeks\n\n**Best for:** Remote/old injuries, flexibility improvement, systemic tissue repair, anti-fibrotic\n\n**Paired most commonly with:** BPC-157 as the Wolverine or GLOW Blend`;
  }

  if (q.includes('stack') || q.includes('combine') || q.includes('blend')) {
    return `Here are the most popular and well-researched peptide stacks:\n\n🐺 **Wolverine Blend** — BPC-157 + TB-500 (injury/healing)\n✨ **GLOW Blend** — BPC-157 + TB-500 + GHK-Cu (healing + skin/collagen)\n💤 **CJC-1295 + Ipamorelin** — gold standard GH secretagogue stack\n🧠 **Clarity Blend** — Semax + Selank (cognition + anxiolytic)\n🔥 **AOD Fat Loss Stack** — AOD-9604 + CJC-1295/Ipa (fat loss)\n⏳ **Longevity Blend** — Epithalon + Thymalin (anti-aging)\n\nWhich stack are you interested in learning more about?`;
  }

  if (q.includes('gh') || q.includes('growth hormone') || q.includes('secretagogue')) {
    return `**GH Secretagogue Overview:**\n\nThe gold standard stack is **CJC-1295 No DAC + Ipamorelin** (200–300 mcg each, pre-sleep, fasted).\n\n**Why this combination works:**\n- CJC-1295 (GHRH analogue): amplifies the amplitude of each GH pulse\n- Ipamorelin (ghrelin mimetic): increases GH pulse frequency, very selective (minimal cortisol/prolactin)\n- Together: produce 2–3× more GH than either alone\n\n**Oral alternative:** MK-677 (10–25 mg/day) — no injection, but more side effects (hunger, water retention)\n\n**FDA-approved option:** Sermorelin (200–500 mcg pre-sleep)`;
  }

  if (q.includes('epithalon') || q.includes('epitalon') || q.includes('telomere') || q.includes('longevity')) {
    return `**Epithalon** is the most studied longevity peptide globally.\n\n**What it does:**\n- Activates telomerase → restores telomere length in somatic cells\n- Normalizes circadian melatonin synthesis from the pineal gland\n- Demonstrated life extension in multiple animal models\n- Anti-tumor and oncostatic effects documented\n\n**Protocol:**\n- 5–10 mg/day SubQ\n- 10-day courses, 2× per year\n- Often paired with Thymalin (Longevity Blend)\n\n**Synergies:** Thymalin, Pinealon, Thymosin Alpha-1`;
  }

  if (q.includes('recon') || q.includes('reconstitute') || q.includes('mix') || q.includes('bac water')) {
    return `**Reconstitution Quick Guide:**\n\n1. Use bacteriostatic water (BAC water) for multi-use vials\n2. Add water slowly along the vial wall — never spray directly on the powder\n3. Gently swirl, never shake\n4. Store reconstituted peptides at 2–8°C (standard fridge)\n5. Most are stable for 4–6 weeks refrigerated\n\n**Concentration formula:**\n\`Concentration (mcg/mL) = Vial size (mg) × 1000 / BAC water added (mL)\`\n\n**For dosing:** Use the Recon Calculator tab for exact draw amounts and visual syringe guides.`;
  }

  if (q.includes('semax') || q.includes('selank') || q.includes('nootropic') || q.includes('cognitive')) {
    return `**Russian Cognitive Peptides — Semax & Selank:**\n\n🧠 **Semax** (ACTH 4–7 analogue)\n- Potently upregulates BDNF and NGF\n- Approved in Russia for stroke rehabilitation and ADHD\n- Dose: 200–600 mcg intranasal, morning\n- Stimulating — avoid late evening\n\n🌊 **Selank** (Tuftsin analogue)\n- Anxiolytic-nootropic without sedation or dependence\n- Modulates GABAergic system\n- Dose: 250–500 mcg intranasal\n\n**Clarity Blend** pairs both: Semax for BDNF/focus, Selank for anxiolytic balance.`;
  }

  if (q.includes('khavinson') || q.includes('bioregulator') || q.includes('cytomax')) {
    return `**Khavinson Bioregulators Overview:**\n\nDeveloped by Vladimir Khavinson at the St. Petersburg Institute of Bioregulation and Gerontology.\n\n**Two main series:**\n\n**Cytomaxes** (injectable polypeptide complexes from organs):\nChelohart (heart), Hepatogen (liver), Sigumir (bone/cartilage), Testoluten (testes), Prostalamin (prostate), etc.\n\n**Cytogens** (synthetic short peptides, 2–4 amino acids):\nPinealon, Vesugen, Bronchogen, Ovagen — more specific, lower molecular weight\n\n**Oral series (Cytomax capsules):** Vladonix, Cerebramin, etc.\n\n**Core anti-aging pair:** Epithalon + Thymalin (the Longevity Blend)`;
  }

  if (q.includes('side effect') || q.includes('safe') || q.includes('danger') || q.includes('risk')) {
    return `**General Peptide Safety Considerations:**\n\n✅ **Well-tolerated:** BPC-157, TB-500, Epithalon, Semax, Selank, GHK-Cu\n\n⚠️ **Monitor for:**\n- GH secretagogues: water retention, glucose elevation, elevated prolactin\n- MK-677: significant hunger increase, bloating\n- PT-141: nausea, blood pressure elevation\n- GHRP-2: cortisol/prolactin elevation\n\n🚫 **Avoid in active malignancy:** BPC-157, TB-500, Dihexa\n🚫 **PT-141:** avoid in cardiovascular disease\n🚫 **Continuous Kisspeptin:** causes receptor desensitization\n\nAlways start low, keep a log, and consult a knowledgeable physician.`;
  }

  // Generic response using peptide data
  const matchedPeptide = peptides.find(p =>
    q.includes(p.name.toLowerCase()) ||
    q.includes(p.id.toLowerCase())
  );

  if (matchedPeptide) {
    return `**${matchedPeptide.name}** ${matchedPeptide.emoji}\n\n${matchedPeptide.description}\n\n**Dosage:** ${matchedPeptide.dosageRange ?? 'See reference'}\n**Half-life:** ${matchedPeptide.halfLife ?? 'See reference'}\n**Routes:** ${matchedPeptide.routes?.join(', ') ?? 'See reference'}\n\n${matchedPeptide.benefits ? `**Benefits:** ${matchedPeptide.benefits.join(', ')}` : ''}`;
  }

  const suggestions = ['BPC-157', 'Epithalon', 'CJC-1295/Ipamorelin', 'Semax', 'Wolverine Blend', 'reconstitution'];
  return `I can answer questions about peptides, stacks, dosing, and protocols. Try asking about:\n\n${suggestions.map(s => `• ${s}`).join('\n')}\n\n*Note: This is a local knowledge base. Connect an AI API key in settings to enable full conversational AI.*`;
}

function renderMessage(content: string) {
  const lines = content.split('\n');
  return lines.map((line, i) => {
    if (line.startsWith('**') && line.endsWith('**')) {
      return <div key={i} style={{ fontWeight: 700, color: 'var(--text-primary)', marginTop: i > 0 ? 8 : 0 }}>{line.slice(2, -2)}</div>;
    }
    const parts = line.split(/(\*\*[^*]+\*\*)/g);
    return (
      <div key={i} style={{ marginTop: i > 0 ? 3 : 0 }}>
        {parts.map((part, j) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={j} style={{ color: 'var(--text-primary)' }}>{part.slice(2, -2)}</strong>;
          }
          if (part.startsWith('`') && part.endsWith('`')) {
            return <code key={j} style={{ background: 'var(--bg-input)', padding: '1px 6px', borderRadius: 4, fontFamily: 'monospace', fontSize: 12 }}>{part.slice(1, -1)}</code>;
          }
          return <span key={j}>{part}</span>;
        })}
      </div>
    );
  });
}

export default function AIPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: `Hello! I'm the Peptide Help Center AI assistant. I have knowledge of ${peptides.length} peptides across ${categories.length} categories.\n\nAsk me anything about dosing, reconstitution, stacks, mechanisms, or safety considerations.` },
  ]);
  const [input, setInput]     = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef             = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);
    setTimeout(() => {
      const response = getContextualResponse(userMsg);
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
      setLoading(false);
    }, 600);
  };

  const suggestions = ['What is BPC-157?', 'Best GH secretagogue stack?', 'How do I reconstitute a peptide?', 'Explain Epithalon', 'What are the best cognitive peptides?'];

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '24px 16px', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 100px)' }}>
      <div style={{ marginBottom: 16 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>🤖 AI Assistant</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Built-in peptide knowledge base. Ask about dosing, protocols, and mechanisms.</p>
      </div>

      {/* Chat */}
      <div style={{
        flex: 1, overflowY: 'auto',
        background: 'var(--bg-surface)', border: '1px solid var(--border)',
        borderRadius: 14, padding: '16px',
        display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 14,
      }}>
        {messages.map((msg, i) => (
          <div key={i} style={{
            display: 'flex',
            justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
          }}>
            {msg.role === 'assistant' && (
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: 'linear-gradient(135deg, #3b82f6, #7c3aed)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, marginRight: 10, flexShrink: 0, marginTop: 2,
              }}>🤖</div>
            )}
            <div style={{
              maxWidth: '78%',
              background: msg.role === 'user' ? 'rgba(59,130,246,0.15)' : 'var(--bg-card)',
              border: `1px solid ${msg.role === 'user' ? 'rgba(59,130,246,0.3)' : 'var(--border)'}`,
              borderRadius: msg.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
              padding: '12px 14px',
              fontSize: 13.5, lineHeight: 1.6,
              color: 'var(--text-secondary)',
            }}>
              {renderMessage(msg.content)}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>🤖</div>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '14px 14px 14px 4px', padding: '12px 16px', display: 'flex', gap: 4 }}>
              {[0,1,2].map(i => (
                <div key={i} style={{
                  width: 6, height: 6, borderRadius: '50%', background: 'var(--text-muted)',
                  animation: `pulse 1.2s ${i*0.2}s infinite`,
                }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
        {suggestions.map(s => (
          <button
            key={s}
            onClick={() => { setInput(s); }}
            style={{
              background: 'var(--bg-surface)', border: '1px solid var(--border)',
              color: 'var(--text-secondary)', fontSize: 11.5, padding: '4px 10px', borderRadius: 20,
              cursor: 'pointer', fontFamily: 'inherit',
            }}
          >{s}</button>
        ))}
      </div>

      {/* Input */}
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
          placeholder="Ask about any peptide, stack, or protocol…"
          style={{ flex: 1 }}
        />
        <button
          className="btn btn-primary"
          onClick={send}
          disabled={!input.trim() || loading}
          style={{ whiteSpace: 'nowrap', opacity: (!input.trim() || loading) ? 0.5 : 1 }}
        >
          Send ↑
        </button>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
      `}</style>
    </div>
  );
}
