// ⚙️  AUTO-GENERATED from src/pages/InteractionCheckerPage.tsx by scripts/gen-interactions.mjs.
//     Do NOT edit by hand — edit the checker page, then run `npm run gen:interactions`
//     (also runs automatically on every build via the `prebuild` hook).
/* eslint-disable @typescript-eslint/no-unused-vars */

type SubType  = 'peptide' | 'medication';
type Severity = 'synergistic' | 'compatible' | 'caution' | 'avoid';

interface Substance {
  id: string;
  name: string;
  type: SubType;
  category: string;       // display label
  subCat: string;         // used for fallback matching
  description: string;
  aliases?: string[];
}

interface InteractionDef {
  a: string | string[];
  b: string | string[];
  severity: Severity;
  title: string;
  mechanism: string;
  recommendation: string;
}

// ── Substance category groups ─────────────────────────────────────
const GH_PEPTIDES   = ['cjc-1295','ipamorelin','sermorelin','ghrp-2','mk-677','tesamorelin'];
const HEALING       = ['bpc-157','tb-500','ghk-cu'];
const IMMUNE        = ['thymosin-a1','ll-37','thymalin'];
const COGNITIVE     = ['semax','selank','dihexa','pinealon'];
const SEROTONERGIC  = ['ssri','snri'];
const BLOOD_THIN    = ['warfarin','aspirin','clopidogrel'];
const DIABETES_MEDS = ['insulin','metformin','semaglutide'];
const ED_DRUGS      = ['sildenafil','tadalafil'];

// ── Substance database ────────────────────────────────────────────

const SUBSTANCES: Substance[] = [
  // ── Peptides ─────────────────────────────────────────────────
  { id:'bpc-157',       name:'BPC-157',             type:'peptide',    subCat:'healing',   category:'Tissue Repair',   description:'Body protection compound; gut & musculoskeletal healing, angiogenesis',          aliases:['body protective compound','bpc157'] },
  { id:'tb-500',        name:'TB-500',              type:'peptide',    subCat:'healing',   category:'Tissue Repair',   description:'Thymosin Beta-4 fragment; cell migration, tissue regeneration',                 aliases:['thymosin beta-4','thymosin b4','tb500'] },
  { id:'ghk-cu',        name:'GHK-Cu',              type:'peptide',    subCat:'healing',   category:'Tissue Repair',   description:'Copper tripeptide; collagen synthesis, wound healing, anti-aging',              aliases:['copper peptide','ghkcu'] },
  { id:'cjc-1295',      name:'CJC-1295',            type:'peptide',    subCat:'gh',        category:'GH Secretagogue', description:'Long-acting GHRH analogue; sustained GH/IGF-1 elevation',                      aliases:['cjc 1295','cjc1295','cjc-1295 dac'] },
  { id:'ipamorelin',    name:'Ipamorelin',           type:'peptide',    subCat:'gh',        category:'GH Secretagogue', description:'Selective GHRP; clean GH pulse with minimal cortisol or prolactin' },
  { id:'sermorelin',    name:'Sermorelin',           type:'peptide',    subCat:'gh',        category:'GH Secretagogue', description:'Short-acting GHRH analogue; natural GH stimulation' },
  { id:'ghrp-2',        name:'GHRP-2',              type:'peptide',    subCat:'gh',        category:'GH Secretagogue', description:'Potent GHRP; strong GH pulse, raises cortisol and prolactin',                  aliases:['ghrp2'] },
  { id:'mk-677',        name:'MK-677',              type:'peptide',    subCat:'gh',        category:'GH Secretagogue', description:'Oral ghrelin mimetic; continuous 24h GH/IGF-1 elevation',                     aliases:['ibutamoren','mk677','nutrobal'] },
  { id:'tesamorelin',   name:'Tesamorelin',          type:'peptide',    subCat:'gh',        category:'GH Secretagogue', description:'GHRH analogue; FDA-approved for HIV lipodystrophy, reduces visceral fat' },
  { id:'aod-9604',      name:'AOD-9604',             type:'peptide',    subCat:'fat-loss',  category:'Metabolic',       description:'GH fragment 176-191; lipolysis without IGF-1 elevation or insulin resistance', aliases:['aod9604','gh frag 176-191','gh fragment'] },
  { id:'thymosin-a1',   name:'Thymosin Alpha-1',     type:'peptide',    subCat:'immune',    category:'Immune',          description:'Thymic peptide; T-cell differentiation, antiviral, immunomodulation',          aliases:['ta1','ta-1','thymalfasin'] },
  { id:'ll-37',         name:'LL-37',               type:'peptide',    subCat:'immune',    category:'Immune',          description:'Cathelicidin AMP; innate immunity, antimicrobial, TLR modulation',             aliases:['cathelicidin','ll37'] },
  { id:'thymalin',      name:'Thymalin',             type:'peptide',    subCat:'immune',    category:'Immune',          description:'Thymic bioregulator; T-cell maturation, immune homeostasis (Khavinson)' },
  { id:'semax',         name:'Semax',               type:'peptide',    subCat:'cognitive', category:'Cognitive',       description:'ACTH 4-10 analogue; BDNF upregulation, neuroprotection, focus, memory' },
  { id:'selank',        name:'Selank',              type:'peptide',    subCat:'cognitive', category:'Cognitive',       description:'Anxiolytic nootropic; GABAergic + enkephalin modulation, anti-anxiety' },
  { id:'dihexa',        name:'Dihexa',              type:'peptide',    subCat:'cognitive', category:'Cognitive',       description:'HGF/MET activator; potent synaptogenesis, long-lasting cognitive effects' },
  { id:'pinealon',      name:'Pinealon',             type:'peptide',    subCat:'cognitive', category:'Cognitive',       description:'Khavinson brain bioregulator; neuroprotection, anti-apoptotic, sleep support' },
  { id:'epithalon',     name:'Epithalon',            type:'peptide',    subCat:'longevity', category:'Longevity',       description:'Telomerase activator; anti-aging, pineal gene regulation, antioxidant',        aliases:['epitalon','epithalamin'] },
  { id:'pt-141',        name:'PT-141',              type:'peptide',    subCat:'sexual',    category:'Sexual Health',   description:'Melanocortin receptor agonist; central arousal in men & women',               aliases:['bremelanotide','pt141'] },
  { id:'kisspeptin-10', name:'Kisspeptin-10',        type:'peptide',    subCat:'sexual',    category:'Sexual Health',   description:'GnRH secretagogue; LH/FSH release, testosterone boost, libido',              aliases:['kisspeptin','kp-10','kp10'] },

  // ── Medications ───────────────────────────────────────────────
  { id:'insulin',            name:'Insulin',                 type:'medication', subCat:'diabetes',          category:'Diabetes',          description:'Exogenous insulin for blood glucose management' },
  { id:'metformin',          name:'Metformin',               type:'medication', subCat:'diabetes',          category:'Diabetes',          description:'Biguanide; first-line T2 diabetes drug, also anti-aging interest' },
  { id:'semaglutide',        name:'Semaglutide (Ozempic)',   type:'medication', subCat:'diabetes',          category:'Diabetes / Weight', description:'GLP-1 receptor agonist; diabetes & weight management',           aliases:['ozempic','wegovy','glp-1','tirzepatide','mounjaro'] },
  { id:'warfarin',           name:'Warfarin',                type:'medication', subCat:'blood-thinner',     category:'Anticoagulant',     description:'Vitamin K antagonist anticoagulant',                             aliases:['coumadin'] },
  { id:'aspirin',            name:'Aspirin',                 type:'medication', subCat:'blood-thinner',     category:'Antiplatelet',      description:'Antiplatelet agent / NSAID at various doses' },
  { id:'clopidogrel',        name:'Clopidogrel',             type:'medication', subCat:'blood-thinner',     category:'Antiplatelet',      description:'P2Y12 antiplatelet agent',                                       aliases:['plavix'] },
  { id:'nsaids',             name:'NSAIDs',                  type:'medication', subCat:'nsaid',             category:'Anti-inflammatory', description:'Ibuprofen, naproxen, celecoxib — COX inhibitors',               aliases:['ibuprofen','naproxen','advil','motrin','celebrex'] },
  { id:'corticosteroids',    name:'Corticosteroids',         type:'medication', subCat:'corticosteroid',    category:'Anti-inflammatory', description:'Prednisone, dexamethasone, methylprednisolone',                 aliases:['prednisone','dexamethasone','steroids','cortisone'] },
  { id:'ssri',               name:'SSRIs',                   type:'medication', subCat:'serotonergic',      category:'Psychiatric',       description:'Sertraline, fluoxetine, escitalopram — serotonin reuptake inhibitors', aliases:['sertraline','fluoxetine','escitalopram','zoloft','lexapro','prozac'] },
  { id:'snri',               name:'SNRIs',                   type:'medication', subCat:'serotonergic',      category:'Psychiatric',       description:'Venlafaxine, duloxetine — serotonin + norepinephrine reuptake inhibitors', aliases:['venlafaxine','duloxetine','effexor','cymbalta'] },
  { id:'maoi',               name:'MAOIs',                   type:'medication', subCat:'maoi',              category:'Psychiatric',       description:'Monoamine oxidase inhibitors; phenelzine, tranylcypromine, selegiline', aliases:['phenelzine','tranylcypromine','selegiline','nardil'] },
  { id:'beta-blockers',      name:'Beta-Blockers',           type:'medication', subCat:'cardiovascular',    category:'Cardiovascular',    description:'Metoprolol, atenolol, propranolol — HR and BP control',        aliases:['metoprolol','atenolol','propranolol','carvedilol'] },
  { id:'ace-inhibitors',     name:'ACE Inhibitors / ARBs',   type:'medication', subCat:'cardiovascular',    category:'Cardiovascular',    description:'Lisinopril, losartan, ramipril — blood pressure medications',   aliases:['lisinopril','losartan','ramipril','enalapril'] },
  { id:'statins',            name:'Statins',                 type:'medication', subCat:'cardiovascular',    category:'Cardiovascular',    description:'Atorvastatin, rosuvastatin — HMG-CoA reductase inhibitors',     aliases:['atorvastatin','rosuvastatin','lipitor','crestor'] },
  { id:'sildenafil',         name:'Sildenafil (Viagra)',      type:'medication', subCat:'pde5',              category:'Sexual Health',     description:'PDE5 inhibitor for erectile dysfunction',                       aliases:['viagra'] },
  { id:'tadalafil',          name:'Tadalafil (Cialis)',       type:'medication', subCat:'pde5',              category:'Sexual Health',     description:'Long-acting PDE5 inhibitor',                                    aliases:['cialis'] },
  { id:'contraceptives',     name:'Hormonal Contraceptives', type:'medication', subCat:'hormonal',          category:'Hormonal',          description:'Combined OCP, progestin-only, IUD, patch, ring',               aliases:['birth control','the pill','ocps','nexplanon'] },
  { id:'trt',                name:'Testosterone (TRT/HRT)',  type:'medication', subCat:'hormonal',          category:'Hormonal',          description:'Exogenous testosterone therapy',                               aliases:['testosterone','trt','hrt'] },
  { id:'aromatase-i',        name:'Aromatase Inhibitors',    type:'medication', subCat:'hormonal',          category:'Hormonal',          description:'Anastrozole, exemestane — reduce testosterone-to-estrogen conversion', aliases:['anastrozole','exemestane','letrozole','ai','arimidex'] },
  { id:'levothyroxine',      name:'Levothyroxine (T4)',       type:'medication', subCat:'thyroid',           category:'Thyroid',           description:'Synthetic T4 thyroid hormone replacement',                     aliases:['synthroid','levoxyl','t4'] },
  { id:'immunosuppressants', name:'Immunosuppressants',      type:'medication', subCat:'immunosuppressant', category:'Immune',            description:'Tacrolimus, cyclosporine, mycophenolate, biologics',           aliases:['tacrolimus','cyclosporine','prograf','humira'] },
  { id:'chemotherapy',       name:'Chemotherapy',            type:'medication', subCat:'chemo',             category:'Oncology',          description:'Any cytotoxic, targeted, or immunotherapy anti-cancer agent', aliases:['chemo','cancer treatment','cytotoxic'] },
];



// ═════════════════════════════════════════════════════════════════
// SPECIFIC INTERACTION DATABASE
// ═════════════════════════════════════════════════════════════════

const INTERACTIONS: InteractionDef[] = [

  // ── SYNERGISTIC: GH peptide stacks ───────────────────────────

  { a:'cjc-1295',    b:'ipamorelin',
    severity:'synergistic', title:'Gold Standard GH Stack (GHRH + GHRP)',
    mechanism:'CJC-1295 primes the pituitary as a GHRH analogue; Ipamorelin triggers GH release as a selective GHRP. The two receptors (GHRH-R and ghrelin-R) synergize to produce a GH pulse 5–10× greater than either alone. Ipamorelin adds minimal cortisol or prolactin.',
    recommendation:'The most widely used GH combo. Standard: 100–200 mcg CJC-1295 + 200–300 mcg Ipamorelin subcutaneously before bed or post-workout. Monitor IGF-1 every 8–12 weeks.' },

  { a:'cjc-1295',    b:'ghrp-2',
    severity:'synergistic', title:'Strong GHRH + GHRP Combination',
    mechanism:'Same receptor synergy as CJC-1295/Ipamorelin. GHRP-2 produces a stronger GH pulse but also raises cortisol and prolactin more than Ipamorelin.',
    recommendation:'Effective for maximum GH output. Use if Ipamorelin is unavailable. Monitor cortisol-related effects (water retention, fatigue, sleep disruption). Ipamorelin is generally preferred for a cleaner side-effect profile.' },

  { a:'sermorelin',  b:'ipamorelin',
    severity:'synergistic', title:'Short-Acting GHRH + GHRP Stack',
    mechanism:'Sermorelin (GHRH analogue) + Ipamorelin (GHRP) hit complementary receptors to synergize GH release, identical in principle to CJC-1295/Ipamorelin. Sermorelin\'s shorter half-life requires tighter timing (within minutes of each other).',
    recommendation:'Dose simultaneously 5–10 min before bed or post-workout. 100–200 mcg Sermorelin + 100–200 mcg Ipamorelin. Effective alternative to CJC-1295 if DAC is not desired.' },

  { a:'sermorelin',  b:'ghrp-2',
    severity:'synergistic', title:'Sermorelin + GHRP-2 Stack',
    mechanism:'GHRH + GHRP receptor synergy. Combined use produces a substantially larger GH pulse than either peptide alone.',
    recommendation:'Dose simultaneously. More cortisol elevation than sermorelin + ipamorelin. Monitor for hunger, fatigue, and cortisol side effects.' },

  { a:'tesamorelin', b:'ipamorelin',
    severity:'synergistic', title:'Tesamorelin + Ipamorelin (GHRH + GHRP)',
    mechanism:'Tesamorelin is a stabilized GHRH analogue; Ipamorelin is a GHRP. Same receptor synergy mechanism applies. Tesamorelin has particular efficacy for visceral fat reduction.',
    recommendation:'Useful combination for body composition. 1–2 mg Tesamorelin + 200–300 mcg Ipamorelin daily. Tesamorelin is FDA-approved; follow dosing guidelines.' },

  { a:'tesamorelin', b:'ghrp-2',
    severity:'synergistic', title:'Tesamorelin + GHRP-2',
    mechanism:'GHRH + GHRP synergy. Strong combined GH pulse; Tesamorelin specifically shown to reduce visceral adipose tissue.',
    recommendation:'Effective combination; monitor for GHRP-2\'s cortisol/prolactin elevation. Consider Ipamorelin as the GHRP component for a cleaner profile.' },

  // ── SYNERGISTIC: Healing stacks ───────────────────────────────

  { a:'bpc-157',     b:'tb-500',
    severity:'synergistic', title:'Classic BPC-157 + TB-500 Healing Stack',
    mechanism:'BPC-157 accelerates angiogenesis, collagen production, and GI mucosal repair via growth factor upregulation (VEGF, EGF, FGF). TB-500 promotes actin polymerization and directional cell migration via thymosin β4. Mechanisms are entirely complementary.',
    recommendation:'One of the most validated peptide stacks. Protocol: 250–500 mcg BPC-157 + 2–2.5 mg TB-500, 2–3× per week. Excellent for musculoskeletal injury, tendinopathy, and GI conditions. Both subcutaneous or IM.' },

  { a:'bpc-157',     b:'ghk-cu',
    severity:'synergistic', title:'BPC-157 + GHK-Cu: Repair + Collagen',
    mechanism:'BPC-157 drives vascular repair and inflammation resolution; GHK-Cu stimulates fibroblasts, collagen/elastin synthesis, and antioxidant enzyme expression. Complementary regenerative mechanisms.',
    recommendation:'Excellent for wound healing, skin repair, and post-injury recovery. GHK-Cu can be applied topically at the site; BPC-157 dosed systemically. Well-tolerated combination.' },

  { a:'tb-500',      b:'ghk-cu',
    severity:'synergistic', title:'TB-500 + GHK-Cu: Tissue Remodeling',
    mechanism:'TB-500 facilitates cell migration and tissue organization; GHK-Cu provides the collagen/ECM scaffold for that tissue to rebuild on. Together they address both the cellular and structural components of repair.',
    recommendation:'Complementary healing stack, particularly for chronic injuries, joint repair, and scar remodeling. Well-tolerated.' },

  // ── SYNERGISTIC: Immune + Longevity ──────────────────────────

  { a:'thymalin',    b:'epithalon',
    severity:'synergistic', title:'Khavinson Longevity Stack',
    mechanism:'Epithalon activates telomerase and regulates pineal gene expression. Thymalin restores thymic function (thymic involution accelerates aging). Together they address two distinct age-related processes: telomere shortening and immune senescence.',
    recommendation:'The foundational Khavinson anti-aging protocol. Typically administered in 10-day courses 1–2× per year. Well-tolerated; no known adverse interactions between these two bioregulators.' },

  { a:'thymosin-a1', b:'ll-37',
    severity:'synergistic', title:'Adaptive + Innate Immune Coverage',
    mechanism:'Thymosin Alpha-1 primarily enhances adaptive immunity (T-cell differentiation, NK cell activity, dendritic cell maturation). LL-37 activates innate immunity (antimicrobial activity, neutrophil recruitment, TLR modulation). Together they provide broad-spectrum immune support.',
    recommendation:'Useful during active infection or for immune optimization. TA1 1–1.6 mg 2×/week; LL-37 100–200 mcg daily. Monitor for transient flu-like immune activation.' },

  // ── SYNERGISTIC: Cognitive ────────────────────────────────────

  { a:'semax',       b:'selank',
    severity:'synergistic', title:'Focused Cognition + Anxiolytic Balance',
    mechanism:'Semax upregulates BDNF and drives catecholamine activity — stimulating, pro-cognitive. Selank modulates GABA-A receptors and enkephalins — anxiolytic, anti-stress. Together they deliver focused, calm cognitive performance without the tension of stimulants alone.',
    recommendation:'Popular nootropic stack. Intranasal: 200–600 mcg Semax + 200–500 mcg Selank in the morning. Many users find the combination superior to either alone. Space by 30–60 min or use together.' },

  // ── SYNERGISTIC: Body composition ────────────────────────────

  { a:'aod-9604',    b:'ipamorelin',
    severity:'synergistic', title:'Fat Loss + GH Optimization',
    mechanism:'AOD-9604 stimulates lipolysis via beta-3 adrenergic-like receptor activation on fat cells without affecting IGF-1 or insulin sensitivity. Ipamorelin provides pulsatile GH release which shifts metabolism toward fat oxidation and lean mass preservation.',
    recommendation:'Popular recomposition stack. AOD-9604 250–300 mcg + Ipamorelin 200–300 mcg, 2× daily (fasted morning and pre-bed). Monitor glucose if combining with caloric restriction.' },

  { a:'aod-9604',    b:'cjc-1295',
    severity:'synergistic', title:'AOD-9604 + CJC-1295 Stack',
    mechanism:'AOD-9604 provides direct lipolysis; CJC-1295 elevates IGF-1 and promotes the metabolic shift toward fat burning and muscle preservation. Complementary body composition effects.',
    recommendation:'Effective combination for fat loss with muscle preservation. Standard doses of each. Monitor IGF-1 and fasting glucose.' },

  { a:'pt-141',      b:'trt',
    severity:'synergistic', title:'PT-141 + Testosterone: Sexual Function',
    mechanism:'Testosterone provides the hormonal substrate for libido and sexual response (androgen receptor-mediated). PT-141 works centrally via melanocortin receptors independent of testosterone levels. Together they address both peripheral hormonal and central arousal pathways.',
    recommendation:'Commonly combined. TRT provides the hormonal foundation; PT-141 addresses acute arousal centrally. Standard doses of each. Ensure TRT is optimized before relying heavily on PT-141.' },

  // ── CAUTION: Redundant GH mechanisms ─────────────────────────

  { a:'cjc-1295',    b:'sermorelin',
    severity:'caution', title:'Two GHRH Analogues — Receptor Competition',
    mechanism:'Both are GHRH receptor agonists. Co-administration provides no additive GH benefit and risks GHRH receptor downregulation/desensitization faster than either alone.',
    recommendation:'Choose one GHRH analogue. CJC-1295 with DAC is preferred for convenience (once or twice weekly). Sermorelin better mimics natural GHRH pulsatility for those seeking a physiological approach.' },

  { a:'cjc-1295',    b:'tesamorelin',
    severity:'caution', title:'Two GHRH Analogues — Redundant',
    mechanism:'Same GHRH receptor competition. No clinical evidence supports combining two GHRH analogues.',
    recommendation:'Use only one GHRH peptide at a time. Tesamorelin is specifically indicated for visceral fat in HIV lipodystrophy; CJC-1295 is more broadly used for GH optimization.' },

  { a:'sermorelin',  b:'tesamorelin',
    severity:'caution', title:'Two GHRH Analogues — Redundant',
    mechanism:'Both activate GHRH-R with no complementary mechanism when combined.',
    recommendation:'Select one based on clinical goal. Do not combine.' },

  { a:'ipamorelin',  b:'ghrp-2',
    severity:'caution', title:'Two GHRPs — Redundant + Amplified Cortisol',
    mechanism:'Both Ipamorelin and GHRP-2 act at the ghrelin/GH secretagogue receptor. Combining them does not produce additive GH release past the receptor saturation point, but does amplify GHRP-2\'s cortisol and prolactin elevation.',
    recommendation:'Counterproductive combination. The primary advantage of Ipamorelin is its minimal cortisol impact — GHRP-2 negates this. Stack either with a GHRH instead.' },

  { a:'cjc-1295',    b:'mk-677',
    severity:'caution', title:'GHRH + Continuous Ghrelin Mimetic — Excess GH Risk',
    mechanism:'CJC-1295 provides pulsatile GH via GHRH-R; MK-677 provides continuous 24-hour GH elevation via ghrelin receptor. Combining creates supraphysiologic sustained GH/IGF-1 that increases risk of insulin resistance, edema, joint pain, and carpal tunnel.',
    recommendation:'If combining, use significantly reduced doses (e.g., CJC-1295 100 mcg + MK-677 10 mg). Monitor IGF-1, fasting glucose, and for signs of GH excess. Many find MK-677 alone or Ipamorelin + CJC-1295 alone more manageable.' },

  { a:'sermorelin',  b:'mk-677',
    severity:'caution', title:'Sermorelin + MK-677 — Dual GH Pathway Load',
    mechanism:'Sermorelin (GHRH-R) + MK-677 (ghrelin-R) can synergize, but MK-677\'s 24h continuous elevation combined with multiple daily Sermorelin injections creates persistent elevated GH/IGF-1.',
    recommendation:'If combining, consider MK-677 at a reduced dose (10 mg vs standard 25 mg) and Sermorelin once daily before bed only. Monitor IGF-1 and fasting glucose.' },

  { a:'tesamorelin', b:'mk-677',
    severity:'caution', title:'Tesamorelin + MK-677 — Sustained GH Overload Risk',
    mechanism:'Same dual-pathway concern: Tesamorelin pulses + MK-677 continuous background creates elevated 24h GH/IGF-1. Tesamorelin already substantially raises IGF-1 on its own.',
    recommendation:'Use with caution. Reduce MK-677 to 10 mg if combining. Monitor IGF-1 (target <350 ng/mL), fasting glucose, and signs of edema or joint discomfort.' },

  { a:'ghrp-2',      b:'mk-677',
    severity:'caution', title:'Two GHRPs — Amplified Side Effects',
    mechanism:'Both act at the ghrelin receptor. Combining provides minimal additional GH benefit over MK-677 alone while significantly amplifying GHRP-2\'s cortisol and prolactin spike.',
    recommendation:'Not recommended. Choose MK-677 alone for sustained GH or GHRP-2 + GHRH for pulsatile GH. Monitor cortisol if combined.' },

  { a:'ipamorelin',  b:'mk-677',
    severity:'caution', title:'Two GHRPs — Monitor for GH Excess',
    mechanism:'Ipamorelin is pulsatile at the ghrelin receptor; MK-677 provides continuous background at the same receptor. Total GH exposure is substantially elevated.',
    recommendation:'Lower doses of both if combining (Ipamorelin 100 mcg, MK-677 10–15 mg). Check IGF-1 levels; keep below 300–350 ng/mL to minimize long-term risks.' },

  // ── CAUTION: Peptide + medication interactions ────────────────

  { a:GH_PEPTIDES,   b:DIABETES_MEDS,
    severity:'caution', title:'GH Peptides Antagonize Glucose Control',
    mechanism:'Growth hormone is a counter-regulatory hormone — it raises fasting glucose and promotes insulin resistance. All GH secretagogues amplify this effect. Combining with insulin, metformin, or semaglutide creates opposing metabolic pressures and may destabilize glycemic control.',
    recommendation:'Diabetic or pre-diabetic patients must consult their physician. Monitor fasting glucose and HbA1c before and during GH peptide use. MK-677 is particularly associated with insulin resistance at standard 25 mg doses; 10–15 mg is better tolerated metabolically.' },

  { a:GH_PEPTIDES,   b:'corticosteroids',
    severity:'caution', title:'Corticosteroids Blunt GH Response',
    mechanism:'Glucocorticoids suppress hypothalamic GHRH secretion, reduce pituitary GH sensitivity, and antagonize GH action at peripheral tissues. Concurrent use substantially reduces or eliminates GH peptide efficacy.',
    recommendation:'Short steroid bursts (<5 days) cause minimal interference. Chronic/high-dose corticosteroids largely negate GH peptide benefits. Consider timing peptides away from steroid peak plasma levels.' },

  { a:GH_PEPTIDES,   b:'beta-blockers',
    severity:'caution', title:'Beta-Blockers Attenuate GH Release',
    mechanism:'Beta-adrenergic tone contributes to GHRH-stimulated GH release. Beta-blockade reduces sympathetic drive, attenuating the GH pulse amplitude from secretagogues by an estimated 20–40%.',
    recommendation:'GH peptides still provide benefit on beta-blockers, but at reduced efficacy. Non-selective beta-blockers (propranolol) cause greater blunting than cardioselective ones (metoprolol). Discuss with your physician if optimizing GH output is a priority.' },

  { a:'mk-677',      b:'levothyroxine',
    severity:'caution', title:'MK-677 Alters Thyroid Hormone Metabolism',
    mechanism:'MK-677-induced GH/IGF-1 elevation increases peripheral conversion of T4 → T3 and can alter thyroid-binding globulin levels. This may require levothyroxine dose adjustment in hypothyroid patients.',
    recommendation:'Monitor TSH, Free T4, and Free T3 at 8–12 weeks after starting MK-677. Expect possible thyroid dose adjustment; work with your prescribing physician.' },

  { a:HEALING,       b:BLOOD_THIN,
    severity:'caution', title:'Healing Peptides + Anticoagulants',
    mechanism:'BPC-157 has demonstrated platelet and coagulation pathway modulation in preclinical studies. TB-500 similarly affects cell adhesion molecules. Combined with anticoagulants (warfarin) or antiplatelet agents (aspirin, clopidogrel), bleeding risk may be enhanced.',
    recommendation:'Use cautiously on anticoagulants. Monitor INR if on warfarin. Observe for unusual bruising or prolonged bleeding. Use the lower end of peptide dosing. GHK-Cu has less coagulation effect than BPC-157 or TB-500.' },

  { a:'bpc-157',     b:'nsaids',
    severity:'caution', title:'BPC-157 + NSAIDs: Opposing GI Effects',
    mechanism:'BPC-157\'s primary benefit for GI conditions relies on restoring mucosal integrity via nitric oxide and growth factor upregulation. NSAIDs inhibit prostaglandin synthesis and damage the gastric mucosa — directly counteracting BPC-157\'s gastroprotective mechanism.',
    recommendation:'Avoid NSAIDs when using BPC-157 for GI healing. For systemic use (tendons, muscle), this interaction is less clinically relevant. Use acetaminophen for pain management where possible.' },

  { a:'bpc-157',     b:'corticosteroids',
    severity:'caution', title:'BPC-157 + Steroids: Opposing Healing Effects',
    mechanism:'Corticosteroids impair wound healing, suppress collagen synthesis, and inhibit fibroblast activity — directly opposing BPC-157\'s tissue repair mechanisms. High-dose or chronic steroids may significantly blunt BPC-157 efficacy.',
    recommendation:'Short steroid courses are unlikely to cause major interference. Chronic steroid use substantially negates BPC-157 benefits. If both are medically required, discuss with your physician about sequencing vs simultaneous use.' },

  { a:COGNITIVE,     b:SEROTONERGIC,
    severity:'caution', title:'Serotonergic Overlap with Cognitive Peptides',
    mechanism:'Semax modulates serotonin transporter expression and BDNF (which influences serotonin system). Selank has documented enkephalin and serotonergic activity. Combined with SSRIs or SNRIs, there is a theoretical risk of serotonin excess.',
    recommendation:'Start at the lowest effective peptide dose when on SSRIs/SNRIs. Monitor for serotonin excess signs: agitation, tremor, tachycardia, diaphoresis. Space doses by 4–6 hours as a precaution. Dihexa\'s interaction is less characterized — use extra caution.' },

  { a:COGNITIVE,     b:'maoi',
    severity:'avoid', title:'MAOIs + Cognitive Peptides: Serious CNS Risk',
    mechanism:'Semax has documented serotonin transporter modulatory effects. Selank modulates enkephalins and has indirect serotonergic activity. MAOIs prevent breakdown of serotonin, dopamine, and norepinephrine. Combining serotonergic peptides with MAOIs risks serotonin syndrome — potentially life-threatening.',
    recommendation:'Absolute contraindication. Do NOT combine. If transitioning from an MAOI, observe a washout of at least 14 days (irreversible MAOIs: phenelzine, tranylcypromine) or 7 days (reversible: moclobemide). Seek physician guidance.' },

  { a:IMMUNE,        b:'immunosuppressants',
    severity:'caution', title:'Immune Peptides Oppose Immunosuppressive Therapy',
    mechanism:'Thymosin Alpha-1, LL-37, and Thymalin enhance T-cell activity, NK cell function, and innate immune responses. Immunosuppressants (tacrolimus, cyclosporine, biologics) specifically target these same immune functions.',
    recommendation:'Likely reduces efficacy of both agents. In transplant patients, immune-stimulating peptides could theoretically risk rejection episodes. Consult your transplant physician before any immune peptide use.' },

  { a:IMMUNE,        b:'corticosteroids',
    severity:'caution', title:'Immune Peptides vs. Corticosteroid Immunosuppression',
    mechanism:'Corticosteroids broadly suppress immune cell function (T-cell, macrophage, cytokine). Immune-modulating peptides promote these same activities. Opposing mechanisms reduce the efficacy of both.',
    recommendation:'If steroids are being used for inflammation control, immune peptides provide minimal additional benefit and may be partially negated. Consider timing: use immune peptides during periods of steroid tapering.' },

  { a:['pt-141'],    b:ED_DRUGS,
    severity:'caution', title:'PT-141 + PDE5 Inhibitors: BP & Cardiovascular Load',
    mechanism:'PT-141 causes transient blood pressure elevation via central melanocortin signaling. PDE5 inhibitors (sildenafil, tadalafil) cause BP reduction via vasodilation. These opposing hemodynamic effects are unpredictable and may stress the cardiovascular system.',
    recommendation:'Avoid combining without physician guidance, especially with cardiovascular disease or hypertension. If used together, use the lowest effective dose of both; do not combine with nitrates under any circumstances.' },

  { a:'pt-141',      b:'maoi',
    severity:'avoid', title:'PT-141 + MAOIs: Cardiovascular Interaction Risk',
    mechanism:'PT-141 activates MC3R/MC4R with cardiovascular effects including transient hypertension. MAOIs disrupt catecholamine metabolism and can produce unpredictable and dangerous cardiovascular responses to many agents.',
    recommendation:'Contraindicated. Do not combine. Allow full MAOI washout period before using PT-141.' },

  { a:'pt-141',      b:'beta-blockers',
    severity:'caution', title:'PT-141 + Beta-Blockers: Attenuated Response',
    mechanism:'PT-141 requires intact adrenergic signaling for full central arousal effect. Beta-blockade reduces sympathetic tone, potentially blunting PT-141\'s efficacy. Additionally, beta-blockers independently cause sexual dysfunction in some patients.',
    recommendation:'PT-141 may have reduced effect on beta-blockers. This is unlikely to cause harm but may require higher doses. Discuss with your physician whether a beta-blocker switch is possible.' },

  { a:'pt-141',      b:'kisspeptin-10',
    severity:'caution', title:'Additive Central Arousal — Nausea & CV Risk',
    mechanism:'PT-141 (MC3R/MC4R) and Kisspeptin-10 (KISS1R) both drive central arousal and LH release through different receptors. Combined use may produce excessive arousal, nausea (a common PT-141 side effect), flushing, and cardiovascular strain.',
    recommendation:'Use on separate occasions rather than combined. If both are desired, use the lower end of dosing for each. Space at least 24–48 hours apart.' },

  { a:'kisspeptin-10', b:'contraceptives',
    severity:'caution', title:'Kisspeptin Opposes Hormonal Contraceptive Action',
    mechanism:'Hormonal contraceptives suppress LH and FSH by providing continuous negative HPG feedback. Kisspeptin-10 stimulates the GnRH pulse that drives LH/FSH release — directly opposing contraceptive action. Contraceptive efficacy may be reduced.',
    recommendation:'Do not rely solely on hormonal contraception when using Kisspeptin-10. Use barrier contraception as backup. This combination is not studied in humans and represents a theoretical but pharmacologically plausible risk.' },

  { a:'kisspeptin-10', b:'trt',
    severity:'caution', title:'Kisspeptin + Exogenous Testosterone: Opposing HPG Effects',
    mechanism:'Kisspeptin-10 works upstream in the HPG axis to stimulate GnRH → LH → endogenous testosterone. Exogenous TRT suppresses the entire HPG axis via negative feedback. The two agents work at cross-purposes — exogenous testosterone largely eliminates the LH signal that Kisspeptin-10 generates.',
    recommendation:'Limited clinical utility in combining. If the goal is endogenous testosterone stimulation (e.g., fertility, post-cycle), Kisspeptin-10 is used instead of TRT, not alongside it. Discuss with your physician.' },

  { a:'epithalon',   b:'contraceptives',
    severity:'caution', title:'Epithalon Affects Pineal-Hormonal Axis',
    mechanism:'Epithalon modulates pineal melatonin and downstream pituitary gonadotropin regulation. Hormonal contraceptives already suppress HPG axis signaling. Epithalon\'s regulatory influence may be unpredictable in this context.',
    recommendation:'Generally considered low-risk in practice; primarily a theoretical concern. No dose adjustment required. Monitor for sleep or mood changes.' },

  { a:'epithalon',   b:'trt',
    severity:'caution', title:'Epithalon + TRT: Pineal-Endocrine Modulation',
    mechanism:'Epithalon\'s neuroendocrine effects occur in the context of suppressed endogenous HPG from exogenous testosterone. Clinical significance is uncertain but its longevity benefits via telomerase activation are largely independent of HPG status.',
    recommendation:'Generally well-tolerated at standard doses. Epithalon still provides anti-aging benefits independent of hormonal effects. Monitor for any unusual changes in mood, sleep, or hormonal labs.' },

  { a:'aod-9604',    b:'semaglutide',
    severity:'caution', title:'Dual Fat Loss Mechanisms — Monitor Metabolics',
    mechanism:'AOD-9604 stimulates lipolysis; semaglutide reduces appetite and improves insulin sensitivity. Combined fat mobilization can amplify caloric deficit and metabolic stress.',
    recommendation:'Effective but requires careful nutritional management. Ensure adequate protein (≥1.2 g/kg/day) to prevent lean mass loss. Monitor glucose, electrolytes, and maintain sufficient caloric intake to avoid metabolic adaptation.' },

  { a:'thymosin-a1', b:'corticosteroids',
    severity:'caution', title:'Thymosin Alpha-1 + Steroids: Opposing Immune Effects',
    mechanism:'Corticosteroids broadly suppress T-cell function and cytokine production — the exact processes Thymosin Alpha-1 is used to support. Clinical efficacy of TA1 is substantially reduced by concurrent corticosteroids.',
    recommendation:'If steroids are for acute inflammation, consider spacing TA1 injections temporally (e.g., TA1 on non-steroid days). Discuss with your physician if both are medically indicated.' },

  { a:'thymosin-a1', b:'chemotherapy',
    severity:'avoid', title:'TA1 + Chemotherapy: Use Only Under Oncologist Supervision',
    mechanism:'While some protocols have studied TA1 as an adjunct to chemotherapy (to reduce immunosuppression side effects), immune modulation during cytotoxic therapy requires expert oversight. Unguided use risks interference with treatment protocols.',
    recommendation:'Do NOT self-administer TA1 during active chemotherapy. Only use under explicit oncologist guidance — some centers use it clinically, but dosing, timing, and patient selection are critical.' },

  // ── AVOID ─────────────────────────────────────────────────────

  { a:['bpc-157',...GH_PEPTIDES,'dihexa'],  b:'chemotherapy',
    severity:'avoid', title:'Proliferative Peptides + Chemotherapy: Contraindicated',
    mechanism:'BPC-157 and GH secretagogues promote angiogenesis, cell proliferation, and growth factor signaling (VEGF, IGF-1). These are beneficial in healthy tissue but theoretically dangerous during cancer treatment, where chemotherapy aims to halt uncontrolled cell growth. Enhancing angiogenesis could support tumor growth or reduce chemo efficacy.',
    recommendation:'Do NOT use pro-angiogenic or GH-stimulating peptides during active cancer treatment without explicit oncologist approval. This is a precautionary contraindication — direct human clinical evidence is limited, but the theoretical risk is significant.' },

  { a:[...IMMUNE,'ll-37'], b:'chemotherapy',
    severity:'avoid', title:'Immune Peptides During Chemotherapy',
    mechanism:'Chemotherapy protocols depend on a carefully controlled immune and bone marrow environment. Potent immune-stimulating peptides may interfere with treatment efficacy or cause adverse immune reactions.',
    recommendation:'Avoid without oncologist guidance. Some TA1 use has been studied in oncology but only in supervised clinical settings with defined protocols.' },
];

// ═════════════════════════════════════════════════════════════════
// CATEGORY-BASED FALLBACK INTERACTIONS
// These fire when no specific interaction is found above.
// Checked in order — put caution/avoid first, compatible catch-all last.
// ═════════════════════════════════════════════════════════════════

interface CategoryInteraction {
  catA: string | string[];
  catB: string | string[];
  severity: Severity;
  title: string;
  mechanism: string;
  recommendation: string;
}

const ALL_PEPTIDE_CATS = ['gh','healing','immune','cognitive','longevity','sexual','fat-loss'];

const CATEGORY_INTERACTIONS: CategoryInteraction[] = [

  // ── Category-level CAUTION rules ─────────────────────────────

  { catA: ALL_PEPTIDE_CATS, catB: 'maoi',
    severity: 'caution',
    title: 'MAOIs + Peptides: Use Extreme Caution',
    mechanism: 'MAOIs interfere with monoamine metabolism broadly. While most peptides do not have direct serotonergic mechanisms, the MAOI class carries a high drug interaction burden. Any CNS-active peptide should be considered with caution.',
    recommendation: 'Consult a physician before combining any peptide with MAOIs. Cognitive and sexual peptides carry specific AVOID designations; for others, proceed only with medical supervision.' },

  { catA: ALL_PEPTIDE_CATS, catB: 'chemo',
    severity: 'caution',
    title: 'Peptides During Chemotherapy: Use With Caution',
    mechanism: 'Most peptide research does not include oncology populations. Even peptides without direct proliferative effects (e.g., cognitive, longevity) have incompletely characterized interactions with cytotoxic agents.',
    recommendation: 'Consult your oncologist before any peptide use during active chemotherapy. Some peptides (GH, healing) carry stronger contraindications; others are less characterized but warrant professional oversight.' },

  { catA: ['healing'], catB: 'corticosteroid',
    severity: 'caution',
    title: 'Healing Peptides + Corticosteroids: Impaired Efficacy',
    mechanism: 'Corticosteroids inhibit collagen synthesis, suppress fibroblast activity, and impair angiogenesis — directly opposing tissue repair peptides (BPC-157, TB-500, GHK-Cu).',
    recommendation: 'Reduce or eliminate corticosteroid use when possible while running a healing peptide protocol. Short steroid bursts have less impact than chronic use.' },

  { catA: ['sexual'], catB: 'corticosteroid',
    severity: 'caution',
    title: 'Corticosteroids Reduce Gonadal Hormones',
    mechanism: 'Corticosteroids suppress LH/FSH secretion and testosterone production. This reduces the hormonal substrate that sexual-health peptides depend on.',
    recommendation: 'PT-141\'s central mechanism is partially independent of testosterone, but Kisspeptin-10\'s LH-stimulating effect will be blunted. If on chronic corticosteroids, manage hormonal baseline first.' },

  { catA: ['fat-loss'], catB: 'corticosteroid',
    severity: 'caution',
    title: 'Corticosteroids Oppose Fat Loss Peptides',
    mechanism: 'Corticosteroids promote fat redistribution (central adiposity), gluconeogenesis, and insulin resistance — directly opposing AOD-9604\'s lipolytic mechanism.',
    recommendation: 'Limited clinical utility in combining. Address corticosteroid dependency before initiating fat loss peptide protocols.' },

  { catA: ['sexual'], catB: 'pde5',
    severity: 'caution',
    title: 'Sexual Peptides + PDE5 Inhibitors',
    mechanism: 'Sexual peptides and PDE5 inhibitors both affect sexual response through different mechanisms. PT-141 elevates BP transiently; PDE5 inhibitors lower BP. The combination creates unpredictable hemodynamics.',
    recommendation: 'Use lowest effective doses of both. Do not combine with nitrates. Monitor blood pressure. PT-141 has the most documented concern here; Kisspeptin-10 has less direct cardiovascular overlap.' },

  // ── Category-level COMPATIBLE rules ──────────────────────────
  // These are the catch-alls that prevent "Unknown" for well-characterized category pairs.

  { catA: ['gh'],       catB: ['healing'],
    severity: 'compatible',
    title: 'GH Peptides + Healing Peptides',
    mechanism: 'GH secretagogues act at pituitary GHRH/ghrelin receptors to raise systemic GH/IGF-1. Healing peptides (BPC-157, TB-500, GHK-Cu) act locally at growth factor receptors in injured tissue. No pharmacokinetic or pharmacodynamic conflicts are documented.',
    recommendation: 'Commonly combined. The systemic anabolic environment from GH peptides may complement the local tissue repair effects. No dose adjustments required.' },

  { catA: ['gh'],       catB: ['immune'],
    severity: 'compatible',
    title: 'GH Peptides + Immune Peptides',
    mechanism: 'GH has well-documented immunomodulatory properties (T-cell proliferation, cytokine regulation). GH secretagogues and dedicated immune peptides operate through different primary receptor systems with no known conflicts.',
    recommendation: 'Safe to combine. GH elevation may provide additive immune benefits alongside specific immune peptides.' },

  { catA: ['gh'],       catB: ['cognitive'],
    severity: 'compatible',
    title: 'GH Peptides + Cognitive Peptides',
    mechanism: 'GH/IGF-1 has central CNS effects (neurogenesis, synaptic plasticity) that may complement cognitive peptide mechanisms. No pharmacokinetic interactions are documented.',
    recommendation: 'Commonly combined. Some users report cognitive improvements from GH peptide use alone; adding nootropic peptides addresses central pathways GH does not directly target.' },

  { catA: ['gh'],       catB: ['longevity'],
    severity: 'compatible',
    title: 'GH Peptides + Longevity Peptides',
    mechanism: 'GH secretagogues and telomerase-activating peptides (Epithalon) act through separate biological systems. GH elevation supports body composition; Epithalon addresses telomere length and pineal function.',
    recommendation: 'Safe to combine. A common longevity-oriented protocol includes GH optimization alongside Epithalon cycling.' },

  { catA: ['gh'],       catB: ['fat-loss'],
    severity: 'compatible',
    title: 'GH Peptides + AOD-9604',
    mechanism: 'Most GH peptides raise IGF-1 which has some fat-preserving effects. AOD-9604 directly activates fat cell lipolysis without IGF-1 involvement. The mechanisms are independent and compatible.',
    recommendation: 'Safe combination. AOD-9604 + Ipamorelin/CJC-1295 is a well-regarded body composition stack.' },

  { catA: ['gh'],       catB: ['sexual'],
    severity: 'compatible',
    title: 'GH Peptides + Sexual Health Peptides',
    mechanism: 'GH secretagogues act at pituitary-level receptors; sexual peptides (PT-141, Kisspeptin) act on melanocortin and GnRH pathways respectively. Different receptor systems with no documented cross-reactivity.',
    recommendation: 'Safe to combine. GH optimization supports overall hormonal health, which can complement sexual function peptides.' },

  { catA: ['healing'],  catB: ['immune'],
    severity: 'compatible',
    title: 'Healing Peptides + Immune Peptides',
    mechanism: 'Tissue repair and immune modulation involve overlapping but distinct biological processes. Healing peptides drive angiogenesis and ECM remodeling; immune peptides modulate cell-mediated immunity. No adverse interactions documented.',
    recommendation: 'Often beneficially combined. Thymosin Alpha-1 is sometimes added to healing protocols to optimize the immune microenvironment of injured tissue.' },

  { catA: ['healing'],  catB: ['cognitive'],
    severity: 'compatible',
    title: 'Healing Peptides + Cognitive Peptides',
    mechanism: 'Healing peptides primarily act on peripheral and GI tissue through local growth factor receptors. Cognitive peptides primarily act on central neurotrophic and neurotransmitter systems. No documented cross-interactions.',
    recommendation: 'Safe to combine. Used together by those seeking both tissue recovery and cognitive optimization.' },

  { catA: ['healing'],  catB: ['longevity'],
    severity: 'compatible',
    title: 'Healing Peptides + Epithalon',
    mechanism: 'BPC-157 and TB-500 drive acute and chronic tissue repair; Epithalon addresses long-term cellular aging via telomerase activation and antioxidant support. Complementary time-scales of action.',
    recommendation: 'Safe and potentially synergistic from a longevity perspective. BPC-157 has documented anti-aging properties as well; combining with Epithalon addresses both acute and chronic cellular maintenance.' },

  { catA: ['healing'],  catB: ['sexual'],
    severity: 'compatible',
    title: 'Healing Peptides + Sexual Health Peptides',
    mechanism: 'No overlapping receptor systems or metabolic pathways between healing peptides and PT-141/Kisspeptin.',
    recommendation: 'Safe to combine. No dose adjustments required.' },

  { catA: ['healing'],  catB: ['fat-loss'],
    severity: 'compatible',
    title: 'Healing Peptides + AOD-9604',
    mechanism: 'AOD-9604 targets adipocyte fat metabolism; healing peptides target connective tissue, vasculature, and GI mucosa. Entirely different target tissues and receptors.',
    recommendation: 'Safe to combine. A popular protocol for those in a cut while managing injury.' },

  { catA: ['immune'],   catB: ['cognitive'],
    severity: 'compatible',
    title: 'Immune Peptides + Cognitive Peptides',
    mechanism: 'Immune modulating peptides (TA1, LL-37, Thymalin) act on lymphoid and myeloid cells; cognitive peptides (Semax, Selank, Dihexa) act on CNS neurotrophin and neurotransmitter systems. No documented pharmacokinetic or pharmacodynamic overlap.',
    recommendation: 'Safe to combine. The gut-brain-immune axis suggests potential indirect synergies (immune optimization supporting neurological function), though this is not directly demonstrated.' },

  { catA: ['immune'],   catB: ['longevity'],
    severity: 'synergistic',
    title: 'Immune Peptides + Epithalon: Complementary Anti-Aging',
    mechanism: 'Immune senescence (decline of thymic function and T-cell competence) is a major aging mechanism. Thymalin directly addresses this. Epithalon addresses telomere shortening and neuroendocrine decline. Together they target two separate hallmarks of aging.',
    recommendation: 'A well-regarded longevity combination in Khavinson\'s research tradition. Thymalin + Epithalon in cycling courses is the classical protocol for comprehensive biological age management.' },

  { catA: ['immune'],   catB: ['fat-loss'],
    severity: 'compatible',
    title: 'Immune Peptides + AOD-9604',
    mechanism: 'No receptor overlap or pharmacokinetic interactions between immune-modulating peptides and AOD-9604.',
    recommendation: 'Safe to combine. No dose adjustments needed.' },

  { catA: ['immune'],   catB: ['sexual'],
    severity: 'compatible',
    title: 'Immune Peptides + Sexual Health Peptides',
    mechanism: 'No documented interactions between thymic/innate immune peptides and melanocortin or GnRH axis peptides.',
    recommendation: 'Safe to combine. No dose adjustments required.' },

  { catA: ['cognitive'], catB: ['longevity'],
    severity: 'compatible',
    title: 'Cognitive Peptides + Epithalon',
    mechanism: 'Cognitive peptides (Semax, Selank, Dihexa, Pinealon) act on BDNF, GABA, and HGF/MET pathways in the CNS. Epithalon acts on telomerase and pineal gene expression. Different primary mechanisms.',
    recommendation: 'Safe and commonly combined. Semax or Selank + Epithalon is a popular anti-aging nootropic protocol.' },

  { catA: ['cognitive'], catB: ['fat-loss'],
    severity: 'compatible',
    title: 'Cognitive Peptides + AOD-9604',
    mechanism: 'AOD-9604 acts peripherally on adipocytes; cognitive peptides act centrally on neurotrophin and neurotransmitter systems. No known pharmacological crossover.',
    recommendation: 'Safe to combine. No dose adjustments required.' },

  { catA: ['cognitive'], catB: ['sexual'],
    severity: 'compatible',
    title: 'Cognitive Peptides + Sexual Health Peptides',
    mechanism: 'Semax/Selank act on BDNF and GABA systems; PT-141 acts on melanocortin receptors; Kisspeptin acts on KISS1R and GnRH. No direct pharmacological conflicts. Both Selank and PT-141 have mild mood effects that are non-antagonistic.',
    recommendation: 'Safe to combine. No dose adjustments needed.' },

  { catA: ['longevity'], catB: ['fat-loss'],
    severity: 'compatible',
    title: 'Epithalon + AOD-9604',
    mechanism: 'Epithalon targets telomere biology and pineal function; AOD-9604 targets adipocyte lipolysis. Entirely independent mechanisms.',
    recommendation: 'Safe to combine. No dose adjustments required.' },

  { catA: ['longevity'], catB: ['sexual'],
    severity: 'compatible',
    title: 'Epithalon + Sexual Health Peptides',
    mechanism: 'Epithalon\'s documented effects are primarily telomere/anti-aging and pineal/sleep. Sexual health peptides act on melanocortin and GnRH pathways. No documented pharmacological conflict.',
    recommendation: 'Safe to combine. No dose adjustments required.' },

  { catA: ['sexual'],    catB: ['fat-loss'],
    severity: 'compatible',
    title: 'Sexual Health Peptides + AOD-9604',
    mechanism: 'PT-141/Kisspeptin act on central and HPG axis receptors; AOD-9604 acts peripherally on adipocytes. No overlap in target tissue or receptor system.',
    recommendation: 'Safe to combine. No dose adjustments required.' },

  // ── Peptide + medication compatible catch-alls ────────────────

  { catA: ALL_PEPTIDE_CATS, catB: 'cardiovascular',
    severity: 'compatible',
    title: 'Peptides + Cardiovascular Medications',
    mechanism: 'Statins, ACE inhibitors/ARBs, and most cardiovascular medications act on hepatic cholesterol synthesis, the renin-angiotensin system, or vascular tone. Most peptides operate through growth factor, neuropeptide, or receptor systems with no documented interactions with these drug classes.',
    recommendation: 'Generally safe to combine. Note: GH peptides have a specific caution with beta-blockers (reduced GH response). No adjustments needed for statins or ACE/ARBs.' },

  { catA: ALL_PEPTIDE_CATS, catB: 'thyroid',
    severity: 'compatible',
    title: 'Peptides + Levothyroxine',
    mechanism: 'Most peptides do not directly affect thyroid hormone metabolism. Levothyroxine replaces T4 with well-characterized pharmacokinetics. The primary exception is MK-677, which has a specific caution due to T4→T3 conversion effects.',
    recommendation: 'Generally safe. Ensure a 30–60 minute gap between levothyroxine (taken fasted) and any peptide injection. MK-677 users should monitor thyroid function; others require no special precaution.' },

  { catA: ALL_PEPTIDE_CATS, catB: 'hormonal',
    severity: 'compatible',
    title: 'Peptides + Hormonal Medications',
    mechanism: 'Most peptides do not directly interact with exogenous sex hormones, aromatase inhibitors, or thyroid replacement. Specific exceptions are documented above (Kisspeptin + contraceptives, PT-141 + TRT which is synergistic, Kisspeptin + TRT which is cautioned).',
    recommendation: 'Generally safe. Review any specific pair above for exceptions. Monitor hormonal labs (testosterone, estradiol, TSH) when combining with hormonal therapy.' },

  { catA: ALL_PEPTIDE_CATS, catB: 'nsaid',
    severity: 'compatible',
    title: 'Peptides + NSAIDs',
    mechanism: 'NSAIDs inhibit cyclooxygenase enzymes affecting prostaglandin synthesis. Most peptides do not rely on prostaglandin pathways and are unaffected by NSAIDs. The exception is BPC-157 used for GI healing (specific caution above).',
    recommendation: 'Generally compatible. BPC-157 used for GI conditions should avoid NSAIDs (see specific interaction). For other peptide uses, NSAIDs can be used as needed for pain.' },

  { catA: ALL_PEPTIDE_CATS, catB: 'serotonergic',
    severity: 'compatible',
    title: 'Peptides + SSRIs / SNRIs',
    mechanism: 'Most peptides (GH secretagogues, healing, immune, longevity, fat-loss peptides) do not have documented serotonergic mechanisms. The specific caution applies to cognitive peptides (Semax, Selank).',
    recommendation: 'Generally safe for non-cognitive peptides. Cognitive peptide users on SSRIs/SNRIs should follow the specific caution guidance above.' },

  { catA: ALL_PEPTIDE_CATS, catB: 'diabetes',
    severity: 'compatible',
    title: 'Peptides + Diabetes Medications',
    mechanism: 'Healing, immune, cognitive, longevity, sexual, and fat-loss peptides do not significantly affect insulin sensitivity or glucose metabolism. GH secretagogues are the specific exception with a documented caution.',
    recommendation: 'Generally safe for non-GH peptides. AOD-9604 specifically does NOT affect insulin sensitivity (it was developed precisely to avoid GH\'s metabolic side effects). GH peptide users with diabetes should follow the specific caution guidance.' },

  { catA: ALL_PEPTIDE_CATS, catB: 'immunosuppressant',
    severity: 'compatible',
    title: 'Non-Immune Peptides + Immunosuppressants',
    mechanism: 'GH, healing, cognitive, longevity, sexual, and fat-loss peptides do not primarily act on immune cell function and are unlikely to interfere with immunosuppressive regimens. The specific caution applies to immune-modulating peptides.',
    recommendation: 'Generally safe for non-immune peptides in patients on immunosuppression. Always inform your transplant or rheumatology team when starting any new supplement or peptide.' },

  // ── Ultimate catch-all for any two peptides ───────────────────
  { catA: ALL_PEPTIDE_CATS, catB: ALL_PEPTIDE_CATS,
    severity: 'compatible',
    title: 'No Specific Interaction on Record',
    mechanism: 'These two peptide classes operate through different primary receptor systems. No pharmacokinetic interactions have been documented in available research, and no shared metabolic pathways are known to produce adverse effects.',
    recommendation: 'Generally considered safe to combine. Introduce new peptides one at a time to establish your individual response before stacking. As always, start at the lower end of the dosing range.' },
];

// ── Lookup ────────────────────────────────────────────────────────

function getSubstance(id: string) { return SUBSTANCES.find(s => s.id === id); }

function findInteraction(id1: string, id2: string): (InteractionDef | CategoryInteraction) | null {
  if (id1 === id2) return null;

  // 1 — specific pairwise interactions
  for (const ix of INTERACTIONS) {
    const aArr = Array.isArray(ix.a) ? ix.a : [ix.a];
    const bArr = Array.isArray(ix.b) ? ix.b : [ix.b];
    if (
      (aArr.includes(id1) && bArr.includes(id2)) ||
      (aArr.includes(id2) && bArr.includes(id1))
    ) return ix;
  }

  // 2 — category-based fallbacks
  const s1 = getSubstance(id1);
  const s2 = getSubstance(id2);
  if (s1 && s2) {
    for (const ci of CATEGORY_INTERACTIONS) {
      const cA = Array.isArray(ci.catA) ? ci.catA : [ci.catA];
      const cB = Array.isArray(ci.catB) ? ci.catB : [ci.catB];
      if (
        (cA.includes(s1.subCat) && cB.includes(s2.subCat)) ||
        (cA.includes(s2.subCat) && cB.includes(s1.subCat))
      ) return ci as unknown as InteractionDef;
    }
  }

  return null;
}

// ─────────────────────────────────────────────────────────────────
// UI COMPONENTS
// ─────────────────────────────────────────────────────────────────

// ── AI tool wrapper ───────────────────────────────────────────────
function _resolveId(input: string): string | null {
  const q = input.toLowerCase().trim();
  for (const s of SUBSTANCES) {
    if (s.id === q || s.name.toLowerCase() === q || (s.aliases ?? []).some(a => a.toLowerCase() === q)) return s.id;
  }
  for (const s of SUBSTANCES) {
    if (q.includes(s.id) || q.includes(s.name.toLowerCase()) || (s.aliases ?? []).some(a => q.includes(a.toLowerCase()))) return s.id;
  }
  return null;
}

export function checkStack(names: string[]) {
  const map = new Map<string, string>();
  const unresolved: string[] = [];
  for (const n of (names ?? [])) {
    const id = _resolveId(String(n));
    if (id) map.set(id, getSubstance(id)?.name ?? id);
    else unresolved.push(String(n));
  }
  const ids = [...map.keys()];
  const interactions: Array<Record<string, unknown>> = [];
  for (let i = 0; i < ids.length; i++) {
    for (let j = i + 1; j < ids.length; j++) {
      const ix = findInteraction(ids[i], ids[j]) as any;
      interactions.push({
        a: map.get(ids[i]), b: map.get(ids[j]),
        severity: ix?.severity ?? 'unknown',
        title: ix?.title ?? null,
        mechanism: ix?.mechanism ?? null,
        recommendation: ix?.recommendation ?? null,
      });
    }
  }
  return { resolved: [...map.values()], unresolved, interactions };
}
