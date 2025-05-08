// JavaScript per gestire interazioni e permanenza dati
document.addEventListener('DOMContentLoaded', function() {
    const textInputs = document.querySelectorAll('.grid-item.header input[type="text"]');
    const checkboxes = document.querySelectorAll('.item-checkbox');
    const dropdowns = document.querySelectorAll('.item-dropdown');
    const resetButtons = document.querySelectorAll('.reset-button'); // Seleziona i pulsanti di reset

    const localStorageKey = 'gridState'; // Chiave per localStorage

    // Definisce i valori massimi per i dropdown numerici
    const maxValues = {
        'elemental': '1200',
        'essence': '1200',
        'sparks': '450',
        'pet': '250',
        'runes': '2500',
        'activity': '1750'
    };

     // Definisce le opzioni del dropdown Buy Energy per la colorazione
    const buyEnergyOptions = [
        "0", "1x50💎", "2x50💎", "1x100💎", "2x100💎",
        "3x100💎", "4x100💎", "5x100💎", "more 💎💎💎"
    ];


    // Funzione per salvare lo stato attuale nel localStorage
    function saveState() {
        const state = {};

        // Salva i valori dei campi di testo
        textInputs.forEach(input => {
            state[input.id] = input.value;
        });

        // Salva lo stato delle checkbox
        checkboxes.forEach(checkbox => {
            state[checkbox.id] = checkbox.checked;
        });

        // Salva i valori selezionati nei dropdown
        dropdowns.forEach(dropdown => {
            state[dropdown.id] = dropdown.value;
        });

        localStorage.setItem(localStorageKey, JSON.stringify(state));
    }

    // Funzione per caricare lo stato dal localStorage
    function loadState() {
        const savedState = localStorage.getItem(localStorageKey);

        if (savedState) {
            const state = JSON.parse(savedState);

            // Ripristina i valori dei campi di testo
            textInputs.forEach(input => {
                if (state[input.id] !== undefined) {
                    input.value = state[input.id];
                }
            });

            // Ripristina lo stato delle checkbox
            checkboxes.forEach(checkbox => {
                 if (state[checkbox.id] !== undefined) {
                    checkbox.checked = state[checkbox.id];
                    // La colorazione è gestita via CSS
                }
            });

            // Ripristina i valori selezionati nei dropdown
            dropdowns.forEach(dropdown => {
                 if (state[dropdown.id] !== undefined) {
                    dropdown.value = state[dropdown.id];
                    // Aggiorna il colore del dropdown dopo aver impostato il valore
                    updateDropdownColor(dropdown);
                }
            });
        }
    }

    // Funzione per resettare una specifica colonna
    function resetColumn(playerNumber) {
        const playerPrefix = `player${playerNumber}_`;

        // Trova tutte le checkbox nella colonna
        checkboxes.forEach(checkbox => {
            if (checkbox.id.startsWith(playerPrefix)) {
                checkbox.checked = false; // Resetta lo stato
            }
        });

        // Trova tutti i dropdown nella colonna
        dropdowns.forEach(dropdown => {
            if (dropdown.id.startsWith(playerPrefix)) {
                // Resetta al primo valore (che è sempre '0')
                dropdown.value = dropdown.querySelector('option:first-child').value;
                // Aggiorna il colore del dropdown
                updateDropdownColor(dropdown);
            }
        });

        // Salva lo stato dopo il reset
        saveState();
    }


    // Funzione per aggiornare il colore del dropdown
    function updateDropdownColor(dropdown) {
        const selectedValue = dropdown.value;
        const gridItem = dropdown.closest('.grid-item');
        const itemType = gridItem ? gridItem.dataset.itemType : null;

        // Rimuovi classi di colore precedenti
        dropdown.classList.remove('bg-orange', 'bg-light-olive', 'bg-very-light-green'); // Added new class here

        if (itemType === 'buy_energy') {
            // Logica di colorazione specifica per Buy Energy basata sulla posizione del valore nell'array
            const selectedIndex = buyEnergyOptions.indexOf(selectedValue);

            if (selectedIndex >= 0 && selectedIndex <= 1) { // Indici 0 e 1 (valori "0", "1x50💎")
                 dropdown.classList.add('bg-orange');
            } else if (selectedIndex >= 2 && selectedIndex <= 6) { // Indici da 2 a 6 (valori da "2x50💎" a "4x100💎")
                 dropdown.classList.add('bg-very-light-green'); // Apply very light green
            } else if (selectedIndex >= 7) { // Indici 7 e 8 (valori "5x100💎", "more 💎💎💎")
                 dropdown.classList.add('bg-light-olive'); // Apply light olive green (max value color)
            }
        } else {
            // Logica di colorazione per gli altri dropdown (0 e max value)
            if (selectedValue === '0') {
                dropdown.classList.add('bg-orange');
            } else if (itemType && maxValues[itemType] && selectedValue === maxValues[itemType]) {
                 dropdown.classList.add('bg-light-olive');
            }
        }
         // Se nessuno dei casi sopra si verifica, il colore di sfondo di default (grigio chiaro nel CSS) verrà applicato.
    }

    // Carica lo stato all'avvio della pagina
    loadState();

    // Aggiungi listener per salvare lo stato quando i valori cambiano

    // Listener per i campi di testo
    textInputs.forEach(input => {
        input.addEventListener('input', saveState);
    });

    // Listener per checkbox e dropdown
    document.querySelectorAll('.item-checkbox, .item-dropdown').forEach(element => {
        element.addEventListener('change', function() {
            saveState();
            if (element.classList.contains('item-dropdown')) {
                updateDropdownColor(element);
            }
        });
    });

    // Aggiungi listener per i pulsanti di reset
    resetButtons.forEach(button => {
        button.addEventListener('click', function() {
            const playerNumber = this.dataset.player;
            if (playerNumber) {
                resetColumn(parseInt(playerNumber));
            }
        });
    });

    // Applica colore iniziale ai dropdown all'avvio (dopo il caricamento dello stato)
     // Questa parte viene chiamata DOPO loadState, quindi aggiornerà correttamente i colori iniziali.
    dropdowns.forEach(dropdown => {
        updateDropdownColor(dropdown);
    });

});