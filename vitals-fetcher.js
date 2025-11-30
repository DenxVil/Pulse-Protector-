/**
 * Vitals Fetcher - ESP32 Data Fetching with Mock Mode
 * Handles HTTPS/HTTP mixed content issues with graceful fallback
 * 
 * Features:
 * - Fetches data from ESP32 via HTTP (if accessible)
 * - Mock Data Mode toggle for demo/HTTPS environments
 * - Realistic sine-wave heart rate simulation (60-100 BPM)
 * - Connection status indicator (green blinking if connected, red if disconnected)
 */

(function() {
    'use strict';

    // =============================================
    // CONFIGURATION
    // =============================================
    const config = {
        esp32Url: 'http://192.168.1.100/vitals', // Default ESP32 endpoint - update as needed
        fetchInterval: 2000, // 2 seconds
        connectionTimeout: 5000, // 5 seconds
        mockMode: true, // Default to mock mode for HTTPS compatibility
        lastDataTimestamp: null,
        isConnected: false
    };

    // =============================================
    // STATE
    // =============================================
    const state = {
        vitals: {
            heartRate: 75,
            spo2: 98,
            temperature: 36.8,
            timestamp: Date.now()
        },
        mockPhase: 0, // For sine wave generation
        fetchIntervalId: null
    };

    // =============================================
    // DOM ELEMENTS - Created dynamically
    // =============================================
    let connectionStatusEl = null;
    let mockModeToggleEl = null;

    // =============================================
    // MOCK DATA GENERATION
    // =============================================

    /**
     * Generate realistic sine-wave heart rate (60-100 BPM)
     * Creates a natural-looking heart rate variation
     */
    function generateMockHeartRate() {
        // Primary sine wave for base rhythm
        const baseAmplitude = 20; // Range: ±20 BPM
        const baseFrequency = 0.1; // Slow oscillation
        const baseBPM = 80; // Center point
        
        // Secondary variation for realism
        const noise = (Math.random() - 0.5) * 4; // ±2 BPM random noise
        
        // Calculate heart rate using sine wave
        const heartRate = baseBPM + 
            baseAmplitude * Math.sin(state.mockPhase * baseFrequency) +
            5 * Math.sin(state.mockPhase * 0.3) + // Faster secondary oscillation
            noise;
        
        // Increment phase
        state.mockPhase += 1;
        
        // Clamp to 60-100 BPM range
        return Math.round(Math.max(60, Math.min(100, heartRate)));
    }

    /**
     * Generate mock SpO2 (95-100%)
     */
    function generateMockSpO2() {
        const baseSpO2 = 97;
        const variation = Math.sin(state.mockPhase * 0.05) * 2;
        const noise = (Math.random() - 0.5) * 1;
        return Math.round(Math.max(95, Math.min(100, baseSpO2 + variation + noise)));
    }

    /**
     * Generate mock temperature (36.5-37.2°C)
     */
    function generateMockTemperature() {
        const baseTemp = 36.8;
        const variation = Math.sin(state.mockPhase * 0.02) * 0.3;
        const noise = (Math.random() - 0.5) * 0.1;
        return parseFloat((baseTemp + variation + noise).toFixed(1));
    }

    /**
     * Generate complete mock vitals data
     */
    function generateMockVitals() {
        return {
            heartRate: generateMockHeartRate(),
            spo2: generateMockSpO2(),
            temperature: generateMockTemperature(),
            timestamp: Date.now()
        };
    }

    // =============================================
    // DATA FETCHING
    // =============================================

    /**
     * Fetch vitals from ESP32 with error handling
     * Handles mixed content (HTTPS -> HTTP) gracefully
     */
    async function fetchVitals() {
        // If mock mode is enabled, use mock data
        if (config.mockMode) {
            const mockData = generateMockVitals();
            state.vitals = mockData;
            config.lastDataTimestamp = Date.now();
            config.isConnected = true;
            updateConnectionStatus(true, 'Mock Mode');
            dispatchVitalsUpdate(mockData);
            return mockData;
        }

        // Try to fetch from ESP32
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), config.connectionTimeout);

            const response = await fetch(config.esp32Url, {
                method: 'GET',
                signal: controller.signal,
                headers: {
                    'Accept': 'application/json'
                }
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            
            // Validate data structure
            const vitals = {
                heartRate: typeof data.heartRate === 'number' ? data.heartRate : (data.hr || data.bpm || 75),
                spo2: typeof data.spo2 === 'number' ? data.spo2 : (data.oxygen || data.SpO2 || 98),
                temperature: typeof data.temperature === 'number' ? data.temperature : (data.temp || 36.8),
                timestamp: Date.now()
            };

            state.vitals = vitals;
            config.lastDataTimestamp = Date.now();
            config.isConnected = true;
            updateConnectionStatus(true, 'Connected');
            dispatchVitalsUpdate(vitals);
            return vitals;

        } catch (error) {
            console.warn('Failed to fetch vitals from ESP32:', error.message);
            
            // Handle specific error types
            if (error.name === 'AbortError') {
                console.warn('Connection timeout - ESP32 not responding');
            } else if (error.message.includes('Mixed Content') || 
                       error.message.includes('blocked') ||
                       error.name === 'TypeError') {
                console.warn('Mixed content blocked - HTTPS cannot fetch HTTP. Enable Mock Mode.');
            }

            config.isConnected = false;
            updateConnectionStatus(false, 'Disconnected');
            
            // Return last known vitals or default
            return state.vitals;
        }
    }

    /**
     * Dispatch custom event with vitals data for other components to consume
     */
    function dispatchVitalsUpdate(vitals) {
        const event = new CustomEvent('vitalsUpdate', {
            detail: vitals,
            bubbles: true
        });
        document.dispatchEvent(event);
    }

    // =============================================
    // CONNECTION STATUS UI
    // =============================================

    /**
     * Create connection status indicator
     */
    function createConnectionStatusIndicator() {
        if (connectionStatusEl) return;

        connectionStatusEl = document.createElement('div');
        connectionStatusEl.className = 'connection-status';
        connectionStatusEl.innerHTML = `
            <span class="connection-dot disconnected"></span>
            <span class="connection-text">Disconnected</span>
        `;
        document.body.appendChild(connectionStatusEl);
    }

    /**
     * Update connection status display
     */
    function updateConnectionStatus(isConnected, statusText) {
        if (!connectionStatusEl) return;

        const dot = connectionStatusEl.querySelector('.connection-dot');
        const text = connectionStatusEl.querySelector('.connection-text');

        if (isConnected) {
            dot.className = 'connection-dot connected';
            text.textContent = statusText || 'Connected';
        } else {
            dot.className = 'connection-dot disconnected';
            text.textContent = statusText || 'Disconnected';
        }
    }

    // =============================================
    // MOCK MODE TOGGLE UI
    // =============================================

    /**
     * Create mock mode toggle button
     */
    function createMockModeToggle() {
        if (mockModeToggleEl) return;

        mockModeToggleEl = document.createElement('button');
        mockModeToggleEl.className = 'mock-mode-toggle' + (config.mockMode ? ' active' : '');
        mockModeToggleEl.innerHTML = `
            <span class="toggle-icon">🔄</span>
            <span class="toggle-text">${config.mockMode ? 'Mock Mode ON' : 'Mock Mode OFF'}</span>
        `;
        mockModeToggleEl.setAttribute('aria-label', 'Toggle Mock Data Mode');
        mockModeToggleEl.setAttribute('type', 'button');

        mockModeToggleEl.addEventListener('click', toggleMockMode);
        
        document.body.appendChild(mockModeToggleEl);
    }

    /**
     * Toggle mock mode on/off
     */
    function toggleMockMode() {
        config.mockMode = !config.mockMode;
        
        if (mockModeToggleEl) {
            mockModeToggleEl.className = 'mock-mode-toggle' + (config.mockMode ? ' active' : '');
            mockModeToggleEl.querySelector('.toggle-text').textContent = 
                config.mockMode ? 'Mock Mode ON' : 'Mock Mode OFF';
        }

        // Reset phase for fresh sine wave when toggling
        state.mockPhase = 0;
        
        // Immediate fetch to update display
        fetchVitals();
        
        console.log('Mock Mode:', config.mockMode ? 'Enabled' : 'Disabled');
    }

    // =============================================
    // PUBLIC API
    // =============================================

    /**
     * Set ESP32 URL
     */
    function setEsp32Url(url) {
        config.esp32Url = url;
    }

    /**
     * Get current vitals
     */
    function getCurrentVitals() {
        return { ...state.vitals };
    }

    /**
     * Check if data is fresh (less than 2 seconds old)
     */
    function isDataFresh() {
        if (!config.lastDataTimestamp) return false;
        return (Date.now() - config.lastDataTimestamp) < 2000;
    }

    /**
     * Get connection status
     */
    function getConnectionStatus() {
        return {
            isConnected: config.isConnected,
            isMockMode: config.mockMode,
            lastDataTimestamp: config.lastDataTimestamp,
            isDataFresh: isDataFresh()
        };
    }

    /**
     * Start fetching vitals
     */
    function startFetching() {
        if (state.fetchIntervalId) {
            clearInterval(state.fetchIntervalId);
        }
        
        // Initial fetch
        fetchVitals();
        
        // Set up interval
        state.fetchIntervalId = setInterval(fetchVitals, config.fetchInterval);
    }

    /**
     * Stop fetching vitals
     */
    function stopFetching() {
        if (state.fetchIntervalId) {
            clearInterval(state.fetchIntervalId);
            state.fetchIntervalId = null;
        }
    }

    // =============================================
    // INITIALIZATION
    // =============================================

    function init() {
        // Create UI elements
        createConnectionStatusIndicator();
        createMockModeToggle();
        
        // Auto-detect if we're on HTTPS and enable mock mode
        if (window.location.protocol === 'https:') {
            config.mockMode = true;
            console.log('HTTPS detected - Mock Mode enabled automatically for demo');
        }
        
        // Start fetching
        startFetching();
        
        console.log('Vitals Fetcher initialized', {
            mockMode: config.mockMode,
            esp32Url: config.esp32Url,
            fetchInterval: config.fetchInterval
        });
    }

    // Expose API globally
    window.VitalsFetcher = {
        fetchVitals,
        getCurrentVitals,
        getConnectionStatus,
        setEsp32Url,
        startFetching,
        stopFetching,
        toggleMockMode,
        isDataFresh
    };

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
