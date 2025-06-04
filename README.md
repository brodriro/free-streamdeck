# Free StreamDeck

A free and open-source alternative to the Elgato Stream Deck. This web-based application allows you to create customizable buttons to launch applications, websites, or perform custom actions with a clean and intuitive interface.

## Features

- **Modern, Responsive UI**
  - Clean, intuitive interface with smooth animations
  - Fully responsive design that works on any screen size
  - Real-time preview of changes

- **Multiple Themes**
  - Light and dark mode support
  - Additional themes: Macchiato and Mocha
  - System preference detection for automatic theme switching

- **Customizable Grid**
  - Adjustable grid size from 4 to 24 buttons
  - Drag and drop interface for easy organization
  - Visual feedback for button states

- **Button Customization**
  - Custom names and icons for each button
  - Support for FontAwesome icons and custom images
  - Multiple button types: Web URLs and local applications
  - Button states: Empty, Active, Inactive

- **Easy Configuration**
  - In-app settings panel
  - Import/export configuration
  - Keyboard shortcuts for common actions

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- Modern web browser (Chrome, Firefox, Edge, or Safari)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/brodriro/free-streamdeck.git
   cd free-streamdeck
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the application:
   ```bash
   npm start
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

### Development

To run the application in development mode with hot reloading:

```bash
npm run dev
```

## Usage

### Basic Navigation

- **Main Grid**: Displays all your configured buttons
- **Settings Panel**: Access configuration options by clicking the gear icon
- **Theme Selector**: Change themes from the top navigation

### Button Configuration

1. Click the "+" button to add a new button
2. Configure the button properties:
   - **Name**: Display text for the button
   - **Type**: Choose between Web or App
   - **URL/Path**: Website URL or application path
   - **Icon**: Select from FontAwesome or upload custom image
   - **Color**: Choose a custom color (coming soon)

3. Click "Save" to apply changes

### Themes

- Switch between Light, Dark, Macchiato, and Mocha themes
- Theme preference is saved in your browser
- Automatic theme switching based on system preference

## Responsive Design

The application is fully responsive and works on:
- Desktop computers
- Laptops
- Tablets
- Mobile devices (with limited functionality)

## Technologies Used

- **Frontend**
  - HTML5, CSS3, JavaScript (ES6+)
  - CSS Variables for theming
  - FontAwesome for icons
  - Responsive design with Flexbox/Grid

- **Backend**
  - Node.js with Express
  - File system for data persistence
  - RESTful API architecture

## Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

Distributed under the ISC License. See `LICENSE` for more information.

## Contact

Brian Rodriguez - [@brodriro](https://x.com/brodriro)

Project Link: [https://github.com/brodriro/free-streamdeck](https://github.com/brodriro/free-streamdeck)

## Acknowledgments

- [FontAwesome](https://fontawesome.com/) for the amazing icons
- [Google Fonts](https://fonts.google.com/) for the typography
- All contributors who have helped improve this project

---

Made with ❤️ by [Brian Rodriguez] | [GitHub](https://github.com/brodriro)
