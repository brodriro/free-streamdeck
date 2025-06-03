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
        gridContainer.style.gridTemplateColumns = `repeat(auto-fill, minmax(${Math.max(100, 450 / Math.sqrt(config.gridSize))}px, 1fr))`;

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
        console.log(button);    
        if (button.state !== 'empty') {
            // Check if it's a FontAwesome icon (starts with 'fa-' or 'fas ' etc.)
            if (button.icon && (button.icon.includes('fa-') || button.icon.startsWith('fas ') || button.icon.startsWith('far ') || button.icon.startsWith('fab '))) {
                const iconElement = document.createElement('i');
                // Ensure the icon class is properly formatted
                const iconClass = button.icon.trim().startsWith('fa-') ? `${button.icon}` : button.icon;
                iconElement.className = `button-icon ${iconClass}`;
                buttonElement.appendChild(iconElement);
            } else if (button.icon) {
                // It's an image icon
                const iconElement = document.createElement('img');
                iconElement.src = button.icon;
                iconElement.alt = button.name;
                iconElement.className = 'button-icon';
                buttonElement.appendChild(iconElement);
            } else {
                // Default icon if no icon is set
                const iconElement = document.createElement('i');
                iconElement.className = 'button-icon fas fa-question-circle';
                buttonElement.appendChild(iconElement);
            }

            const nameElement = document.createElement('div');
            nameElement.className = 'button-name';
            nameElement.textContent = button.name;
            buttonElement.appendChild(nameElement);

            buttonElement.addEventListener('click', () => activateButton(button.id));
        } else {
            // Add plus icon for empty buttons
            const plusIcon = document.createElement('i');
            plusIcon.className = 'fas fa-plus';
            plusIcon.style.fontSize = '32px';
            plusIcon.style.marginBottom = '8px';
            buttonElement.appendChild(plusIcon);

            const addText = document.createElement('div');
            addText.className = 'button-name';
            addText.textContent = 'Add Button';
            buttonElement.appendChild(addText);

            // Open the config modal when clicking an empty button
            buttonElement.addEventListener('click', (e) => {
                e.preventDefault();
                configModal.style.display = 'block';
                // Focus on the name field for better UX
                document.getElementById('button-name').focus();
            });
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
        
        // Handle FontAwesome icon
        const fontAwesomeIcon = document.getElementById('button-icon').value.trim();
        if (fontAwesomeIcon) {
            formData.append('icon', fontAwesomeIcon);
        }
        
        // Handle file upload
        const iconFile = document.getElementById('button-icon-file').files[0];
        if (iconFile) {
            formData.append('iconFile', iconFile);
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
                newButtonForm.reset();
                alert('Button added successfully');
            } else {
                const error = await response.json();
                alert(error.message || 'Failed to add button');
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
            
            // Check if it's a FontAwesome icon or an image
            if (button.icon && (button.icon.includes('fa-') || button.icon.startsWith('fas ') || button.icon.startsWith('far ') || button.icon.startsWith('fab '))) {
                const iconElement = document.createElement('i');
                // Ensure the icon class is properly formatted
                const iconClass = button.icon.trim().startsWith('fa-') ? `fas ${button.icon}` : button.icon;
                iconElement.className = `button-list-icon ${iconClass}`;
                infoDiv.appendChild(iconElement);
            } else if (button.icon) {
                const iconImg = document.createElement('img');
                iconImg.src = button.icon;
                iconImg.alt = button.name;
                iconImg.className = 'button-list-icon';
                infoDiv.appendChild(iconImg);
            } else {
                // Default icon if no icon is set
                const iconElement = document.createElement('i');
                iconElement.className = 'button-list-icon fas fa-question-circle';
                infoDiv.appendChild(iconElement);
            }
            
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
        
        // Set values for Material Web Components
        const nameField = document.querySelector('#edit-button-name');
        const urlField = document.querySelector('#edit-button-url');
        const typeSelect = document.querySelector('#edit-button-type');
        const iconField = document.querySelector('#edit-button-icon');
        
        if (nameField) nameField.value = button.name || '';
        if (urlField) urlField.value = button.url || '';
        
        // Set the selected option in the select
        if (typeSelect) {
            const options = typeSelect.querySelectorAll('md-select-option');
            options.forEach(option => {
                if (option.value === (button.type || 'WEB')) {
                    option.selected = true;
                } else {
                    option.selected = false;
                }
            });
        }
        
        // Clear previous icon inputs
        if (iconField) iconField.value = '';
        const iconFileInput = document.getElementById('edit-button-icon-file');
        if (iconFileInput) iconFileInput.value = '';
        
        const preview = document.getElementById('current-icon-preview');
        if (preview) {
            preview.innerHTML = '';
            
            if (button.icon) {
                // Check if it's a FontAwesome icon
                if (button.icon.startsWith('fa') || button.icon.startsWith('far ') || button.icon.startsWith('fab ')) {
                    const icon = document.createElement('i');
                    icon.className = `fa-2x ${button.icon}`;
                    preview.appendChild(icon);
                    if (iconField) iconField.value = button.icon;
                } else {
                    // It's an image icon
                    const img = document.createElement('img');
                    img.src = button.icon;
                    img.style.maxWidth = '100%';
                    img.style.maxHeight = '100px';
                    preview.appendChild(img);
                }
            }
        }
        
        editModal.style.display = 'block';
    }

    async function updateButton(event) {
        event.preventDefault();
        
        const id = document.getElementById('edit-button-id').value;
        const formData = new FormData();
        
        // Get values from Material Web Components
        const nameField = document.querySelector('#edit-button-name');
        const urlField = document.querySelector('#edit-button-url');
        const typeSelect = document.querySelector('#edit-button-type');
        const iconField = document.querySelector('#edit-button-icon');
        
        if (nameField) formData.append('name', nameField.value || '');
        if (urlField) formData.append('url', urlField.value || '');
        
        // Get selected value from md-select
        let selectedType = 'WEB';
        if (typeSelect) {
            const selectedOption = typeSelect.querySelector('md-select-option[selected]');
            if (selectedOption) {
                selectedType = selectedOption.value || 'WEB';
            }
        }
        formData.append('type', selectedType);
        
        // Handle FontAwesome icon
        const fontAwesomeIcon = iconField ? iconField.value.trim() : '';
        if (fontAwesomeIcon) {
            formData.append('icon', fontAwesomeIcon);
        }
        
        // Handle file upload
        const iconFileInput = document.getElementById('edit-button-icon-file');
        if (iconFileInput && iconFileInput.files && iconFileInput.files[0]) {
            formData.append('iconFile', iconFileInput.files[0]);
        }
        
        try {
            const response = await fetch(`${API_URL}/api/buttons/${id}`, {
                method: 'PUT',
                body: formData
            });
            
            if (response.ok) {
                const updatedButton = await response.json();
                
                // Update the button in the config
                const buttonIndex = config.buttons.findIndex(b => b.id === id);
                if (buttonIndex !== -1) {
                    config.buttons[buttonIndex] = updatedButton;
                }
                
                // Update the UI
                renderGrid();
                renderButtonList();
                editModal.style.display = 'none';
                
                // Reset the form
                event.target.reset();
            } else {
                const error = await response.json();
                alert(error.message || 'Failed to update button');
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
                config.buttons = config.buttons.filter(button => button.id !== id);
                
                // Update the UI
                renderGrid();
                renderButtonList();
                alert('Button deleted successfully');
            } else {
                const error = await response.json();
                alert(error.message || 'Failed to delete button');
            }
        } catch (error) {
            console.error('Error deleting button:', error);
            alert('Failed to delete button');
        }
    }
});
