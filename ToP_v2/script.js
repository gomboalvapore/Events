// script.js

document.addEventListener('DOMContentLoaded', () => {
    // Function to apply conditional formatting based on value and column index
    const applyFormatting = (value, colIdx, element) => {
        // Reset background color first
        element.style.backgroundColor = '';

        if (!isNaN(value)) {
            let thresholds;

            if (colIdx === 5) { // Column 6 (index 5 in 0-indexed 9-column row)
                thresholds = [
                    { min: 20, max: 39, color: '#FFFFE0' }, // Giallo molto chiaro
                    { min: 40, max: 59, color: '#FFFFA0' }, // Giallo chiaro
                    { min: 60, max: 79, color: '#FFFF66' }, // Giallo un po' meno
                    { min: 80, max: 99, color: '#FFFF00' }, // Giallo
                    { min: 100, max: 119, color: '#FFCCAA' }, // Arancione chiaro
                    { min: 120, color: '#FFA588' } // Arancione
                ];
            } else if (colIdx === 6) { // Column 7 (index 6) - GoE Sparks
                thresholds = [
                    { min: 40000, max: 79999, color: '#FFFFE0' },
                    { min: 80000, max: 119999, color: '#FFFFA0' },
                    { min: 120000, max: 159999, color: '#FFFF66' },
                    { min: 160000, max: 219999, color: '#FFFF00' },
                    { min: 220000, max: 269999, color: '#FFCCAA' },
                    { min: 270000, color: '#FFA588' }
                ];
            } else if (colIdx === 7) { // Column 8 (index 7) - Art.Coin
                 thresholds = [
                    { min: 20000, max: 39999, color: '#FFFFE0' },
                    { min: 40000, max: 59999, color: '#FFFFA0' },
                    { min: 60000, max: 79999, color: '#FFFF66' },
                    { min: 80000, max: 99999, color: '#FFFF00' },
                    { min: 100000, max: 119999, color: '#FFCCAA' },
                    { min: 120000, color: '#FFA588' }
                ];
            }

            // Apply color based on thresholds
            if (thresholds) {
                for (const range of thresholds) {
                    if (range.max !== undefined) {
                        if (value >= range.min && value <= range.max) {
                            element.style.backgroundColor = range.color;
                            break; // Exit loop once a range is matched
                        }
                    } else { // For the greater than or equal to case
                        if (value >= range.min) {
                            element.style.backgroundColor = range.color;
                            break; // Exit loop once a range is matched
                        }
                    }
                }
            }
        }
    };

    // Function to process ALL grid cells (add listeners, load/save data, apply formatting)
    const processAllGridElements = () => {
        // Select all grid cells currently in the document
        const gridCells = document.querySelectorAll('.grid-container > .grid-cell');

        gridCells.forEach((cell, index) => { // index is the cell's position in the gridCells NodeList
             // Calculate the column index for the current cell
             const columnIndex = index % 9; // Correct for 9 columns per row

            // Handle text areas (columns 0, 5, 6, 7)
            const textarea = cell.querySelector('textarea');
            if (textarea) {
                 // Generate a unique storage key
                const storageKey = `cell-${index}-textarea`; // Key based on overall index
                textarea.dataset.storageKey = storageKey; // Store key on the element

                // Load saved data
                const savedValue = localStorage.getItem(storageKey);
                if (savedValue !== null) {
                    textarea.value = savedValue;
                }

                // Add input listener to save data and apply formatting
                // Add listener only once
                if (!textarea.dataset.listenerAdded) {
                    textarea.addEventListener('input', () => {
                        localStorage.setItem(storageKey, textarea.value); // Save data
                        let value = parseFloat(textarea.value);
                        // Apply multiplication for specific columns and then formatting
                        if (columnIndex === 6 || columnIndex === 7) {
                            value *= 1000;
                        }
                        // Apply formatting if it's a target column
                         if ([5, 6, 7].includes(columnIndex)) {
                            applyFormatting(value, columnIndex, textarea);
                         }
                    });
                     textarea.dataset.listenerAdded = 'true'; // Mark listener as added
                }

                // Apply formatting on load AFTER potentially loading data
                let initialValue = parseFloat(textarea.value);
                // Apply multiplication for specific columns on load
                 if (columnIndex === 6 || columnIndex === 7) {
                    initialValue *= 1000;
                }
                // Apply formatting only if it's a target column
                if ([5, 6, 7].includes(columnIndex)) {
                    applyFormatting(initialValue, columnIndex, textarea);
                }
            }

            // Handle select elements (columns 1, 2, 3, 4)
            const select = cell.querySelector('select');
            if (select) {
                 // Generate a unique storage key
                const storageKey = `cell-${index}-select`; // Key based on overall index
                select.dataset.storageKey = storageKey; // Store key on the element

                // Load saved data
                const savedValue = localStorage.getItem(storageKey);
                if (savedValue !== null) {
                    select.value = savedValue; // Set select value
                }

                // Add change listener to save data
                if (!select.dataset.listenerAdded) {
                    select.addEventListener('change', () => {
                        localStorage.setItem(storageKey, select.value); // Save data
                        // No conditional formatting based on select values in this case
                    });
                    select.dataset.listenerAdded = 'true'; // Mark listener as added
                }
                // Trigger change event to potentially apply any logic on load AFTER loading data
                select.dispatchEvent(new Event('change'));
            }

            // Handle Reset Button (column 8)
            const resetButton = cell.querySelector('.reset-button');
            if (resetButton) {
                if (!resetButton.dataset.listenerAdded) {
                    resetButton.addEventListener('click', () => {
                        // Find all textareas and selects in the SAME player row
                        // The button's parent is the grid cell, and its grandparent is the grid container
                        // Need to find all cells in the same row as the reset button's cell
                        const rowIndex = Math.floor(index / 9);
                        const startCellIndex = rowIndex * 9;
                        const endCellIndex = startCellIndex + 9;

                        for (let i = startCellIndex; i < endCellIndex; i++) {
                            const targetCell = gridCells[i];
                            const textareaToReset = targetCell.querySelector('textarea:not(.player-name-input)');
                            const selectToReset = targetCell.querySelector('select');

                            if (textareaToReset) {
                                textareaToReset.value = ''; // Reset textarea value
                                localStorage.removeItem(textareaToReset.dataset.storageKey); // Clear local storage
                                applyFormatting(null, i % 9, textareaToReset); // Reset formatting
                            }
                            if (selectToReset) {
                                selectToReset.selectedIndex = 0; // Reset select dropdown to the first option
                                localStorage.removeItem(selectToReset.dataset.storageKey); // Clear local storage
                            }
                        }
                    });
                    resetButton.dataset.listenerAdded = 'true';
                }
            }
        });
    };

    // Function to dynamically fetch HTML content and append it to the grid container
    const fetchAndAppendContent = (filename) => {
        return fetch(filename)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.text();
            })
            .then(html => {
                // Create a temporary div to parse the fetched HTML
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = html;

                // Get the grid container
                const gridContainer = document.querySelector('.grid-container');

                // Get the content of the main div within the fetched file
                const contentToAppend = tempDiv.firstElementChild; // Assuming the first element is the main container div

                if (gridContainer && contentToAppend) {
                     while (contentToAppend.firstChild) {
                        gridContainer.appendChild(contentToAppend.firstChild);
                    }
                } else {
                    console.error(`Grid container or content from ${filename} not found.`);
                }
            })
            .catch(error => {
                console.error(`Error fetching content from ${filename}:`, error);
            });
    };

    // Fetch and append content from both additional files in sequence
    fetchAndAppendContent('additional_rows.html')
        .then(() => fetchAndAppendContent('more_additional_rows.html')) // Fetch the second file after the first is done
        .finally(() => {
            // IMPORTANT: Process all grid elements AFTER all dynamic content is loaded and appended
            processAllGridElements();
        });

});