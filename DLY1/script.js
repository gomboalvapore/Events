// JavaScript per gestire interazioni e permanenza dati
document.addEventListener('DOMContentLoaded', function() {
    const textInputs = document.querySelectorAll('.grid-item.header input[type="text"]');
    const checkboxes = document.querySelectorAll('.item-checkbox');
    const dropdowns = document.querySelectorAll('.item-dropdown');
    const chargesDropdowns = document.querySelectorAll('.item-dropdown-charges'); // Select the new charges dropdowns
    const resetButtons = document.querySelectorAll('.reset-button'); // Seleziona i pulsanti di reset

    const localStorageKey = 'gridState'; // Chiave per localStorage

    // Definisce i valori massimi per i dropdown numerici (existing)
    const maxValues = {
        'elemental': '1200',
        'essence': '1200',
        'sparks': '450',
        'pet': '250',
        'runes': '2500',
        'activity': '1750'
    };

     // Definisce le opzioni del dropdown Buy Energy per la colorazione (existing)
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

        // Salva i valori selezionati nei dropdown (existing and new)
        dropdowns.forEach(dropdown => {
            state[dropdown.id] = dropdown.value;
        });
        chargesDropdowns.forEach(dropdown => { // Save state for charges dropdowns
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
                    // La colorazione è gestita via CSS per le checkbox esistenti
                }
            });

            // Ripristina i valori selezionati nei dropdown (existing and new)
            dropdowns.forEach(dropdown => {
                 if (state[dropdown.id] !== undefined) {
                    dropdown.value = state[dropdown.id];
                    // Aggiorna il colore del dropdown dopo aver impostato il valore
                    updateDropdownColor(dropdown);
                }
            });
             chargesDropdowns.forEach(dropdown => { // Load state for charges dropdowns
                 if (state[dropdown.id] !== undefined) {
                    dropdown.value = state[dropdown.id];
                    // Aggiorna il colore del dropdown dopo aver impostato il valore
                    updateDropdownColor(dropdown); // Use the same update function
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

        // Trova tutti i dropdown nella colonna (existing and new)
        dropdowns.forEach(dropdown => {
            if (dropdown.id.startsWith(playerPrefix)) {
                // Resetta al primo valore (che è sempre '0' for existing numerical dropdowns)
                dropdown.value = dropdown.querySelector('option:first-child').value;
                // Aggiorna il colore del dropdown
                updateDropdownColor(dropdown);
            }
        });
         chargesDropdowns.forEach(dropdown => { // Reset charges dropdowns
            if (dropdown.id.startsWith(playerPrefix)) {
                dropdown.value = 'check'; // Reset to 'check' for charges dropdown
                updateDropdownColor(dropdown); // Update color
            }
        });


        // Salva lo stato dopo il reset
        saveState();
    }


    // Funzione per aggiornare il colore del dropdown (handles both types)
    function updateDropdownColor(dropdown) {
        const selectedValue = dropdown.value;
        const gridItem = dropdown.closest('.grid-item');
        const itemType = gridItem ? gridItem.dataset.itemType : null;

        // Rimuovi classi di colore precedenti (add new color classes here)
        dropdown.classList.remove(
            'bg-orange',
            'bg-light-olive',
            'bg-very-light-green',
            'bg-yellow',
            'bg-intense-orange',
            'bg-light-orange',
            'bg-light-green',
            'bg-green'
        );

        if (itemType === 'buy_energy') {
            // Logica di colorazione specifica per Buy Energy (existing)
            const selectedIndex = buyEnergyOptions.indexOf(selectedValue);

            if (selectedIndex >= 0 && selectedIndex <= 1) {
                 dropdown.classList.add('bg-orange');
            } else if (selectedIndex >= 2 && selectedIndex <= 6) {
                 dropdown.classList.add('bg-very-light-green');
            } else if (selectedIndex >= 7) {
                 dropdown.classList.add('bg-light-olive');
            }
        } else if (itemType === 'adventure') {
            // Logica di colorazione specifica per il nuovo dropdown 'charges'
            switch (selectedValue) {
                case 'check':
                    dropdown.classList.add('bg-yellow');
                    break;
                case '0':
                    dropdown.classList.add('bg-green');
                    break;
                case '1':
                    dropdown.classList.add('bg-light-green');
                    break;
                case '2':
                    dropdown.classList.add('bg-light-orange');
                    break;
                case '3':
                case '4+':
                    dropdown.classList.add('bg-intense-orange');
                    break;
                 default:
                    // Default color if value doesn't match (light grey from CSS)
                    break;
            }
        }

         else {
            // Logica di colorazione per gli altri dropdown (0 e max value) (existing)
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

    // Listener per checkbox e dropdown (update to include new class)
    document.querySelectorAll('.item-checkbox, .item-dropdown, .item-dropdown-charges').forEach(element => {
        element.addEventListener('change', function() {
            saveState();
            if (element.classList.contains('item-dropdown') || element.classList.contains('item-dropdown-charges')) {
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

    // Applica colore iniziale ai dropdown all'avvio (dopo il caricamento dello stato) (update to include new class)
    document.querySelectorAll('.item-dropdown, .item-dropdown-charges').forEach(dropdown => {
        updateDropdownColor(dropdown);
    });

});