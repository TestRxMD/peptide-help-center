import { useState, useMemo, useRef, useEffect } from 'react';

// ── Substance database ────────────────────────────────────────────

type SubType = 'peptide' | 'medication' | 'supplement';
type Severity = 'synergistic' | 'compatible' | 'caution' | 'avoid';

interface Substance {
  id: string;
  name: string;
  type: SubType;
  category: string;
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

// ── Substance groups (used in interaction definitions) ────────────
const GH_PEPTIDES    = ['cjc-1295', 'ipamorelin', 'sermorelin', 'ghrp-2', 'mk-677', 'tesamorelin'];
const IMMUNE         = ['thymosin-a1', 'll-37', 'thymalin'];
const COGNITIVE      = ['semax', 'selank', 'dihexa', 'pinealon'];
const BLOOD_THINNERS = ['warfarin', 'aspirin', 'clopidogrel'];
const SEROTONERGIC   = ['ssri', 'snri'];
const DIABETES_MEDS  = ['insulin', 'metformin', 'semaglutide'];
const ED_DRUGS       = ['sildenafil', 'tadalafil'];

const SUBSTANCES: Substance[] = [
  // ── Peptides ──────────────────────────────────────────────────
  { id: 'bpc-157',       name: 'BPC-157',              type: 'peptide',     category: 'Tissue Repair',    description: 'Body protection compound; potent healing & gut peptide',         aliases: ['body protective compound'] },
  { id: 'tb-500',        name: 'TB-500',                type: 'peptide',     category: 'Tissue Repair',    description: 'Thymosin Beta-4 fragment; promotes tissue regeneration',         aliases: ['thymosin beta-4', 'thymosin b4'] },
  { id: 'ghk-cu',        name: 'GHK-Cu',               type: 'peptide',     category: 'Tissue Repair',    description: 'Copper tripeptide; collagen synthesis, wound healing, anti-aging' },
  { id: 'cjc-1295',      name: 'CJC-1295',             type: 'peptide',     category: 'GH Secretagogue',  description: 'GHRH analogue; sustained GH release with long half-life',          aliases: ['cjc 1295', 'cjc1295'] },
  { id: 'ipamorelin',    name: 'Ipamorelin',            type: 'peptide',     category: 'GH Secretagogue',  description: 'Selective GHRP; clean GH pulse, minimal cortisol/prolactin' },
  { id: 'sermorelin',    name: 'Sermorelin',            type: 'peptide',     category: 'GH Secretagogue',  description: 'GHRH analogue; natural GH stimulation, shorter half-life' },
  { id: 'ghrp-2',        name: 'GHRP-2',               type: 'peptide',     category: 'GH Secretagogue',  description: 'Growth hormone releasing peptide; strong GH pulse, raises cortisol' },
  { id: 'mk-677',        name: 'MK-677',               type: 'peptide',     category: 'GH Secretagogue',  description: 'Oral ghrelin mimetic; sustained GH/IGF-1 elevation',                aliases: ['ibutamoren', 'mk677'] },
  { id: 'tesamorelin',   name: 'Tesamorelin',           type: 'peptide',     category: 'GH Secretagogue',  description: 'GHRH analogue; FDA-approved for HIV lipodystrophy' },
  { id: 'aod-9604',      name: 'AOD-9604',             type: 'peptide',     category: 'Metabolic',        description: 'GH fragment 176-191; fat metabolism without IGF-1 elevation',     aliases: ['aod9604', 'gh frag'] },
  { id: 'thymosin-a1',   name: 'Thymosin Alpha-1',     type: 'peptide',     category: 'Immune',           description: 'Thymic peptide; immune modulation, antiviral, anti-tumor',        aliases: ['ta1', 'thymalfasin'] },
  { id: 'll-37',         name: 'LL-37',                type: 'peptide',     category: 'Immune',           description: 'Cathelicidin antimicrobial peptide; broad immune activation' },
  { id: 'thymalin',      name: 'Thymalin',             type: 'peptide',     category: 'Immune',           description: 'Thymic bioregulator; T-cell maturation, immune homeostasis' },
  { id: 'semax',         name: 'Semax',                type: 'peptide',     category: 'Cognitive',        description: 'ACTH analogue; BDNF upregulation, neuroprotection, focus' },
  { id: 'selank',        name: 'Selank',               type: 'peptide',     category: 'Cognitive',        description: 'Anxiolytic nootropic; GABAergic + serotonin modulation, anti-anxiety' },
  { id: 'dihexa',        name: 'Dihexa',               type: 'peptide',     category: 'Cognitive',        description: 'Potent nootropic; HGF/MET signaling, synaptic formation' },
  { id: 'pinealon',      name: 'Pinealon',             type: 'peptide',     category: 'Cognitive',        description: 'Khavinson brain bioregulator; neuroprotection, anti-apoptotic' },
  { id: 'epithalon',     name: 'Epithalon',            type: 'peptide',     category: 'Longevity',        description: 'Telomerase activator; anti-aging, sleep regulation, antioxidant',  aliases: ['epitalon', 'epithalamin'] },
  { id: 'pt-141',        name: 'PT-141',               type: 'peptide',     category: 'Sexual Health',    description: 'Melanocortin agonist; central sexual arousal in men & women',      aliases: ['bremelanotide'] },
  { id: 'kisspeptin-10', name: 'Kisspeptin-10',        type: 'peptide',     category: 'Sexual Health',    description: 'GnRH secretagogue; LH/FSH pulse, testosterone boost, libido',     aliases: ['kisspeptin', 'kp-10'] },

  // ── Medications ───────────────────────────────────────────────
  { id: 'insulin',           name: 'Insulin',                   type: 'medication', category: 'Diabetes',         description: 'Exogenous insulin for blood sugar control' },
  { id: 'metformin',         name: 'Metformin',                 type: 'medication', category: 'Diabetes',         description: 'Biguanide; first-line type 2 diabetes drug' },
  { id: 'semaglutide',       name: 'Semaglutide (Ozempic)',     type: 'medication', category: 'Diabetes/Weight',  description: 'GLP-1 agonist; diabetes & weight loss (Ozempic, Wegovy)',     aliases: ['ozempic', 'wegovy', 'glp-1'] },
  { id: 'warfarin',          name: 'Warfarin',                  type: 'medication', category: 'Blood Thinner',    description: 'Vitamin K antagonist anticoagulant',                          aliases: ['coumadin'] },
  { id: 'aspirin',           name: 'Aspirin',                   type: 'medication', category: 'Blood Thinner',    description: 'Antiplatelet / NSAID at various doses' },
  { id: 'clopidogrel',       name: 'Clopidogrel',               type: 'medication', category: 'Blood Thinner',    description: 'P2Y12 antiplatelet agent',                                    aliases: ['plavix'] },
  { id: 'nsaids',            name: 'NSAIDs',                    type: 'medication', category: 'Anti-inflammatory',description: 'Ibuprofen, naproxen, celecoxib — cyclooxygenase inhibitors',   aliases: ['ibuprofen', 'naproxen', 'advil', 'motrin'] },
  { id: 'corticosteroids',   name: 'Corticosteroids',           type: 'medication', category: 'Anti-inflammatory',description: 'Prednisone, dexamethasone, methylprednisolone',               aliases: ['prednisone', 'dexamethasone', 'steroids'] },
  { id: 'ssri',              name: 'SSRIs',                     type: 'medication', category: 'Psychiatric',      description: 'Sertraline, fluoxetine, escitalopram — serotonin reuptake inhibitors', aliases: ['sertraline', 'fluoxetine', 'lexapro', 'zoloft'] },
  { id: 'snri',              name: 'SNRIs',                     type: 'medication', category: 'Psychiatric',      description: 'Venlafaxine, duloxetine — serotonin + norepinephrine reuptake inhibitors', aliases: ['venlafaxine', 'duloxetine', 'effexor', 'cymbalta'] },
  { id: 'maoi',              name: 'MAOIs',                     type: 'medication', category: 'Psychiatric',      description: 'Monoamine oxidase inhibitors — phenelzine, tranylcypromine',   aliases: ['phenelzine', 'tranylcypromine', 'selegiline'] },
  { id: 'beta-blockers',     name: 'Beta-Blockers',             type: 'medication', category: 'Cardiovascular',   description: 'Metoprolol, atenolol, propranolol — heart rate & BP control',  aliases: ['metoprolol', 'atenolol', 'propranolol'] },
  { id: 'ace-inhibitors',    name: 'ACE Inhibitors / ARBs',     type: 'medication', category: 'Cardiovascular',   description: 'Lisinopril, losartan — blood pressure medications',            aliases: ['lisinopril', 'losartan', 'ramipril'] },
  { id: 'sildenafil',        name: 'Sildenafil (Viagra)',        type: 'medication', category: 'Sexual Health',    description: 'PDE5 inhibitor for erectile dysfunction',                     aliases: ['viagra'] },
  { id: 'tadalafil',         name: 'Tadalafil (Cialis)',         type: 'medication', category: 'Sexual Health',    description: 'Long-acting PDE5 inhibitor',                                  aliases: ['cialis'] },
  { id: 'contraceptives',    name: 'Hormonal Contraceptives',   type: 'medication', category: 'Hormonal',         description: 'Combined pill, progestin-only, IUD, implant, patch',          aliases: ['birth control', 'the pill', 'ocps'] },
  { id: 'trt',               name: 'Testosterone (TRT/HRT)',    type: 'medication', category: 'Hormonal',         description: 'Exogenous testosterone therapy',                              aliases: ['testosterone', 'trt', 'hrt'] },
  { id: 'aromatase-i',       name: 'Aromatase Inhibitors',      type: 'medication', category: 'Hormonal',         description: 'Anastrozole, exemestane — reduce estrogen conversion',        aliases: ['anastrozole', 'exemestane', 'letrozole', 'ai'] },
  { id: 'levothyroxine',     name: 'Levothyroxine (T4)',         type: 'medication', category: 'Thyroid',          description: 'Synthetic T4 thyroid hormone replacement',                    aliases: ['synthroid', 'levoxyl'] },
  { id: 'immunosuppressants',name: 'Immunosuppressants',        type: 'medication', category: 'Immune',           description: 'Tacrolimus, cyclosporine, mycophenolate, biologics',          aliases: ['tacrolimus', 'cyclosporine', 'prograf'] },
  { id: 'chemotherapy',      name: 'Chemotherapy',              type: 'medication', category: 'Oncology',         description: 'Any anti-cancer cytotoxic or targeted therapy',               aliases: ['chemo', 'cancer treatment'] },
  { id: 'statins',           name: 'Statins',                   type: 'medication', category: 'Cardiovascular',   description: 'Atorvastatin, rosuvastatin — cholesterol lowering',            aliases: ['atorvastatin', 'rosuvastatin', 'lipitor', 'crestor'] },
];

// ── Interaction database ──────────────────────────────────────────

const INTERACTIONS: InteractionDef[] = [

  // ════════════════════════════════════════════════════════════════
  // SYNERGISTIC — peptide + peptide stacks
  // ════════════════════════════════════════════════════════════════

  {
    a: 'bpc-157', b: 'tb-500',
    severity: 'synergistic',
    title: 'Classic Healing Stack',
    mechanism: 'BPC-157 accelerates angiogenesis, collagen synthesis, and GI repair through upregulation of growth factors (VEGF, EGF). TB-500 promotes actin polymerization and cell migration via thymosin β4. Their mechanisms are complementary and non-overlapping.',
    recommendation: 'One of the most well-validated peptide stacks. Typical protocol: BPC-157 250–500 mcg + TB-500 2–2.5 mg, 2–3× per week. Excellent for musculoskeletal injuries, tendon repair, and chronic inflammation.',
  },
  {
    a: 'cjc-1295', b: 'ipamorelin',
    severity: 'synergistic',
    title: 'Gold Standard GH Stack',
    mechanism: 'CJC-1295 is a GHRH analogue that primes the pituitary for a large GH pulse. Ipamorelin is a selective GHRP that triggers that pulse with minimal cortisol or prolactin elevation. Together they produce substantially greater GH release than either alone via synergistic receptor mechanisms.',
    recommendation: 'The most widely used GH peptide combination. Dose 100–200 mcg CJC-1295 + 200–300 mcg Ipamorelin, ideally before bed or post-workout. Begin with one injection daily; experienced users often use 2×/day.',
  },
  {
    a: 'cjc-1295', b: 'ghrp-2',
    severity: 'synergistic',
    title: 'Strong GH Release Combination',
    mechanism: 'Same GHRH + GHRP synergy as CJC-1295/Ipamorelin. GHRP-2 produces a stronger cortisol and prolactin spike than Ipamorelin, which may be undesirable for some users but provides maximal GH output.',
    recommendation: 'Effective for maximum GH release. Monitor for increased hunger, cortisol-related water retention, and elevated prolactin. Consider Ipamorelin as a cleaner alternative if side effects are a concern.',
  },
  {
    a: 'semax', b: 'selank',
    severity: 'synergistic',
    title: 'Cognitive + Anxiolytic Balance',
    mechanism: 'Semax upregulates BDNF and increases catecholamine activity, providing stimulating cognitive enhancement. Selank modulates GABA, serotonin, and enkephalins, producing anxiolytic effects that counterbalance Semax\'s stimulating properties. Together they support focused, calm mental performance.',
    recommendation: 'Well-regarded nootropic stack. Common protocol: 200–600 mcg Semax + 200–500 mcg Selank intranasally in the morning. Many users find the combination superior to either alone for productivity and stress management.',
  },
  {
    a: 'bpc-157', b: 'ghk-cu',
    severity: 'synergistic',
    title: 'Tissue Repair + Collagen Synthesis',
    mechanism: 'BPC-157 drives vascular growth and inflammatory resolution; GHK-Cu stimulates fibroblast activity, collagen and glycosaminoglycan synthesis, and antioxidant defense. Both peptides promote tissue regeneration through distinct pathways.',
    recommendation: 'Excellent combination for wound healing, skin repair, and connective tissue support. GHK-Cu can be used topically over the injury site while BPC-157 is dosed systemically. Well-tolerated combination.',
  },
  {
    a: 'thymosin-a1', b: 'll-37',
    severity: 'synergistic',
    title: 'Broad-Spectrum Immune Support',
    mechanism: 'Thymosin Alpha-1 modulates adaptive immunity (T-cell differentiation, dendritic cell maturation) while LL-37 activates innate immunity (antimicrobial, neutrophil recruitment, TLR modulation). Together they cover both branches of the immune system.',
    recommendation: 'Useful during infections or for immune optimization. Thymosin Alpha-1: 1–1.6 mg 2×/week; LL-37: 100–200 mcg daily. Safe to combine; monitor for transient flu-like immune activation symptoms.',
  },
  {
    a: 'aod-9604', b: 'ipamorelin',
    severity: 'synergistic',
    title: 'Body Composition Stack',
    mechanism: 'AOD-9604 acts on fat cell receptors to specifically stimulate lipolysis without affecting IGF-1 or insulin sensitivity. Ipamorelin increases GH pulsatility, which shifts the body toward fat oxidation and lean mass preservation. The two mechanisms complement each other.',
    recommendation: 'Popular body recomposition stack. AOD-9604 250–300 mcg + Ipamorelin 200–300 mcg, 2× daily (fasted AM and pre-bed). No significant safety concerns with this combination.',
  },
  {
    a: 'epithalon', b: 'thymalin',
    severity: 'synergistic',
    title: 'Longevity + Thymic Function',
    mechanism: 'Epithalon activates telomerase and modulates pineal gene expression. Thymalin restores thymic function, which naturally declines with age. Both are Khavinson-developed bioregulators targeting age-related decline through complementary mechanisms.',
    recommendation: 'Classic Khavinson longevity combination. Often used in annual "bioregulator" courses. Well-tolerated; consider cycling (e.g., 10-day courses 1–2× per year per Khavinson protocols).',
  },
  {
    a: ['bpc-157', 'tb-500'], b: 'ghk-cu',
    severity: 'synergistic',
    title: 'Triple Healing Protocol',
    mechanism: 'BPC-157 and TB-500 cover tissue repair from complementary angles; adding GHK-Cu provides additional collagen remodeling, anti-inflammatory, and antioxidant support.',
    recommendation: 'Advanced healing protocol used for serious injury, post-surgery, or refractory tendinopathy. All three are well-tolerated and have non-overlapping mechanisms.',
  },

  // ════════════════════════════════════════════════════════════════
  // COMPATIBLE — generally safe to combine
  // ════════════════════════════════════════════════════════════════

  {
    a: ['bpc-157', 'tb-500', 'ghk-cu'], b: ['thymosin-a1', 'll-37', 'thymalin'],
    severity: 'compatible',
    title: 'Healing + Immune Support',
    mechanism: 'Healing peptides and immune-modulating peptides act through different receptor systems with no known pharmacokinetic or pharmacodynamic interactions.',
    recommendation: 'Safe to combine. Many users add Thymosin Alpha-1 to healing protocols to support the immune environment of recovery.',
  },
  {
    a: GH_PEPTIDES, b: ['bpc-157', 'tb-500', 'ghk-cu'],
    severity: 'compatible',
    title: 'GH Peptides + Healing Peptides',
    mechanism: 'GH secretagogues and tissue repair peptides act on different receptor systems. GH elevation may actually support tissue healing indirectly.',
    recommendation: 'Common and well-tolerated combination. No dose adjustments needed. This is a very popular stack for body recomposition + recovery.',
  },
  {
    a: GH_PEPTIDES, b: COGNITIVE,
    severity: 'compatible',
    title: 'GH Peptides + Nootropics',
    mechanism: 'Growth hormone peptides and nootropic peptides act on entirely different receptor systems. No known interactions.',
    recommendation: 'Safe to combine. Some users report improved cognition on GH peptides, which Semax/Selank may complement.',
  },
  {
    a: 'epithalon', b: COGNITIVE,
    severity: 'compatible',
    title: 'Longevity + Cognitive Peptides',
    mechanism: 'Epithalon\'s primary mechanism is telomerase activation and pineal gene regulation. Cognitive peptides act on neurotrophin and neurotransmitter pathways.',
    recommendation: 'Safe to combine. Epithalon + Semax or Pinealon is a common longevity-cognition protocol.',
  },
  {
    a: 'aod-9604', b: 'bpc-157',
    severity: 'compatible',
    title: 'Fat Loss + Gut Healing',
    mechanism: 'AOD-9604 targets adipocytes; BPC-157 primarily acts on GI and connective tissue. Non-overlapping mechanisms.',
    recommendation: 'Popular combination for those on fat loss protocols who also want GI support.',
  },
  {
    a: ['trt'], b: ['ipamorelin', 'cjc-1295'],
    severity: 'compatible',
    title: 'TRT + GH Peptides',
    mechanism: 'Testosterone and GH secretagogues act through different axes (HPG vs. GH axis). Both promote body composition improvements via complementary mechanisms.',
    recommendation: 'Very commonly combined. No direct interaction; monitor IGF-1, glucose, and hemoglobin/hematocrit. Consider baseline and follow-up labs.',
  },
  {
    a: ['trt'], b: ['bpc-157', 'tb-500'],
    severity: 'compatible',
    title: 'TRT + Healing Peptides',
    mechanism: 'Testosterone supports anabolic recovery; healing peptides address tissue repair directly. Complementary mechanisms.',
    recommendation: 'Safe to combine. TRT users commonly add BPC-157/TB-500 for injury recovery.',
  },
  {
    a: ['aromatase-i'], b: ['ipamorelin', 'cjc-1295', 'sermorelin'],
    severity: 'compatible',
    title: 'Aromatase Inhibitors + GH Peptides',
    mechanism: 'AIs reduce estrogen conversion; GH peptides stimulate GH/IGF-1. Different pathways with no significant interaction.',
    recommendation: 'Safe to combine when both are clinically indicated.',
  },
  {
    a: 'statins', b: ['bpc-157', 'tb-500', 'ghk-cu', 'ipamorelin', 'cjc-1295'],
    severity: 'compatible',
    title: 'Statins + Peptides',
    mechanism: 'Statins inhibit HMG-CoA reductase. Most peptides operate through growth factor, receptor, or signaling pathways unrelated to cholesterol synthesis.',
    recommendation: 'No known clinically significant interactions. Monitor liver enzymes (AST/ALT) if combining statins with any stressor.',
  },

  // ════════════════════════════════════════════════════════════════
  // CAUTION — use carefully, monitor, may need dose adjustment
  // ════════════════════════════════════════════════════════════════

  {
    a: 'cjc-1295', b: 'sermorelin',
    severity: 'caution',
    title: 'Redundant GHRH Peptides',
    mechanism: 'CJC-1295 and Sermorelin are both GHRH analogues competing for the same receptor. Combining them provides little additive benefit and may cause receptor desensitization faster than either alone.',
    recommendation: 'Choose one GHRH analogue at a time. CJC-1295 (with DAC) is preferred for convenience due to its longer half-life. If seeking natural GH rhythm, use Sermorelin alone.',
  },
  {
    a: 'cjc-1295', b: 'tesamorelin',
    severity: 'caution',
    title: 'Redundant GHRH Peptides',
    mechanism: 'Same receptor class. Combining two GHRH analogues risks receptor saturation without proportional GH benefit.',
    recommendation: 'Use only one GHRH analogue at a time. Tesamorelin is specifically studied for visceral fat in HIV lipodystrophy; CJC-1295 is more commonly used for general GH optimization.',
  },
  {
    a: 'sermorelin', b: 'tesamorelin',
    severity: 'caution',
    title: 'Redundant GHRH Peptides',
    mechanism: 'Both are GHRH analogues at the same pituitary receptor. No clinical benefit to combining.',
    recommendation: 'Select one based on your goal. Do not combine.',
  },
  {
    a: 'ghrp-2', b: 'mk-677',
    severity: 'caution',
    title: 'Double GH Stimulation — Excess Risk',
    mechanism: 'GHRP-2 triggers acute GH pulses via ghrelin receptor; MK-677 provides sustained 24-hour GH/IGF-1 elevation via the same receptor. Combining them produces supraphysiologic GH exposure which increases risks of insulin resistance, water retention, joint pain, and elevated cortisol.',
    recommendation: 'Use caution. If combined, reduce doses of both. Monitor fasting glucose and IGF-1 levels. Many users prefer Ipamorelin + MK-677 for a cleaner profile.',
  },
  {
    a: 'ipamorelin', b: 'mk-677',
    severity: 'caution',
    title: 'Double GH Stimulation',
    mechanism: 'Ipamorelin is a pulsatile GHRP; MK-677 provides continuous background GH elevation. Combining amplifies total GH output. This can be intentional but requires monitoring.',
    recommendation: 'If intentionally stacking for maximal GH, use lower doses of each (e.g., Ipamorelin 100 mcg + MK-677 10–15 mg) and monitor IGF-1, fasting glucose, and signs of GH excess (joint pain, paresthesias, edema).',
  },
  {
    a: GH_PEPTIDES, b: DIABETES_MEDS,
    severity: 'caution',
    title: 'GH Peptides + Diabetes Medications',
    mechanism: 'Growth hormone is counter-regulatory to insulin — it raises fasting glucose and promotes insulin resistance. GH secretagogues amplify this effect. Concurrent use with insulin, metformin, or semaglutide creates opposing metabolic pressures and may destabilize blood sugar control.',
    recommendation: 'Diabetic or pre-diabetic patients should consult their physician before using GH peptides. Monitor fasting glucose and HbA1c closely. MK-677 in particular is well-known to cause insulin resistance at standard doses.',
  },
  {
    a: GH_PEPTIDES, b: 'corticosteroids',
    severity: 'caution',
    title: 'Corticosteroids Blunt GH Response',
    mechanism: 'Glucocorticoids suppress GHRH secretion, reduce pituitary GH sensitivity, and block GH action at peripheral tissues. Concurrent use substantially reduces or eliminates the efficacy of GH-stimulating peptides.',
    recommendation: 'Short courses of corticosteroids (< 5 days) likely cause minimal interference. Chronic or high-dose steroid use largely negates GH peptide benefits. Consider timing peptides away from steroid doses.',
  },
  {
    a: GH_PEPTIDES, b: 'beta-blockers',
    severity: 'caution',
    title: 'Beta-Blockers Reduce GH Release',
    mechanism: 'Beta-adrenergic blockade reduces sympathetic-mediated GHRH release and attenuates the natural GH pulse. Reduced pulse amplitude means GH peptides produce a blunted response.',
    recommendation: 'GH peptide efficacy may be 20–40% reduced on beta-blockers. Discuss with your physician. Cardioselective beta-blockers (metoprolol) may have less effect than non-selective ones.',
  },
  {
    a: 'bpc-157', b: BLOOD_THINNERS,
    severity: 'caution',
    title: 'BPC-157 + Anticoagulants',
    mechanism: 'BPC-157 has been shown in rodent studies to modulate platelet aggregation and coagulation cascade components. When combined with anticoagulants (warfarin) or antiplatelet agents (aspirin, clopidogrel), there is a theoretical risk of enhanced bleeding.',
    recommendation: 'Use cautiously in patients on anticoagulants. Have INR/PT monitored if on warfarin. Watch for unusual bruising or prolonged bleeding. Lower end of BPC-157 dosing range may be preferable.',
  },
  {
    a: 'bpc-157', b: 'nsaids',
    severity: 'caution',
    title: 'Opposing GI Mechanisms',
    mechanism: 'BPC-157 is primarily used for its gastroprotective and GI healing properties, achieved partly by promoting nitric oxide production and mucosal integrity. NSAIDs inhibit prostaglandin synthesis and damage gastric mucosa — directly opposing BPC-157\'s mechanism of action.',
    recommendation: 'If BPC-157 is being used for GI conditions, avoid concurrent NSAIDs. For systemic use (tendon, muscle), NSAIDs are less likely to interfere. Choose acetaminophen for pain management where possible.',
  },
  {
    a: ['semax', 'selank', 'dihexa'], b: SEROTONERGIC,
    severity: 'caution',
    title: 'Serotonergic Overlap',
    mechanism: 'Semax has documented serotonin transporter modulatory effects. Selank modulates enkephalins and has indirect serotonergic activity. Combined with SSRIs or SNRIs, there is a theoretical risk of serotonin excess, especially at higher doses.',
    recommendation: 'Start at the lowest effective peptide dose and titrate slowly if also on SSRIs/SNRIs. Monitor for signs of excess serotonin: agitation, tremor, rapid heart rate, diaphoresis. Space dosing by 4–6 hours as a precaution.',
  },
  {
    a: ['pt-141'], b: ED_DRUGS,
    severity: 'caution',
    title: 'Additive Blood Pressure Effects',
    mechanism: 'PT-141 causes transient blood pressure elevation (via melanocortin receptors) and sexual arousal. PDE5 inhibitors cause blood pressure reduction through vasodilation. These opposing hemodynamic effects can be unpredictable and may cause cardiovascular stress.',
    recommendation: 'Avoid combining without physician guidance, especially in patients with cardiovascular disease or hypertension. If used together, start with lowest doses of both; do not use if nitrates are part of your regimen.',
  },
  {
    a: 'pt-141', b: 'kisspeptin-10',
    severity: 'caution',
    title: 'Overlapping Sexual Arousal Pathways',
    mechanism: 'PT-141 activates melanocortin receptors (MC3R/MC4R) to drive central sexual arousal. Kisspeptin-10 stimulates GnRH → LH/FSH release and independently promotes sexual arousal through kisspeptin receptor activation. Combining them may cause excessive arousal, nausea, and cardiovascular strain.',
    recommendation: 'Use on separate days rather than combined. If combining is desired, use lower doses of each. PT-141 already has a meaningful side-effect profile (nausea, facial flushing) that Kisspeptin may amplify.',
  },
  {
    a: 'kisspeptin-10', b: 'contraceptives',
    severity: 'caution',
    title: 'Opposing HPG Axis Effects',
    mechanism: 'Hormonal contraceptives suppress LH and FSH by providing negative feedback on the HPG axis. Kisspeptin-10 stimulates GnRH-mediated LH/FSH release — directly opposing the contraceptive mechanism.',
    recommendation: 'Kisspeptin may reduce contraceptive efficacy. Do not rely solely on hormonal contraception when using Kisspeptin-10. Use barrier methods as backup. This combination is not clinically studied.',
  },
  {
    a: IMMUNE, b: 'immunosuppressants',
    severity: 'caution',
    title: 'Opposing Immune Mechanisms',
    mechanism: 'Thymosin Alpha-1, LL-37, and Thymalin enhance immune cell activity, T-cell differentiation, and innate immune responses. Immunosuppressants (tacrolimus, cyclosporine, biologics) are specifically designed to suppress these same immune functions.',
    recommendation: 'This combination is likely to produce a reduced clinical effect from both agents. In transplant patients, immune-stimulating peptides could theoretically risk rejection. Discuss with your transplant physician before use.',
  },
  {
    a: 'mk-677', b: 'levothyroxine',
    severity: 'caution',
    title: 'MK-677 Alters Thyroid Metabolism',
    mechanism: 'MK-677 increases GH and IGF-1, which can increase peripheral conversion of T4 to T3 and affect thyroid-binding globulin. This may require levothyroxine dose adjustment in hypothyroid patients.',
    recommendation: 'Monitor TSH, Free T4, and Free T3 every 8–12 weeks when starting MK-677 on levothyroxine. Expect possible need for dose adjustment.',
  },
  {
    a: 'epithalon', b: 'trt',
    severity: 'caution',
    title: 'Pineal-Hormonal Axis Overlap',
    mechanism: 'Epithalon modulates pineal melatonin secretion and has downstream effects on pituitary gonadotropin regulation. Exogenous testosterone (TRT) already suppresses endogenous HPG axis signaling; Epithalon\'s regulatory effects may be blunted or unpredictable in this context.',
    recommendation: 'Generally safe at standard doses; monitor for any unusual hormonal symptoms. Epithalon is likely to still provide its telomere/anti-aging benefits independently of HPG effects.',
  },
  {
    a: 'epithalon', b: 'contraceptives',
    severity: 'caution',
    title: 'Pineal Axis + Hormonal Suppression',
    mechanism: 'Similar to TRT interaction: Epithalon\'s neuroendocrine regulatory effects occur in the context of HPG suppression from contraceptives. Clinical significance is uncertain.',
    recommendation: 'Low risk in practice; primarily theoretical. No dose adjustment required. Monitor for changes in sleep or mood.',
  },
  {
    a: 'aod-9604', b: 'semaglutide',
    severity: 'caution',
    title: 'Additive Fat Loss — Metabolic Monitoring',
    mechanism: 'AOD-9604 stimulates lipolysis through beta-3 adrenergic-like receptor activation. Semaglutide reduces appetite and improves insulin sensitivity. Combined, caloric deficit and fat mobilization are amplified, potentially stressing metabolic homeostasis.',
    recommendation: 'Effective combination for fat loss but requires careful monitoring of glucose, electrolytes, and nutritional intake. Adequate protein intake (≥1.2 g/kg) is important to prevent lean mass loss.',
  },
  {
    a: 'dihexa', b: SEROTONERGIC,
    severity: 'caution',
    title: 'Dihexa CNS Activity + Antidepressants',
    mechanism: 'Dihexa is a potent HGF/MET activator with significant neuroplasticity effects. Its full interaction profile with serotonergic drugs is not well characterized; there may be additive CNS stimulation.',
    recommendation: 'Start Dihexa at the lowest dose if on SSRIs/SNRIs. Monitor for CNS over-activation: anxiety, insomnia, restlessness. Space doses by several hours. Limited human clinical data exists.',
  },

  // ════════════════════════════════════════════════════════════════
  // AVOID — contraindicated or high-risk combination
  // ════════════════════════════════════════════════════════════════

  {
    a: COGNITIVE, b: 'maoi',
    severity: 'avoid',
    title: 'Risk of CNS / Serotonin Crisis',
    mechanism: 'Semax and Selank both modulate serotonergic neurotransmission. MAOIs inhibit the breakdown of serotonin, dopamine, and norepinephrine. Combining serotonergic peptides with MAOIs risks serotonin syndrome — a potentially life-threatening condition characterized by hyperthermia, muscle rigidity, and autonomic instability.',
    recommendation: 'Do NOT combine. If transitioning from an MAOI to peptide use, observe a wash-out period of at least 14 days (for irreversible MAOIs) or 7 days (for reversible MAOIs like moclobemide). Seek physician guidance.',
  },
  {
    a: 'pt-141', b: 'maoi',
    severity: 'avoid',
    title: 'Cardiovascular Interaction Risk',
    mechanism: 'PT-141 activates melanocortin receptors with cardiovascular effects (transient BP elevation). MAOIs interfere with catecholamine metabolism and can amplify cardiovascular responses to a wide range of agents unpredictably.',
    recommendation: 'Absolute contraindication. Do not combine. PT-141 should not be used within 14 days of an irreversible MAOI.',
  },
  {
    a: ['bpc-157', ...GH_PEPTIDES, 'dihexa'], b: 'chemotherapy',
    severity: 'avoid',
    title: 'Potential Interference with Oncology Treatment',
    mechanism: 'BPC-157 and several GH peptides promote angiogenesis, cell proliferation, and growth factor signaling. While this is beneficial in healthy tissue, these same properties are theoretically concerning in the context of cancer treatment, where chemotherapy aims to halt uncontrolled cell growth.',
    recommendation: 'Do NOT use pro-angiogenic or proliferative peptides during active cancer treatment without explicit oncologist approval. This is a precautionary contraindication — direct clinical evidence in humans is limited, but the theoretical risk warrants caution.',
  },
  {
    a: IMMUNE, b: 'chemotherapy',
    severity: 'avoid',
    title: 'Immune Modulation During Chemotherapy',
    mechanism: 'Chemotherapy relies on a carefully managed immune and bone marrow environment. Immune-stimulating peptides (Thymosin Alpha-1, LL-37) may interfere with treatment protocols or cause unpredictable immune responses.',
    recommendation: 'Avoid during active chemotherapy without oncologist guidance. Thymosin Alpha-1 has been studied as an adjunct to chemo in specific protocols — but only under medical supervision.',
  },
  {
    a: 'ghrp-2', b: 'ghrp-2',
    severity: 'avoid',
    title: 'Avoid Double-Dosing GHRP-2',
    mechanism: 'GHRP-2 has a ceiling effect and causes significant cortisol and prolactin elevation. Increasing frequency beyond 3× daily or stacking it with other GHRPs produces no additional GH benefit while compounding the cortisol burden.',
    recommendation: 'Do not combine GHRP-2 with other GHRPs (GHRP-6, hexarelin). Stick to 2–3× daily dosing maximum. Consider Ipamorelin as a cleaner alternative if cortisol elevation is a concern.',
  },
];

// ── Severity config ───────────────────────────────────────────────

const SEV: Record<Severity, { label: string; icon: string; color: string; bg: string; border: string; barColor: string }> = {
  synergistic: { label: 'Synergistic', icon: '✦', color: '#15803d', bg: 'rgba(21,128,61,0.08)',  border: 'rgba(21,128,61,0.25)',  barColor: '#15803d' },
  compatible:  { label: 'Compatible',  icon: '✓', color: '#1f40cc', bg: 'rgba(31,64,204,0.06)',  border: 'rgba(31,64,204,0.2)',   barColor: '#1f40cc' },
  caution:     { label: 'Caution',     icon: '⚠', color: '#b45309', bg: 'rgba(180,83,9,0.07)',   border: 'rgba(180,83,9,0.25)',   barColor: '#b45309' },
  avoid:       { label: 'Avoid',       icon: '✗', color: '#dc2626', bg: 'rgba(220,38,38,0.07)',  border: 'rgba(220,38,38,0.25)',  barColor: '#dc2626' },
};

// ── Lookup helpers ────────────────────────────────────────────────

function findInteraction(id1: string, id2: string): InteractionDef | null {
  if (id1 === id2) return null;
  for (const ix of INTERACTIONS) {
    const aArr = Array.isArray(ix.a) ? ix.a : [ix.a];
    const bArr = Array.isArray(ix.b) ? ix.b : [ix.b];
    if (
      (aArr.includes(id1) && bArr.includes(id2)) ||
      (aArr.includes(id2) && bArr.includes(id1))
    ) return ix;
  }
  return null;
}

function getSubstance(id: string): Substance | undefined {
  return SUBSTANCES.find(s => s.id === id);
}

// ── Sub-components ────────────────────────────────────────────────

function SeverityBadge({ severity, large }: { severity: Severity; large?: boolean }) {
  const s = SEV[severity];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      fontSize: large ? 12 : 10.5,
      fontWeight: 700,
      padding: large ? '4px 10px' : '2px 8px',
      borderRadius: 6,
      background: s.bg,
      border: `1px solid ${s.border}`,
      color: s.color,
      flexShrink: 0,
    }}>
      {s.icon} {s.label}
    </span>
  );
}

function SubstanceChip({ sub, onRemove }: { sub: Substance; onRemove: () => void }) {
  const color = sub.type === 'peptide' ? '#1f40cc' : '#7c3aed';
  const bg    = sub.type === 'peptide' ? 'rgba(31,64,204,0.08)' : 'rgba(124,58,237,0.08)';
  const bdr   = sub.type === 'peptide' ? 'rgba(31,64,204,0.25)' : 'rgba(124,58,237,0.3)';
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      background: bg, border: `1px solid ${bdr}`,
      borderRadius: 7, padding: '5px 10px',
      fontSize: 12.5, fontWeight: 600, color,
    }}>
      <span style={{ fontSize: 9.5, opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
        {sub.type}
      </span>
      {sub.name}
      <button
        onClick={onRemove}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color, padding: 0, fontSize: 13, lineHeight: 1, opacity: 0.6 }}
      >✕</button>
    </div>
  );
}

function InteractionCard({ a, b, ix }: { a: Substance; b: Substance; ix: InteractionDef | null }) {
  const [open, setOpen] = useState(false);

  if (!ix) {
    return (
      <div className="card" style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 4, alignSelf: 'stretch', borderRadius: 3, background: 'var(--border)', flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 3 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{a.name}</span>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>+</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{b.name}</span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            No specific interaction on record — likely compatible, but research is limited. Consult a healthcare provider.
          </div>
        </div>
        <span style={{
          fontSize: 10.5, fontWeight: 700, padding: '2px 8px', borderRadius: 6,
          background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-muted)',
        }}>Unknown</span>
      </div>
    );
  }

  const s = SEV[ix.severity];
  return (
    <div
      className="card"
      style={{
        padding: 0, overflow: 'hidden',
        borderColor: s.border,
        background: s.bg,
        cursor: 'pointer',
      }}
      onClick={() => setOpen(v => !v)}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px' }}>
        <div style={{ width: 4, alignSelf: 'stretch', borderRadius: 3, background: s.barColor, flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
            <span style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-primary)' }}>{a.name}</span>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 400 }}>+</span>
            <span style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-primary)' }}>{b.name}</span>
          </div>
          <div style={{ fontWeight: 600, fontSize: 12.5, color: s.color }}>{ix.title}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <SeverityBadge severity={ix.severity} large />
          <span style={{ fontSize: 11, color: 'var(--text-muted)', transform: open ? 'none' : 'rotate(-90deg)', transition: '150ms' }}>▼</span>
        </div>
      </div>

      {/* Expanded detail */}
      {open && (
        <div
          style={{ borderTop: `1px solid ${s.border}`, padding: '14px 16px 16px 36px' }}
          onClick={e => e.stopPropagation()}
        >
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 5 }}>Mechanism</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.65 }}>{ix.mechanism}</div>
          </div>
          <div style={{
            padding: '10px 12px', borderRadius: 8,
            background: 'var(--bg-surface)', border: `1px solid ${s.border}`,
          }}>
            <div style={{ fontSize: 10.5, fontWeight: 700, color: s.color, textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 4 }}>
              {ix.severity === 'synergistic' ? '✦ Recommendation' : ix.severity === 'avoid' ? '✗ Action Required' : '⚠ Recommendation'}
            </div>
            <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{ix.recommendation}</div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Search dropdown ───────────────────────────────────────────────

function SubstanceSearch({ selected, onAdd }: {
  selected: string[];
  onAdd: (id: string) => void;
}) {
  const [query, setQuery] = useState('');
  const [open,  setOpen]  = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const q = query.toLowerCase().trim();
  const results = SUBSTANCES.filter(s => {
    if (selected.includes(s.id)) return false;
    if (!q) return true;
    return (
      s.name.toLowerCase().includes(q) ||
      s.category.toLowerCase().includes(q) ||
      (s.aliases ?? []).some(a => a.includes(q))
    );
  }).slice(0, 12);

  const peptides = results.filter(s => s.type === 'peptide');
  const meds     = results.filter(s => s.type === 'medication');

  const pick = (id: string) => {
    onAdd(id);
    setQuery('');
    setOpen(false);
  };

  return (
    <div ref={ref} style={{ position: 'relative', width: '100%', maxWidth: 480 }}>
      <div style={{ position: 'relative' }}>
        <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 14, color: 'var(--text-muted)', pointerEvents: 'none' }}>🔍</span>
        <input
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder="Search peptides or medications…"
          style={{ paddingLeft: 36 }}
        />
      </div>

      {open && results.length > 0 && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 50,
          background: 'var(--bg-surface)', border: '1px solid var(--border-light)',
          borderRadius: 10, boxShadow: 'var(--shadow-lg)', overflow: 'hidden',
          maxHeight: 380, overflowY: 'auto',
        }}>
          {[{ label: '💊 Peptides', items: peptides }, { label: '💊 Medications', items: meds }]
            .filter(g => g.items.length > 0)
            .map(group => (
              <div key={group.label}>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.6px', padding: '8px 14px 4px' }}>
                  {group.label}
                </div>
                {group.items.map(s => (
                  <button
                    key={s.id}
                    onClick={() => pick(s.id)}
                    style={{
                      width: '100%', textAlign: 'left', padding: '9px 14px',
                      background: 'none', border: 'none', borderBottom: '1px solid var(--border)',
                      cursor: 'pointer', fontFamily: 'inherit',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
                    }}
                    onMouseOver={e => e.currentTarget.style.background = 'var(--bg-subtle)'}
                    onMouseOut={e => e.currentTarget.style.background = 'none'}
                  >
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{s.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>{s.description.slice(0, 60)}…</div>
                    </div>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', flexShrink: 0 }}>{s.category}</span>
                  </button>
                ))}
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────

export default function InteractionCheckerPage() {
  const [selected, setSelected] = useState<string[]>([]);

  const add    = (id: string) => setSelected(prev => prev.includes(id) ? prev : [...prev, id]);
  const remove = (id: string) => setSelected(prev => prev.filter(x => x !== id));
  const clear  = () => setSelected([]);

  // Compute all unique pairs
  const pairs = useMemo(() => {
    const result: { a: Substance; b: Substance; ix: InteractionDef | null }[] = [];
    for (let i = 0; i < selected.length; i++) {
      for (let j = i + 1; j < selected.length; j++) {
        const a = getSubstance(selected[i]);
        const b = getSubstance(selected[j]);
        if (a && b) result.push({ a, b, ix: findInteraction(a.id, b.id) });
      }
    }
    return result;
  }, [selected]);

  // Summary counts
  const counts = useMemo(() => {
    const c = { synergistic: 0, compatible: 0, caution: 0, avoid: 0, unknown: 0 };
    pairs.forEach(p => {
      if (!p.ix) c.unknown++;
      else c[p.ix.severity]++;
    });
    return c;
  }, [pairs]);

  const hasAvoid    = counts.avoid > 0;
  const hasCaution  = counts.caution > 0;
  const hasSynergy  = counts.synergistic > 0;

  // Sort pairs: avoid first, then caution, then synergistic, then compatible, then unknown
  const ORDER: Record<Severity | 'unknown', number> = { avoid: 0, caution: 1, synergistic: 2, compatible: 3, unknown: 4 };
  const sortedPairs = [...pairs].sort((x, y) => {
    const xKey = x.ix ? x.ix.severity : 'unknown';
    const yKey = y.ix ? y.ix.severity : 'unknown';
    return ORDER[xKey as Severity | 'unknown'] - ORDER[yKey as Severity | 'unknown'];
  });

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px 16px 48px' }}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{
          fontSize: 22, fontWeight: 700, color: 'var(--text-primary)',
          marginBottom: 6, letterSpacing: '-0.02em',
          fontFamily: "'DM Sans', sans-serif",
        }}>
          ⚗️ Peptide Interaction Checker
        </h1>
        <p style={{ fontSize: 13.5, color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: 620 }}>
          Check peptide-to-peptide and peptide-to-medication interactions.
          Add any combination below to see synergies, cautions, and contraindications.
        </p>
      </div>

      {/* Search + chips */}
      <div className="card" style={{ padding: '18px 20px', marginBottom: 20 }}>
        <SubstanceSearch selected={selected} onAdd={add} />

        {selected.length > 0 && (
          <div style={{ marginTop: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {selected.length} substance{selected.length !== 1 ? 's' : ''} selected
              </span>
              <button
                onClick={clear}
                style={{ fontSize: 11.5, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
              >
                Clear all
              </button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {selected.map(id => {
                const s = getSubstance(id);
                return s ? <SubstanceChip key={id} sub={s} onRemove={() => remove(id)} /> : null;
              })}
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      {selected.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚗️</div>
          <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
            Select two or more substances to check interactions
          </div>
          <div style={{ fontSize: 13, lineHeight: 1.6, maxWidth: 460, margin: '0 auto' }}>
            Search for peptides and medications above. The checker will analyze every
            pair and show synergies, cautions, and contraindications.
          </div>
          {/* Example quick picks */}
          <div style={{ marginTop: 28, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 8 }}>
            {[['bpc-157','tb-500'],['cjc-1295','ipamorelin'],['semax','ssri'],['bpc-157','warfarin']].map(([a, b]) => {
              const sa = getSubstance(a)!;
              const sb = getSubstance(b)!;
              return (
                <button
                  key={`${a}-${b}`}
                  onClick={() => { add(a); add(b); }}
                  style={{
                    padding: '6px 14px', borderRadius: 8, fontSize: 12.5,
                    background: 'var(--bg-input)', border: '1px solid var(--border)',
                    color: 'var(--text-secondary)', cursor: 'pointer', fontFamily: 'inherit',
                  }}
                >
                  {sa.name} + {sb.name}
                </button>
              );
            })}
          </div>
          <div style={{ marginTop: 10, fontSize: 12, color: 'var(--text-muted)' }}>Try a quick example above</div>
        </div>
      )}

      {selected.length === 1 && (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: 13.5 }}>Add one more substance to see interactions.</div>
        </div>
      )}

      {pairs.length > 0 && (
        <>
          {/* Summary bar */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
            {(Object.entries(counts) as [keyof typeof counts, number][])
              .filter(([k, v]) => v > 0 && k !== 'unknown')
              .map(([key, val]) => {
                const s = SEV[key as Severity];
                return (
                  <div key={key} style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '6px 12px', borderRadius: 8,
                    background: s.bg, border: `1px solid ${s.border}`,
                    fontSize: 12, fontWeight: 700, color: s.color,
                  }}>
                    {s.icon} {val} {s.label}
                  </div>
                );
              })}
            {counts.unknown > 0 && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '6px 12px', borderRadius: 8,
                background: 'var(--bg-input)', border: '1px solid var(--border)',
                fontSize: 12, fontWeight: 700, color: 'var(--text-muted)',
              }}>
                ? {counts.unknown} Unknown
              </div>
            )}
          </div>

          {/* Alert banners */}
          {hasAvoid && (
            <div style={{
              padding: '12px 16px', borderRadius: 10, marginBottom: 12,
              background: 'rgba(220,38,38,0.07)', border: '1px solid rgba(220,38,38,0.3)',
              display: 'flex', alignItems: 'flex-start', gap: 10,
            }}>
              <span style={{ fontSize: 16, flexShrink: 0 }}>🚫</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 13, color: '#dc2626', marginBottom: 2 }}>
                  Contraindication detected
                </div>
                <div style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>
                  One or more combinations in your list are flagged as <strong>Avoid</strong>. Review the details below and consult a healthcare provider before proceeding.
                </div>
              </div>
            </div>
          )}
          {!hasAvoid && hasCaution && (
            <div style={{
              padding: '12px 16px', borderRadius: 10, marginBottom: 12,
              background: 'rgba(180,83,9,0.07)', border: '1px solid rgba(180,83,9,0.25)',
              display: 'flex', alignItems: 'flex-start', gap: 10,
            }}>
              <span style={{ fontSize: 16, flexShrink: 0 }}>⚠️</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 13, color: '#b45309', marginBottom: 2 }}>
                  Caution advised
                </div>
                <div style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>
                  Some combinations require monitoring or dose adjustments. Click each result to read the full guidance.
                </div>
              </div>
            </div>
          )}
          {hasSynergy && !hasCaution && !hasAvoid && (
            <div style={{
              padding: '12px 16px', borderRadius: 10, marginBottom: 12,
              background: 'rgba(21,128,61,0.07)', border: '1px solid rgba(21,128,61,0.25)',
              display: 'flex', alignItems: 'flex-start', gap: 10,
            }}>
              <span style={{ fontSize: 16, flexShrink: 0 }}>✅</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 13, color: '#15803d', marginBottom: 2 }}>
                  All clear — synergistic combination
                </div>
                <div style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>
                  No cautions detected. This is a well-regarded stack.
                </div>
              </div>
            </div>
          )}

          {/* Interaction cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {sortedPairs.map((p, i) => (
              <InteractionCard key={i} a={p.a} b={p.b} ix={p.ix} />
            ))}
          </div>
        </>
      )}

      {/* Disclaimer */}
      <div style={{
        marginTop: 40, padding: '14px 16px', borderRadius: 10,
        background: 'var(--bg-subtle)', border: '1px solid var(--border)',
        fontSize: 11.5, color: 'var(--text-muted)', lineHeight: 1.65,
      }}>
        <strong style={{ color: 'var(--text-secondary)' }}>Educational Disclaimer:</strong> This tool is for informational purposes only and does not constitute medical advice. Interaction data is based on available research literature, pharmacological principles, and clinical experience — not all combinations have been studied in controlled human trials. Always consult a qualified healthcare provider before starting, stopping, or combining any peptide, drug, or supplement.
      </div>
    </div>
  );
}
