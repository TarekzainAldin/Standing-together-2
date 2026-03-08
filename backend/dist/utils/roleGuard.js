"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roleGuard = void 0;
const appError_1 = require("./appError");
const role_permission_1 = require("./role-permission");
const roleGuard = (role, requiredPermissions) => {
    const permissions = role_permission_1.RolePermissions[role];
    // If the role doesn't exist or lacks required permissions, throw an exception
    const hasPermission = requiredPermissions.every((permission) => permissions.includes(permission));
    if (!hasPermission) {
<<<<<<< HEAD
        // throw new UnauthorizedException(
        //   "You do not have the necessary permissions to perform this action"
        // );
        throw new appError_1.ForbiddenException("You do not have the necessary permissions to perform this action");
=======
        throw new appError_1.UnauthorizedException("You do not have the necessary permissions to perform this action");
>>>>>>> 8e4f80f3bec2d316a813eacf15e003c20af43cc5
    }
};
exports.roleGuard = roleGuard;
