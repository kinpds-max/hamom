document.addEventListener('DOMContentLoaded', () => {
    // State management
    let items = [
        { id: Date.now(), name: '하맘 컨텐츠 제작 (기본)', quantity: 1, price: 5000000 },
        { id: Date.now() + 1, name: '시스템 연동 및 자동화', quantity: 1, price: 3000000 }
    ];

    // DOM Elements
    const itemsBody = document.getElementById('items-body');
    const pItemsBody = document.getElementById('p-items-body');
    const pTotalAmount = document.getElementById('p-total-amount');
    const pSubtotal = document.getElementById('p-subtotal');
    const pTax = document.getElementById('p-tax');
    const pGrandTotal = document.getElementById('p-grand-total');
    const docDate = document.getElementById('doc-date');
    const pDocDate = document.getElementById('p-doc-date');
    const clientName = document.getElementById('client-name');
    const pClientName = document.getElementById('p-client-name');
    const notesInput = document.getElementById('notes-input');
    const pNotes = document.getElementById('p-notes');
    const templateSelect = document.getElementById('template-select');
    const colorPicker = document.getElementById('theme-color');
    const printArea = document.getElementById('print-area');

    // Provider Info Elements
    const regCompany = document.getElementById('reg-company');
    const regNumber = document.getElementById('reg-number');
    const regCeo = document.getElementById('reg-ceo');
    const regTel = document.getElementById('reg-tel');
    const regAddress = document.getElementById('reg-address');
    
    const pRegCompany = document.getElementById('p-reg-company');
    const pRegNumber = document.getElementById('p-reg-number');
    const pRegCeo = document.getElementById('p-reg-ceo');
    const pRegTel = document.getElementById('p-reg-tel');
    const pRegAddress = document.getElementById('p-reg-address');

    // Upload Elements
    const logoUpload = document.getElementById('logo-upload');
    const stampUpload = document.getElementById('stamp-upload');
    const pLogoImg = document.querySelector('.paper-logo img');
    const pStampImg = document.getElementById('p-stamp-img');

    const btnAddItem = document.getElementById('btn-add-item');
    const btnExportPdf = document.getElementById('btn-export-pdf');
    const btnSaveHtml = document.getElementById('btn-save-html');
    const btnSendEmail = document.getElementById('btn-send-email');

    // Initialize Date
    const today = new Date().toISOString().split('T')[0];
    docDate.value = today;
    pDocDate.innerText = today.replace(/-/g, '.');

    // Core Functions
    function render() {
        // Sync Inputs to Preview
        pClientName.innerText = clientName.value;
        pDocDate.innerText = docDate.value.replace(/-/g, '.');
        pNotes.innerText = notesInput.value;

        // Provider Sync
        pRegCompany.innerText = regCompany.value;
        pRegNumber.innerText = regNumber.value;
        pRegCeo.innerText = regCeo.value;
        pRegTel.innerText = regTel.value;
        pRegAddress.innerText = regAddress.value;

        // Template Sync
        printArea.className = `paper ${templateSelect.value}`;
        
        // Color Sync
        printArea.style.setProperty('--p-accent', colorPicker.value);

        // Render Editorial Table
        itemsBody.innerHTML = '';
        items.forEach((item, index) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><input type="text" value="${item.name}" data-id="${item.id}" data-field="name"></td>
                <td><input type="number" value="${item.quantity}" data-id="${item.id}" data-field="quantity"></td>
                <td><input type="number" value="${item.price}" data-id="${item.id}" data-field="price"></td>
                <td class="bold">₩${(item.quantity * item.price).toLocaleString()}</td>
                <td><button class="btn-remove" data-id="${item.id}">×</button></td>
            `;
            itemsBody.appendChild(tr);
        });

        // Render Preview Table
        pItemsBody.innerHTML = '';
        let subtotal = 0;
        items.forEach((item, index) => {
            const amount = item.quantity * item.price;
            subtotal += amount;
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${index + 1}</td>
                <td style="text-align: left;">${item.name}</td>
                <td>${item.quantity}</td>
                <td class="text-right">${item.price.toLocaleString()}</td>
                <td class="text-right">${amount.toLocaleString()}</td>
            `;
            pItemsBody.appendChild(tr);
        });

        // Calculate Totals
        const tax = Math.floor(subtotal * 0.1);
        const grandTotal = subtotal + tax;

        pSubtotal.innerText = subtotal.toLocaleString();
        pTax.innerText = tax.toLocaleString();
        pGrandTotal.innerText = grandTotal.toLocaleString();
        pTotalAmount.innerText = grandTotal.toLocaleString();

        // Convert amount to Korean text for the header
        try {
            const totalTextDisplay = document.querySelector('.total-display');
            if (totalTextDisplay) {
                const koreanAmount = numberToKorean(grandTotal);
                // Look for text node to update
                for (let node of totalTextDisplay.childNodes) {
                    if (node.nodeType === Node.TEXT_NODE && node.textContent.includes('합계금액')) {
                        node.textContent = `합계금액 (일금 ${koreanAmount} 원정) `;
                        break;
                    }
                }
            }
        } catch (e) {
            console.error("Korean text conversion failed", e);
        }
    }

    function numberToKorean(number) {
        const units = ['', '십', '백', '천'];
        const bigUnits = ['', '만', '억', '조'];
        const digits = ['', '일', '이', '삼', '사', '오', '육', '칠', '팔', '구'];
        
        if (number === 0) return '영';
        
        let result = '';
        let strNum = number.toString();
        let len = strNum.length;
        
        for (let i = 0; i < len; i++) {
            let digit = parseInt(strNum[i]);
            let unitIdx = (len - i - 1) % 4;
            let bigUnitIdx = Math.floor((len - i - 1) / 4);
            
            if (digit !== 0) {
                result += digits[digit] + units[unitIdx];
            }
            
            if (unitIdx === 0 && bigUnitIdx > 0 && strNum.substring(Math.max(0, i-3), i+1).replace(/0/g, '') !== '') {
                result += bigUnits[bigUnitIdx];
            }
        }
        
        return result.replace(/일십/g, '십').replace(/일백/g, '백').replace(/일천/g, '천');
    }

    // Event Listeners
    itemsBody.addEventListener('input', (e) => {
        const id = parseInt(e.target.dataset.id);
        const field = e.target.dataset.field;
        const item = items.find(i => i.id === id);
        if (item) {
            item[field] = field === 'name' ? e.target.value : parseInt(e.target.value) || 0;
            render();
        }
    });

    itemsBody.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-remove')) {
            const id = parseInt(e.target.dataset.id);
            items = items.filter(i => i.id !== id);
            render();
        }
    });

    clientName.addEventListener('input', render);
    docDate.addEventListener('input', render);
    notesInput.addEventListener('input', render);
    templateSelect.addEventListener('change', render);
    colorPicker.addEventListener('input', render);

    [regCompany, regNumber, regCeo, regTel, regAddress].forEach(el => {
        el.addEventListener('input', render);
    });

    // Image Upload Handlers
    logoUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            pLogoImg.src = URL.createObjectURL(file);
        }
    });

    stampUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            pStampImg.src = URL.createObjectURL(file);
            pStampImg.style.display = 'block';
        }
    });

    btnAddItem.addEventListener('click', () => {
        items.push({ id: Date.now(), name: '신규 품목', quantity: 1, price: 0 });
        render();
    });

    // Export PDF
    btnExportPdf.addEventListener('click', () => {
        const element = document.getElementById('print-area');
        const opt = {
            margin: 0,
            filename: `견적서_${clientName.value}_${docDate.value}.pdf`,
            image: { type: 'jpeg', quality: 1.0 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        
        // Hide preview shadow during export if needed, 
        // though html2pdf works by rendering the element directly.
        html2pdf().set(opt).from(element).save();
    });

    // Save HTML
    btnSaveHtml.addEventListener('click', () => {
        const printAreaHtml = document.getElementById('print-area').outerHTML;
        const fullHtml = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>비교견적서 - ${clientName.value}</title>
                <style>
                    ${Array.from(document.styleSheets[0].cssRules).map(rule => rule.cssText).join('\n')}
                    body { background: #fff; display: block; overflow: auto; }
                    .paper { box-shadow: none; margin: 0 auto; }
                </style>
            </head>
            <body>
                ${printAreaHtml}
            </body>
            </html>
        `;
        
        const blob = new Blob([fullHtml], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `견적서_${clientName.value}_${docDate.value}.html`;
        a.click();
        URL.revokeObjectURL(url);
    });

    // Send Email
    btnSendEmail.addEventListener('click', () => {
        const title = document.getElementById('quote-title').value;
        const total = pGrandTotal.innerText;
        const subject = encodeURIComponent(`[견적서] ${title} - ${clientName.value} 귀하`);
        const body = encodeURIComponent(
            `안녕하십니까, ${clientName.value}님.\n\n` +
            `${regCompany.value}에서 발행한 견적서를 송부드립니다.\n\n` +
            `- 견적명: ${title}\n` +
            `- 총 금액: ₩${total} (VAT 포함)\n\n` +
            `상세 내용은 첨부된 PDF(다운로드 필요)를 확인해 주시기 바랍니다.\n\n` +
            `감사합니다.\n\n` +
            `${regCompany.value} ${regCeo.value} 배상\n` +
            `문의: ${regTel.value}`
        );
        
        window.location.href = `mailto:?subject=${subject}&body=${body}`;
    });

    // Live Scaling Logic (Jobs Style)
    function autoScale() {
        const panel = document.querySelector('.preview-panel');
        const paper = document.getElementById('print-area');
        
        if (!panel || !paper) return;
        
        const padding = 60; // Total horizontal padding in panel
        const panelWidth = panel.offsetWidth - padding;
        const paperWidth = 794; // 210mm in pixels (approx)
        
        const scale = Math.min(1, panelWidth / paperWidth);
        paper.style.transform = `scale(${scale})`;
    }

    // Initial render and scale
    render();
    autoScale();
    
    window.addEventListener('resize', autoScale);
});
