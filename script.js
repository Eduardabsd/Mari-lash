// Dados armazenados no localStorage
let appointments = JSON.parse(localStorage.getItem('appointments')) || [];
let currentYear = 2027;
let currentMonth = 0; // Janeiro

// Elementos DOM
const calendar = document.getElementById('calendar');
const currentYearSpan = document.getElementById('current-year');
const prevYearBtn = document.getElementById('prev-year');
const nextYearBtn = document.getElementById('next-year');
const modal = document.getElementById('modal');
const closeModal = document.querySelector('.close');
const saveBtn = document.getElementById('save-appointment');
const selectedDateSpan = document.getElementById('selected-date');
const selectedMonthH3 = document.getElementById('selected-month');
const totalValueP = document.getElementById('total-value');
const monthList = document.getElementById('month-list');

// Função para renderizar o calendário
function renderCalendar(year) {
    calendar.innerHTML = '';
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    months.forEach((month, index) => {
        const monthDiv = document.createElement('div');
        monthDiv.classList.add('month');
        monthDiv.innerHTML = `<h4>${month} ${year}</h4>`;
        const daysInMonth = new Date(year, index + 1, 0).getDate();
        for (let day = 1; day <= daysInMonth; day++) {
            const dayDiv = document.createElement('div');
            dayDiv.classList.add('day');
            dayDiv.textContent = day;
            dayDiv.addEventListener('click', () => openModal(`${day}/${index + 1}/${year}`));
            monthDiv.appendChild(dayDiv);
        }
        calendar.appendChild(monthDiv);
    });
}

// Abrir modal
function openModal(date) {
    selectedDateSpan.textContent = date;
    modal.style.display = 'block';
}

// Fechar modal
closeModal.addEventListener('click', () => modal.style.display = 'none');
window.addEventListener('click', (e) => {
    if (e.target === modal) modal.style.display = 'none';
});

// Salvar agendamento
saveBtn.addEventListener('click', () => {
    const time = document.getElementById('time').value;
    const procedure = document.getElementById('procedure').value;
    const clientName = document.getElementById('client-name').value;
    const value = parseFloat(document.getElementById('value').value);
    if (time && procedure && clientName && value) {
        appointments.push({
            date: selectedDateSpan.textContent,
            time,
            procedure,
            clientName,
            value
        });
        localStorage.setItem('appointments', JSON.stringify(appointments));
        modal.style.display = 'none';
        // Limpar campos
        document.getElementById('time').value = '';
        document.getElementById('procedure').value = '';
        document.getElementById('client-name').value = '';
        document.getElementById('value').value = '';
    }
});

// Navegação do ano
prevYearBtn.addEventListener('click', () => {
    if (currentYear > 2027) {
        currentYear--;
        currentYearSpan.textContent = currentYear;
        renderCalendar(currentYear);
    }
});

nextYearBtn.addEventListener('click', () => {
    if (currentYear < 2030) {
        currentYear++;
        currentYearSpan.textContent = currentYear;
        renderCalendar(currentYear);
    }
});

// Renderizar lista de meses para finanças
function renderMonthList() {
    monthList.innerHTML = '';
    const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    months.forEach((month, index) => {
        const li = document.createElement('li');
        li.textContent = `${month} 2027`; // Exemplo para 2027; pode expandir para outros anos
        li.addEventListener('click', () => selectMonth(index));
        monthList.appendChild(li);
    });
}

// Selecionar mês e calcular total
function selectMonth(monthIndex) {
    currentMonth = monthIndex;
    const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    selectedMonthH3.textContent = `${months[monthIndex]} 2027`;
    const total = appointments
        .filter(app => {
            const [day, month] = app.date.split('/');
            return parseInt(month) - 1 === monthIndex;
        })
        .reduce((sum, app) => sum + app.value, 0);
    totalValueP.textContent = `Total: R$ ${total.toFixed(2)}`;
}

// Inicialização
renderCalendar(currentYear);
renderMonthList();
selectMonth(currentMonth);
