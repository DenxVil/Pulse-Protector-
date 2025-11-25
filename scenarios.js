/**
 * Pre-loaded Trauma Scenarios for Smart Trauma Vitals Assessment Pad
 * Based on ATLS (Advanced Trauma Life Support) guidelines
 * 
 * Each scenario contains:
 * - cns: Central Nervous System vitals
 * - respiratory: Respiratory system vitals
 * - cardio: Cardiovascular system vitals
 * - circulation: Circulation assessment
 */

const scenarios = {
    // Scenario 1: Road Traffic Accident with Hemorrhagic Shock
    rta_shock: {
        id: 'rta_shock',
        name: 'Road Traffic Accident - Hemorrhagic Shock',
        description: 'Adult male, 35 years old, involved in high-speed motor vehicle collision. Suspected internal hemorrhage with Class III shock.',
        cns: {
            gcs: 12,
            gcsBreakdown: { eye: 3, verbal: 4, motor: 5 },
            pupils: 'reactive',
            consciousness: 'confused'
        },
        respiratory: {
            rate: 32,
            spo2: 88,
            pattern: 'labored'
        },
        cardio: {
            hr: 130,
            bpSystolic: 80,
            bpDiastolic: 50,
            crt: 4,
            pulse: 'weak'
        },
        circulation: {
            skin: 'pale',
            temp: 35.2,
            bloodLoss: 1500
        },
        expectedTriage: 'RED',
        clinicalNotes: 'Patient shows signs of Class III hemorrhagic shock. Immediate fluid resuscitation and surgical intervention required.'
    },

    // Scenario 2: Drowning Victim with Respiratory Distress
    drowning: {
        id: 'drowning',
        name: 'Drowning Victim - Respiratory Distress',
        description: 'Child, 8 years old, found submerged in swimming pool for approximately 3 minutes. CPR initiated at scene.',
        cns: {
            gcs: 9,
            gcsBreakdown: { eye: 2, verbal: 3, motor: 4 },
            pupils: 'sluggish',
            consciousness: 'responds_to_pain'
        },
        respiratory: {
            rate: 8,
            spo2: 75,
            pattern: 'irregular'
        },
        cardio: {
            hr: 45,
            bpSystolic: 70,
            bpDiastolic: 40,
            crt: 5,
            pulse: 'weak'
        },
        circulation: {
            skin: 'cyanotic',
            temp: 34.8,
            bloodLoss: 0
        },
        expectedTriage: 'RED',
        clinicalNotes: 'Severe hypoxia with bradycardia. Requires immediate airway management and ventilatory support.'
    },

    // Scenario 3: Electrocution with Cardiac Arrest
    electrocution: {
        id: 'electrocution',
        name: 'Electrocution - Cardiac Arrest',
        description: 'Adult male, 42 years old, high voltage electrical burn at construction site. Found unresponsive by colleagues.',
        cns: {
            gcs: 3,
            gcsBreakdown: { eye: 1, verbal: 1, motor: 1 },
            pupils: 'fixed',
            consciousness: 'unresponsive'
        },
        respiratory: {
            rate: 0,
            spo2: 0,
            pattern: 'absent'
        },
        cardio: {
            hr: 0,
            bpSystolic: 0,
            bpDiastolic: 0,
            crt: 0,
            pulse: 'absent'
        },
        circulation: {
            skin: 'pale',
            temp: 36.2,
            bloodLoss: 0
        },
        expectedTriage: 'BLACK',
        clinicalNotes: 'Cardiac arrest with no signs of life. Despite resuscitation attempts, patient shows no response. Consider expectant management in MCI setting.'
    },

    // Scenario 4: Fall from Height with Head Injury
    fall_head_injury: {
        id: 'fall_head_injury',
        name: 'Fall from Height - Head Injury',
        description: 'Adult female, 28 years old, fell from 4-meter scaffolding. Helmet worn but sustained direct head impact.',
        cns: {
            gcs: 7,
            gcsBreakdown: { eye: 2, verbal: 2, motor: 3 },
            pupils: 'unequal',
            consciousness: 'responds_to_pain'
        },
        respiratory: {
            rate: 22,
            spo2: 93,
            pattern: 'irregular'
        },
        cardio: {
            hr: 55,
            bpSystolic: 160,
            bpDiastolic: 95,
            crt: 2,
            pulse: 'strong'
        },
        circulation: {
            skin: 'normal',
            temp: 37.0,
            bloodLoss: 200
        },
        expectedTriage: 'RED',
        clinicalNotes: 'Cushing reflex present (bradycardia, hypertension). Unequal pupils suggest herniation. Immediate neurosurgical consultation required.'
    },

    // Scenario 5: Mass Casualty Incident - Multiple Victims
    mci_multiple: {
        id: 'mci_multiple',
        name: 'Mass Casualty Incident - Explosion Victim',
        description: 'Adult, 50 years old, blast injury from industrial accident. Multiple shrapnel wounds, ambulatory at scene.',
        cns: {
            gcs: 14,
            gcsBreakdown: { eye: 4, verbal: 4, motor: 6 },
            pupils: 'reactive',
            consciousness: 'alert'
        },
        respiratory: {
            rate: 24,
            spo2: 94,
            pattern: 'normal'
        },
        cardio: {
            hr: 100,
            bpSystolic: 110,
            bpDiastolic: 70,
            crt: 2,
            pulse: 'strong'
        },
        circulation: {
            skin: 'pale',
            temp: 36.5,
            bloodLoss: 400
        },
        expectedTriage: 'YELLOW',
        clinicalNotes: 'Walking wounded with moderate blood loss. Stable for delayed treatment. Monitor for blast lung injury development.'
    },

    // Scenario 6: Minor Injury (GREEN category example)
    minor_injury: {
        id: 'minor_injury',
        name: 'Minor Trauma - Stable Patient',
        description: 'Adult male, 25 years old, bicycle accident with superficial abrasions and contusions. Fully conscious and ambulatory.',
        cns: {
            gcs: 15,
            gcsBreakdown: { eye: 4, verbal: 5, motor: 6 },
            pupils: 'reactive',
            consciousness: 'alert'
        },
        respiratory: {
            rate: 16,
            spo2: 98,
            pattern: 'normal'
        },
        cardio: {
            hr: 85,
            bpSystolic: 120,
            bpDiastolic: 80,
            crt: 2,
            pulse: 'strong'
        },
        circulation: {
            skin: 'normal',
            temp: 36.8,
            bloodLoss: 50
        },
        expectedTriage: 'GREEN',
        clinicalNotes: 'Walking wounded. Minor abrasions only. Can wait for treatment. Discharge with wound care instructions.'
    }
};

/**
 * Normal vital sign ranges for reference
 */
const normalRanges = {
    gcs: { min: 15, max: 15, unit: '', label: 'Glasgow Coma Scale' },
    respiratoryRate: { min: 12, max: 20, unit: 'breaths/min', label: 'Respiratory Rate' },
    spo2: { min: 95, max: 100, unit: '%', label: 'Oxygen Saturation' },
    heartRate: { min: 60, max: 100, unit: 'BPM', label: 'Heart Rate' },
    bpSystolic: { min: 90, max: 140, unit: 'mmHg', label: 'Systolic BP' },
    bpDiastolic: { min: 60, max: 90, unit: 'mmHg', label: 'Diastolic BP' },
    crt: { min: 0, max: 2, unit: 'seconds', label: 'Capillary Refill Time' },
    temp: { min: 36.1, max: 37.2, unit: '°C', label: 'Body Temperature' },
    bloodLoss: { min: 0, max: 250, unit: 'ml', label: 'Estimated Blood Loss' }
};

/**
 * Clinical guidelines reference
 */
const guidelines = {
    START: {
        name: 'START (Simple Triage and Rapid Treatment)',
        description: 'Primary triage system for mass casualty incidents. Based on respirations, perfusion, and mental status.',
        reference: 'Benson M, Koenig KL, Schultz CH. Disaster triage: START, then SAVE. Ann Emerg Med. 1996'
    },
    ATLS: {
        name: 'ATLS (Advanced Trauma Life Support)',
        description: 'Comprehensive trauma assessment protocol following ABCDE approach.',
        reference: 'American College of Surgeons Committee on Trauma. ATLS Student Course Manual, 10th ed.'
    },
    SALT: {
        name: 'SALT (Sort, Assess, Lifesaving Interventions, Treatment/Transport)',
        description: 'Mass casualty triage incorporating lifesaving interventions.',
        reference: 'Lerner EB, et al. Mass casualty triage: An evaluation of the SALT triage guideline. Ann Emerg Med. 2008'
    }
};

/**
 * Intervention recommendations based on conditions
 */
const interventions = {
    airway: [
        'Head-tilt chin-lift maneuver',
        'Jaw thrust (if cervical spine injury suspected)',
        'Oropharyngeal airway insertion',
        'Nasopharyngeal airway insertion',
        'Endotracheal intubation',
        'Surgical airway (cricothyrotomy)'
    ],
    breathing: [
        'High-flow oxygen via non-rebreather mask',
        'Bag-valve-mask ventilation',
        'Needle decompression for tension pneumothorax',
        'Chest tube insertion',
        'Mechanical ventilation'
    ],
    circulation: [
        'Direct pressure to bleeding sites',
        'Tourniquet application for extremity hemorrhage',
        'Large bore IV access x2',
        'Fluid resuscitation (crystalloid)',
        'Blood product transfusion',
        'FAST ultrasound examination'
    ],
    disability: [
        'Spinal immobilization',
        'Seizure management',
        'ICP monitoring consideration',
        'Neurosurgical consultation',
        'CT head imaging'
    ],
    exposure: [
        'Complete exposure and log roll',
        'Warming measures (Bair Hugger)',
        'Hypothermia prevention',
        'Secondary survey completion'
    ]
};

// Export for use in other modules (ES6 style, but works in browser with type="module")
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { scenarios, normalRanges, guidelines, interventions };
}
