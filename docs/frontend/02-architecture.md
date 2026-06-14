# Frontend — Architecture

## Hiérarchie des composants

```
main.tsx
└── <QueryProvider>          (React Query)
    └── <NuqsAdapter>        (URL state)
        └── <App />
            └── <AppRoutes>  (BrowserRouter)
                ├── <BaseLayout>           → Pages publiques (invitation)
                ├── <AuthRoute>
                │   └── <BaseLayout>
                │       ├── <SignIn />
                │       ├── <SignUp />
                │       └── <GoogleOAuthFailure />
                └── <ProtectedRoute>
                    └── <AppLayout>
                        ├── <AuthProvider>         (Context: user, workspace, permissions)
                        ├── <SidebarProvider>
                        │   ├── <Asidebar />       (Navigation + workspace switcher)
                        │   └── <SidebarInset>
                        │       ├── <Header />     (Breadcrumb)
                        │       └── <Outlet />     → Page courante
                        ├── <CreateWorkspaceDialog />
                        └── <CreateProjectDialog />
```

---

## Architecture du State Management

### Zustand (`store/store.ts`)

État global persisté dans `sessionStorage` :
```typescript
type AuthState = {
  accessToken: string | null;   // JWT Bearer token
  user: UserType | null;        // Données basiques de l'utilisateur
  setAccessToken: (token) => void;
  clearAccessToken: () => void;
};
```

**Middleware Zustand utilisés :**
- `devtools` → inspect dans Redux DevTools
- `persist` → survit aux rechargements (sessionStorage)
- `subscribeWithSelector` → souscription fine
- `immer` → mutations immuables

**Accès via selectors typés :**
```typescript
const accessToken = useStore.use.accessToken();
const setAccessToken = useStore.use.setAccessToken();
```

### React Query (`context/query-provider.tsx`)

Gère le cache des données serveur :
```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        if (failureCount < 2 && error?.message === "Network Error") return true;
        return false;
      },
      retryDelay: 0,
    },
  },
});
```

**Query Keys utilisées :**
| Query Key | Endpoint | Invalidation |
|---|---|---|
| `["authUser"]` | `GET /user/current` | Login, Logout |
| `["workspace", workspaceId]` | `GET /workspace/:id` | Edit, Delete workspace |
| `["workspaces"]` | `GET /workspace/all` | Create, Delete workspace |
| `["projects", workspaceId]` | `GET /project/workspace/:id/all` | Create, Edit, Delete project |
| `["tasks", workspaceId]` | `GET /task/workspace/:id/all` | Create, Edit, Delete task |
| `["members", workspaceId]` | `GET /workspace/members/:id` | Join, Change role |
| `["analytics", workspaceId]` | `GET /workspace/analytics/:id` | — |

---

## Flux d'authentification

```
1. Utilisateur ouvre l'app
2. Zustand.persist.rehydrate() → charge accessToken depuis sessionStorage
3. useAuth() → GET /api/user/current (avec Bearer token depuis Axios interceptor)
4. Si 200 : user stocké dans React Query cache
5. ProtectedRoute vérifie : data?.user → existe → Outlet / → Navigate("/")
6. AuthProvider charge workspace et permissions

--- Login ---
7. Soumission formulaire SignIn
8. useMutation → POST /api/auth/login
9. Réponse : { access_token, user }
10. setAccessToken(token) → Zustand → sessionStorage
11. navigate(`/workspace/${user.currentWorkspace}`)

--- Google OAuth ---
12. Clic "Continue with Google"
13. window.location → GET /api/auth/google
14. Redirect Google → callback → URL: ?status=success&access_token=<jwt>
15. GoogleOAuthFailure page traite les params URL
16. setAccessToken(token) → navigate workspace

--- Logout ---
17. clearAccessToken() → Zustand vide → sessionStorage vide
18. navigate("/") → AuthRoute redirige vers SignIn
```

---

## Architecture du routage

```typescript
// 3 groupes de routes

// 1. Routes de base (accessibles à tous)
baseRoutePaths = [
  { path: "/invite/workspace/:inviteCode/join", element: <InviteUser /> }
]

// 2. Routes d'authentification (redirigent si déjà connecté)
authenticationRoutePaths = [
  { path: "/",               element: <SignIn /> },
  { path: "/sign-up",        element: <SignUp /> },
  { path: "/auth/callback",  element: <GoogleOAuthFailure /> },
]

// 3. Routes protégées (redirigent vers "/" si non connecté)
protectedRoutePaths = [
  { path: "/workspace/:workspaceId",                    element: <WorkspaceDashboard /> },
  { path: "/workspace/:workspaceId/tasks",              element: <Tasks /> },
  { path: "/workspace/:workspaceId/members",            element: <Members /> },
  { path: "/workspace/:workspaceId/settings",           element: <Settings /> },
  { path: "/workspace/:workspaceId/project/:projectId", element: <ProjectDetails /> },
]
```

---

## Flux de données (data fetching)

```
Page/Composant
    │
    ▼
Custom Hook (useQuery / useMutation)
    │
    ▼
lib/api.ts (fonction typée)
    │
    ▼
lib/axios-client.ts (Axios instance)
    │ Intercepteur request : ajoute "Authorization: Bearer <token>"
    │ Intercepteur response : normalise les erreurs → CustomError
    │
    ▼
API Backend (https://basalt-tech.org/api/*)
    │
    ▼ (réponse)
React Query cache
    │
    ▼
Composant re-render avec nouvelles données
```

---

## Permissions côté Frontend

```typescript
// 1. AuthProvider appelle usePermissions(user, workspace)
// 2. usePermissions cherche user dans workspace.members
// 3. Retourne member.role.permissions[]

// 4. hasPermission() vérifie
const hasPermission = (permission: PermissionType): boolean =>
  permissions.includes(permission);

// 5. withPermission HOC encapsule les pages
const SettingsPage = withPermission(Settings, Permissions.MANAGE_WORKSPACE_SETTINGS);

// 6. permission-guard.tsx pour les éléments UI inline
<PermissionGuard permission={Permissions.DELETE_PROJECT}>
  <DeleteButton />
</PermissionGuard>
```

**Note :** Les permissions frontend sont **décoratives** (UX) — la vraie sécurité est côté backend via `roleGuard()`.
