# Backend — Tests

## Configuration

**Fichier :** `backend/jest.config.js`
```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/tests/**/*.test.ts'],
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
};
```

**Dépendances :**
- `jest` v30
- `ts-jest` v29 (compile TypeScript avant d'exécuter)
- `mongodb-memory-server` (installé mais non utilisé — potentiel pour tests d'intégration)
- `supertest` (installé mais non utilisé — potentiel pour tests HTTP)

**Commande :** `npm test`

---

## Stratégie de test

Tous les tests utilisent **Jest mocks** (`jest.mock(...)`) sur les modèles Mongoose. Aucune connexion réelle à MongoDB n'est établie. Les sessions Mongoose sont mockées manuellement.

---

## 1. registerUserService.test.ts

**Service testé :** `registerUserService`

**Mocks :** UserModel, AccountModel, WorkspaceModel, RoleModel, MemberModel, mongoose.startSession

| # | Nom du test | Entrée | Résultat attendu |
|---|---|---|---|
| 1 | Création complète | `{ email, name, password }` valides, user inexistant | `{ userId, workspaceId }`, `commitTransaction` appelé |
| 2 | Email existant | Email déjà en base | Lance `BadRequestException` |
| 3 | Rôle OWNER absent | `RoleModel.findOne` retourne `null` | Lance `NotFoundException` |

**Couverture estimée :** ~85% de `registerUserService`

---

## 2. loginOrCreateAccountService.test.ts

**Services testés :** `loginOrCreateAccountService`, `verifyUserService`, `findUserByIdService`

| # | Nom du test | Service | Résultat attendu |
|---|---|---|---|
| 1 | Création nouveau user OAuth | `loginOrCreateAccountService` | `result.user._id === "user1"`, commit appelé |
| 2 | Mot de passe correct | `verifyUserService` | Retourne `{ _id: "user1" }` |
| 3 | Compte non trouvé | `verifyUserService` | Lance `NotFoundException` |
| 4 | Mauvais mot de passe | `verifyUserService` | Lance `UnauthorizedException` |
| 5 | User trouvé par ID | `findUserByIdService` | Retourne l'objet user |
| 6 | User non trouvé par ID | `findUserByIdService` | Retourne `null` |

**Couverture estimée :** ~90% des 3 services testés

---

## 3. workspaceService.test.ts

**Services testés :** 8 fonctions de `workspace.service.ts`

| # | Nom du test | Service | Résultat attendu |
|---|---|---|---|
| 1 | Créer workspace — succès | `createWorkspaceService` | workspace retourné, `user.currentWorkspace` mis à jour |
| 2 | Créer workspace — user absent | `createWorkspaceService` | Lance `NotFoundException` |
| 3 | Lister workspaces | `getAllWorkspacesUserIsMemberService` | 2 workspaces retournés |
| 4 | Workspace by ID — succès | `getWorkspaceByIdService` | workspace + members retournés |
| 5 | Workspace by ID — absent | `getWorkspaceByIdService` | Lance `NotFoundException` |
| 6 | Membres + rôles | `getWorkspaceMembersService` | members et roles retournés |
| 7 | Changer rôle membre | `changeMemberRoleService` | `member.role === fakeRole` |
| 8 | Analytics | `getWorkspaceAnalyticsService` | `{ totalTasks: 10, overdueTasks: 2, completedTasks: 5 }` |
| 9 | Mettre à jour workspace | `updateWorkspaceByIdService` | `workspace.name === "New"` |
| 10 | Supprimer workspace | `deleteWorkspaceService` | `deleteOne` appelé, `user.save` appelé |

**Couverture estimée :** ~80% de workspace.service.ts

---

## 4. taskService.test.ts

**Services testés :** CRUD complet de `task.service.ts`

| # | Nom du test | Service | Résultat attendu |
|---|---|---|---|
| 1 | Créer tâche — succès | `createTaskService` | `task.workspace === "ws1"` |
| 2 | Créer — projet absent | `createTaskService` | Lance `NotFoundException` |
| 3 | Modifier tâche — succès | `updateTaskService` | `updatedTask.title === "Updated"` |
| 4 | Modifier — projet absent | `updateTaskService` | Lance `NotFoundException` |
| 5 | Modifier — tâche absente | `updateTaskService` | Lance `NotFoundException` |
| 6 | Lister tâches paginées | `getAllTasksService` | `tasks`, `pagination.totalCount === 1` |
| 7 | Tâche by ID — succès | `getTaskByIdService` | Retourne la tâche |
| 8 | Tâche by ID — projet absent | `getTaskByIdService` | Lance `NotFoundException` |
| 9 | Tâche by ID — tâche absente | `getTaskByIdService` | Lance `NotFoundException` |
| 10 | Supprimer tâche — succès | `deleteTaskService` | `findOneAndDelete` appelé |
| 11 | Supprimer — tâche absente | `deleteTaskService` | Lance `NotFoundException` |

---

## 5. projectService.test.ts

**Services testés :** CRUD complet de `project.service.ts`

| # | Nom du test | Service | Résultat attendu |
|---|---|---|---|
| 1 | Créer projet | `createProjectService` | `project.save` appelé |
| 2 | Lister projets paginés | `getProjectsInWorkspaceService` | 2 projets, 1 page |
| 3 | Projet by ID — succès | `getProjectByIdAndWorkspaceIdService` | Projet retourné |
| 4 | Projet by ID — absent | `getProjectByIdAndWorkspaceIdService` | Lance `NotFoundException` |
| 5 | Analytics projet | `getProjectAnalyticsService` | `{ totalTasks: 5, overdueTasks: 1, completedTasks: 2 }` |
| 6 | Analytics — projet absent | `getProjectAnalyticsService` | Lance `NotFoundException` |
| 7 | Modifier projet | `updateProjectService` | `project.name === "Updated"` |
| 8 | Modifier — absent | `updateProjectService` | Lance `NotFoundException` |
| 9 | Supprimer projet | `deleteProjectService` | `deleteOne` + `TaskModel.deleteMany` |
| 10 | Supprimer — absent | `deleteProjectService` | Lance `NotFoundException` |

---

## 6. member.service.test.ts

**Services testés :** `getMemberRoleInWorkspace`, `joinWorkspaceByInviteService`

| # | Nom du test | Service | Résultat attendu |
|---|---|---|---|
| 1 | Rôle trouvé | `getMemberRoleInWorkspace` | `{ role: "MEMBER" }` |
| 2 | Workspace absent | `getMemberRoleInWorkspace` | Lance `NotFoundException` |
| 3 | Member absent | `getMemberRoleInWorkspace` | Lance `UnauthorizedException` |
| 4 | Rejoindre workspace | `joinWorkspaceByInviteService` | `{ workspaceId, role: "MEMBER" }` |
| 5 | Code invalide | `joinWorkspaceByInviteService` | Lance `NotFoundException` |
| 6 | Déjà membre | `joinWorkspaceByInviteService` | Lance `BadRequestException` |
| 7 | Rôle MEMBER absent | `joinWorkspaceByInviteService` | Lance `NotFoundException` |

---

## 7. user.service.test.ts

**Service testé :** `getCurrentUserService`

| # | Nom du test | Résultat attendu |
|---|---|---|
| 1 | User trouvé | Retourne `{ user }` avec workspace populé |
| 2 | User absent | Lance `BadRequestException` |

---

## Tests manquants — Analyse

### Tests de sécurité (absents)

| Test | Importance |
|---|---|
| JWT invalide sur route protégée → 401 | 🔴 Critique |
| JWT expiré → 401 | 🔴 Critique |
| MEMBER tente DELETE_WORKSPACE → 403 | 🔴 Critique |
| ADMIN tente CHANGE_MEMBER_ROLE → 403 | 🔴 Critique |
| User non membre accède au workspace → 401 | 🔴 Critique |
| Injection NoSQL `email: {"$gt": ""}` → rejeté | 🟠 Haute |
| Token d'un autre user sur workspace → 403 | 🟠 Haute |

### Tests d'intégration (absents)

`supertest` et `mongodb-memory-server` sont installés mais jamais utilisés. Ils permettraient des tests HTTP réels avec une vraie base MongoDB en mémoire :

```typescript
// Exemple test d'intégration avec supertest
import request from "supertest";
import app from "../../index";

it("POST /api/auth/register returns 201", async () => {
  const res = await request(app).post("/api/auth/register").send({
    name: "Test", email: "test@test.com", password: "password123"
  });
  expect(res.status).toBe(201);
});
```

### Coverage

Pas de configuration `coverage` dans `jest.config.js`. Ajouter :
```javascript
coverageDirectory: "coverage",
collectCoverageFrom: ["src/**/*.ts", "!src/tests/**"],
coverageThreshold: { global: { lines: 80 } }
```
