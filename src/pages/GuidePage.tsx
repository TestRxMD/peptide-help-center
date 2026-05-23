import { useState } from 'react';

const guides = [
  {
    id: 'reconstitution',
    emoji: '🧪',
    title: 'Reconstitution Guide',
    subtitle: 'How to mix lyophilized peptides safely',
    sections: [
      {
        title: 'What You Need',
        content: [
          'Lyophilized peptide vial',
          'Bacteriostatic water (BAC water) — preferred for multi-use vials',
          'Sterile water — single-use only',
          'Insulin syringes (U100) for dosing',
          'Larger syringe (1–3 mL) for BAC water addition',
          'Alcohol swabs',
        ],
      },
      {
        title: 'Step-by-Step Process',
        content: [
          'Clean the rubber stoppers of both vials with an alcohol swab',
          'Draw up the desired amount of BAC water (see Recon Calculator)',
          'Insert the needle into the peptide vial at an angle',
          'Slowly release the water along the side of the vial — never spray directly onto the lyophilized powder',
          'Gently swirl the vial — do NOT shake',
          'Continue swirling until the powder is fully dissolved',
          'The solution should be clear and colorless (slight yellow is fine for some peptides)',
          'Label the vial with date and concentration (e.g., "5mg/2mL = 2500mcg/mL")',
        ],
      },
      {
        title: 'Storage After Reconstitution',
        content: [
          'Refrigerate at 2–8°C (standard fridge)',
          'Keep away from light — wrap in foil if needed',
          'Most reconstituted peptides are stable for 4–6 weeks refrigerated',
          'Freeze reconstituted peptides only if storing > 6 weeks',
          'Never re-freeze a thawed vial',
          'Discard if the solution becomes cloudy or has visible particles',
        ],
      },
    ],
  },
  {
    id: 'injection',
    emoji: '💉',
    title: 'Injection Technique',
    subtitle: 'SubQ and IM administration guide',
    sections: [
      {
        title: 'Subcutaneous (SubQ) Injection',
        content: [
          'Best sites: abdomen (2" from navel), outer thigh, upper arm',
          'Pinch 1–2 inches of skin between thumb and forefinger',
          'Insert the needle at 45° angle (or 90° if using 4–6mm needle)',
          'Release the skin pinch after inserting the needle',
          'Slowly inject — no need to aspirate for SubQ',
          'Withdraw and apply gentle pressure (do not rub)',
          'Rotate injection sites to prevent lipodystrophy',
        ],
      },
      {
        title: 'Intramuscular (IM) Injection',
        content: [
          'Best sites: ventrogluteal, vastus lateralis (outer thigh), deltoid',
          'Use a longer needle (25–27 gauge, 1"–1.5")',
          'Insert at 90° with a quick, confident motion',
          'Aspirate briefly — if blood appears, withdraw and use new site',
          'Inject slowly, ~10 seconds per 0.5 mL',
          'Massage gently after injection to disperse',
        ],
      },
      {
        title: 'Intranasal Administration',
        content: [
          'Tilt head slightly back or forward (preference-based)',
          'Insert nasal spray tip and squeeze while inhaling gently',
          'Alternate nostrils if dosing bilaterally',
          'Keep head tilted for 30–60 seconds post-dose',
          'Common peptides given intranasally: Semax, Selank, Epithalon',
        ],
      },
    ],
  },
  {
    id: 'cycling',
    emoji: '🔄',
    title: 'Cycling & Protocols',
    subtitle: 'When and how to run peptide courses',
    sections: [
      {
        title: 'Common Cycling Approaches',
        content: [
          'Daily for 30–90 days with 4–8 week break (BPC-157, GH secretagogues)',
          '10-day courses with 3–6 month gaps (Khavinson bioregulators)',
          '5 days on / 2 days off (moderate protocols)',
          '2 weeks on / 2 weeks off (some GHRP protocols)',
          'Continuous indefinitely (MK-677, GHK-Cu topical)',
        ],
      },
      {
        title: 'Timing Recommendations',
        content: [
          'GH secretagogues: fasted state, 2+ hours from food; pre-sleep is optimal',
          'BPC-157: morning and/or evening, away from or with food (oral route)',
          'Semax/Selank: morning or as needed; avoid late evening (Semax is stimulating)',
          'Epithalon: evening preferred to align with melatonin rhythm',
          'Thymalin: timing less critical; morning course conventional',
        ],
      },
      {
        title: 'Monitoring & Bloodwork',
        content: [
          'Baseline IGF-1 before starting GH secretagogues — retest 4–6 weeks in',
          'Fasting glucose if using MK-677 or high-dose GH secretagogues',
          'Complete blood count (CBC) for immune-modulating peptides',
          'Liver enzymes if running hepatotrophic compounds',
          'Testosterone panel if running HPG-axis peptides',
        ],
      },
    ],
  },
  {
    id: 'safety',
    emoji: '🛡️',
    title: 'Safety & Considerations',
    subtitle: 'What every user should understand',
    sections: [
      {
        title: 'General Safety Principles',
        content: [
          'Always source from reputable, third-party tested suppliers',
          'Request certificate of analysis (CoA) — HPLC purity and mass spec verification',
          'Start with lower doses to assess individual tolerance',
          'Keep a log of doses, observations, and any side effects',
          'Educate yourself fully before beginning any protocol',
          'Consult a physician who is knowledgeable in peptide protocols',
        ],
      },
      {
        title: 'Contraindications to be Aware Of',
        content: [
          'Active malignancy: avoid angiogenic peptides (BPC-157, TB-500) in active cancer',
          'Pregnancy and breastfeeding: avoid all research peptides',
          'Insulin resistance / T2DM: caution with MK-677, GH secretagogues',
          'HGF/MET-pathway peptides (Dihexa): contraindicated with cancer history',
          'PT-141: contraindicated with uncontrolled hypertension and CVD',
          'All peptides: verify absence of hypersensitivity via small test dose',
        ],
      },
      {
        title: 'Aseptic Technique',
        content: [
          'Always swab vial stoppers before each use',
          'Use a new needle for each injection — never reuse',
          'Work on a clean surface; wash hands thoroughly',
          'Keep vials capped when not in use',
          'Dispose of sharps in a proper sharps container',
          'Never share needles, syringes, or vials',
        ],
      },
    ],
  },
];

export default function GuidePage() {
  const [activeGuide, setActiveGuide] = useState(guides[0].id);
  const guide = guides.find(g => g.id === activeGuide)!;

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 16px' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>💉 Guide</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 13.5 }}>Educational reference for reconstitution, dosing, and safe use.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 16 }}>
        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {guides.map(g => (
            <button
              key={g.id}
              onClick={() => setActiveGuide(g.id)}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
                gap: 2, padding: '12px 14px', borderRadius: 10, cursor: 'pointer',
                background: activeGuide === g.id ? 'rgba(59,130,246,0.12)' : 'var(--bg-surface)',
                border: `1px solid ${activeGuide === g.id ? 'rgba(59,130,246,0.35)' : 'var(--border)'}`,
                color: activeGuide === g.id ? 'var(--text-primary)' : 'var(--text-secondary)',
                textAlign: 'left', fontFamily: 'inherit',
              }}
            >
              <div style={{ fontSize: 18, marginBottom: 2 }}>{g.emoji}</div>
              <div style={{ fontSize: 12.5, fontWeight: 600 }}>{g.title}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.3 }}>{g.subtitle}</div>
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
            <span style={{ fontSize: 30 }}>{guide.emoji}</span>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{guide.title}</h2>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{guide.subtitle}</div>
            </div>
          </div>

          {guide.sections.map(section => (
            <div key={section.title} className="card">
              <div style={{ fontWeight: 700, fontSize: 13.5, color: 'var(--text-primary)', marginBottom: 12 }}>
                {section.title}
              </div>
              <ol style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {section.content.map((item, i) => (
                  <li key={i} style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    {item}
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
