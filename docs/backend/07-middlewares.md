# Backend — Middlewares

## 1. asyncHandler.middleware.ts

**Fichier :** `src/middlewares/asyncHandler.middleware.ts`
**Position dans la chaîne :** Encapsule chaque controller

### Code complet
```typescript
type AyncControllerType = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<any>;

export const asyncHandler =
  (controller: AyncControllerType): AyncControllerType =>
  async (req, res, next) => {
    try {
      await controller(req, res, next);
    } catch (error) {
      next(error);  // Redirige toutes les erreurs vers errorHandler
    }
  };
```

### Explication
Sans ce wrapper, les controllers async qui lancent une exception ne passeraient pas l'erreur à Express (car Express ne capture pas les Promise rejetées dans les versions < 5). `asyncHandler` garantit que toute erreur lancée dans un controller — qu'elle soit Zod, AppError, ou autre — est transmise au middleware `errorHandler`.

**Utilisation :**
```typescript
export const myController = asyncHandler(async (req, res) => {
  // Si cette ligne lance une erreur, elle va vers errorHandler
  const data = mySchema.parse(req.body);
  ...
});
```

---

## 2. errorHandler.middleware.ts

**Fichier :** `src/middlewares/errorHandler.middleware.ts`
**Position dans la chaîne :** Toujours en **dernier** dans `index.ts`

### Code complet
```typescript
const formatZodError = (res: Response, error: z.ZodError) => {
  const errors = error?.issues?.map((err) => ({
    field: err.path.join("."),
    message: err.message,
  }));
  return res.status(400).json({
    message: "Valdation failed",  // ⚠️ typo intentionnelle dans le code source
    error: errors,
    errorCode: ErrorCodeEnum.VALIDATION_ERROR,
  });
};

export const errorHandler: ErrorRequestHandler = (error, req, res, next): any => {
  console.error(`Error Occured on path ${req.path}`, error);

  if (error instanceof SyntaxError) {
    return res.status(400).json({
      message: "invalid json fromate . plase check your request",  // ⚠️ fautes d'orthographe
    });
  }

  if (error instanceof ZodError) {
    return formatZodError(res, error);
  }

  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      message: error.message,
      errorCode: error.errorCode,
    });
  }

  return res.status(500).json({
    message: "internal Server Error",
    error: error.message || "Unknow error occurred",
  });
};
```

### Flux de gestion
```
ZodError    → 400 { message: "Valdation failed", error: [{field, message}], errorCode: "VALIDATION_ERROR" }
SyntaxError → 400 { message: "invalid json fromate..." }
AppError    → error.statusCode { message, errorCode }
  ├─ NotFoundException      → 404 + "RESOURCE_NOT_FOUND"
  ├─ BadRequestException    → 400 + "VALIDATION_ERROR"
  ├─ UnauthorizedException  → 401 + "ACCESS_UNAUTHORIZED"
  ├─ ForbiddenException     → 403 + "ACCESS_FORBIDDEN"
  └─ InternalServerException→ 500 + "INTERNAL_SERVER_ERROR"
Autre Error → 500 { message: "internal Server Error", error: error.message }
```

### Issues connues
- **Typo** ligne 13 : `"Valdation failed"` au lieu de `"Validation failed"`
- **Typo** ligne 29 : `"invalid json fromate"` au lieu de `"invalid json format"`

---

## 3. isAuthenticated.middleware.ts

**Fichier :** `src/middlewares/isAuthenticated.middleware.ts`
**Position dans la chaîne :** Non utilisé actuellement (remplacé par `passportAuthenticateJWT`)

### Code complet
```typescript
const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user || !req.user._id) {
    throw new UnauthorizedException("Unauthorized please log in ...");
  }
  next();
};
```

### Note
Ce middleware est importé dans `index.ts` mais commenté. La vérification d'authentification est assurée par `passportAuthenticateJWT` (stratégie JWT Passport).

---

## 4. authorize.middleware.ts

**Fichier :** `src/middlewares/authorize.middleware.ts`
**Position dans la chaîne :** Après `passportAuthenticateJWT` sur la route `/api/reports/generate`

### Code complet
```typescript
export const authorizeReportGeneration = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user?._id) return res.status(401).json({ message: "Unauthorized" });

    const currentWorkspaceId = user.currentWorkspace?._id || user.currentWorkspace;
    if (!currentWorkspaceId) return res.status(400).json({ message: "No current workspace" });

    const workspace = await WorkspaceModel.findById(currentWorkspaceId).lean();
    if (!workspace) return res.status(404).json({ message: "Workspace not found" });

    // Vérifie que l'utilisateur est le propriétaire du workspace
    if (workspace.owner.toString() !== user._id.toString()) {
      return res.status(403).json({
        message: "Access denied: Only workspace owner can generate reports.",
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};
```

### Logique
- Récupère `user.currentWorkspace` depuis la session
- Compare `workspace.owner` avec `user._id`
- Seul le propriétaire du workspace peut générer des rapports

### Issue
Ce middleware contourne le système RBAC standard (`roleGuard`). Une meilleure approche serait d'utiliser `getMemberRoleInWorkspace + roleGuard(role, [Permissions.MANAGE_WORKSPACE_SETTINGS])`.

---

## 5. passportAuthenticateJWT (depuis passport.config.ts)

**Fichier :** `src/config/passport.config.ts` (ligne 135)
**Position dans la chaîne :** Avant les routes protégées dans `index.ts`

```typescript
export const passportAuthenticateJWT = passport.authenticate("jwt", {
  session: false,
});
```

**Ce qu'il fait :**
1. Extrait le JWT depuis le header `Authorization: Bearer <token>`
2. Vérifie la signature avec `JWT_SECRET` et l'algorithme HS256
3. Vérifie l'audience `["user"]`
4. Appelle `findUserByIdService(payload.userId)` pour charger l'utilisateur
5. Stocke l'utilisateur dans `req.user`
6. Si le token est invalide → retourne automatiquement `401 Unauthorized`
