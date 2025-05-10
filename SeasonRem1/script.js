document.addEventListener('DOMContentLoaded', function() {
    const tableBody = document.getElementById('tableBody');

    if (tableBody) {
        tableBody.addEventListener('click', function(event) {
            const target = event.target;

            if (target.classList.contains('reset-button')) {
                const row = target.closest('.data-row');
                if (row) {
                    const targetId = target.dataset.resetTarget;
                    if (targetId) {
                        resetCheckboxes(row, targetId);
                    } else {
                        console.warn("Pulsante reset cliccato senza data-reset-target:", target);
                    }
                } else {
                    console.warn("Pulsante reset cliccato non all'interno di una riga dati:", target);
                }
            }
        });

        tableBody.addEventListener('change', function(event) {
            const target = event.target;
            if (target.tagName === 'INPUT' && target.type === 'checkbox') {
                const row = target.closest('.data-row');
                if (row) {
                    saveRowData(row);
                }
            }
        });
    } else {
        console.error("Elemento tbody con id 'tableBody' non trovato!");
    }

    function resetCheckboxes(row, targetIdPrefix) {
        const rowSuffix = row.dataset.rowSuffix;
        if (!rowSuffix) {
            console.error("Riga senza data-row-suffix:", row);
            return;
        }

        let checkboxesToReset = [];
        if (targetIdPrefix === "dailyTasks") {
            checkboxesToReset = row.querySelectorAll('[id^="dailyTask"]');
        } else if (targetIdPrefix === "3dayTasks") {
            checkboxesToReset = row.querySelectorAll('[id^="3dayTask"]');
        } else if (targetIdPrefix === "weeklyTasks") {
            checkboxesToReset = row.querySelectorAll('[id^="weeklyTask"]');
        }

        checkboxesToReset.forEach(checkbox => {
            checkbox.checked = false;
            localStorage.setItem(checkbox.id, 'false');
        });
    }

    function saveRowData(row) {
        const rowSuffix = row.dataset.rowSuffix;
        const playerNameInput = document.getElementById(`playerName${rowSuffix}`);
        if (playerNameInput) {
            localStorage.setItem(`playerName${rowSuffix}`, playerNameInput.value);
        }

        const checkboxes = row.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            localStorage.setItem(checkbox.id, checkbox.checked.toString());
        });
    }

    function loadRowData(rowSuffix) {
        const playerNameInput = document.getElementById(`playerName${rowSuffix}`);
        if (playerNameInput) {
            const savedPlayerName = localStorage.getItem(`playerName${rowSuffix}`);
            if (savedPlayerName) {
                playerNameInput.value = savedPlayerName;
            }
        }

        const checkboxes = document.querySelectorAll(`[id$="${rowSuffix}"]`);
        checkboxes.forEach(checkbox => {
            const savedState = localStorage.getItem(checkbox.id);
            if (savedState) {
                checkbox.checked = savedState === 'true';
            }
        });
    }

    // Carica i dati al caricamento della pagina
    const rows = document.querySelectorAll('.data-row');
    rows.forEach(row => {
        const rowSuffix = row.dataset.rowSuffix;
        loadRowData(rowSuffix);
    });
});