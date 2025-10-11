## Project Structure

### Root Configuration
- `index.html` - Entry HTML file
- `vite.config.js` - Vite build configuration
- `tailwind.config.js` - Tailwind CSS configuration
- `eslint.config.js` - ESLint flat config
- `postcss.config.js` - PostCSS configuration
- `.env` - Environment variables (e.g., API keys)

### Source Organization (`src/`)

#### Main Files
- `main.jsx` - Application entry point, wraps App in BrowserRouter
- `App.jsx` - Root component with routing logic and global state
- `index.css` - Global styles and Tailwind imports
- `App.css` - App-specific styles

#### Components (`src/components/`)
Reusable UI components:
- `PageHeader.jsx` - Navigation header
- `PageFooter.jsx` - Footer component
- `GeminiChat.jsx` - AI chat interface
- `GeminiChatWidget.jsx` - Chat widget wrapper
- `VideoPlayer.jsx` - Video playback component

#### Pages (`src/pages/`)
Route-level page components:
- `Home.jsx` - Landing page
- `About.jsx` - About section
- `Work.jsx` - Work experience
- `Projects.jsx` - Projects showcase
- `ProjectsRepo.jsx` - Projects repository view
- `ThoughtsPage.jsx` - Blog/thoughts section
- `Shop.jsx` - E-commerce shop
- `Cart.jsx` - Shopping cart
- `Learn.jsx` - Learning resources
- `NotFound.jsx` - 404 error page

#### Games (`src/games/`)
Interactive game components:
- `BowGame.jsx`
- `CavemanGame.jsx`
- `RunnerGame.jsx`

#### Assets (`src/assets/`)
Static assets like images, fonts, etc.

#### Styles (`src/styles/`)
Additional style modules

### Public Assets (`public/`)
- Static files served directly
- Images stored in `public/images/`
- Favicon and other public assets

### Conventions

**Routing**:
- React Router DOM handles client-side routing
- Routes defined in `App.jsx`
- Page-specific background colors managed via Tailwind classes
- Navigation handled through `handleNavigate` function

**State Management**:
- Local state in App.jsx for cart functionality
- Props passed down to child components
- No global state management library used

**Styling**:
- Tailwind utility classes for styling
- Page-specific backgrounds: Home/ProjectsRepo (dark), About (green), Work (amber), others (white)
- Responsive design using Tailwind breakpoints

**Component Naming**:
- PascalCase for component files and names
- Page components in `pages/` folder
- Reusable components in `components/` folder
- Game components in `games/` folder
