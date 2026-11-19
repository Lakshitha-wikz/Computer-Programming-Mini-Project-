// CompStock Comprehensive Seed Data
// Contains 110+ realistic electronic components across 21 categories,
// plus users, customers, default settings, and historical transactions.

const categories = [
  'Microcontrollers',
  'Development Boards',
  'Sensors',
  'Modules',
  'Resistors',
  'Capacitors',
  'Diodes',
  'LEDs',
  'Transistors',
  'ICs',
  'Voltage Regulators',
  'Connectors',
  'Switches',
  'Relays',
  'Displays',
  'Motors',
  'Motor Drivers',
  'Power Supplies',
  'Cables',
  'Breadboards',
  'Electronic Accessories'
];

const users = [
  { name: 'Admin User', email: 'admin@compstock.lk', pass: 'Admin@12345', role: 'admin', status: 'active' },
  { name: 'Sales Staff', email: 'staff@compstock.lk', pass: 'Staff@12345', role: 'sales', status: 'active' },
  { name: 'T.W.K.L Dilshan', email: 'dilshan@compstock.lk', pass: 'dilshan123', role: 'admin', status: 'active' },
  { name: 'T.A.I.R Nandana', email: 'nandana@compstock.lk', pass: 'nandana123', role: 'sales', status: 'active' },
  { name: 'W.A.C.C Fonseka', email: 'fonseka@compstock.lk', pass: 'fonseka123', role: 'sales', status: 'invited' }
];

const customers = [
  { name: 'Kandy Electro Care', phone: '+94 81 223 4567', email: 'service@kandyelectro.lk', address: '142 Peradeniya Rd, Kandy', status: 'active' },
  { name: 'Ceylon Tech Labs', phone: '+94 11 258 9901', email: 'purchasing@ceylontechlabs.com', address: '78 Galle Rd, Colombo 03', status: 'active' },
  { name: 'Galle Robotics Club', phone: '+94 91 432 1100', email: 'robotics@galle.ac.lk', address: 'Engineering Dept, Ruhuna University, Galle', status: 'active' },
  { name: 'N. Perera', phone: '+94 77 123 4567', email: 'nimal.perera@gmail.com', address: '24 Flower Rd, Colombo 07', status: 'active' },
  { name: 'R. Silva', phone: '+94 71 987 6543', email: 'roshan.silva@yahoo.com', address: '55 Kandy Rd, Kurunegala', status: 'active' },
  { name: 'D. Gunawardena', phone: '+94 76 555 1212', email: 'dilan.guna@outlook.com', address: '12 Temple Rd, Maharagama', status: 'active' },
  { name: 'Apex Automation Ltd', phone: '+94 11 489 3322', email: 'orders@apexautomation.lk', address: 'Plot 45, Industrial Zone, Ekala', status: 'active' },
  { name: 'Moratuwa IoT Solutions', phone: '+94 70 334 4556', email: 'info@moratuwaiot.lk', address: 'Katubedda, Moratuwa', status: 'active' },
  { name: 'Smart Agro Sensors', phone: '+94 78 889 0011', email: 'procure@smartagro.lk', address: '88 High Level Rd, Nugegoda', status: 'active' },
  { name: 'K. Jayasuriya', phone: '+94 72 445 6677', email: 'kasun.j@hotmail.com', address: '49 Main St, Negombo', status: 'active' },
  { name: 'MicroVolt Engineering', phone: '+94 11 778 8990', email: 'supplies@microvolt.lk', address: '109 Havelock Rd, Colombo 05', status: 'active' },
  { name: 'Walk-in Customer', phone: '', email: '', address: 'Counter walk-in', status: 'active' }
];

const settings = [
  { key: 'company_name', value: 'CompStock Electronics' },
  { key: 'company_tagline', value: 'Electronic Components & Equipment Shop' },
  { key: 'company_phone', value: '+94 11 234 5678' },
  { key: 'company_email', value: 'sales@compstock.lk' },
  { key: 'company_address', value: '124 First Cross Street, Pettah, Colombo 11, Sri Lanka' },
  { key: 'currency', value: 'Rs' },
  { key: 'invoice_prefix', value: 'S-' },
  { key: 'low_stock_default', value: '8' },
  { key: 'theme', value: 'light' }
];

const products = [
  // 1. Microcontrollers (10)
  { name: 'ATmega328P-PU (DIP-28)', cat: 'Microcontrollers', sku: 'MCU-ATM328-DIP', barcode: '890100100001', price: 650, cost: 420, stock: 45, threshold: 10, icon: 'cpu', desc: '8-bit AVR Microcontroller with 32K Flash, DIP-28 package' },
  { name: 'ESP32-WROOM-32 Wi-Fi & BLE Module', cat: 'Microcontrollers', sku: 'MCU-ESP32-WR', barcode: '890100100002', price: 890, cost: 620, stock: 32, threshold: 8, icon: 'chip', desc: 'Dual-core 240MHz MCU with 2.4GHz Wi-Fi and Bluetooth 4.2' },
  { name: 'ESP32-S3-WROOM-1-N8R8', cat: 'Microcontrollers', sku: 'MCU-ESP32-S3', barcode: '890100100003', price: 1450, cost: 1050, stock: 18, threshold: 6, icon: 'chip', desc: 'Xtensa dual-core LX7 with Vector instructions, 8MB Flash 8MB PSRAM' },
  { name: 'ESP8266 ESP-12F Module', cat: 'Microcontrollers', sku: 'MCU-ESP12F', barcode: '890100100004', price: 540, cost: 340, stock: 40, threshold: 10, icon: 'chip', desc: 'Tensilica L106 32-bit Wi-Fi micro-module with integrated PCB antenna' },
  { name: 'STM32F103C8T6 ARM Cortex-M3', cat: 'Microcontrollers', sku: 'MCU-STM32-C8T6', barcode: '890100100005', price: 480, cost: 310, stock: 25, threshold: 8, icon: 'cpu', desc: '32-bit ARM Cortex-M3 72MHz 64KB Flash MCU in LQFP48' },
  { name: 'ATtiny85-20PU (DIP-8)', cat: 'Microcontrollers', sku: 'MCU-ATTINY85', barcode: '890100100006', price: 380, cost: 230, stock: 50, threshold: 12, icon: 'cpu', desc: 'High-performance, low-power 8-bit AVR Microcontroller with 8KB ISP Flash' },
  { name: 'PIC16F877A-I/P (DIP-40)', cat: 'Microcontrollers', sku: 'MCU-PIC16F877A', barcode: '890100100007', price: 1250, cost: 890, stock: 12, threshold: 5, icon: 'cpu', desc: '40-pin Enhanced Flash 8-bit Microcontroller with 10-bit A/D' },
  { name: 'Raspberry Pi Pico RP2040', cat: 'Microcontrollers', sku: 'MCU-PICO-RP2040', barcode: '890100100008', price: 1350, cost: 950, stock: 22, threshold: 8, icon: 'cpu', desc: 'Dual-core ARM Cortex-M0+ @ 133MHz with 2MB QSPI Flash' },
  { name: 'Raspberry Pi Pico W (Wi-Fi)', cat: 'Microcontrollers', sku: 'MCU-PICO-W', barcode: '890100100009', price: 1950, cost: 1450, stock: 15, threshold: 6, icon: 'cpu', desc: 'Raspberry Pi Pico with onboard single-band 2.4GHz Wi-Fi (CYW43439)' },
  { name: 'Arduino Nano V3.0 (CH340G)', cat: 'Microcontrollers', sku: 'MCU-NANO-V3', barcode: '890100100010', price: 920, cost: 650, stock: 0, threshold: 10, icon: 'cpu', desc: 'Compact ATmega328P mini-board with CH340G USB interface (Currently Out of Stock)' },

  // 2. Development Boards (8)
  { name: 'Arduino UNO R3 (DIP with Cable)', cat: 'Development Boards', sku: 'DEV-UNO-R3', barcode: '890100200001', price: 2450, cost: 1650, stock: 28, threshold: 6, icon: 'cpu', desc: 'ATmega328P DIP board with ATmega16U2 USB chip and blue USB cable' },
  { name: 'Arduino Mega 2560 R3', cat: 'Development Boards', sku: 'DEV-MEGA-2560', barcode: '890100200002', price: 4200, cost: 3100, stock: 9, threshold: 4, icon: 'cpu', desc: 'ATmega2560 board with 54 digital I/O pins, 16 analog inputs, 4 UARTs' },
  { name: 'NodeMCU ESP8266 V3 Lua', cat: 'Development Boards', sku: 'DEV-NODEMCU-V3', barcode: '890100200003', price: 980, cost: 680, stock: 35, threshold: 8, icon: 'chip', desc: 'ESP8266 IoT board with onboard micro-USB and CP2102 driver' },
  { name: 'ESP32 DevKit V1 (30-pin)', cat: 'Development Boards', sku: 'DEV-ESP32-30P', barcode: '890100200004', price: 1650, cost: 1180, stock: 26, threshold: 8, icon: 'chip', desc: 'Dual-core NodeMCU-32S board with CP2102 and dual Wi-Fi/Bluetooth' },
  { name: 'ESP32-CAM Development Board with OV2640', cat: 'Development Boards', sku: 'DEV-ESP32-CAM', barcode: '890100200005', price: 2150, cost: 1550, stock: 14, threshold: 5, icon: 'chip', desc: 'Wi-Fi/Bluetooth board with 2MP OV2640 camera and micro-SD card slot' },
  { name: 'STM32 Blue Pill (STM32F103C8T6)', cat: 'Development Boards', sku: 'DEV-STM32-BLUE', barcode: '890100200006', price: 950, cost: 650, stock: 18, threshold: 6, icon: 'cpu', desc: 'Arm Cortex-M3 minimum system development board with micro-USB' },
  { name: 'Teensy 4.0 ARM Cortex-M7 600MHz', cat: 'Development Boards', sku: 'DEV-TEENSY-40', barcode: '890100200007', price: 7800, cost: 6100, stock: 4, threshold: 3, icon: 'cpu', desc: 'High-speed ARM Cortex-M7 at 600 MHz, NXP i.MXRT1062 processor' },
  { name: 'Seeed Studio XIAO SAMD21', cat: 'Development Boards', sku: 'DEV-XIAO-SAMD', barcode: '890100200008', price: 2250, cost: 1650, stock: 8, threshold: 4, icon: 'cpu', desc: 'Ultra-small Arduino compatible board with USB-C and 14 GPIO pins' },

  // 3. Sensors (12)
  { name: 'DHT22 / AM2302 Temp & Humidity Sensor', cat: 'Sensors', sku: 'SEN-DHT22', barcode: '890100300001', price: 1150, cost: 780, stock: 4, threshold: 10, icon: 'sen', desc: 'Digital temperature & humidity sensor with calibrated digital signal output' },
  { name: 'DHT11 Temperature & Humidity Sensor', cat: 'Sensors', sku: 'SEN-DHT11', barcode: '890100300002', price: 320, cost: 190, stock: 42, threshold: 10, icon: 'sen', desc: 'Entry-level digital relative humidity and temperature sensor' },
  { name: 'HC-SR04 Ultrasonic Distance Sensor', cat: 'Sensors', sku: 'SEN-HCSR04', barcode: '890100300003', price: 340, cost: 195, stock: 38, threshold: 8, icon: 'sen', desc: 'Non-contact ultrasonic distance measuring module 2cm to 400cm' },
  { name: 'BMP280 Digital Barometric Pressure Sensor', cat: 'Sensors', sku: 'SEN-BMP280', barcode: '890100300004', price: 420, cost: 260, stock: 19, threshold: 6, icon: 'sen', desc: 'High-precision barometric pressure sensor with I2C and SPI interface' },
  { name: 'BME280 Temp/Humidity/Pressure (I2C/SPI)', cat: 'Sensors', sku: 'SEN-BME280', barcode: '890100300005', price: 1100, cost: 750, stock: 7, threshold: 6, icon: 'sen', desc: 'Combined environmental sensor for temperature, relative humidity and pressure' },
  { name: 'MPU-6050 6-DOF Gyro & Accelerometer', cat: 'Sensors', sku: 'SEN-MPU6050', barcode: '890100300006', price: 680, cost: 420, stock: 24, threshold: 8, icon: 'sen', desc: '3-axis gyroscope and 3-axis accelerometer with on-chip Digital Motion Processor' },
  { name: 'PIR Motion Sensor HC-SR501', cat: 'Sensors', sku: 'SEN-PIR-SR501', barcode: '890100300007', price: 420, cost: 260, stock: 22, threshold: 8, icon: 'sen', desc: 'Pyroelectric infrared passive motion detector module with adjustable delay' },
  { name: 'MQ-2 Gas Sensor Module (Smoke/LPG)', cat: 'Sensors', sku: 'SEN-MQ2', barcode: '890100300008', price: 450, cost: 270, stock: 16, threshold: 6, icon: 'sen', desc: 'Combustible gas and smoke analog/digital sensor with LM393 comparator' },
  { name: 'MQ-7 Carbon Monoxide Gas Sensor', cat: 'Sensors', sku: 'SEN-MQ7', barcode: '890100300009', price: 580, cost: 360, stock: 11, threshold: 5, icon: 'sen', desc: 'CO gas sensor with high sensitivity to carbon monoxide' },
  { name: 'LDR Light Dependent Resistor Sensor Module', cat: 'Sensors', sku: 'SEN-LDR-MOD', barcode: '890100300010', price: 180, cost: 95, stock: 55, threshold: 12, icon: 'sen', desc: 'Photoresistor light detection sensor with digital and analog outputs' },
  { name: 'Capacitive Soil Moisture Sensor V1.2', cat: 'Sensors', sku: 'SEN-SOIL-CAP', barcode: '890100300011', price: 380, cost: 220, stock: 3, threshold: 8, icon: 'sen', desc: 'Corrosion resistant capacitive soil moisture sensor with analog output' },
  { name: 'DS18B20 Waterproof Temperature Probe (1m)', cat: 'Sensors', sku: 'SEN-DS18B20-WP', barcode: '890100300012', price: 590, cost: 360, stock: 29, threshold: 8, icon: 'sen', desc: '1-Wire digital thermometer probe housed in stainless steel waterproof tube' },

  // 4. Modules (8)
  { name: '5V Single Channel Relay Module with Optocoupler', cat: 'Modules', sku: 'MOD-RELAY-1CH', barcode: '890100400001', price: 210, cost: 120, stock: 6, threshold: 8, icon: 'chip', desc: '1-Channel 5V relay module with optocoupler isolation, 10A 250VAC rating' },
  { name: '5V 2-Channel Relay Module Optocoupler', cat: 'Modules', sku: 'MOD-RELAY-2CH', barcode: '890100400002', price: 380, cost: 220, stock: 18, threshold: 6, icon: 'chip', desc: '2-Channel 5V relay expansion board with opto-isolation' },
  { name: '5V 4-Channel Relay Module Optocoupler', cat: 'Modules', sku: 'MOD-RELAY-4CH', barcode: '890100400003', price: 680, cost: 420, stock: 12, threshold: 5, icon: 'chip', desc: '4-Channel 5V relay module for Arduino, Raspberry Pi and PIC controllers' },
  { name: 'TP4056 1A Li-Ion Battery Charger Module Type-C', cat: 'Modules', sku: 'MOD-TP4056-TC', barcode: '890100400004', price: 160, cost: 85, stock: 65, threshold: 15, icon: 'chip', desc: 'Lithium battery charger with Type-C input and dual protection ICs' },
  { name: 'I2C Serial Interface Adapter for LCD1602', cat: 'Modules', sku: 'MOD-I2C-LCD', barcode: '890100400005', price: 240, cost: 130, stock: 45, threshold: 10, icon: 'chip', desc: 'PCF8574 I2C adapter to reduce 16-pin LCD wiring down to 4 wires' },
  { name: 'Micro SD Card Reader SPI Module', cat: 'Modules', sku: 'MOD-MICROSD-SPI', barcode: '890100400006', price: 260, cost: 140, stock: 24, threshold: 8, icon: 'chip', desc: 'Micro SD/TF card read-write module communicating via SPI' },
  { name: 'HC-05 Bluetooth Serial Transceiver Module', cat: 'Modules', sku: 'MOD-BT-HC05', barcode: '890100400007', price: 1250, cost: 820, stock: 15, threshold: 5, icon: 'chip', desc: 'Master/Slave Bluetooth SPP serial port module for wireless communication' },
  { name: 'NRF24L01+ 2.4GHz Wireless Transceiver', cat: 'Modules', sku: 'MOD-NRF24L01', barcode: '890100400008', price: 320, cost: 180, stock: 36, threshold: 10, icon: 'chip', desc: 'Ultra low power 2.4GHz RF wireless transceiver module' },

  // 5. Resistors (7)
  { name: '10kΩ Resistors 1/4W Metal Film (pack of 100)', cat: 'Resistors', sku: 'RES-10K-100PK', barcode: '890100500001', price: 350, cost: 160, stock: 58, threshold: 10, icon: 'res', desc: '1% tolerance 1/4W metal film resistors, 100 pieces per pack' },
  { name: '1kΩ Resistors 1/4W Metal Film (pack of 100)', cat: 'Resistors', sku: 'RES-1K-100PK', barcode: '890100500002', price: 350, cost: 160, stock: 42, threshold: 10, icon: 'res', desc: '1% tolerance 1/4W metal film resistors, 100 pieces per pack' },
  { name: '220Ω Resistors 1/4W Metal Film (pack of 100)', cat: 'Resistors', sku: 'RES-220R-100PK', barcode: '890100500003', price: 350, cost: 160, stock: 60, threshold: 10, icon: 'res', desc: 'Standard LED current limiting resistors 220 Ohm, pack of 100' },
  { name: '330Ω Resistors 1/4W Metal Film (pack of 100)', cat: 'Resistors', sku: 'RES-330R-100PK', barcode: '890100500004', price: 350, cost: 160, stock: 35, threshold: 10, icon: 'res', desc: '1/4 Watt 1% metal film resistors 330 ohm, pack of 100' },
  { name: '4.7kΩ Resistors 1/4W Metal Film (pack of 100)', cat: 'Resistors', sku: 'RES-4K7-100PK', barcode: '890100500005', price: 350, cost: 160, stock: 28, threshold: 10, icon: 'res', desc: 'Ideal for I2C pullup and 1-Wire data lines, pack of 100' },
  { name: '100kΩ Resistors 1/4W Metal Film (pack of 100)', cat: 'Resistors', sku: 'RES-100K-100PK', barcode: '890100500006', price: 350, cost: 160, stock: 30, threshold: 10, icon: 'res', desc: 'High value voltage divider and pullup resistors, pack of 100' },
  { name: '10kΩ Rotary Potentiometer (B10K Linear)', cat: 'Resistors', sku: 'RES-POT-10K', barcode: '890100500007', price: 90, cost: 45, stock: 75, threshold: 15, icon: 'res', desc: 'Single linear B10K potentiometer with washer and nut' },

  // 6. Capacitors (6)
  { name: '100nF (0.1µF) Ceramic Capacitor 50V (pack of 50)', cat: 'Capacitors', sku: 'CAP-104-50PK', barcode: '890100600001', price: 250, cost: 110, stock: 45, threshold: 10, icon: 'res', desc: '104 decoupling ceramic disc capacitors 50V, pack of 50' },
  { name: '22pF Ceramic Disc Capacitor 50V (pack of 50)', cat: 'Capacitors', sku: 'CAP-22P-50PK', barcode: '890100600002', price: 200, cost: 90, stock: 50, threshold: 10, icon: 'res', desc: 'Ideal crystal oscillator loading capacitors, pack of 50' },
  { name: '10µF 50V Electrolytic Capacitor (pack of 20)', cat: 'Capacitors', sku: 'CAP-10UF-50V', barcode: '890100600003', price: 180, cost: 80, stock: 40, threshold: 10, icon: 'res', desc: 'Radial lead aluminum electrolytic capacitor 105°C, pack of 20' },
  { name: '100µF 25V Electrolytic Capacitor (pack of 20)', cat: 'Capacitors', sku: 'CAP-100UF-25V', barcode: '890100600004', price: 220, cost: 100, stock: 35, threshold: 10, icon: 'res', desc: 'Radial aluminum electrolytic capacitor 25V, pack of 20' },
  { name: '470µF 25V Electrolytic Capacitor (pack of 10)', cat: 'Capacitors', sku: 'CAP-470UF-25V', barcode: '890100600005', price: 240, cost: 120, stock: 25, threshold: 8, icon: 'res', desc: 'High capacity power filtering capacitor 25V, pack of 10' },
  { name: '1000µF 25V Electrolytic Capacitor (pack of 5)', cat: 'Capacitors', sku: 'CAP-1000UF-25V', barcode: '890100600006', price: 250, cost: 130, stock: 30, threshold: 8, icon: 'res', desc: 'Power supply reservoir smoothing capacitor, pack of 5' },

  // 7. Diodes (5)
  { name: '1N4007 1A 1000V Silicon Rectifier Diode (pack of 25)', cat: 'Diodes', sku: 'DIO-1N4007-25', barcode: '890100700001', price: 150, cost: 60, stock: 80, threshold: 15, icon: 'res', desc: 'General purpose 1A 1000V rectifier diode in DO-41 package, pack of 25' },
  { name: '1N4148 High-Speed Switching Diode (pack of 50)', cat: 'Diodes', sku: 'DIO-1N4148-50', barcode: '890100700002', price: 200, cost: 80, stock: 70, threshold: 15, icon: 'res', desc: 'Fast switching 100V 150mA signal diode in DO-35 glass package, pack of 50' },
  { name: '1N5819 Schottky Barrier Diode 1A 40V (pack of 20)', cat: 'Diodes', sku: 'DIO-1N5819-20', barcode: '890100700003', price: 220, cost: 100, stock: 35, threshold: 10, icon: 'res', desc: 'Low forward voltage drop Schottky barrier diode for high efficiency circuits' },
  { name: '5.1V 1/2W Zener Diode (pack of 20)', cat: 'Diodes', sku: 'DIO-ZEN-5V1', barcode: '890100700004', price: 180, cost: 75, stock: 45, threshold: 10, icon: 'res', desc: '5.1V voltage regulator Zener diode 500mW DO-35, pack of 20' },
  { name: '3.3V 1/2W Zener Diode (pack of 20)', cat: 'Diodes', sku: 'DIO-ZEN-3V3', barcode: '890100700005', price: 180, cost: 75, stock: 38, threshold: 10, icon: 'res', desc: '3.3V voltage reference Zener diode 500mW DO-35, pack of 20' },

  // 8. LEDs (6)
  { name: '5mm Diffused Red LED (pack of 25)', cat: 'LEDs', sku: 'LED-5MM-RED', barcode: '890100800001', price: 125, cost: 50, stock: 90, threshold: 20, icon: 'disp', desc: 'Standard 5mm diffused red indicator LED, pack of 25' },
  { name: '5mm Diffused Green LED (pack of 25)', cat: 'LEDs', sku: 'LED-5MM-GRN', barcode: '890100800002', price: 125, cost: 50, stock: 85, threshold: 20, icon: 'disp', desc: 'Standard 5mm diffused green indicator LED, pack of 25' },
  { name: '5mm Diffused Blue LED (pack of 25)', cat: 'LEDs', sku: 'LED-5MM-BLU', barcode: '890100800003', price: 150, cost: 60, stock: 65, threshold: 15, icon: 'disp', desc: 'Standard 5mm diffused blue indicator LED, pack of 25' },
  { name: '5mm Diffused Yellow LED (pack of 25)', cat: 'LEDs', sku: 'LED-5MM-YEL', barcode: '890100800004', price: 125, cost: 50, stock: 70, threshold: 15, icon: 'disp', desc: 'Standard 5mm diffused yellow indicator LED, pack of 25' },
  { name: '5mm Super Bright White LED (pack of 25)', cat: 'LEDs', sku: 'LED-5MM-WHT', barcode: '890100800005', price: 175, cost: 75, stock: 60, threshold: 15, icon: 'disp', desc: 'Ultra-bright clear lens white 5mm LED, pack of 25' },
  { name: '5mm RGB LED Common Cathode (pack of 10)', cat: 'LEDs', sku: 'LED-5MM-RGB', barcode: '890100800006', price: 250, cost: 120, stock: 40, threshold: 10, icon: 'disp', desc: 'Tri-color 4-pin diffused common cathode RGB LED, pack of 10' },

  // 9. Transistors (6)
  { name: '2N2222A NPN Bipolar Transistor (pack of 10)', cat: 'Transistors', sku: 'TRA-2N2222-10', barcode: '890100900001', price: 150, cost: 65, stock: 55, threshold: 12, icon: 'res', desc: 'High-speed NPN switching transistor 40V 800mA TO-92, pack of 10' },
  { name: 'BC547 NPN General Purpose Transistor (pack of 10)', cat: 'Transistors', sku: 'TRA-BC547-10', barcode: '890100900002', price: 120, cost: 50, stock: 60, threshold: 12, icon: 'res', desc: 'Low noise general purpose audio and switching transistor TO-92, pack of 10' },
  { name: 'BC557 PNP General Purpose Transistor (pack of 10)', cat: 'Transistors', sku: 'TRA-BC557-10', barcode: '890100900003', price: 120, cost: 50, stock: 45, threshold: 12, icon: 'res', desc: 'Complementary PNP general purpose transistor TO-92, pack of 10' },
  { name: 'TIP120 NPN Darlington Power Transistor', cat: 'Transistors', sku: 'TRA-TIP120', barcode: '890100900004', price: 140, cost: 70, stock: 35, threshold: 8, icon: 'res', desc: 'Complementary silicon power Darlington transistor 60V 5A TO-220' },
  { name: 'IRFZ44N N-Channel Power MOSFET 55V 49A', cat: 'Transistors', sku: 'TRA-IRFZ44N', barcode: '890100900005', price: 220, cost: 120, stock: 28, threshold: 8, icon: 'res', desc: 'Fast switching HEXFET power MOSFET with low on-resistance TO-220AB' },
  { name: '2N7000 N-Channel Small Signal MOSFET (pack of 10)', cat: 'Transistors', sku: 'TRA-2N7000-10', barcode: '890100900006', price: 180, cost: 85, stock: 32, threshold: 8, icon: 'res', desc: 'N-channel enhancement mode field effect transistor TO-92, pack of 10' },

  // 10. ICs (8)
  { name: 'NE555 Precision Timer IC (DIP-8)', cat: 'ICs', sku: 'IC-NE555P', barcode: '890101000001', price: 75, cost: 35, stock: 85, threshold: 15, icon: 'chip', desc: 'Industry standard precision timer circuit producing accurate time delays or oscillation' },
  { name: 'LM358 Dual Low Power Op-Amp (DIP-8)', cat: 'ICs', sku: 'IC-LM358N', barcode: '890101000002', price: 95, cost: 45, stock: 3, threshold: 8, icon: 'chip', desc: 'Dual independent high-gain frequency-compensated operational amplifier' },
  { name: 'LM324 Quad Operational Amplifier (DIP-14)', cat: 'ICs', sku: 'IC-LM324N', barcode: '890101000003', price: 120, cost: 60, stock: 25, threshold: 8, icon: 'chip', desc: 'Four independent high-gain internally frequency compensated op-amps' },
  { name: 'LM386 Low Voltage Audio Power Amplifier (DIP-8)', cat: 'ICs', sku: 'IC-LM386N', barcode: '890101000004', price: 110, cost: 55, stock: 28, threshold: 8, icon: 'chip', desc: 'Power amplifier designed for use in low voltage battery consumer applications' },
  { name: '74HC595 8-Bit Shift Register (DIP-16)', cat: 'ICs', sku: 'IC-74HC595', barcode: '890101000005', price: 115, cost: 58, stock: 45, threshold: 10, icon: 'chip', desc: 'Serial-in parallel-out shift register with 3-state output registers' },
  { name: 'ULN2003A Darlington Transistor Array (DIP-16)', cat: 'ICs', sku: 'IC-ULN2003A', barcode: '890101000006', price: 130, cost: 65, stock: 38, threshold: 10, icon: 'chip', desc: 'Seven high-voltage high-current NPN Darlington pairs with common cathode diodes' },
  { name: 'PC817 Optocoupler Isolator (DIP-4)', cat: 'ICs', sku: 'IC-PC817', barcode: '890101000007', price: 50, cost: 22, stock: 95, threshold: 20, icon: 'chip', desc: 'High isolation voltage phototransistor optical isolator DIP-4' },
  { name: 'CD4017 Decade Counter with 10 Decoded Outputs', cat: 'ICs', sku: 'IC-CD4017BE', barcode: '890101000008', price: 110, cost: 52, stock: 30, threshold: 8, icon: 'chip', desc: 'CMOS 5-stage Johnson decade counter with 10 decoded outputs' },

  // 11. Voltage Regulators (7)
  { name: 'LM7805 5V 1.5A Positive Voltage Regulator', cat: 'Voltage Regulators', sku: 'REG-LM7805', barcode: '890101100001', price: 110, cost: 55, stock: 65, threshold: 12, icon: 'chip', desc: '3-terminal positive regulator with thermal overload protection TO-220' },
  { name: 'LM7812 12V 1.5A Positive Voltage Regulator', cat: 'Voltage Regulators', sku: 'REG-LM7812', barcode: '890101100002', price: 110, cost: 55, stock: 35, threshold: 10, icon: 'chip', desc: '3-terminal 12V fixed voltage linear regulator TO-220' },
  { name: 'LM317T Adjustable Voltage Regulator 1.2V-37V', cat: 'Voltage Regulators', sku: 'REG-LM317T', barcode: '890101100003', price: 130, cost: 68, stock: 40, threshold: 10, icon: 'chip', desc: 'Adjustable 3-terminal positive voltage regulator capable of supplying >1.5A' },
  { name: 'AMS1117-3.3V Linear Regulator Module', cat: 'Voltage Regulators', sku: 'REG-AMS1117-3V3', barcode: '890101100004', price: 150, cost: 75, stock: 52, threshold: 12, icon: 'chip', desc: 'Step-down 5V to 3.3V power supply module with power indicator LED' },
  { name: 'LM2596S DC-DC Step-Down Buck Converter Module', cat: 'Voltage Regulators', sku: 'REG-LM2596-BUCK', barcode: '890101100005', price: 450, cost: 260, stock: 24, threshold: 8, icon: 'chip', desc: 'Adjustable switching step-down power supply module 3A output' },
  { name: 'XL6009 DC-DC Step-Up Boost Converter Module', cat: 'Voltage Regulators', sku: 'REG-XL6009-BOOST', barcode: '890101100006', price: 520, cost: 310, stock: 16, threshold: 6, icon: 'chip', desc: 'High performance 4A switching current boost converter module' },
  { name: 'Mini-360 Ultra-Small DC-DC Buck Converter', cat: 'Voltage Regulators', sku: 'REG-MINI360', barcode: '890101100007', price: 210, cost: 110, stock: 48, threshold: 10, icon: 'chip', desc: 'Synchronous rectified step-down buck module 4.75V-23V to 1V-17V' },

  // 12. Connectors (6)
  { name: '2.54mm 40-Pin Male Pin Header Strip (pack of 5)', cat: 'Connectors', sku: 'CON-HDR-M40-5', barcode: '890101200001', price: 150, cost: 65, stock: 75, threshold: 15, icon: 'res', desc: 'Single row straight breakaway 40-pin male headers, pack of 5' },
  { name: '2.54mm 40-Pin Female Pin Header Strip (pack of 5)', cat: 'Connectors', sku: 'CON-HDR-F40-5', barcode: '890101200002', price: 220, cost: 95, stock: 55, threshold: 12, icon: 'res', desc: 'Single row straight 40-pin female socket headers, pack of 5' },
  { name: '2-Pin 5.08mm Pitch PCB Screw Terminal Block (pack of 10)', cat: 'Connectors', sku: 'CON-SCREW-2P', barcode: '890101200003', price: 250, cost: 110, stock: 40, threshold: 10, icon: 'res', desc: 'Side-entry PCB mount wire-to-board screw connector blocks, pack of 10' },
  { name: 'DC Barrel Power Jack 2.1x5.5mm Female PCB Mount (pack of 5)', cat: 'Connectors', sku: 'CON-DC-JACK-5', barcode: '890101200004', price: 180, cost: 75, stock: 50, threshold: 10, icon: 'res', desc: 'Standard 2.1mm center-positive DC power socket connectors, pack of 5' },
  { name: 'USB Type-C Female 16-Pin Breakout Board', cat: 'Connectors', sku: 'CON-USBC-BRK', barcode: '890101200005', price: 190, cost: 95, stock: 35, threshold: 8, icon: 'res', desc: 'USB 3.1 Type-C female connector soldered onto 2.54mm pitch breakout board' },
  { name: 'JST-XH 2.54mm 2-Pin Cable and Socket Pair (pack of 5)', cat: 'Connectors', sku: 'CON-JST-2P-5', barcode: '890101200006', price: 220, cost: 105, stock: 32, threshold: 8, icon: 'res', desc: '20cm pigtail lead with JST connector and PCB mating header, pack of 5' },

  // 13. Switches (5)
  { name: '6x6x5mm Tactile Push Button Switch (pack of 20)', cat: 'Switches', sku: 'SW-TACT-6X6-20', barcode: '890101300001', price: 150, cost: 60, stock: 80, threshold: 15, icon: 'res', desc: 'Miniature momentary tactile switches 4-pin for PCB and breadboard, pack of 20' },
  { name: '12mm Round Momentary Push Button Red', cat: 'Switches', sku: 'SW-BTN-12MM-R', barcode: '890101300002', price: 110, cost: 50, stock: 45, threshold: 10, icon: 'res', desc: 'Panel-mount reset push button switch with mounting nut' },
  { name: 'KCD1 2-Pin SPST Rocker Switch 6A 250V', cat: 'Switches', sku: 'SW-ROCKER-KCD1', barcode: '890101300003', price: 95, cost: 42, stock: 60, threshold: 12, icon: 'res', desc: 'Snap-in rectangular black ON-OFF power rocker switch' },
  { name: 'Mini Slide Switch SPDT (pack of 10)', cat: 'Switches', sku: 'SW-SLIDE-SPDT', barcode: '890101300004', price: 160, cost: 70, stock: 50, threshold: 10, icon: 'res', desc: 'Subminiature 3-pin slide switch for battery power switching, pack of 10' },
  { name: 'Rotary Encoder Module with Push Switch (KY-040)', cat: 'Switches', sku: 'SW-ENC-KY040', barcode: '890101300005', price: 280, cost: 150, stock: 22, threshold: 6, icon: 'chip', desc: '360-degree incremental rotary encoder with integrated momentary push button' },

  // 14. Relays (4)
  { name: 'Songle 5V DC Mini Power Relay SRD-05VDC-SL-C', cat: 'Relays', sku: 'REL-SRD-05V', barcode: '890101400001', price: 140, cost: 70, stock: 50, threshold: 12, icon: 'chip', desc: '5V DC coil SPDT PCB power relay 10A 250VAC' },
  { name: 'Songle 12V DC Mini Power Relay SRD-12VDC-SL-C', cat: 'Relays', sku: 'REL-SRD-12V', barcode: '890101400002', price: 140, cost: 70, stock: 42, threshold: 10, icon: 'chip', desc: '12V DC coil SPDT PCB power relay 10A 250VAC' },
  { name: 'Solid State Relay Module SSR-25DA (3-32V DC to 24-380V AC)', cat: 'Relays', sku: 'REL-SSR-25DA', barcode: '890101400003', price: 1450, cost: 980, stock: 7, threshold: 4, icon: 'chip', desc: 'Optically isolated AC solid state relay 25A with LED status indicator' },
  { name: '8-Channel 5V Relay Interface Board with Opto-Isolation', cat: 'Relays', sku: 'REL-MOD-8CH', barcode: '890101400004', price: 1350, cost: 890, stock: 5, threshold: 4, icon: 'chip', desc: '8-channel relay board suitable for home automation and industrial control' },

  // 15. Displays (6)
  { name: '16x2 Character LCD Display (Blue Backlight)', cat: 'Displays', sku: 'DISP-LCD16X2-B', barcode: '890101500001', price: 780, cost: 520, stock: 0, threshold: 5, icon: 'disp', desc: '16 characters by 2 lines alphanumeric display with blue backlight (Currently Out of Stock)' },
  { name: '16x2 Character LCD Display with I2C Backpack Soldered', cat: 'Displays', sku: 'DISP-LCD16X2-I2C', barcode: '890101500002', price: 980, cost: 650, stock: 16, threshold: 6, icon: 'disp', desc: '1602 LCD pre-soldered with PCF8574 I2C daughterboard for plug-and-play wiring' },
  { name: '20x4 Character LCD Display with I2C Backpack', cat: 'Displays', sku: 'DISP-LCD20X4-I2C', barcode: '890101500003', price: 1850, cost: 1250, stock: 8, threshold: 4, icon: 'disp', desc: 'Large 20 characters by 4 lines high contrast display with I2C interface' },
  { name: '0.96 inch I2C OLED Display 128x64 (Blue)', cat: 'Displays', sku: 'DISP-OLED-096B', barcode: '890101500004', price: 920, cost: 600, stock: 24, threshold: 8, icon: 'disp', desc: 'Self-luminous monochrome graphical OLED display with SSD1306 driver chip' },
  { name: '1.8 inch SPI TFT Color Display ST7735 128x160', cat: 'Displays', sku: 'DISP-TFT-18', barcode: '890101500005', price: 1450, cost: 980, stock: 11, threshold: 5, icon: 'disp', desc: 'Full color 18-bit RGB TFT screen with integrated micro SD slot' },
  { name: 'TM1637 4-Digit 7-Segment LED Display Module', cat: 'Displays', sku: 'DISP-TM1637-RED', barcode: '890101500006', price: 420, cost: 240, stock: 20, threshold: 6, icon: 'disp', desc: '0.36 inch 4-digit red clock tube display controlled via 2-wire serial protocol' },

  // 16. Motors (5)
  { name: 'SG90 9g Micro Servo Motor 180°', cat: 'Motors', sku: 'MOT-SG90', barcode: '890101600001', price: 420, cost: 240, stock: 45, threshold: 10, icon: 'chip', desc: 'Lightweight high-output miniature servo motor with horns and mounting screws' },
  { name: 'MG996R High Torque Metal Gear Servo Motor', cat: 'Motors', sku: 'MOT-MG996R', barcode: '890101600002', price: 1650, cost: 1100, stock: 14, threshold: 5, icon: 'chip', desc: 'Full metal gearing continuous/standard servo for robotic arms and steering' },
  { name: '28BYJ-48 5V Stepper Motor + ULN2003 Driver Board Kit', cat: 'Motors', sku: 'MOT-STEP-28BYJ', barcode: '890101600003', price: 650, cost: 390, stock: 22, threshold: 6, icon: 'chip', desc: '4-phase 5-wire reduction stepper motor with matching driver board' },
  { name: 'NEMA 17 Bipolar Stepper Motor 42BYGHW', cat: 'Motors', sku: 'MOT-NEMA17', barcode: '890101600004', price: 3400, cost: 2400, stock: 8, threshold: 4, icon: 'chip', desc: '1.8° step angle 42mm stepper motor for 3D printers and CNC machines' },
  { name: 'TT Geared DC Motor with Rubber Wheel', cat: 'Motors', sku: 'MOT-TT-WHEEL', barcode: '890101600005', price: 420, cost: 240, stock: 30, threshold: 8, icon: 'chip', desc: 'Dual-shaft 3-6V DC gear motor with 65mm rubber tire for robotic cars' },

  // 17. Motor Drivers (5)
  { name: 'L298N Dual H-Bridge DC Motor Driver Module', cat: 'Motor Drivers', sku: 'DRV-L298N', barcode: '890101700001', price: 680, cost: 420, stock: 26, threshold: 6, icon: 'chip', desc: 'Dual H-Bridge motor driver board for two DC motors or one 4-wire stepper' },
  { name: 'L293D Quadruple High-Current Half-H Drivers (DIP-16)', cat: 'Motor Drivers', sku: 'DRV-L293D', barcode: '890101700002', price: 210, cost: 110, stock: 35, threshold: 10, icon: 'chip', desc: 'Push-pull 4-channel motor driver IC capable of driving currents up to 600mA' },
  { name: 'A4988 Stepper Motor Driver with Heat Sink', cat: 'Motor Drivers', sku: 'DRV-A4988', barcode: '890101700003', price: 350, cost: 190, stock: 40, threshold: 10, icon: 'chip', desc: 'Microstepping bipolar stepper driver module with built-in translator' },
  { name: 'DRV8825 High Current Stepper Motor Driver', cat: 'Motor Drivers', sku: 'DRV-DRV8825', barcode: '890101700004', price: 480, cost: 270, stock: 28, threshold: 8, icon: 'chip', desc: 'Upgraded stepper driver supporting up to 1/32 microstepping and 2.5A peak current' },
  { name: 'TB6600 4A 9-42V Micro-Step Stepper Motor Driver', cat: 'Motor Drivers', sku: 'DRV-TB6600', barcode: '890101700005', price: 2200, cost: 1550, stock: 9, threshold: 4, icon: 'chip', desc: 'Industrial enclosed stepper motor driver for NEMA 17, 23 stepper motors' },

  // 18. Power Supplies (6)
  { name: 'MB102 Breadboard Power Supply Module 3.3V / 5V', cat: 'Power Supplies', sku: 'PWR-MB102', barcode: '890101800001', price: 350, cost: 190, stock: 35, threshold: 8, icon: 'disp', desc: 'Plugs directly into MB102 breadboard power rails, selectable 3.3V and 5V outputs' },
  { name: '12V 2A DC Switching Power Adapter UK Plug', cat: 'Power Supplies', sku: 'PWR-ADAPT-12V2A', barcode: '890101800002', price: 1150, cost: 750, stock: 18, threshold: 5, icon: 'disp', desc: 'Regulated 12V 2000mA switching power supply with 2.1mm center positive plug' },
  { name: '5V 2.5A Micro USB Wall Power Supply', cat: 'Power Supplies', sku: 'PWR-ADAPT-5V2A', barcode: '890101800003', price: 950, cost: 580, stock: 22, threshold: 6, icon: 'disp', desc: 'Stable 5V power supply ideal for Raspberry Pi and development boards' },
  { name: '18650 Dual Battery Holder with Lead Wires (7.4V)', cat: 'Power Supplies', sku: 'PWR-HOLDER-18650-2', barcode: '890101800004', price: 180, cost: 85, stock: 45, threshold: 10, icon: 'disp', desc: 'Series battery case for two 18650 Li-Ion cells outputting 7.4V' },
  { name: '9V Battery Snap Connector with 2.1mm DC Barrel Plug', cat: 'Power Supplies', sku: 'PWR-9V-DCJACK', barcode: '890101800005', price: 120, cost: 45, stock: 60, threshold: 15, icon: 'disp', desc: 'Enables powering Arduino directly from standard 9V PP3 battery' },
  { name: '18650 3.7V 2600mAh Rechargeable Li-Ion Cell', cat: 'Power Supplies', sku: 'PWR-BATT-18650', barcode: '890101800006', price: 850, cost: 550, stock: 25, threshold: 8, icon: 'disp', desc: 'High capacity grade-A cylindrical lithium-ion battery cell' },

  // 19. Cables (6)
  { name: '40-Pin Male to Male Jumper Wires 20cm', cat: 'Cables', sku: 'CAB-MM-20CM', barcode: '890101900001', price: 250, cost: 110, stock: 70, threshold: 15, icon: 'disp', desc: 'Multicolor ribbon cable separable into individual 1-pin male-to-male wires' },
  { name: '40-Pin Male to Female Jumper Wires 20cm', cat: 'Cables', sku: 'CAB-MF-20CM', barcode: '890101900002', price: 250, cost: 110, stock: 68, threshold: 15, icon: 'disp', desc: 'Standard prototype interconnection wires for sensors to MCU pins' },
  { name: '40-Pin Female to Female Jumper Wires 20cm', cat: 'Cables', sku: 'CAB-FF-20CM', barcode: '890101900003', price: 250, cost: 110, stock: 55, threshold: 15, icon: 'disp', desc: 'Female-to-female DuPont jumper wire ribbon cable' },
  { name: 'USB 2.0 Type A to Type B Cable (Arduino Cable 50cm)', cat: 'Cables', sku: 'CAB-USB-AB', barcode: '890101900004', price: 280, cost: 130, stock: 40, threshold: 10, icon: 'disp', desc: 'Standard blue programming cable for Arduino UNO and Mega boards' },
  { name: 'USB Type A to Micro USB High Speed Data Cable 1m', cat: 'Cables', sku: 'CAB-USB-MICRO', barcode: '890101900005', price: 290, cost: 140, stock: 35, threshold: 10, icon: 'disp', desc: 'Braided data transfer and programming cable for NodeMCU and ESP32' },
  { name: 'Solid Core Hookup Wire Spool 22AWG (Black 5m)', cat: 'Cables', sku: 'CAB-HOOKUP-BLK', barcode: '890101900006', price: 220, cost: 95, stock: 30, threshold: 8, icon: 'disp', desc: 'Solid tinned copper wire perfectly sized for breadboard jumpers' },

  // 20. Breadboards & Prototyping (5)
  { name: 'MB-102 Solderless Breadboard 830 Tie-Points', cat: 'Breadboards', sku: 'PROT-BB-830', barcode: '890102000001', price: 450, cost: 260, stock: 31, threshold: 10, icon: 'disp', desc: 'Full-size solderless breadboard with color coordinate rails and adhesive backing' },
  { name: 'Half-Size Solderless Breadboard 400 Tie-Points', cat: 'Breadboards', sku: 'PROT-BB-400', barcode: '890102000002', price: 280, cost: 150, stock: 45, threshold: 10, icon: 'disp', desc: 'Compact 400-point breadboard with interlocking tabs' },
  { name: 'Mini Solderless Breadboard 170 Points (Assorted Colors)', cat: 'Breadboards', sku: 'PROT-BB-170', barcode: '890102000003', price: 140, cost: 65, stock: 60, threshold: 15, icon: 'disp', desc: 'Tiny 170 tie-point breadboard for small sensor modules and shield stacks' },
  { name: 'Double-Sided Universal Prototype PCB 5x7cm (pack of 5)', cat: 'Breadboards', sku: 'PROT-PCB-5X7', barcode: '890102000004', price: 450, cost: 220, stock: 30, threshold: 8, icon: 'disp', desc: 'Glass fiber FR-4 double-sided plated through-hole proto boards, pack of 5' },
  { name: 'Double-Sided Universal Prototype PCB 7x9cm (pack of 3)', cat: 'Breadboards', sku: 'PROT-PCB-7X9', barcode: '890102000005', price: 490, cost: 250, stock: 20, threshold: 6, icon: 'disp', desc: 'FR-4 perfboard with 2.54mm grid for permanent DIY circuit soldering' },

  // 21. Electronic Accessories (6)
  { name: '28-Pin Narrow DIP IC Sockets (pack of 10)', cat: 'Electronic Accessories', sku: 'ACC-SKT-DIP28', barcode: '890102100001', price: 200, cost: 85, stock: 45, threshold: 10, icon: 'chip', desc: 'Dual-leaf solder tail IC sockets for ATmega328P chips, pack of 10' },
  { name: 'Heat Shrink Tubing Assortment Box (127 Pieces)', cat: 'Electronic Accessories', sku: 'ACC-HEATSHRINK', barcode: '890102100002', price: 580, cost: 320, stock: 24, threshold: 6, icon: 'disp', desc: '2:1 polyolefin flame retardant shrink tube kit in assorted diameters' },
  { name: 'High-Grade Rosin Core Solder Wire 63/37 0.8mm (50g)', cat: 'Electronic Accessories', sku: 'ACC-SOLDER-50G', barcode: '890102100003', price: 950, cost: 620, stock: 18, threshold: 6, icon: 'disp', desc: 'Tin/lead 63/37 fast melting electrical solder spool with flux core' },
  { name: 'Copper Desoldering Braid Wick 2.0mm (1.5m)', cat: 'Electronic Accessories', sku: 'ACC-WICK-2MM', barcode: '890102100004', price: 240, cost: 110, stock: 35, threshold: 8, icon: 'disp', desc: 'Oxygen-free pure copper braided wick with non-corrosive rosin flux' },
  { name: 'Anti-Static ESD-15 Curved Fine Tip Tweezers', cat: 'Electronic Accessories', sku: 'ACC-TWEEZER-15', barcode: '890102100005', price: 320, cost: 160, stock: 25, threshold: 8, icon: 'disp', desc: 'Non-magnetic stainless steel curved precision tweezers for SMD parts' },
  { name: 'Aluminum TO-220 Transistor Heatsink with Screw Kit (pack of 5)', cat: 'Electronic Accessories', sku: 'ACC-HEATSINK-TO220', barcode: '890102100006', price: 250, cost: 110, stock: 40, threshold: 10, icon: 'disp', desc: 'Anodized black aluminum cooling fin heat sink with insulator pads' }
];

module.exports = {
  categories,
  users,
  customers,
  settings,
  products
};
