# Hardware Documentation

This directory contains hardware-related documentation for the Pulse Protector Smart Pad.

## Contents

- **Schematics**: Circuit diagrams and PCB layouts
- **BOM**: Bill of Materials with component specifications
- **Enclosure**: 3D printable enclosure designs (STL files)
- **Assembly**: Step-by-step assembly instructions

## Component Summary

| Component | Model | Purpose |
|-----------|-------|---------|
| MCU | ESP32-C3 Mini | Processing & BLE connectivity |
| PPG Sensor | MAX30102 | SpO₂ and heart rate measurement |
| ECG Front-End | INA128 | Single-lead ECG acquisition |
| Temperature | DS18B20 | Body temperature monitoring |
| Battery | 800mAh Li-Po | Power supply (8+ hours) |
| Charger | TP4056 | USB charging module |

## Pin Mapping (ESP32-C3)

| Pin | Function | Component |
|-----|----------|-----------|
| GPIO0 | I2C SCL | MAX30102 |
| GPIO1 | I2C SDA | MAX30102 |
| GPIO3 | INT | MAX30102 (optional) |
| GPIO4 | ADC | INA128 ECG Output |
| GPIO5 | 1-Wire DQ | DS18B20 |
| GPIO6 | ADC | Battery Voltage Monitor |
| GPIO8 | LED | Status Indicator |

## Total Cost

**₹1,500** (mass production) / **₹2,300** (DIY build)

## Resources

- [ESP32-C3 Technical Reference](https://www.espressif.com/sites/default/files/documentation/esp32-c3_technical_reference_manual_en.pdf)
- [MAX30102 Datasheet](https://www.analog.com/media/en/technical-documentation/data-sheets/MAX30102.pdf)
- [DS18B20 Datasheet](https://www.analog.com/media/en/technical-documentation/data-sheets/DS18B20.pdf)

---
*Pulse Protector - Smart Trauma Response System*
