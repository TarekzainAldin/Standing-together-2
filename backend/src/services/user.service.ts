import mongoose from "mongoose";
import UserModel from "../models/user.model";
import AccountModel from "../models/account.model";
import MemberModel from "../models/member.model";
import WorkspaceModel, { WorkspaceDocument } from "../models/workspace.model";
import ProjectModel from "../models/project.model";
import TaskModel from "../models/task.model";
import { BadRequestException, NotFoundException, UnauthorizedException } from "../utils/appError";
import { ProviderEnum } from "../enums/account-provider.enum";
import { Roles } from "../enums/role.enum";
import { RoleDocument } from "../models/roles-permission.model";
import { deleteWorkspaceService } from "./workspace.service";

export const getCurrentUserService = async (userId: string) => {
  const user = await UserModel.findById(userId)
    .populate("currentWorkspace")
    .select("-password");

  if (!user) {
    throw new BadRequestException("user not found ");
  }
  return { user };
};

export const updateUserProfileService = async (
  userId: string,
  body: { name?: string; profilePicture?: string }
) => {
  const user = await UserModel.findByIdAndUpdate(
    userId,
    { $set: body },
    { new: true }
  ).select("-password");
  if (!user) throw new NotFoundException("User not found");
  return { user };
};

export const changePasswordService = async (
  userId: string,
  body: { currentPassword: string; newPassword: string }
) => {
  const user = await UserModel.findById(userId);
  if (!user) throw new NotFoundException("User not found");

  const isValid = await user.comparePassword(body.currentPassword);
  if (!isValid) throw new UnauthorizedException("Current password is incorrect");

  user.password = body.newPassword;
  await user.save();

  return { message: "Password changed successfully" };
};

export const deleteUserProfileService = async (userId: string) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = await UserModel.findById(userId).session(session);
    if (!user) throw new NotFoundException("User not found");

    // 1. Collect owned workspace IDs for later exclusion
    const ownedWorkspaces = await WorkspaceModel.find({ owner: userId }).session(session);
    const ownedWorkspaceIds = ownedWorkspaces.map((w) => w._id);

    // 2. Cascade-delete owned workspaces (projects → tasks → members → workspace)
    for (const workspace of ownedWorkspaces) {
      await TaskModel.deleteMany({ workspace: workspace._id }).session(session);
      await ProjectModel.deleteMany({ workspace: workspace._id }).session(session);
      await MemberModel.deleteMany({ workspaceId: workspace._id }).session(session);
      await WorkspaceModel.deleteOne({ _id: workspace._id }).session(session);
    }

    // 3. Delete tasks created by the user in workspaces they do NOT own
    await TaskModel.deleteMany({
      createdBy: userId,
      workspace: { $nin: ownedWorkspaceIds },
    }).session(session);

    // 4. Delete projects created by the user in workspaces they do NOT own
    //    (cascade their tasks first)
    const orphanProjects = await ProjectModel.find({
      createdBy: userId,
      workspace: { $nin: ownedWorkspaceIds },
    }).session(session);
    if (orphanProjects.length > 0) {
      const orphanProjectIds = orphanProjects.map((p) => p._id);
      await TaskModel.deleteMany({ project: { $in: orphanProjectIds } }).session(session);
      await ProjectModel.deleteMany({ _id: { $in: orphanProjectIds } }).session(session);
    }

    // 5. Null out assignedTo for any remaining tasks assigned to this user
    await TaskModel.updateMany(
      { assignedTo: userId },
      { $set: { assignedTo: null } }
    ).session(session);

    // 6. Remove all memberships (owned workspaces already cleaned above)
    await MemberModel.deleteMany({ userId }).session(session);

    // 7. Delete authentication accounts (email / Google OAuth)
    await AccountModel.deleteMany({ userId }).session(session);

    // 8. Delete the user document
    await UserModel.findByIdAndDelete(userId).session(session);

    await session.commitTransaction();
    return { message: "Account deleted successfully" };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

/**
 * Returns a preview of what will be destroyed when the user deletes their account.
 * Read-only — no side effects.
 */
export const getDeletionPreviewService = async (userId: string) => {
  const members = await MemberModel.find({ userId })
    .populate("role")
    .populate("workspaceId");

  const ownedMembers = members.filter(
    (m) => (m.role as RoleDocument).name === Roles.OWNER
  );

  const ownedWorkspaces = await Promise.all(
    ownedMembers.map(async (m) => {
      const ws = m.workspaceId as unknown as WorkspaceDocument;
      const [memberCount, taskCount, projectCount] = await Promise.all([
        MemberModel.countDocuments({ workspaceId: ws._id }),
        TaskModel.countDocuments({ workspace: ws._id }),
        ProjectModel.countDocuments({ workspace: ws._id }),
      ]);
      return {
        id: (ws._id as mongoose.Types.ObjectId).toString(),
        name: ws.name,
        memberCount,
        taskCount,
        projectCount,
      };
    })
  );

  return {
    isOwner: ownedWorkspaces.length > 0,
    ownedWorkspaces,
  };
};

/**
 * Deletes the user's account with full cascade:
 * - OWNER: deletes every owned workspace (projects + tasks + members) via deleteWorkspaceService
 * - MEMBER/ADMIN: only removes their membership records
 * Then removes their OAuth accounts and user document in a single transaction.
 */
export const deleteUserAccountService = async (
  userId: string,
  password?: string
) => {
  // Verify user
  const user = await UserModel.findById(userId);
  if (!user) throw new NotFoundException("User not found");

  // If a password was supplied, validate it against the EMAIL account
  if (password) {
    const emailAccount = await AccountModel.findOne({
      userId,
      provider: ProviderEnum.EMAIL,
    });
    if (emailAccount) {
      const isValid = await user.comparePassword(password);
      if (!isValid) throw new UnauthorizedException("Incorrect password");
    }
  }

  // Collect owned workspace IDs before any deletion
  const ownerMembers = await MemberModel.find({ userId })
    .populate("role")
    .populate("workspaceId");

  const ownedWorkspaceIds = ownerMembers
    .filter((m) => (m.role as RoleDocument).name === Roles.OWNER)
    .map((m) => {
      const ws = m.workspaceId as unknown as WorkspaceDocument;
      return (ws._id as mongoose.Types.ObjectId).toString();
    });

  // Delete each owned workspace (each call runs its own atomic transaction)
  for (const workspaceId of ownedWorkspaceIds) {
    await deleteWorkspaceService(workspaceId, userId);
  }

  // Clean up remaining data (non-owned memberships, OAuth accounts, user doc) atomically
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    await MemberModel.deleteMany({ userId }).session(session);
    await AccountModel.deleteMany({ userId }).session(session);
    await UserModel.findByIdAndDelete(userId).session(session);

    await session.commitTransaction();
    return { message: "Account deleted successfully" };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};