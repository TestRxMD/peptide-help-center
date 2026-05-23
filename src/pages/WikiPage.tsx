import { useState, useMemo } from 'react';
import type { Peptide } from '../types';
import { categories, peptides, getPeptidesByCategory, searchPeptides } from '../data/peptides';
import PeptideCard from '../components/PeptideCard';
import PeptideModal from '../components/PeptideModal';
import CompareModal from '../components/CompareModal';

const MAX_COMPARE = 4;

export default function WikiPage() {
  const [search, setSearch]           = useState('');
  const [selectedPeptide, setSelected]= useState<Peptide | null>(null);
  const [compareIds, setCompareIds]   = useState<string[]>([]);
  const [showCompare, setShowCompare] = useState(false);
  const [collapsed, setCollapsed]     = useState<Set<string>>(new Set());
  const [statusFilter, setStatusFilter] = useState('all');

  const searchResults = useMemo(() =>
    search.trim().length > 1 ? searchPeptides(search) : null,
  [search]);

  const toggleCollapse = (id: string) => {
    setCollapsed(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleCompare = (id: string) => {
    setCompareIds(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id);
      if (prev.length >= MAX_COMPARE) return prev;
      return [...prev, id];
    });
  };

  const compareList = useMemo(() =>
    peptides.filter(p => compareIds.includes(p.id)), [compareIds]);

  const visibleCategories = useMemo(() => {
    return categories.map(cat => ({
      ...cat,
      items: getPeptidesByCategory(cat.id).filter(p =>
        statusFilter === 'all' || p.status === statusFilter
      ),
    })).filter(c => c.items.length > 0);
  }, [statusFilter]);

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '20px 16px' }}>

      {/* Sourcing callout */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 14,
        background: 'linear-gradient(135deg, rgba(16,185,129,0.07) 0%, rgba(59,130,246,0.07) 100%)',
        border: '1px solid rgba(16,185,129,0.25)',
        borderRadius: 10, padding: '12px 16px',
        marginBottom: 16, flexWrap: 'wrap',
      }}>
        <span style={{ fontSize: 20, flexShrink: 0 }}>🏅</span>
        <div style={{ flex: 1, minWidth: 200, fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          <strong style={{ color: 'var(--text-primary)' }}>Quality sourcing is everything.</strong>
          {' '}Always verify purity with a certificate of analysis (CoA). We recommend{' '}
          <a href="https://www.shortproteins.com" target="_blank" rel="noopener noreferrer"
            style={{ color: '#34d399', fontWeight: 600, textDecoration: 'none' }}>
            Short Proteins
          </a>
          {' '}— HPLC-tested, third-party verified on every batch.
        </div>
        <a href="https://www.shortproteins.com" target="_blank" rel="noopener noreferrer"
          style={{
            fontSize: 12, fontWeight: 600, color: '#34d399',
            border: '1px solid rgba(16,185,129,0.35)', borderRadius: 7,
            padding: '5px 12px', textDecoration: 'none', flexShrink: 0,
            background: 'rgba(16,185,129,0.08)',
          }}>
          View Source ↗
        </a>
      </div>

      {/* Top bar: search + filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: 220, position: 'relative' }}>
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 14, color: 'var(--text-muted)', pointerEvents: 'none' }}>🔍</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search peptides, benefits, tags…"
            style={{ paddingLeft: 36 }}
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          style={{ width: 'auto', minWidth: 140 }}
        >
          <option value="all">All statuses</option>
          <option value="Research">Research</option>
          <option value="FDA Approved">FDA Approved</option>
          <option value="Approved (RU)">Approved (RU)</option>
          <option value="Approved (EU)">Approved (EU)</option>
        </select>

        {compareIds.length > 0 && (
          <button
            className="btn-primary btn"
            onClick={() => setShowCompare(true)}
          >
            ⚡ Compare ({compareIds.length})
          </button>
        )}
      </div>

      {/* Search results */}
      {searchResults !== null && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10 }}>
            {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for "{search}"
          </div>
          {searchResults.length > 0 ? (
            <div className="peptide-grid">
              {searchResults.map(p => {
                const cat = categories.find(c => c.id === p.categoryId);
                return (
                  <PeptideCard
                    key={p.id}
                    peptide={p}
                    accentColor={cat?.color}
                    onOpen={setSelected}
                    compareActive={compareIds.includes(p.id)}
                    onToggleCompare={toggleCompare}
                  />
                );
              })}
            </div>
          ) : (
            <div style={{ color: 'var(--text-muted)', fontSize: 14, padding: '20px 0' }}>
              No peptides found matching "{search}"
            </div>
          )}
        </div>
      )}

      {/* Category sections (hidden during search) */}
      {searchResults === null && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {visibleCategories.map(cat => {
            const isCollapsed = collapsed.has(cat.id);
            return (
              <div key={cat.id}>
                <div
                  className="section-header"
                  style={{ cursor: 'pointer' }}
                  onClick={() => toggleCollapse(cat.id)}
                >
                  <div
                    className="section-header-icon"
                    style={{ background: `${cat.color}1a`, border: `1px solid ${cat.color}33` }}
                  >
                    {cat.emoji}
                  </div>
                  <div className="section-header-text">
                    <div className="section-header-title">{cat.name}</div>
                    <div className="section-header-subtitle">{cat.subtitle}</div>
                  </div>
                  <div className="section-header-actions">
                    <span className="section-header-count">{cat.items.length}</span>
                    <button
                      className="btn-compare"
                      onClick={e => {
                        e.stopPropagation();
                        const catIds = cat.items.map(p => p.id).slice(0, MAX_COMPARE);
                        const allSelected = catIds.every(id => compareIds.includes(id));
                        if (allSelected) {
                          setCompareIds(prev => prev.filter(id => !catIds.includes(id)));
                        } else {
                          const toAdd = catIds.filter(id => !compareIds.includes(id));
                          const slots = MAX_COMPARE - compareIds.length;
                          setCompareIds(prev => [...prev, ...toAdd.slice(0, slots)]);
                        }
                      }}
                    >
                      Compare ⇌
                    </button>
                    <span style={{ color: 'var(--text-muted)', fontSize: 12, transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)', transition: '150ms' }}>▼</span>
                  </div>
                </div>

                {!isCollapsed && (
                  <div className="peptide-grid">
                    {cat.items.map(p => (
                      <PeptideCard
                        key={p.id}
                        peptide={p}
                        accentColor={cat.color}
                        onOpen={setSelected}
                        compareActive={compareIds.includes(p.id)}
                        onToggleCompare={toggleCompare}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      {selectedPeptide && (
        <PeptideModal peptide={selectedPeptide} onClose={() => setSelected(null)} />
      )}
      {showCompare && compareList.length >= 2 && (
        <CompareModal
          peptides={compareList}
          onClose={() => setShowCompare(false)}
          onRemove={id => setCompareIds(prev => prev.filter(x => x !== id))}
        />
      )}
    </div>
  );
}
