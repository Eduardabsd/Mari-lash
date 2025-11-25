// Simple calendar + appointments saved in localStorage
const YEARS = [2027,2028,2029,2030];
const MONTHS = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

const yearSelect = document.getElementById('year-select');
const monthSelect = document.getElementById('month-select');
const calendarEl = document.getElementById('calendar');
const modal = document.getElementById('modal');
const modalClose = document.getElementById('modal-close');
const apDate = document.getElementById('ap-date');
const apTime = document.getElementById('ap-time');
const apModel = document.getElementById('ap-model');
const apName = document.getElementById('ap-name');
const apValue = document.getElementById('ap-value');
const apForm = document.getElementById('appointment-form');
const financeTitle = document.getElementById('finance-title');
const financeAmount = document.getElementById('finance-amount');
const monthsList = document.getElementById('months-list');

const btnAgenda = document.getElementById('btn-agenda');
const btnFinance = document.getElementById('btn-finance');
const agendaSection = document.getElementById('agenda-section');
const financeSection = document.getElementById('finance-section');

let selectedDateIso = null;
let editingId = null;

// --- storage helpers ---
function getAppointments(){
  const raw = localStorage.getItem('givara_appointments');
  return raw ? JSON.parse(raw) : [];
}
function saveAppointments(list){
  localStorage.setItem('givara_appointments', JSON.stringify(list));
}

// --- populate year and month selects ---
function initSelectors(){
  YEARS.forEach(y=>{
    const o = document.createElement('option');
    o.value = y; o.textContent = y;
    yearSelect.appendChild(o);
  });
  MONTHS.forEach((m,i)=>{
    const o = document.createElement('option');
    o.value = i; o.textContent = m;
    monthSelect.appendChild(o);
  });

  yearSelect.value = YEARS[0];
  monthSelect.value = (new Date()).getMonth(); // default current month if within range
}

// --- render calendar for month/year ---
function renderCalendar(){
  calendarEl.innerHTML = '';
  const year = parseInt(yearSelect.value);
  const month = parseInt(monthSelect.value);

  // week day headers
  const weekDays = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
  weekDays.forEach(w=>{
    const h = document.createElement('div');
    h.className = 'day header'; h.style.fontWeight='700';
    h.textContent = w;
    calendarEl.appendChild(h);
  });

  const first = new Date(year, month, 1);
  const last = new Date(year, month+1, 0);
  const startDay = first.getDay();
  const totalDays = last.getDate();

  // fill empty slots
  for(let i=0;i<startDay;i++){
    const blank = document.createElement('div');
    blank.className = 'day'; blank.style.opacity=0;
    calendarEl.appendChild(blank);
  }

  const appointments = getAppointments();

  for(let d=1; d<=totalDays; d++){
    const date = new Date(year,month,d);
    const iso = date.toISOString().slice(0,10);
    const dayEl = document.createElement('div');
    dayEl.className = 'day';
    dayEl.dataset.date = iso;

    const num = document.createElement('div');
    num.className='num';
    num.textContent = d;
    dayEl.appendChild(num);

    // list appointments (small)
    const apForDay = appointments.filter(a => a.date === iso);
    if(apForDay.length){
      dayEl.classList.add('booked');
      const preview = document.createElement('div');
      preview.style.position='absolute';
      preview.style.bottom='6px';
      preview.style.left='8px';
      preview.style.right='8px';
      preview.style.fontSize='12px';
      preview.textContent = apForDay.map(a=>`${a.time} ${a.name}`).join(' • ');
      dayEl.appendChild(preview);
    }

    dayEl.addEventListener('click', ()=> openModalForDate(iso));
    calendarEl.appendChild(dayEl);
  }
}

// --- modal handling ---
function openModalForDate(iso){
  selectedDateIso = iso;
  apDate.value = iso;
  apTime.value = '';
  apModel.value = '';
  apName.value = '';
  apValue.value = '';
  editingId = null;
  // if existing appointment for that date and time? show list — for simplicity allow multiple appointments
  modal.classList.remove('hidden');
}

modalClose.addEventListener('click', ()=> modal.classList.add('hidden'));
modal.addEventListener('click', (e)=>{ if(e.target===modal) modal.classList.add('hidden'); });

apForm.addEventListener('submit', (e)=>{
  e.preventDefault();
  const list = getAppointments();
  const ap = {
    id: Date.now().toString(),
    date: apDate.value,
    time: apTime.value,
    model: apModel.value,
    name: apName.value,
    value: parseFloat(apValue.value) || 0
  };
  list.push(ap);
  saveAppointments(list);
  modal.classList.add('hidden');
  renderCalendar();
  updateFinanceDisplay(); // keep finance sync
});

// --- finance ---
function buildMonthsList(){
  monthsList.innerHTML = '';
  const year = parseInt(yearSelect.value);
  MONTHS.forEach((m,i)=>{
    const btn = document.createElement('button');
    btn.textContent = m + ' ' + year;
    btn.dataset.month = i;
    btn.addEventListener('click', ()=> showMonthFinance(i, year));
    monthsList.appendChild(btn);
  });
}
function showMonthFinance(monthIndex, year){
  const list = getAppointments();
  const total = list
    .filter(a=>{
      const d = new Date(a.date + 'T00:00:00');
      return d.getFullYear() === year && d.getMonth() === monthIndex;
    })
    .reduce((s,a)=> s + (parseFloat(a.value) || 0), 0);
  financeTitle.textContent = `${MONTHS[monthIndex]} ${year}`;
  financeAmount.textContent = 'R$ ' + total.toFixed(2);
}
function updateFinanceDisplay(){
  // keep current selected month if any
  const curTitle = financeTitle.textContent;
  if(curTitle && curTitle !== 'Selecione um mês'){
    const parts = curTitle.split(' ');
    const monthName = parts[0];
    const year = parseInt(parts[1]);
    const mIndex = MONTHS.indexOf(monthName);
    if(mIndex >= 0) showMonthFinance(mIndex, year);
  }
}

// --- toggle panels ---
btnAgenda.addEventListener('click', ()=>{
  btnAgenda.classList.add('active');
  btnFinance.classList.remove('active');
  agendaSection.classList.remove('hidden');
  financeSection.classList.add('hidden');
});
btnFinance.addEventListener('click', ()=>{
  btnFinance.classList.add('active');
  btnAgenda.classList.remove('active');
  agendaSection.classList.add('hidden');
  financeSection.classList.remove('hidden');
  buildMonthsList();
});

// --- on change ---
yearSelect.addEventListener('change', ()=>{
  renderCalendar();
  buildMonthsList();
});
monthSelect.addEventListener('change', renderCalendar);

// init
initSelectors();
renderCalendar();
