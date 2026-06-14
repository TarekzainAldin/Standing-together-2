# Backend — Audit CCP "Développer une application sécurisée"

---

## CRITÈRE 1 — Outils de développement installés et configurés

✅ **COUVERT**

- **TypeScript 5.9** en mode `strict` configuré dans `backend/tsconfig.json`
- **ts-node-dev** pour le rechargement à chaud en développement
- **Jest 30 + ts-jest** configurés dans `backend/jest.config.js`
- **ESLint** présent côté frontend (pas de config ESLint backend — voir recommandation)

**Preuves :**
- `tsconfig.json:11` → `"strict": true`
- `jest.config.js:2` → `preset: 'ts-jest'`
- `package.json` → scripts `dev`, `build`, `test`, `seed`

---

## CRITÈRE 2 — Outils de gestion des versions installés

✅ **COUVERT**

- Dépôt Git initialisé avec branche `master`
- Remote GitHub configuré : `https://github.com/TarekzainAldin/Standing-together.git`
- Historique de commits visible (10+ commits)
- `.dockerignore` exclut `.git`, `.env`, `dist`

⚠️ **Partiel :** Messages de commits peu descriptifs ("ee", "adding the content", "welcome back") — ne respectent pas les conventions conventionalcommits.org.

---

## CRITÈRE 3 — Les conteneurs implémentent les services requis

⚠️ **PARTIEL**

✅ `docker-compose.dev.yml` **fonctionnel** : MongoDB 7 (ReplicaSet), backend Node 20, frontend Vite — avec réseau bridge, volumes persistants, `restart: unless-stopped`

❌ `docker-compose.prod.yml` **100% commenté** — non déployable
❌ `backend/Dockerfile.prod` **vide**
❌ `frontend/Dockerfile.prod` **100% commenté**
❌ `nginx/conf.d/backend.conf` **100% commenté** — le reverse proxy API n'est pas configuré

---

## CRITÈRE 4 — Documentation technique comprise

⚠️ **PARTIEL**

✅ `README.md` décrit : stack, routes API, modèles de données, instructions d'installation
✅ Types TypeScript et interfaces documentent la structure des données
✅ Enums et constantes sont auto-documentés

❌ Pas de JSDoc sur les services et controllers
❌ Pas de documentation OpenAPI/Swagger pour l'API
❌ Pas de cahier des charges formel

---

## CRITÈRE 5 — Bonnes pratiques POO respectées

✅ **COUVERT**

- **Hiérarchie de classes :** `AppError → NotFoundException, BadRequestException, UnauthorizedException, ForbiddenException, InternalServerException`
- **Interfaces TypeScript :** `UserDocument`, `AccountDocument`, `WorkspaceDocument`, `ProjectDocument`, `TaskDocument`, `MemberDocument`, `RoleDocument`
- **Encapsulation :** `user.omitPassword()`, `user.comparePassword()` — méthodes d'instance Mongoose
- **Séparation des responsabilités :** routes → controllers → services → models
- **Enums typés :** `Roles`, `Permissions`, `TaskStatusEnum`, `TaskPriorityEnum`, `ProviderEnum`, `ErrorCodeEnum`
- **Pattern asyncHandler :** wrapper réutilisable pour tous les controllers async

⚠️ **Mineure :** Import inutilisé `import { permission } from "process"` dans `workspace.controller.ts`

---

## CRITÈRE 6 — Composants serveurs sécurisés

⚠️ **PARTIEL**

✅ JWT HS256 avec audience, expiration, algorithme explicite
✅ Google OAuth 2.0 actif
✅ bcrypt saltRounds=10 via hook pre-save automatique
✅ RBAC complet (OWNER/ADMIN/MEMBER + 14 permissions)
✅ Zod validation sur toutes les routes
✅ CORS restrictif (origine unique)
✅ Transactions MongoDB (opérations atomiques)

❌ Pas de Helmet.js
❌ Pas de rate limiting
❌ Pas de protection injection NoSQL (express-mongo-sanitize)
❌ Route `/api/reports` sans JWT au niveau `index.ts`
❌ Password minimum 4 caractères
❌ Credentials MongoDB en clair dans `backend/usernameandpassdb`

---

## CRITÈRE 7 — Règles de nommage conformes

⚠️ **PARTIEL**

✅ `camelCase` pour variables et fonctions
✅ `PascalCase` pour classes et interfaces
✅ Suffixes cohérents : `*Service`, `*Controller`, `*Route`, `*Model`, `*Schema`

❌ **Typos identifiées :**
- `errorHandler.middleware.ts:13` → `"Valdation failed"` (au lieu de "Validation")
- `errorHandler.middleware.ts:29` → `"invalid json fromate"` (au lieu de "format")
- `workspace.valdation.ts` → nom de fichier avec "valdation" au lieu de "validation"
- `frontend/src/components/resuable/` → "resuable" au lieu de "reusable"

---

## CRITÈRE 8 — Code source documenté (JSDoc)

❌ **MANQUANT**

```bash
grep -r "@param\|@returns\|@throws" backend/src/services/   → 0 résultats
grep -r "@param\|@returns\|@throws" backend/src/controllers/ → 0 résultats
```

Le seul commentaire JSDoc trouvé est dans `authorize.middleware.ts` en arabe.
Les services contiennent des `console.log` au lieu de documentation.

**Recommandation :** Ajouter JSDoc sur toutes les fonctions publiques exportées des services :
```typescript
/**
 * @description Register a new user with email and password
 * @param {object} body - { email, name, password }
 * @returns {Promise<{ userId: string, workspaceId: string }>}
 * @throws {BadRequestException} Email already exists
 * @throws {NotFoundException} Owner role not found in database
 */
export const registerUserService = async (body: ...) => {...}
```

---

## CRITÈRE 9 — Tests unitaires réalisés

✅ **COUVERT**

**7 fichiers de tests**, **~43 cas de test** couvrant :
- `auth.service.ts` (6 cas)
- `workspace.service.ts` (10 cas)
- `task.service.ts` (11 cas)
- `project.service.ts` (10 cas)
- `member.service.ts` (7 cas)
- `user.service.ts` (2 cas)

Tests positifs ET négatifs, mocks Mongoose complets, transactions mockées.

⚠️ Pas de coverage report configuré
⚠️ Pas de tests d'intégration (supertest + mongodb-memory-server installés mais inutilisés)

---

## CRITÈRE 10 — Tests de sécurité réalisés

❌ **MANQUANT**

```bash
find backend/src/tests -name "*.test.ts" | xargs grep -l "injection\|bypass\|invalid.*token\|RBAC"
→ 0 résultats
```

Aucun des tests existants ne vérifie :
- JWT invalide ou expiré → 401
- Accès sans permission → 403
- Injection NoSQL dans les paramètres
- Accès cross-workspace
- Brute force protection

---

## CRITÈRE 11 — Vulnérabilités identifiées et corrigées

⚠️ **PARTIEL — Identifiées mais NON corrigées**

| Vulnérabilité | Sévérité | Statut |
|---|---|---|
| Credentials MongoDB en clair dans le dépôt | 🔴 Critique | ❌ Non corrigé |
| `env.production` avec secrets dans le dépôt | 🔴 Critique | ❌ Non corrigé |
| Route `/api/reports` sans JWT au niveau app | 🔴 Haute | ❌ Non corrigé |
| Pas de Helmet.js | 🟠 Moyenne | ❌ Non corrigé |
| Pas de rate limiting | 🟠 Moyenne | ❌ Non corrigé |
| Pas de express-mongo-sanitize | 🟠 Moyenne | ❌ Non corrigé |
| Password min 4 chars | 🟡 Faible | ❌ Non corrigé |

---

## Score global Backend CCP

| Critère | Statut | Score |
|---|---|---|
| Outils de développement | ✅ | 4/5 |
| Gestion des versions | ✅ | 4/5 |
| Conteneurs Docker | ⚠️ | 3/5 |
| Documentation technique | ⚠️ | 2/5 |
| Bonnes pratiques POO | ✅ | 4/5 |
| Sécurité composants serveur | ⚠️ | 3/5 |
| Règles de nommage | ⚠️ | 3/5 |
| JSDoc | ❌ | 1/5 |
| Tests unitaires | ✅ | 4/5 |
| Tests de sécurité | ❌ | 0/5 |
| Vulnérabilités corrigées | ⚠️ | 1/5 |
| **TOTAL** | | **29/55** |
