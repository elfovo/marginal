# 🚀 Marginal Mouvement - Landing Page

Landing page moderne pour Marginal Mouvement avec animations Three.js et effets visuels avancés.

## 📁 Structure du Projet

```
src/
├── components/           # Composants réutilisables
│   ├── CircularGallery/
│   │   ├── CircularGallery.jsx
│   │   ├── CircularGallery.css
│   │   └── index.js
│   ├── ScrollReveal/
│   │   ├── ScrollReveal.jsx
│   │   ├── ScrollReveal.css
│   │   └── index.js
│   └── Plasma/
│       ├── Plasma.jsx
│       ├── Plasma.css
│       └── index.js
├── styles/              # Styles globaux
│   └── globals.css
├── assets/              # Assets (images, logos, etc.)
│   ├── images/
│   ├── logos/
│   └── metadata.json
└── App.jsx              # Composant principal
```

## 🛠️ Technologies Utilisées

- **React 19** - Framework UI moderne
- **Vite** - Build tool et dev server ultra-rapide
- **Three.js** - Animations 3D et WebGL
- **React Three Fiber** - React wrapper pour Three.js
- **Postprocessing** - Effets visuels avancés
- **GSAP** - Animations fluides et scroll triggers
- **OGL** - WebGL library pour la galerie circulaire
- **CSS3** - Styles et animations

## 🚀 Installation et Démarrage

```bash
# Installer les dépendances
npm install

# Démarrer le serveur de développement
npm run dev

# Build pour production
npm run build

# Preview du build
npm run preview

# Nettoyer le cache
npm run clean
```

## 🎨 Composants Disponibles

### CircularGallery
Galerie circulaire interactive avec WebGL et effets de courbure.

**Props :**
- `items` : Array d'objets avec `image` et `text`
- `bend` : Intensité de la courbure (défaut: 0.5)
- `textColor` : Couleur du texte (défaut: "#ffffff")
- `borderRadius` : Rayon des coins arrondis (défaut: 0.15)
- `scrollSpeed` : Vitesse de défilement (défaut: 2)
- `scrollEase` : Fluidité de l'animation (défaut: 0.06)

### ScrollReveal
Animation de texte au scroll avec effets de rotation et de flou.

**Props :**
- `children` : Texte à animer
- `enableBlur` : Activer l'effet de flou (défaut: true)
- `baseOpacity` : Opacité initiale (défaut: 0.1)
- `baseRotation` : Rotation initiale (défaut: 3)
- `blurStrength` : Intensité du flou (défaut: 4)

### Plasma
Effet plasma animé avec shaders WebGL et interaction souris.

**Props :**
- `color` : Couleur personnalisée (défaut: "#ffffff")
- `speed` : Vitesse d'animation (défaut: 1)
- `direction` : Direction ("forward" ou "reverse")
- `scale` : Échelle de l'effet (défaut: 1)
- `opacity` : Opacité (défaut: 1)
- `mouseInteractive` : Interaction souris (défaut: true)

## 🎯 Fonctionnalités

- ✅ Animations Three.js fluides avec shaders personnalisés
- ✅ Galerie circulaire interactive avec WebGL
- ✅ Effets de scroll avec GSAP
- ✅ Design responsive et adaptatif
- ✅ Hot reload instantané avec Vite
- ✅ Composants modulaires et réutilisables
- ✅ Structure organisée et maintenable
- ✅ Assets optimisés

## 📱 Responsive

Le design s'adapte automatiquement aux différentes tailles d'écran :
- Desktop : 1200px+
- Tablet : 768px - 1199px
- Mobile : < 768px

## 🔧 Développement

Le projet utilise Vite pour un développement ultra-rapide avec hot reload. Tous les composants sont modulaires et réutilisables. Les animations utilisent WebGL pour des performances optimales.

## 📄 Licence

Projet privé pour Marginal Mouvement.