# Frontend — Composants clés

## AuthProvider (`context/auth-provider.tsx`)

**Props :** `{ children: ReactNode }`

**Ce qu'il fournit via Context :**
```typescript
type AuthContextType = {
  user?: UserType;
  workspace?: WorkspaceType;
  hasPermission: (permission: PermissionType) => boolean;
  error: any;
  isLoading: boolean;
  isFetching: boolean;
  workspaceLoading: boolean;
  refetchAuth: () => void;
  refetchWorkspace: () => void;
};
```

**Logique :**
1. Appelle `useAuth()` → charge `user` depuis l'API
2. Appelle `useGetWorkspaceQuery(workspaceId)` → charge le workspace courant
3. Appelle `usePermissions(user, workspace)` → calcule les permissions
4. Si `workspaceError.errorCode === "ACCESS_UNAUTHORIZED"` → redirige vers `/`

---

## ProtectedRoute (`routes/protected.route.tsx`)

Vérifie l'authentification avant d'afficher les pages protégées :
```typescript
const ProtectedRoute = () => {
  const { data: authData, isLoading } = useAuth();
  const user = authData?.user;
  if (isLoading) return <DashboardSkeleton />;
  return user ? <Outlet /> : <Navigate to="/" replace />;
};
```

---

## AuthRoute (`routes/auth.route.tsx`)

Redirige un utilisateur **déjà connecté** vers son workspace :
```typescript
if (!user) return <Outlet />;
return <Navigate to={`workspace/${user.currentWorkspace?._id}`} replace />;
```

---

## withPermission HOC (`hoc/with-permission.tsx`)

```typescript
const withPermission = (WrappedComponent, requiredPermission) => {
  const WithPermission = (props) => {
    const { user, hasPermission, isLoading } = useAuthContext();
    useEffect(() => {
      if (!user || !hasPermission(requiredPermission)) {
        navigate(`/workspace/${workspaceId}`);
      }
    }, [user, hasPermission]);
    if (!user || !hasPermission(requiredPermission)) return;
    return <WrappedComponent {...props} />;
  };
  return WithPermission;
};
```

**Usage :** `export default withPermission(Settings, Permissions.MANAGE_WORKSPACE_SETTINGS)`

---

## DataTable (`components/workspace/task/table/table.tsx`)

**Props :**
```typescript
interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  isLoading?: boolean;
  filtersToolbar?: ReactNode;
  pagination?: { totalCount, pageNumber, pageSize };
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
}
```

**Features :**
- TanStack Table v8 avec tri, filtres, visibilité des colonnes
- Pagination **serveur** (manualPagination: true)
- i18n complet via `useTranslation()`
- Responsive (block → lg:flex)
- Skeleton loader pendant le chargement

---

## GoogleOauthButton (`components/auth/google-oauth-button.tsx`)

Bouton qui redirige vers `${baseURL}/auth/google` pour démarrer le flux OAuth.

---

## WorkspaceSwitcher (`components/asidebar/workspace-switcher.tsx`)

- Affiche les workspaces de l'utilisateur
- Permet de switcher (navigue vers `/workspace/:id`)
- Contient le bouton "Télécharger rapport" (via `useReport`)
- Affiche le nom et initiales de l'utilisateur

---

## Asidebar (`components/asidebar/asidebar.tsx`)

Sidebar complète avec :
- Logo + nom de l'app
- WorkspaceSwitcher
- NavMain (liens : Dashboard, Tasks, Members, Settings)
- NavProjects (liste des projets)
- LogoutDialog

---

## InviteMember (`components/workspace/member/invite-member.tsx`)

Affiche le lien d'invitation et copie dans le presse-papiers via l'API Clipboard.

---

## AnalyticsCard (`components/workspace/common/analytics-card.tsx`)

Carte générique pour afficher une métrique :
```typescript
interface Props {
  label: string;
  value: number;
  icon?: ReactNode;
}
```

---

## EmojiPicker (`components/emoji-picker/index.tsx`)

Sélecteur d'emoji pour les projets. Utilise une liste d'emojis personnalisés (`custom-emojis.ts`).

---

## Composants shadcn/ui utilisés

Tous générés via `npx shadcn-ui add` et stockés dans `components/ui/` :

| Composant | Utilisation |
|---|---|
| `Button` | Actions, formulaires |
| `Card` | Containers d'information |
| `Dialog` | Modales (création, confirmation) |
| `Form` | Intégration React Hook Form |
| `Input`, `Textarea` | Champs de formulaire |
| `Select` | Sélecteurs (rôle, priorité, statut) |
| `Table` | Base du DataTable |
| `Tabs` | Navigation Dashboard |
| `Badge` | Statuts et priorités des tâches |
| `Avatar` | Photos de profil |
| `Breadcrumb` | Navigation dans le Header |
| `DropdownMenu` | Menus contextuels |
| `Calendar` | Sélecteur de date |
| `Popover` | Containers flottants |
| `Checkbox` | Sélection en table |
| `Tooltip` | Info-bulles |
| `Toast` / `Toaster` | Notifications |
| `Sidebar` | Sidebar adaptative |
| `Command` | Recherche dans les sélecteurs |
