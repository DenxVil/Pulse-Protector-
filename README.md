# Smart Trauma Vitals Assessment Pad 🏥

[![Demo](https://img.shields.io/badge/Demo-Live-brightgreen)](https://denxvil.github.io/Pulse-Protector-/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

An AI-powered trauma assessment pad demonstration that monitors patient vitals, analyzes patient condition using clinical parameters, and provides automated triage recommendations based on START (Simple Triage and Rapid Treatment) protocol with adaptive guidelines.

## 🚀 Live Demo

**[View Live Demo](https://denxvil.github.io/Pulse-Protector-/)**

## ✨ Features

### Real-time Vital Signs Monitoring
- **Central Nervous System (CNS)**: GCS Score with E/V/M breakdown, pupil reactivity, consciousness level
- **Respiratory System**: Respiratory rate, SpO2, breathing pattern
- **Cardiovascular System**: Heart rate, blood pressure, capillary refill time, pulse strength
- **Circulation Assessment**: Skin color, temperature, estimated blood loss

### Intelligent Triage Engine
- Implements START (Simple Triage and Rapid Treatment) protocol
- Four triage categories: RED (Immediate), YELLOW (Delayed), GREEN (Minor), BLACK (Expectant)
- Weighted KPI model for clinical scoring:
  - CNS Score: 30%
  - Respiratory Score: 25%
  - Cardiovascular Score: 25%
  - Circulation Score: 20%

### Pre-loaded Trauma Scenarios
1. **Road Traffic Accident** - Hemorrhagic Shock
2. **Drowning Victim** - Respiratory Distress
3. **Electrocution** - Cardiac Arrest
4. **Fall from Height** - Head Injury
5. **Mass Casualty Incident** - Explosion Victim
6. **Minor Trauma** - Stable Patient

### Demo Features
- Real-time vital signs simulation with realistic fluctuations
- Trend graphs showing vital sign history (last 5 minutes)
- Alert system for critical value changes
- Manual override controls with justification logging
- Pause/Resume simulation controls

### AI Decision Support
- Confidence scoring (0-100%)
- Clinical reasoning explanation
- Guideline attribution (START/ATLS/SALT)
- Intervention recommendations with priority levels

### Data Export
- JSON export with complete assessment data
- HTML report generation (print-ready)

## 🛠️ Technical Stack

- **Pure HTML5, CSS3, JavaScript (ES6+)**
- **No external dependencies** - Works offline, no CDN required
- **Mobile-first responsive design**
- **Dark theme medical UI**
- **Works on GitHub Pages**

## 📁 Project Structure

```
/
├── index.html          # Main HTML page
├── styles.css          # All CSS styling
├── app.js              # Core application logic
├── triage-engine.js    # AI triage decision algorithm
├── scenarios.js        # Pre-loaded trauma scenarios
└── README.md           # Documentation
```

## 🚦 Triage Categories

### RED - Immediate
- Respiratory rate <10 or >29
- Capillary refill >2 seconds
- Unable to follow simple commands
- GCS ≤8
- SpO2 <90%
- Severe hemorrhage

### YELLOW - Delayed
- Respiratory rate 10-29
- Can follow simple commands
- GCS 9-13
- SpO2 90-94%
- Moderate injuries

### GREEN - Minor
- Walking wounded
- Respiratory rate normal
- GCS 14-15
- SpO2 >95%
- Minor injuries

### BLACK - Expectant
- No respiratory effort after airway positioning
- No pulse
- Injuries incompatible with survival

## 📊 Clinical Algorithm

The triage engine uses a weighted scoring system based on:

1. **CNS Assessment (30%)**
   - Glasgow Coma Scale (3-15)
   - Pupil reactivity
   - Level of consciousness (AVPU)

2. **Respiratory Assessment (25%)**
   - Respiratory rate
   - Oxygen saturation (SpO2)
   - Breathing pattern

3. **Cardiovascular Assessment (25%)**
   - Heart rate
   - Blood pressure
   - Capillary refill time
   - Pulse quality

4. **Circulation Assessment (20%)**
   - Skin color/perfusion
   - Temperature
   - Estimated blood loss

## 🔧 Usage Instructions

### Loading a Scenario
1. Select a scenario from the dropdown menu
2. Click "Load Scenario" or the scenario will auto-load
3. Watch vital signs gradually change to match the scenario
4. Observe the triage category and recommendations update

### Manual Override
1. Click "Manual Override" button
2. Adjust any vital sign values
3. Provide a justification for the override
4. Click "Apply Override" to see updated triage

### Exporting Data
- **Export JSON**: Downloads complete assessment data as JSON
- **Export Report**: Generates a printable HTML report

### Controls
- **Pause/Resume**: Toggle simulation updates
- **Reset**: Return to default healthy values
- **Contrast**: Toggle high contrast mode for accessibility

## 📋 Validation Rules

| Parameter | Valid Range |
|-----------|-------------|
| Heart Rate | 30-200 BPM |
| Respiratory Rate | 0-60 breaths/min |
| SpO2 | 0-100% |
| Blood Pressure | 40/20 - 250/150 mmHg |
| GCS | 3-15 |
| Temperature | 32-42°C |

## 📚 Clinical References

- **ATLS**: American College of Surgeons Committee on Trauma. ATLS Student Course Manual, 10th edition
- **START Protocol**: Benson M, Koenig KL, Schultz CH. Disaster triage: START, then SAVE. Ann Emerg Med. 1996
- **SALT Triage**: Lerner EB, et al. Mass casualty triage: An evaluation of the SALT triage guideline. Ann Emerg Med. 2008

## ⚠️ Disclaimer

**This is a demonstration application for educational purposes only.**

This software is NOT intended for clinical use, medical diagnosis, or treatment decisions. Always consult qualified medical professionals for actual patient care.

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Contact

For questions or feedback, please open an issue on GitHub