# Pulse Protector — Smart Trauma Response System 💓

[![Live Demo](https://img.shields.io/badge/Demo-Live-brightgreen)](https://denxvil.github.io/Pulse-Protector-/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Tech](https://img.shields.io/badge/HTML%20%7C%20CSS%20%7C%20JS-Frontend-orange.svg)](https://github.com/DenxVil/Pulse-Protector-/)

SAVE THE LIFE — An AI-assisted research prototype for rapid trauma assessment, vitals monitoring and START-based triage. This repository contains the static front-end demo used to showcase the Smart Kit, Smart Pad and AI Triage Engine.

---

## Quick links
- Live demo: https://denxvil.github.io/Pulse-Protector-/
- Repo: https://github.com/DenxVil/Pulse-Protector-/
- Pages: index.html · smart-kit.html · smart-pad.html · smart-triage.html · economy.html · effectiveness.html · roadmap.html · references.html

---

## Hero summary — what this project does
Pulse Protector is a lightweight, offline-capable front-end prototype that simulates:
- Real-time vital-sign monitoring (HR, RR, SpO₂, BP, GCS, temperature, pupils)
- START-inspired automated triage (RED / YELLOW / GREEN / BLACK)
- An AI triage engine that uses a weighted KPI scoring model and returns:
  - triage category
  - confidence score
  - human-readable reasoning
  - prioritized intervention recommendations
- Pre-loaded trauma scenarios for demo playback and exportable JSON/HTML reports

This is a research/demo prototype (Catalyst Hackathon 2025 / MAMC SCISOC) — not for clinical use.

---

## Visual & UI design highlights
Pulse Protector's UI uses:
- Glassmorphism (blurred translucent cards, accent gradients)
- Subtle animated backgrounds (floating orbs and slow parallax)
- Floating product image with a soft vertical “floating” animation
- 3D-like interactive card hover transforms for emphasis and affordance
- Mobile-first responsive layout with a light and dark theme toggle

If you want to try a small 3D card demo locally, paste the snippet below into a file and open it:

```html
<!-- 3D demo card: paste into a file and open in browser -->
<style>
  body { background:#0f172a; display:flex;min-height:100vh;align-items:center;justify-content:center;font-family:Inter,system-ui; }
  .card { width:360px;height:220px;perspective:1000px; }
  .card-inner {
    width:100%;height:100%; border-radius:14px;
    background:linear-gradient(135deg,#0ea5a4,#6366f1);
    color:#fff;padding:20px;box-shadow:0 20px 40px rgba(2,6,23,.6);
    transform-style:preserve-3d;transition:transform .45s cubic-bezier(.2,.8,.2,1)
  }
  .card:hover .card-inner { transform: rotateY(12deg) rotateX(6deg) translateZ(6px); }
  .title { font-weight:800; font-size:20px; }
  .sub { opacity:.9;margin-top:8px }
</style>
<div class="card">
  <div class="card-inner">
    <div class="title">Pulse Protector</div>
    <div class="sub">AI Trauma Vitals • START triage • Live simulation</div>
  </div>
</div>
```

---

## Project structure (what's where)
```
/
├── index.html            # Landing + hero + site nav
├── styles.css            # UI, animations, glassmorphism
├── app.js                # Core application UI & simulation glue
├── triage-engine.js      # Decision logic: scoring, triage, interventions
├── scenarios.js          # Preloaded demo scenarios
├── vitals-fetcher.js     # (simulated) vitals stream + exporter
├── navigation.js         # small nav helpers
├── *.html                # detailed pages: smart-kit, smart-pad, smart-triage, economy, etc
└── README.md
```

---

## Triage engine — how decisions are made (concise)
The triage engine implements a START-like approach combined with a weighted KPI model:

- KPI weights:
  - CNS (Central Nervous System): 30%
  - Respiratory: 25%
  - Cardiovascular: 25%
  - Circulation: 20%

- Each subsystem returns:
  - raw score (0–100)
  - issues list
  - alerts (severity-coded)
  - weightedScore = rawScore * subsystemWeight

- Overall score = sum(weightedScore of subsystems)  
  Category decisions use START criteria + thresholds and an overallScore fallback:
  - BLACK: no respiratory effort + no pulse
  - RED: critical RR (<10 or >29), CRT > 2 s, GCS ≤ 8, SpO₂ < 90, systolic < 70, massive blood loss, fixed pupils, unresponsive
  - YELLOW: intermediate abnormalities, overallScore < threshold, or specific borderline findings
  - GREEN: ambulatory / minor injuries / normal ranges

- Interventions generation:
  - Outcomes produce prioritized interventions (immediate / urgent / routine) such as airway protection, high-flow oxygen, IV access, warmed fluids, tourniquet/MTP activation, neurosurgical referral triggers, etc.

(The complete logic is implemented in triage-engine.js — it exports the main calculateTriageCategory function and per-system calculators for testability.)

---

## Valid ranges & validation rules
| Parameter | Acceptable Range |
|---:|:---|
| Heart rate | 30–200 BPM |
| Respiratory rate | 0–60 breaths/min |
| SpO₂ | 0–100% |
| Blood pressure | 40/20 – 250/150 mmHg |
| GCS | 3–15 |
| Temperature | 32–42 °C |
| Capillary refill time (CRT) | 0–10 s (CRT >2 s considered delayed) |

---

## Demo scenarios (built-in)
- Road Traffic Accident — hemorrhagic shock
- Drowning Victim — respiratory compromise
- Electrocution — cardiac arrest / severe arrhythmia
- Fall from Height — head injury
- Mass Casualty Incident — explosion victim
- Minor Trauma — stable walking wounded

Each scenario animates vitals over time to emulate realistic fluctuations and show triage updates, alerts and intervention suggestions.

---

## Exports & reporting
- JSON export of complete assessment (vitals, timestamped system scores, triage result, interventions)
- Printable HTML report snapshot with timestamps and triage explanation
- Manual override facility in UI: change a vital, provide justification, and log the override with timestamp for audit

---

## Accessibility & UX
- Mobile-first responsive layout
- High-contrast mode toggle
- Reduced-motion support expected (CSS uses prefers-reduced-motion in places where required)
- Clear color-coding for triage bands with text + numeric redundancy (color + labels)

---

## How to run the demo
No build required — this is a static front-end prototype:

```bash
git clone https://github.com/DenxVil/Pulse-Protector-.git
cd Pulse-Protector-
# Open index.html in your browser (or host via simple file server)
# e.g. Python local server:
python3 -m http.server 8000
# then open http://localhost:8000
```

Live demo is hosted on GitHub Pages: https://denxvil.github.io/Pulse-Protector-/

---

## Development notes & tips
- UI is pure HTML/CSS/JS — keep dependencies zero for offline usage
- triage-engine.js is modular and exportable — unit tests can import the calculators and verify expected triage for test cases
- scenarios.js contains preconfigured scenario sequences (useful to author more cases)
- vitals-fetcher.js simulates device/ESP32 streaming; to test with real hardware, swap the simulation layer for WebBluetooth / WebSocket ingestion
- For 3D / subtle motion improvements, prefer transform-based animations (translateZ/rotate) and limit heavy blur on mobile

---

## Clinical references
- ATLS — American College of Surgeons Committee on Trauma. ATLS Student Course Manual (10th ed.)
- START Protocol — Benson M, Koenig KL, Schultz CH. "Disaster triage: START, then SAVE." Ann Emerg Med. 1996
- SALT Triage — Lerner EB, et al. "Mass casualty triage: An evaluation of the SALT triage guideline." Ann Emerg Med. 2008

---

## License & disclaimer
This project is open-source under the MIT License.

**Disclaimer:** This is a research prototype and educational demonstration. It is NOT intended for clinical use, medical diagnosis, or patient treatment decisions. Always consult qualified clinical professionals for real patient care.

---

## Contributing
Contributions welcome:
1. Fork the repo
2. Create a branch for your feature
3. Open a PR with a clear description and screenshots / demo
4. Add unit tests for triage logic when modifying triage-engine.js

Suggested contribution areas:
- More realistic vitals generative model
- FHIR-compliant export format
- Offline-first PWA support + service worker
- Accessibility improvements & ARIA roles
- Unit tests for triage rules and scenario playback determinism

---

## Contact
Open an issue or PR on GitHub: https://github.com/DenxVil/Pulse-Protector-/issues

---

Thank you for working on Pulse Protector — together we can make better tools for early trauma recognition and education. 💙
