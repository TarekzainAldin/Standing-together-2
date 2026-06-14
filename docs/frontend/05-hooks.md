# Frontend — Hooks personnalisés

## Hooks API (data fetching)

### `useAuth` (`hooks/api/use-auth.tsx`)
```typescript
const useAuth = () => useQuery({
  queryKey: ["authUser"],
  queryFn: getCurrentUserQueryFn,  // GET /api/user/current
  staleTime: 0,
  retry: 2,
});
```
Retourne l'utilisateur connecté ou `undefined`. `staleTime: 0` force la vérification à chaque montage.

### `useGetWorkspaceQuery` (`hooks/api/use-get-workspace.tsx`)
Charge le workspace courant (avec membres). Utilisé dans `AuthProvider`.

### `useGetProjectsQuery` (`hooks/api/use-get-projects.tsx`)
Charge les projets d'un workspace. Utilisé dans la sidebar (`NavProjects`).

### `useGetWorkspaceMembersQuery` (`hooks/api/use-get-workspace-members.ts`)
Charge les membres pour les formulaires de tâches (sélecteur "Assigné à").

---

## Hooks UI/Navigation

### `useWorkspaceId` (`hooks/use-workspace-id.ts`)
```typescript
const useWorkspaceId = () => {
  const { workspaceId } = useParams();
  return workspaceId as string;
};
```
Extrait `:workspaceId` depuis React Router. Utilisé dans presque tous les composants.

### `useIsMobile` (`hooks/use-mobile.tsx`)
```typescript
const MOBILE_BREAKPOINT = 768;
// Utilise window.matchMedia pour détection responsive
```
Retourne `boolean`. Utilisé pour adapter l'affichage de la sidebar.

### `usePermissions` (`hooks/use-permissions.ts`)
```typescript
const usePermissions = (user, workspace) => {
  const [permissions, setPermissions] = useState<PermissionType[]>([]);
  useEffect(() => {
    const member = workspace.members.find(m => m.userId === user._id);
    if (member) setPermissions(member.role.permissions || []);
  }, [user, workspace]);
  return useMemo(() => permissions, [permissions]);
};
```
Calcule les permissions de l'utilisateur courant dans le workspace courant.

### `useCreateProjectDialog` / `useCreateWorkspaceDialog`
Hooks de contrôle des modales globales (open/close/toggle).

### `useConfirmDialog` (`hooks/use-confirm-dialog.tsx`)
Hook pour afficher une boîte de confirmation avant une action destructive.

### `useTaskTableFilter` (`hooks/use-task-table-filter.ts`)
Gère l'état des filtres de la table des tâches (status, priority, assignedTo, keyword, dueDate) via query params URL.

---

## Hooks métier

### `useReport` (`hooks/useReport.ts`)
```typescript
export const useReport = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDownloadReport = async (workspaceId?: string) => {
    const url = workspaceId ? `/reports/generate?workspaceId=${workspaceId}` : `/reports/generate`;
    const response = await API.get(url, { responseType: "blob" });
    // Crée un lien <a> et déclenche le téléchargement
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
    window.URL.revokeObjectURL(link.href);
  };

  return { handleDownloadReport, loading, error };
};
```

### `useTranslation` (`hooks/useTranslation.ts`)
Wrapper autour de `useTranslation` de react-i18next. Expose `t(key)`.

### `useWorkspaceTranslations` (`hooks/useWorkspaceTranslations.ts`)
Traduit les valeurs d'énums (`TaskStatusEnum`, `TaskPriorityEnum`) vers leur libellé localisé.

### `useToast` (`hooks/use-toast.ts`)
API Sonner/Toast pour afficher des notifications. Utilisé dans tous les formulaires.
