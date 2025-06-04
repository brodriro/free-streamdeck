import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import cors from 'cors';
import bodyParser from 'body-parser';
import multer from 'multer';
import fs from 'fs';
import { exec } from 'child_process';
import open from 'open';

// Define types
interface Button {
  id: string;
  name: string;
  icon: string;
  url: string;
  type: 'APP' | 'WEB';
  route?: string;
  state: 'on' | 'off' | 'empty';
}

interface RequestWithParams extends Request {
  params: {
    id: string;
  };
}

interface Config {
  gridSize: number;
  buttons: Button[];
}

// Initialize app
const app = express();
const PORT = process.env.PORT || 3000;

// Configure storage for multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'public/icons'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({ storage });

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Configuración de archivos estáticos
const publicDir = path.join(__dirname, 'public');

// Servir archivos estáticos desde la carpeta public
app.use(express.static(publicDir, {
  index: false, // No servir index.html automáticamente
  maxAge: '1d'   // Cachear archivos estáticos por 1 día
}));

// Ruta específica para los íconos
app.use('/icons', express.static(path.join(publicDir, 'icons'), {
  maxAge: '7d' // Cachear íconos por más tiempo
}));

// Asegurar que los directorios necesarios existan
const requiredDirs = [
  path.join(publicDir, 'icons'),
  path.join(__dirname, '../config')
];

requiredDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
});

// Config directory and file paths
const configDir = path.join(__dirname, '../config');
const configPath = path.join(configDir, 'config.json');
const exampleConfigPath = path.join(configDir, 'example.config.json');

// Ensure config directory exists
if (!fs.existsSync(configDir)) {
  fs.mkdirSync(configDir, { recursive: true });
  console.log('Created config directory at:', configDir);
}

// Initialize config files if they don't exist
if (!fs.existsSync(configPath)) {
  const initialConfig: Config = {
    gridSize: 8,
    buttons: []
  };
  
  // Write main config file
  fs.writeFileSync(configPath, JSON.stringify(initialConfig, null, 2));
  console.log('Created config file at:', configPath);
  
  // Create example config file if it doesn't exist
  if (!fs.existsSync(exampleConfigPath)) {
    const exampleConfig = {
      gridSize: 8,
      buttons: [
        {
          id: 'example-button-1',
          name: 'Example Button',
          icon: 'fa-solid fa-star',
          url: 'https://example.com',
          type: 'WEB',
          state: 'on'
        }
      ]
    };
    fs.writeFileSync(exampleConfigPath, JSON.stringify(exampleConfig, null, 2));
    console.log('Created example config file at:', exampleConfigPath);
  }
}

// Helper to read config
const readConfig = (): Config => {
  try {
    const data = fs.readFileSync(configPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading config:', error);
    return { gridSize: 8, buttons: [] };
  }
};

// Helper to write config
const writeConfig = (config: Config): void => {
  try {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  } catch (error) {
    console.error('Error writing config:', error);
  }
};

// Routes
// Serve index.html for the root route
app.get('/', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Get config
app.get('/api/config', (req: Request, res: Response): void => {
  const config = readConfig();
  res.json(config);
});

// Update grid size
app.post('/api/config/grid', (req: Request, res: Response): void => {
  const { gridSize } = req.body;
  
  if (!gridSize || gridSize < 4 || gridSize > 24) {
    res.status(400).json({ error: 'Invalid grid size. Must be between 4 and 24.' });
    return;
  }
  
  const config = readConfig();
  config.gridSize = gridSize;
  writeConfig(config);
  
  res.json(config);
});

// Add new button
app.post('/api/buttons', upload.single('iconFile'), (req: Request, res: Response): void => {
  try {
    // Parse form data
    const { name, url, type, icon } = req.body;
    
    if (!name || !url || !type) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }
    
    const config = readConfig();
    
    // Determine which icon to use (in order of preference):
    // 1. FontAwesome icon if provided
    // 2. Uploaded file if provided
    // 3. Default icon if neither is provided
    const buttonIcon = icon || (req.file ? `/icons/${req.file.filename}` : '/icons/default-icon.png');
    
    const newButton: Button = {
      id: Date.now().toString(),
      name: name.toString(),
      icon: buttonIcon,
      url: url.toString(),
      type: type as 'APP' | 'WEB',
      state: 'off'
    };
    
    config.buttons.push(newButton);
    writeConfig(config);
    
    res.status(201).json(newButton);
  } catch (error) {
    console.error('Error adding button:', error);
    res.status(500).json({ error: 'Failed to add button' });
  }
});

// Update button
app.put('/api/buttons/:id', upload.single('iconFile'), (req: Request, res: Response): void => {
  try {
    const { id } = req.params;
    const { name, url, type, icon } = req.body;
    
    const config = readConfig();
    const buttonIndex = config.buttons.findIndex(b => b.id === id);
    
    if (buttonIndex === -1) {
      res.status(404).json({ error: 'Button not found' });
      return;
    }
    
    // Determine which icon to use (in order of preference):
    // 1. New FontAwesome icon if provided
    // 2. New uploaded file if provided
    // 3. Keep existing icon if neither is provided
    let newIcon = config.buttons[buttonIndex].icon;
    if (icon) {
      newIcon = icon.toString(); // Use FontAwesome icon
    } else if (req.file) {
      newIcon = `/icons/${req.file.filename}`; // Use uploaded file
    }
    
    // Update button properties
    const updatedButton = {
      ...config.buttons[buttonIndex],
      name: name ? name.toString() : config.buttons[buttonIndex].name,
      url: url ? url.toString() : config.buttons[buttonIndex].url,
      type: (type as 'APP' | 'WEB') || config.buttons[buttonIndex].type,
      icon: newIcon
    };
    
    config.buttons[buttonIndex] = updatedButton;
    writeConfig(config);
    
    res.json(updatedButton);
  } catch (error) {
    console.error('Error updating button:', error);
    res.status(500).json({ error: 'Failed to update button' });
  }
});

// Delete button
app.delete('/api/buttons/:id', (req: Request, res: Response): void => {
  try {
    const { id } = req.params;
    
    const config = readConfig();
    const buttonIndex = config.buttons.findIndex(b => b.id === id);
    
    if (buttonIndex === -1) {
      res.status(404).json({ error: 'Button not found' });
      return;
    }
    
    // Remove the button's icon file if it's not the default
    const button = config.buttons[buttonIndex];
    if (button.icon && button.icon !== 'fa-solid fa-atom ') {
      const iconPath = path.join(__dirname, 'public', button.icon);
      if (fs.existsSync(iconPath)) {
        fs.unlinkSync(iconPath);
      }
    }
    
    config.buttons.splice(buttonIndex, 1);
    writeConfig(config);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting button:', error);
    res.status(500).json({ error: 'Failed to delete button' });
  }
});

// Activate button
app.post('/api/buttons/:id/activate', (req: Request, res: Response): void => {
  try {
    const { id } = req.params;
    
    const config = readConfig();
    const button = config.buttons.find(b => b.id === id);
    
    if (!button) {
      res.status(404).json({ error: 'Button not found' });
      return;
    }
    
    // Toggle button state
    //button.state = button.state === 'on' ? 'off' : 'on';
    writeConfig(config);
    
    // Execute the action based on button type
    if (button.type === 'WEB') {
      // Make sure URL is properly formatted
      let urlToOpen = button.url;
      if (!urlToOpen.startsWith('http://') && !urlToOpen.startsWith('https://')) {
        urlToOpen = 'https://' + urlToOpen;
      }
      open(urlToOpen);
    } else if (button.type === 'APP') {
      exec(`open -a "${button.url}"`, (error) => {
        if (error) {
          console.error(`Error executing command: ${error}`);
        }
      });
    }
    
    res.json(button);
  } catch (error) {
    console.error('Error activating button:', error);
    res.status(500).json({ error: 'Failed to activate button' });
  }
});

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Serve the main HTML file for all other routes
app.get('/', (req: Request, res: Response): void => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
