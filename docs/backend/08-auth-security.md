# Backend — Authentification et Sécurité

## 1. Stratégie JWT (passport-jwt)

### Configuration
```typescript
const options: StrategyOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: config.JWT_SECRET,
  audience: ["user"],
  algorithms: ["HS256"],  // ✅ Algorithme explicite — prévient l'attaque alg:none
};
```

### Génération du token
```typescript
// utils/jwt.ts
export const accessTokenSignOptions = {
  expiresIn: config.JWT_EXPIRES_IN,  // défaut: "1d"
  secret: config.JWT_SECRET,
};

export const signJwtToken = (payload: { userId: UserDocument["_id"] }) => {
  const { secret, ...opts } = accessTokenSignOptions;
  return jwt.sign(payload, secret, {
    audience: ["user"],
    ...opts,
  });
};
```

### Payload JWT
```json
{
  "userId": "<MongoDB ObjectId>",
  "aud": ["user"],
  "iat": 1234567890,
  "exp": 1234654290
}
```

### Points forts
- ✅ Algorithme HS256 explicite (protection contre `alg: none`)
- ✅ Audience validée
- ✅ Expiration configurée (1 jour par défaut)
- ✅ Extraction depuis `Authorization: Bearer <token>` uniquement
- ✅ `session: false` — pas de session serveur

### Points faibles
- ❌ Pas de refresh token
- ❌ Pas de blacklist JWT (le logout côté client seulement)
- ❌ Pas de rotation des secrets

---

## 2. Google OAuth 2.0 (passport-google-oauth20)

### Flux complet
```
1. Frontend → GET /api/auth/google
2. Express → passport.authenticate("google", { scope: ["profile", "email"], session: false })
3. Redirect → accounts.google.com/o/oauth2/...
4. User consent sur Google
5. Google → GET /api/auth/google/callback?code=AUTH_CODE
6. Passport → échange code contre tokens → profile Google
7. GoogleStrategy callback :
   a. Extrait email, googleId (sub), picture du profil
   b. loginOrCreateAccountService({ provider: "GOOGLE", ... })
   c. signJwtToken({ userId: user._id })
   d. req.jwt = jwt  (via @ts-ignore ⚠️)
8. googleLoginCallback controller :
   a. res.redirect(`${FRONTEND_GOOGLE_CALLBACK_URL}?status=success&access_token=${jwt}&current_workspace=${id}`)
9. Frontend extrait access_token de l'URL et le stocke
```

### Note de sécurité
L'access_token est transmis **dans l'URL** (query parameter). C'est un risque si le navigateur logge les URLs ou si des extensions tierce lisent l'historique. Une alternative plus sûre serait d'utiliser un `state` avec code d'échange.

---

## 3. Stratégie Local (passport-local)

```typescript
new LocalStrategy(
  { usernameField: "email", passwordField: "password", session: false },
  async (email, password, done) => {
    const user = await verifyUserService({ email, password });
    return done(null, user);
  }
)
```

La vérification appelle `user.comparePassword(password)` qui utilise `bcrypt.compare()`.

---

## 4. bcrypt — Hachage des mots de passe

```typescript
// utils/bcrypt.ts
export const hashValue = async (value: string, saltRounds: number = 10) =>
  await bcrypt.hash(value, saltRounds);

export const compareValue = async (value: string, hashedValue: string) =>
  await bcrypt.compare(value, hashedValue);
```

```typescript
// user.model.ts — Pre-save hook (automatique)
userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    if (this.password) {
      this.password = await hashValue(this.password);  // saltRounds = 10
    }
  }
  next();
});
```

- ✅ saltRounds = 10 (recommandé OWASP pour bcrypt)
- ✅ Hook automatique : le mot de passe est TOUJOURS haché avant sauvegarde
- ⚠️ Mot de passe minimum 4 caractères dans Zod (OWASP recommande 8+)

---

## 5. Système RBAC

### Définition des rôles et permissions
```typescript
// enums/role.enum.ts
export const Roles = { OWNER: "OWNER", ADMIN: "ADMIN", MEMBER: "MEMBER" };

export const Permissions = {
  CREATE_WORKSPACE, DELETE_WORKSPACE, EDIT_WORKSPACE, MANAGE_WORKSPACE_SETTINGS,
  ADD_MEMBER, CHANGE_MEMBER_ROLE, REMOVE_MEMBER,
  CREATE_PROJECT, EDIT_PROJECT, DELETE_PROJECT,
  CREATE_TASK, EDIT_TASK, DELETE_TASK,
  VIEW_ONLY,
};
```

### Matrice de permissions
```typescript
// utils/role-permission.ts
export const RolePermissions = {
  OWNER:  [/* toutes les 14 permissions */],
  ADMIN:  [ADD_MEMBER, CREATE_PROJECT, EDIT_PROJECT, DELETE_PROJECT,
           CREATE_TASK, EDIT_TASK, DELETE_TASK, MANAGE_WORKSPACE_SETTINGS, VIEW_ONLY],
  MEMBER: [VIEW_ONLY, CREATE_TASK, EDIT_TASK],
};
```

### Vérification en deux étapes dans chaque controller

**Étape 1 — getMemberRoleInWorkspace :** Vérifie appartenance ET récupère le rôle
```typescript
const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
// Retourne "OWNER" | "ADMIN" | "MEMBER"
// Lance UnauthorizedException si non membre
```

**Étape 2 — roleGuard :** Vérifie les permissions du rôle
```typescript
roleGuard(role, [Permissions.DELETE_WORKSPACE]);
// Calcule: RolePermissions[role].includes(ALL required permissions)
// Lance UnauthorizedException si permission manquante
```

---

## 6. Schémas de validation Zod

### auth.validation.ts
```typescript
emailSchema    = z.string().trim().email().min(1).max(255)
passwordSchema = z.string().trim().min(4)   // ⚠️ min 4 trop faible
registerSchema = z.object({ name, email, password })
loginSchema    = z.object({ email, password })
```

### workspace.valdation.ts
```typescript
nameSchema           = z.string().trim().min(1).max(255)
descriptionSchema    = z.string().trim().optional()
workspaceIdSchema    = z.string().trim().min(1)
changeRoleSchema     = z.object({ roleId, memberId })
createWorkspaceSchema= z.object({ name, description? })
updateWorkspaceSchema= z.object({ name, description? })
```

### project.validation.ts
```typescript
emojiSchema    = z.string().trim().optional()
projectIdSchema= z.string().trim().min(1)
createProjectSchema = z.object({ emoji?, name, description? })
updateProjectSchema = z.object({ emoji?, name, description? })
```

### task.validation.ts
```typescript
prioritySchema = z.enum(["LOW","MEDIUM","HIGH","URGENT"])
statusSchema   = z.enum(["BACKLOG","TODO","IN_PROGRESS","IN_REVIEW","DONE"])
dueDateSchema  = z.string().refine(val => !isNaN(Date.parse(val)))
createTaskSchema = z.object({ title, description?, priority, status?, assignedTo?, dueDate? })
```

---

## 7. CORS

```typescript
app.use(cors({
  origin: config.FRONTEND_ORIGIN,      // Origine unique (env variable)
  credentials: true,                    // Autorise cookies/auth headers
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

- ✅ Origine unique whitelist
- ✅ Credentials autorisés pour les cookies

---

## 8. Vulnérabilités identifiées

| Sévérité | Problème | Fichier | Recommandation |
|---|---|---|---|
| 🔴 CRITIQUE | Credentials MongoDB en clair dans `usernameandpassdb` | `backend/usernameandpassdb` | Révoquer immédiatement, supprimer, ajouter à `.gitignore` |
| 🔴 CRITIQUE | `env.production` avec secrets dans le dépôt | `backend/env.production` | Utiliser GitHub Secrets / Vault |
| 🔴 HAUTE | Route `/api/reports` sans `passportAuthenticateJWT` au niveau `index.ts` | `index.ts:72` | Ajouter le middleware au niveau de l'app |
| 🟠 MOYENNE | Pas de **Helmet.js** | `index.ts` | `app.use(helmet())` |
| 🟠 MOYENNE | Pas de **rate limiting** | `index.ts` | `express-rate-limit` sur `/api/auth/login` |
| 🟠 MOYENNE | Pas de **express-mongo-sanitize** | `index.ts` | `app.use(mongoSanitize())` |
| 🟡 FAIBLE | Mot de passe min 4 caractères | `validation/auth.validation.ts:10` | `min(8)` |
| 🟡 FAIBLE | `@ts-ignore` dans passport config | `passport.config.ts:78` | Corriger via `@types/index.d.ts` |
| 🟡 FAIBLE | Access token dans URL (OAuth callback) | `auth.controller.ts:22` | Utiliser code court d'échange |
| 🟡 FAIBLE | `console.log` avec données sensibles (sessions) | `auth.service.ts:28,77` | Supprimer en production |

---

## 9. Mesures de sécurité absentes

| Mesure | Priorité | Impact |
|---|---|---|
| Helmet.js (HTTP security headers) | Haute | Protège contre clickjacking, MIME sniffing, etc. |
| Rate limiting (express-rate-limit) | Haute | Protège contre brute force sur /auth/login |
| express-mongo-sanitize | Haute | Protège contre injection NoSQL |
| Refresh token | Moyenne | Réduction de la durée de vie du JWT |
| JWT blacklist | Moyenne | Logout serveur réel |
| HTTPS enforcement | Haute | En production uniquement |
| Tests de sécurité | Haute | Voir doc tests |
| RGPD / Privacy policy | Légale | Obligatoire en EU |
