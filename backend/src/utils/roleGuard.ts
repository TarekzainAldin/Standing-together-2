import { PermissionType, Permissions } from "../enums/role.enum";
<<<<<<< HEAD
import { UnauthorizedException,ForbiddenException  } from "./appError";
=======
import { UnauthorizedException } from "./appError";
>>>>>>> 8e4f80f3bec2d316a813eacf15e003c20af43cc5
import { RolePermissions } from "./role-permission";

export const roleGuard = (
  role: keyof typeof RolePermissions,
  requiredPermissions: PermissionType[]
) => {
  const permissions = RolePermissions[role];
  // If the role doesn't exist or lacks required permissions, throw an exception

  const hasPermission = requiredPermissions.every((permission) =>
    permissions.includes(permission)
  );

  if (!hasPermission) {
<<<<<<< HEAD
    // throw new UnauthorizedException(
    //   "You do not have the necessary permissions to perform this action"
    // );
    throw new ForbiddenException(
=======
    throw new UnauthorizedException(
>>>>>>> 8e4f80f3bec2d316a813eacf15e003c20af43cc5
      "You do not have the necessary permissions to perform this action"
    );
  }
};