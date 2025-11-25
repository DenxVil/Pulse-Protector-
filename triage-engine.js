/**
 * Triage Engine - AI Decision Support System
 * Implements START (Simple Triage and Rapid Treatment) protocol
 * with weighted KPI model for trauma assessment
 * 
 * Based on:
 * - ATLS (Advanced Trauma Life Support) guidelines
 * - START triage protocol
 * - SALT mass casualty triage
 */

/**
 * Triage category definitions with colors
 */
const TRIAGE_CATEGORIES = {
    RED: {
        name: 'IMMEDIATE',
        code: 'RED',
        color: '#ef4444',
        priority: 1,
        description: 'Life-threatening injuries requiring immediate intervention'
    },
    YELLOW: {
        name: 'DELAYED',
        code: 'YELLOW',
        color: '#f59e0b',
        priority: 2,
        description: 'Serious injuries but stable, can wait for treatment'
    },
    GREEN: {
        name: 'MINOR',
        code: 'GREEN',
        color: '#10b981',
        priority: 3,
        description: 'Walking wounded, minor injuries'
    },
    BLACK: {
        name: 'EXPECTANT',
        code: 'BLACK',
        color: '#64748b',
        priority: 4,
        description: 'Deceased or injuries incompatible with survival'
    }
};

/**
 * Weight configuration for KPI model
 * Total should equal 100%
 */
const KPI_WEIGHTS = {
    cns: 0.30,        // 30% - Central Nervous System
    respiratory: 0.25, // 25% - Respiratory System
    cardiovascular: 0.25, // 25% - Cardiovascular System
    circulation: 0.20  // 20% - Circulation Assessment
};

/**
 * Calculate CNS (Central Nervous System) Score
 * @param {Object} cns - CNS vitals object
 * @returns {Object} - Score and details
 */
function calculateCNSScore(cns) {
    let score = 100;
    const issues = [];
    const alerts = [];

    // GCS Assessment
    if (cns.gcs <= 3) {
        score -= 100;
        issues.push('GCS 3 - No response');
        alerts.push({ severity: 'critical', message: 'GCS 3 indicates no neurological response' });
    } else if (cns.gcs <= 8) {
        score -= 60;
        issues.push(`GCS ${cns.gcs} - Severe brain injury`);
        alerts.push({ severity: 'critical', message: 'GCS ≤8 requires airway protection' });
    } else if (cns.gcs <= 12) {
        score -= 35;
        issues.push(`GCS ${cns.gcs} - Moderate brain injury`);
        alerts.push({ severity: 'warning', message: 'Moderate neurological impairment' });
    } else if (cns.gcs <= 14) {
        score -= 15;
        issues.push(`GCS ${cns.gcs} - Mild brain injury`);
    }

    // Pupil Assessment
    if (cns.pupils === 'fixed') {
        score -= 40;
        issues.push('Pupils fixed - Severe neurological compromise');
        alerts.push({ severity: 'critical', message: 'Fixed pupils indicate brainstem injury' });
    } else if (cns.pupils === 'sluggish') {
        score -= 20;
        issues.push('Pupils sluggish - Neurological impairment');
    } else if (cns.pupils === 'unequal') {
        score -= 35;
        issues.push('Unequal pupils - Possible herniation');
        alerts.push({ severity: 'critical', message: 'Unequal pupils suggest intracranial pathology' });
    }

    // Consciousness Level
    if (cns.consciousness === 'unresponsive') {
        score -= 30;
        issues.push('Unresponsive to all stimuli');
    } else if (cns.consciousness === 'responds_to_pain') {
        score -= 20;
        issues.push('Responds only to painful stimuli');
    } else if (cns.consciousness === 'responds_to_voice' || cns.consciousness === 'confused') {
        score -= 10;
        issues.push('Altered level of consciousness');
    }

    return {
        score: Math.max(0, score),
        weight: KPI_WEIGHTS.cns,
        weightedScore: Math.max(0, score) * KPI_WEIGHTS.cns,
        issues,
        alerts
    };
}

/**
 * Calculate Respiratory Score
 * @param {Object} resp - Respiratory vitals object
 * @returns {Object} - Score and details
 */
function calculateRespiratoryScore(resp) {
    let score = 100;
    const issues = [];
    const alerts = [];

    // Respiratory Rate Assessment (START criteria)
    if (resp.rate === 0 || resp.pattern === 'absent') {
        score -= 100;
        issues.push('Apneic - No respiratory effort');
        alerts.push({ severity: 'critical', message: 'Respiratory arrest requires immediate intervention' });
    } else if (resp.rate < 10) {
        score -= 50;
        issues.push(`Respiratory rate ${resp.rate} - Critically low`);
        alerts.push({ severity: 'critical', message: 'Bradypnea indicates severe respiratory compromise' });
    } else if (resp.rate > 29) {
        score -= 40;
        issues.push(`Respiratory rate ${resp.rate} - Tachypnea`);
        alerts.push({ severity: 'warning', message: 'Tachypnea suggests respiratory distress or shock' });
    } else if (resp.rate < 12 || resp.rate > 20) {
        score -= 15;
        issues.push(`Respiratory rate ${resp.rate} - Abnormal`);
    }

    // SpO2 Assessment
    if (resp.spo2 === 0) {
        score -= 50;
        issues.push('No SpO2 reading - Unable to obtain');
    } else if (resp.spo2 < 90) {
        score -= 45;
        issues.push(`SpO2 ${resp.spo2}% - Severe hypoxemia`);
        alerts.push({ severity: 'critical', message: 'Severe hypoxia requires immediate oxygen therapy' });
    } else if (resp.spo2 < 94) {
        score -= 25;
        issues.push(`SpO2 ${resp.spo2}% - Moderate hypoxemia`);
        alerts.push({ severity: 'warning', message: 'Hypoxia present, supplemental oxygen needed' });
    } else if (resp.spo2 < 95) {
        score -= 10;
        issues.push(`SpO2 ${resp.spo2}% - Borderline low`);
    }

    // Breathing Pattern
    if (resp.pattern === 'labored' || resp.pattern === 'irregular') {
        score -= 15;
        issues.push(`Breathing pattern: ${resp.pattern}`);
    }

    return {
        score: Math.max(0, score),
        weight: KPI_WEIGHTS.respiratory,
        weightedScore: Math.max(0, score) * KPI_WEIGHTS.respiratory,
        issues,
        alerts
    };
}

/**
 * Calculate Cardiovascular Score
 * @param {Object} cardio - Cardiovascular vitals object
 * @returns {Object} - Score and details
 */
function calculateCardiovascularScore(cardio) {
    let score = 100;
    const issues = [];
    const alerts = [];

    // Heart Rate Assessment
    if (cardio.hr === 0 || cardio.pulse === 'absent') {
        score -= 100;
        issues.push('No pulse detected - Cardiac arrest');
        alerts.push({ severity: 'critical', message: 'Pulseless - Begin CPR immediately' });
    } else if (cardio.hr < 40) {
        score -= 45;
        issues.push(`Heart rate ${cardio.hr} - Severe bradycardia`);
        alerts.push({ severity: 'critical', message: 'Bradycardia may indicate impending arrest' });
    } else if (cardio.hr > 150) {
        score -= 40;
        issues.push(`Heart rate ${cardio.hr} - Severe tachycardia`);
        alerts.push({ severity: 'warning', message: 'Tachycardia suggests shock or compensation' });
    } else if (cardio.hr < 60 || cardio.hr > 100) {
        score -= 15;
        issues.push(`Heart rate ${cardio.hr} - Abnormal`);
    }

    // Blood Pressure Assessment
    const systolic = cardio.bpSystolic;
    if (systolic === 0) {
        score -= 50;
        issues.push('No blood pressure obtainable');
    } else if (systolic < 70) {
        score -= 50;
        issues.push(`BP ${systolic}/${cardio.bpDiastolic} - Severe hypotension`);
        alerts.push({ severity: 'critical', message: 'Severe hypotension indicates decompensated shock' });
    } else if (systolic < 90) {
        score -= 35;
        issues.push(`BP ${systolic}/${cardio.bpDiastolic} - Hypotension`);
        alerts.push({ severity: 'warning', message: 'Hypotension present - assess for hemorrhage' });
    } else if (systolic > 180) {
        score -= 25;
        issues.push(`BP ${systolic}/${cardio.bpDiastolic} - Severe hypertension`);
        alerts.push({ severity: 'warning', message: 'Hypertension may indicate intracranial injury' });
    }

    // Capillary Refill Time (START criteria - >2 seconds is abnormal)
    if (cardio.crt > 4) {
        score -= 35;
        issues.push(`CRT ${cardio.crt}s - Severely delayed`);
        alerts.push({ severity: 'critical', message: 'Delayed CRT indicates poor perfusion' });
    } else if (cardio.crt > 2) {
        score -= 20;
        issues.push(`CRT ${cardio.crt}s - Delayed perfusion`);
    }

    // Pulse Quality
    if (cardio.pulse === 'weak') {
        score -= 15;
        issues.push('Weak pulse - Poor cardiac output');
    } else if (cardio.pulse === 'thready') {
        score -= 25;
        issues.push('Thready pulse - Significant hypoperfusion');
    }

    return {
        score: Math.max(0, score),
        weight: KPI_WEIGHTS.cardiovascular,
        weightedScore: Math.max(0, score) * KPI_WEIGHTS.cardiovascular,
        issues,
        alerts
    };
}

/**
 * Calculate Circulation Score
 * @param {Object} circ - Circulation assessment object
 * @returns {Object} - Score and details
 */
function calculateCirculationScore(circ) {
    let score = 100;
    const issues = [];
    const alerts = [];

    // Skin Color Assessment
    if (circ.skin === 'cyanotic') {
        score -= 40;
        issues.push('Cyanotic skin - Severe hypoxia/hypoperfusion');
        alerts.push({ severity: 'critical', message: 'Cyanosis indicates critical oxygen deficit' });
    } else if (circ.skin === 'mottled') {
        score -= 35;
        issues.push('Mottled skin - Poor peripheral perfusion');
    } else if (circ.skin === 'pale') {
        score -= 20;
        issues.push('Pale skin - Possible anemia or vasoconstriction');
    }

    // Temperature Assessment
    if (circ.temp < 32) {
        score -= 40;
        issues.push(`Temperature ${circ.temp}°C - Severe hypothermia`);
        alerts.push({ severity: 'critical', message: 'Severe hypothermia impairs coagulation' });
    } else if (circ.temp < 35) {
        score -= 25;
        issues.push(`Temperature ${circ.temp}°C - Hypothermia`);
        alerts.push({ severity: 'warning', message: 'Hypothermia worsens trauma outcomes' });
    } else if (circ.temp > 39) {
        score -= 15;
        issues.push(`Temperature ${circ.temp}°C - Fever`);
    }

    // Blood Loss Assessment (Class I-IV hemorrhage)
    if (circ.bloodLoss >= 2000) {
        score -= 50;
        issues.push(`Est. blood loss ${circ.bloodLoss}ml - Class IV hemorrhage`);
        alerts.push({ severity: 'critical', message: 'Class IV hemorrhage - life-threatening' });
    } else if (circ.bloodLoss >= 1500) {
        score -= 35;
        issues.push(`Est. blood loss ${circ.bloodLoss}ml - Class III hemorrhage`);
        alerts.push({ severity: 'critical', message: 'Class III hemorrhage - significant blood loss' });
    } else if (circ.bloodLoss >= 750) {
        score -= 20;
        issues.push(`Est. blood loss ${circ.bloodLoss}ml - Class II hemorrhage`);
        alerts.push({ severity: 'warning', message: 'Class II hemorrhage - requires monitoring' });
    } else if (circ.bloodLoss >= 250) {
        score -= 10;
        issues.push(`Est. blood loss ${circ.bloodLoss}ml - Class I hemorrhage`);
    }

    return {
        score: Math.max(0, score),
        weight: KPI_WEIGHTS.circulation,
        weightedScore: Math.max(0, score) * KPI_WEIGHTS.circulation,
        issues,
        alerts
    };
}

/**
 * Determine triage category based on START protocol criteria
 * @param {Object} vitals - All vital signs
 * @param {number} overallScore - Weighted overall score
 * @returns {string} - Triage category code
 */
function determineTriageCategory(vitals, overallScore) {
    const { cns, respiratory, cardio, circulation } = vitals;

    // BLACK - Expectant (No signs of life)
    if (respiratory.rate === 0 && respiratory.pattern === 'absent' && 
        (cardio.hr === 0 || cardio.pulse === 'absent')) {
        return 'BLACK';
    }

    // RED - Immediate (START criteria)
    if (
        respiratory.rate < 10 || respiratory.rate > 29 ||
        cardio.crt > 2 ||
        cns.gcs <= 8 ||
        respiratory.spo2 < 90 ||
        cardio.bpSystolic < 70 ||
        circulation.bloodLoss >= 1500 ||
        cns.pupils === 'fixed' ||
        cns.consciousness === 'unresponsive'
    ) {
        return 'RED';
    }

    // YELLOW - Delayed
    if (
        (cns.gcs >= 9 && cns.gcs <= 13) ||
        (respiratory.spo2 >= 90 && respiratory.spo2 < 95) ||
        (cardio.bpSystolic >= 70 && cardio.bpSystolic < 90) ||
        (circulation.bloodLoss >= 500 && circulation.bloodLoss < 1500) ||
        overallScore < 70
    ) {
        return 'YELLOW';
    }

    // GREEN - Minor (Walking wounded)
    if (
        cns.gcs >= 14 &&
        respiratory.rate >= 12 && respiratory.rate <= 20 &&
        respiratory.spo2 >= 95 &&
        cardio.crt <= 2 &&
        cns.consciousness === 'alert'
    ) {
        return 'GREEN';
    }

    // Default to YELLOW if unclear
    return overallScore >= 80 ? 'GREEN' : 'YELLOW';
}

/**
 * Generate intervention recommendations based on vitals
 * @param {Object} vitals - All vital signs
 * @param {string} category - Triage category
 * @returns {Array} - List of recommended interventions
 */
function generateInterventions(vitals, category) {
    const interventions = [];
    const { cns, respiratory, cardio, circulation } = vitals;

    // Airway interventions
    if (cns.gcs <= 8) {
        interventions.push({
            priority: 'immediate',
            category: 'Airway',
            action: 'Consider advanced airway management',
            reason: 'GCS ≤8 indicates need for airway protection'
        });
    }

    // Breathing interventions
    if (respiratory.spo2 < 94) {
        interventions.push({
            priority: 'immediate',
            category: 'Breathing',
            action: 'Apply high-flow oxygen via non-rebreather mask',
            reason: `SpO2 ${respiratory.spo2}% indicates hypoxemia`
        });
    }

    if (respiratory.rate < 10 || respiratory.rate > 29) {
        interventions.push({
            priority: 'immediate',
            category: 'Breathing',
            action: 'Assist ventilations with bag-valve-mask',
            reason: `Respiratory rate ${respiratory.rate}/min is critical`
        });
    }

    // Circulation interventions
    if (cardio.bpSystolic < 90 || circulation.bloodLoss >= 750) {
        interventions.push({
            priority: 'immediate',
            category: 'Circulation',
            action: 'Establish large bore IV access (2x 18G)',
            reason: 'Hypotension/hemorrhage requires IV access'
        });
        interventions.push({
            priority: 'immediate',
            category: 'Circulation',
            action: 'Begin crystalloid resuscitation (1-2L warmed saline)',
            reason: 'Volume replacement needed for shock management'
        });
    }

    if (circulation.bloodLoss >= 1000) {
        interventions.push({
            priority: 'immediate',
            category: 'Circulation',
            action: 'Activate massive transfusion protocol',
            reason: `Estimated blood loss ${circulation.bloodLoss}ml indicates severe hemorrhage`
        });
        interventions.push({
            priority: 'immediate',
            category: 'Circulation',
            action: 'Apply direct pressure/tourniquet to bleeding source',
            reason: 'Hemorrhage control is priority'
        });
    }

    // Neurological interventions
    if (cns.pupils === 'unequal' || cns.pupils === 'fixed') {
        interventions.push({
            priority: 'urgent',
            category: 'Disability',
            action: 'Urgent neurosurgical consultation',
            reason: 'Pupil changes suggest intracranial pathology'
        });
        interventions.push({
            priority: 'urgent',
            category: 'Disability',
            action: 'Maintain head of bed at 30 degrees',
            reason: 'Reduce intracranial pressure'
        });
    }

    // Hypothermia management
    if (circulation.temp < 35) {
        interventions.push({
            priority: 'urgent',
            category: 'Exposure',
            action: 'Active warming measures (Bair Hugger, warm IV fluids)',
            reason: `Temperature ${circulation.temp}°C indicates hypothermia`
        });
    }

    // Cardiac arrest
    if (cardio.hr === 0 || cardio.pulse === 'absent') {
        interventions.unshift({
            priority: 'immediate',
            category: 'Circulation',
            action: 'Begin high-quality CPR immediately',
            reason: 'Cardiac arrest identified'
        });
    }

    // Sort by priority
    const priorityOrder = { immediate: 0, urgent: 1, routine: 2 };
    interventions.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

    return interventions;
}

/**
 * Main triage calculation function
 * @param {Object} vitals - Complete vital signs object
 * @returns {Object} - Triage result with category, confidence, reasoning, and interventions
 */
function calculateTriageCategory(vitals) {
    // Calculate individual system scores
    const cnsResult = calculateCNSScore(vitals.cns);
    const respResult = calculateRespiratoryScore(vitals.respiratory);
    const cardioResult = calculateCardiovascularScore(vitals.cardio);
    const circResult = calculateCirculationScore(vitals.circulation);

    // Calculate overall weighted score
    const overallScore = cnsResult.weightedScore + respResult.weightedScore + 
                         cardioResult.weightedScore + circResult.weightedScore;

    // Determine triage category
    const categoryCode = determineTriageCategory(vitals, overallScore);
    const category = TRIAGE_CATEGORIES[categoryCode];

    // Collect all issues and alerts
    const allIssues = [
        ...cnsResult.issues,
        ...respResult.issues,
        ...cardioResult.issues,
        ...circResult.issues
    ];

    const allAlerts = [
        ...cnsResult.alerts,
        ...respResult.alerts,
        ...cardioResult.alerts,
        ...circResult.alerts
    ];

    // Generate interventions
    const interventions = generateInterventions(vitals, categoryCode);

    // Calculate confidence score
    let confidence = Math.round(overallScore);
    
    // Adjust confidence based on data quality
    if (allAlerts.filter(a => a.severity === 'critical').length > 2) {
        confidence = Math.min(confidence + 15, 99); // High confidence when clear critical findings
    }

    // Generate reasoning text
    const reasoning = generateReasoning(vitals, categoryCode, allIssues, overallScore);

    // Determine which guideline is being applied
    const guideline = determineGuideline(vitals, categoryCode);

    return {
        category: category,
        categoryCode: categoryCode,
        confidence: confidence,
        overallScore: Math.round(overallScore),
        reasoning: reasoning,
        guideline: guideline,
        interventions: interventions,
        systemScores: {
            cns: cnsResult,
            respiratory: respResult,
            cardiovascular: cardioResult,
            circulation: circResult
        },
        issues: allIssues,
        alerts: allAlerts,
        timestamp: new Date().toISOString()
    };
}

/**
 * Generate human-readable reasoning for triage decision
 */
function generateReasoning(vitals, category, issues, score) {
    const { cns, respiratory, cardio, circulation } = vitals;
    let reasoning = '';

    switch (category) {
        case 'BLACK':
            reasoning = `Patient is EXPECTANT. No respiratory effort detected (rate: ${respiratory.rate}/min, pattern: ${respiratory.pattern}) `;
            reasoning += `and no pulse (HR: ${cardio.hr}, pulse: ${cardio.pulse}). `;
            reasoning += `Despite resuscitation attempts, patient shows no signs of life. `;
            reasoning += `In mass casualty setting, resources should be directed to salvageable patients.`;
            break;

        case 'RED':
            reasoning = `Patient requires IMMEDIATE intervention. `;
            if (respiratory.rate < 10 || respiratory.rate > 29) {
                reasoning += `Respiratory rate ${respiratory.rate}/min is critically abnormal. `;
            }
            if (respiratory.spo2 < 90) {
                reasoning += `Severe hypoxia present with SpO2 of ${respiratory.spo2}%. `;
            }
            if (cns.gcs <= 8) {
                reasoning += `GCS of ${cns.gcs} indicates severe neurological compromise requiring airway protection. `;
            }
            if (cardio.crt > 2) {
                reasoning += `Delayed capillary refill (${cardio.crt}s) indicates poor perfusion. `;
            }
            if (circulation.bloodLoss >= 1500) {
                reasoning += `Estimated blood loss of ${circulation.bloodLoss}ml indicates Class III+ hemorrhage. `;
            }
            reasoning += `Overall assessment score: ${Math.round(score)}/100. Life-threatening condition identified.`;
            break;

        case 'YELLOW':
            reasoning = `Patient has DELAYED priority. `;
            reasoning += `GCS is ${cns.gcs} with ${cns.consciousness} mental status. `;
            reasoning += `Respiratory status shows rate of ${respiratory.rate}/min with SpO2 ${respiratory.spo2}%. `;
            reasoning += `Hemodynamically ${cardio.bpSystolic >= 90 ? 'stable' : 'borderline'} with BP ${cardio.bpSystolic}/${cardio.bpDiastolic}. `;
            reasoning += `Patient is stable for delayed treatment but requires ongoing monitoring. `;
            reasoning += `Overall assessment score: ${Math.round(score)}/100.`;
            break;

        case 'GREEN':
            reasoning = `Patient has MINOR injuries. `;
            reasoning += `GCS ${cns.gcs} with ${cns.consciousness} mental status. `;
            reasoning += `All vital signs within acceptable limits. `;
            reasoning += `Patient is ambulatory and can wait for treatment. `;
            reasoning += `Overall assessment score: ${Math.round(score)}/100. Low acuity case.`;
            break;
    }

    return reasoning;
}

/**
 * Determine which clinical guideline is primarily being applied
 */
function determineGuideline(vitals, category) {
    // START protocol is primary for initial triage
    const guideline = {
        primary: 'START',
        name: 'Simple Triage and Rapid Treatment',
        criteria: []
    };

    if (category === 'BLACK' || category === 'RED') {
        guideline.criteria.push('Respirations check');
        guideline.criteria.push('Perfusion assessment (CRT)');
        guideline.criteria.push('Mental status evaluation');
    }

    // ATLS applies for detailed assessment
    if (vitals.cns.gcs <= 8 || vitals.cardio.bpSystolic < 90) {
        guideline.secondary = 'ATLS';
        guideline.criteria.push('ABCDE assessment');
    }

    return guideline;
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { 
        calculateTriageCategory, 
        TRIAGE_CATEGORIES, 
        KPI_WEIGHTS,
        calculateCNSScore,
        calculateRespiratoryScore,
        calculateCardiovascularScore,
        calculateCirculationScore
    };
}
