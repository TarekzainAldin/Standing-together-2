"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUserAccountService = exports.getDeletionPreviewService = exports.deleteUserProfileService = exports.changePasswordService = exports.updateUserProfileService = exports.getCurrentUserService = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const user_model_1 = __importDefault(require("../models/user.model"));
const account_model_1 = __importDefault(require("../models/account.model"));
const member_model_1 = __importDefault(require("../models/member.model"));
const workspace_model_1 = __importDefault(require("../models/workspace.model"));
const project_model_1 = __importDefault(require("../models/project.model"));
const task_model_1 = __importDefault(require("../models/task.model"));
const appError_1 = require("../utils/appError");
const account_provider_enum_1 = require("../enums/account-provider.enum");
const role_enum_1 = require("../enums/role.enum");
const workspace_service_1 = require("./workspace.service");
const getCurrentUserService = async (userId) => {
    const user = await user_model_1.default.findById(userId)
        .populate("currentWorkspace")
        .select("-password");
    if (!user) {
        throw new appError_1.BadRequestException("user not found ");
    }
    return { user };
};
exports.getCurrentUserService = getCurrentUserService;
const updateUserProfileService = async (userId, body) => {
    const user = await user_model_1.default.findByIdAndUpdate(userId, { $set: body }, { new: true }).select("-password");
    if (!user)
        throw new appError_1.NotFoundException("User not found");
    return { user };
};
exports.updateUserProfileService = updateUserProfileService;
const changePasswordService = async (userId, body) => {
    const user = await user_model_1.default.findById(userId);
    if (!user)
        throw new appError_1.NotFoundException("User not found");
    const isValid = await user.comparePassword(body.currentPassword);
    if (!isValid)
        throw new appError_1.UnauthorizedException("Current password is incorrect");
    user.password = body.newPassword;
    await user.save();
    return { message: "Password changed successfully" };
};
exports.changePasswordService = changePasswordService;
const deleteUserProfileService = async (userId) => {
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const user = await user_model_1.default.findById(userId).session(session);
        if (!user)
            throw new appError_1.NotFoundException("User not found");
        // 1. Collect owned workspace IDs for later exclusion
        const ownedWorkspaces = await workspace_model_1.default.find({ owner: userId }).session(session);
        const ownedWorkspaceIds = ownedWorkspaces.map((w) => w._id);
        // 2. Cascade-delete owned workspaces (projects → tasks → members → workspace)
        for (const workspace of ownedWorkspaces) {
            await task_model_1.default.deleteMany({ workspace: workspace._id }).session(session);
            await project_model_1.default.deleteMany({ workspace: workspace._id }).session(session);
            await member_model_1.default.deleteMany({ workspaceId: workspace._id }).session(session);
            await workspace_model_1.default.deleteOne({ _id: workspace._id }).session(session);
        }
        // 3. Delete tasks created by the user in workspaces they do NOT own
        await task_model_1.default.deleteMany({
            createdBy: userId,
            workspace: { $nin: ownedWorkspaceIds },
        }).session(session);
        // 4. Delete projects created by the user in workspaces they do NOT own
        //    (cascade their tasks first)
        const orphanProjects = await project_model_1.default.find({
            createdBy: userId,
            workspace: { $nin: ownedWorkspaceIds },
        }).session(session);
        if (orphanProjects.length > 0) {
            const orphanProjectIds = orphanProjects.map((p) => p._id);
            await task_model_1.default.deleteMany({ project: { $in: orphanProjectIds } }).session(session);
            await project_model_1.default.deleteMany({ _id: { $in: orphanProjectIds } }).session(session);
        }
        // 5. Null out assignedTo for any remaining tasks assigned to this user
        await task_model_1.default.updateMany({ assignedTo: userId }, { $set: { assignedTo: null } }).session(session);
        // 6. Remove all memberships (owned workspaces already cleaned above)
        await member_model_1.default.deleteMany({ userId }).session(session);
        // 7. Delete authentication accounts (email / Google OAuth)
        await account_model_1.default.deleteMany({ userId }).session(session);
        // 8. Delete the user document
        await user_model_1.default.findByIdAndDelete(userId).session(session);
        await session.commitTransaction();
        return { message: "Account deleted successfully" };
    }
    catch (error) {
        await session.abortTransaction();
        throw error;
    }
    finally {
        session.endSession();
    }
};
exports.deleteUserProfileService = deleteUserProfileService;
/**
 * Returns a preview of what will be destroyed when the user deletes their account.
 * Read-only — no side effects.
 */
const getDeletionPreviewService = async (userId) => {
    const members = await member_model_1.default.find({ userId })
        .populate("role")
        .populate("workspaceId");
    const ownedMembers = members.filter((m) => m.role.name === role_enum_1.Roles.OWNER);
    const ownedWorkspaces = await Promise.all(ownedMembers.map(async (m) => {
        const ws = m.workspaceId;
        const [memberCount, taskCount, projectCount] = await Promise.all([
            member_model_1.default.countDocuments({ workspaceId: ws._id }),
            task_model_1.default.countDocuments({ workspace: ws._id }),
            project_model_1.default.countDocuments({ workspace: ws._id }),
        ]);
        return {
            id: ws._id.toString(),
            name: ws.name,
            memberCount,
            taskCount,
            projectCount,
        };
    }));
    return {
        isOwner: ownedWorkspaces.length > 0,
        ownedWorkspaces,
    };
};
exports.getDeletionPreviewService = getDeletionPreviewService;
/**
 * Deletes the user's account with full cascade:
 * - OWNER: deletes every owned workspace (projects + tasks + members) via deleteWorkspaceService
 * - MEMBER/ADMIN: only removes their membership records
 * Then removes their OAuth accounts and user document in a single transaction.
 */
const deleteUserAccountService = async (userId, password) => {
    // Verify user
    const user = await user_model_1.default.findById(userId);
    if (!user)
        throw new appError_1.NotFoundException("User not found");
    // If a password was supplied, validate it against the EMAIL account
    if (password) {
        const emailAccount = await account_model_1.default.findOne({
            userId,
            provider: account_provider_enum_1.ProviderEnum.EMAIL,
        });
        if (emailAccount) {
            const isValid = await user.comparePassword(password);
            if (!isValid)
                throw new appError_1.UnauthorizedException("Incorrect password");
        }
    }
    // Collect owned workspace IDs before any deletion
    const ownerMembers = await member_model_1.default.find({ userId })
        .populate("role")
        .populate("workspaceId");
    const ownedWorkspaceIds = ownerMembers
        .filter((m) => m.role.name === role_enum_1.Roles.OWNER)
        .map((m) => {
        const ws = m.workspaceId;
        return ws._id.toString();
    });
    // Delete each owned workspace (each call runs its own atomic transaction)
    for (const workspaceId of ownedWorkspaceIds) {
        await (0, workspace_service_1.deleteWorkspaceService)(workspaceId, userId);
    }
    // Clean up remaining data (non-owned memberships, OAuth accounts, user doc) atomically
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        await member_model_1.default.deleteMany({ userId }).session(session);
        await account_model_1.default.deleteMany({ userId }).session(session);
        await user_model_1.default.findByIdAndDelete(userId).session(session);
        await session.commitTransaction();
        return { message: "Account deleted successfully" };
    }
    catch (error) {
        await session.abortTransaction();
        throw error;
    }
    finally {
        session.endSession();
    }
};
exports.deleteUserAccountService = deleteUserAccountService;
