# Backend — Table complète des routes

## Légende
- 🔓 **PUBLIC** — Aucune authentification requise
- 🔐 **JWT** — Requiert `passportAuthenticateJWT` (Bearer token)
- 👑 **RBAC** — Requiert une permission spécifique au-delà de l'authentification

---

## Auth Routes (`/api/auth`)

| Méthode | Chemin | Auth | Permission | Controller | Description |
|---|---|---|---|---|---|
| POST | `/api/auth/register` | 🔓 PUBLIC | — | `registerUserController` | Inscription email/password |
| POST | `/api/auth/login` | 🔓 PUBLIC | — | `loginController` | Connexion, retourne JWT |
| POST | `/api/auth/logout` | 🔓 PUBLIC | — | `logOutController` | Déconnexion (stateless) |
| GET | `/api/auth/google` | 🔓 PUBLIC | — | Passport redirect | Démarre OAuth Google |
| GET | `/api/auth/google/callback` | 🔓 PUBLIC | — | `googleLoginCallback` | Callback OAuth Google → redirect frontend |

---

## User Routes (`/api/user`)

| Méthode | Chemin | Auth | Permission | Controller | Description |
|---|---|---|---|---|---|
| GET | `/api/user/current` | 🔐 JWT | — | `getCurrentUserController` | Profil de l'utilisateur connecté |

---

## Workspace Routes (`/api/workspace`)

| Méthode | Chemin | Auth | Permission | Controller | Description |
|---|---|---|---|---|---|
| POST | `/api/workspace/create/new` | 🔐 JWT | — | `createWorkspaceController` | Créer un workspace |
| GET | `/api/workspace/all` | 🔐 JWT | — | `getAllWorkspacesUserIsMemberController` | Mes workspaces |
| GET | `/api/workspace/:id` | 🔐 JWT | Membre | `getWorkspaceByIdController` | Détails d'un workspace |
| GET | `/api/workspace/members/:id` | 🔐 JWT 👑 | VIEW_ONLY | `getWorkspaceMembersController` | Membres du workspace |
| GET | `/api/workspace/analytics/:id` | 🔐 JWT 👑 | VIEW_ONLY | `getWorkspaceAnalyticsController` | Analytics du workspace |
| PUT | `/api/workspace/update/:id` | 🔐 JWT 👑 | EDIT_WORKSPACE | `updateWorkspaceByIdController` | Modifier le workspace |
| PUT | `/api/workspace/change/member/role/:id` | 🔐 JWT 👑 | CHANGE_MEMBER_ROLE | `changeWorkspaceMemberRoleController` | Changer le rôle d'un membre |
| DELETE | `/api/workspace/delete/:id` | 🔐 JWT 👑 | DELETE_WORKSPACE | `deleteWorkspaceByIdController` | Supprimer le workspace |

---

## Member Routes (`/api/member`)

| Méthode | Chemin | Auth | Permission | Controller | Description |
|---|---|---|---|---|---|
| POST | `/api/member/workspace/:inviteCode/join` | 🔐 JWT | — | `joinWorkspaceController` | Rejoindre via code d'invitation |

---

## Project Routes (`/api/project`)

| Méthode | Chemin | Auth | Permission | Controller | Description |
|---|---|---|---|---|---|
| POST | `/api/project/workspace/:workspaceId/create` | 🔐 JWT 👑 | CREATE_PROJECT | `createProjectController` | Créer un projet |
| GET | `/api/project/workspace/:workspaceId/all` | 🔐 JWT 👑 | VIEW_ONLY | `getAllProjectsInWorkspaceController` | Liste des projets (paginée) |
| GET | `/api/project/:id/workspace/:workspaceId` | 🔐 JWT 👑 | VIEW_ONLY | `getProjectByIdAndWorkspaceIdController` | Détails d'un projet |
| GET | `/api/project/:id/workspace/:workspaceId/analytics` | 🔐 JWT 👑 | VIEW_ONLY | `getProjectAnalyticsController` | Analytics d'un projet |
| PUT | `/api/project/:id/workspace/:workspaceId/update` | 🔐 JWT 👑 | EDIT_PROJECT | `updateProjectController` | Modifier un projet |
| DELETE | `/api/project/:id/workspace/:workspaceId/delete` | 🔐 JWT 👑 | DELETE_PROJECT | `deleteProjectController` | Supprimer un projet |

---

## Task Routes (`/api/task`)

| Méthode | Chemin | Auth | Permission | Controller | Description |
|---|---|---|---|---|---|
| POST | `/api/task/project/:projectId/workspace/:workspaceId/create` | 🔐 JWT 👑 | CREATE_TASK | `createTaskController` | Créer une tâche |
| GET | `/api/task/workspace/:workspaceId/all` | 🔐 JWT 👑 | VIEW_ONLY | `getAllTasksController` | Toutes les tâches (filtres + pagination) |
| GET | `/api/task/:id/project/:projectId/workspace/:workspaceId` | 🔐 JWT 👑 | VIEW_ONLY | `getTaskByIdController` | Détails d'une tâche |
| PUT | `/api/task/:id/project/:projectId/workspace/:workspaceId/update` | 🔐 JWT 👑 | EDIT_TASK | `updateTaskController` | Modifier une tâche |
| DELETE | `/api/task/:id/workspace/:workspaceId/delete` | 🔐 JWT 👑 | DELETE_TASK | `deleteTaskController` | Supprimer une tâche |

---

## Report Routes (`/api/reports`)

| Méthode | Chemin | Auth | Permission | Controller | Description |
|---|---|---|---|---|---|
| GET | `/api/reports/generate` | 🔐 JWT + Owner | Owner uniquement | `generateReportController` | Télécharger rapport Excel |

**Note :** Pour cette route, `passportAuthenticateJWT` est ajouté **dans la définition de la route** (pas dans `index.ts`), suivi du middleware `authorizeReportGeneration` qui vérifie ownership.

---

## Matrice des permissions RBAC

| Permission | OWNER | ADMIN | MEMBER |
|---|---|---|---|
| CREATE_WORKSPACE | ✅ | — | — |
| EDIT_WORKSPACE | ✅ | — | — |
| DELETE_WORKSPACE | ✅ | — | — |
| MANAGE_WORKSPACE_SETTINGS | ✅ | ✅ | — |
| ADD_MEMBER | ✅ | ✅ | — |
| CHANGE_MEMBER_ROLE | ✅ | — | — |
| REMOVE_MEMBER | ✅ | — | — |
| CREATE_PROJECT | ✅ | ✅ | — |
| EDIT_PROJECT | ✅ | ✅ | — |
| DELETE_PROJECT | ✅ | ✅ | — |
| CREATE_TASK | ✅ | ✅ | ✅ |
| EDIT_TASK | ✅ | ✅ | ✅ |
| DELETE_TASK | ✅ | ✅ | — |
| VIEW_ONLY | ✅ | ✅ | ✅ |
