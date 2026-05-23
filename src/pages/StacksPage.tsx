import { useState } from 'react';
import type { Stack } from '../types';
import { peptides } from '../data/peptides';

const defaultStacks: Stack[] = [
  {
    id: '1',
    name: 'Healing Protocol',
    description: 'Aggressive injury repair stack for tendon/ligament recovery',
    goal: 'Injury Recovery',
    peptides: ['bpc-157', 'tb-500', 'ghk-cu'],
    createdAt: '2025-05-01',
  },
  {
    id: '2',
    name: 'GH Optimization',
    description: 'Pre-sleep GH pulse amplification for fat loss and muscle',
    goal: 'Body Composition',
    peptides: ['ipamorelin', 'cjc-1295', 'mk-677'],
    createdAt: '2025-05-08',
  },
];

const goals = ['Injury Recovery', 'Body Composition', 'Cognitive', 'Longevity', 'Immune', 'Sleep', 'Libido', 'Custom'];

export default function StacksPage() {
  const [stacks, setStacks]           = useState<Stack[]>(defaultStacks);
  const [editId, setEditId]           = useState<string | null>(null);
  const [showNew, setShowNew]         = useState(false);

  // form state
  const [name, setName]               = useState('');
  const [description, setDescription] = useState('');
  const [goal, setGoal]               = useState(goals[0]);
  const [selectedPeptides, setSelPeptides] = useState<string[]>([]);
  const [pSearch, setPSearch]         = useState('');

  const filteredPeptides = peptides.filter(p =>
    p.name.toLowerCase().includes(pSearch.toLowerCase())
  );

  const resetForm = () => {
    setName(''); setDescription(''); setGoal(goals[0]); setSelPeptides([]); setPSearch('');
  };

  const saveStack = () => {
    if (!name.trim() || selectedPeptides.length === 0) return;
    if (editId) {
      setStacks(prev => prev.map(s => s.id === editId ? { ...s, name, description, goal, peptides: selectedPeptides } : s));
      setEditId(null);
    } else {
      setStacks(prev => [...prev, { id: Date.now().toString(), name, description, goal, peptides: selectedPeptides, createdAt: new Date().toISOString().slice(0, 10) }]);
      setShowNew(false);
    }
    resetForm();
  };

  const startEdit = (s: Stack) => {
    setEditId(s.id); setName(s.name); setDescription(s.description);
    setGoal(s.goal); setSelPeptides(s.peptides); setShowNew(false);
  };

  const deleteStack = (id: string) => setStacks(prev => prev.filter(s => s.id !== id));

  const togglePeptide = (id: string) => {
    setSelPeptides(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const isEditing = showNew || editId !== null;

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>🔗 My Stacks</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 13.5 }}>Build and manage your personal peptide protocol stacks.</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setShowNew(true); setEditId(null); resetForm(); }}>
          + New Stack
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isEditing ? '1fr 380px' : '1fr', gap: 16 }}>

        {/* Stack list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {stacks.length === 0 && (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px 0' }}>
              No stacks yet. Create your first stack!
            </div>
          )}
          {stacks.map(stack => {
            const stackPeptides = peptides.filter(p => stack.peptides.includes(p.id));
            return (
              <div key={stack.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>{stack.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{stack.description}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn-ghost btn" style={{ fontSize: 11, padding: '4px 10px' }} onClick={() => startEdit(stack)}>Edit</button>
                    <button
                      className="btn"
                      style={{ fontSize: 11, padding: '4px 10px', background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}
                      onClick={() => deleteStack(stack.id)}
                    >Delete</button>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span className="tag">{stack.goal}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Created {stack.createdAt}</span>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
                  {stackPeptides.map(p => (
                    <div key={p.id} style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      background: 'var(--bg-input)', border: '1px solid var(--border)',
                      borderRadius: 8, padding: '5px 10px', fontSize: 12, color: 'var(--text-secondary)',
                    }}>
                      <span>{p.emoji}</span> {p.name}
                    </div>
                  ))}
                  {stack.peptides.length === 0 && (
                    <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>No peptides added</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Editor panel */}
        {isEditing && (
          <div style={{
            background: 'var(--bg-surface)', border: '1px solid var(--border)',
            borderRadius: 14, padding: '18px', height: 'fit-content',
            position: 'sticky', top: 80,
          }}>
            <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)', marginBottom: 16 }}>
              {editId ? 'Edit Stack' : 'New Stack'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Name *</label>
                <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Morning Protocol" />
              </div>
              <div>
                <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Description</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} placeholder="What is this stack for?" style={{ resize: 'vertical' }} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Goal</label>
                <select value={goal} onChange={e => setGoal(e.target.value)}>
                  {goals.map(g => <option key={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                  Peptides ({selectedPeptides.length} selected)
                </label>
                <input
                  value={pSearch}
                  onChange={e => setPSearch(e.target.value)}
                  placeholder="Search peptides…"
                  style={{ marginBottom: 8 }}
                />
                <div style={{ maxHeight: 200, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {filteredPeptides.map(p => (
                    <label key={p.id} style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '6px 10px', borderRadius: 7,
                      background: selectedPeptides.includes(p.id) ? 'rgba(59,130,246,0.1)' : 'var(--bg-input)',
                      border: `1px solid ${selectedPeptides.includes(p.id) ? 'rgba(59,130,246,0.35)' : 'var(--border)'}`,
                      cursor: 'pointer', fontSize: 12, color: 'var(--text-secondary)',
                    }}>
                      <input
                        type="checkbox"
                        checked={selectedPeptides.includes(p.id)}
                        onChange={() => togglePeptide(p.id)}
                        style={{ width: 'auto', accentColor: '#3b82f6' }}
                      />
                      <span>{p.emoji}</span> {p.name}
                    </label>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                <button className="btn btn-primary" style={{ flex: 1 }} onClick={saveStack}>
                  {editId ? 'Save Changes' : 'Create Stack'}
                </button>
                <button className="btn btn-ghost" onClick={() => { setShowNew(false); setEditId(null); resetForm(); }}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
