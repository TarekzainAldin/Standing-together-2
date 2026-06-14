# Frontend — Vue d'ensemble

## Stack technique

| Propriété | Valeur |
|---|---|
| Framework | React 18 |
| Build tool | Vite 6 |
| Langage | TypeScript (strict) |
| Styles | Tailwind CSS 3 |
| Composants UI | shadcn/ui (Radix UI) |
| State management | Zustand 5 |
| Data fetching | TanStack React Query 5 |
| Formulaires | React Hook Form + Zod |
| Routing | React Router DOM 6 |
| i18n | i18next + react-i18next (EN/FR/AR) |
| Client HTTP | Axios |
| Notifications | sonner / toast (shadcn) |
| Police | DM Sans (Google Fonts) |

---

## Arborescence du projet

```
frontend/src/
├── App.tsx                         # Racine : renvoie <AppRoutes />
├── main.tsx                        # Point d'entrée : init Zustand + i18n + React DOM
├── index.css                       # Variables CSS (design tokens) + reset Tailwind
├── vite-env.d.ts                   # Types des variables d'environnement Vite
│
├── assets/
│   ├── logo.png                    # Logo SVG/PNG
│   └── react.svg
│
├── components/
│   ├── asidebar/                   # Sidebar de navigation
│   │   ├── asidebar.tsx            # Conteneur principal de la sidebar
│   │   ├── logout-dialog.tsx       # Dialog de confirmation de déconnexion
│   │   ├── nav-main.tsx            # Navigation principale (liens)
│   │   ├── nav-projects.tsx        # Liste des projets dans la sidebar
│   │   └── workspace-switcher.tsx  # Sélecteur de workspace + bouton rapport
│   ├── auth/
│   │   └── google-oauth-button.tsx # Bouton "Continue with Google"
│   ├── confirm-dialog/
│   │   └── index.tsx               # Dialog de confirmation générique
│   ├── emoji-picker/
│   │   ├── custom-emojis.ts        # Liste d'emojis personnalisés
│   │   └── index.tsx               # Sélecteur d'emoji pour les projets
│   ├── header.tsx                  # En-tête avec breadcrumb
│   ├── logo/
│   │   └── index.tsx               # Composant logo
│   ├── resuable/                   # ⚠️ typo : devrait être "reusable"
│   │   ├── confirm-dialog.tsx      # Dialog de confirmation
│   │   └── permission-guard.tsx    # Garde de permission UI
│   ├── skeleton-loaders/
│   │   ├── dashboard-skeleton.tsx  # Squelette de chargement dashboard
│   │   └── table-skeleton.tsx      # Squelette de chargement table
│   ├── ui/                         # Composants shadcn/ui (générés)
│   │   ├── avatar.tsx, badge.tsx, breadcrumb.tsx, button.tsx
│   │   ├── calendar.tsx, card.tsx, checkbox.tsx, command.tsx
│   │   ├── dialog.tsx, dropdown-menu.tsx, form.tsx, input.tsx
│   │   ├── label.tsx, pagination.tsx, popover.tsx, select.tsx
│   │   ├── sidebar.tsx, tabs.tsx, textarea.tsx, toast.tsx
│   │   ├── toaster.tsx, tooltip.tsx, table.tsx
│   │   └── button-variants.ts
│   └── workspace/
│       ├── common/
│       │   ├── analytics-card.tsx      # Carte d'analytics réutilisable
│       │   └── workspace-header.tsx    # En-tête du workspace
│       ├── create-workspace-dialog.tsx # Dialog création workspace
│       ├── create-workspace-form.tsx   # Formulaire création workspace
│       ├── edit-workspace-form.tsx     # Formulaire édition workspace
│       ├── member/
│       │   ├── all-members.tsx         # Liste complète des membres
│       │   ├── invite-member.tsx       # Lien d'invitation avec copie
│       │   └── recent-members.tsx      # Aperçu des derniers membres
│       ├── project/
│       │   ├── create-project-dialog.tsx
│       │   ├── create-project-form.tsx
│       │   ├── edit-project-dialog.tsx
│       │   ├── edit-project-form.tsx
│       │   ├── project-analytics.tsx
│       │   ├── project-header.tsx
│       │   └── recent-projects.tsx
│       ├── settings/
│       │   └── delete-workspace-card.tsx
│       ├── task/
│       │   ├── create-task-dialog.tsx
│       │   ├── create-task-form.tsx
│       │   ├── edit-task-dialog.tsx
│       │   ├── edit-task-form.tsx
│       │   ├── recent-tasks.tsx
│       │   ├── task-table.tsx
│       │   └── table/
│       │       ├── columns.tsx             # Définition des colonnes TanStack Table
│       │       ├── data.tsx                # Données statiques (statuts, priorités)
│       │       ├── table.tsx               # DataTable générique
│       │       ├── table-column-header.tsx # En-tête de colonne triable
│       │       ├── table-faceted-filter.tsx # Filtres à facettes
│       │       ├── table-pagination.tsx    # Pagination
│       │       └── table-row-actions.tsx   # Actions (modifier, supprimer)
│       └── workspace-analytics.tsx         # Cards analytics workspace
│
├── constant/
│   └── index.ts                    # Réexporte les enums depuis types (TaskStatus, Permissions)
│
├── context/
│   ├── auth-provider.tsx           # AuthContext : user, workspace, hasPermission
│   └── query-provider.tsx          # QueryClientProvider React Query
│
├── hoc/
│   └── with-permission.tsx         # HOC : encapsule un composant avec vérification de permission
│
├── hooks/
│   ├── api/
│   │   ├── use-auth.tsx            # useQuery : GET /api/user/current
│   │   ├── use-get-projects.tsx    # useQuery : GET /api/project/workspace/:id/all
│   │   ├── use-get-workspace-members.ts
│   │   └── use-get-workspace.tsx
│   ├── use-confirm-dialog.tsx
│   ├── use-create-project-dialog.tsx
│   ├── use-create-workspace-dialog.tsx
│   ├── use-mobile.tsx              # Détection mobile (breakpoint 768px)
│   ├── use-permissions.ts          # Calcul des permissions depuis workspace.members
│   ├── use-task-table-filter.ts    # Gestion des filtres de la table des tâches
│   ├── use-toast.ts
│   ├── use-workspace-id.ts         # Extrait :workspaceId depuis React Router
│   ├── useReport.ts                # Téléchargement rapport Excel
│   ├── useTranslation.ts           # Wrapper useTranslation i18next
│   └── useWorkspaceTranslations.ts
│
├── i18n/
│   ├── i18n.ts                     # Configuration i18next (EN/FR/AR + LanguageDetector)
│   └── locales/
│       ├── en.json                 # Traductions anglaises
│       ├── fr.json                 # Traductions françaises
│       └── ar.json                 # Traductions arabes
│
├── layout/
│   ├── app.layout.tsx              # Layout protégé : AuthProvider + Sidebar + Header
│   └── base.layout.tsx             # Layout minimal : juste <Outlet />
│
├── lib/
│   ├── api.ts                      # Toutes les fonctions API (axios calls)
│   ├── axios-client.ts             # Instance Axios avec intercepteurs JWT
│   ├── base-url.ts                 # Export de VITE_API_BASE_URL
│   ├── helper.ts                   # Fonctions utilitaires
│   └── utils.ts                    # cn() — merge de classes Tailwind
│
├── page/
│   ├── auth/
│   │   ├── Sign-in.tsx             # Page connexion
│   │   ├── Sign-up.tsx             # Page inscription
│   │   └── GoogleOAuthFailure.tsx  # Page d'erreur OAuth
│   ├── errors/
│   │   ├── NotFound.tsx            # Page 404
│   │   └── Unauthorized.tsx        # Page 403
│   ├── invite/
│   │   └── InviteUser.tsx          # Page d'acceptation d'invitation
│   └── workspace/
│       ├── Dashboard.tsx           # Vue d'ensemble du workspace
│       ├── Members.tsx             # Gestion des membres
│       ├── ProjectDetails.tsx      # Détails d'un projet + tâches
│       ├── Settings.tsx            # Paramètres du workspace
│       └── Tasks.tsx               # Toutes les tâches (table filtrée)
│
├── routes/
│   ├── index.tsx                   # BrowserRouter + définition des Routes
│   ├── auth.route.tsx              # AuthRoute (redirige si connecté)
│   ├── protected.route.tsx         # ProtectedRoute (redirige si non connecté)
│   └── common/
│       ├── routes.tsx              # Tableaux de routes (auth, protected, base)
│       └── routePaths.ts           # Constantes des chemins
│
├── store/
│   ├── store.ts                    # Zustand store (accessToken, user)
│   └── selectors.ts                # createSelectors (accès par clé)
│
└── types/
    ├── api.type.ts                 # Types TypeScript de toutes les réponses API
    └── custom-error.type.ts        # Interface CustomError (avec errorCode)
```

---

## Point d'entrée : `main.tsx`

```typescript
import "./i18n/i18n";                          // 1. Initialise i18next avant le rendu

async function initApp() {
  await useStoreBase.persist.rehydrate();      // 2. Recharge Zustand depuis sessionStorage

  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <QueryProvider>                          // 3. React Query (QueryClient)
        <NuqsAdapter>                          // 4. Gestion des query params URL
          <App />                              // 5. Application principale → AppRoutes
        </NuqsAdapter>
        <Toaster />                            // 6. Système de notifications toast
      </QueryProvider>
    </StrictMode>
  );
}

initApp();
```

---

## Variables d'environnement (`.env.example`)

| Variable | Description |
|---|---|
| `VITE_API_BASE_URL` | URL de base de l'API backend (ex: `http://localhost:8000/api`) |

**Note :** Une seule variable d'environnement côté frontend. La valeur par défaut dans `axios-client.ts` est `https://basalt-tech.org/` (URL de production).

---

## Scripts `package.json`

| Script | Commande | Description |
|---|---|---|
| `dev` | `vite` | Serveur de développement HMR (port 5173) |
| `build` | `tsc -b && vite build` | Compile TypeScript puis bundle avec Vite |
| `lint` | `eslint .` | Vérifie le code avec ESLint |
| `preview` | `vite preview` | Prévisualise le build de production localement |
