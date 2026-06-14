# Backend — Services

## Règle commune
Tous les services retournent des objets nommés `{ workspace }`, `{ user }`, etc.
Toutes les erreurs sont lancées via les classes typées de `utils/appError.ts`.

---

## auth.service.ts

### `loginOrCreateAccountService(data)`
**Objectif :** Crée un utilisateur via OAuth (Google) ou le récupère s'il existe déjà.

**Paramètres :** `{ provider, displayName, providerId, picture?, email? }`

**Étapes :**
1. Ouvre une transaction MongoDB
2. Cherche un `User` par email
3. Si inexistant : crée User + Account + Workspace + Role(OWNER) + Member
4. Met à jour `user.currentWorkspace`
5. Commit ou rollback

**Retour :** `{ user: UserDocument }`

**Erreurs :** `NotFoundException` si le rôle OWNER n'existe pas en base

---

### `registerUserService(body)`
**Objectif :** Inscription email/mot de passe.

**Paramètres :** `{ email, name, password }`

**Étapes :**
1. Transaction MongoDB
2. Vérifie unicité de l'email
3. Crée User (le hook pre-save hache le mot de passe automatiquement)
4. Crée Account (provider=EMAIL, providerId=email)
5. Crée Workspace "My Workspace"
6. Trouve le rôle OWNER
7. Crée Member (userId, workspaceId, role=OWNER)
8. Met à jour `user.currentWorkspace`
9. Commit

**Retour :** `{ userId, workspaceId }`

**Erreurs :**
- `BadRequestException` — email déjà utilisé
- `NotFoundException` — rôle OWNER absent

---

### `verifyUserService({ email, password, provider? })`
**Objectif :** Vérifie les credentials pour le login local.

**Étapes :**
1. Trouve Account par `{ provider: "EMAIL", providerId: email }`
2. Trouve User par `account.userId`
3. Compare le mot de passe via `user.comparePassword(password)`
4. Retourne `user.omitPassword()`

**Retour :** `UserDocument` sans mot de passe

**Erreurs :**
- `NotFoundException` — compte ou user non trouvé
- `UnauthorizedException` — mot de passe incorrect

---

### `findUserByIdService(userId)`
**Objectif :** Récupère un user par ID (utilisé par la stratégie JWT Passport).

**Retour :** `UserDocument | null` (sans le champ password)

---

## workspace.service.ts

### `createWorkspaceService(userId, body)`
Crée un workspace, ajoute l'utilisateur comme OWNER Member, met à jour `user.currentWorkspace`.

**Retour :** `{ workspace }`

---

### `getAllWorkspacesUserIsMemberService(userId)`
Retourne tous les workspaces où l'utilisateur est membre via `MemberModel.find({ userId }).populate("workspaceId")`.

**Retour :** `{ workspaces }`

---

### `getWorkspaceByIdService(workspaceId)`
Récupère un workspace + ses membres avec leurs rôles.

**Retour :** `{ workspace: workspaceWithMembers }`

**Erreurs :** `NotFoundException`

---

### `getWorkspaceMembersService(workspaceId)`
Retourne les membres avec `userId` populé (name, email, profilePicture) et les rôles disponibles.

**Retour :** `{ members, roles }`

---

### `changeMemberRoleService(workspaceId, memberId, roleId)`
Modifie le rôle d'un membre dans un workspace.

**Retour :** `{ member }`

**Erreurs :** `NotFoundException` (workspace, rôle, ou membre non trouvé)

---

### `getWorkspaceAnalyticsService(workspaceId)`
Compte les tâches : total, en retard (dueDate < now && status != DONE), complétées.

**Retour :** `{ analytics: { totalTasks, overdueTasks, completedTasks } }`

---

### `updateWorkspaceByIdService(workspaceId, name, description?)`
Met à jour name et/ou description.

**Retour :** `{ workspace }`

**Erreurs :** `NotFoundException`

---

### `deleteWorkspaceService(workspaceId, userId)`
**Transaction atomique :**
1. Vérifie ownership (`workspace.owner.equals(userId)`)
2. Supprime tous les Projects du workspace
3. Supprime toutes les Tasks du workspace
4. Supprime tous les Members du workspace
5. Redirige l'utilisateur vers un autre workspace
6. Supprime le workspace
7. Commit

**Retour :** `{ currentWorkspace }`

---

## project.service.ts

### `createProjectService(userId, workspaceId, body)`
Crée un projet. **Retour :** `{ project }`

### `getProjectsInWorkspaceService(workspaceId, pageSize, pageNumber)`
Pagination + tri `createdAt: -1`. **Retour :** `{ projects, totalCount, totalPages, skip }`

### `getProjectByIdAndWorkspaceIdService(workspaceId, projectId)`
Cherche par `{ _id: projectId, workspace: workspaceId }`. **Retour :** `{ project }`

### `getProjectAnalyticsService(workspaceId, projectId)`
Utilise `TaskModel.aggregate()` avec `$facet` pour calculer total/retard/complétées en un seul appel.
**Retour :** `{ analytics: { totalTasks, overdueTasks, completedTasks } }`

### `updateProjectService(workspaceId, projectId, body)`
Met à jour emoji, name, description si fournis. **Retour :** `{ project }`

### `deleteProjectService(workspaceId, projectId)`
Supprime le projet et toutes ses tâches (`TaskModel.deleteMany({ project: project._id })`).

---

## task.service.ts

### `createTaskService(workspaceId, projectId, userId, body)`
1. Vérifie que le projet appartient au workspace
2. Vérifie que `assignedTo` est membre du workspace (si fourni)
3. Crée la tâche

### `updateTaskService(workspaceId, projectId, taskId, body)`
Vérifie projet + tâche, puis `findByIdAndUpdate({ new: true })`.

### `getAllTasksService(workspaceId, filters, pagination)`
Filtres disponibles : `projectId`, `status[]`, `priority[]`, `assignedTo[]`, `keyword` (regex), `dueDate`.
Résultat paginé avec `skip + limit + sort(createdAt: -1)`.
**Retour :** `{ tasks, pagination: { pageSize, pageNumber, totalCount, totalPages, skip } }`

### `getTaskByIdService(workspaceId, projectId, taskId)`
Cherche par `{ _id: taskId, workspace, project }` avec populate de `assignedTo`.

### `deleteTaskService(workspaceId, taskId)`
`findOneAndDelete({ _id: taskId, workspace: workspaceId })`.

---

## member.service.ts

### `getMemberRoleInWorkspace(userId, workspaceId)`
Utilisé dans **tous** les controllers pour vérifier l'appartenance avant RBAC.
1. Vérifie que le workspace existe
2. Cherche le Member `{ userId, workspaceId }` et popule `role`
3. Retourne le nom du rôle

**Retour :** `{ role: "OWNER" | "ADMIN" | "MEMBER" }`

**Erreurs :**
- `NotFoundException` — workspace non trouvé
- `UnauthorizedException` — user non membre

### `joinWorkspaceByInviteService(userId, inviteCode)`
1. Trouve le workspace par `inviteCode`
2. Vérifie que l'user n'est pas déjà membre
3. Crée un nouveau Member avec rôle MEMBER

**Retour :** `{ workspaceId, role: "MEMBER" }`

---

## user.service.ts

### `getCurrentUserService(userId)`
`UserModel.findById(userId).populate("currentWorkspace").select("-password")`

**Retour :** `{ user }`

**Erreurs :** `BadRequestException` — user non trouvé

---

## report.service.ts

### `generateAnalysisReport()`
Génère un fichier Excel avec **toutes** les workspaces, leurs projets et tâches.
Utilise ExcelJS, écrit le fichier dans `src/reports/Report_AllWorkspaces_YYYY-MM-DD.xlsx`.

### `generateSingleWorkspaceReport(workspaceId)`
Même format mais filtré sur une workspace.
Écrit dans `src/reports/Report_<workspaceName>_YYYY-MM-DD.xlsx`.

**Note :** Les fichiers sont stockés sur le disque serveur et servis via `res.download()`.
