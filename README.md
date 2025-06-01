# FreeStreamDeck

A web-based StreamDeck application with a Node.js backend that allows you to create customizable buttons to launch applications and websites.

## Features

- Create a customizable grid of buttons (4-24 buttons)
- Each button can launch websites or applications
- Three button states: Empty, On, and Off
- Customizable icons and labels for each button
- Light and dark theme support
- Responsive design for various screen sizes
- Configuration panel to manage buttons and settings

## Tech Stack

- **Backend**: Node.js with Express and TypeScript
- **Frontend**: HTML, CSS, and JavaScript
- **File Handling**: Multer for icon uploads

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/brodriro/free-streamdeck.git
   cd free-streamdeck
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Build the project:
   ```
   npm run build
   ```

4. Start the server:
   ```
   npm start
   ```

## Development

To run the application in development mode with hot reloading:

```
npm run dev
```

## Usage

1. Open your browser and navigate to `http://localhost:3000`
2. The main screen displays a grid of buttons (default: 8)
3. Click the Settings button to configure the StreamDeck
4. In the configuration panel, you can:
   - Change the grid size (4-24 buttons)
   - Add new buttons with icons, names, and URLs
   - Edit or delete existing buttons
5. Click on a button in the main grid to activate it (launch website or application)

## Button Configuration

When adding a new button, you can configure:

- **Name**: A descriptive name for the button
- **URL**: The website URL or application path to open
- **Type**: Web (opens in browser) or App (opens as application)
- **Icon**: Custom image for the button

## License

ISC
