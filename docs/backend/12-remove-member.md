# Remove Member — Documentation complète

## Vue d'ensemble

La fonctionnalité **Remove Member** permet aux propriétaires (OWNER) et aux administrateurs (ADMIN) de retirer un membre d'un workspace.

---

## Permissions

| Rôle   | Peut retirer un membre |
|--------|------------------------|
| OWNER  | ✓ Oui — tous sauf lui-même |
| ADMIN  | ✓ Oui — les MEMBER uniquement |
| MEMBER | ✗ Non |

**Règles métier :**
- On ne peut jamais retirer le propriétaire (OWNER) du workspace
- Un ADMIN ne peut pas retirer un autre ADMIN
- Un utilisateur ne peut pas se retirer lui-même via cette route
- Retirer un membre supprime uniquement son entrée dans `MemberModel` — son compte utilisateur reste intact

---

## Backend

### 1. Permissions (`utils/role-permission.ts`)

```typescript
OWNER: [
  Permissions.REMOVE_MEMBER,   // ✓
  Permissions.CHANGE_MEMBER_ROLE,
  // ...
],
ADMIN: [
  Permissions.REMOVE_MEMBER,   // ✓ ajouté
  Permissions.CHANGE_MEMBER_ROLE, // ✓ ajouté
  // ...
],
MEMBER: [
  // REMOVE_MEMBER absent → interdit
],
```

---

### 2. Service (`services/member.service.ts`)

**Fonction :** `removeMemberService(requestingUserId, workspaceId, memberId)`

**Étapes :**
1. Vérifie que le workspace existe
2. Récupère le rôle de l'utilisateur qui fait la requête
3. Vérifie qu'il a la permission `REMOVE_MEMBER`
4. Récupère le membre à supprimer
5. Refuse si le membre est OWNER
6. Refuse si un ADMIN essaie de retirer un autre ADMIN
7. Supprime le document `MemberModel` (`deleteOne`)

**Retour :** `{ message: "Member removed successfully" }`

**Erreurs possibles :**

| Erreur | Cause |
|--------|-------|
| `NotFoundException` | Workspace ou membre introuvable |
| `UnauthorizedException` | Pas membre du workspace ou pas la permission |
| `BadRequestException` | Tentative de retirer le OWNER ou un ADMIN (par un ADMIN) |

---

### 3. Controller (`controllers/member.controller.ts`)

**Fonction :** `removeMemberController`

```
req.params.workspaceId  → ID du workspace
req.params.memberId     → ID de l'utilisateur à retirer
req.user._id            → ID de l'utilisateur qui fait la requête
```

Retourne `200 OK` avec `{ message: "Member removed successfully" }`.

---

### 4. Route (`routes/member.route.ts`)

```
DELETE /api/member/:workspaceId/remove/:memberId
```

- Auth : 🔐 JWT (via `passportAuthenticateJWT` dans `index.ts`)
- Permission : vérifiée dans le service

---

## Frontend

### 5. Fonction API (`lib/api.ts`)

**Fonction :** `removeMemberMutationFn({ workspaceId, memberId })`

```typescript
DELETE /api/member/:workspaceId/remove/:memberId
```

Retourne `{ message: string }`.

---

### 6. Composant (`components/workspace/member/all-members.tsx`)

**Bouton de suppression :**

- Affiché uniquement si `hasPermission(Permissions.REMOVE_MEMBER)` est `true`
- Caché pour le membre actuellement connecté (on ne peut pas se retirer soi-même)
- Caché pour le OWNER du workspace
- Icône `UserMinus` (lucide-react), rouge au survol
- Demande une confirmation via `confirm()` avant d'envoyer la requête
- Après succès : invalide le cache `["members", workspaceId]` et affiche un toast

---

## Flux complet

```
Utilisateur clique "Retirer"
        │
        ▼
confirm() — annuler ou confirmer
        │ confirmer
        ▼
DELETE /api/member/:workspaceId/remove/:memberId
        │
        ▼
Backend vérifie :
  - workspace existe ?
  - requester est membre ?
  - requester a REMOVE_MEMBER ?
  - target n'est pas OWNER ?
  - si ADMIN : target n'est pas ADMIN ?
        │ tout OK
        ▼
MemberModel.deleteOne({ userId: memberId, workspaceId })
        │
        ▼
200 { message: "Member removed successfully" }
        │
        ▼
Frontend invalide le cache membres → liste se rafraîchit
Toast de succès affiché
```

---

## Test manuel

1. Connectez-vous en tant que OWNER ou ADMIN
2. Allez dans **Workspace → Members**
3. Un bouton rouge (icône `UserMinus`) apparaît à côté des membres que vous pouvez retirer
4. Cliquez → confirmez → le membre disparaît de la liste

**Cas à vérifier :**
- OWNER ne voit pas de bouton sur lui-même ✓
- OWNER voit le bouton sur ADMIN et MEMBER ✓
- ADMIN voit le bouton sur MEMBER uniquement ✓
- MEMBER ne voit aucun bouton de suppression ✓
- Retirer le OWNER est impossible (erreur 400) ✓
