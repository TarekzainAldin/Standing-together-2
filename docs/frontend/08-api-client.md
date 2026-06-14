# Frontend — Client API

## Instance Axios (`src/lib/axios-client.ts`)

```typescript
const baseURL = import.meta.env.VITE_API_BASE_URL || "https://basalt-tech.org/";

const API = axios.create({
  baseURL,
  withCredentials: true,  // Envoie les cookies si présents
  timeout: 10000,         // 10 secondes de timeout
});
```

### Intercepteur de requête — Injection JWT

```typescript
API.interceptors.request.use((config) => {
  const accessToken = useStoreBase.getState().accessToken;
  if (accessToken) {
    config.headers["Authorization"] = "Bearer " + accessToken;
  }
  return config;
});
```

**Important :** L'accès à `useStoreBase.getState()` **hors d'un composant React** est possible grâce à l'API Zustand `getState()`. Cela évite d'avoir à passer le token manuellement à chaque appel.

### Intercepteur de réponse — Normalisation des erreurs

```typescript
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const data = error?.response?.data;
    const customError: CustomError = {
      ...error,
      errorCode: data?.errorCode || "UNKNOWN_ERROR",
    };
    return Promise.reject(customError);
  }
);
```

**CustomError type :**
```typescript
export interface CustomError extends Error {
  errorCode?: string;  // Ex: "ACCESS_UNAUTHORIZED", "VALIDATION_ERROR"
}
```

Permet d'utiliser `error.errorCode` dans les composants pour réagir aux erreurs spécifiques.

---

## Fonctions API (`src/lib/api.ts`)

### Auth
```typescript
loginMutationFn(data: { email, password })         → POST /auth/login
registerMutationFn(data: { name, email, password }) → POST /auth/register
logoutMutationFn()                                  → POST /auth/logout
getCurrentUserQueryFn()                             → GET /user/current
```

### Workspace
```typescript
createWorkspaceMutationFn(data)                     → POST /workspace/create/new
editWorkspaceMutationFn({ workspaceId, data })       → PUT /workspace/update/:id
getAllWorkspacesUserIsMemberQueryFn()                → GET /workspace/all
getWorkspaceByIdQueryFn(workspaceId)                → GET /workspace/:id
getMembersInWorkspaceQueryFn(workspaceId)           → GET /workspace/members/:id
getWorkspaceAnalyticsQueryFn(workspaceId)           → GET /workspace/analytics/:id
changeWorkspaceMemberRoleMutationFn({ workspaceId, data }) → PUT /workspace/change/member/role/:id
deleteWorkspaceMutationFn(workspaceId)              → DELETE /workspace/delete/:id
```

### Member
```typescript
invitedUserJoinWorkspaceMutationFn(inviteCode)      → POST /member/workspace/:code/join
```

### Projects
```typescript
createProjectMutationFn({ workspaceId, data })       → POST /project/workspace/:id/create
editProjectMutationFn({ projectId, workspaceId, data }) → PUT /project/:id/workspace/:wid/update
getProjectsInWorkspaceQueryFn({ workspaceId, pageSize, pageNumber }) → GET /project/workspace/:id/all
getProjectByIdQueryFn({ workspaceId, projectId })    → GET /project/:id/workspace/:wid
getProjectAnalyticsQueryFn({ workspaceId, projectId }) → GET /project/:id/workspace/:wid/analytics
deleteProjectMutationFn({ workspaceId, projectId })  → DELETE /project/:id/workspace/:wid/delete
```

### Tasks
```typescript
createTaskMutationFn({ workspaceId, projectId, data }) → POST /task/project/:pid/workspace/:wid/create
editTaskMutationFn({ taskId, projectId, workspaceId, data }) → PUT /task/:id/project/:pid/workspace/:wid/update
getAllTasksQueryFn({ workspaceId, ...filters })       → GET /task/workspace/:id/all?filters...
deleteTaskMutationFn({ workspaceId, taskId })         → DELETE /task/:id/workspace/:wid/delete
```

### Reports
```typescript
generateReportQueryFn(workspaceId?)  → GET /reports/generate?workspaceId=...
// responseType: "blob" → téléchargement direct fichier Excel
```
