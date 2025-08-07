const STORAGE_KEY = 'guildTableData'; // Key for localStorage
const NUM_ROWS = 28; // MODIFICATO: Da 12 a 28

// --- NUOVA FUNZIONE AUSILIARIA per gestire il fuso orario ---
function getDominionDate() {
    const now = new Date();
    // Sposta l'oggetto data indietro di 2 ore per allineare l'ora e il giorno
    now.setUTCHours(now.getUTCHours() - 2);
    return now;
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
        nameInput.addEventListener('input', saveTableData);
        cell1.appendChild(nameInput);

        // Bottone di sincronizzazione
        const syncButton = document.createElement('button');
        syncButton.type = 'button';
        syncButton.textContent = '✅';
        syncButton.className = 'sync-button';
        syncButton.addEventListener('click', () => {
            const dayInput = cell2.querySelector('input[type="number"]');
            const currentDay = getDominionDate().getUTCDate(); // CORRETTO
            dayInput.value = currentDay;
            checkRowCondition({ target: dayInput });
            saveTableData();
        });
        cell2.appendChild(syncButton);

        // Textbox for day (numbers between 1 and 31)
        const dayInput = document.createElement('input');
        dayInput.type = 'number';
        dayInput.min = 1;
        dayInput.max = 31;
        dayInput.placeholder = 'Day';
        dayInput.addEventListener('input', checkRowCondition);
        dayInput.addEventListener('input', saveTableData);
        cell2.appendChild(dayInput);

        // Populate with loaded data if available
        if (loadedData && loadedData[i]) {
            nameInput.value = loadedData[i].name;
            dayInput.value = loadedData[i].day;
            checkRowCondition({ target: dayInput });
        }
    }
}

// Function to check condition and highlight the row
function checkRowCondition(event) {
    const inputElement = event.target;
    const row = inputElement.closest('tr');

    // CORRETTO: Usa la data di Dominion per coerenza
    const currentDay = getDominionDate().getUTCDate();
    const inputValue = parseInt(inputElement.value, 10);

    if (!isNaN(inputValue) && inputValue >= 1 && inputValue <= 31 && inputValue === currentDay) {
        row.classList.add('highlight-row');
    } else {
        row.classList.remove('highlight-row');
    }
}

// --- Initialization ---
updateClock();
setInterval(updateClock, 60000); // Update every 60 seconds (1 minute)

generateTableRows(NUM_ROWS);
