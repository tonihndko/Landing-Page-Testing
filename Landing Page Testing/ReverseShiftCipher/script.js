document.addEventListener('DOMContentLoaded', () => {
    const inputText = document.getElementById('inputText');
    const outputText = document.getElementById('outputText');
    const keyInput = document.getElementById('keyInput');
    const btnEncrypt = document.getElementById('btnEncrypt');
    const btnDecrypt = document.getElementById('btnDecrypt');
    const btnCopy = document.getElementById('btnCopy');

    // Function to reliably get a positive modulo value for the shift key
    const getKey = () => {
        let val = parseInt(keyInput.value, 10);
        if (isNaN(val)) return 0;
        return val % 26;
    };

    const visualContainer = document.getElementById('visualizationContainer');
    const visualSteps = document.getElementById('visualSteps');

    const renderVisualization = (steps) => {
        visualSteps.innerHTML = '';
        steps.forEach((step, index) => {
            const stepEl = document.createElement('div');
            stepEl.className = 'step-box';
            stepEl.style.animationDelay = `${index * 0.15}s`;
            stepEl.style.animation = `fadeIn 0.5s ease-out forwards`;
            stepEl.style.opacity = '0';
            
            stepEl.innerHTML = `
                <div class="step-title">${step.title}</div>
                <div class="step-content">${step.content}</div>
            `;
            visualSteps.appendChild(stepEl);
        });
        visualContainer.style.display = 'block';
    };

    // Core encryption logic: Shift then Reverse
    const encrypt = (text, key) => {
        let steps = [];
        steps.push({ title: "1. Teks Asli (Plaintext)", content: text });

        let shifted = "";
        let charFlowHtml = '<div class="char-flow">';
        
        for (let i = 0; i < text.length; i++) {
            let code = text.charCodeAt(i);
            let newChar = text[i];
            
            // Uppercase letters
            if (code >= 65 && code <= 90) {
                newChar = String.fromCharCode(((code - 65 + key) % 26 + 26) % 26 + 65);
            } 
            // Lowercase letters
            else if (code >= 97 && code <= 122) {
                newChar = String.fromCharCode(((code - 97 + key) % 26 + 26) % 26 + 97);
            } 
            shifted += newChar;
            
            charFlowHtml += `
                <div class="step-char-change">
                    <span class="char-old">${text[i] === ' ' ? '␣' : text[i]}</span>
                    <span class="char-icon">↓</span>
                    <span class="char-new">${newChar === ' ' ? '␣' : newChar}</span>
                </div>
            `;
        }
        charFlowHtml += '</div>';
        
        steps.push({ 
            title: `2. Substitusi (Pergeseran Kunci: +${key})`, 
            content: charFlowHtml + `<div class="temp-result">Hasil Substitusi: <strong>${shifted}</strong></div>` 
        });

        // Reverse process (Transposition)
        const reversed = shifted.split("").reverse().join("");
        steps.push({ 
            title: "3. Transposisi (Reverse / Dibalik)", 
            content: `<span style="color: #4ade80; font-weight: bold;">${reversed}</span>` 
        });

        return { result: reversed, steps: steps };
    };

    // Core decryption logic: Reverse back then Unshift
    const decrypt = (text, key) => {
        let steps = [];
        steps.push({ title: "1. Ciphertext Input", content: text });

        // Reverse back the string first
        const reversed = text.split("").reverse().join("");
        steps.push({ 
            title: "2. Transposisi (Reverse Kembali)", 
            content: `<span style="color: #a78bfa; font-weight: bold;">${reversed}</span>` 
        });

        let shifted = "";
        let charFlowHtml = '<div class="char-flow">';
        
        for (let i = 0; i < reversed.length; i++) {
            let code = reversed.charCodeAt(i);
            let newChar = reversed[i];

            // Uppercase letters
            if (code >= 65 && code <= 90) {
                newChar = String.fromCharCode(((code - 65 - key) % 26 + 26) % 26 + 65);
            } 
            // Lowercase letters
            else if (code >= 97 && code <= 122) {
                newChar = String.fromCharCode(((code - 97 - key) % 26 + 26) % 26 + 97);
            } 
            shifted += newChar;
            
            charFlowHtml += `
                <div class="step-char-change">
                    <span class="char-old" style="color: #a78bfa">${reversed[i] === ' ' ? '␣' : reversed[i]}</span>
                    <span class="char-icon">↓</span>
                    <span class="char-new" style="color: var(--secondary)">${newChar === ' ' ? '␣' : newChar}</span>
                </div>
            `;
        }
        charFlowHtml += '</div>';
        
        steps.push({ 
            title: `3. Substitusi Balik (Digeser mundur: -${key})`, 
            content: charFlowHtml + `<div class="temp-result">Plaintext: <strong>${shifted}</strong></div>` 
        });

        return { result: shifted, steps: steps };
    };

    // UI Feedback Animation
    const animateResult = (data) => {
        outputText.style.opacity = '0';
        setTimeout(() => {
            outputText.value = data.result;
            outputText.style.opacity = '1';
            renderVisualization(data.steps);
        }, 150);
    };

    // Event Listeners
    btnEncrypt.addEventListener('click', () => {
        const text = inputText.value;
        const key = getKey();
        if (!text) {
            visualContainer.style.display = 'none';
            return;
        }
        
        const data = encrypt(text, key);
        animateResult(data);
    });

    btnDecrypt.addEventListener('click', () => {
        const text = inputText.value;
        const key = getKey();
        if (!text) {
            visualContainer.style.display = 'none';
            return;
        }
        
        const data = decrypt(text, key);
        animateResult(data);
    });

    btnCopy.addEventListener('click', () => {
        if (!outputText.value) return;
        
        navigator.clipboard.writeText(outputText.value).then(() => {
            const originalHTML = btnCopy.innerHTML;
            btnCopy.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check"><path d="M20 6 9 17l-5-5"/></svg> Disalin`;
            
            setTimeout(() => {
                btnCopy.innerHTML = originalHTML;
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy text: ', err);
        });
    });
});
