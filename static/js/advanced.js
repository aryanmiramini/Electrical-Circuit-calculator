document.addEventListener('DOMContentLoaded', function() {
    // Tabs functionality
    const tabs = document.querySelectorAll('.tab');
    const panels = document.querySelectorAll('.panel');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const targetPanel = this.dataset.tab;
            
            // Update active tab
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // Update active panel
            panels.forEach(p => p.classList.remove('active'));
            if (targetPanel === 'dc') {
                document.getElementById('dc-panel').classList.add('active');
            } else {
                document.getElementById('ac-panel').classList.add('active');
            }
        });
    });
    
    // DC Configuration change handling
    const dcConfiguration = document.getElementById('dc-configuration');
    const seriesParallelConfig = document.getElementById('series-parallel-config');
    const voltageDividerConfig = document.getElementById('voltage-divider-config');
    
    dcConfiguration.addEventListener('change', function() {
        if (this.value === 'voltage_divider') {
            seriesParallelConfig.style.display = 'none';
            voltageDividerConfig.style.display = 'block';
        } else {
            seriesParallelConfig.style.display = 'block';
            voltageDividerConfig.style.display = 'none';
        }
    });
    
    // AC Configuration change handling
    const acConfiguration = document.getElementById('ac-configuration');
    const capacitanceGroup = document.getElementById('capacitance-group');
    const inductanceGroup = document.getElementById('inductance-group');
    
    acConfiguration.addEventListener('change', function() {
        if (this.value === 'rc') {
            capacitanceGroup.style.display = 'block';
            inductanceGroup.style.display = 'none';
        } else if (this.value === 'rl') {
            capacitanceGroup.style.display = 'none';
            inductanceGroup.style.display = 'block';
        } else if (this.value === 'rlc') {
            capacitanceGroup.style.display = 'block';
            inductanceGroup.style.display = 'block';
        }
    });
    
    // Add/Remove resistor functionality
    const resistorsContainer = document.getElementById('resistors-container');
    const addResistorButton = document.querySelector('.add-resistor');
    
    addResistorButton.addEventListener('click', function() {
        const resistorRow = document.createElement('div');
        resistorRow.className = 'resistor-row';
        resistorRow.innerHTML = `
            <input type="number" class="resistor-input" placeholder="Resistance in Ohms" step="0.1">
            <button class="remove-resistor">✕</button>
        `;
        resistorsContainer.appendChild(resistorRow);
        
        // Add event listener to the new remove button
        const newRemoveButton = resistorRow.querySelector('.remove-resistor');
        newRemoveButton.addEventListener('click', function() {
            if (resistorsContainer.children.length > 1) {
                resistorsContainer.removeChild(resistorRow);
            }
        });
    });
    
    // Initial event listeners for remove buttons
    document.querySelectorAll('.remove-resistor').forEach(button => {
        button.addEventListener('click', function() {
            if (resistorsContainer.children.length > 1) {
                resistorsContainer.removeChild(this.parentElement);
            }
        });
    });
    
    // DC Circuit Solver
    const solveDcButton = document.getElementById('solve-dc');
    const dcResults = document.getElementById('dc-results');
    const dcResultsContent = document.getElementById('dc-results-content');
    const dcFormulas = document.getElementById('dc-formulas');
    const dcError = document.getElementById('dc-error');
    const dcLoading = document.getElementById('dc-loading');
    
    solveDcButton.addEventListener('click', async function() {
        // Hide previous results and errors
        dcResults.style.display = 'none';
        dcError.style.display = 'none';
        dcLoading.style.display = 'block';
        
        try {
            const configuration = dcConfiguration.value;
            const voltage = parseFloat(document.getElementById('dc-voltage').value);
            
            if (isNaN(voltage)) {
                throw new Error('Please enter a valid voltage value');
            }
            
            let data = {
                circuit_type: 'dc',
                configuration: configuration,
                voltage_source: voltage
            };
            
            if (configuration === 'series' || configuration === 'parallel') {
                const resistorInputs = document.querySelectorAll('.resistor-input');
                const resistances = [];
                
                resistorInputs.forEach(input => {
                    const value = parseFloat(input.value);
                    if (!isNaN(value)) {
                        resistances.push(value);
                    }
                });
                
                if (resistances.length < 1) {
                    throw new Error('Please enter at least one resistance value');
                }
                
                data.resistances = resistances;
            } else if (configuration === 'voltage_divider') {
                const r1 = parseFloat(document.getElementById('r1-divider').value);
                const r2 = parseFloat(document.getElementById('r2-divider').value);
                
                if (isNaN(r1) || isNaN(r2)) {
                    throw new Error('Please enter valid resistance values for R1 and R2');
                }
                
                data.r1 = r1;
                data.r2 = r2;
            }
            
            const response = await fetch('/solve_circuit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            
            const result = await response.json();
            
            if (response.ok) {
                // Display results
                displayDcResults(result, configuration);
                dcResults.style.display = 'block';
            } else {
                throw new Error(result.error || 'An error occurred during calculation');
            }
        } catch (error) {
            dcError.textContent = error.message;
            dcError.style.display = 'block';
        } finally {
            dcLoading.style.display = 'none';
        }
    });
    
    function displayDcResults(data, configuration) {
        const results = data.results;
        const formulas = data.formulas;
        
        let resultsHtml = '<table class="result-table">';
        
        if (configuration === 'series') {
            resultsHtml += `
                <tr><th>Total Resistance</th><td>${results.total_resistance.toFixed(3)} Ω</td></tr>
                <tr><th>Circuit Current</th><td>${results.current.toFixed(3)} A</td></tr>
                <tr><th>Total Power</th><td>${results.total_power.toFixed(3)} W</td></tr>
            `;
            
            resultsHtml += '</table><h4>Individual Components:</h4><table class="result-table">';
            resultsHtml += '<tr><th>Component</th><th>Resistance (Ω)</th><th>Voltage (V)</th><th>Power (W)</th></tr>';
            
            for (let i = 0; i < results.voltage_drops.length; i++) {
                resultsHtml += `
                    <tr>
                        <td>R${i+1}</td>
                        <td>${results.resistances ? results.resistances[i].toFixed(3) : '—'}</td>
                        <td>${results.voltage_drops[i].toFixed(3)}</td>
                        <td>${results.powers[i].toFixed(3)}</td>
                    </tr>
                `;
            }
        } else if (configuration === 'parallel') {
            resultsHtml += `
                <tr><th>Total Resistance</th><td>${results.total_resistance.toFixed(3)} Ω</td></tr>
                <tr><th>Total Current</th><td>${results.total_current.toFixed(3)} A</td></tr>
                <tr><th>Total Power</th><td>${results.total_power.toFixed(3)} W</td></tr>
            `;
            
            resultsHtml += '</table><h4>Individual Components:</h4><table class="result-table">';
            resultsHtml += '<tr><th>Component</th><th>Resistance (Ω)</th><th>Current (A)</th><th>Power (W)</th></tr>';
            
            for (let i = 0; i < results.branch_currents.length; i++) {
                resultsHtml += `
                    <tr>
                        <td>R${i+1}</td>
                        <td>${results.resistances ? results.resistances[i].toFixed(3) : '—'}</td>
                        <td>${results.branch_currents[i].toFixed(3)}</td>
                        <td>${results.powers[i].toFixed(3)}</td>
                    </tr>
                `;
            }
        } else if (configuration === 'voltage_divider') {
            resultsHtml += `
                <tr><th>Input Voltage</th><td>${document.getElementById('dc-voltage').value} V</td></tr>
                <tr><th>Output Voltage (across R2)</th><td>${results.output_voltage.toFixed(3)} V</td></tr>
                <tr><th>Current</th><td>${results.current.toFixed(3)} A</td></tr>
                <tr><th>Total Resistance</th><td>${results.total_resistance.toFixed(3)} Ω</td></tr>
                <tr><th>Power through R1</th><td>${results.power_r1.toFixed(3)} W</td></tr>
                <tr><th>Power through R2</th><td>${results.power_r2.toFixed(3)} W</td></tr>
                <tr><th>Total Power</th><td>${results.total_power.toFixed(3)} W</td></tr>
            `;
        }
        
        resultsHtml += '</table>';
        dcResultsContent.innerHTML = resultsHtml;
        
        // Display formulas
        let formulasHtml = '<ul>';
        for (const key in formulas) {
            formulasHtml += `<li><strong>${key}:</strong> ${formulas[key]}</li>`;
        }
        formulasHtml += '</ul>';
        dcFormulas.innerHTML = formulasHtml;
    }
    
    // AC Circuit Solver
    const solveAcButton = document.getElementById('solve-ac');
    const acResults = document.getElementById('ac-results');
    const acResultsContent = document.getElementById('ac-results-content');
    const acFormulas = document.getElementById('ac-formulas');
    const acError = document.getElementById('ac-error');
    const acLoading = document.getElementById('ac-loading');
    
    solveAcButton.addEventListener('click', async function() {
        // Hide previous results and errors
        acResults.style.display = 'none';
        acError.style.display = 'none';
        acLoading.style.display = 'block';
        
        try {
            const configuration = acConfiguration.value;
            const voltage = parseFloat(document.getElementById('ac-voltage').value);
            const frequency = parseFloat(document.getElementById('ac-frequency').value);
            const resistance = parseFloat(document.getElementById('ac-resistance').value);
            
            if (isNaN(voltage) || isNaN(frequency) || isNaN(resistance)) {
                throw new Error('Please enter valid values for voltage, frequency and resistance');
            }
            
            if (frequency <= 0) {
                throw new Error('Frequency must be greater than 0');
            }
            
            let data = {
                circuit_type: 'ac',
                configuration: configuration,
                voltage_source: voltage,
                frequency: frequency,
                resistance: resistance
            };
            
            if (configuration === 'rc' || configuration === 'rlc') {
                const capacitance = parseFloat(document.getElementById('ac-capacitance').value);
                
                if (isNaN(capacitance) || capacitance <= 0) {
                    throw new Error('Please enter a valid capacitance value greater than 0');
                }
                
                data.capacitance = capacitance;
            }
            
            if (configuration === 'rl' || configuration === 'rlc') {
                const inductance = parseFloat(document.getElementById('ac-inductance').value);
                
                if (isNaN(inductance) || inductance <= 0) {
                    throw new Error('Please enter a valid inductance value greater than 0');
                }
                
                data.inductance = inductance;
            }
            
            const response = await fetch('/solve_circuit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            
            const result = await response.json();
            
            if (response.ok) {
                // Display results
                displayAcResults(result, configuration);
                acResults.style.display = 'block';
            } else {
                throw new Error(result.error || 'An error occurred during calculation');
            }
        } catch (error) {
            acError.textContent = error.message;
            acError.style.display = 'block';
        } finally {
            acLoading.style.display = 'none';
        }
    });
    
    function displayAcResults(data, configuration) {
        const results = data.results;
        const formulas = data.formulas;
        
        let resultsHtml = '<table class="result-table">';
        
        resultsHtml += `
            <tr><th>Impedance (Z)</th><td>${results.impedance.toFixed(3)} Ω</td></tr>
            <tr><th>Phase Angle</th><td>${results.phase_angle.toFixed(2)}°</td></tr>
            <tr><th>Current</th><td>${results.current.toFixed(3)} A</td></tr>
            <tr><th>Power Factor</th><td>${results.power_factor.toFixed(3)}</td></tr>
            <tr><th>Real Power (P)</th><td>${results.real_power.toFixed(3)} W</td></tr>
            <tr><th>Reactive Power (Q)</th><td>${results.reactive_power.toFixed(3)} VAR</td></tr>
            <tr><th>Apparent Power (S)</th><td>${results.apparent_power.toFixed(3)} VA</td></tr>
        `;
        
        if (configuration === 'rc' || configuration === 'rl') {
            resultsHtml += `<tr><th>Time Constant (τ)</th><td>${results.time_constant.toFixed(6)} s</td></tr>`;
        }
        
        if (configuration === 'rc') {
            resultsHtml += `
                <tr><th>Voltage across Resistor</th><td>${results.voltage_r.toFixed(3)} V</td></tr>
                <tr><th>Voltage across Capacitor</th><td>${results.voltage_c.toFixed(3)} V</td></tr>
            `;
        } else if (configuration === 'rl') {
            resultsHtml += `
                <tr><th>Voltage across Resistor</th><td>${results.voltage_r.toFixed(3)} V</td></tr>
                <tr><th>Voltage across Inductor</th><td>${results.voltage_l.toFixed(3)} V</td></tr>
            `;
        } else if (configuration === 'rlc') {
            resultsHtml += `
                <tr><th>Voltage across Resistor</th><td>${results.voltage_r.toFixed(3)} V</td></tr>
                <tr><th>Voltage across Inductor</th><td>${results.voltage_l.toFixed(3)} V</td></tr>
                <tr><th>Voltage across Capacitor</th><td>${results.voltage_c.toFixed(3)} V</td></tr>
                <tr><th>Resonant Frequency</th><td>${results.resonant_frequency.toFixed(3)} Hz</td></tr>
            `;
        }
        
        resultsHtml += '</table>';
        acResultsContent.innerHTML = resultsHtml;
        
        // Display formulas
        let formulasHtml = '<ul>';
        for (const key in formulas) {
            formulasHtml += `<li><strong>${key}:</strong> ${formulas[key]}</li>`;
        }
        formulasHtml += '</ul>';
        acFormulas.innerHTML = formulasHtml;
    }
}); 