# Frontend — State Management

## Zustand (État global persisté)

**Fichier :** `src/store/store.ts`

### Shape du store
```typescript
type AuthState = {
  accessToken: string | null;
  user: UserType | null;
  setAccessToken: (token: string) => void;
  clearAccessToken: () => void;
};
```

### Middleware stack
```typescript
create<StoreType>()(
  devtools(           // → Redux DevTools
    persist(          // → sessionStorage
      subscribeWithSelector(  // → souscriptions fines
        immer(        // → mutations immuables
          (set) => ({ ...createAuthSlice(set) })
        )
      ),
      {
        name: "session-storage",
        storage: {
          getItem: (name) => JSON.parse(sessionStorage.getItem(name)),
          setItem: (name, value) => sessionStorage.setItem(name, JSON.stringify(value)),
          removeItem: (name) => sessionStorage.removeItem(name),
        },
      }
    )
  )
);
```

### Accès aux données
```typescript
// Via selectors typés (createSelectors)
const accessToken = useStore.use.accessToken();   // hook
const token = useStoreBase.getState().accessToken; // hors composant React (intercepteur Axios)
```

### Cycle de vie
1. `main.tsx` → `useStoreBase.persist.rehydrate()` → charge depuis sessionStorage avant le rendu
2. Login → `setAccessToken(jwt)` → persisté dans sessionStorage
3. Logout → `clearAccessToken()` → sessionStorage vidé

### Pourquoi sessionStorage et non localStorage ?
La session expire à la fermeture de l'onglet, ce qui réduit le risque de token volé via XSS persistant.

---

## React Query (État serveur)

**Fichier :** `src/context/query-provider.tsx`

### Stratégie de cache

| Query | staleTime | Quand invalider |
|---|---|---|
| `authUser` | 0 (toujours frais) | Login / Logout |
| `workspace/:id` | défaut (0) | Edit / Delete workspace |
| `workspaces` | défaut | Create / Delete workspace |
| `projects/:workspaceId` | défaut | Create / Edit / Delete project |
| `tasks/:workspaceId` | défaut | Create / Edit / Delete task |
| `members/:workspaceId` | défaut | Join / Change role |

### Invalidation après mutation (pattern)
```typescript
useMutation({
  mutationFn: createProjectMutationFn,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["projects", workspaceId] });
    toast({ title: "Projet créé" });
  },
});
```

### Gestion d'erreurs React Query
```typescript
retry: (failureCount, error) => {
  if (failureCount < 2 && error?.message === "Network Error") return true;
  return false;  // Pas de retry sur erreurs HTTP 4xx
},
retryDelay: 0,
refetchOnWindowFocus: false,
```

---

## État local vs Global

| Type d'état | Où | Outil |
|---|---|---|
| Token JWT | Global + persisté | Zustand + sessionStorage |
| Données serveur (user, workspace, projects...) | Cache serveur | React Query |
| État d'ouverture des modales | Global léger | Zustand slice ou useState local |
| Filtres de la table des tâches | URL | nuqs (query params) |
| État des formulaires | Local | React Hook Form |
| Notifications toast | Système | Sonner/Toast |
