    // --- VARIABLES TAILWIND ---
        tailwind.config = {
            darkMode: 'class',
            theme: {
                extend: {
                    colors: {
                        primary: 'var(--color-primary)',
                        secondary: 'var(--color-secondary)',
                        tertiary: 'var(--color-tertiary)',
                        bg: 'var(--color-bg)',
                        darkbg: '#0f172a', 
                        darkcard: '#1e293b', 
                    },
                    screens: { 'xs': '360px' }
                }
            }
        }

        if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            document.documentElement.classList.add('dark')
        } else {
            document.documentElement.classList.remove('dark')
        }

       let currentData = { salary: 0, bonus: 0, items: [] };
        let currentYearMonth = ""; 
        let itemToDeleteId = null; 
        let itemToEditId = null; 
        
        const elMonthPicker = document.getElementById('monthPicker');
        const elSalaryInput = document.getElementById('salaryInput');
        const elBonusInput = document.getElementById('bonusInput');
        const money = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });
        
        function toggleDarkMode() {
            if (document.documentElement.classList.contains('dark')) {
                document.documentElement.classList.remove('dark');
                localStorage.theme = 'light';
            } else {
                document.documentElement.classList.add('dark');
                localStorage.theme = 'dark';
            }
        }

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
            if (val === 0) { el.value = ''; return; }
            el.value = val; 
        }
        function isNumberKey(evt) {
            var charCode = (evt.which) ? evt.which : evt.keyCode;
            if (charCode == 46) return true; 
            if (charCode > 31 && (charCode < 48 || charCode > 57)) return false;
            return true;
        }

        window.onload = () => {
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            currentYearMonth = `${year}-${month}`;
            elMonthPicker.value = currentYearMonth;
            loadMonthData();
            updateFormColor();
        };

        function toggleAccordion(id) {
            const el = document.getElementById(id);
            if (el.classList.contains('accordion-open')) {
                el.classList.remove('accordion-open');
            } else {
                el.classList.add('accordion-open');
            }
        }

        function loadMonthData() {
            currentYearMonth = elMonthPicker.value;
            if(!currentYearMonth) return;
            const storageKey = `finance_${currentYearMonth}`;
            const stored = localStorage.getItem(storageKey);
            currentData = stored ? JSON.parse(stored) : { salary: 0, bonus: 0, items: [] };
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
            const parts = currentYearMonth.split('-');
            const currentY = parseInt(parts[0]);
            const currentM = parseInt(parts[1]);
            const date = new Date(currentY, currentM - 1 + delta, 1);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            elMonthPicker.value = `${year}-${month}`;
            loadMonthData();
        }

        function calculateAccumulated() {
            let total = 0;
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key.startsWith('finance_')) {
                    try {
                        const data = JSON.parse(localStorage.getItem(key));
                        const spent = (data.items || []).reduce((acc, item) => acc + item.amount, 0);
                        const income = (data.salary || 0) + (data.bonus || 0);
                        total += (income - spent);
                    } catch(e) {}
                }
            }
            return total;
        }

        function getAntTotal() {
            const majorIcons = ['🏠', '🛒', '🚗', '💳'];
            return currentData.items
                .filter(item => !majorIcons.includes(item.icon))
                .reduce((acc, item) => acc + item.amount, 0);
        }

        function checkAntExpenses() {
            const antTotal = getAntTotal();
            const alertBox = document.getElementById('antExpenseAlert');
            const totalSpan = document.getElementById('antTotalDisplay');
            const limit = 100000;

            if (antTotal > limit) {
                totalSpan.innerText = money.format(antTotal);
                alertBox.classList.remove('hidden');
            } else {
                alertBox.classList.add('hidden');
            }
        }

        function updateDashboard() {
            saveMonthData();
            const spentSalary = currentData.items.filter(i => i.source === 'salary').reduce((acc, i) => acc + i.amount, 0);
            const spentBonus = currentData.items.filter(i => i.source === 'bonus').reduce((acc, i) => acc + i.amount, 0);
            
            const balSalary = currentData.salary - spentSalary;
            const balBonus = currentData.bonus - spentBonus;
            const totalAvailable = balSalary + balBonus;

            if (balSalary <= 0 && currentData.salary > 0) { elSalaryInput.classList.add('spent-out'); } else { elSalaryInput.classList.remove('spent-out'); }
            if (balBonus <= 0 && currentData.bonus > 0) { elBonusInput.classList.add('spent-out'); } else { elBonusInput.classList.remove('spent-out'); }

            document.getElementById('balanceSalary').innerText = money.format(balSalary);
            document.getElementById('spentSalary').innerText = "-" + money.format(spentSalary);
            document.getElementById('headerBalSalary').innerText = money.format(balSalary);
            document.getElementById('headerBalSalaryDesktop').innerText = money.format(balSalary);
            
            document.getElementById('balanceBonus').innerText = money.format(balBonus);
            document.getElementById('spentBonus').innerText = "-" + money.format(spentBonus);
            document.getElementById('headerBalBonus').innerText = money.format(balBonus);
            document.getElementById('headerBalBonusDesktop').innerText = money.format(balBonus);

            document.getElementById('balanceSavings').innerText = money.format(totalAvailable);
            
            const grandTotal = calculateAccumulated();
            document.getElementById('globalAccumulated').innerText = money.format(grandTotal);
            document.getElementById('headerTotalSavings').innerText = money.format(grandTotal);

            document.getElementById('totalSpentGlobal').innerText = money.format(spentSalary + spentBonus);

            checkAntExpenses();
        }

        function addExpense() {
            const name = document.getElementById('expenseName').value.trim();
            const amount = parseCurrency(document.getElementById('expenseAmount').value);
            const icon = document.getElementById('expenseIcon').value;
            let source = 'salary';
            const radios = document.getElementsByName('source');
            for(const r of radios) if(r.checked) source = r.value;

            if (!name || isNaN(amount) || amount <= 0 || !icon) {
                const btn = document.getElementById('addBtn');
                btn.classList.add('bg-red-500');
                setTimeout(() => { updateFormColor(); }, 500);
                return;
            }

            currentData.items.unshift({ id: Date.now(), name, amount, icon, source, date: new Date().toLocaleDateString() });
            
            const newTotal = getAntTotal();
            if (newTotal > 100000) {
                document.getElementById('antLimitModal').classList.remove('hidden');
            }

            document.getElementById('expenseName').value = '';
            document.getElementById('expenseAmount').value = ''; 
            document.getElementById('expenseIcon').value = "";
            document.getElementById('expenseIcon').classList.remove('text-gray-800');
            document.getElementById('expenseIcon').classList.add('text-gray-400');
            document.getElementById('expenseName').focus();

            renderExpenses();
            updateDashboard();
        }

        function openDeleteModal(id) { itemToDeleteId = id; document.getElementById('deleteModal').classList.remove('hidden'); }
        function closeDeleteModal() { itemToDeleteId = null; document.getElementById('deleteModal').classList.add('hidden'); }
        function closeSuccessModal() { document.getElementById('successModal').classList.add('hidden'); }
        
        function confirmDelete() {
            if (itemToDeleteId !== null) {
                currentData.items = currentData.items.filter(i => i.id !== itemToDeleteId);
                renderExpenses(); updateDashboard(); closeDeleteModal();
            }
        }

        function openEditModal(id) {
            const item = currentData.items.find(i => i.id === id);
            if (!item) return;
            itemToEditId = id;
            document.getElementById('editName').value = item.name;
            document.getElementById('editAmount').value = item.amount;
            document.getElementById('editIcon').value = item.icon;
            
            const radios = document.getElementsByName('editSource');
            for(const r of radios) {
                if(r.value === item.source) r.checked = true;
            }

            document.getElementById('editModal').classList.remove('hidden');
        }

        function closeEditModal() {
            itemToEditId = null;
            document.getElementById('editModal').classList.add('hidden');
        }

        function saveEdit() {
            const newName = document.getElementById('editName').value.trim();
            const newAmount = parseCurrency(document.getElementById('editAmount').value);
            const newIcon = document.getElementById('editIcon').value;
            let newSource = 'salary';
            const radios = document.getElementsByName('editSource');
            for(const r of radios) if(r.checked) newSource = r.value;

            if (!newName || isNaN(newAmount) || newAmount <= 0) {
                alert("Por favor revisa los datos");
                return;
            }

            const itemIndex = currentData.items.findIndex(i => i.id === itemToEditId);
            if (itemIndex > -1) {
                currentData.items[itemIndex].name = newName;
                currentData.items[itemIndex].amount = newAmount;
                currentData.items[itemIndex].icon = newIcon;
                currentData.items[itemIndex].source = newSource;
                
                updateDashboard();
                renderExpenses();
                closeEditModal();
            }
        }

        function renderExpenses() {
            const filterVal = document.getElementById('categoryFilter').value;
            const list = document.getElementById('expenseList');
            list.innerHTML = '';
            const emptyState = document.getElementById('emptyState');

            let itemsToShow = currentData.items;
            if (filterVal !== 'all') {
                itemsToShow = currentData.items.filter(item => item.icon === filterVal);
            }

            if (itemsToShow.length === 0) {
                emptyState.classList.remove('hidden');
                if (currentData.items.length > 0) {
                    emptyState.querySelector('p').innerText = "No hay gastos de este tipo";
                } else {
                    emptyState.querySelector('p').innerText = "Sin movimientos este mes";
                }
                return;
            }
            emptyState.classList.add('hidden');

            itemsToShow.forEach(item => {
                const isBonus = item.source === 'bonus';
                const label = isBonus ? "Bono" : "Sueldo";
                const colorVar = isBonus ? "var(--color-secondary)" : "var(--color-primary)";
                const row = document.createElement('tr');
                row.className = 'hover:bg-gray-50 dark:hover:bg-slate-800 fade-in border-b border-gray-50 dark:border-slate-700 group';
                row.innerHTML = `
                    <td class="p-3 sm:p-4 align-middle"><div class="flex flex-col items-center"><span class="text-xl mb-1">${item.icon}</span><span class="px-2 py-1 text-[10px] rounded-md font-bold text-white opacity-80" style="background-color: ${colorVar}">${label}</span></div></td>
                    <td class="p-3 sm:p-4 align-middle"><div class="font-medium text-gray-700 dark:text-gray-200 leading-tight">${item.name}</div><div class="text-[10px] text-gray-400 dark:text-gray-500">${item.date}</div></td>
                    <td class="p-3 sm:p-4 text-right font-bold" style="color: ${colorVar}">-${money.format(item.amount)}</td>
                    <td class="p-3 sm:p-4 text-center whitespace-nowrap">
                        <button onclick="openEditModal(${item.id})" class="text-gray-400 hover:text-blue-500 transition px-1"><i class="fas fa-pen"></i></button>
                        <button onclick="openDeleteModal(${item.id})" class="text-gray-400 hover:text-red-500 transition px-1"><i class="fas fa-trash-alt"></i></button>
                    </td>
                `;
                list.appendChild(row);
            });
        }

        function updateFormColor() {
            let source = 'salary';
            const radios = document.getElementsByName('source');
            for(const r of radios) if(r.checked) source = r.value;
            const btn = document.getElementById('addBtn');
            btn.className = "mt-auto w-full text-white font-bold py-3 px-4 rounded-xl shadow-lg transition transform active:scale-95";
            if (source === 'bonus') { btn.style.backgroundColor = "var(--color-secondary)"; btn.style.boxShadow = "0 10px 15px -3px rgba(14, 165, 233, 0.3)"; }
            else { btn.style.backgroundColor = "var(--color-primary)"; btn.style.boxShadow = "0 10px 15px -3px rgba(79, 70, 229, 0.3)"; }
        }

        document.getElementById('expenseAmount').addEventListener('keypress', (e) => { if (e.key === 'Enter') addExpense(); });

        function generatePDF() {
            const spentS = currentData.items.filter(i => i.source === 'salary').reduce((a,b)=>a+b.amount,0);
            const spentB = currentData.items.filter(i => i.source === 'bonus').reduce((a,b)=>a+b.amount,0);
            const balS = currentData.salary - spentS;
            const balB = currentData.bonus - spentB;
            const totalSav = balS + balB;
            const totalHist = calculateAccumulated();
            const totalSpent = spentS + spentB;

            const rows = currentData.items.map(i => `
                <tr style="border-bottom:1px solid #eee"><td style="padding:10px;color:#666;font-size:12px">${i.date}</td>
                <td style="padding:10px"><span style="color:${i.source==='bonus'?'#0EA5E9':'#4F46E5'};font-weight:bold;font-size:10px;border:1px solid currentColor;padding:2px 5px;border-radius:4px">${i.source==='bonus'?'BONO':'SUELDO'}</span></td>
                <td style="padding:10px;font-size:13px">${i.icon} ${i.name}</td><td style="padding:10px;text-align:right;font-weight:bold;font-size:13px">-${money.format(i.amount)}</td></tr>`
            ).join('');

            const content = `
                <div style="font-family:Arial,sans-serif;padding:40px;background:white;color:#333">
                    <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:3px solid #4F46E5;padding-bottom:20px;margin-bottom:30px">
                        <div><h1 style="margin:0;font-size:24px">Reporte Mensual</h1><p style="margin:5px 0 0;color:#666">Periodo: <strong>${currentYearMonth}</strong></p></div>
                        <div style="display:flex;gap:15px;text-align:right">
                            <div style="background:#fee2e2;color:#991b1b;padding:10px;border-radius:8px"><div style="font-size:10px;text-transform:uppercase">Total Gastado</div><div style="font-size:18px;font-weight:bold">-${money.format(totalSpent)}</div></div>
                            <div style="background:#10B981;color:white;padding:10px;border-radius:8px"><div style="font-size:10px;text-transform:uppercase">Ahorro Histórico</div><div style="font-size:18px;font-weight:bold">${money.format(totalHist)}</div></div>
                        </div>
                    </div>
                    <table style="width:100%;border-spacing:10px 0;margin-bottom:30px"><tr>
                        <td style="background:#f9fafb;padding:15px;border-radius:8px;border:1px solid #e5e7eb;width:50%"><div style="font-size:11px;font-weight:bold;color:#4F46E5">CUENTA PRINCIPAL</div><div style="font-size:20px;font-weight:bold;margin:5px 0">${money.format(balS)}</div></td>
                        <td style="background:#f9fafb;padding:15px;border-radius:8px;border:1px solid #e5e7eb;width:50%"><div style="font-size:11px;font-weight:bold;color:#0EA5E9">CUENTA BONO</div><div style="font-size:20px;font-weight:bold;margin:5px 0">${money.format(balB)}</div></td>
                    </tr></table>
                    <h3 style="font-size:14px;text-transform:uppercase;color:#9ca3af;border-bottom:1px solid #eee;padding-bottom:5px">Movimientos</h3>
                    <table style="width:100%;border-collapse:collapse">${rows||'<tr><td colspan="4" style="text-align:center;padding:20px;color:#999">Sin movimientos</td></tr>'}</table>
                </div>
            `;
            const el = document.createElement('div'); el.innerHTML = content; el.style.width = '700px';
            html2pdf().from(el).set({ margin: 10, filename: `Reporte_${currentYearMonth}.pdf`, image: { type: 'jpeg', quality: 0.98 }, html2canvas: { scale: 2 }, jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' } }).save().then(() => {
                const m = document.getElementById('successModal'); m.classList.remove('hidden'); setTimeout(() => { if(!m.classList.contains('hidden')) closeSuccessModal(); }, 3000);
            });
        }