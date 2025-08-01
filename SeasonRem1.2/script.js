document.addEventListener('DOMContentLoaded', function () {
    const tableBody = document.getElementById('tableBody');
    const tableHead = document.querySelector('thead');
    const LOCAL_STORAGE_PREFIX = 'seasonTaskLog_row_';
    const countdownElement = document.getElementById('countdown');

    if (tableBody && tableHead) {
        // Nuovo listener per il reset delle colonne intere
        tableHead.addEventListener('click', function (event) {
            const target = event.target;
            if (target.classList.contains('reset-header')) {
                const resetTarget = target.dataset.resetTarget;
                if (resetTarget) {
                    const rows = document.querySelectorAll('.data-row');
                    rows.forEach(row => {
                        handleReset(row, resetTarget);
                    });
                }
            }
        });

        // Event delegation per i click sui pulsanti di reset delle singole righe
        tableBody.addEventListener('click', function (event) {
            const target = event.target;
            if (target.classList.contains('reset-button')) {
                const row = target.closest('.data-row');
                if (row) {
                    const resetTarget = target.dataset.resetTarget;
                    if (resetTarget) {
                        handleReset(row, resetTarget);
                    }
                }
            }
        });

        // Event delegation per i cambiamenti di input (checkbox e campi di testo)
        tableBody.addEventListener('change', function (event) {
            const target = event.target;
            if (target.tagName === 'INPUT') {
                const row = target.closest('.data-row');
                if (row) {
                    // Salviamo sempre i dati quando un campo cambia
                    saveRowData(row);
                    // Gestiamo la classe 'active' per il nome
                    if (target.classList.contains('name-toggle')) {
                        togglePlayerNameBackground(row, target.checked);
                    }
                }
            }
        });

        // Event listener per l'input del campo di testo per salvare ad ogni digitazione
        tableBody.addEventListener('input', function (event) {
            const target = event.target;
            if (target.id.startsWith('playerName_')) {
                const row = target.closest('.data-row');
                if (row) {
                    saveRowData(row);
                }
            }
        });

        // Carica i dati all'avvio della pagina
        document.querySelectorAll('.data-row').forEach(loadRowData);

        // Avvia il countdown
        if (countdownElement) {
            updateCountdown();
            setInterval(updateCountdown, 1000);
        }

    } else {
        console.error("Elemento tbody, thead o countdown con id/tag specifici non trovato!");
    }

    /**
     * Gestisce il reset delle checkbox per una riga specifica.
     * @param {HTMLElement} row L'elemento tr della riga.
     * @param {string} resetTarget Il prefisso delle checkbox da resettare (es. 'dailyTasks').
     */
    function handleReset(row, resetTarget) {
        const rowSuffix = row.dataset.rowSuffix;
        const savedData = loadRowDataFromStorage(rowSuffix);

        if (!savedData) return;

        // Reset dei valori nell'oggetto dati
        if (resetTarget === "dailyTasks") {
            savedData.dailyTasks = [false, false, false, false];
        } else if (resetTarget === "3dayTasks") {
            savedData.threeDayTasks = [false, false];
        } else if (resetTarget === "weeklyTasks") {
            savedData.weeklyTasks = [false, false];
        }

        // Salvataggio dei nuovi dati in localStorage
        saveRowDataToStorage(rowSuffix, savedData);

        // Aggiornamento del DOM per riflettere i cambiamenti
        updateRowDOM(row, savedData);
    }

    /**
     * Aggiorna le classi CSS per il nome del giocatore in base allo stato del toggle.
     * @param {HTMLElement} row L'elemento tr della riga.
     * @param {boolean} isChecked Lo stato della checkbox 'name-toggle'.
     */
    function togglePlayerNameBackground(row, isChecked) {
        const rowSuffix = row.dataset.rowSuffix;
        const playerNameInput = document.getElementById(`playerName${rowSuffix}`);
        if (playerNameInput) {
            playerNameInput.classList.toggle('active', isChecked);
        }
    }

    /**
     * Salva i dati di una riga in localStorage come oggetto JSON.
     * @param {HTMLElement} row L'elemento tr della riga.
     */
    function saveRowData(row) {
        const rowSuffix = row.dataset.rowSuffix;
        const playerNameInput = document.getElementById(`playerName${rowSuffix}`);
        const playerNameToggle = document.getElementById(`playerNameToggle${rowSuffix}`);

        const dailyTasks = Array.from(row.querySelectorAll('[id^="dailyTask"]')).map(cb => cb.checked);
        const threeDayTasks = Array.from(row.querySelectorAll('[id^="3dayTask"]')).map(cb => cb.checked);
        const weeklyTasks = Array.from(row.querySelectorAll('[id^="weeklyTask"]')).map(cb => cb.checked);

        const data = {
            playerName: playerNameInput.value,
            playerNameToggle: playerNameToggle.checked,
            dailyTasks: dailyTasks,
            threeDayTasks: threeDayTasks,
            weeklyTasks: weeklyTasks
        };

        saveRowDataToStorage(rowSuffix, data);
    }

    /**
     * Carica i dati di una riga da localStorage e aggiorna il DOM.
     * @param {HTMLElement} row L'elemento tr della riga.
     */
    function loadRowData(row) {
        const rowSuffix = row.dataset.rowSuffix;
        const savedData = loadRowDataFromStorage(rowSuffix);

        if (savedData) {
            updateRowDOM(row, savedData);
        }
    }

    /**
     * Carica un oggetto dati da localStorage per un dato suffisso di riga.
     * @param {string} rowSuffix Il suffisso della riga (es. '_row1').
     * @returns {object|null} L'oggetto dati o null se non trovato.
     */
    function loadRowDataFromStorage(rowSuffix) {
        const key = LOCAL_STORAGE_PREFIX + rowSuffix;
        const savedData = localStorage.getItem(key);
        try {
            return savedData ? JSON.parse(savedData) : null;
        } catch (e) {
            console.error(`Errore nel parsing dei dati di localStorage per la riga ${rowSuffix}:`, e);
            return null;
        }
    }

    /**
     * Salva un oggetto dati in localStorage per un dato suffisso di riga.
     * @param {string} rowSuffix Il suffisso della riga.
     * @param {object} data L'oggetto dati da salvare.
     */
    function saveRowDataToStorage(rowSuffix, data) {
        const key = LOCAL_STORAGE_PREFIX + rowSuffix;
        localStorage.setItem(key, JSON.stringify(data));
    }

    /**
     * Aggiorna gli elementi del DOM di una riga in base a un oggetto dati.
     * @param {HTMLElement} row L'elemento tr della riga.
     * @param {object} data L'oggetto dati con cui aggiornare il DOM.
     */
    function updateRowDOM(row, data) {
        const rowSuffix = row.dataset.rowSuffix;

        const playerNameInput = document.getElementById(`playerName${rowSuffix}`);
        const playerNameToggle = document.getElementById(`playerNameToggle${rowSuffix}`);

        if (playerNameInput) playerNameInput.value = data.playerName || '';
        if (playerNameToggle) playerNameToggle.checked = data.playerNameToggle || false;

        if (data.dailyTasks) {
            row.querySelectorAll('[id^="dailyTask"]').forEach((cb, i) => {
                cb.checked = data.dailyTasks[i] || false;
            });
        }

        if (data.threeDayTasks) {
            row.querySelectorAll('[id^="3dayTask"]').forEach((cb, i) => {
                cb.checked = data.threeDayTasks[i] || false;
            });
        }

        if (data.weeklyTasks) {
            row.querySelectorAll('[id^="weeklyTask"]').forEach((cb, i) => {
                cb.checked = data.weeklyTasks[i] || false;
            });
        }

        // Dopo aver caricato i dati, aggiorniamo lo sfondo del nome
        togglePlayerNameBackground(row, playerNameToggle.checked);
    }

    function updateCountdown() {
        const now = new Date();
        // Calcola il prossimo mezzanotte UTC-2.
        const nextMidnightUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0));
        // Imposta il fuso orario desiderato (UTC-2). L'offset è in minuti.
        const offsetUTCMinus2 = 2 * 60;
        const nextMidnight = new Date(nextMidnightUTC.getTime() + (offsetUTCMinus2 * 60 * 1000));

        // Se l'ora di destinazione è già passata oggi, imposta per domani.
        if (nextMidnight.getTime() <= now.getTime()) {
            nextMidnight.setDate(nextMidnight.getDate() + 1);
        }

        const distance = nextMidnight.getTime() - now.getTime();

        if (distance < 0) {
            countdownElement.innerHTML = "00:00:00";
            return;
        }

        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        countdownElement.innerHTML = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
});