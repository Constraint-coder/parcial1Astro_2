# 🎮 PokéDex App — Astro + TailwindCSS

Proyecto académico: Pokédex completa construida con Astro Framework, TailwindCSS y la PokéAPI.

## 🚀 Instalación y uso

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar servidor de desarrollo
npm run dev

# 3. Build para producción
npm run build

# 4. Preview del build
npm run preview
```

El servidor de desarrollo inicia en **http://localhost:4321**

## 📄 Páginas (6 rutas)

| Ruta | Descripción |
|------|-------------|
| `/` | Inicio — Hero, features, tech stack |
| `/pokemon` | **Pokédex**: Lista de Pokémon con búsqueda, filtro y paginación |
| `/pokemon/[id]` | **Detalle dinámico**: stats, tipos, habilidades, movimientos |
| `/favorites` | **Favoritos**: Pokémon guardados en localStorage |
| `/exercises` | **20 Ejercicios**: Programación JavaScript con modal interactivo |
| `/about` | Documentación del proyecto |

## 🛠 Stack Tecnológico

- **[Astro 4.x](https://astro.build)** — SSG, File-based routing, `.astro` components
- **[TailwindCSS 3.x](https://tailwindcss.com)** — Utility-first CSS con config personalizada
- **JavaScript ES2023** — TypeScript-flavored, fetch API, async/await, localStorage
- **[PokéAPI](https://pokeapi.co)** — API REST pública de Pokémon (no requiere key)

## 📋 Requisitos cumplidos

- [x] Astro Framework + TailwindCSS
- [x] Enrutamiento estático y dinámico (`/pokemon/[id]`)
- [x] Consumo de APIs externas (PokéAPI)
- [x] +5 páginas
- [x] Página con 20 ejercicios básicos de programación
- [x] Página de lista de Pokémon (ID, nombre, imagen)
- [x] Página de detalle del Pokémon seleccionado
- [x] Página de favoritos con persistencia (localStorage)

## 📁 Estructura del proyecto

```
pokedex-app/
├── src/
│   ├── layouts/
│   │   └── Layout.astro          # Layout base: navbar + footer
│   ├── pages/
│   │   ├── index.astro            # Inicio
│   │   ├── favorites.astro        # Favoritos
│   │   ├── exercises.astro        # 20 Ejercicios
│   │   ├── about.astro            # Acerca de
│   │   └── pokemon/
│   │       ├── index.astro        # Lista Pokédex
│   │       └── [id].astro         # Detalle dinámico
│   └── styles/
│       └── global.css             # Estilos + Tailwind + animaciones
├── public/
│   └── favicon.svg
├── astro.config.mjs
├── tailwind.config.mjs
├── tsconfig.json
└── package.json
```

## 🎨 Características de diseño

- Tema oscuro con acentos dorados y rojos (estilo Pokémon)
- Tipografía: `Press Start 2P` (display) + `DM Sans` (body)
- Animaciones CSS: float, glow, bounce-in, slide-in
- Responsive: móvil, tablet y escritorio
- Colores por tipo de Pokémon
- Glassmorphism en navbar

## 💡 Notas

- La app requiere conexión a internet para consumir la PokéAPI
- Los favoritos se persisten en `localStorage` del navegador
- El enrutamiento dinámico de `/pokemon/[id]` funciona con IDs del 1 al 1010+
- La búsqueda de Pokémon es en tiempo real (client-side filtering)
