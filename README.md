# Electrical Circuit Calculator

A comprehensive web application for electrical engineering calculations. This application allows users to calculate various electrical properties and solve complex circuit problems for both AC and DC circuits.

## Features

### Basic Calculator
- Calculate Power (P) using Voltage and Current
- Calculate Resistance (R) using Voltage and Current (Ohm's Law)
- Calculate Voltage (V) using Power and Current
- Calculate Current (I) using Power and Voltage
- Calculate Energy (W) using Power and Time

### Advanced Circuit Solver
- **DC Circuit Analysis**:
  - Series Resistor Circuits
  - Parallel Resistor Circuits
  - Voltage Divider Circuits
  - Calculate total resistance, current, voltage drops, and power

- **AC Circuit Analysis**:
  - RC Circuit Analysis (resistor-capacitor)
  - RL Circuit Analysis (resistor-inductor)
  - RLC Circuit Analysis (resistor-inductor-capacitor)
  - Calculate impedance, phase angle, power factor, reactive power, and resonant frequency

## Installation

1. Make sure you have Python installed (Python 3.6 or higher recommended)

2. Clone this repository:
   ```
   git clone https://github.com/yourusername/electrical-calculator.git
   cd electrical-calculator
   ```

3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

## Running the Application

1. Start the Flask development server:
   ```
   python app.py
   ```

2. Open your web browser and navigate to:
   ```
   http://127.0.0.1:5000/
   ```

## Formulas Used

### Basic Calculations
- **Power**: P = V × I (Voltage × Current)
- **Resistance**: R = V / I (Voltage / Current)
- **Voltage**: V = P / I (Power / Current)
- **Current**: I = P / V (Power / Voltage)
- **Energy**: W = P × t (Power × Time)

### DC Circuits
- **Series Resistance**: Rtotal = R₁ + R₂ + ... + Rₙ
- **Parallel Resistance**: 1/Rtotal = 1/R₁ + 1/R₂ + ... + 1/Rₙ
- **Voltage Divider**: Vout = Vin × (R₂ / (R₁ + R₂))
- **Current Divider**: I₁ = I × (R₂ / (R₁ + R₂))

### AC Circuits
- **Impedance (RC)**: Z = √(R² + Xc²)
- **Impedance (RL)**: Z = √(R² + XL²)
- **Impedance (RLC)**: Z = √(R² + (XL + Xc)²)
- **Capacitive Reactance**: Xc = -1/(2πfC)
- **Inductive Reactance**: XL = 2πfL
- **Real Power**: P = V × I × cos(θ)
- **Reactive Power**: Q = V × I × sin(θ)
- **Apparent Power**: S = V × I
- **Power Factor**: PF = cos(θ)
- **Resonant Frequency**: f₀ = 1/(2π√(LC))
- **RC Time Constant**: τ = RC
- **RL Time Constant**: τ = L/R

## Technologies Used

- Python with Flask for the backend
- HTML, CSS, and JavaScript for the frontend
- No external JavaScript libraries (pure vanilla JS)

## License

This project is open source and available for educational purposes. 