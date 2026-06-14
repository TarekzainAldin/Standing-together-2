# Backend — Modèles Mongoose

## 1. UserModel

**Fichier :** `src/models/user.model.ts`
**Collection MongoDB :** `users`

### Interface TypeScript
```typescript
interface UserDocument extends Document {
  name: string;
  email: string;
  password?: string;           // Optionnel (absent pour OAuth Google)
  profilePicture: string | null;
  isActive: boolean;
  lastLogin: Date | null;
  createdAt: Date;
  updatedAt: Date;
  currentWorkspace: mongoose.Types.ObjectId | null;
  comparePassword(value: string): Promise<boolean>;
  omitPassword(): Omit<UserDocument, "password">;
}
```

### Champs
| Champ | Type | Requis | Défaut | Validation |
|---|---|---|---|---|
| `name` | String | Non | — | trim |
| `email` | String | **Oui** | — | unique, trim, lowercase |
| `password` | String | Non | — | select: true (retourné par défaut) |
| `profilePicture` | String | Non | `null` | — |
| `currentWorkspace` | ObjectId → Workspace | Non | — | ref: "Workspace" |
| `isActive` | Boolean | Non | `true` | — |
| `lastLogin` | Date | Non | `null` | — |
| `createdAt` | Date | — | auto | timestamps |
| `updatedAt` | Date | — | auto | timestamps |

### Hooks
```typescript
// Pre-save : hachage automatique du mot de passe
userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    if (this.password) {
      this.password = await hashValue(this.password); // bcrypt saltRounds=10
    }
  }
  next();
});
```

### Méthodes d'instance
```typescript
omitPassword()      // Retourne l'objet user sans le champ password
comparePassword(v)  // Compare v avec this.password via bcrypt
```

### Relations
- `currentWorkspace` → `WorkspaceModel._id`

---

## 2. AccountModel

**Fichier :** `src/models/account.model.ts`
**Collection MongoDB :** `accounts`

### Interface TypeScript
```typescript
interface AccountDocument extends Document {
  provider: ProviderEnumType;  // "GOOGLE" | "GITHUB" | "FACEBOOK" | "EMAIL"
  providerId: string;          // email (Local) ou Google ID (OAuth)
  userId: mongoose.Types.ObjectId;
  refreshToken?: string | null;
  tokenExpiry: Date | null;
  createdAt: Date;
}
```

### Champs
| Champ | Type | Requis | Défaut | Validation |
|---|---|---|---|---|
| `userId` | ObjectId → User | **Oui** | — | ref: "User" |
| `provider` | String enum | **Oui** | — | GOOGLE/GITHUB/FACEBOOK/EMAIL |
| `providerId` | String | **Oui** | — | unique |
| `refreshToken` | String | Non | `null` | supprimé dans toJSON |
| `tokenExpiry` | Date | Non | `null` | — |

### Hooks toJSON
```typescript
toJSON: {
  transform(doc, ret) {
    delete ret.refreshToken;  // refreshToken jamais sérialisé
  }
}
```

### Relations
- `userId` → `UserModel._id`

---

## 3. WorkspaceModel

**Fichier :** `src/models/workspace.model.ts`
**Collection MongoDB :** `workspaces`

### Interface TypeScript
```typescript
interface WorkspaceDocument extends Document {
  name: string;
  description: string;
  owner: mongoose.Types.ObjectId;
  inviteCode: string;
  createdAt: string;
  updatedAt: string;
}
```

### Champs
| Champ | Type | Requis | Défaut | Validation |
|---|---|---|---|---|
| `name` | String | **Oui** | — | trim |
| `description` | String | Non | — | — |
| `owner` | ObjectId → User | **Oui** | — | ref: "User" |
| `inviteCode` | String | **Oui** | `generateInviteCode()` | unique |

### Méthodes d'instance
```typescript
resetInviteCode()  // Régénère un nouveau inviteCode via UUID
```

### Génération du code d'invitation
```typescript
// utils/uuid.ts
export function generateInviteCode() {
  return uuidv4().replace(/-/g, "").substring(0, 8); // 8 chars alphanumériques
}
```

### Relations
- `owner` → `UserModel._id`

---

## 4. MemberModel

**Fichier :** `src/models/member.model.ts`
**Collection MongoDB :** `members`

### Interface TypeScript
```typescript
interface MemberDocument extends Document {
  userId: mongoose.Types.ObjectId;
  workspaceId: mongoose.Types.ObjectId;
  role: RoleDocument;  // Relation vers Role (populée)
  joinedAt: Date;
}
```

### Champs
| Champ | Type | Requis | Défaut |
|---|---|---|---|
| `userId` | ObjectId → User | **Oui** | — |
| `workspaceId` | ObjectId → Workspace | **Oui** | — |
| `role` | ObjectId → Role | **Oui** | — |
| `joinedAt` | Date | Non | `Date.now` |

### Relations
- `userId` → `UserModel._id`
- `workspaceId` → `WorkspaceModel._id`
- `role` → `RoleModel._id`

**Note :** Ce modèle est la table de jonction entre User et Workspace avec attribution de rôle.

---

## 5. RoleModel

**Fichier :** `src/models/roles-permission.model.ts`
**Collection MongoDB :** `roles`

### Interface TypeScript
```typescript
interface RoleDocument extends Document {
  name: RoleType;                  // "OWNER" | "ADMIN" | "MEMBER"
  permissions: Array<PermissionType>;
}
```

### Champs
| Champ | Type | Requis | Défaut |
|---|---|---|---|
| `name` | String enum | **Oui** | — |
| `permissions` | [String] enum | **Oui** | `RolePermissions[this.name]` |

### Valeurs par défaut des permissions
Calculées dynamiquement depuis `utils/role-permission.ts` :
```typescript
// OWNER : toutes les permissions
// ADMIN : ADD_MEMBER, CRUD projets, CRUD tâches, MANAGE_SETTINGS, VIEW
// MEMBER : VIEW_ONLY, CREATE_TASK, EDIT_TASK
```

---

## 6. ProjectModel

**Fichier :** `src/models/project.model.ts`
**Collection MongoDB :** `projects`

### Interface TypeScript
```typescript
interface ProjectDocument extends Document {
  name: string;
  description: string | null;
  emoji: string;
  workspace: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
```

### Champs
| Champ | Type | Requis | Défaut |
|---|---|---|---|
| `name` | String | **Oui** | — |
| `emoji` | String | Non | `"📊"` |
| `description` | String | Non | — |
| `workspace` | ObjectId → Workspace | **Oui** | — |
| `createdBy` | ObjectId → User | **Oui** | — |

### Relations
- `workspace` → `WorkspaceModel._id`
- `createdBy` → `UserModel._id`

---

## 7. TaskModel

**Fichier :** `src/models/task.model.ts`
**Collection MongoDB :** `tasks`

### Interface TypeScript
```typescript
interface TaskDocument extends Document {
  taskCode: string;
  title: string;
  description: string | null;
  project: mongoose.Types.ObjectId;
  workspace: mongoose.Types.ObjectId;
  status: TaskStatusEnumType;    // BACKLOG|TODO|IN_PROGRESS|IN_REVIEW|DONE
  priority: TaskPriorityEnumType; // LOW|MEDIUM|HIGH|URGENT
  assignedTo: mongoose.Types.ObjectId | null;
  createdBy: mongoose.Types.ObjectId;
  dueDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
```

### Champs
| Champ | Type | Requis | Défaut |
|---|---|---|---|
| `taskCode` | String | Non | `generateTaskCode()` |
| `title` | String | **Oui** | — |
| `description` | String | Non | `null` |
| `project` | ObjectId → Project | **Oui** | — |
| `workspace` | ObjectId → Workspace | **Oui** | — |
| `status` | String enum | Non | `"TODO"` |
| `priority` | String enum | Non | `"MEDIUM"` |
| `assignedTo` | ObjectId → User | Non | `null` |
| `createdBy` | ObjectId → User | **Oui** | — |
| `dueDate` | Date | Non | `null` |

### Génération du code de tâche
```typescript
// utils/uuid.ts
export function generateTaskCode() {
  return `task-${uuidv4().replace(/-/g, "").substring(0, 3)}`; // ex: "task-a3f"
}
```

### Relations
- `project` → `ProjectModel._id`
- `workspace` → `WorkspaceModel._id`
- `assignedTo` → `UserModel._id`
- `createdBy` → `UserModel._id`
