"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUserAccountController = exports.getDeletionPreviewController = exports.deleteUserProfileController = exports.changePasswordController = exports.updateUserProfileController = exports.getCurrentUserController = void 0;
const asyncHandler_middleware_1 = require("../middlewares/asyncHandler.middleware");
const http_config_1 = require("../config/http.config");
const user_service_1 = require("../services/user.service");
const member_service_1 = require("../services/member.service");
const appError_1 = require("../utils/appError");
const auth_validation_1 = require("../validation/auth.validation");
exports.getCurrentUserController = (0, asyncHandler_middleware_1.asyncHandler)(async (req, res) => {
    if (!req.user) {
        return res
            .status(http_config_1.HTTPSTATUS.UNAUTHORIZED)
            .json({ message: "User not authenticated" });
    }
    const userId = req.user._id.toString();
    const { user } = await (0, user_service_1.getCurrentUserService)(userId);
    return res.status(http_config_1.HTTPSTATUS.OK).json({
        message: "Successfully logged in",
        user,
    });
});
exports.updateUserProfileController = (0, asyncHandler_middleware_1.asyncHandler)(async (req, res) => {
    const userId = req.user?._id.toString();
    const body = auth_validation_1.updateUserProfileSchema.parse(req.body);
    const { user } = await (0, user_service_1.updateUserProfileService)(userId, body);
    return res.status(http_config_1.HTTPSTATUS.OK).json({
        message: "Profile updated successfully",
        user,
    });
});
exports.changePasswordController = (0, asyncHandler_middleware_1.asyncHandler)(async (req, res) => {
    const userId = req.user?._id.toString();
    const workspaceId = req.user?.currentWorkspace?.toString();
    const { role } = await (0, member_service_1.getMemberRoleInWorkspace)(userId, workspaceId);
    if (role === "MEMBER") {
        throw new appError_1.UnauthorizedException("Members cannot change passwords. Only OWNER or ADMIN.");
    }
    const body = auth_validation_1.changePasswordSchema.parse(req.body);
    const { message } = await (0, user_service_1.changePasswordService)(userId, body);
    return res.status(http_config_1.HTTPSTATUS.OK).json({ message });
});
exports.deleteUserProfileController = (0, asyncHandler_middleware_1.asyncHandler)(async (req, res) => {
    const userId = req.user?._id.toString();
    const { message } = await (0, user_service_1.deleteUserProfileService)(userId);
    return res.status(http_config_1.HTTPSTATUS.OK).json({ message });
});
exports.getDeletionPreviewController = (0, asyncHandler_middleware_1.asyncHandler)(async (req, res) => {
    const userId = req.user?._id.toString();
    const preview = await (0, user_service_1.getDeletionPreviewService)(userId);
    return res.status(http_config_1.HTTPSTATUS.OK).json({ message: "Preview ready", preview });
});
exports.deleteUserAccountController = (0, asyncHandler_middleware_1.asyncHandler)(async (req, res) => {
    const userId = req.user?._id.toString();
    const { password } = req.body;
    const { message } = await (0, user_service_1.deleteUserAccountService)(userId, password);
    return res.status(http_config_1.HTTPSTATUS.OK).json({ message });
});
