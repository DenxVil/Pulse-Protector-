/**
 * Smart Trauma Vitals Assessment Pad - Main Application
 * Core logic for real-time vital signs simulation and triage assessment
 */

(function() {
    'use strict';

    // =============================================
    // APPLICATION STATE
    // =============================================
    const state = {
        currentVitals: {
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
                hr: 75,
                bpSystolic: 120,
                bpDiastolic: 80,
                crt: 2,
                pulse: 'strong'
            },
            circulation: {
                skin: 'normal',
                temp: 36.8,
                bloodLoss: 0
            }
        },
        targetVitals: null, // For scenario interpolation
        currentScenario: null,
        isSimulationRunning: true,
        simulationInterval: null,
        trendData: {
            gcs: [],
            spo2: [],
            hr: [],
            temp: []
        },
        alerts: [],
        overrideHistory: []
    };

    // =============================================
    // DOM ELEMENTS
    // =============================================
    const elements = {
        // Scenario controls
        scenarioSelect: document.getElementById('scenarioSelect'),
        loadScenarioBtn: document.getElementById('loadScenarioBtn'),
        scenarioDescription: document.getElementById('scenarioDescription'),

        // Vital displays
        gcsValue: document.getElementById('gcsValue'),
        gcsEye: document.getElementById('gcsEye'),
        gcsVerbal: document.getElementById('gcsVerbal'),
        gcsMotor: document.getElementById('gcsMotor'),
        pupilsValue: document.getElementById('pupilsValue'),
        consciousnessValue: document.getElementById('consciousnessValue'),
        rrValue: document.getElementById('rrValue'),
        spo2Value: document.getElementById('spo2Value'),
        breathingPatternValue: document.getElementById('breathingPatternValue'),
        hrValue: document.getElementById('hrValue'),
        bpValue: document.getElementById('bpValue'),
        crtValue: document.getElementById('crtValue'),
        pulseValue: document.getElementById('pulseValue'),
        skinColorValue: document.getElementById('skinColorValue'),
        tempValue: document.getElementById('tempValue'),
        bloodLossValue: document.getElementById('bloodLossValue'),

        // Status indicators
        cnsStatus: document.getElementById('cnsStatus'),
        cnsStatusText: document.getElementById('cnsStatusText'),
        respStatus: document.getElementById('respStatus'),
        respStatusText: document.getElementById('respStatusText'),
        cardioStatus: document.getElementById('cardioStatus'),
        cardioStatusText: document.getElementById('cardioStatusText'),
        circStatus: document.getElementById('circStatus'),
        circStatusText: document.getElementById('circStatusText'),

        // Triage panel
        triagePanel: document.getElementById('triagePanel'),
        triageHeader: document.getElementById('triageHeader'),
        triageBadge: document.getElementById('triageBadge'),
        triageName: document.getElementById('triageName'),
        triageDesc: document.getElementById('triageDesc'),
        confidenceValue: document.getElementById('confidenceValue'),
        confidenceBar: document.getElementById('confidenceBar'),
        guidelineName: document.getElementById('guidelineName'),
        reasoningText: document.getElementById('reasoningText'),
        interventionsList: document.getElementById('interventionsList'),

        // KPI displays
        cnsKpiBar: document.getElementById('cnsKpiBar'),
        cnsKpiScore: document.getElementById('cnsKpiScore'),
        respKpiBar: document.getElementById('respKpiBar'),
        respKpiScore: document.getElementById('respKpiScore'),
        cardioKpiBar: document.getElementById('cardioKpiBar'),
        cardioKpiScore: document.getElementById('cardioKpiScore'),
        circKpiBar: document.getElementById('circKpiBar'),
        circKpiScore: document.getElementById('circKpiScore'),

        // Chart lines
        gcsLine: document.getElementById('gcsLine'),
        spo2Line: document.getElementById('spo2Line'),
        hrLine: document.getElementById('hrLine'),
        tempLine: document.getElementById('tempLine'),

        // Action buttons
        pauseSimBtn: document.getElementById('pauseSimBtn'),
        resetBtn: document.getElementById('resetBtn'),
        overrideBtn: document.getElementById('overrideBtn'),
        exportJsonBtn: document.getElementById('exportJsonBtn'),
        exportHtmlBtn: document.getElementById('exportHtmlBtn'),

        // Simulation status
        simIndicator: document.getElementById('simIndicator'),
        simStatus: document.getElementById('simStatus'),

        // Modal
        overrideModal: document.getElementById('overrideModal'),
        closeModalBtn: document.getElementById('closeModalBtn'),
        cancelOverrideBtn: document.getElementById('cancelOverrideBtn'),
        applyOverrideBtn: document.getElementById('applyOverrideBtn'),
        overrideForm: document.getElementById('overrideForm'),

        // Alerts
        alertsPanel: document.getElementById('alertsPanel'),

        // Contrast toggle
        toggleContrastBtn: document.getElementById('toggleContrastBtn')
    };

    // =============================================
    // UTILITY FUNCTIONS
    // =============================================

    /**
     * Deep clone an object
     */
    function deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    }

    /**
     * Format consciousness value for display
     */
    function formatConsciousness(value) {
        const map = {
            'alert': 'Alert',
            'confused': 'Confused',
            'responds_to_voice': 'Responds to Voice',
            'responds_to_pain': 'Responds to Pain',
            'unresponsive': 'Unresponsive'
        };
        return map[value] || value;
    }

    /**
     * Format skin color for display
     */
    function formatSkinColor(value) {
        const map = {
            'normal': 'Normal',
            'pale': 'Pale',
            'mottled': 'Mottled',
            'cyanotic': 'Cyanotic'
        };
        return map[value] || value;
    }

    /**
     * Format pupils for display
     */
    function formatPupils(value) {
        const map = {
            'reactive': 'Reactive',
            'sluggish': 'Sluggish',
            'unequal': 'Unequal',
            'fixed': 'Fixed'
        };
        return map[value] || value;
    }

    /**
     * Format breathing pattern for display
     */
    function formatBreathingPattern(value) {
        const map = {
            'normal': 'Normal',
            'labored': 'Labored',
            'irregular': 'Irregular',
            'absent': 'Absent'
        };
        return map[value] || value;
    }

    /**
     * Format pulse for display
     */
    function formatPulse(value) {
        const map = {
            'strong': 'Strong',
            'weak': 'Weak',
            'thready': 'Thready',
            'absent': 'Absent'
        };
        return map[value] || value;
    }

    /**
     * Get status class based on vital sign value
     */
    function getVitalStatus(type, value) {
        switch (type) {
            case 'gcs':
                if (value <= 8) return 'critical';
                if (value <= 12) return 'warning';
                return 'normal';
            case 'spo2':
                if (value < 90) return 'critical';
                if (value < 95) return 'warning';
                return 'normal';
            case 'hr':
                if (value === 0 || value < 40 || value > 150) return 'critical';
                if (value < 60 || value > 100) return 'warning';
                return 'normal';
            case 'rr':
                if (value === 0 || value < 10 || value > 29) return 'critical';
                if (value < 12 || value > 20) return 'warning';
                return 'normal';
            case 'bpSystolic':
                if (value === 0 || value < 70 || value > 200) return 'critical';
                if (value < 90 || value > 140) return 'warning';
                return 'normal';
            case 'crt':
                if (value > 4) return 'critical';
                if (value > 2) return 'warning';
                return 'normal';
            case 'temp':
                if (value < 32 || value > 40) return 'critical';
                if (value < 35 || value > 38) return 'warning';
                return 'normal';
            case 'bloodLoss':
                if (value >= 1500) return 'critical';
                if (value >= 750) return 'warning';
                return 'normal';
            case 'pupils':
                if (value === 'fixed') return 'critical';
                if (value === 'sluggish' || value === 'unequal') return 'warning';
                return 'normal';
            case 'consciousness':
                if (value === 'unresponsive') return 'critical';
                if (value === 'responds_to_pain') return 'warning';
                return 'normal';
            case 'breathingPattern':
                if (value === 'absent') return 'critical';
                if (value === 'labored' || value === 'irregular') return 'warning';
                return 'normal';
            case 'pulse':
                if (value === 'absent') return 'critical';
                if (value === 'weak' || value === 'thready') return 'warning';
                return 'normal';
            case 'skin':
                if (value === 'cyanotic') return 'critical';
                if (value === 'pale' || value === 'mottled') return 'warning';
                return 'normal';
            default:
                return 'normal';
        }
    }

    /**
     * Get KPI bar color based on score
     */
    function getKpiColor(score) {
        if (score < 40) return 'var(--color-red)';
        if (score < 70) return 'var(--color-yellow)';
        return 'var(--color-green)';
    }

    /**
     * Add random fluctuation to a value
     */
    function fluctuate(value, range, min, max) {
        const fluctuation = (Math.random() - 0.5) * range * 2;
        return Math.max(min, Math.min(max, value + fluctuation));
    }

    // =============================================
    // DISPLAY UPDATE FUNCTIONS
    // =============================================

    /**
     * Update all vital sign displays
     */
    function updateVitalsDisplay() {
        const v = state.currentVitals;

        // CNS
        elements.gcsValue.textContent = v.cns.gcs;
        elements.gcsValue.className = `vital-item-value ${getVitalStatus('gcs', v.cns.gcs)}`;
        elements.gcsEye.textContent = v.cns.gcsBreakdown.eye;
        elements.gcsVerbal.textContent = v.cns.gcsBreakdown.verbal;
        elements.gcsMotor.textContent = v.cns.gcsBreakdown.motor;
        elements.pupilsValue.textContent = formatPupils(v.cns.pupils);
        elements.pupilsValue.className = `vital-item-value ${getVitalStatus('pupils', v.cns.pupils)}`;
        elements.consciousnessValue.textContent = formatConsciousness(v.cns.consciousness);
        elements.consciousnessValue.className = `vital-item-value ${getVitalStatus('consciousness', v.cns.consciousness)}`;

        // Update CNS status
        const cnsStatus = getCombinedStatus([
            getVitalStatus('gcs', v.cns.gcs),
            getVitalStatus('pupils', v.cns.pupils),
            getVitalStatus('consciousness', v.cns.consciousness)
        ]);
        elements.cnsStatus.className = `status-indicator ${cnsStatus}`;
        elements.cnsStatusText.textContent = cnsStatus.charAt(0).toUpperCase() + cnsStatus.slice(1);

        // Respiratory
        elements.rrValue.innerHTML = `${v.respiratory.rate}<span class="vital-item-unit">breaths/min</span>`;
        elements.rrValue.className = `vital-item-value ${getVitalStatus('rr', v.respiratory.rate)}`;
        elements.spo2Value.innerHTML = `${v.respiratory.spo2}<span class="vital-item-unit">%</span>`;
        elements.spo2Value.className = `vital-item-value ${getVitalStatus('spo2', v.respiratory.spo2)}`;
        elements.breathingPatternValue.textContent = formatBreathingPattern(v.respiratory.pattern);
        elements.breathingPatternValue.className = `vital-item-value ${getVitalStatus('breathingPattern', v.respiratory.pattern)}`;

        // Update Respiratory status
        const respStatus = getCombinedStatus([
            getVitalStatus('rr', v.respiratory.rate),
            getVitalStatus('spo2', v.respiratory.spo2),
            getVitalStatus('breathingPattern', v.respiratory.pattern)
        ]);
        elements.respStatus.className = `status-indicator ${respStatus}`;
        elements.respStatusText.textContent = respStatus.charAt(0).toUpperCase() + respStatus.slice(1);

        // Cardiovascular
        elements.hrValue.innerHTML = `${v.cardio.hr}<span class="vital-item-unit">BPM</span>`;
        elements.hrValue.className = `vital-item-value ${getVitalStatus('hr', v.cardio.hr)}`;
        elements.bpValue.innerHTML = `${v.cardio.bpSystolic}/${v.cardio.bpDiastolic}<span class="vital-item-unit">mmHg</span>`;
        elements.bpValue.className = `vital-item-value ${getVitalStatus('bpSystolic', v.cardio.bpSystolic)}`;
        elements.crtValue.innerHTML = `${v.cardio.crt}<span class="vital-item-unit">seconds</span>`;
        elements.crtValue.className = `vital-item-value ${getVitalStatus('crt', v.cardio.crt)}`;
        elements.pulseValue.textContent = formatPulse(v.cardio.pulse);
        elements.pulseValue.className = `vital-item-value ${getVitalStatus('pulse', v.cardio.pulse)}`;

        // Update Cardio status
        const cardioStatus = getCombinedStatus([
            getVitalStatus('hr', v.cardio.hr),
            getVitalStatus('bpSystolic', v.cardio.bpSystolic),
            getVitalStatus('crt', v.cardio.crt),
            getVitalStatus('pulse', v.cardio.pulse)
        ]);
        elements.cardioStatus.className = `status-indicator ${cardioStatus}`;
        elements.cardioStatusText.textContent = cardioStatus.charAt(0).toUpperCase() + cardioStatus.slice(1);

        // Circulation
        elements.skinColorValue.textContent = formatSkinColor(v.circulation.skin);
        elements.skinColorValue.className = `vital-item-value ${getVitalStatus('skin', v.circulation.skin)}`;
        elements.tempValue.innerHTML = `${v.circulation.temp.toFixed(1)}<span class="vital-item-unit">°C</span>`;
        elements.tempValue.className = `vital-item-value ${getVitalStatus('temp', v.circulation.temp)}`;
        elements.bloodLossValue.innerHTML = `${v.circulation.bloodLoss}<span class="vital-item-unit">ml</span>`;
        elements.bloodLossValue.className = `vital-item-value ${getVitalStatus('bloodLoss', v.circulation.bloodLoss)}`;

        // Update Circulation status
        const circStatus = getCombinedStatus([
            getVitalStatus('skin', v.circulation.skin),
            getVitalStatus('temp', v.circulation.temp),
            getVitalStatus('bloodLoss', v.circulation.bloodLoss)
        ]);
        elements.circStatus.className = `status-indicator ${circStatus}`;
        elements.circStatusText.textContent = circStatus.charAt(0).toUpperCase() + circStatus.slice(1);
    }

    /**
     * Get combined status from multiple statuses
     */
    function getCombinedStatus(statuses) {
        if (statuses.includes('critical')) return 'critical';
        if (statuses.includes('warning')) return 'warning';
        return 'normal';
    }

    /**
     * Update triage panel display
     */
    function updateTriageDisplay(triageResult) {
        const { category, categoryCode, confidence, reasoning, guideline, interventions, systemScores } = triageResult;

        // Update triage category
        elements.triagePanel.className = `triage-panel triage-${categoryCode}`;
        elements.triageHeader.className = `triage-header triage-${categoryCode}`;
        elements.triageBadge.className = `triage-badge ${categoryCode}`;
        elements.triageBadge.textContent = categoryCode;
        elements.triageName.textContent = category.name;
        elements.triageDesc.textContent = category.description;

        // Update confidence
        elements.confidenceValue.textContent = `${confidence}%`;
        elements.confidenceBar.className = `confidence-bar-fill ${categoryCode}`;
        elements.confidenceBar.style.width = `${confidence}%`;

        // Update guideline
        elements.guidelineName.textContent = guideline.primary + ' Protocol';

        // Update reasoning
        elements.reasoningText.textContent = reasoning;

        // Update KPI scores
        updateKpiDisplay('cns', systemScores.cns);
        updateKpiDisplay('resp', systemScores.respiratory);
        updateKpiDisplay('cardio', systemScores.cardiovascular);
        updateKpiDisplay('circ', systemScores.circulation);

        // Update interventions
        updateInterventionsDisplay(interventions);

        // Update alerts
        updateAlertsDisplay(triageResult.alerts);
    }

    /**
     * Update KPI score display
     */
    function updateKpiDisplay(prefix, scoreData) {
        const barEl = elements[`${prefix}KpiBar`];
        const scoreEl = elements[`${prefix}KpiScore`];

        barEl.style.width = `${scoreData.score}%`;
        barEl.style.background = getKpiColor(scoreData.score);
        scoreEl.textContent = `${Math.round(scoreData.score)}/100`;
    }

    /**
     * Update interventions list
     */
    function updateInterventionsDisplay(interventions) {
        if (interventions.length === 0) {
            elements.interventionsList.innerHTML = `
                <div class="intervention-item routine">
                    <span class="intervention-priority routine">Routine</span>
                    <div class="intervention-content">
                        <div class="intervention-action">Continue monitoring vital signs</div>
                        <div class="intervention-reason">Patient stable - routine observation recommended</div>
                    </div>
                    <span class="intervention-category">General</span>
                </div>
            `;
            return;
        }

        elements.interventionsList.innerHTML = interventions.map(int => `
            <div class="intervention-item ${int.priority}">
                <span class="intervention-priority ${int.priority}">${int.priority}</span>
                <div class="intervention-content">
                    <div class="intervention-action">${escapeHtml(int.action)}</div>
                    <div class="intervention-reason">${escapeHtml(int.reason)}</div>
                </div>
                <span class="intervention-category">${escapeHtml(int.category)}</span>
            </div>
        `).join('');
    }

    /**
     * Update alerts panel
     */
    function updateAlertsDisplay(alerts) {
        const criticalAlerts = alerts.filter(a => a.severity === 'critical');
        const warningAlerts = alerts.filter(a => a.severity === 'warning');

        if (alerts.length === 0) {
            elements.alertsPanel.innerHTML = '';
            return;
        }

        const alertsHtml = [...criticalAlerts, ...warningAlerts].slice(0, 5).map(alert => `
            <div class="alert ${alert.severity}">
                <svg class="alert-icon" viewBox="0 0 24 24">
                    <path d="${alert.severity === 'critical' 
                        ? 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z'
                        : 'M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-8h2v8z'}"/>
                </svg>
                <div class="alert-content">
                    <div class="alert-message">${escapeHtml(alert.message)}</div>
                    <div class="alert-time">${new Date().toLocaleTimeString()}</div>
                </div>
            </div>
        `).join('');

        elements.alertsPanel.innerHTML = alertsHtml;
    }

    /**
     * Escape HTML for safe insertion
     */
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // =============================================
    // CHART FUNCTIONS
    // =============================================

    /**
     * Update trend data and charts
     */
    function updateTrendData() {
        const maxPoints = 30;

        // Add current values
        state.trendData.gcs.push(state.currentVitals.cns.gcs);
        state.trendData.spo2.push(state.currentVitals.respiratory.spo2);
        state.trendData.hr.push(state.currentVitals.cardio.hr);
        state.trendData.temp.push(state.currentVitals.circulation.temp);

        // Trim to max points
        Object.keys(state.trendData).forEach(key => {
            if (state.trendData[key].length > maxPoints) {
                state.trendData[key].shift();
            }
        });

        // Update charts
        updateChart('gcsLine', state.trendData.gcs, 3, 15);
        updateChart('spo2Line', state.trendData.spo2, 70, 100);
        updateChart('hrLine', state.trendData.hr, 0, 200);
        updateChart('tempLine', state.trendData.temp, 32, 42);
    }

    /**
     * Update a single chart line
     */
    function updateChart(elementId, data, minVal, maxVal) {
        if (data.length < 2) return;

        const element = document.getElementById(elementId);
        const width = 200;
        const height = 50;
        const padding = 5;

        const points = data.map((val, idx) => {
            const x = padding + (idx / (data.length - 1)) * (width - 2 * padding);
            const normalizedVal = (val - minVal) / (maxVal - minVal);
            const y = height - padding - normalizedVal * (height - 2 * padding);
            return `${x},${y}`;
        }).join(' ');

        element.setAttribute('points', points);
    }

    // =============================================
    // SIMULATION FUNCTIONS
    // =============================================

    /**
     * Start simulation loop
     */
    function startSimulation() {
        if (state.simulationInterval) {
            clearInterval(state.simulationInterval);
        }

        state.isSimulationRunning = true;
        updateSimulationStatus();

        state.simulationInterval = setInterval(() => {
            if (!state.isSimulationRunning) return;

            // Apply fluctuations to vitals
            applyFluctuations();

            // Update displays
            updateVitalsDisplay();
            updateTrendData();

            // Calculate triage
            const triageResult = calculateTriageCategory(state.currentVitals);
            updateTriageDisplay(triageResult);

        }, 2000); // Update every 2 seconds
    }

    /**
     * Apply realistic fluctuations to vital signs
     */
    function applyFluctuations() {
        const v = state.currentVitals;

        // Small fluctuations for numeric values
        v.respiratory.rate = Math.round(fluctuate(v.respiratory.rate, 1, 0, 60));
        v.respiratory.spo2 = Math.round(fluctuate(v.respiratory.spo2, 1, 0, 100));
        v.cardio.hr = Math.round(fluctuate(v.cardio.hr, 2, 0, 200));
        v.cardio.bpSystolic = Math.round(fluctuate(v.cardio.bpSystolic, 2, 0, 250));
        v.cardio.bpDiastolic = Math.round(fluctuate(v.cardio.bpDiastolic, 1, 0, 150));
        v.circulation.temp = parseFloat(fluctuate(v.circulation.temp, 0.1, 32, 42).toFixed(1));

        // If target vitals exist (scenario loaded), gradually move towards them
        if (state.targetVitals) {
            interpolateTowardsTarget(0.1);
        }
    }

    /**
     * Interpolate current vitals towards target
     */
    function interpolateTowardsTarget(factor) {
        const current = state.currentVitals;
        const target = state.targetVitals;

        // Numeric interpolation
        current.cns.gcs = Math.round(current.cns.gcs + (target.cns.gcs - current.cns.gcs) * factor);
        current.cns.gcsBreakdown.eye = Math.round(current.cns.gcsBreakdown.eye + (target.cns.gcsBreakdown.eye - current.cns.gcsBreakdown.eye) * factor);
        current.cns.gcsBreakdown.verbal = Math.round(current.cns.gcsBreakdown.verbal + (target.cns.gcsBreakdown.verbal - current.cns.gcsBreakdown.verbal) * factor);
        current.cns.gcsBreakdown.motor = Math.round(current.cns.gcsBreakdown.motor + (target.cns.gcsBreakdown.motor - current.cns.gcsBreakdown.motor) * factor);
        
        current.respiratory.rate = Math.round(current.respiratory.rate + (target.respiratory.rate - current.respiratory.rate) * factor);
        current.respiratory.spo2 = Math.round(current.respiratory.spo2 + (target.respiratory.spo2 - current.respiratory.spo2) * factor);
        
        current.cardio.hr = Math.round(current.cardio.hr + (target.cardio.hr - current.cardio.hr) * factor);
        current.cardio.bpSystolic = Math.round(current.cardio.bpSystolic + (target.cardio.bpSystolic - current.cardio.bpSystolic) * factor);
        current.cardio.bpDiastolic = Math.round(current.cardio.bpDiastolic + (target.cardio.bpDiastolic - current.cardio.bpDiastolic) * factor);
        current.cardio.crt = parseFloat((current.cardio.crt + (target.cardio.crt - current.cardio.crt) * factor).toFixed(1));
        
        current.circulation.temp = parseFloat((current.circulation.temp + (target.circulation.temp - current.circulation.temp) * factor).toFixed(1));
        current.circulation.bloodLoss = Math.round(current.circulation.bloodLoss + (target.circulation.bloodLoss - current.circulation.bloodLoss) * factor);

        // Snap categorical values when close
        if (Math.abs(current.cns.gcs - target.cns.gcs) < 1) {
            current.cns.pupils = target.cns.pupils;
            current.cns.consciousness = target.cns.consciousness;
        }
        if (Math.abs(current.respiratory.rate - target.respiratory.rate) < 2) {
            current.respiratory.pattern = target.respiratory.pattern;
        }
        if (Math.abs(current.cardio.hr - target.cardio.hr) < 3) {
            current.cardio.pulse = target.cardio.pulse;
        }
        if (Math.abs(current.circulation.bloodLoss - target.circulation.bloodLoss) < 50) {
            current.circulation.skin = target.circulation.skin;
        }
    }

    /**
     * Pause/Resume simulation
     */
    function toggleSimulation() {
        state.isSimulationRunning = !state.isSimulationRunning;
        updateSimulationStatus();
    }

    /**
     * Update simulation status display
     */
    function updateSimulationStatus() {
        if (state.isSimulationRunning) {
            elements.simIndicator.className = 'simulation-indicator running';
            elements.simStatus.textContent = 'Simulation Running';
            elements.pauseSimBtn.innerHTML = `
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                </svg>
                Pause
            `;
        } else {
            elements.simIndicator.className = 'simulation-indicator paused';
            elements.simStatus.textContent = 'Simulation Paused';
            elements.pauseSimBtn.innerHTML = `
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M8 5v14l11-7z"/>
                </svg>
                Resume
            `;
        }
    }

    /**
     * Reset to default values
     */
    function resetSimulation() {
        state.currentVitals = {
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
                hr: 75,
                bpSystolic: 120,
                bpDiastolic: 80,
                crt: 2,
                pulse: 'strong'
            },
            circulation: {
                skin: 'normal',
                temp: 36.8,
                bloodLoss: 0
            }
        };

        state.targetVitals = null;
        state.currentScenario = null;
        state.trendData = { gcs: [], spo2: [], hr: [], temp: [] };
        state.alerts = [];

        elements.scenarioSelect.value = '';
        elements.scenarioDescription.textContent = 'Select a trauma scenario to begin the simulation. Each scenario demonstrates different vital sign patterns and triage decisions based on START protocol.';

        updateVitalsDisplay();
        const triageResult = calculateTriageCategory(state.currentVitals);
        updateTriageDisplay(triageResult);
        updateAlertsDisplay([]);

        // Clear charts
        ['gcsLine', 'spo2Line', 'hrLine', 'tempLine'].forEach(id => {
            document.getElementById(id).setAttribute('points', '');
        });
    }

    // =============================================
    // SCENARIO FUNCTIONS
    // =============================================

    /**
     * Load a scenario
     */
    function loadScenario(scenarioId) {
        if (!scenarioId || !scenarios[scenarioId]) {
            alert('Please select a valid scenario');
            return;
        }

        const scenario = scenarios[scenarioId];
        state.currentScenario = scenario;

        // Set target vitals for gradual interpolation
        state.targetVitals = {
            cns: deepClone(scenario.cns),
            respiratory: deepClone(scenario.respiratory),
            cardio: deepClone(scenario.cardio),
            circulation: deepClone(scenario.circulation)
        };

        // Update description
        elements.scenarioDescription.innerHTML = `
            <strong>${escapeHtml(scenario.name)}</strong><br>
            ${escapeHtml(scenario.description)}<br>
            <em style="color: var(--text-muted); margin-top: 0.5rem; display: block;">
                Clinical Notes: ${escapeHtml(scenario.clinicalNotes)}
            </em>
        `;

        // Clear trend data for new scenario
        state.trendData = { gcs: [], spo2: [], hr: [], temp: [] };
    }

    // =============================================
    // OVERRIDE FUNCTIONS
    // =============================================

    /**
     * Open override modal
     */
    function openOverrideModal() {
        // Populate form with current values
        const v = state.currentVitals;
        
        document.getElementById('overrideGcs').value = v.cns.gcs;
        document.getElementById('overridePupils').value = v.cns.pupils;
        document.getElementById('overrideConsciousness').value = v.cns.consciousness;
        document.getElementById('overrideRr').value = v.respiratory.rate;
        document.getElementById('overrideSpo2').value = v.respiratory.spo2;
        document.getElementById('overrideBreathingPattern').value = v.respiratory.pattern;
        document.getElementById('overrideHr').value = v.cardio.hr;
        document.getElementById('overrideBpSystolic').value = v.cardio.bpSystolic;
        document.getElementById('overrideBpDiastolic').value = v.cardio.bpDiastolic;
        document.getElementById('overrideCrt').value = v.cardio.crt;
        document.getElementById('overridePulse').value = v.cardio.pulse;
        document.getElementById('overrideSkin').value = v.circulation.skin;
        document.getElementById('overrideTemp').value = v.circulation.temp;
        document.getElementById('overrideBloodLoss').value = v.circulation.bloodLoss;
        document.getElementById('overrideJustification').value = '';

        elements.overrideModal.classList.add('active');
        elements.overrideModal.setAttribute('aria-hidden', 'false');
    }

    /**
     * Close override modal
     */
    function closeOverrideModal() {
        elements.overrideModal.classList.remove('active');
        elements.overrideModal.setAttribute('aria-hidden', 'true');
    }

    /**
     * Apply override values
     */
    function applyOverride() {
        const justification = document.getElementById('overrideJustification').value.trim();
        if (!justification) {
            alert('Please provide a justification for this override');
            return;
        }

        const gcsValue = parseInt(document.getElementById('overrideGcs').value);
        
        // Update state
        state.currentVitals = {
            cns: {
                gcs: gcsValue,
                gcsBreakdown: calculateGcsBreakdown(gcsValue),
                pupils: document.getElementById('overridePupils').value,
                consciousness: document.getElementById('overrideConsciousness').value
            },
            respiratory: {
                rate: parseInt(document.getElementById('overrideRr').value),
                spo2: parseInt(document.getElementById('overrideSpo2').value),
                pattern: document.getElementById('overrideBreathingPattern').value
            },
            cardio: {
                hr: parseInt(document.getElementById('overrideHr').value),
                bpSystolic: parseInt(document.getElementById('overrideBpSystolic').value),
                bpDiastolic: parseInt(document.getElementById('overrideBpDiastolic').value),
                crt: parseFloat(document.getElementById('overrideCrt').value),
                pulse: document.getElementById('overridePulse').value
            },
            circulation: {
                skin: document.getElementById('overrideSkin').value,
                temp: parseFloat(document.getElementById('overrideTemp').value),
                bloodLoss: parseInt(document.getElementById('overrideBloodLoss').value)
            }
        };

        // Clear target vitals (stop interpolation)
        state.targetVitals = null;

        // Log override
        state.overrideHistory.push({
            timestamp: new Date().toISOString(),
            justification: justification,
            values: deepClone(state.currentVitals)
        });

        // Update displays
        updateVitalsDisplay();
        const triageResult = calculateTriageCategory(state.currentVitals);
        updateTriageDisplay(triageResult);

        closeOverrideModal();
    }

    /**
     * Calculate approximate GCS breakdown from total
     */
    function calculateGcsBreakdown(total) {
        // Approximate distribution
        if (total >= 14) return { eye: 4, verbal: 5, motor: total - 9 };
        if (total >= 11) return { eye: 3, verbal: 4, motor: total - 7 };
        if (total >= 8) return { eye: 2, verbal: 3, motor: total - 5 };
        if (total >= 5) return { eye: 2, verbal: 2, motor: total - 4 };
        return { eye: 1, verbal: 1, motor: Math.max(1, total - 2) };
    }

    // =============================================
    // EXPORT FUNCTIONS
    // =============================================

    /**
     * Export data as JSON
     */
    function exportJson() {
        const triageResult = calculateTriageCategory(state.currentVitals);
        
        const exportData = {
            exportTimestamp: new Date().toISOString(),
            scenario: state.currentScenario ? state.currentScenario.name : 'Manual/Default',
            vitals: state.currentVitals,
            triageResult: {
                category: triageResult.categoryCode,
                categoryName: triageResult.category.name,
                confidence: triageResult.confidence,
                reasoning: triageResult.reasoning,
                guideline: triageResult.guideline.primary
            },
            systemScores: {
                cns: triageResult.systemScores.cns.score,
                respiratory: triageResult.systemScores.respiratory.score,
                cardiovascular: triageResult.systemScores.cardiovascular.score,
                circulation: triageResult.systemScores.circulation.score
            },
            interventions: triageResult.interventions,
            overrideHistory: state.overrideHistory,
            trendData: state.trendData
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `trauma-assessment-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    /**
     * Export as HTML report
     */
    function exportHtmlReport() {
        const triageResult = calculateTriageCategory(state.currentVitals);
        const v = state.currentVitals;
        
        const reportHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Trauma Assessment Report</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        h1 { color: #1a1f2e; border-bottom: 2px solid #3b82f6; padding-bottom: 10px; }
        h2 { color: #374151; margin-top: 30px; }
        table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
        th { background: #f3f4f6; }
        .triage-badge { display: inline-block; padding: 10px 20px; border-radius: 5px; font-weight: bold; color: white; }
        .triage-RED { background: #ef4444; }
        .triage-YELLOW { background: #f59e0b; color: #1a1f2e; }
        .triage-GREEN { background: #10b981; }
        .triage-BLACK { background: #64748b; }
        .section { margin: 20px 0; padding: 15px; background: #f9fafb; border-radius: 8px; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; color: #6b7280; font-size: 12px; }
        @media print { body { print-color-adjust: exact; -webkit-print-color-adjust: exact; } }
    </style>
</head>
<body>
    <h1>🏥 Trauma Assessment Report</h1>
    
    <div class="section">
        <h2>Patient Assessment Summary</h2>
        <p><strong>Report Generated:</strong> ${new Date().toLocaleString()}</p>
        <p><strong>Scenario:</strong> ${state.currentScenario ? escapeHtml(state.currentScenario.name) : 'Manual Assessment'}</p>
    </div>

    <div class="section">
        <h2>Triage Category</h2>
        <span class="triage-badge triage-${triageResult.categoryCode}">${triageResult.categoryCode} - ${triageResult.category.name}</span>
        <p style="margin-top: 15px;"><strong>Confidence:</strong> ${triageResult.confidence}%</p>
        <p><strong>Applied Guideline:</strong> ${triageResult.guideline.primary} Protocol</p>
    </div>

    <div class="section">
        <h2>AI Reasoning</h2>
        <p>${escapeHtml(triageResult.reasoning)}</p>
    </div>

    <h2>Vital Signs</h2>
    <table>
        <tr><th colspan="2">Central Nervous System</th></tr>
        <tr><td>GCS Score</td><td>${v.cns.gcs} (E${v.cns.gcsBreakdown.eye} V${v.cns.gcsBreakdown.verbal} M${v.cns.gcsBreakdown.motor})</td></tr>
        <tr><td>Pupils</td><td>${formatPupils(v.cns.pupils)}</td></tr>
        <tr><td>Consciousness</td><td>${formatConsciousness(v.cns.consciousness)}</td></tr>
    </table>

    <table>
        <tr><th colspan="2">Respiratory System</th></tr>
        <tr><td>Respiratory Rate</td><td>${v.respiratory.rate} breaths/min</td></tr>
        <tr><td>SpO2</td><td>${v.respiratory.spo2}%</td></tr>
        <tr><td>Breathing Pattern</td><td>${formatBreathingPattern(v.respiratory.pattern)}</td></tr>
    </table>

    <table>
        <tr><th colspan="2">Cardiovascular System</th></tr>
        <tr><td>Heart Rate</td><td>${v.cardio.hr} BPM</td></tr>
        <tr><td>Blood Pressure</td><td>${v.cardio.bpSystolic}/${v.cardio.bpDiastolic} mmHg</td></tr>
        <tr><td>Capillary Refill</td><td>${v.cardio.crt} seconds</td></tr>
        <tr><td>Pulse</td><td>${formatPulse(v.cardio.pulse)}</td></tr>
    </table>

    <table>
        <tr><th colspan="2">Circulation Assessment</th></tr>
        <tr><td>Skin Color</td><td>${formatSkinColor(v.circulation.skin)}</td></tr>
        <tr><td>Temperature</td><td>${v.circulation.temp}°C</td></tr>
        <tr><td>Est. Blood Loss</td><td>${v.circulation.bloodLoss} ml</td></tr>
    </table>

    <h2>Recommended Interventions</h2>
    <table>
        <tr><th>Priority</th><th>Category</th><th>Action</th><th>Reason</th></tr>
        ${triageResult.interventions.length > 0 
            ? triageResult.interventions.map(int => `
                <tr>
                    <td>${int.priority.toUpperCase()}</td>
                    <td>${escapeHtml(int.category)}</td>
                    <td>${escapeHtml(int.action)}</td>
                    <td>${escapeHtml(int.reason)}</td>
                </tr>
            `).join('')
            : '<tr><td colspan="4">No specific interventions required. Continue routine monitoring.</td></tr>'
        }
    </table>

    <h2>System Scores (KPI Model)</h2>
    <table>
        <tr><th>System</th><th>Score</th><th>Weight</th><th>Weighted Score</th></tr>
        <tr><td>CNS</td><td>${triageResult.systemScores.cns.score}/100</td><td>30%</td><td>${(triageResult.systemScores.cns.weightedScore).toFixed(1)}</td></tr>
        <tr><td>Respiratory</td><td>${triageResult.systemScores.respiratory.score}/100</td><td>25%</td><td>${(triageResult.systemScores.respiratory.weightedScore).toFixed(1)}</td></tr>
        <tr><td>Cardiovascular</td><td>${triageResult.systemScores.cardiovascular.score}/100</td><td>25%</td><td>${(triageResult.systemScores.cardiovascular.weightedScore).toFixed(1)}</td></tr>
        <tr><td>Circulation</td><td>${triageResult.systemScores.circulation.score}/100</td><td>20%</td><td>${(triageResult.systemScores.circulation.weightedScore).toFixed(1)}</td></tr>
        <tr><th>Total</th><th colspan="2"></th><th>${triageResult.overallScore}/100</th></tr>
    </table>

    <div class="footer">
        <p>This report was generated by the Smart Trauma Assessment Pad Demo.</p>
        <p>Based on ATLS and START Protocol guidelines. For demonstration purposes only - not for clinical use.</p>
    </div>
</body>
</html>`;

        const blob = new Blob([reportHtml], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `trauma-report-${Date.now()}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // =============================================
    // EVENT LISTENERS
    // =============================================

    function initEventListeners() {
        // Scenario loading
        elements.loadScenarioBtn.addEventListener('click', () => {
            loadScenario(elements.scenarioSelect.value);
        });

        elements.scenarioSelect.addEventListener('change', () => {
            if (elements.scenarioSelect.value) {
                loadScenario(elements.scenarioSelect.value);
            }
        });

        // Simulation controls
        elements.pauseSimBtn.addEventListener('click', toggleSimulation);
        elements.resetBtn.addEventListener('click', resetSimulation);

        // Override modal
        elements.overrideBtn.addEventListener('click', openOverrideModal);
        elements.closeModalBtn.addEventListener('click', closeOverrideModal);
        elements.cancelOverrideBtn.addEventListener('click', closeOverrideModal);
        elements.applyOverrideBtn.addEventListener('click', applyOverride);

        // Close modal on overlay click
        elements.overrideModal.addEventListener('click', (e) => {
            if (e.target === elements.overrideModal) {
                closeOverrideModal();
            }
        });

        // Close modal on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && elements.overrideModal.classList.contains('active')) {
                closeOverrideModal();
            }
        });

        // Export buttons
        elements.exportJsonBtn.addEventListener('click', exportJson);
        elements.exportHtmlBtn.addEventListener('click', exportHtmlReport);

        // High contrast toggle
        elements.toggleContrastBtn.addEventListener('click', () => {
            document.body.classList.toggle('high-contrast');
        });
    }

    // =============================================
    // INITIALIZATION
    // =============================================

    function init() {
        initEventListeners();
        updateVitalsDisplay();
        
        // Initial triage calculation
        const triageResult = calculateTriageCategory(state.currentVitals);
        updateTriageDisplay(triageResult);
        
        // Start simulation
        startSimulation();

        console.log('Smart Trauma Assessment Pad initialized successfully');
    }

    // Start the application when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
