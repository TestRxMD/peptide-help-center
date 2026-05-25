import { useState, useMemo } from 'react';
import type { LabDraw } from '../types';
import { addLabDraw } from '../lib/supabase';

// ── Biomarker catalog ─────────────────────────────────────────────

interface BiomarkerDef {
  name: string;
  category: string;
  unit: string;
  ref_low: number;
  ref_high: number;
  optimal_low?: number;
  optimal_high?: number;
  note?: string;
}

const CATALOG: BiomarkerDef[] = [
  // GH Axis
  { name: 'IGF-1',             category: 'GH Axis',     unit: 'ng/mL',          ref_low: 115,  ref_high: 307,  optimal_low: 200, optimal_high: 300, note: 'Primary marker for GH status; rises with peptide therapy' },
  { name: 'IGFBP-3',           category: 'GH Axis',     unit: 'mg/L',           ref_low: 1.3,  ref_high: 8.0,  optimal_low: 3.5, optimal_high: 6.0 },

  // Hormones
  { name: 'Total Testosterone', category: 'Hormones',   unit: 'ng/dL',          ref_low: 300,  ref_high: 1000, optimal_low: 600, optimal_high: 900 },
  { name: 'Free Testosterone',  category: 'Hormones',   unit: 'pg/mL',          ref_low: 50,   ref_high: 210,  optimal_low: 100, optimal_high: 180 },
  { name: 'Estradiol (E2)',     category: 'Hormones',   unit: 'pg/mL',          ref_low: 10,   ref_high: 40,   optimal_low: 20,  optimal_high: 35 },
  { name: 'SHBG',               category: 'Hormones',   unit: 'nmol/L',         ref_low: 16,   ref_high: 55,   optimal_low: 18,  optimal_high: 40 },
  { name: 'LH',                 category: 'Hormones',   unit: 'mIU/mL',         ref_low: 1.7,  ref_high: 8.6 },
  { name: 'FSH',                category: 'Hormones',   unit: 'mIU/mL',         ref_low: 1.5,  ref_high: 12.4 },
  { name: 'DHEA-S',             category: 'Hormones',   unit: 'μg/dL',          ref_low: 80,   ref_high: 560,  optimal_low: 200, optimal_high: 450 },
  { name: 'Cortisol (AM)',      category: 'Hormones',   unit: 'μg/dL',          ref_low: 6,    ref_high: 23,   optimal_low: 10,  optimal_high: 18 },
  { name: 'Progesterone',       category: 'Hormones',   unit: 'ng/mL',          ref_low: 0.2,  ref_high: 1.4 },

  // Thyroid
  { name: 'TSH',                category: 'Thyroid',    unit: 'mIU/L',          ref_low: 0.4,  ref_high: 4.0,  optimal_low: 0.5, optimal_high: 2.0, note: 'Optimal thyroid function supports peptide efficacy' },
  { name: 'Free T3',            category: 'Thyroid',    unit: 'pg/mL',          ref_low: 2.3,  ref_high: 4.2,  optimal_low: 3.0, optimal_high: 4.0 },
  { name: 'Free T4',            category: 'Thyroid',    unit: 'ng/dL',          ref_low: 0.8,  ref_high: 1.8,  optimal_low: 1.1, optimal_high: 1.6 },
  { name: 'Reverse T3',         category: 'Thyroid',    unit: 'ng/dL',          ref_low: 9,    ref_high: 24,   optimal_low: 9,   optimal_high: 15 },

  // Metabolic
  { name: 'Fasting Glucose',    category: 'Metabolic',  unit: 'mg/dL',          ref_low: 70,   ref_high: 99,   optimal_low: 72,  optimal_high: 90 },
  { name: 'HbA1c',              category: 'Metabolic',  unit: '%',              ref_low: 0,    ref_high: 5.6,  optimal_low: 4.5, optimal_high: 5.3 },
  { name: 'Fasting Insulin',    category: 'Metabolic',  unit: 'μIU/mL',         ref_low: 2,    ref_high: 19,   optimal_low: 2,   optimal_high: 8 },
  { name: 'Total Cholesterol',  category: 'Metabolic',  unit: 'mg/dL',          ref_low: 125,  ref_high: 200,  optimal_low: 150, optimal_high: 190 },
  { name: 'LDL',                category: 'Metabolic',  unit: 'mg/dL',          ref_low: 0,    ref_high: 100,  optimal_low: 50,  optimal_high: 90 },
  { name: 'HDL',                category: 'Metabolic',  unit: 'mg/dL',          ref_low: 40,   ref_high: 999,  optimal_low: 60,  optimal_high: 100 },
  { name: 'Triglycerides',      category: 'Metabolic',  unit: 'mg/dL',          ref_low: 0,    ref_high: 150,  optimal_low: 50,  optimal_high: 100 },

  // Inflammation
  { name: 'hs-CRP',             category: 'Inflammation', unit: 'mg/L',         ref_low: 0,    ref_high: 3.0,  optimal_low: 0,   optimal_high: 0.5, note: 'Key inflammation marker; should decline during healing protocols' },
  { name: 'Homocysteine',       category: 'Inflammation', unit: 'μmol/L',       ref_low: 0,    ref_high: 15,   optimal_low: 5,   optimal_high: 9 },
  { name: 'Fibrinogen',         category: 'Inflammation', unit: 'mg/dL',        ref_low: 200,  ref_high: 400,  optimal_low: 200, optimal_high: 300 },

  // Vitamins & Minerals
  { name: 'Vitamin D (25-OH)',  category: 'Vitamins',   unit: 'ng/mL',          ref_low: 30,   ref_high: 100,  optimal_low: 50,  optimal_high: 80, note: 'Supports GH signaling and immune function' },
  { name: 'Vitamin B12',        category: 'Vitamins',   unit: 'pg/mL',          ref_low: 200,  ref_high: 900,  optimal_low: 600, optimal_high: 900 },
  { name: 'Ferritin',           category: 'Vitamins',   unit: 'ng/mL',          ref_low: 30,   ref_high: 300,  optimal_low: 50,  optimal_high: 150 },
  { name: 'Magnesium (RBC)',    category: 'Vitamins',   unit: 'mg/dL',          ref_low: 4.2,  ref_high: 6.8,  optimal_low: 5.5, optimal_high: 6.5 },
  { name: 'Zinc',               category: 'Vitamins',   unit: 'μg/dL',          ref_low: 60,   ref_high: 130,  optimal_low: 80,  optimal_high: 120 },

  // Kidney / Liver
  { name: 'ALT',                category: 'Kidney/Liver', unit: 'U/L',          ref_low: 7,    ref_high: 56,   optimal_low: 10,  optimal_high: 30 },
  { name: 'AST',                category: 'Kidney/Liver', unit: 'U/L',          ref_low: 10,   ref_high: 40,   optimal_low: 10,  optimal_high: 25 },
  { name: 'eGFR',               category: 'Kidney/Liver', unit: 'mL/min/1.73m²',ref_low: 60,   ref_high: 999,  optimal_low: 90, optimal_high: 999 },
  { name: 'Creatinine',         category: 'Kidney/Liver', unit: 'mg/dL',        ref_low: 0.6,  ref_high: 1.2,  optimal_low: 0.7, optimal_high: 1.0 },
  { name: 'BUN',                category: 'Kidney/Liver', unit: 'mg/dL',        ref_low: 7,    ref_high: 25,   optimal_low: 8,   optimal_high: 18 },

  // Blood Count
  { name: 'Hemoglobin',         category: 'Blood',      unit: 'g/dL',           ref_low: 13.5, ref_high: 17.5, optimal_low: 14,  optimal_high: 16.5 },
  { name: 'Hematocrit',         category: 'Blood',      unit: '%',              ref_low: 38,   ref_high: 52,   optimal_low: 40,  optimal_high: 50 },
  { name: 'Platelets',          category: 'Blood',      unit: 'K/μL',           ref_low: 150,  ref_high: 400,  optimal_low: 180, optimal_high: 350 },
  { name: 'WBC',                category: 'Blood',      unit: 'K/μL',           ref_low: 3.5,  ref_high: 10.5, optimal_low: 4.5, optimal_high: 8.0 },
  { name: 'PSA Total',          category: 'Blood',      unit: 'ng/mL',          ref_low: 0,    ref_high: 4.0,  optimal_low: 0,   optimal_high: 2.0 },
];

const CATEGORIES = ['All', 'GH Axis', 'Hormones', 'Thyroid', 'Metabolic', 'Inflammation', 'Vitamins', 'Kidney/Liver', 'Blood'];

// ── Status helpers ─────────────────────────────────────────────────

type Status = 'optimal' | 'normal' | 'borderline' | 'low' | 'high' | 'critical';

function getStatus(value: number, def: BiomarkerDef): Status {
  const { ref_low, ref_high, optimal_low, optimal_high } = def;
  if (optimal_low !== undefined && optimal_high !== undefined) {
    if (value >= optimal_low && value <= optimal_high) return 'optimal';
  }
  if (value < ref_low) return value < ref_low * 0.85 ? 'critical' : 'low';
  if (value > ref_high && ref_high < 900) return value > ref_high * 1.2 ? 'critical' : 'high';
  return 'normal';
}

const STATUS_STYLE: Record<Status, { bg: string; border: string; color: string; label: string }> = {
  optimal:    { bg: 'rgba(21,128,61,0.10)',  border: 'rgba(21,128,61,0.3)',   color: '#15803d', label: 'Optimal'    },
  normal:     { bg: 'rgba(31,64,204,0.08)',  border: 'rgba(31,64,204,0.25)',  color: 'var(--accent)', label: 'Normal' },
  borderline: { bg: 'rgba(180,83,9,0.08)',   border: 'rgba(180,83,9,0.3)',    color: '#b45309', label: 'Borderline' },
  low:        { bg: 'rgba(180,83,9,0.08)',   border: 'rgba(180,83,9,0.3)',    color: '#b45309', label: 'Low'        },
  high:       { bg: 'rgba(180,83,9,0.08)',   border: 'rgba(180,83,9,0.3)',    color: '#b45309', label: 'High'       },
  critical:   { bg: 'rgba(220,38,38,0.08)',  border: 'rgba(220,38,38,0.3)',   color: '#dc2626', label: 'Critical'   },
};

function trendArrow(vals: number[]): { arrow: string; color: string } {
  if (vals.length < 2) return { arrow: '—', color: 'var(--text-muted)' };
  const delta = vals[vals.length - 1] - vals[vals.length - 2];
  const pct = Math.abs(delta / vals[vals.length - 2]) * 100;
  if (pct < 2) return { arrow: '→', color: 'var(--text-muted)' };
  return delta > 0
    ? { arrow: '↑', color: '#15803d' }
    : { arrow: '↓', color: '#dc2626' };
}

// ── SVG Sparkline ─────────────────────────────────────────────────

function Sparkline({ id, values, refLow, refHigh, width = 100, height = 40 }: {
  id: string; values: number[];
  refLow?: number; refHigh?: number;
  width?: number; height?: number;
}) {
  if (values.length < 2) return null;
  const pad = 4;
  const iw = width - pad * 2;
  const ih = height - pad * 2;
  const all = [...values];
  if (refLow) all.push(refLow);
  if (refHigh && refHigh < 900) all.push(refHigh);
  const min = Math.min(...all) * 0.88;
  const max = Math.max(...all) * 1.12;
  const rng = max - min || 1;
  const sx = (i: number) => pad + (i / (values.length - 1)) * iw;
  const sy = (v: number) => pad + (1 - (v - min) / rng) * ih;
  const pathD = values.map((v, i) => `${i === 0 ? 'M' : 'L'}${sx(i).toFixed(1)},${sy(v).toFixed(1)}`).join(' ');
  const areaD = `${pathD} L${sx(values.length - 1).toFixed(1)},${(pad + ih).toFixed(1)} L${pad},${(pad + ih).toFixed(1)} Z`;
  const gid = `sg-${id.replace(/[^a-z0-9]/gi, '')}`;
  const refHighY = refHigh && refHigh < 900 ? sy(refHigh) : pad;
  const refLowY  = refLow ? sy(refLow) : pad + ih;

  return (
    <svg width={width} height={height} style={{ display: 'block', overflow: 'visible' }}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.3} />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity={0.02} />
        </linearGradient>
      </defs>
      {refLow !== undefined && refHigh !== undefined && (
        <rect x={pad} y={refHighY} width={iw} height={Math.max(0, refLowY - refHighY)}
          fill="rgba(21,128,61,0.12)" rx={2} />
      )}
      <path d={areaD} fill={`url(#${gid})`} />
      <path d={pathD} fill="none" stroke="var(--accent)" strokeWidth={1.5}
        strokeLinecap="round" strokeLinejoin="round" />
      {values.map((v, i) => (
        <circle key={i} cx={sx(i)} cy={sy(v)} r={i === values.length - 1 ? 3.5 : 2}
          fill={i === values.length - 1 ? 'var(--accent)' : 'var(--bg-surface)'}
          stroke="var(--accent)" strokeWidth={1.5} />
      ))}
    </svg>
  );
}

// ── Range Bar ─────────────────────────────────────────────────────

function RangeBar({ value, def, status }: { value: number; def: BiomarkerDef; status: Status }) {
  const { ref_low, ref_high } = def;
  const clampedHigh = ref_high > 900 ? ref_low * 3 : ref_high;
  const span = clampedHigh - ref_low;
  const padded = span * 0.5;
  const fullMin = ref_low - padded;
  const fullMax = clampedHigh + padded;
  const fullRange = fullMax - fullMin;
  const pct = (v: number) => Math.max(0, Math.min(100, ((v - fullMin) / fullRange) * 100));

  const dotColor = STATUS_STYLE[status].color;

  return (
    <div style={{ marginTop: 10 }}>
      <div style={{ position: 'relative', height: 6, background: 'var(--bg-subtle)', borderRadius: 3 }}>
        {/* Reference range zone */}
        <div style={{
          position: 'absolute',
          left: `${pct(ref_low)}%`,
          width: `${pct(clampedHigh) - pct(ref_low)}%`,
          height: '100%', background: 'rgba(21,128,61,0.4)', borderRadius: 3,
        }} />
        {/* Value dot */}
        <div style={{
          position: 'absolute',
          left: `${pct(value)}%`,
          top: '50%', transform: 'translate(-50%,-50%)',
          width: 12, height: 12, borderRadius: '50%',
          background: dotColor,
          border: '2px solid var(--bg-surface)',
          boxShadow: '0 1px 4px rgba(0,0,0,0.25)',
          zIndex: 2,
        }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9.5, color: 'var(--text-muted)', marginTop: 4 }}>
        <span>{ref_low} {def.unit}</span>
        <span style={{ fontSize: 9, color: '#15803d', fontWeight: 600 }}>▌ Normal range</span>
        <span>{ref_high < 900 ? `${ref_high} ${def.unit}` : '↑'}</span>
      </div>
    </div>
  );
}

// ── Biomarker Card ────────────────────────────────────────────────

function BiomarkerCard({ def, draws, onAdd }: {
  def: BiomarkerDef;
  draws: LabDraw[];
  onAdd: (marker: string) => void;
}) {
  const sorted = [...draws].sort((a, b) => a.drawn_date.localeCompare(b.drawn_date));
  const values = sorted.map(d => d.value);
  const latest = sorted[sorted.length - 1];
  const status = latest ? getStatus(latest.value, def) : null;
  const trend  = trendArrow(values);
  const ss     = status ? STATUS_STYLE[status] : null;
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className="card"
      style={{
        borderColor: ss ? ss.border : 'var(--border)',
        background: ss ? ss.bg : 'var(--bg-card)',
        cursor: draws.length > 0 ? 'pointer' : 'default',
        transition: 'all 150ms',
      }}
      onClick={() => draws.length > 0 && setExpanded(v => !v)}
    >
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 6 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>{def.name}</div>
          <div style={{ fontSize: 10.5, color: 'var(--text-muted)', marginTop: 1 }}>{def.unit}</div>
        </div>
        {status && ss && (
          <span style={{
            fontSize: 9.5, fontWeight: 700, padding: '2px 7px', borderRadius: 5, flexShrink: 0,
            background: ss.bg, border: `1px solid ${ss.border}`, color: ss.color,
          }}>{ss.label}</span>
        )}
      </div>

      {/* Value + trend */}
      {latest ? (
        <>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: 26, fontWeight: 800, color: ss?.color ?? 'var(--text-primary)', lineHeight: 1 }}>
              {latest.value % 1 === 0 ? latest.value : latest.value.toFixed(1)}
            </span>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{def.unit}</span>
            <span style={{ fontSize: 16, fontWeight: 700, color: trend.color, marginLeft: 'auto' }}>{trend.arrow}</span>
          </div>

          {/* Sparkline — always shown */}
          {values.length >= 2 && (
            <div style={{ marginBottom: 8 }}>
              <Sparkline
                id={def.name}
                values={values}
                refLow={def.ref_low}
                refHigh={def.ref_high < 900 ? def.ref_high : undefined}
                width={220} height={52}
              />
            </div>
          )}

          {/* Range bar */}
          {status && <RangeBar value={latest.value} def={def} status={status} />}

          {/* Expanded: full history + note */}
          {expanded && (
            <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid var(--border)' }}
              onClick={e => e.stopPropagation()}>
              {def.note && (
                <div style={{
                  fontSize: 11.5, color: 'var(--text-secondary)', lineHeight: 1.5,
                  padding: '8px 10px', background: 'var(--bg-input)', borderRadius: 6, marginBottom: 10,
                }}>💡 {def.note}</div>
              )}
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>
                History ({sorted.length} readings)
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {[...sorted].reverse().map(d => {
                  const s = getStatus(d.value, def);
                  const sStyle = STATUS_STYLE[s];
                  return (
                    <div key={d.id} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '5px 8px', borderRadius: 6,
                      background: 'var(--bg-surface)', border: '1px solid var(--border)',
                      fontSize: 12,
                    }}>
                      <span style={{ color: 'var(--text-muted)' }}>{d.drawn_date}</span>
                      <span style={{ fontWeight: 700, color: sStyle.color }}>
                        {d.value} {def.unit}
                      </span>
                      <span style={{
                        fontSize: 10, padding: '1px 6px', borderRadius: 4,
                        background: sStyle.bg, border: `1px solid ${sStyle.border}`, color: sStyle.color,
                      }}>{sStyle.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
            <span style={{ fontSize: 10.5, color: 'var(--text-muted)' }}>
              Last: {latest.drawn_date}
              {sorted.length > 1 && ` · ${sorted.length} readings`}
            </span>
            <button
              className="btn btn-ghost"
              onClick={e => { e.stopPropagation(); onAdd(def.name); }}
              style={{ fontSize: 11, padding: '3px 10px' }}
            >+ Log</button>
          </div>
        </>
      ) : (
        <div style={{ marginTop: 4 }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 10 }}>
            No readings yet
            {def.note && <div style={{ marginTop: 4, fontStyle: 'italic' }}>{def.note}</div>}
          </div>
          <button
            className="btn btn-ghost"
            onClick={e => { e.stopPropagation(); onAdd(def.name); }}
            style={{ fontSize: 11, padding: '4px 12px', width: '100%' }}
          >+ Log First Reading</button>
        </div>
      )}
    </div>
  );
}

// ── Add Reading Form ──────────────────────────────────────────────

function AddReadingForm({ userId, prefillMarker, onSaved, onClose }: {
  userId: string;
  prefillMarker?: string;
  onSaved: (draw: LabDraw) => void;
  onClose: () => void;
}) {
  const def = prefillMarker ? CATALOG.find(c => c.name === prefillMarker) : null;

  const [marker,   setMarker]   = useState(prefillMarker ?? '');
  const [value,    setValue]    = useState('');
  const [unit,     setUnit]     = useState(def?.unit ?? '');
  const [date,     setDate]     = useState(new Date().toISOString().split('T')[0]);
  const [notes,    setNotes]    = useState('');
  const [saving,   setSaving]   = useState(false);
  const [markerSearch, setMarkerSearch] = useState(prefillMarker ?? '');

  const filtered = CATALOG.filter(c =>
    c.name.toLowerCase().includes(markerSearch.toLowerCase())
  ).slice(0, 8);

  const selectMarker = (d: BiomarkerDef) => {
    setMarker(d.name);
    setUnit(d.unit);
    setMarkerSearch(d.name);
  };

  const save = async () => {
    if (!marker || !value || !date) return;
    const chosen = CATALOG.find(c => c.name === marker);
    setSaving(true);
    const result = await addLabDraw(userId, {
      marker, drawn_date: date,
      value: parseFloat(value), unit,
      ref_low: chosen?.ref_low ?? null,
      ref_high: chosen?.ref_high && chosen.ref_high < 900 ? chosen.ref_high : null,
      notes,
    });
    setSaving(false);
    if (result) onSaved(result as unknown as LabDraw);
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(11,21,41,0.5)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
    }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: 'var(--bg-surface)', borderRadius: 16, width: '100%', maxWidth: 440,
        padding: 24, boxShadow: 'var(--shadow-lg)',
        border: '1px solid var(--border-light)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-primary)' }}>📊 Log Biomarker Reading</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: 'var(--text-muted)' }}>✕</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Marker search */}
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Biomarker
            </label>
            <input
              value={markerSearch}
              onChange={e => { setMarkerSearch(e.target.value); setMarker(e.target.value); }}
              placeholder="Search or type marker name…"
            />
            {markerSearch && !CATALOG.find(c => c.name === marker) && filtered.length > 0 && (
              <div style={{
                marginTop: 2, border: '1px solid var(--border)', borderRadius: 8,
                background: 'var(--bg-surface)', overflow: 'hidden', boxShadow: 'var(--shadow)',
              }}>
                {filtered.map(d => (
                  <button key={d.name} onClick={() => selectMarker(d)} style={{
                    width: '100%', textAlign: 'left', padding: '8px 12px',
                    background: 'none', border: 'none', cursor: 'pointer',
                    fontSize: 13, color: 'var(--text-secondary)', fontFamily: 'inherit',
                    borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between',
                  }}>
                    <span>{d.name}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{d.category} · {d.unit}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 10 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Value</label>
              <input type="number" value={value} onChange={e => setValue(e.target.value)} placeholder="e.g. 245" step="any" />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Unit</label>
              <input value={unit} onChange={e => setUnit(e.target.value)} placeholder="ng/mL" />
            </div>
          </div>

          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Draw Date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} />
          </div>

          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Notes (optional)</label>
            <input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Protocol context, fasting status…" />
          </div>

          {/* Preview: show optimal range if known */}
          {marker && CATALOG.find(c => c.name === marker) && (() => {
            const d = CATALOG.find(c => c.name === marker)!;
            const v = parseFloat(value);
            const s = !isNaN(v) ? getStatus(v, d) : null;
            const ss = s ? STATUS_STYLE[s] : null;
            return (
              <div style={{
                padding: '10px 12px', borderRadius: 8,
                background: ss ? ss.bg : 'var(--bg-input)',
                border: `1px solid ${ss ? ss.border : 'var(--border)'}`,
                fontSize: 12, color: 'var(--text-secondary)',
              }}>
                <span style={{ fontWeight: 600 }}>Reference: </span>
                {d.ref_low}–{d.ref_high < 900 ? d.ref_high : '↑'} {d.unit}
                {d.optimal_low && d.optimal_high && (
                  <span style={{ marginLeft: 10, color: '#15803d' }}>
                    · Optimal: {d.optimal_low}–{d.optimal_high}
                  </span>
                )}
                {ss && <span style={{ marginLeft: 10, fontWeight: 700, color: ss.color }}>→ {ss.label}</span>}
              </div>
            );
          })()}

          <button
            className="btn btn-primary"
            onClick={save}
            disabled={saving || !marker || !value || !date}
            style={{ marginTop: 4, opacity: (saving || !marker || !value || !date) ? 0.6 : 1 }}
          >
            {saving ? 'Saving…' : 'Save Reading'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Summary row ───────────────────────────────────────────────────

function SummaryBadge({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{
      flex: 1, minWidth: 90, padding: '12px 14px', borderRadius: 10,
      background: 'var(--bg-input)', border: '1px solid var(--border)',
      textAlign: 'center',
    }}>
      <div style={{ fontSize: 22, fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>{label}</div>
    </div>
  );
}

// ── Main BiomarkersTab ────────────────────────────────────────────

export default function BiomarkersTab({ draws, userId, onDrawAdded }: {
  draws: LabDraw[];
  userId: string;
  onDrawAdded: (d: LabDraw) => void;
}) {
  const [category,    setCategory]    = useState('All');
  const [addMarker,   setAddMarker]   = useState<string | undefined>();
  const [showAdd,     setShowAdd]     = useState(false);
  const [showAll,     setShowAll]     = useState(false);

  // Group draws by marker name
  const drawsByMarker = useMemo(() => {
    const map: Record<string, LabDraw[]> = {};
    draws.forEach(d => {
      if (!map[d.marker]) map[d.marker] = [];
      map[d.marker].push(d);
    });
    return map;
  }, [draws]);

  // Summary counts
  const tracked  = Object.keys(drawsByMarker).length;
  const statuses = draws.map(d => {
    const def = CATALOG.find(c => c.name === d.marker);
    return def ? getStatus(d.value, def) : null;
  });
  const optCount  = statuses.filter(s => s === 'optimal').length;
  const warnCount = statuses.filter(s => s === 'low' || s === 'high' || s === 'borderline').length;
  const critCount = statuses.filter(s => s === 'critical').length;

  // Biomarkers to show
  const visibleDefs = useMemo(() => {
    let defs = category === 'All' ? CATALOG : CATALOG.filter(d => d.category === category);
    if (!showAll) {
      // Only show defs that have data OR are in the tracked set
      defs = defs.filter(d => drawsByMarker[d.name]);
      // If nothing tracked yet, show first 6 as suggestions
      if (defs.length === 0) defs = (category === 'All' ? CATALOG : CATALOG.filter(d => d.category === category)).slice(0, 6);
    }
    return defs;
  }, [category, drawsByMarker, showAll]);

  const hasData = tracked > 0;

  const handleSaved = (draw: LabDraw) => {
    setShowAdd(false);
    setAddMarker(undefined);
    onDrawAdded(draw);
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>📊 Biomarker Tracker</div>
          <div style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 2 }}>
            Track and visualize lab results across peptide protocols
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => { setAddMarker(undefined); setShowAdd(true); }}>
          + Log Reading
        </button>
      </div>

      {/* Summary badges */}
      {hasData && (
        <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
          <SummaryBadge label="Markers tracked" value={tracked}    color="var(--accent)" />
          <SummaryBadge label="Total readings"  value={draws.length} color="var(--text-secondary)" />
          <SummaryBadge label="Optimal"         value={optCount}   color="#15803d" />
          <SummaryBadge label="Needs attention" value={warnCount + critCount} color={warnCount + critCount > 0 ? '#dc2626' : 'var(--text-muted)'} />
        </div>
      )}

      {/* Category tabs */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
        {CATEGORIES.map(c => {
          const count = c === 'All'
            ? tracked
            : Object.keys(drawsByMarker).filter(m => CATALOG.find(d => d.name === m && d.category === c)).length;
          return (
            <button key={c} onClick={() => setCategory(c)} style={{
              padding: '5px 12px', borderRadius: 7, fontSize: 12, fontWeight: category === c ? 700 : 500,
              cursor: 'pointer', fontFamily: 'inherit',
              background: category === c ? 'var(--accent-dim)' : 'var(--bg-input)',
              border: `1px solid ${category === c ? 'var(--accent)' : 'var(--border)'}`,
              color: category === c ? 'var(--accent)' : 'var(--text-muted)',
            }}>
              {c}{count > 0 && <span style={{ marginLeft: 5, fontSize: 10, opacity: 0.75 }}>{count}</span>}
            </button>
          );
        })}
      </div>

      {/* Show all toggle */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          {showAll
            ? `Showing all ${visibleDefs.length} ${category === 'All' ? '' : category} markers`
            : `Showing ${visibleDefs.length} tracked marker${visibleDefs.length !== 1 ? 's' : ''}`}
        </span>
        <button
          onClick={() => setShowAll(v => !v)}
          style={{ fontSize: 12, color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
        >
          {showAll ? 'Show tracked only' : `Show all ${category === 'All' ? CATALOG.length : CATALOG.filter(d => d.category === category).length} markers`}
        </button>
      </div>

      {/* Cards grid */}
      {visibleDefs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>📊</div>
          <div style={{ fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>No biomarkers logged yet</div>
          <div style={{ fontSize: 13, marginBottom: 16 }}>Log your first lab reading to start tracking trends.</div>
          <button className="btn btn-primary" onClick={() => setShowAdd(true)}>+ Log First Reading</button>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: 12,
        }}>
          {visibleDefs.map(def => (
            <BiomarkerCard
              key={def.name}
              def={def}
              draws={drawsByMarker[def.name] ?? []}
              onAdd={(marker) => { setAddMarker(marker); setShowAdd(true); }}
            />
          ))}
        </div>
      )}

      {/* Add reading modal */}
      {showAdd && (
        <AddReadingForm
          userId={userId}
          prefillMarker={addMarker}
          onSaved={handleSaved}
          onClose={() => { setShowAdd(false); setAddMarker(undefined); }}
        />
      )}
    </div>
  );
}
