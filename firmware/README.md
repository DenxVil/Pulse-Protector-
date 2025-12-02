# Firmware Documentation

This directory contains firmware source code and documentation for the Pulse Protector Smart Pad.

## Overview

The Smart Pad firmware is written in C/C++ using the Arduino framework with ESP-IDF extensions for the ESP32-C3 microcontroller.

## Architecture

```
firmware/
├── src/
│   ├── main.cpp              # Main application entry
│   ├── sensors/
│   │   ├── max30102.cpp      # SpO₂ and HR sensor driver
│   │   ├── ecg.cpp           # INA128 ECG acquisition
│   │   └── ds18b20.cpp       # Temperature sensor driver
│   ├── processing/
│   │   ├── vitals.cpp        # Vital signs calculation
│   │   ├── ptt.cpp           # Pulse Transit Time → BP estimation
│   │   └── triage.cpp        # AI triage engine (START protocol)
│   └── communication/
│       └── ble.cpp           # BLE 5.0 GATT server
├── include/
│   └── config.h              # Configuration parameters
├── lib/
│   └── dependencies          # Third-party libraries
└── platformio.ini            # PlatformIO build configuration
```

## Key Features

- **Multi-sensor data acquisition** (SpO₂, HR, ECG, Temperature)
- **Real-time BLE transmission** (BLE 5.0, 100m range)
- **On-device triage** (START protocol implementation)
- **Power management** (8+ hours battery life)
- **OTA updates** (wireless firmware updates)

## Build Instructions

```bash
# Install PlatformIO
pip install platformio

# Build firmware
pio run

# Upload to device
pio run --target upload

# Monitor serial output
pio device monitor
```

## BLE Service UUIDs

| Service | UUID |
|---------|------|
| Vital Signs | `180D` (Heart Rate Service) |
| SpO₂ | `1822` (Pulse Oximeter) |
| Temperature | `1809` (Health Thermometer) |
| Triage Data | Custom `00001234-...` |

## Dependencies

- ESP32 Arduino Core 2.0+
- MAX30102 SparkFun Library
- OneWire / DallasTemperature
- NimBLE-Arduino (BLE stack)

## License

MIT License - Open source for research and non-commercial use.

---
*Pulse Protector - Smart Trauma Response System*
