# Quà tặng Phương Trinh

Ứng dụng Apps Script Quà tặng Phương Trinh

## Project Structure

This project combines Vite for frontend development and Google Apps Script with Clasp for backend scripting.

### Frontend (Vite)
- `index.html`: Main HTML entry point
- `src/main.js`: Main JavaScript file
- `src/style.css`: Styles
- `vite.config.js`: Vite configuration

### Apps Script (Clasp)
- `Code.js`: Apps Script code
- `appsscript.json`: Apps Script manifest
- `.clasp.json`: Clasp configuration

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Login to Clasp:
   ```bash
   npm run clasp:login
   ```

3. Create or link Apps Script project:
   ```bash
   npm run clasp:create
   ```
   Or update `.clasp.json` with your existing script ID.

4. Push code to Apps Script:
   ```bash
   npm run clasp:push
   ```

5. For frontend development:
   ```bash
   npm run dev
   ```

## Usage

- Develop your web app with Vite
- Write Apps Script functions in `Code.js`
- Deploy changes with `npm run clasp:push`
