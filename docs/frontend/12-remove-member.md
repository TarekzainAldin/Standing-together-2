# Remove Member — Frontend

## Fichiers modifiés

| Fichier | Modification |
|---------|-------------|
| `src/lib/api.ts` | Ajout de `removeMemberMutationFn` |
| `src/components/workspace/member/all-members.tsx` | Ajout bouton de suppression |

---

## `removeMemberMutationFn` (`lib/api.ts`)

```typescript
export const removeMemberMutationFn = async ({
  workspaceId,
  memberId,
}: {
  workspaceId: string;
  memberId: string;
}): Promise<{ message: string }> => {
  const response = await API.delete(
    `/member/${workspaceId}/remove/${memberId}`
  );
  return response.data;
};
```

---

## Composant `AllMembers`

### Permissions vérifiées

```typescript
const canRemoveMember = hasPermission(Permissions.REMOVE_MEMBER);
// true  → OWNER, ADMIN
// false → MEMBER
```

### Mutation

```typescript
const { mutate: removeMember, isPending: isRemoving } = useMutation({
  mutationFn: removeMemberMutationFn,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["members", workspaceId] });
    toast({ title: "Success", variant: "success" });
  },
  onError: (error) => {
    toast({ title: "Error", description: error.message, variant: "destructive" });
  },
});
```

### Logique d'affichage du bouton

```typescript
{canRemoveMember &&
  member.userId._id !== user?._id &&   // pas soi-même
  member.role.name !== "OWNER" && (    // pas le propriétaire
    <Button onClick={() => handleRemove(member.userId._id)}>
      <UserMinus />
    </Button>
  )}
```

### Résumé des règles d'affichage

| Condition | Bouton visible |
|-----------|---------------|
| Utilisateur connecté est MEMBER | Non |
| Membre cible = soi-même | Non |
| Membre cible = OWNER | Non |
| Utilisateur connecté est OWNER, cible est ADMIN | Oui |
| Utilisateur connecté est OWNER, cible est MEMBER | Oui |
| Utilisateur connecté est ADMIN, cible est MEMBER | Oui |
| Utilisateur connecté est ADMIN, cible est ADMIN | Non (refusé aussi côté backend) |
