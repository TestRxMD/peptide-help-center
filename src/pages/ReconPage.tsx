import { useState, useMemo } from 'react';
import { peptides } from '../data/peptides';

export default function ReconPage() {
  const [peptideId, setPeptideId]   = useState('bpc-157');
  const [weight, setWeight]         = useState(80);
  const [unit, setUnit]             = useState<'kg' | 'lbs'>('lbs');
  const [vialMg, setVialMg]         = useState(5);
  const [waterMl, setWaterMl]       = useState(2);
  const [desiredMg, setDesiredMg] = useState(0.25);

  const peptide = useMemo(() => peptides.find(p => p.id === peptideId), [peptideId]);

  const weightKg = unit === 'lbs' ? weight * 0.453592 : weight;
  const desiredMcg = desiredMg * 1000; // derived — all downstream calculations unchanged
  const concentration = (vialMg * 1000) / waterMl; // mcg/mL
  const drawMl  = desiredMcg / concentration;
  const drawUnits = drawMl * 100; // insulin units (U100 syringe)

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 16px' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
          🧮 Recon Calculator
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 13.5 }}>
          Reconstitution & dosing calculator. Enter your vial size and desired dose to get exact draw amounts.
        </p>
      </div>

      <div className="recon-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

        {/* Left: Inputs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="card">
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14, color: 'var(--text-primary)' }}>
              Peptide Selection
            </div>
            <div style={{ marginBottom: 10 }}>
              <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Peptide</label>
              <select value={peptideId} onChange={e => setPeptideId(e.target.value)}>
                {peptides.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            {peptide && (
              <div style={{
                padding: '10px 12px',
                background: 'var(--bg-input)', borderRadius: 8,
                border: '1px solid var(--border)',
                fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5,
              }}>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 3 }}>
                  {peptide.emoji} {peptide.name}
                </div>
                {peptide.dosageRange && <div>Typical dose: {peptide.dosageRange}</div>}
                {peptide.halfLife && <div>Half-life: {peptide.halfLife}</div>}
                {peptide.routes && <div>Routes: {peptide.routes.join(', ')}</div>}
              </div>
            )}
          </div>

          <div className="card">
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14, color: 'var(--text-primary)' }}>
              Body Weight
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="number"
                value={weight}
                onChange={e => setWeight(Number(e.target.value))}
                min={30} max={300}
                style={{ flex: 1 }}
              />
              <select value={unit} onChange={e => setUnit(e.target.value as 'kg' | 'lbs')} style={{ width: 80 }}>
                <option value="kg">kg</option>
                <option value="lbs">lbs</option>
              </select>
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 6 }}>
              = {weightKg.toFixed(1)} kg
            </div>
          </div>

          <div className="card">
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14, color: 'var(--text-primary)' }}>
              Vial Reconstitution
            </div>
            <div className="recon-subgrid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Vial size (mg)</label>
                <input type="number" value={vialMg} onChange={e => setVialMg(Number(e.target.value))} min={0.5} step={0.5} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>BAC water (mL)</label>
                <input type="number" value={waterMl} onChange={e => setWaterMl(Number(e.target.value))} min={0.5} step={0.5} />
              </div>
            </div>
          </div>

          <div className="card">
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14, color: 'var(--text-primary)' }}>
              Desired Dose
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Dose (mg)</label>
              <input
                type="number"
                value={desiredMg}
                onChange={e => setDesiredMg(Number(e.target.value))}
                min={0.001}
                step={0.05}
              />
              <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 6 }}>
                = {Math.round(desiredMcg).toLocaleString()} mcg
              </div>
            </div>
          </div>
        </div>

        {/* Right: Results */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="card" style={{ borderColor: 'rgba(59,130,246,0.3)' }}>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 16, color: 'var(--text-primary)' }}>
              📐 Reconstitution Results
            </div>

            <div className="recon-subgrid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {/* Concentration — special two-unit card */}
              <div
                className="detail-item"
                style={{ borderColor: 'rgba(31,64,204,0.25)', background: 'rgba(31,64,204,0.06)' }}
              >
                <div className="detail-item-label">Concentration</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
                  <span className="detail-item-value" style={{ fontSize: 17, color: 'var(--accent)', fontWeight: 700 }}>
                    {(concentration / 1000).toFixed(2)} mg/mL
                  </span>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500, whiteSpace: 'nowrap' }}>
                    = {concentration.toFixed(0)} mcg/mL
                  </span>
                </div>
              </div>

              {[
                { label: 'Draw Volume',    value: `${drawMl.toFixed(3)} mL`,                              highlight: true  },
                { label: 'Insulin Syringe', value: `${drawUnits.toFixed(1)} units (U100)`,               highlight: false },
                { label: 'Doses per Vial', value: `${Math.floor((vialMg * 1000) / desiredMcg)} doses`,   highlight: false },
              ].map(item => (
                <div
                  key={item.label}
                  className="detail-item"
                  style={item.highlight ? { borderColor: 'rgba(31,64,204,0.25)', background: 'rgba(31,64,204,0.06)' } : {}}
                >
                  <div className="detail-item-label">{item.label}</div>
                  <div className="detail-item-value" style={{ fontSize: item.highlight ? 17 : 13, color: item.highlight ? 'var(--accent)' : undefined, fontWeight: item.highlight ? 700 : 500 }}>
                    {item.value}
                  </div>
                </div>
              ))}
            </div>

            {/* Visual syringe guide */}
            <div style={{
              marginTop: 16, padding: '12px 14px',
              background: 'var(--bg-input)', border: '1px solid var(--border)',
              borderRadius: 8,
            }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Visual Draw Guide
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                {Array.from({ length: 20 }, (_, i) => {
                  const fillTo = Math.round(drawUnits / 5);
                  return (
                    <div key={i} style={{
                      flex: 1, height: 28, borderRadius: 3,
                      background: i < fillTo ? '#3b82f6' : 'var(--border)',
                      transition: '200ms',
                    }} />
                  );
                })}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>
                <span>0</span><span>50</span><span>100 units</span>
              </div>
              <div style={{ fontSize: 12, color: '#93c5fd', marginTop: 6, fontWeight: 600 }}>
                Draw to {drawUnits.toFixed(1)} units on a U100 insulin syringe
              </div>
            </div>
          </div>

          {/* Storage notes */}
          <div className="card">
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12, color: 'var(--text-primary)' }}>
              🧊 Storage & Handling
            </div>
            <ul className="bullet-list">
              <li>Lyophilized (dry) peptide: store at −20°C or refrigerate</li>
              <li>After reconstitution: refrigerate at 4°C, use within 4–6 weeks</li>
              <li>Use bacteriostatic water (BAC water), not sterile water</li>
              <li>Do not shake — gently swirl to dissolve</li>
              <li>Inspect for particles before each use</li>
              <li>Single-use vials: discard after opening if using sterile water</li>
            </ul>
          </div>

          {/* Disclaimer */}
          <div style={{
            padding: '10px 14px',
            background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.18)',
            borderRadius: 8, fontSize: 11.5, color: 'var(--text-muted)', lineHeight: 1.5,
          }}>
            ⚠️ Educational tool only. Calculations assume U100 insulin syringes. Verify all calculations independently. Consult a healthcare provider before administering any peptide.
          </div>
        </div>
      </div>
    </div>
  );
}
