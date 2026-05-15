# PokéToons

A sleek, local-first Pokémon catching game built with React, TypeScript, and Vite. PokéToons focuses on offering a fast-paced, guessing-based gameplay experience with a minimalist dark aesthetic.

## 🎮 The Game

In PokéToons, your goal is simple: **Identify and catch 'em all.**

### Core Mechanics
- **Starter Pokémon:** Begin your journey by choosing Bulbasaur, Charmander, or Squirtle.
- **Manual Sessions:** You control when the hunt begins and ends. Start a session to trigger encounters.
- **The Encounter:** A random Pokémon appears! You have **60 seconds** to guess its name.
- **The Catch:** A correct guess successfully catches the Pokémon and adds it to your collection.
- **Progression:** Every successful catch increases the level of your most recent 30 Pokémon. As you catch more, rarer and more powerful Pokémon will begin to spawn.

## ✨ Key Features
- **Local-First:** All your progress, trainer data, and collection are saved directly in your browser's `localStorage`. No accounts or internet connection required (except for fetching artwork).
- **Comprehensive Catalog:** Includes all 251 Pokémon from the Johto and Kanto regions with detailed rarity buckets (Common to Legendary).
- **Dynamic Leveling:** Pokémon level up through successful catches, capped at Level 100.
- **Domain-Driven Design:** Clean architecture with logic neatly separated into `encounter`, `pokemon`, `storage`, and `trainer` domains.
- **Dark Aesthetic:** A minimalist, monochrome UI designed for focus and speed.
- **Mobile-Responsive:** Play seamlessly on your phone or desktop.

## 🛠️ Technical Stack
- **Framework:** [React 19](https://react.dev/)
- **Build Tool:** [Vite](https://vitejs.dev/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS 4](https://tailwindcss.com/)
- **State Management:** Reducer-driven state with custom selectors.
- **Persistence:** Browser `localStorage`.

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (Latest LTS recommended)
- [pnpm](https://pnpm.io/) (or npm/yarn)

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/poketoons.git
   cd poketoons
   ```
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Start the development server:
   ```bash
   pnpm dev
   ```

### Scripts
- `pnpm dev`: Starts the development server.
- `pnpm build`: Builds the application for production.
- `pnpm lint`: Runs ESLint to check for code quality.
- `pnpm preview`: Previews the production build locally.

## 📁 Project Structure
```text
src/
├── app/          # Top-level shell and App component
├── assets/       # Static assets (images, etc)
├── domains/      # Business logic domains (encounter, pokemon, storage, trainer)
├── shared/       # Shared UI, data, and generic library functions
└── index.css     # Global styles and Tailwind configuration
```

## 📜 License
This project is open-source and available under the [MIT License](LICENSE).

---
*Disclaimer: This is a fan-made project. Pokémon and Pokémon character names are trademarks of Nintendo.*
