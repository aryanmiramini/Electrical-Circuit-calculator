document.addEventListener('DOMContentLoaded', function() {
    const calculationType = document.getElementById('calculation-type');
    const calculateBtn = document.getElementById('calculate-btn');
    const resultContainer = document.getElementById('result-container');
    const resultValue = document.getElementById('result-value');
    const formulaElement = document.getElementById('formula');
    const errorMessage = document.getElementById('error-message');
    
    // Field containers
    const powerFields = document.getElementById('power-fields');
    const resistanceFields = document.getElementById('resistance-fields');
    const voltageFields = document.getElementById('voltage-fields');
    const currentFields = document.getElementById('current-fields');
    const energyFields = document.getElementById('energy-fields');
    
    calculationType.addEventListener('change', function() {
        // Hide all field containers
        powerFields.style.display = 'none';
        resistanceFields.style.display = 'none';
        voltageFields.style.display = 'none';
        currentFields.style.display = 'none';
        energyFields.style.display = 'none';
        
        // Show the selected field container
        switch(this.value) {
            case 'power':
                powerFields.style.display = 'grid';
                break;
            case 'resistance':
                resistanceFields.style.display = 'grid';
                break;
            case 'voltage':
                voltageFields.style.display = 'grid';
                break;
            case 'current':
                currentFields.style.display = 'grid';
                break;
            case 'energy':
                energyFields.style.display = 'grid';
                break;
        }
        
        // Hide result and error when changing calculation type
        resultContainer.style.display = 'none';
        errorMessage.style.display = 'none';
    });
    
    calculateBtn.addEventListener('click', async function() {
        // Hide previous results and errors
        resultContainer.style.display = 'none';
        errorMessage.style.display = 'none';
        
        const type = calculationType.value;
        let data = { type };
        
        try {
            switch(type) {
                case 'power':
                    data.voltage = parseFloat(document.getElementById('voltage').value);
                    data.current = parseFloat(document.getElementById('current').value);
                    break;
                case 'resistance':
                    data.voltage = parseFloat(document.getElementById('voltage-r').value);
                    data.current = parseFloat(document.getElementById('current-r').value);
                    break;
                case 'voltage':
                    data.power = parseFloat(document.getElementById('power-v').value);
                    data.current = parseFloat(document.getElementById('current-v').value);
                    break;
                case 'current':
                    data.power = parseFloat(document.getElementById('power-i').value);
                    data.voltage = parseFloat(document.getElementById('voltage-i').value);
                    break;
                case 'energy':
                    data.power = parseFloat(document.getElementById('power-e').value);
                    data.time = parseFloat(document.getElementById('time').value);
                    break;
            }
            
            // Check if any values are NaN
            for (const key in data) {
                if (key !== 'type' && isNaN(data[key])) {
                    throw new Error('Please enter valid numbers for all fields');
                }
            }
            
            const response = await fetch('/calculate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            
            const result = await response.json();
            
            if (response.ok) {
                if (result.result === null) {
                    throw new Error('Cannot divide by zero');
                }
                
                // Display the result
                resultValue.textContent = result.result.toFixed(4) + getUnit(type);
                formulaElement.textContent = `Formula: ${result.formula}`;
                resultContainer.style.display = 'block';
            } else {
                throw new Error(result.error || 'An error occurred');
            }
        } catch (error) {
            errorMessage.textContent = error.message;
            errorMessage.style.display = 'block';
        }
    });
    
    function getUnit(type) {
        switch(type) {
            case 'power': return ' W';
            case 'resistance': return ' Ω';
            case 'voltage': return ' V';
            case 'current': return ' A';
            case 'energy': return ' J';
            default: return '';
        }
    }
}); 