from flask import Flask, render_template, request, jsonify, url_for
import math
import cmath

app = Flask(__name__, static_folder='static')

def calculate_power(voltage, current):
    """Calculate power using P = V * I"""
    return voltage * current

def calculate_resistance(voltage, current):
    """Calculate resistance using R = V / I (Ohm's Law)"""
    if current == 0:
        return None
    return voltage / current

def calculate_voltage(power, current):
    """Calculate voltage using V = P / I"""
    if current == 0:
        return None
    return power / current

def calculate_current(power, voltage):
    """Calculate current using I = P / V"""
    if voltage == 0:
        return None
    return power / voltage

def calculate_energy(power, time):
    """Calculate energy using W = P * t"""
    return power * time

# Advanced circuit calculations
def calculate_series_resistance(resistances):
    """Calculate total resistance in series"""
    return sum(resistances)

def calculate_parallel_resistance(resistances):
    """Calculate total resistance in parallel"""
    if any(r == 0 for r in resistances):
        return 0
    return 1 / sum(1/r for r in resistances)

def calculate_impedance(resistance, reactance):
    """Calculate impedance Z = R + jX"""
    return complex(resistance, reactance)

def calculate_reactance_capacitor(frequency, capacitance):
    """Calculate capacitive reactance Xc = -1/(2πfC)"""
    if frequency == 0 or capacitance == 0:
        return float('inf')
    return -1 / (2 * math.pi * frequency * capacitance)

def calculate_reactance_inductor(frequency, inductance):
    """Calculate inductive reactance XL = 2πfL"""
    return 2 * math.pi * frequency * inductance

def calculate_ac_power(vrms, irms, phase_angle):
    """Calculate AC power
    S = Vrms * Irms (apparent power)
    P = S * cos(θ) (real power)
    Q = S * sin(θ) (reactive power)
    """
    apparent_power = vrms * irms
    real_power = apparent_power * math.cos(math.radians(phase_angle))
    reactive_power = apparent_power * math.sin(math.radians(phase_angle))
    return {
        "apparent": apparent_power,
        "real": real_power,
        "reactive": reactive_power,
        "power_factor": math.cos(math.radians(phase_angle))
    }

def calculate_voltage_divider(vin, r1, r2):
    """Calculate voltage across R2 in a voltage divider"""
    return vin * (r2 / (r1 + r2))

def calculate_current_divider(iin, r1, r2):
    """Calculate current through R1 in a current divider"""
    return iin * (r2 / (r1 + r2))

def calculate_rc_time_constant(resistance, capacitance):
    """Calculate RC time constant τ = RC"""
    return resistance * capacitance

def calculate_rl_time_constant(resistance, inductance):
    """Calculate RL time constant τ = L/R"""
    if resistance == 0:
        return float('inf')
    return inductance / resistance

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/advanced')
def advanced():
    return render_template('advanced.html')

@app.route('/calculate', methods=['POST'])
def calculate():
    data = request.json
    calculation_type = data.get('type')
    result = None
    
    try:
        if calculation_type == 'power':
            voltage = float(data.get('voltage', 0))
            current = float(data.get('current', 0))
            result = calculate_power(voltage, current)
            formula = "P = V × I"
            
        elif calculation_type == 'resistance':
            voltage = float(data.get('voltage', 0))
            current = float(data.get('current', 0))
            result = calculate_resistance(voltage, current)
            formula = "R = V / I"
            
        elif calculation_type == 'voltage':
            power = float(data.get('power', 0))
            current = float(data.get('current', 0))
            result = calculate_voltage(power, current)
            formula = "V = P / I"
            
        elif calculation_type == 'current':
            power = float(data.get('power', 0))
            voltage = float(data.get('voltage', 0))
            result = calculate_current(power, voltage)
            formula = "I = P / V"
            
        elif calculation_type == 'energy':
            power = float(data.get('power', 0))
            time = float(data.get('time', 0))
            result = calculate_energy(power, time)
            formula = "W = P × t"
    
        return jsonify({
            'result': result,
            'formula': formula
        })
    except Exception as e:
        return jsonify({
            'error': str(e)
        }), 400

@app.route('/solve_circuit', methods=['POST'])
def solve_circuit():
    data = request.json
    circuit_type = data.get('circuit_type')  # AC or DC
    configuration = data.get('configuration')  # series, parallel, mixed
    
    try:
        results = {}
        formulas = {}
        
        if circuit_type == 'dc':
            # Process DC circuit
            voltage_source = float(data.get('voltage_source', 0))
            resistances = [float(r) for r in data.get('resistances', [])]
            
            if configuration == 'series':
                total_resistance = calculate_series_resistance(resistances)
                current = voltage_source / total_resistance if total_resistance > 0 else 0
                
                # Calculate voltage across each resistor
                voltages = [current * r for r in resistances]
                
                # Calculate power dissipated by each resistor
                powers = [current**2 * r for r in resistances]
                
                results = {
                    'total_resistance': total_resistance,
                    'current': current,
                    'voltage_drops': voltages,
                    'powers': powers,
                    'total_power': sum(powers)
                }
                
                formulas = {
                    'total_resistance': 'Rtotal = R₁ + R₂ + ... + Rₙ',
                    'current': 'I = V / Rtotal',
                    'voltage_drops': 'Vᵢ = I × Rᵢ',
                    'powers': 'Pᵢ = I² × Rᵢ',
                    'total_power': 'Ptotal = V × I'
                }
                
            elif configuration == 'parallel':
                total_resistance = calculate_parallel_resistance(resistances)
                total_current = voltage_source / total_resistance if total_resistance > 0 else 0
                
                # Calculate current through each resistor
                currents = [voltage_source / r if r > 0 else 0 for r in resistances]
                
                # Calculate power dissipated by each resistor
                powers = [(voltage_source**2) / r if r > 0 else 0 for r in resistances]
                
                results = {
                    'total_resistance': total_resistance,
                    'total_current': total_current,
                    'branch_currents': currents,
                    'powers': powers,
                    'total_power': sum(powers)
                }
                
                formulas = {
                    'total_resistance': '1/Rtotal = 1/R₁ + 1/R₂ + ... + 1/Rₙ',
                    'total_current': 'Itotal = V / Rtotal',
                    'branch_currents': 'Iᵢ = V / Rᵢ',
                    'powers': 'Pᵢ = V² / Rᵢ',
                    'total_power': 'Ptotal = V × Itotal'
                }
                
            elif configuration == 'voltage_divider':
                r1 = float(data.get('r1', 0))
                r2 = float(data.get('r2', 0))
                
                v_out = calculate_voltage_divider(voltage_source, r1, r2)
                total_resistance = r1 + r2
                current = voltage_source / total_resistance if total_resistance > 0 else 0
                power_r1 = current**2 * r1
                power_r2 = current**2 * r2
                
                results = {
                    'output_voltage': v_out,
                    'total_resistance': total_resistance,
                    'current': current,
                    'power_r1': power_r1,
                    'power_r2': power_r2,
                    'total_power': power_r1 + power_r2
                }
                
                formulas = {
                    'output_voltage': 'Vout = Vin × (R₂ / (R₁ + R₂))',
                    'total_resistance': 'Rtotal = R₁ + R₂',
                    'current': 'I = Vin / Rtotal',
                    'power': 'P = I² × R'
                }
                
        elif circuit_type == 'ac':
            # Process AC circuit
            voltage_source = float(data.get('voltage_source', 0))
            frequency = float(data.get('frequency', 0))
            
            if configuration == 'rc':
                resistance = float(data.get('resistance', 0))
                capacitance = float(data.get('capacitance', 0)) * 1e-6  # Convert from μF to F
                
                xc = calculate_reactance_capacitor(frequency, capacitance)
                z_magnitude = math.sqrt(resistance**2 + xc**2)
                phase_angle = math.degrees(math.atan2(xc, resistance))
                
                current = voltage_source / z_magnitude if z_magnitude > 0 else 0
                
                voltage_r = current * resistance
                voltage_c = current * abs(xc)
                
                power_data = calculate_ac_power(voltage_source, current, -phase_angle)
                
                time_constant = calculate_rc_time_constant(resistance, capacitance)
                
                results = {
                    'impedance': z_magnitude,
                    'phase_angle': phase_angle,
                    'current': current,
                    'voltage_r': voltage_r,
                    'voltage_c': voltage_c,
                    'real_power': power_data['real'],
                    'reactive_power': power_data['reactive'],
                    'apparent_power': power_data['apparent'],
                    'power_factor': power_data['power_factor'],
                    'time_constant': time_constant
                }
                
                formulas = {
                    'impedance': 'Z = √(R² + Xc²)',
                    'reactance': 'Xc = -1/(2πfC)',
                    'phase_angle': 'θ = tan⁻¹(Xc/R)',
                    'current': 'I = V / Z',
                    'real_power': 'P = V × I × cos(θ)',
                    'reactive_power': 'Q = V × I × sin(θ)',
                    'apparent_power': 'S = V × I',
                    'time_constant': 'τ = RC'
                }
                
            elif configuration == 'rl':
                resistance = float(data.get('resistance', 0))
                inductance = float(data.get('inductance', 0)) * 1e-3  # Convert from mH to H
                
                xl = calculate_reactance_inductor(frequency, inductance)
                z_magnitude = math.sqrt(resistance**2 + xl**2)
                phase_angle = math.degrees(math.atan2(xl, resistance))
                
                current = voltage_source / z_magnitude if z_magnitude > 0 else 0
                
                voltage_r = current * resistance
                voltage_l = current * xl
                
                power_data = calculate_ac_power(voltage_source, current, phase_angle)
                
                time_constant = calculate_rl_time_constant(resistance, inductance)
                
                results = {
                    'impedance': z_magnitude,
                    'phase_angle': phase_angle,
                    'current': current,
                    'voltage_r': voltage_r,
                    'voltage_l': voltage_l,
                    'real_power': power_data['real'],
                    'reactive_power': power_data['reactive'],
                    'apparent_power': power_data['apparent'],
                    'power_factor': power_data['power_factor'],
                    'time_constant': time_constant
                }
                
                formulas = {
                    'impedance': 'Z = √(R² + XL²)',
                    'reactance': 'XL = 2πfL',
                    'phase_angle': 'θ = tan⁻¹(XL/R)',
                    'current': 'I = V / Z',
                    'real_power': 'P = V × I × cos(θ)',
                    'reactive_power': 'Q = V × I × sin(θ)',
                    'apparent_power': 'S = V × I',
                    'time_constant': 'τ = L/R'
                }
                
            elif configuration == 'rlc':
                resistance = float(data.get('resistance', 0))
                inductance = float(data.get('inductance', 0)) * 1e-3  # Convert from mH to H
                capacitance = float(data.get('capacitance', 0)) * 1e-6  # Convert from μF to F
                
                xl = calculate_reactance_inductor(frequency, inductance)
                xc = calculate_reactance_capacitor(frequency, capacitance)
                
                # Net reactance
                x_net = xl + xc  # Xc is negative
                
                z_magnitude = math.sqrt(resistance**2 + x_net**2)
                phase_angle = math.degrees(math.atan2(x_net, resistance))
                
                current = voltage_source / z_magnitude if z_magnitude > 0 else 0
                
                voltage_r = current * resistance
                voltage_l = current * xl
                voltage_c = current * abs(xc)
                
                power_data = calculate_ac_power(voltage_source, current, phase_angle)
                
                # Resonant frequency
                if inductance > 0 and capacitance > 0:
                    resonant_frequency = 1 / (2 * math.pi * math.sqrt(inductance * capacitance))
                else:
                    resonant_frequency = 0
                
                results = {
                    'impedance': z_magnitude,
                    'phase_angle': phase_angle,
                    'current': current,
                    'voltage_r': voltage_r,
                    'voltage_l': voltage_l,
                    'voltage_c': voltage_c,
                    'real_power': power_data['real'],
                    'reactive_power': power_data['reactive'],
                    'apparent_power': power_data['apparent'],
                    'power_factor': power_data['power_factor'],
                    'resonant_frequency': resonant_frequency
                }
                
                formulas = {
                    'impedance': 'Z = √(R² + (XL + Xc)²)',
                    'inductive_reactance': 'XL = 2πfL',
                    'capacitive_reactance': 'Xc = -1/(2πfC)',
                    'phase_angle': 'θ = tan⁻¹((XL+Xc)/R)',
                    'current': 'I = V / Z',
                    'real_power': 'P = V × I × cos(θ)',
                    'reactive_power': 'Q = V × I × sin(θ)',
                    'apparent_power': 'S = V × I',
                    'resonant_frequency': 'f₀ = 1/(2π√(LC))'
                }
        
        return jsonify({
            'results': results,
            'formulas': formulas
        })
    except Exception as e:
        return jsonify({
            'error': str(e)
        }), 400

if __name__ == '__main__':
    app.run(debug=True) 