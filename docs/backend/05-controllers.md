# Backend — Controllers

## Pattern commun à tous les controllers

```typescript
export const xyzController = asyncHandler(async (req, res) => {
  // 1. Validation Zod des entrées
  const body = xyzSchema.parse(req.body);
  const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);

  // 2. Extraction de l'utilisateur authentifié
  const userId = req.user?._id;

  // 3. Vérification RBAC (sauf controllers auth)
  const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
  roleGuard(role, [Permissions.REQUIRED_PERMISSION]);

  // 4. Appel service
  const { result } = await xyzService(params);

  // 5. Réponse HTTP
  return res.status(HTTPSTATUS.OK).json({ message: "...", result });
});
```

---

## auth.controller.ts

### `registerUserController`
- **Route :** `POST /api/auth/register`
- **Auth :** Aucune
- **Validation :** `registerSchema.parse(req.body)` → `{ name, email, password }`
- **Service :** `registerUserService(body)`
- **Réponse :** `201 { message: "User created successfully" }`

### `loginController`
- **Route :** `POST /api/auth/login`
- **Auth :** Aucune (utilise `passport.authenticate("local", ...)` en interne)
- **Service :** `verifyUserService` via Passport LocalStrategy
- **Réponse :** `200 { message, access_token, user: { _id, currentWorkspace } }`
- **Note :** La session est désactivée (`session: false`). Le JWT est généré et retourné directement.

### `googleLoginCallback`
- **Route :** `GET /api/auth/google/callback`
- **Auth :** `passport.authenticate("google", { session: false })`
- **Comportement :** Redirige vers `FRONTEND_GOOGLE_CALLBACK_URL?status=success&access_token=<jwt>&current_workspace=<id>`
- **En cas d'échec :** Redirige vers `?status=failure`

### `logOutController`
- **Route :** `POST /api/auth/logout`
- **Auth :** Aucune (JWT stateless)
- **Réponse :** `200 { message: "Logged out successfully" }`
- **Note :** Aucune invalidation de token côté serveur (pas de blacklist). Le client supprime son token.

---

## workspace.controller.ts

### `createWorkspaceController`
- **Route :** `POST /api/workspace/create/new`
- **Validation :** `createWorkspaceSchema` → `{ name, description? }`
- **RBAC :** Aucune (tout user authentifié peut créer)
- **Réponse :** `201 { message, workspace }`

### `getAllWorkspacesUserIsMemberController`
- **Route :** `GET /api/workspace/all`
- **RBAC :** Aucune (filtre par `req.user._id`)
- **Réponse :** `200 { message, workspaces[] }`

### `getWorkspaceByIdController`
- **Route :** `GET /api/workspace/:id`
- **Validation :** `workspaceIdSchema`
- **RBAC :** Vérifie appartenance via `getMemberRoleInWorkspace` (retourne 401 si non membre)
- **Réponse :** `200 { message, workspace: { ...workspace, members[] } }`

### `getWorkspaceMembersController`
- **Route :** `GET /api/workspace/members/:id`
- **RBAC :** `VIEW_ONLY`
- **Réponse :** `200 { message, members[], roles[] }`

### `getWorkspaceAnalyticsController`
- **Route :** `GET /api/workspace/analytics/:id`
- **RBAC :** `VIEW_ONLY`
- **Réponse :** `200 { message, analytics: { totalTasks, overdueTasks, completedTasks } }`

### `changeWorkspaceMemberRoleController`
- **Route :** `PUT /api/workspace/change/member/role/:id`
- **Validation :** `changeRoleSchema` → `{ roleId, memberId }`
- **RBAC :** `CHANGE_MEMBER_ROLE` (OWNER uniquement)
- **Réponse :** `200 { message, member }`

### `updateWorkspaceByIdController`
- **Route :** `PUT /api/workspace/update/:id`
- **Validation :** `updateWorkspaceSchema`
- **RBAC :** `EDIT_WORKSPACE`
- **Réponse :** `200 { message, workspace }`

### `deleteWorkspaceByIdController`
- **Route :** `DELETE /api/workspace/delete/:id`
- **RBAC :** `DELETE_WORKSPACE` (OWNER uniquement)
- **Réponse :** `200 { message, currentWorkspace }`

---

## project.controller.ts

### `createProjectController`
- **Route :** `POST /api/project/workspace/:workspaceId/create`
- **Validation :** `createProjectSchema` → `{ emoji?, name, description? }`
- **RBAC :** `CREATE_PROJECT`
- **Réponse :** `201 { message, project }`

### `getAllProjectsInWorkspaceController`
- **Route :** `GET /api/project/workspace/:workspaceId/all`
- **Query params :** `pageSize`, `pageNumber`
- **RBAC :** `VIEW_ONLY`
- **Réponse :** `200 { message, projects[], pagination: { totalCount, pageSize, pageNumber, totalPages, skip, limit } }`

### `getProjectByIdAndWorkspaceIdController`
- **Route :** `GET /api/project/:id/workspace/:workspaceId`
- **RBAC :** `VIEW_ONLY`
- **Réponse :** `200 { message, project }`

### `getProjectAnalyticsController`
- **Route :** `GET /api/project/:id/workspace/:workspaceId/analytics`
- **RBAC :** `VIEW_ONLY`
- **Réponse :** `200 { message, analytics }`

### `updateProjectController`
- **Route :** `PUT /api/project/:id/workspace/:workspaceId/update`
- **Validation :** `updateProjectSchema`
- **RBAC :** `EDIT_PROJECT`
- **Réponse :** `200 { message, project }`

### `deleteProjectController`
- **Route :** `DELETE /api/project/:id/workspace/:workspaceId/delete`
- **RBAC :** `DELETE_PROJECT`
- **Réponse :** `200 { message: "Project deleted successfully" }`

---

## task.controller.ts

### `createTaskController`
- **Route :** `POST /api/task/project/:projectId/workspace/:workspaceId/create`
- **Validation :** `createTaskSchema` → `{ title, description?, priority, status?, assignedTo?, dueDate? }`
- **RBAC :** `CREATE_TASK`
- **Réponse :** `200 { message, task }`

### `updateTaskController`
- **Route :** `PUT /api/task/:id/project/:projectId/workspace/:workspaceId/update`
- **Validation :** `updateTaskSchema`
- **RBAC :** `EDIT_TASK`
- **Réponse :** `200 { message, task: updatedTask }`

### `getAllTasksController`
- **Route :** `GET /api/task/workspace/:workspaceId/all`
- **Query params :** `projectId`, `status` (CSV), `priority` (CSV), `assignedTo` (CSV), `keyword`, `dueDate`, `pageSize`, `pageNumber`
- **RBAC :** `VIEW_ONLY`
- **Réponse :** `200 { message, tasks[], pagination }`

### `getTaskByIdController`
- **Route :** `GET /api/task/:id/project/:projectId/workspace/:workspaceId`
- **RBAC :** `VIEW_ONLY`
- **Réponse :** `200 { message, task }`

### `deleteTaskController`
- **Route :** `DELETE /api/task/:id/workspace/:workspaceId/delete`
- **RBAC :** `DELETE_TASK`
- **Réponse :** `200 { message: "Task deleted successfully" }`

---

## member.controller.ts

### `joinWorkspaceController`
- **Route :** `POST /api/member/workspace/:inviteCode/join`
- **Validation :** `z.string().parse(req.params.inviteCode)`
- **RBAC :** Aucune (tout user authentifié peut rejoindre)
- **Réponse :** `200 { message, workspaceId, role }`

---

## user.controller.ts

### `getCurrentUserController`
- **Route :** `GET /api/user/current`
- **Auth :** JWT requis (`passportAuthenticateJWT` au niveau de l'app)
- **Réponse :** `200 { message, user }` (avec `currentWorkspace` populé, sans `password`)

---

## report.controller.ts

### `generateReportController`
- **Route :** `GET /api/reports/generate`
- **Auth :** `passportAuthenticateJWT` + `authorizeReportGeneration` (owner uniquement)
- **Query params :** `workspaceId?` (optionnel — si absent : toutes les workspaces)
- **Réponse :** Fichier `.xlsx` téléchargeable via `res.download()`
