# Frontend — UI et Design

## Tailwind CSS — Configuration

**Fichier :** `frontend/tailwind.config.js`

### Système de couleurs (Design Tokens via CSS variables)

```javascript
colors: {
  background:  'hsl(var(--background))',
  foreground:  'hsl(var(--foreground))',
  primary:     { DEFAULT: 'hsl(var(--primary))', foreground: '...' },
  secondary:   { DEFAULT: 'hsl(var(--secondary))', foreground: '...' },
  muted:       { DEFAULT: 'hsl(var(--muted))', foreground: '...' },
  accent:      { DEFAULT: 'hsl(var(--accent))', foreground: '...' },
  destructive: { DEFAULT: 'hsl(var(--destructive))', foreground: '...' },
  card:        { DEFAULT: 'hsl(var(--card))', foreground: '...' },
  border: 'hsl(var(--border))',
  input:  'hsl(var(--input))',
  ring:   'hsl(var(--ring))',
  chart:  { '1': '...', '2': '...', '3': '...', '4': '...', '5': '...' },
  sidebar: { DEFAULT: '...', foreground: '...', primary: '...', ... }
}
```

### Mode sombre
```javascript
darkMode: ["class"]
// Activé en ajoutant la classe "dark" sur <html>
// Compatible avec le système de tokens CSS
```

### Border Radius
```javascript
borderRadius: {
  lg: 'var(--radius)',
  md: 'calc(var(--radius) - 2px)',
  sm: 'calc(var(--radius) - 4px)',
}
```

### Plugin
```javascript
plugins: [require("tailwindcss-animate")]
// Animations CSS (utilisé par shadcn/ui pour les transitions)
```

---

## Breakpoints Tailwind utilisés

| Breakpoint | Valeur | Utilisation |
|---|---|---|
| aucun (mobile first) | `< 768px` | Layout empilé, boutons pleine largeur |
| `md:` | `≥ 768px` | Padding augmenté (`px-4 md:px-8`) |
| `lg:` | `≥ 1024px` | Flexbox côte à côte (`block lg:flex`), largeur auto (`w-full lg:w-auto`) |

**Détection JS :** `useIsMobile()` avec breakpoint à 768px via `window.matchMedia`.

---

## Palette visuelle (pages auth)

Gradient signature de l'application :
```
from-indigo-500 via-purple-500 to-pink-500
dark: from-gray-950 via-purple-950 to-gray-900
```

Cartes : `bg-white/95 dark:bg-gray-900/90 backdrop-blur-xl rounded-3xl`

---

## Police

**DM Sans** (Google Fonts) — chargée dans `index.html` :
```html
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&display=swap" rel="stylesheet" />
```

---

## Design Tokens CSS (`src/index.css`)

Variables CSS définies dans `:root` et `.dark` pour le mode sombre :
```css
:root {
  --background: ...;
  --foreground: ...;
  --primary: ...;
  --radius: 0.5rem;
  ...
}
.dark {
  --background: ...;
  --foreground: ...;
  ...
}
```

---

## shadcn/ui — Composants installés

Basés sur **Radix UI** (accessibilité native) :

| Composant | Radix primitive | Rôle |
|---|---|---|
| Dialog | `@radix-ui/react-dialog` | Modales |
| DropdownMenu | `@radix-ui/react-dropdown-menu` | Menus |
| Select | `@radix-ui/react-select` | Sélecteurs |
| Tooltip | `@radix-ui/react-tooltip` | Info-bulles |
| Popover | `@radix-ui/react-popover` | Conteneurs flottants |
| Checkbox | `@radix-ui/react-checkbox` | Cases à cocher |
| Tabs | `@radix-ui/react-tabs` | Navigation par onglets |
| Avatar | `@radix-ui/react-avatar` | Photos de profil |

**Accessibilité Radix UI (intégrée) :**
- `aria-modal`, `aria-labelledby`, `aria-describedby` sur les Dialog
- `aria-expanded`, `aria-controls` sur les DropdownMenu
- `aria-checked` sur les Checkbox
- Navigation clavier (Tab, Enter, Escape, flèches)
- Focus trap dans les Dialog

---

## Accessibilité — État actuel

✅ Radix UI fournit aria-* sur tous les composants interactifs
✅ `alt` présent sur les images (`avatarAlt` dans les traductions)
✅ Labels explicites sur tous les champs de formulaire
✅ Contraste élevé via Tailwind (indigo/white)

⚠️ `<html lang="en">` fixe — ne change pas avec i18n
⚠️ Pas de support RTL explicite pour l'arabe
⚠️ Pas de tests d'accessibilité automatisés (axe-core, Lighthouse)
⚠️ `<a href="#">` dans Sign-in pour "Forgot password?" et "Terms/Privacy" — liens morts
