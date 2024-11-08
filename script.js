// Función para crear la rejilla de celdas
function createGrid(totalCells) {
    const gridContainer = document.getElementById('grid-container');
    gridContainer.innerHTML = ''; // Limpiar la rejilla anterior

    // Calcular filas y columnas
    const cols = Math.ceil(Math.sqrt(totalCells));
    const cellSize = getComputedStyle(gridContainer).getPropertyValue('--cell-size').trim();
    gridContainer.style.gridTemplateColumns = `repeat(${cols}, ${cellSize})`;

    // Crear una lista vacía para guardar el estado de las celdas
    const savedGridState = [];

    // Crear celdas
    for (let i = 0; i < totalCells; i++) {
        const cell = document.createElement('div');
        cell.classList.add('grid-cell');
        
        // Establecer el estado por defecto de la celda (oscurecida)
        cell.classList.add('darkened');
        
        // Crear y configurar iconos
        const editIcon = createIcon('edit-icon', '<i class="fa-solid fa-pen"></i>');
        const clearIcon = createIcon('clear-icon', '<i class="fa-solid fa-broom"></i>');
        const imageIcon = createIcon('image-icon', '<i class="fa-solid fa-image"></i>');
        
        const imageInput = document.createElement('input');
        imageInput.type = 'file';
        imageInput.accept = 'image/*';
        imageInput.classList.add('image-input');
        imageInput.addEventListener('change', event => setImageBackground(event, cell, i));
        
        cell.append(editIcon, clearIcon, imageIcon, imageInput);

        // Evento para alternar el oscurecimiento al hacer clic en la celda
        cell.addEventListener('click', (event) => {
            // Si el clic no es sobre un ícono o el input de imagen, alternar el estado de la celda
            if (!event.target.classList.contains('image-icon') &&
                !event.target.classList.contains('edit-icon') &&
                !event.target.classList.contains('clear-icon') &&
                event.target !== imageInput) {
                toggleStrike(cell, i);
            }
        });

        // Eventos de iconos
        setupIconEvents(editIcon, clearIcon, imageIcon, imageInput, cell, i);

        gridContainer.appendChild(cell);

        // Guardar el estado de la celda (por defecto "oscurecida")
        savedGridState.push({
            darkened: true, // Las celdas por defecto están oscurecidas
            backgroundImage: '',
            text: ''
        });
    }

    // Guardar el estado de la rejilla en localStorage
    localStorage.setItem('gridState', JSON.stringify(savedGridState));
    localStorage.setItem('totalCells', totalCells); // Guardar el número total de celdas
}

// Crear un ícono para agregar a una celda
function createIcon(className, iconHTML) {
    const icon = document.createElement('span');
    icon.className = className;
    icon.innerHTML = iconHTML;
    return icon;
}

// Configuración de eventos de iconos
function setupIconEvents(editIcon, clearIcon, imageIcon, imageInput, cell, index) {
    editIcon.addEventListener('click', (event) => {
        event.stopPropagation(); // Evitar que el click se propague a la celda
        editCell(cell, editIcon, clearIcon, imageIcon, imageInput, index);
    });
    clearIcon.addEventListener('click', (event) => {
        event.stopPropagation(); // Evitar que el click se propague a la celda
        clearCell(cell, editIcon, clearIcon, imageIcon, imageInput, index);
    });
    imageIcon.addEventListener('click', (event) => {
        event.stopPropagation(); // Evitar que el click se propague a la celda
        imageInput.click(); // Activar el input para seleccionar la imagen
    });
}

// Alternar el oscurecimiento de la celda
function toggleStrike(cell, index) {
    cell.classList.toggle('darkened'); // Alternar la clase darkened
    saveGridState(index, cell); // Guardar el estado actualizado
}

// Establecer imagen de fondo en una celda
function setImageBackground(event, cell, index) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = e => {
            cell.style.backgroundImage = `url(${e.target.result})`;
            saveGridState(index, cell); // Guardar el estado actualizado
        };
        reader.readAsDataURL(file);
    }
}

// Editar celda con textarea
function editCell(cell, editIcon, clearIcon, imageIcon, imageInput, index) {
    const currentText = cell.textContent.trim();
    cell.innerHTML = `<textarea>${currentText}</textarea>`;
    const textarea = cell.querySelector('textarea');
    textarea.focus();

    textarea.addEventListener('blur', () => saveCellText(textarea, cell, editIcon, clearIcon, imageIcon, imageInput, index));
    textarea.addEventListener('keydown', event => {
        if (event.key === 'Enter' && !event.shiftKey) {
            textarea.blur();
            event.preventDefault();
        }
    });
}

// Guardar el texto en una celda
function saveCellText(textarea, cell, editIcon, clearIcon, imageIcon, imageInput, index) {
    // Convertir los saltos de línea en <br>
    const textWithLineBreaks = textarea.value.replace(/\n/g, '<br>');
    
    // Insertar el texto con los saltos de línea convertidos a <br>
    cell.innerHTML = textWithLineBreaks;
    cell.append(editIcon, clearIcon, imageIcon, imageInput);
    saveGridState(index, cell); // Guardar el estado actualizado
}

// Limpiar celda de texto e imagen
function clearCell(cell, editIcon, clearIcon, imageIcon, imageInput, index) {
    cell.innerHTML = '';
    cell.style.backgroundImage = '';
    cell.append(editIcon, clearIcon, imageIcon, imageInput);
    saveGridState(index, cell); // Guardar el estado actualizado
}

// Guardar el estado de la rejilla en localStorage
function saveGridState(index, cell) {
    const savedGridState = JSON.parse(localStorage.getItem('gridState')) || [];
    savedGridState[index] = {
        darkened: cell.classList.contains('darkened'),
        backgroundImage: cell.style.backgroundImage,
        text: cell.innerHTML
    };
    localStorage.setItem('gridState', JSON.stringify(savedGridState));
}

// Guardar el número total de celdas
function saveTotalCells(totalCells) {
    localStorage.setItem('totalCells', totalCells);
}

// Inicializar la rejilla con el número de celdas guardado en localStorage o 25 por defecto
const initialCells = parseInt(localStorage.getItem('totalCells')) || 25;
createGrid(initialCells);

// Cambiar el tamaño de la rejilla basado en la entrada
document.getElementById('create-grid').addEventListener('click', () => {
    const totalCells = parseInt(document.getElementById('cells').value) || 25;
    if (totalCells > 0) {
        createGrid(totalCells);
        saveTotalCells(totalCells); // Guardar el número de celdas actualizado
    }
});

// Botón para limpiar todo
document.getElementById('clear-all').addEventListener('click', () => {
    // Restaurar la rejilla al estado inicial con 25 celdas
    createGrid(25);
    localStorage.removeItem('gridState'); // Limpiar el estado guardado
    localStorage.removeItem('totalCells'); // Limpiar el número de celdas guardado
});
