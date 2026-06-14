# Frontend — Pages

## Sign-in (`/`)

**Fichier :** `src/page/auth/Sign-in.tsx`
**Auth :** Aucune (redirige vers workspace si déjà connecté via `AuthRoute`)
**Composants :** Card, Form, Input, Button, Logo, GoogleOauthButton

**Fonctionnement :**
1. Formulaire React Hook Form + Zod validation `{ email, password }`
2. On submit : `useMutation({ mutationFn: loginMutationFn })`
3. En cas de succès : `setAccessToken(data.access_token)` + `navigate(/workspace/:id)`
4. En cas d'erreur : toast destructif

**API :** `POST /api/auth/login`

**Design :** Gradient indigo → purple → pink, Card glassmorphism arrondi, DM Sans

---

## Sign-up (`/sign-up`)

**Fichier :** `src/page/auth/Sign-up.tsx`
**Auth :** Aucune
**API :** `POST /api/auth/register`

Formulaire avec `{ name, email, password }`, validation Zod, même style que Sign-in.

---

## GoogleOAuthFailure (`/auth/callback`)

**Fichier :** `src/page/auth/GoogleOAuthFailure.tsx`
**Auth :** Aucune

Traite les paramètres URL retournés par le callback Google :
- `?status=success&access_token=<jwt>&current_workspace=<id>` → stocke le token, redirige
- `?status=failure` → affiche une erreur

---

## Dashboard (`/workspace/:workspaceId`)

**Fichier :** `src/page/workspace/Dashboard.tsx`
**Auth :** JWT + membre du workspace
**Composants :** WorkspaceAnalytics, RecentProjects, RecentTasks, RecentMembers, Tabs

**Structure :**
```
Header avec titre i18n + bouton "Nouveau projet"
WorkspaceAnalytics (cards: total/retard/complétées)
Tabs:
  ├── "Projets récents" → <RecentProjects />
  ├── "Tâches récentes" → <RecentTasks />
  └── "Membres récents" → <RecentMembers />
```

---

## Tasks (`/workspace/:workspaceId/tasks`)

**Fichier :** `src/page/workspace/Tasks.tsx`
**Auth :** JWT + VIEW_ONLY
**Composants :** TaskTable (DataTable TanStack + filtres)

Affiche toutes les tâches du workspace avec :
- Filtres : statut, priorité, assigné, projet, mot-clé, date
- Pagination serveur
- Actions par ligne : modifier, supprimer

---

## Members (`/workspace/:workspaceId/members`)

**Fichier :** `src/page/workspace/Members.tsx`
**Auth :** JWT + VIEW_ONLY
**Composants :** AllMembers, InviteMember

Affiche tous les membres avec leur rôle. Permet de :
- Changer le rôle d'un membre (si permission `CHANGE_MEMBER_ROLE`)
- Copier le lien d'invitation dans le presse-papiers

---

## Settings (`/workspace/:workspaceId/settings`)

**Fichier :** `src/page/workspace/Settings.tsx`
**Auth :** JWT + MANAGE_WORKSPACE_SETTINGS (via `withPermission` HOC)
**Composants :** EditWorkspaceForm, DeleteWorkspaceCard

Permet de modifier le nom/description du workspace ou de le supprimer.

---

## ProjectDetails (`/workspace/:workspaceId/project/:projectId`)

**Fichier :** `src/page/workspace/ProjectDetails.tsx`
**Auth :** JWT + VIEW_ONLY
**Composants :** ProjectHeader, ProjectAnalytics, TaskTable (filtré par projet)

---

## InviteUser (`/invite/workspace/:inviteCode/join`)

**Fichier :** `src/page/invite/InviteUser.tsx`
**Auth :** JWT requis (l'utilisateur doit être connecté pour rejoindre)

Affiche une page d'invitation, appelle `POST /api/member/workspace/:inviteCode/join` et redirige vers le workspace.

---

## NotFound (`/*`)

**Fichier :** `src/page/errors/NotFound.tsx`
Page 404 simple avec lien de retour.
