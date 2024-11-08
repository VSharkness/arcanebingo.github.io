// Inicializar la rejilla con el número de celdas guardado en localStorage o 25 por defecto
const initialCells = parseInt(localStorage.getItem('totalCells')) || 25;
const savedGridState = JSON.parse(localStorage.getItem('gridState')) || [];
createGrid(initialCells, savedGridState);

// Función para crear la rejilla de celdas
function createGrid(totalCells, savedGridState = []) {
    const gridContainer = document.getElementById('grid-container');
    gridContainer.innerHTML = ''; // Limpiar la rejilla anterior

    // Calcular filas y columnas
    const cols = Math.ceil(Math.sqrt(totalCells));
    const cellSize = getComputedStyle(gridContainer).getPropertyValue('--cell-size').trim();
    gridContainer.style.gridTemplateColumns = `repeat(${cols}, ${cellSize})`;

    // Si hay un estado guardado, usa esos datos para inicializar las celdas
    for (let i = 0; i < totalCells; i++) {
        const cell = document.createElement('div');
        cell.classList.add('grid-cell');

        // Usar el estado guardado para configurar cada celda
        const cellState = savedGridState[i] || { darkened: true, backgroundImage: '', text: '' };
        if (cellState.darkened) cell.classList.add('darkened');
        if (cellState.backgroundImage) cell.style.backgroundImage = cellState.backgroundImage;
        if (cellState.text) cell.innerHTML = cellState.text;

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
    }
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
    editIcon.addEventListener('click', () => {
        const textarea = document.createElement('textarea');
        textarea.value = cell.innerHTML;
        textarea.addEventListener('blur', () => {
            cell.innerHTML = textarea.value;
            saveGridState(index, cell);
        });
        cell.innerHTML = '';
        cell.appendChild(textarea);
        textarea.focus();
    });

    clearIcon.addEventListener('click', () => {
        cell.classList.remove('darkened');
        cell.style.backgroundImage = '';
        cell.innerHTML = '';
        saveGridState(index, cell);
    });

    imageIcon.addEventListener('click', () => {
        imageInput.click();
    });
}

// Establecer la imagen de fondo de una celda
function setImageBackground(event, cell, index) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            cell.style.backgroundImage = `url(${e.target.result})`;
            saveGridState(index, cell);
        };
        reader.readAsDataURL(file);
    }
}

// Alternar el oscurecimiento de la celda
function toggleStrike(cell, index) {
    cell.classList.toggle('darkened');
    saveGridState(index, cell);
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

// Función para crear la rejilla con el número de celdas deseado
document.getElementById('create-grid').addEventListener('click', () => {
    const cellsInput = document.getElementById('cells');
    const totalCells = parseInt(cellsInput.value) || 25;
    localStorage.setItem('totalCells', totalCells);
    createGrid(totalCells);
});

// Función para limpiar todo
document.getElementById('clear-all').addEventListener('click', () => {
    createGrid(25); // Restaurar la rejilla a 25 celdas
    localStorage.removeItem('gridState'); // Limpiar el estado guardado
    localStorage.removeItem('totalCells'); // Limpiar el número de celdas guardado
});
