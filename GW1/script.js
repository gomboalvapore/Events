const STORAGE_KEY = 'guildTableData'; // Key for localStorage
const ALERT_CONFIG_STORAGE_KEY = 'alertConfigData'; // Key for alert config localStorage
let isGreen = true; // Global variable for blinking color

// --- Clock Update Function ---
function updateClock() {
    const now = new Date(); // Ora corrente del client

    // Calcola l'ora attuale nel fuso orario UTC-2
    const currentUTC = now.getTime(); // Millisecondi UTC
    const offsetUTC2 = 2 * 60 * 60 * 1000; // 2 ore in millisecondi per UTC-2
    const nowUTC2Time = new Date(currentUTC - offsetUTC2); // Data e ora simulate in UTC-2

    const displayHours = nowUTC2Time.getUTCHours();
    const displayMinutes = nowUTC2Time.getUTCMinutes();
    const displayDay = nowUTC2Time.getUTCDate();
    const displayDayOfWeek = nowUTC2Time.getUTCDay(); // 0 for Sunday, 1 for Monday, etc.

    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const currentDayName = daysOfWeek[displayDayOfWeek];

    const formattedHours = String(displayHours).padStart(2, '0');
    const formattedMinutes = String(displayMinutes).padStart(2, '0');

    document.getElementById('current-time').textContent = `${currentDayName} - ${formattedHours}:${formattedMinutes} - ${displayDay}`;

    // --- Countdown Timer Logic ---

    // Funzione helper per creare una data target in UTC-2
    function createTargetDateUTC2(hourUTC2, minuteUTC2, secondUTC2) {
        const targetDate = new Date(now); // Inizia dall'ora corrente del client
        // Imposta l'ora UTC per riflettere l'ora desiderata in UTC-2
        // Se voglio 18:00 UTC-2, devo impostare 20:00 UTC
        targetDate.setUTCHours(hourUTC2 + 2);
        targetDate.setUTCMinutes(minuteUTC2);
        targetDate.setUTCSeconds(secondUTC2);
        targetDate.setUTCMilliseconds(0);

        // Se la data target calcolata è prima dell'ora UTC del client, sposta al giorno successivo
        const targetTimeInMs = targetDate.getTime();
        if (targetTimeInMs < currentUTC) { // Confronta con l'ora UTC del client
            targetDate.setUTCDate(targetDate.getUTCDate() + 1);
        }
        return targetDate;
    }

    // Countdown "ends in" (18 PM UTC-2)
    const targetDateEndsIn = createTargetDateUTC2(18, 0, 0); // 6 PM UTC-2
    const timeLeftEndsIn = targetDateEndsIn.getTime() - now.getTime();

    // Countdown "starts in" (7 AM UTC-2)
    const targetDateStartsIn = createTargetDateUTC2(7, 0, 0); // 7 AM UTC-2
    const timeLeftStartsIn = targetDateStartsIn.getTime() - now.getTime();


    let countdownText = '';
    let chosenTimeLeft;
    let label;

    // Determina quale countdown mostrare (il più vicino)
    if (timeLeftEndsIn <= 0 && timeLeftStartsIn <= 0) {
        countdownText = 'EXPIRED!';
    } else if (timeLeftEndsIn <= 0) { // Se endsIn è già passato, mostra startsIn
        chosenTimeLeft = timeLeftStartsIn;
        label = 'starts in';
    } else if (timeLeftStartsIn <= 0) { // Se startsIn è già passato, mostra endsIn
        chosenTimeLeft = timeLeftEndsIn;
        label = 'ends in';
    } else if (timeLeftEndsIn < timeLeftStartsIn) {
        chosenTimeLeft = timeLeftEndsIn;
        label = 'ends in';
    } else {
        chosenTimeLeft = timeLeftStartsIn;
        label = 'starts in';
    }

    const startsInAlertSpan = document.getElementById('starts-in-alert');
    const startsInBlinkingAlertSpan = document.getElementById('starts-in-blinking-alert');
    const endsInAlertSpan = document.getElementById('ends-in-alert'); // Nuovo span per "ends in" alert

    // Elementi per le caselle "Alert Type"
    const alert1TypeCell = document.getElementById('alert1-type-cell');
    const alert2TypeCell = document.getElementById('alert2-type-cell');
    const alert3TypeCell = document.getElementById('alert3-type-cell');


    // Resetta tutti gli alert per evitare che rimangano visibili se le condizioni non sono più soddisfatte
    startsInAlertSpan.textContent = '';
    startsInBlinkingAlertSpan.textContent = '';
    endsInAlertSpan.textContent = '';
    startsInBlinkingAlertSpan.style.color = ''; // Resetta il colore
    endsInAlertSpan.classList.remove('alert-blue-cyan'); // Rimuovi la classe per Alert 3

    // Rimuovi tutte le classi di sfondo e colore del testo dalle caselle "Alert Type"
    alert1TypeCell.classList.remove('alert-type-background-red');
    alert2TypeCell.classList.remove('alert-type-background-blinking', 'green', 'red', 'alert-type-background-green-static');
    alert2TypeCell.style.color = ''; // Rimuove il colore del testo
    alert3TypeCell.classList.remove('alert-type-background-blue-cyan');

    let alert1Active = false;
    let alert2Active = false;
    let alert3Active = false;

    if (chosenTimeLeft !== undefined) {
        const totalSeconds = Math.floor(chosenTimeLeft / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        const formattedCountdownHours = String(hours).padStart(2, '0');
        const formattedCountdownMinutes = String(minutes).padStart(2, '0');
        const formattedCountdownSeconds = String(seconds).padStart(2, '0');

        countdownText = `${label}: ${formattedCountdownHours}:${formattedCountdownMinutes}:${formattedCountdownSeconds}`;

        // Leggi le configurazioni degli alert
        const alertConfig = loadAlertConfig();

        // Funzione helper per applicare l'alert e colorare la casella "Alert Type"
        function applyAlert(alertSpan, config, currentLabel, currentHours, formattedTime, alertTypeCell, isBlinking = false, isAlert3 = false) {
            const refLabel = config.countdownRef;
            const lowerHour = parseInt(config.lowerHour);
            const upperHour = parseInt(config.upperHour);

            if (currentLabel === refLabel && currentHours >= lowerHour && currentHours < upperHour) {
                alertSpan.textContent = `(${formattedTime})`;
                if (isBlinking) {
                    // Logica di lampeggio per l'alert nel titolo
                    alertSpan.style.color = isGreen ? '#02FF14' : 'red';
                    // Logica di lampeggio per la casella "Alert Type"
                    alertTypeCell.classList.add('alert-type-background-blinking');
                    alertTypeCell.classList.remove('alert-type-background-green-static'); // Rimuovi sfondo statico
                    if (isGreen) {
                        alertTypeCell.classList.add('green');
                        alertTypeCell.classList.remove('red');
                    } else {
                        alertTypeCell.classList.add('red');
                        alertTypeCell.classList.remove('green');
                    }
                    alertTypeCell.style.color = isGreen ? 'black' : 'white'; // Testo in base al colore dello sfondo
                } else if (isAlert3) {
                    alertSpan.classList.add('alert-blue-cyan');
                    alertTypeCell.classList.add('alert-type-background-blue-cyan');
                } else {
                    alertSpan.classList.add('alert-red');
                    alertTypeCell.classList.add('alert-type-background-red');
                }
                return true; // Alert applicato
            }
            return false; // Alert non applicato
        }

        // Gestione Alert 1 (Non-Blink)
        if (alertConfig.alert1) {
            alert1Active = applyAlert(startsInAlertSpan, alertConfig.alert1, label, hours, `${formattedCountdownHours}:${formattedCountdownMinutes}:${formattedCountdownSeconds}`, alert1TypeCell);
        }
        if (!alert1Active) {
            alert1TypeCell.classList.add('alert-type-background-red'); // Applica il colore predefinito se non attivo
        }

        // Gestione Alert 2 (Blinking)
        if (alertConfig.alert2) {
            alert2Active = applyAlert(startsInBlinkingAlertSpan, alertConfig.alert2, label, hours, `${formattedCountdownHours}:${formattedCountdownMinutes}:${formattedCountdownSeconds}`, alert2TypeCell, true);
        }
        if (!alert2Active) {
            // Se Alert 2 non è attivo, applica lo sfondo verde fisso e il testo rosso
            alert2TypeCell.classList.add('alert-type-background-green-static');
            alert2TypeCell.classList.remove('alert-type-background-blinking', 'green', 'red'); // Rimuovi le classi di lampeggio
            alert2TypeCell.style.color = 'red'; // Testo rosso
        }

        // Gestione Alert 3 (Non-Blink per "ends in" o "starts in" a seconda della configurazione)
        if (alertConfig.alert3) {
            alert3Active = applyAlert(endsInAlertSpan, alertConfig.alert3, label, hours, `${formattedCountdownHours}:${formattedCountdownMinutes}:${formattedCountdownSeconds}`, alert3TypeCell, false, true);
        }
        if (!alert3Active) {
            alert3TypeCell.classList.add('alert-type-background-blue-cyan'); // Applica il colore predefinito se non attivo
        }

        // Toggle colore per il blinking alert
        isGreen = !isGreen;
    } else {
        // Se non c'è nessun countdown attivo, assicurati che i colori di default siano impostati
        alert1TypeCell.classList.add('alert-type-background-red');
        alert2TypeCell.classList.add('alert-type-background-green-static'); // Verde statico
        alert2TypeCell.style.color = 'red'; // Testo rosso
        alert3TypeCell.classList.add('alert-type-background-blue-cyan');
    }

    document.getElementById('countdown-timer').textContent = countdownText;

    // Chiamare la funzione per applicare la formattazione alle righe
    applyRowFormatting(alert1Active, alert2Active, alert3Active, label === 'starts in');
}

// Funzione per applicare la formattazione condizionale alle righe della tabella principale
function applyRowFormatting(isAlert1Active, isAlert2Active, isAlert3Active, isStartsInCountdown) {
    const tableRows = document.querySelectorAll('#guildTable tbody tr');

    tableRows.forEach(row => {
        // Rimuovi tutte le classi di formattazione precedenti per evitare sovrapposizioni
        row.classList.remove(
            'highlight-row',
            'row-alert-red',
            'row-alert-blue-cyan',
            'row-alert-blinking', 'red', 'green',
            'row-dark-grey'
        );
        row.style.color = ''; // Resetta il colore del testo della riga

        const checkbox = row.cells[0].querySelector('input[type="checkbox"]');
        const dayInput1 = row.cells[2].querySelector('input[type="number"]');
        const dayInput2 = row.cells[3].querySelector('input[type="number"]');

        // Per il confronto del giorno, usiamo l'ora UTC-2 simulata
        const now = new Date();
        const currentUTC = now.getTime();
        const offsetUTC2 = 2 * 60 * 60 * 1000;
        const nowUTC2Time = new Date(currentUTC - offsetUTC2);
        const currentDayUTC2 = nowUTC2Time.getUTCDate();

        const inputValue1 = parseInt(dayInput1.value, 10);
        const inputValue2 = parseInt(dayInput2.value, 10);

        let hasGreenHighlight = false;

        // Priorità 1: Colorazione verde (highlight-row)
        if (checkbox && !checkbox.checked) {
            hasGreenHighlight = true;
        } else if (checkbox && checkbox.checked &&
                   !isNaN(inputValue1) && inputValue1 >= 1 && inputValue1 <= 31 && inputValue1 === currentDayUTC2 &&
                   !isNaN(inputValue2) && inputValue2 >= 1 && inputValue2 <= 31 && inputValue2 === currentDayUTC2) {
            hasGreenHighlight = true;
        }

        if (hasGreenHighlight) {
            row.classList.add('highlight-row');
        } else {
            // Priorità 2: Colore dell'alert attivo (se non c'è il verde)
            if (isAlert2Active) {
                row.classList.add('row-alert-blinking');
                if (isGreen) { // isGreen è il toggle per il lampeggio
                    row.classList.add('green');
                    row.classList.remove('red');
                    row.style.color = 'black';
                } else {
                    row.classList.add('red');
                    row.classList.remove('green');
                    row.style.color = 'white';
                }
            } else if (isAlert1Active) {
                row.classList.add('row-alert-red');
            } else if (isAlert3Active) {
                row.classList.add('row-alert-blue-cyan');
            } else if (isStartsInCountdown) {
                // Priorità 3: Grigio scuro se "starts in" è il countdown attivo (senza alert)
                row.classList.add('row-dark-grey');
            }
        }
    });
}


// --- Data Handling Functions ---

// Funzione per salvare la configurazione degli alert in localStorage
function saveAlertConfig() {
    const config = {
        alert1: {
            countdownRef: document.getElementById('alert1CountdownRef').value,
            lowerHour: document.getElementById('alert1LowerHour').value,
            upperHour: document.getElementById('alert1UpperHour').value
        },
        alert2: {
            countdownRef: document.getElementById('alert2CountdownRef').value,
            lowerHour: document.getElementById('alert2LowerHour').value,
            upperHour: document.getElementById('alert2UpperHour').value
        },
        alert3: { // Salva la configurazione del nuovo alert
            countdownRef: document.getElementById('alert3CountdownRef').value,
            lowerHour: document.getElementById('alert3LowerHour').value,
            upperHour: document.getElementById('alert3UpperHour').value
        }
    };
    localStorage.setItem(ALERT_CONFIG_STORAGE_KEY, JSON.stringify(config));
    // Richiama updateClock per aggiornare immediatamente i colori dopo il salvataggio
    updateClock();
}

// Funzione per caricare la configurazione degli alert da localStorage
function loadAlertConfig() {
    const storedConfig = localStorage.getItem(ALERT_CONFIG_STORAGE_KEY);
    if (storedConfig) {
        return JSON.parse(storedConfig);
    }
    // Valori di default se non ci sono dati salvati
    return {
        alert1: { countdownRef: 'ends in', lowerHour: '1', upperHour: '3' },
        alert2: { countdownRef: 'ends in', lowerHour: '0', upperHour: '1' },
        alert3: { countdownRef: 'starts in', lowerHour: '0', upperHour: '2' }
    };
}

// Funzione per applicare la configurazione caricata agli input E ai colori di default
function applyAlertConfigToInputs() {
    const config = loadAlertConfig();

    document.getElementById('alert1CountdownRef').value = config.alert1.countdownRef;
    document.getElementById('alert1LowerHour').value = config.alert1.lowerHour;
    document.getElementById('alert1UpperHour').value = config.alert1.upperHour;
    document.getElementById('alert1-type-cell').classList.add('alert-type-background-red'); // Colore di default per Alert 1

    document.getElementById('alert2CountdownRef').value = config.alert2.countdownRef;
    document.getElementById('alert2LowerHour').value = config.alert2.lowerHour;
    document.getElementById('alert2UpperHour').value = config.alert2.upperHour;
    // Colore di default per Alert 2: sfondo verde, testo rosso
    document.getElementById('alert2-type-cell').classList.add('alert-type-background-green-static');
    document.getElementById('alert2-type-cell').style.color = 'red';


    document.getElementById('alert3CountdownRef').value = config.alert3.countdownRef;
    document.getElementById('alert3LowerHour').value = config.alert3.lowerHour;
    document.getElementById('alert3UpperHour').value = config.alert3.upperHour;
    document.getElementById('alert3-type-cell').classList.add('alert-type-background-blue-cyan'); // Colore di default per Alert 3

    // Assicurati che l'updateClock() venga chiamato per gestire il lampeggio e l'override se gli alert sono attivi
    updateClock();
}


// Function to save data to localStorage (existing table data)
function saveTableData() {
    const tableBody = document.querySelector('#guildTable tbody');
    const rowData = [];
    const numRowsToSave = 12;

    for (let i = 0; i < numRowsToSave; i++) {
        const row = tableBody.rows[i];
        if (row) {
            const checkbox = row.cells[0].querySelector('input[type="checkbox"]');
            const nameInput = row.cells[1].querySelector('input[type="text"]');
            const dayInput1 = row.cells[2].querySelector('input[type="number"]');
            const dayInput2 = row.cells[3].querySelector('input[type="number"]');

            rowData.push({
                checked: checkbox ? checkbox.checked : false,
                name: nameInput ? nameInput.value : '',
                day1: dayInput1 ? dayInput1.value : '',
                day2: dayInput2 ? dayInput2.value : ''
            });
        } else {
            rowData.push({ checked: false, name: '', day1: '', day2: '' });
        }
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rowData));
}

// Function to load data from localStorage (existing table data)
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
        const cell0 = row.insertCell(0); // Cella per la checkbox
        const cell1 = row.insertCell(1); // Cella per il nome
        const cell2 = row.insertCell(2); // Cella per il primo giorno
        const cell3 = row.insertCell(3); // Cella per il secondo giorno

        // Checkbox
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.addEventListener('change', () => {
            saveTableData();
            checkRowCondition({ target: checkbox }); // Continua a chiamare checkRowCondition per la priorità del verde
        });
        cell0.appendChild(checkbox);

        // Textbox for player name (max 30 characters)
        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.maxLength = 30;
        nameInput.placeholder = 'Player Name';
        nameInput.addEventListener('input', saveTableData);
        cell1.appendChild(nameInput);

        // Textbox for day 1 (numbers between 1 and 31)
        const dayInput1 = document.createElement('input');
        dayInput1.type = 'number';
        dayInput1.min = 1;
        dayInput1.max = 31;
        dayInput1.placeholder = 'Day 1';
        dayInput1.addEventListener('input', () => {
            saveTableData();
            checkRowCondition({ target: dayInput1 }); // Continua a chiamare checkRowCondition per la priorità del verde
        });
        cell2.appendChild(dayInput1);

        // Textbox for day 2 (numbers between 1 and 31)
        const dayInput2 = document.createElement('input');
        dayInput2.type = 'number';
        dayInput2.min = 1;
        dayInput2.max = 31;
        dayInput2.placeholder = 'Day 2';
        dayInput2.addEventListener('input', () => {
            saveTableData();
            checkRowCondition({ target: dayInput2 }); // Continua a chiamare checkRowCondition per la priorità del verde
        });
        cell3.appendChild(dayInput2);

        // Populate with loaded data if available
        if (loadedData && loadedData[i]) {
            checkbox.checked = loadedData[i].checked;
            nameInput.value = loadedData[i].name;
            dayInput1.value = loadedData[i].day1;
            dayInput2.value = loadedData[i].day2;
            // checkRowCondition({ target: checkbox }); // Rimuovi la chiamata diretta qui, sarà gestita da applyRowFormatting
        }
    }
}

// Function to check condition for green highlight (only sets hasGreenHighlight for applyRowFormatting)
function checkRowCondition(event) {
    // Questa funzione ora solo salva i dati e forza un update, la logica di highlight si sposta in applyRowFormatting
    saveTableData();
    // Non applica più direttamente la classe highlight-row qui, lo farà applyRowFormatting
    updateClock(); // Richiama updateClock per ricalcolare tutti i colori delle righe
}

// --- Initialization ---

// Inizializza gli event listener per i campi di configurazione degli alert
function setupAlertConfigListeners() {
    const inputs = document.querySelectorAll('#configTable input, #configTable select');
    inputs.forEach(input => {
        input.addEventListener('change', saveAlertConfig);
        input.addEventListener('input', saveAlertConfig); // Cattura anche input per number
    });
}

updateClock();
setInterval(updateClock, 1000); // Aggiorna ogni secondo

generateTableRows(12);
applyAlertConfigToInputs(); // Carica la configurazione degli alert all'avvio e applica i colori di default
setupAlertConfigListeners(); // Imposta i listener per salvare la configurazione

document.querySelectorAll('#guildTable tbody tr').forEach(row => {
    const checkbox = row.cells[0].querySelector('input[type="checkbox"]');
    if (checkbox) {
        // Al caricamento iniziale, simula un cambio per applicare la formattazione iniziale
        checkRowCondition({ target: checkbox });
    }
});