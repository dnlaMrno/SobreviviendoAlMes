        // --- VARIABLES TAILWIND ---
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        primary: 'var(--color-primary)',
                        secondary: 'var(--color-secondary)',
                        bg: 'var(--color-bg)',
                    },
                    screens: {
                        'xs': '360px', // Breakpoint extra pequeño
                    }
                }
            }
        }
        
         // --- VARIABLES GLOBALES ---
        let currentData = { salary: 0, bonus: 0, items: [] };
        let currentYearMonth = ""; 
        let itemToDeleteId = null; 

        // --- ELEMENTOS ---
        const elMonthPicker = document.getElementById('monthPicker');
        const elSalaryInput = document.getElementById('salaryInput');
        const elBonusInput = document.getElementById('bonusInput');
        const money = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });
        
        // --- UTILIDADES DE FORMATO ---
        function parseCurrency(str) {
            if (!str) return 0;
            const cleanStr = str.toString().replace(/[^0-9.]/g, '');
            return parseFloat(cleanStr) || 0;
        }

        function formatElement(el) {
            const val = parseCurrency(el.value);
            if (val === 0 && el.value === '') return;
            el.value = val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        }

        function unformatElement(el) {
            const val = parseCurrency(el.value);
            if (val === 0) {
                el.value = '';
                return;
            }
            el.value = val; 
        }

        function isNumberKey(evt) {
            var charCode = (evt.which) ? evt.which : evt.keyCode;
            if (charCode == 46) return true; 
            if (charCode > 31 && (charCode < 48 || charCode > 57)) return false;
            return true;
        }

        // --- INICIALIZACIÓN ---
        window.onload = () => {
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            currentYearMonth = `${year}-${month}`;
            elMonthPicker.value = currentYearMonth;
            loadMonthData();
            updateFormColor();
        };

        // --- GESTIÓN DE DATOS ---
        function loadMonthData() {
            currentYearMonth = elMonthPicker.value;
            if(!currentYearMonth) return;
            const storageKey = `finance_${currentYearMonth}`;
            const stored = localStorage.getItem(storageKey);
            currentData = stored ? JSON.parse(stored) : { salary: 0, bonus: 0, items: [] };

            // Cargar y formatear visualmente
            elSalaryInput.value = currentData.salary > 0 ? currentData.salary : '';
            formatElement(elSalaryInput);
            
            elBonusInput.value = currentData.bonus > 0 ? currentData.bonus : '';
            formatElement(elBonusInput);

            renderExpenses();
            updateDashboard();
        }

        function saveMonthData() {
            const storageKey = `finance_${currentYearMonth}`;
            currentData.salary = parseCurrency(elSalaryInput.value);
            currentData.bonus = parseCurrency(elBonusInput.value);
            localStorage.setItem(storageKey, JSON.stringify(currentData));
        }

        function changeMonth(delta) {
            const date = new Date(currentYearMonth + "-01");
            date.setMonth(date.getMonth() + delta);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            elMonthPicker.value = `${year}-${month}`;
            loadMonthData();
        }

        // --- LÓGICA Y RENDER ---
        function updateDashboard() {
            saveMonthData();
            const spentSalary = currentData.items.filter(i => i.source === 'salary').reduce((acc, i) => acc + i.amount, 0);
            const spentBonus = currentData.items.filter(i => i.source === 'bonus').reduce((acc, i) => acc + i.amount, 0);

            document.getElementById('balanceSalary').innerText = money.format(currentData.salary - spentSalary);
            document.getElementById('spentSalary').innerText = "-" + money.format(spentSalary);
            
            document.getElementById('balanceBonus').innerText = money.format(currentData.bonus - spentBonus);
            document.getElementById('spentBonus').innerText = "-" + money.format(spentBonus);

            document.getElementById('totalSpentGlobal').innerText = money.format(spentSalary + spentBonus);
        }

        function addExpense() {
            const nameInput = document.getElementById('expenseName');
            const amountInput = document.getElementById('expenseAmount');
            const iconSelect = document.getElementById('expenseIcon');
            
            const name = nameInput.value.trim();
            const amount = parseCurrency(amountInput.value);
            const icon = iconSelect.value;
            
            const sourceRadios = document.getElementsByName('source');
            let source = 'salary';
            for(const radio of sourceRadios) { if(radio.checked) source = radio.value; }

            if (!name || isNaN(amount) || amount <= 0 || !icon) {
                const btn = document.getElementById('addBtn');
                btn.classList.add('bg-red-500');
                setTimeout(() => { updateFormColor(); }, 500);
                return;
            }

            const newItem = {
                id: Date.now(),
                name, amount, icon, source, 
                date: new Date().toLocaleDateString()
            };

            currentData.items.unshift(newItem);
            
            // Limpiar y resetear
            nameInput.value = '';
            amountInput.value = ''; 
            iconSelect.value = "";
            iconSelect.classList.remove('text-gray-800');
            iconSelect.classList.add('text-gray-400');
            nameInput.focus();

            renderExpenses();
            updateDashboard();
        }

        // --- POPUP MODAL ---
        function openDeleteModal(id) {
            itemToDeleteId = id;
            const modal = document.getElementById('deleteModal');
            modal.classList.remove('hidden');
        }

        function closeDeleteModal() {
            itemToDeleteId = null;
            const modal = document.getElementById('deleteModal');
            modal.classList.add('hidden');
        }

        function confirmDelete() {
            if (itemToDeleteId !== null) {
                currentData.items = currentData.items.filter(i => i.id !== itemToDeleteId);
                renderExpenses();
                updateDashboard();
                closeDeleteModal();
            }
        }

        function renderExpenses() {
            const list = document.getElementById('expenseList');
            list.innerHTML = '';
            const emptyState = document.getElementById('emptyState');

            if (currentData.items.length === 0) {
                emptyState.classList.remove('hidden');
                return;
            }
            emptyState.classList.add('hidden');

            currentData.items.forEach(item => {
                const isBonus = item.source === 'bonus';
                const label = isBonus ? "Bono" : "Sueldo";
                const colorVar = isBonus ? "var(--color-secondary)" : "var(--color-primary)";
                
                const row = document.createElement('tr');
                row.className = 'hover:bg-gray-50 fade-in border-b border-gray-50 group';
                row.innerHTML = `
                    <td class="p-3 sm:p-4 align-middle">
                        <div class="flex flex-col items-center">
                            <span class="text-xl mb-1">${item.icon}</span>
                            <span class="px-2 py-1 text-[10px] rounded-md font-bold text-white opacity-80" 
                                  style="background-color: ${colorVar}">${label}</span>
                        </div>
                    </td>
                    <td class="p-3 sm:p-4 align-middle">
                        <div class="font-medium text-gray-700 leading-tight">${item.name}</div>
                        <div class="text-[10px] text-gray-400">${item.date}</div>
                    </td>
                    <td class="p-3 sm:p-4 text-right font-bold" style="color: ${colorVar}">
                        -${money.format(item.amount)}
                    </td>
                    <td class="p-3 sm:p-4 text-center">
                        <button onclick="openDeleteModal(${item.id})" class="text-gray-300 hover:text-red-500 transition px-2 opacity-0 group-hover:opacity-100 focus:opacity-100">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </td>
                `;
                list.appendChild(row);
            });
        }

        function updateFormColor() {
            const sourceRadios = document.getElementsByName('source');
            let source = 'salary';
            for(const radio of sourceRadios) { if(radio.checked) source = radio.value; }
            
            const btn = document.getElementById('addBtn');
            btn.className = "mt-auto w-full text-white font-bold py-3 px-4 rounded-xl shadow-lg transition transform active:scale-95";
            
            if (source === 'bonus') {
                btn.style.backgroundColor = "var(--color-secondary)";
                btn.style.boxShadow = "0 10px 15px -3px rgba(14, 165, 233, 0.3)";
            } else {
                btn.style.backgroundColor = "var(--color-primary)";
                btn.style.boxShadow = "0 10px 15px -3px rgba(79, 70, 229, 0.3)";
            }
        }

        document.getElementById('expenseAmount').addEventListener('keypress', (e) => { if (e.key === 'Enter') addExpense(); });

        // --- PDF GENERATOR ---
        function generatePDF() {
            const style = getComputedStyle(document.documentElement);
            const cPrimary = style.getPropertyValue('--color-primary').trim();
            const cSecondary = style.getPropertyValue('--color-secondary').trim();

            const spentSalary = currentData.items.filter(i => i.source === 'salary').reduce((a,b)=>a+b.amount,0);
            const spentBonus = currentData.items.filter(i => i.source === 'bonus').reduce((a,b)=>a+b.amount,0);
            const balSalary = currentData.salary - spentSalary;
            const balBonus = currentData.bonus - spentBonus;

            const rows = currentData.items.map(i => {
                const color = i.source === 'bonus' ? cSecondary : cPrimary;
                const label = i.source === 'bonus' ? 'BONO' : 'SUELDO';
                return `
                <tr style="border-bottom: 1px solid #eee;">
                    <td style="padding: 10px; color: #666; font-size: 12px;">${i.date}</td>
                    <td style="padding: 10px;"><span style="color: ${color}; font-weight: bold; font-size: 10px; border: 1px solid ${color}; padding: 2px 5px; border-radius: 4px;">${label}</span></td>
                    <td style="padding: 10px; font-size: 13px;">${i.icon} ${i.name}</td>
                    <td style="padding: 10px; text-align: right; font-weight: bold; font-size: 13px;">-${money.format(i.amount)}</td>
                </tr>`;
            }).join('');

            const content = `
                <div style="font-family: Arial, sans-serif; padding: 40px; background: white; color: #333;">
                    <div style="display: flex; justify-content: space-between; border-bottom: 3px solid ${cPrimary}; padding-bottom: 20px; margin-bottom: 30px;">
                        <div>
                            <h1 style="margin:0; font-size: 24px; color: #111;">Reporte de Gastos</h1>
                            <p style="margin:5px 0 0; color: #666;">Periodo: <strong>${currentYearMonth}</strong></p>
                        </div>
                        <div style="text-align: right;">
                             <div style="background: #f3f4f6; padding: 10px; border-radius: 8px;">
                                <div style="font-size: 10px; color: #888; text-transform: uppercase;">Total Gastado</div>
                                <div style="font-size: 18px; font-weight: bold; color: #333;">${money.format(spentSalary + spentBonus)}</div>
                             </div>
                        </div>
                    </div>

                    <table style="width: 100%; border-collapse: separate; border-spacing: 10px 0; margin-bottom: 30px;">
                        <tr>
                            <td style="background: #f9fafb; padding: 15px; border-radius: 8px; border: 1px solid #e5e7eb; width: 50%;">
                                <div style="font-size: 11px; font-weight: bold; color: ${cPrimary};">CUENTA PRINCIPAL</div>
                                <div style="font-size: 20px; font-weight: bold; margin: 5px 0;">${money.format(balSalary)}</div>
                                <div style="font-size: 11px; color: #ef4444;">Gastado: -${money.format(spentSalary)}</div>
                            </td>
                            <td style="background: #f9fafb; padding: 15px; border-radius: 8px; border: 1px solid #e5e7eb; width: 50%;">
                                <div style="font-size: 11px; font-weight: bold; color: ${cSecondary};">CUENTA BONO</div>
                                <div style="font-size: 20px; font-weight: bold; margin: 5px 0;">${money.format(balBonus)}</div>
                                <div style="font-size: 11px; color: #ef4444;">Gastado: -${money.format(spentBonus)}</div>
                            </td>
                        </tr>
                    </table>

                    <h3 style="font-size: 14px; text-transform: uppercase; color: #9ca3af; margin-bottom: 15px; border-bottom: 1px solid #eee; padding-bottom: 5px;">Detalle de Movimientos</h3>
                    <table style="width: 100%; border-collapse: collapse;">
                        ${rows || '<tr><td colspan="4" style="text-align:center; padding: 20px; color: #999;">Sin movimientos</td></tr>'}
                    </table>
                </div>
            `;

            const element = document.createElement('div');
            element.innerHTML = content;
            element.style.width = '700px'; 
            
            const opt = {
                margin: 10,
                filename: `Reporte_${currentYearMonth}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2, logging: false },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };

            html2pdf().from(element).set(opt).save();
        }