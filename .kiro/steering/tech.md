## Tech Stack

### Core Technologies
- **Framework**: React 19.1.1
- **Build Tool**: Vite 7.1.2
- **Language**: JavaScript (ES2020+, JSX)
- **Routing**: React Router DOM 7.8.2
- **Styling**: Tailwind CSS 3.4.17

### Key Libraries
- **3D Graphics**: Three.js 0.180.0, @react-three/fiber, @react-three/drei
- **AI Integration**: @google/generative-ai (Gemini API)
- **Icons**: lucide-react
- **Error Handling**: react-error-boundary

### Development Tools
- **Linting**: ESLint 9.33.0 with React Hooks and React Refresh plugins
- **CSS Processing**: PostCSS with Autoprefixer

### Common Commands

```bash
# Development server (run manually in terminal)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

### Configuration Notes
- ESLint configured with flat config format
- Unused variables starting with uppercase or underscore are allowed
- Vite uses Fast Refresh for HMR
- Base path set to "/" for deployment
