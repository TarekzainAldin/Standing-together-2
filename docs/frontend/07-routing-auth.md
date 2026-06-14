# Frontend — Routing et Authentification

## Structure des routes

```typescript
// src/routes/common/routePaths.ts

export const AUTH_ROUTES = {
  SIGN_IN: "/",
  SIGN_UP: "/sign-up",
  GOOGLE_OAUTH_CALLBACK: "/auth/callback",
};

export const PROTECTED_ROUTES = {
  WORKSPACE:       "/workspace/:workspaceId",
  TASKS:           "/workspace/:workspaceId/tasks",
  MEMBERS:         "/workspace/:workspaceId/members",
  SETTINGS:        "/workspace/:workspaceId/settings",
  PROJECT_DETAILS: "/workspace/:workspaceId/project/:projectId",
};

export const BASE_ROUTE = {
  INVITE_URL: "/invite/workspace/:inviteCode/join",
};
```

## Configuration BrowserRouter

```typescript
// src/routes/index.tsx
<BrowserRouter>
  <Routes>
    {/* Route de base — accessible sans auth */}
    <Route element={<BaseLayout />}>
      {baseRoutePaths.map(r => <Route key={r.path} path={r.path} element={r.element} />)}
    </Route>

    {/* Routes auth — redirige si déjà connecté */}
    <Route path="/" element={<AuthRoute />}>
      <Route element={<BaseLayout />}>
        {authenticationRoutePaths.map(r => <Route key={r.path} ... />)}
      </Route>
    </Route>

    {/* Routes protégées — redirige si non connecté */}
    <Route path="/" element={<ProtectedRoute />}>
      <Route element={<AppLayout />}>
        {protectedRoutePaths.map(r => <Route key={r.path} ... />)}
      </Route>
    </Route>

    {/* Catch-all */}
    <Route path="*" element={<NotFound />} />
  </Routes>
</BrowserRouter>
```

## ProtectedRoute

```typescript
const ProtectedRoute = () => {
  const { data: authData, isLoading } = useAuth();
  const user = authData?.user;

  if (isLoading) return <DashboardSkeleton />;
  return user ? <Outlet /> : <Navigate to="/" replace />;
};
```

**Comportement :**
- Pendant le chargement → skeleton UI (pas de flash de redirection)
- Si `user` existe → affiche `<Outlet />` (page demandée)
- Si `user` est undefined → redirige vers `/` (Sign-in)

## AuthRoute

```typescript
const AuthRoute = () => {
  const { data: authData, isLoading } = useAuth();
  const user = authData?.user;
  const _isAuthRoute = isAuthRoute(location.pathname);

  if (isLoading && !_isAuthRoute) return <DashboardSkeleton />;
  if (!user) return <Outlet />;

  // Déjà connecté → redirige vers workspace
  return <Navigate to={`workspace/${user.currentWorkspace?._id}`} replace />;
};
```

**Comportement :**
- Si non connecté → affiche Sign-in/Sign-up
- Si connecté → redirige vers `/workspace/<currentWorkspaceId>`

## withPermission HOC

```typescript
const withPermission = (WrappedComponent, requiredPermission) => {
  const WithPermission = (props) => {
    const { user, hasPermission, isLoading } = useAuthContext();
    const navigate = useNavigate();
    const workspaceId = useWorkspaceId();

    useEffect(() => {
      if (!user || !hasPermission(requiredPermission)) {
        navigate(`/workspace/${workspaceId}`);  // Redirige vers dashboard
      }
    }, [user, hasPermission]);

    if (isLoading) return <div>Loading...</div>;
    if (!user || !hasPermission(requiredPermission)) return;
    return <WrappedComponent {...props} />;
  };
  return WithPermission;
};
```

**Usage :**
```typescript
// Settings.tsx protégé par MANAGE_WORKSPACE_SETTINGS
export default withPermission(Settings, Permissions.MANAGE_WORKSPACE_SETTINGS);
```

## AuthProvider

Fournit via Context à tous les composants protégés :
```typescript
type AuthContextType = {
  user?: UserType;                              // Utilisateur connecté
  workspace?: WorkspaceType;                    // Workspace courant (avec membres)
  hasPermission: (p: PermissionType) => boolean; // Vérificateur de permission
  error: any;
  isLoading: boolean;
  isFetching: boolean;
  workspaceLoading: boolean;
  refetchAuth: () => void;
  refetchWorkspace: () => void;
};
```

**Logique de redirection d'erreur :**
```typescript
useEffect(() => {
  if (workspaceError?.errorCode === "ACCESS_UNAUTHORIZED") {
    navigate("/"); // Workspace inaccessible → retour à l'accueil
  }
}, [workspaceError]);
```
