import { useState, useRef, useEffect, useCallback } from 'react';
import { peptides, categories } from '../data/peptides';

// ─── Types ─────────────────────────────────────────────────────────────────

interface Message {
  role: 'user' | 'assistant';
  content: string;
  streaming?: boolean;
}

type Tab = 'chat' | 'builder';

interface ProtocolForm {
  goal: string;
  experience: string;
  budget: string;
  concerns: string;
  contraindications: string;
  duration: string;
}

// ─── Markdown renderer ─────────────────────────────────────────────────────

function MarkdownLine({ line }: { line: string }) {
  if (!line.trim()) return <div style={{ height: 6 }} />;

  // Heading
  const h3 = line.match(/^###\s+(.+)/);
  if (h3) return <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)', marginTop: 14, marginBottom: 4, letterSpacing: '-0.01em', fontFamily: "'DM Sans', sans-serif" }}>{h3[1]}</div>;
  const h2 = line.match(/^##\s+(.+)/);
  if (h2) return <div style={{ fontWeight: 700, fontSize: 15.5, color: 'var(--text-primary)', marginTop: 16, marginBottom: 6, letterSpacing: '-0.02em', fontFamily: "'DM Sans', sans-serif", borderBottom: '1px solid var(--border)', paddingBottom: 6 }}>{h2[1]}</div>;

  // Divider
  if (line.trim() === '---') return <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '10px 0' }} />;

  // Bullet
  const bullet = line.match(/^[-•*]\s+(.+)/);
  if (bullet) return (
    <div style={{ display: 'flex', gap: 8, marginTop: 3, alignItems: 'flex-start' }}>
      <span style={{ color: 'var(--accent)', fontSize: 10, marginTop: 5, flexShrink: 0 }}>●</span>
      <span style={{ color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.55 }}><InlineMarkdown text={bullet[1]} /></span>
    </div>
  );

  // Numbered list
  const num = line.match(/^(\d+)\.\s+(.+)/);
  if (num) return (
    <div style={{ display: 'flex', gap: 8, marginTop: 3, alignItems: 'flex-start' }}>
      <span style={{ color: 'var(--accent)', fontSize: 11, fontWeight: 700, minWidth: 16, flexShrink: 0, marginTop: 1 }}>{num[1]}.</span>
      <span style={{ color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.55 }}><InlineMarkdown text={num[2]} /></span>
    </div>
  );

  // Code block start/end
  if (line.startsWith('```')) return null;

  return (
    <div style={{ color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.6, marginTop: 2 }}>
      <InlineMarkdown text={line} />
    </div>
  );
}

function InlineMarkdown({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i} style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith('`') && part.endsWith('`')) {
          return <code key={i} style={{ background: 'rgba(59,130,246,0.1)', color: '#93c5fd', padding: '1px 6px', borderRadius: 4, fontFamily: 'monospace', fontSize: 12, border: '1px solid rgba(59,130,246,0.15)' }}>{part.slice(1, -1)}</code>;
        }
        if (part.startsWith('*') && part.endsWith('*') && !part.startsWith('**')) {
          return <em key={i} style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>{part.slice(1, -1)}</em>;
        }
        if (part.includes('⚠️')) {
          return <span key={i} style={{ color: '#fbbf24' }}>{part}</span>;
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

function MessageContent({ content }: { content: string }) {
  const lines = content.split('\n');
  return (
    <div>
      {lines.map((line, i) => <MarkdownLine key={i} line={line} />)}
    </div>
  );
}

// ─── Local fallback KB ─────────────────────────────────────────────────────

function getLocalResponse(query: string): string {
  const q = query.toLowerCase();
  if (q.includes('bpc') || q.includes('bpc-157')) {
    return `**BPC-157** is one of the most studied healing peptides available.\n\n**Key facts:**\n- 15-amino acid sequence derived from human gastric juice\n- Half-life: ~4–6 hours (SubQ); oral acts locally on gut\n- Typical dose: 250–500 mcg/day SubQ or IM\n\n**Primary uses:** Tendon/ligament repair, gut healing, muscle tears, neuroprotection\n\n**Best stacked with:** TB-500 (Wolverine Blend), GHK-Cu (GLOW Blend)\n\n⚠️ Theoretical caution in active malignancy due to angiogenic properties.`;
  }
  if (q.includes('cjc') || q.includes('ipamorelin') || q.includes('ghrh') || q.includes('secretagogue') || q.includes('growth hormone')) {
    return `**CJC-1295 (no DAC) + Ipamorelin** is the gold standard GH secretagogue stack.\n\n**Dosing:**\n- CJC-1295 (no DAC): 100–300 mcg SubQ\n- Ipamorelin: 100–300 mcg SubQ\n- Timing: 30 min pre-sleep, fasted (no food 2h prior)\n- Frequency: 5 days on, 2 days off OR daily\n\n**Why it works:** CJC amplifies pulse amplitude; Ipamorelin increases pulse frequency with minimal cortisol/prolactin spillover\n\n**Oral alternative:** MK-677 (10–25 mg/day) — no injection, but more side effects (hunger, water retention, glucose elevation)`;
  }
  if (q.includes('epithalon') || q.includes('epitalon') || q.includes('telomere') || q.includes('longevity')) {
    return `**Epithalon** is the most studied longevity peptide globally — 40+ years of research from Khavinson's institute.\n\n**Mechanism:** Activates telomerase → restores telomere length; normalizes pineal melatonin synthesis\n\n**Protocol:**\n- 5–10 mg/day SubQ or IM\n- 10-day course, 2× per year\n- Can be split: 5 mg AM + 5 mg PM\n\n**Best paired with:** Thymalin (Longevity Blend), Pinealon\n\n**Notable research:** Demonstrated 24–33% life extension in animal studies; anti-tumor effects documented`;
  }
  if (q.includes('semax') || q.includes('selank') || q.includes('cognitive') || q.includes('nootropic') || q.includes('brain')) {
    return `**Clarity Blend: Semax + Selank**\n\n**Semax** (ACTH 4–7 analogue):\n- Upregulates BDNF, NGF, and BDNF mRNA in hippocampus\n- Approved in Russia for stroke rehab, ADHD, cognitive decline\n- Dose: 200–600 mcg intranasal, morning\n- Stimulating — avoid late in day\n\n**Selank** (Tuftsin analogue):\n- Anxiolytic-nootropic: modulates GABAergic system, reduces anxiety without sedation\n- Zero dependence or withdrawal\n- Dose: 250–500 mcg intranasal\n\n**Stack timing:** Semax AM for focus; Selank mid-day or as needed for calm clarity`;
  }
  if (q.includes('tb-500') || q.includes('tb500') || q.includes('thymosin beta')) {
    return `**TB-500** (Thymosin Beta-4 fragment Ac-SDKP) provides systemic healing that BPC-157 cannot.\n\n**Key difference from BPC-157:** TB-500 is systemic — it mobilizes progenitor cells throughout the body to sites of injury. BPC-157 acts more locally.\n\n**Protocol:**\n- Loading: 2–5 mg SubQ/IM, 2× per week × 4–6 weeks\n- Maintenance: 2 mg every 2 weeks\n\n**Best for:** Remote or old injuries, whole-body flexibility improvement, systemic anti-fibrotic, athletic recovery\n\n**Half-life:** ~6–8 days — dosing flexibility`;
  }
  if (q.includes('recon') || q.includes('reconstitut') || q.includes('bac water') || q.includes('mix')) {
    return `**Reconstitution Guide:**\n\n1. Use **bacteriostatic water (BAC water)** for multi-use vials; sterile water for single use\n2. Add water slowly along vial wall — never spray directly on powder\n3. Gently swirl — **never shake**\n4. Store reconstituted peptides at 2–8°C (refrigerator)\n5. Most stable 4–6 weeks refrigerated; some (Epithalon) up to 8 weeks\n\n**Concentration formula:**\n\`Dose (mcg/mL) = vial size (mg) × 1000 ÷ BAC water added (mL)\`\n\n**Example:** 5mg vial + 2mL BAC water = 2,500 mcg/mL. For 500mcg dose: draw 0.2mL (20 units on a U100 syringe)\n\nUse the **Recon Calculator** tab for exact draw calculations.`;
  }
  if (q.includes('protocol') || q.includes('stack') || q.includes('blend') || q.includes('combine')) {
    return `**Popular Peptide Stacks:**\n\n**Wolverine Blend** — BPC-157 + TB-500\nBest-in-class for injury healing, tendon/ligament repair\n\n**GLOW Blend** — BPC-157 + TB-500 + GHK-Cu\nAdds collagen synthesis, skin regeneration, and antioxidant effects\n\n**CJC-1295/Ipa Stack** — Gold standard GH secretagogue\nAnti-aging, body recomposition, sleep quality\n\n**Clarity Blend** — Semax + Selank\nCognitive enhancement + anxiolytic balance\n\n**Longevity Blend** — Epithalon + Thymalin\nTelomere restoration + immune calibration\n\n**AOD Fat Loss Stack** — AOD-9604 + CJC/Ipa\nSelective lipolysis + GH optimization\n\nFor a personalized protocol, try the **Protocol Builder** tab above.`;
  }
  const matched = peptides.find(p => q.includes(p.name.toLowerCase()) || q.includes(p.id.toLowerCase()));
  if (matched) {
    return `**${matched.name}** ${matched.emoji}\n\n${matched.description}\n\n**Dosage:** ${matched.dosageRange ?? 'See reference'}\n**Half-life:** ${matched.halfLife ?? 'See reference'}\n**Routes:** ${matched.routes?.join(', ') ?? 'See reference'}\n${matched.benefits?.length ? `\n**Benefits:**\n${matched.benefits.map(b => `- ${b}`).join('\n')}` : ''}`;
  }
  return `I can answer questions about peptides, dosing math, reconstitution, mechanisms, and safety. Try asking about:\n\n- BPC-157 mechanism, benefits, and risks\n- CJC-1295/Ipamorelin (conservative GH stack)\n- Epithalon longevity protocol\n- Dosing calculation from a 3 mL vial\n- Reconstitution step-by-step\n- Conservative sleep and recovery stack\n\nFor a personalized protocol, try the **Protocol Builder** tab.\n\n*Tip: Add your Anthropic API key to Vercel to unlock full AI-generated responses.*`;
}

// ─── Streaming fetch ────────────────────────────────────────────────────────

async function streamChat(
  messages: { role: string; content: string }[],
  onChunk: (text: string) => void,
  onDone: () => void,
  onError: (err: string) => void
) {
  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      const msg = (body as { error?: string }).error ?? `HTTP ${res.status}`;
      onError(msg);
      return;
    }

    const reader = res.body?.getReader();
    if (!reader) { onError('No response body'); return; }
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';
      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const payload = line.slice(6).trim();
        if (payload === '[DONE]') { onDone(); return; }
        try {
          const parsed = JSON.parse(payload) as { text?: string; error?: string };
          if (parsed.error) { onError(parsed.error); return; }
          if (parsed.text) onChunk(parsed.text);
        } catch { /* skip malformed */ }
      }
    }
    onDone();
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Network error';
    onError(msg);
  }
}

// ─── Protocol Builder ───────────────────────────────────────────────────────

const GOALS = [
  { value: 'healing', label: 'Tissue Healing & Recovery', description: 'Injuries, tendons, ligaments, gut, muscle' },
  { value: 'gh', label: 'GH Optimization & Anti-Aging', description: 'CJC/Ipa, MK-677, body recomposition, sleep' },
  { value: 'cognitive', label: 'Cognitive Enhancement', description: 'Focus, memory, BDNF, neuroprotection' },
  { value: 'longevity', label: 'Longevity & Telomere Health', description: 'Epithalon, Thymalin, Khavinson protocols' },
  { value: 'fatloss', label: 'Fat Loss', description: 'AOD-9604, GH secretagogues, metabolic support' },
  { value: 'sexual', label: 'Sexual Health & Libido', description: 'PT-141, Kisspeptin, hormonal optimization' },
  { value: 'skin', label: 'Skin, Collagen & Hair', description: 'GHK-Cu, BPC-157, GLOW blend' },
  { value: 'immune', label: 'Immune Calibration', description: 'Thymosin Alpha-1, Thymalin, immune reset' },
];

function buildProtocolPrompt(form: ProtocolForm): string {
  const goalLabel = GOALS.find(g => g.value === form.goal)?.label ?? form.goal;
  return `Please create a detailed, personalized peptide research protocol for me based on the following parameters:

**Primary Goal:** ${goalLabel}
**Experience Level:** ${form.experience}
**Budget:** ${form.budget}
**Specific Concerns / Target Areas:** ${form.concerns || 'None specified'}
**Contraindications / Health Considerations:** ${form.contraindications || 'None specified'}
**Desired Protocol Duration:** ${form.duration}

Please provide:
1. Recommended peptide(s) with specific doses, timing, and routes
2. Loading phase vs. maintenance schedule (if applicable)
3. Reconstitution instructions for each peptide
4. Expected timeline for results
5. Key safety considerations
6. Sourcing recommendations
7. Monitoring and tracking suggestions`;
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function AIPage() {
  const [tab, setTab]             = useState<Tab>('chat');
  const [messages, setMessages]   = useState<Message[]>([{
    role: 'assistant',
    content: `## The Peptide Atlas\n\nI explain peptides and research compounds using intermediate medical language in a clear, informational tone. I prioritize **conservative dosing**, safety, and evidence-based guidance across **${peptides.length} compounds** in **${categories.length} categories**.\n\nAsk me anything about mechanisms, dosing math, reconstitution, stacking, or safety — or use the **Protocol Builder** tab for a fully structured protocol tailored to your goals.`,
  }]);
  const [input, setInput]         = useState('');
  const [loading, setLoading]     = useState(false);
  const [apiError, setApiError]   = useState<string | null>(null);
  const [usingLocal, setUsingLocal] = useState(false);
  const bottomRef                 = useRef<HTMLDivElement>(null);
  const inputRef                  = useRef<HTMLInputElement>(null);

  // Protocol Builder state
  const [form, setForm] = useState<ProtocolForm>({
    goal: '', experience: 'Some experience', budget: 'Moderate ($200–400/mo)',
    concerns: '', contraindications: '', duration: '8 weeks',
  });
  const [builderLoading, setBuilderLoading] = useState(false);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const appendChunk = useCallback((text: string) => {
    setMessages(prev => {
      const last = prev[prev.length - 1];
      if (last?.streaming) {
        return [...prev.slice(0, -1), { ...last, content: last.content + text }];
      }
      return [...prev, { role: 'assistant', content: text, streaming: true }];
    });
  }, []);

  const finalizeStream = useCallback(() => {
    setMessages(prev => {
      const last = prev[prev.length - 1];
      if (last?.streaming) return [...prev.slice(0, -1), { ...last, streaming: false }];
      return prev;
    });
    setLoading(false);
  }, []);

  const send = useCallback((overrideInput?: string) => {
    const userText = (overrideInput ?? input).trim();
    if (!userText || loading) return;
    setInput('');
    setApiError(null);
    setUsingLocal(false);

    const updatedMsgs: Message[] = [...messages, { role: 'user', content: userText }];
    setMessages(updatedMsgs);
    setLoading(true);

    const apiMessages = updatedMsgs
      .filter(m => !m.streaming)
      .map(m => ({ role: m.role, content: m.content }));

    streamChat(
      apiMessages,
      appendChunk,
      finalizeStream,
      (err) => {
        // API unavailable — fall back to local KB
        if (err.includes('ANTHROPIC_API_KEY') || err.includes('Network error') || err.includes('fetch')) {
          setUsingLocal(true);
          const localReply = getLocalResponse(userText);
          setMessages(prev => [...prev, { role: 'assistant', content: localReply }]);
        } else {
          setApiError(err);
          setMessages(prev => [...prev, { role: 'assistant', content: `⚠️ **Error:** ${err}\n\nPlease try again or check your API configuration.` }]);
        }
        setLoading(false);
      }
    );
  }, [input, loading, messages, appendChunk, finalizeStream]);

  const buildProtocol = useCallback(() => {
    if (!form.goal || builderLoading) return;
    setBuilderLoading(true);
    const prompt = buildProtocolPrompt(form);
    setTab('chat');

    const updatedMsgs: Message[] = [
      ...messages,
      { role: 'user', content: prompt },
    ];
    setMessages(updatedMsgs);
    setLoading(true);
    setBuilderLoading(false);

    const apiMessages = updatedMsgs.map(m => ({ role: m.role, content: m.content }));
    streamChat(
      apiMessages,
      appendChunk,
      finalizeStream,
      (err) => {
        if (err.includes('ANTHROPIC_API_KEY') || err.includes('Network error')) {
          setUsingLocal(true);
          const goalLabel = GOALS.find(g => g.value === form.goal)?.label ?? form.goal;
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: `**Protocol Builder — ${goalLabel}**\n\nThe AI API isn't connected yet. Once you add your Anthropic API key to Vercel, this will generate a fully personalized protocol.\n\nIn the meantime, check the **Wiki** tab for peptides matching your goal, or ask the chatbot a specific question about a peptide.`,
          }]);
        } else {
          setMessages(prev => [...prev, { role: 'assistant', content: `⚠️ **Error:** ${err}` }]);
        }
        setLoading(false);
      }
    );
  }, [form, builderLoading, messages, appendChunk, finalizeStream]);

  const suggestions = [
    'Conservative fat loss + joint support protocol (with recon math)',
    'Explain BPC-157 mechanism, benefits, and risks',
    'Calculate dosing from a 3 mL vial',
    'GLP-1 vs lifestyle interventions for weight loss',
    'Labs to consider before starting a peptide protocol',
    'Conservative sleep and recovery stack',
    'How long are reconstituted peptides stable?',
    "I'm new — teach me syringe units and mcg vs mg",
  ];

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '24px 16px 16px', display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>

      {/* Header */}
      <div style={{ marginBottom: 16, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 3, letterSpacing: '-0.02em', fontFamily: "'DM Sans', sans-serif" }}>
              The Peptide Atlas
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 12.5 }}>
              Evidence-based guidance · conservative dosing · reconstitution math
            </p>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 10, padding: 3, gap: 2 }}>
            {([['chat', 'AI Chat'], ['builder', 'Protocol Builder']] as [Tab, string][]).map(([id, label]) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                style={{
                  padding: '6px 14px', borderRadius: 8, fontSize: 12.5, fontWeight: tab === id ? 600 : 400,
                  background: tab === id ? 'var(--bg-card-hover)' : 'transparent',
                  color: tab === id ? 'var(--text-primary)' : 'var(--text-muted)',
                  border: tab === id ? '1px solid var(--border-light)' : '1px solid transparent',
                  transition: 'all var(--t-fast)',
                  fontFamily: 'inherit',
                }}
              >{label}</button>
            ))}
          </div>
        </div>

        {/* Status indicators */}
        {usingLocal && (
          <div style={{ marginTop: 10, padding: '8px 12px', background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 8, fontSize: 12, color: '#fbbf24', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>⚡</span>
            Using local knowledge base — add <code style={{ background: 'rgba(255,255,255,0.07)', padding: '1px 5px', borderRadius: 3 }}>ANTHROPIC_API_KEY</code> to Vercel for full AI responses
          </div>
        )}
        {apiError && (
          <div style={{ marginTop: 10, padding: '8px 12px', background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, fontSize: 12, color: '#f87171' }}>
            API error: {apiError}
          </div>
        )}
      </div>

      {/* ── CHAT TAB ── */}
      {tab === 'chat' && (
        <>
          {/* Messages */}
          <div data-scroll style={{
            flex: 1, overflowY: 'auto', minHeight: 0,
            background: 'var(--bg-surface)', border: '1px solid var(--border)',
            borderRadius: 14, padding: '16px',
            display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 12,
          }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', gap: 10 }}>
                {msg.role === 'assistant' && (
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                    background: 'linear-gradient(135deg, #3b82f6 0%, #7c3aed 100%)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, marginTop: 2,
                  }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 0 2h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1 0-2h1a7 7 0 0 1 7-7h1V5.73C10.4 5.39 10 4.74 10 4a2 2 0 0 1 2-2z"/>
                    </svg>
                  </div>
                )}
                <div style={{
                  maxWidth: '80%',
                  background: msg.role === 'user' ? 'rgba(59,130,246,0.12)' : 'var(--bg-card)',
                  border: `1px solid ${msg.role === 'user' ? 'rgba(59,130,246,0.25)' : 'var(--border)'}`,
                  borderRadius: msg.role === 'user' ? '14px 14px 4px 14px' : '4px 14px 14px 14px',
                  padding: '12px 15px',
                }}>
                  {msg.role === 'user' ? (
                    <div style={{ fontSize: 13.5, color: 'var(--text-primary)', lineHeight: 1.5 }}>{msg.content}</div>
                  ) : (
                    <MessageContent content={msg.content} />
                  )}
                  {msg.streaming && (
                    <span style={{ display: 'inline-block', width: 8, height: 14, background: 'var(--accent)', borderRadius: 2, marginLeft: 2, verticalAlign: 'text-bottom', animation: 'blink 0.8s step-end infinite' }} />
                  )}
                </div>
              </div>
            ))}

            {loading && !messages[messages.length - 1]?.streaming && (
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6, #7c3aed)', flexShrink: 0 }} />
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '4px 14px 14px 14px', padding: '14px 18px', display: 'flex', gap: 5, alignItems: 'center' }}>
                  {[0, 1, 2].map(i => (
                    <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', animation: `typingDot 1.2s ${i * 0.2}s infinite ease-in-out` }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Suggestions — horizontal scroll on mobile, wrap on desktop */}
          <div className="suggestion-chips" style={{ marginBottom: 8, flexShrink: 0 }}>
            {suggestions.map(s => (
              <button
                key={s}
                onClick={() => send(s)}
                disabled={loading}
                style={{
                  background: 'var(--bg-surface)', border: '1px solid var(--border)',
                  color: 'var(--text-muted)', fontSize: 11.5, padding: '5px 11px', borderRadius: 20,
                  fontFamily: 'inherit', cursor: loading ? 'default' : 'pointer',
                  transition: 'all var(--t-fast)',
                  opacity: loading ? 0.5 : 1,
                }}
                onMouseOver={e => { if (!loading) { e.currentTarget.style.borderColor = 'var(--border-light)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}}
                onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
              >{s}</button>
            ))}
          </div>

          {/* Input */}
          <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
              placeholder="Ask about any peptide, stack, dosing, or mechanism…"
              style={{ flex: 1 }}
              disabled={loading}
            />
            <button
              className="btn btn-primary"
              onClick={() => send()}
              disabled={!input.trim() || loading}
              style={{ whiteSpace: 'nowrap', opacity: (!input.trim() || loading) ? 0.5 : 1, flexShrink: 0 }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: 'rotate(-45deg)' }}><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
              Send
            </button>
          </div>
        </>
      )}

      {/* ── PROTOCOL BUILDER TAB ── */}
      {tab === 'builder' && (
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '20px 22px', marginBottom: 16 }}>
            <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4, fontFamily: "'DM Sans', sans-serif" }}>Build a Personalized Protocol</div>
            <p style={{ fontSize: 12.5, color: 'var(--text-muted)', lineHeight: 1.55, marginBottom: 20 }}>
              Answer a few questions and the AI will generate a complete, detailed peptide research protocol tailored to your goals.
            </p>

            {/* Goal */}
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--text-muted)', marginBottom: 8, fontFamily: "'DM Sans', sans-serif" }}>Primary Goal *</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 6 }}>
                {GOALS.map(g => (
                  <button
                    key={g.value}
                    onClick={() => setForm(f => ({ ...f, goal: g.value }))}
                    style={{
                      background: form.goal === g.value ? 'rgba(59,130,246,0.1)' : 'var(--bg-card)',
                      border: `1px solid ${form.goal === g.value ? 'rgba(59,130,246,0.4)' : 'var(--border)'}`,
                      borderRadius: 10, padding: '10px 12px', textAlign: 'left', cursor: 'pointer',
                      transition: 'all var(--t-fast)', fontFamily: 'inherit',
                    }}
                    onMouseOver={e => { if (form.goal !== g.value) e.currentTarget.style.borderColor = 'var(--border-light)'; }}
                    onMouseOut={e => { if (form.goal !== g.value) e.currentTarget.style.borderColor = 'var(--border)'; }}
                  >
                    <div style={{ fontSize: 12.5, fontWeight: 600, color: form.goal === g.value ? '#93c5fd' : 'var(--text-secondary)', marginBottom: 2 }}>{g.label}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.4 }}>{g.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Experience + Budget row */}
            <div className="recon-subgrid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--text-muted)', marginBottom: 6, fontFamily: "'DM Sans', sans-serif" }}>Experience Level</label>
                <select value={form.experience} onChange={e => setForm(f => ({ ...f, experience: e.target.value }))}>
                  <option>First time (no experience)</option>
                  <option>Some experience</option>
                  <option>Experienced researcher</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--text-muted)', marginBottom: 6, fontFamily: "'DM Sans', sans-serif" }}>Monthly Budget</label>
                <select value={form.budget} onChange={e => setForm(f => ({ ...f, budget: e.target.value }))}>
                  <option>Conservative ($100–200/mo)</option>
                  <option>Moderate ($200–400/mo)</option>
                  <option>Premium ($400+/mo)</option>
                </select>
              </div>
            </div>

            {/* Duration */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--text-muted)', marginBottom: 6, fontFamily: "'DM Sans', sans-serif" }}>Protocol Duration</label>
              <select value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))} style={{ maxWidth: 280 }}>
                <option>4 weeks</option>
                <option>6 weeks</option>
                <option>8 weeks</option>
                <option>12 weeks</option>
                <option>Ongoing maintenance</option>
              </select>
            </div>

            {/* Concerns */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--text-muted)', marginBottom: 6, fontFamily: "'DM Sans', sans-serif" }}>Specific Concerns or Target Areas</label>
              <input
                value={form.concerns}
                onChange={e => setForm(f => ({ ...f, concerns: e.target.value }))}
                placeholder="e.g. chronic knee injury, poor sleep quality, brain fog, gut issues…"
              />
            </div>

            {/* Contraindications */}
            <div style={{ marginBottom: 22 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--text-muted)', marginBottom: 6, fontFamily: "'DM Sans', sans-serif" }}>Health Considerations / Contraindications</label>
              <input
                value={form.contraindications}
                onChange={e => setForm(f => ({ ...f, contraindications: e.target.value }))}
                placeholder="e.g. hypertension, cancer history, diabetes, current medications…"
              />
            </div>

            <button
              className="btn btn-primary"
              onClick={buildProtocol}
              disabled={!form.goal || loading || builderLoading}
              style={{ opacity: (!form.goal || loading || builderLoading) ? 0.5 : 1, fontSize: 13.5, padding: '10px 24px' }}
            >
              {loading || builderLoading ? 'Generating…' : 'Generate My Protocol →'}
            </button>

            {!form.goal && (
              <div style={{ marginTop: 10, fontSize: 12, color: 'var(--text-muted)' }}>Select a goal above to continue</div>
            )}
          </div>

          {/* Sourcing note */}
          <div style={{ padding: '12px 16px', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderLeft: '3px solid var(--green)', borderRadius: 'var(--radius)', fontSize: 12.5, color: 'var(--text-muted)', lineHeight: 1.55 }}>
            <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Quality sourcing is built into every protocol.</span>
            {' '}All recommendations use pharmaceutical-grade, HPLC-tested peptides. We exclusively recommend{' '}
            <a href="https://www.shortproteins.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--green)', fontWeight: 600 }}>Short Proteins</a>
            {' '}— third-party verified on every batch.
          </div>
        </div>
      )}

      <style>{`
        @keyframes typingDot {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-4px); opacity: 1; }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
