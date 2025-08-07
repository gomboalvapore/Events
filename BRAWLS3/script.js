const STORAGE_KEY = 'guildTableData';
const NUM_ROWS = 28;

// --- NUOVA FUNZIONE AUSILIARIA per gestire il fuso orario ---
function getDominionDate() {
    const now = new Date();
    now.setUTCHours(now.getUTCHours() - 2);
    return now;
}

// --- NUOVA FUNZIONE per verificare se il nome ha almeno 3 lettere ---
function hasMinLetters(text, minCount) {
    const lettersOnly = text.replace(/[^a-zA-Z]/g, '');
    return lettersOnly.length >= minCount;
}

// --- Clock Update Function ---
function updateClock() {
    const dominionTime = getDominionDate();
    const formattedHours = String(dominionTime.getUTCHours()).padStart(2, '0');
    const formattedMinutes = String(dominionTime.getUTCMinutes()).padStart(2, '0');
    document.getElementById('current-time').textContent = `${formattedHours}:${formattedMinutes} - ${dominionTime.getUTCDate()}`;
}

// --- Data Handling Functions ---

// Function to save data to localStorage
function saveTableData() {
    const tableBody = document.querySelector('#guildTable tbody');
    const rowData = [];
    
    for (let i = 0; i < NUM_ROWS; i++) {
        const row = tableBody.rows[i];
        if (row) {
            const nameInput = row.cells[0].querySelector('input[type="text"]');
            const dayInput = row.cells[1].querySelector('input[type="number"]');
            rowData.push({
                name: nameInput ? nameInput.value : '',
                day: dayInput ? dayInput.value : ''
            });
        } else {
            rowData.push({ name: '', day: '' });
        }
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rowData));
}

// Function to load data from localStorage
function loadTableData() {
    const storedData = localStorage.getItem(STORAGE_KEY);
    if (storedData) {
        return JSON.parse(storedData);
    }
    return null;
}

// --- Table Generation & Conditional Formatting ---

// Function to generate table rows
function generateTableRows(numRows) {
    const tableBody = document.querySelector('#guildTable tbody');
    const loadedData = loadTableData();

    for (let i = 0; i < numRows; i++) {
        const row = tableBody.insertRow();
        const cell1 = row.insertCell(0);
        const cell2 = row.insertCell(1);
        cell2.className = 'day-cell';

        // Textbox for player name (max 32 characters)
        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.maxLength = 32;
        nameInput.placeholder = 'Player Name';
        nameInput.addEventListener('input', () => {
            saveTableData();
            checkRowCondition(row);
        });
        cell1.appendChild(nameInput);

        // Bottone di sincronizzazione/avviso (unico elemento)
        const statusButton = document.createElement('button');
        statusButton.type = 'button';
        statusButton.className = 'status-button';
        statusButton.addEventListener('click', () => {
            const dayInput = cell2.querySelector('input[type="number"]');
            const currentDay = getDominionDate().getUTCDate();
            dayInput.value = currentDay;
            checkRowCondition(row);
            saveTableData();
        });
        cell2.appendChild(statusButton);

        // Textbox for day (numbers between 1 and 31)
        const dayInput = document.createElement('input');
        dayInput.type = 'number';
        dayInput.min = 1;
        dayInput.max = 31;
        dayInput.placeholder = 'Day';
        dayInput.addEventListener('input', () => {
            saveTableData();
            checkRowCondition(row);
        });
        cell2.appendChild(dayInput);

        // Populate with loaded data if available
        if (loadedData && loadedData[i]) {
            nameInput.value = loadedData[i].name;
            dayInput.value = loadedData[i].day;
            checkRowCondition(row);
        }
    }
}

// Function to check condition and highlight the row
function checkRowCondition(row) {
    const nameInput = row.cells[0].querySelector('input[type="text"]');
    const dayInput = row.cells[1].querySelector('input[type="number"]');
    const statusButton = row.cells[1].querySelector('.status-button');
    
    const hasName = hasMinLetters(nameInput.value, 3);
    const currentDay = getDominionDate().getUTCDate();
    const inputValue = parseInt(dayInput.value, 10);
    const isCurrentDay = !isNaN(inputValue) && inputValue === currentDay;

    // Se il giorno è quello attuale, mostra ✅ e imposta l'highlight
    if (isCurrentDay) {
        statusButton.textContent = '✅';
        statusButton.style.display = 'inline';
        statusButton.style.cursor = 'pointer';
        row.classList.add('highlight-row');
    }
    // Altrimenti, se il nome è compilato, mostra ⚠️ e rimuovi l'highlight
    else if (hasName) {
        statusButton.textContent = '⚠️';
        statusButton.style.display = 'inline';
        statusButton.style.cursor = 'pointer';
        row.classList.remove('highlight-row');
    }
    // Altrimenti (nome non compilato), mostra ⚪️ e rimuovi l'highlight
    else {
        statusButton.textContent = '⚪️';
        statusButton.style.display = 'inline';
        statusButton.style.cursor = 'default';
        row.classList.remove('highlight-row');
    }
}

// --- Initialization ---
updateClock();
setInterval(updateClock, 60000); // Update every 60 seconds (1 minute)


generateTableRows(NUM_ROWS);
