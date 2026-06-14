# Backend — Architecture

## Flux d'une requête HTTP

```
Client HTTP
    │
    ▼
Express Router (/api/*)
    │
    ├─ Middleware CORS          → Vérifie l'origine
    ├─ express.json()           → Parse le body
    ├─ passport.initialize()    → Initialise Passport
    │
    ▼
passportAuthenticateJWT         → Valide le Bearer token JWT
    │  (sur toutes les routes sauf /auth/*)
    ▼
Route Handler (router.post/get/put/delete)
    │
    ▼
asyncHandler(controller)        → Wrapper try/catch, redirige les erreurs vers next()
    │
    ▼
Controller
    ├─ zodSchema.parse(req.body) → Validation des entrées (lance ZodError si invalide)
    ├─ getMemberRoleInWorkspace() → Récupère le rôle de l'utilisateur
    ├─ roleGuard(role, perms[])  → Vérifie les permissions RBAC
    │
    ▼
Service
    ├─ Logique métier
    ├─ Accès aux modèles Mongoose
    ├─ Transactions MongoDB (startSession/startTransaction)
    │
    ▼
Modèle Mongoose (MongoDB)
    │
    ▼ (réponse)
Controller → res.status(200).json({ message, data })
    │
    ▼ (en cas d'erreur)
errorHandler middleware
    ├─ ZodError          → 400 { message: "Valdation failed", errors: [...] }
    ├─ AppError          → statusCode défini { message, errorCode }
    └─ Error générique   → 500 { message: "internal Server Error" }
```

---

## Couches architecturales

### Couche Routes (`/routes`)
- Définit uniquement les chemins HTTP et les handlers
- Importe `passportAuthenticateJWT` pour certaines routes (workspace, user, project, task, member)
- Route `/reports` : JWT géré directement dans la définition de route

### Couche Controllers (`/controllers`)
- Valide les entrées avec Zod (`schema.parse(req.body)`)
- Extrait les IDs depuis `req.params`, `req.query`, `req.user`
- Vérifie les permissions RBAC via `getMemberRoleInWorkspace + roleGuard`
- Appelle exactement un service
- Retourne la réponse HTTP

### Couche Services (`/services`)
- Contient **toute** la logique métier
- Accède aux modèles Mongoose
- Gère les transactions MongoDB pour les opérations atomiques
- Lève des exceptions typées (`NotFoundException`, `BadRequestException`, etc.)
- Pas d'accès direct à `req` ou `res`

### Couche Modèles (`/models`)
- Définit les schémas Mongoose et les interfaces TypeScript
- Contient les hooks pre/post (ex: hachage du mot de passe)
- Définit les méthodes d'instance (`comparePassword`, `omitPassword`)

---

## Responsabilités des fichiers

| Fichier | Responsabilité unique |
|---|---|
| `index.ts` | Bootstrap Express, montage des routes, démarrage |
| `config/app.config.ts` | Source unique de vérité pour la configuration |
| `config/database.config.ts` | Connexion MongoDB |
| `config/http.config.ts` | Constantes des codes HTTP |
| `config/passport.config.ts` | Enregistrement des 3 stratégies Passport |
| `middlewares/asyncHandler.middleware.ts` | Encapsule les controllers async |
| `middlewares/errorHandler.middleware.ts` | Centralise la gestion des erreurs |
| `middlewares/authorize.middleware.ts` | Autorisation spécifique aux rapports |
| `utils/appError.ts` | Hiérarchie de classes d'erreurs HTTP |
| `utils/roleGuard.ts` | Vérification des permissions RBAC |
| `utils/role-permission.ts` | Matrice RBAC complète |
| `utils/jwt.ts` | Signature des JWT |
| `utils/bcrypt.ts` | Hachage et comparaison des mots de passe |
| `utils/uuid.ts` | Génération des codes uniques |
| `utils/get-env.ts` | Lecture stricte des variables d'environnement |
| `enums/role.enum.ts` | Définition des rôles et permissions |
| `enums/task.enum.ts` | États et priorités des tâches |
| `enums/error-code.enum.ts` | Codes d'erreur machine-readable |
| `enums/account-provider.enum.ts` | Fournisseurs OAuth supportés |
| `seeders/role.seeder.ts` | Script d'initialisation des rôles en base |

---

## Design Patterns utilisés

### Strategy Pattern
Utilisé par **Passport.js** : trois stratégies interchangeables
- `LocalStrategy` → email + password
- `GoogleStrategy` → OAuth 2.0 Google
- `JwtStrategy` → Bearer token JWT

### Factory Method
`AppError` et ses sous-classes (`NotFoundException`, `BadRequestException`, etc.) — chaque sous-classe fabrique une erreur avec un statut HTTP et un code d'erreur prédéfinis.

### Middleware Chain (Chain of Responsibility)
Express middleware chaîné :
```
cors → json → passport → JWT → asyncHandler → controller → errorHandler
```

### Repository Pattern (implicite)
Les services agissent comme des repositories : ils encapsulent l'accès aux modèles Mongoose et exposent des opérations métier nommées plutôt que des requêtes brutes.

### Singleton
`config` dans `app.config.ts` est appelé une fois et exporté comme objet immuable utilisé dans tout le projet.

---

## Flux de gestion des erreurs

```typescript
// asyncHandler.middleware.ts encapsule
async (req, res, next) => {
  try {
    await controller(req, res, next);
  } catch (error) {
    next(error);  // → errorHandler
  }
}

// errorHandler.middleware.ts
if (error instanceof ZodError)   → 400 + details des champs
if (error instanceof AppError)   → error.statusCode + error.errorCode
if (error instanceof SyntaxError)→ 400 "invalid json format"
else                             → 500 "internal Server Error"
```

---

## Extensions TypeScript (`@types/index.d.ts`)

```typescript
declare global {
  namespace Express {
    interface User extends UserDocument {
      _id?: any;
    }
    interface Request {
      jwt?: string;  // Stocke le JWT généré lors du callback Google OAuth
    }
  }
}
```
Ces extensions permettent d'utiliser `req.user._id` et `req.jwt` dans tout le projet sans erreur TypeScript.
