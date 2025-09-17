# 🚀 Marginal Mouvement - Landing Page

Landing page moderne pour Marginal Mouvement avec animation Three.js en arrière-plan.

## 📁 Structure du Projet

```
src/
├── components/           # Composants réutilisables
│   ├── BackgroundAnimation/
│   │   ├── BackgroundAnimation.jsx
│   │   ├── Dither.jsx
│   │   ├── Dither.css
│   │   └── index.js
│   ├── Layout/
│   │   ├── Layout.jsx
│   │   ├── Layout.css
│   │   └── index.js
│   └── Container/
│       ├── Container.jsx
│       ├── Container.css
│       └── index.js
├── pages/               # Pages de l'application
│   └── HomePage/
│       ├── HomePage.jsx
│       ├── HomePage.css
│       └── index.js
├── styles/              # Styles globaux
│   └── globals.css
├── assets/              # Assets (images, logos, etc.)
│   ├── images/
│   ├── logos/
│   └── icons/
└── App.jsx              # Composant principal
```

## 🛠️ Technologies Utilisées

- **React 18** - Framework UI
- **Vite** - Build tool et dev server
- **Three.js** - Animation 3D
- **React Three Fiber** - React wrapper pour Three.js
- **Postprocessing** - Effets visuels
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
```

## 🎨 Composants Disponibles

### BackgroundAnimation
Animation de vagues ditherées en arrière-plan.

**Props :**
- `waveColor` : Couleur des vagues `[r, g, b]`
- `waveSpeed` : Vitesse d'animation
- `waveFrequency` : Fréquence des vagues
- `waveAmplitude` : Amplitude des vagues
- `colorNum` : Nombre de couleurs pour le dithering
- `pixelSize` : Taille des pixels
- `disableAnimation` : Désactiver l'animation
- `enableMouseInteraction` : Interaction souris
- `mouseRadius` : Rayon d'interaction souris

### Layout
Layout principal avec animation de fond.

**Props :**
- `children` : Contenu à afficher
- `showBackgroundAnimation` : Afficher l'animation de fond
- `backgroundAnimationProps` : Props pour l'animation

### Container
Container responsive pour le contenu.

**Props :**
- `children` : Contenu
- `className` : Classes CSS additionnelles
- `maxWidth` : Largeur maximale
- `padding` : Padding
- `textAlign` : Alignement du texte

## 🎯 Fonctionnalités

- ✅ Animation Three.js fluide
- ✅ Interaction souris
- ✅ Design responsive
- ✅ Hot reload
- ✅ Composants réutilisables
- ✅ Structure modulaire
- ✅ Assets organisés

## 📱 Responsive

Le design s'adapte automatiquement aux différentes tailles d'écran :
- Desktop : 1200px+
- Tablet : 768px - 1199px
- Mobile : < 768px

## 🔧 Développement

Le projet utilise Vite pour un développement rapide avec hot reload. Tous les composants sont modulaires et réutilisables.

## 📄 Licence

Projet privé pour Marginal Mouvement.

