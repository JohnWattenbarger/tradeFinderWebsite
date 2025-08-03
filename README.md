# Fantasy Football Trade Finder

A web application to help fantasy football players find mutually beneficial trades. Import your league data, search for trade partners, and get a list of the best trade options tailored to your league.

---

## Table of Contents

- [Features](#features)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Available Scripts](#available-scripts)
- [ESLint & Code Quality](#eslint--code-quality)
- [Configuration](#configuration)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgements](#acknowledgements)

---

## Features

- Import league data from supported fantasy football platforms
- Analyze rosters and needs for all teams in your league
- Search for mutually beneficial trades
- Get a ranked list of the best trade options
- Built with React, TypeScript, and Vite for fast development

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/) (v9 or higher)
- (Optional) [VS Code](https://code.visualstudio.com/) IDE of choice

### Installation

Clone the repository and install dependencies:

```sh
git clone https://github.com/JohnWattenbarger/tradeFinderWebsite.git
cd tradeFinderWebsite
npm install
```

### Running the Development Server

```sh
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser to view the app.

### Building for Production

```sh
npm run build
```

### Previewing the Production Build

```sh
npm run preview
```

---

## Project Structure

```
tradeFinderWebsite/
├── public/                # Static assets
├── src/                   # Application source code
│   ├── components/        # React components
│   ├── hooks/             # Custom React hooks
│   ├── utils/             # Utility functions
│   ├── App.tsx            # Main app component
│   └── main.tsx           # Entry point
├── package.json           # Project metadata and scripts
├── vite.config.ts         # Vite configuration
├── eslint.config.js       # ESLint configuration
└── README.md              # Project documentation
```

---

## Available Scripts

- `npm run dev` — Start the development server
- `npm run build` — Build the app for production
- `npm run preview` — Preview the production build locally
- `npm run lint` — Run ESLint to check code quality

---

## ESLint & Code Quality

This project uses ESLint with TypeScript and React rules.  
To run lint checks:

```sh
npm run lint
```

For production applications, consider enabling type-aware lint rules and the React plugin.  
See the ESLint configuration section in this README for more details.

---

## Configuration

- Environment variables can be set in a `.env` file at the project root.
- Vite-specific configuration is in `vite.config.ts`.

---

## Contributing

Currently a 1 dev job, but reach out to johncwattenbarger@gmail.com if you'd like to contribute.

---

## Acknowledgements

- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [ESLint](https://eslint.org/)
- Fantasy football APIs and data sources

---