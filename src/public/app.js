document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const gridContainer = document.getElementById('grid-container');
    const configBtn = document.getElementById('config-btn');
    const configModal = document.getElementById('config-modal');
    const editModal = document.getElementById('edit-modal');
    const closeButtons = document.querySelectorAll('.close');
    const saveGridBtn = document.getElementById('save-grid-btn');
    const gridSizeInput = document.getElementById('grid-size');
    const newButtonForm = document.getElementById('new-button-form');
    const editButtonForm = document.getElementById('edit-button-form');
    const buttonList = document.getElementById('button-list');
    const themeSwitch = document.getElementById('theme-switch');

    // API URL
    const API_URL = window.location.origin;

    // State
    let config = {
        gridSize: 8,
        buttons: []
    };

    // Theme handling
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
        themeSwitch.checked = true;
    }

    themeSwitch.addEventListener('change', () => {
        if (themeSwitch.checked) {
            document.body.classList.add('dark-theme');
            localStorage.setItem('theme', 'dark');
        } else {
            document.body.classList.remove('dark-theme');
            localStorage.setItem('theme', 'light');
        }
    });

    // Fetch initial config
    fetchConfig();

    // Event Listeners
    configBtn.addEventListener('click', () => {
        configModal.style.display = 'block';
        renderButtonList();
    });

    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            configModal.style.display = 'none';
            editModal.style.display = 'none';
        });
    });

    window.addEventListener('click', (event) => {
        if (event.target === configModal) {
            configModal.style.display = 'none';
        }
        if (event.target === editModal) {
            editModal.style.display = 'none';
        }
    });

    saveGridBtn.addEventListener('click', updateGridSize);
    newButtonForm.addEventListener('submit', addNewButton);
    editButtonForm.addEventListener('submit', updateButton);

    // Functions
    async function fetchConfig() {
        try {
            const response = await fetch(`${API_URL}/api/config`);
            config = await response.json();
            renderGrid();
        } catch (error) {
            console.error('Error fetching config:', error);
        }
    }

    function renderGrid() {
        gridContainer.innerHTML = '';
        gridContainer.style.gridTemplateColumns = `repeat(auto-fill, minmax(${Math.max(100, 800 / Math.sqrt(config.gridSize))}px, 1fr))`;

        // Create buttons based on config
        for (let i = 0; i < config.gridSize; i++) {
            const button = config.buttons[i] || { state: 'empty', id: `empty-${i}` };
            const buttonElement = createButtonElement(button);
            gridContainer.appendChild(buttonElement);
        }
    }

    function createButtonElement(button) {
        const buttonElement = document.createElement('div');
        buttonElement.className = `button-item button-${button.state || 'empty'}`;
        buttonElement.dataset.id = button.id;

        if (button.state !== 'empty') {
            const iconElement = document.createElement('img');
            iconElement.src = button.icon || '/icons/default-icon.png';
            iconElement.alt = button.name;
            iconElement.className = 'button-icon';
            buttonElement.appendChild(iconElement);

            const nameElement = document.createElement('div');
            nameElement.className = 'button-name';
            nameElement.textContent = button.name;
            buttonElement.appendChild(nameElement);

            buttonElement.addEventListener('click', () => activateButton(button.id));
        }

        return buttonElement;
    }

    async function activateButton(id) {
        try {
            const response = await fetch(`${API_URL}/api/buttons/${id}/activate`, {
                method: 'POST'
            });
            
            if (response.ok) {
                const updatedButton = await response.json();
                
                // Update the button in the config
                const buttonIndex = config.buttons.findIndex(b => b.id === id);
                if (buttonIndex !== -1) {
                    config.buttons[buttonIndex] = updatedButton;
                    
                    // Update the button in the UI
                    const buttonElement = document.querySelector(`.button-item[data-id="${id}"]`);
                    if (buttonElement) {
                        buttonElement.className = `button-item button-${updatedButton.state}`;
                    }
                }
            }
        } catch (error) {
            console.error('Error activating button:', error);
        }
    }

    async function updateGridSize() {
        const gridSize = parseInt(gridSizeInput.value);
        
        if (isNaN(gridSize) || gridSize < 4 || gridSize > 24) {
            alert('Grid size must be between 4 and 24');
            return;
        }
        
        try {
            const response = await fetch(`${API_URL}/api/config/grid`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ gridSize })
            });
            
            if (response.ok) {
                config = await response.json();
                renderGrid();
                alert('Grid size updated successfully');
            }
        } catch (error) {
            console.error('Error updating grid size:', error);
            alert('Failed to update grid size');
        }
    }

    async function addNewButton(event) {
        event.preventDefault();
        
        const formData = new FormData();
        formData.append('name', document.getElementById('button-name').value);
        formData.append('url', document.getElementById('button-url').value);
        formData.append('type', document.getElementById('button-type').value);
        
        const iconFile = document.getElementById('button-icon').files[0];
        if (iconFile) {
            formData.append('icon', iconFile);
        }
        
        try {
            const response = await fetch(`${API_URL}/api/buttons`, {
                method: 'POST',
                body: formData
            });
            
            if (response.ok) {
                const newButton = await response.json();
                config.buttons.push(newButton);
                renderGrid();
                renderButtonList();
                newButtonForm.reset();
                alert('Button added successfully');
            }
        } catch (error) {
            console.error('Error adding button:', error);
            alert('Failed to add button');
        }
    }

    function renderButtonList() {
        buttonList.innerHTML = '';
        
        if (config.buttons.length === 0) {
            buttonList.innerHTML = '<p>No buttons added yet.</p>';
            return;
        }
        
        config.buttons.forEach(button => {
            const listItem = document.createElement('div');
            listItem.className = 'button-list-item';
            
            const infoDiv = document.createElement('div');
            infoDiv.className = 'button-list-info';
            
            const iconImg = document.createElement('img');
            iconImg.src = button.icon || '/icons/default-icon.png';
            iconImg.alt = button.name;
            iconImg.className = 'button-list-icon';
            infoDiv.appendChild(iconImg);
            
            const nameSpan = document.createElement('span');
            nameSpan.textContent = button.name;
            infoDiv.appendChild(nameSpan);
            
            listItem.appendChild(infoDiv);
            
            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'button-list-actions';
            
            const editBtn = document.createElement('button');
            editBtn.className = 'edit-btn';
            editBtn.innerHTML = '<i class="fas fa-edit"></i>';
            editBtn.addEventListener('click', () => openEditModal(button));
            actionsDiv.appendChild(editBtn);
            
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-btn';
            deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
            deleteBtn.addEventListener('click', () => deleteButton(button.id));
            actionsDiv.appendChild(deleteBtn);
            
            listItem.appendChild(actionsDiv);
            buttonList.appendChild(listItem);
        });
    }

    function openEditModal(button) {
        document.getElementById('edit-button-id').value = button.id;
        document.getElementById('edit-button-name').value = button.name;
        document.getElementById('edit-button-url').value = button.url;
        document.getElementById('edit-button-type').value = button.type;
        document.getElementById('edit-button-route').value = button.route || '';
        
        const iconPreview = document.getElementById('current-icon-preview');
        iconPreview.innerHTML = `<img src="${button.icon || '/icons/default-icon.png'}" alt="${button.name}">`;
        
        editModal.style.display = 'block';
    }

    async function updateButton(event) {
        event.preventDefault();
        
        const buttonId = document.getElementById('edit-button-id').value;
        const formData = new FormData();
        formData.append('name', document.getElementById('edit-button-name').value);
        formData.append('url', document.getElementById('edit-button-url').value);
        formData.append('type', document.getElementById('edit-button-type').value);
        formData.append('route', document.getElementById('edit-button-route').value);
        
        const iconFile = document.getElementById('edit-button-icon').files[0];
        if (iconFile) {
            formData.append('icon', iconFile);
        }
        
        try {
            const response = await fetch(`${API_URL}/api/buttons/${buttonId}`, {
                method: 'PUT',
                body: formData
            });
            
            if (response.ok) {
                const updatedButton = await response.json();
                
                // Update the button in the config
                const buttonIndex = config.buttons.findIndex(b => b.id === buttonId);
                if (buttonIndex !== -1) {
                    config.buttons[buttonIndex] = updatedButton;
                }
                
                renderGrid();
                renderButtonList();
                editModal.style.display = 'none';
                alert('Button updated successfully');
            }
        } catch (error) {
            console.error('Error updating button:', error);
            alert('Failed to update button');
        }
    }

    async function deleteButton(id) {
        if (!confirm('Are you sure you want to delete this button?')) {
            return;
        }
        
        try {
            const response = await fetch(`${API_URL}/api/buttons/${id}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                // Remove the button from the config
                config.buttons = config.buttons.filter(b => b.id !== id);
                renderGrid();
                renderButtonList();
                alert('Button deleted successfully');
            }
        } catch (error) {
            console.error('Error deleting button:', error);
            alert('Failed to delete button');
        }
    }
});
