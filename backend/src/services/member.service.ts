import { ErrorCodeEnum } from "../enums/error-code.enum";
import { Roles } from "../enums/role.enum";
import MemberModel from "../models/member.model";
import RoleModel from "../models/roles-permission.model";
import WorkspaceModel from "../models/workspace.model";
import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from "../utils/appError";
import { RolePermissions } from "../utils/role-permission";

export const getMemberRoleInWorkspace = async (
  userId: string,
  workspaceId: string
) => {
  const workspace = await WorkspaceModel.findById(workspaceId);
  if (!workspace) {
    throw new NotFoundException("Workspace not found");
  }

  const member = await MemberModel.findOne({
    userId,
    workspaceId,
  }).populate("role");

  if (!member) {
    throw new UnauthorizedException(
      "You are not a member of this workspace",
      ErrorCodeEnum.ACCESS_UNAUTHORIZED
    );
  }

  const roleName = member.role?.name;

  return { role: roleName };
};

export const joinWorkspaceByInviteService = async (
  userId: string,
  inviteCode: string
) => {
  // Find workspace by invite code
  const workspace = await WorkspaceModel.findOne({ inviteCode }).exec();
  if (!workspace) {
    throw new NotFoundException("Invalid invite code or workspace not found");
  }

  // Check if user is already a member
  const existingMember = await MemberModel.findOne({
    userId,
    workspaceId: workspace._id,
  }).exec();

  if (existingMember) {
    throw new BadRequestException("You are already a member of this workspace");
  }

  const role = await RoleModel.findOne({ name: Roles.MEMBER });

  if (!role) {
    throw new NotFoundException("Role not found");
  }

  // Add user to workspace as a member
  const newMember = new MemberModel({
    userId,
    workspaceId: workspace._id,
    role: role._id,
  });
  await newMember.save();

  return { workspaceId: workspace._id, role: role.name };
};

export const removeMemberService = async (
  requestingUserId: string,
  workspaceId: string,
  memberId: string
) => {
  const workspace = await WorkspaceModel.findById(workspaceId);
  if (!workspace) throw new NotFoundException("Workspace not found");

  // Get the requesting user's role
  const requester = await MemberModel.findOne({
    userId: requestingUserId,
    workspaceId,
  }).populate("role");

  if (!requester) {
    throw new UnauthorizedException(
      "You are not a member of this workspace",
      ErrorCodeEnum.ACCESS_UNAUTHORIZED
    );
  }

  const requesterRole = requester.role?.name as keyof typeof RolePermissions;
  if (!RolePermissions[requesterRole]?.includes("REMOVE_MEMBER")) {
    throw new UnauthorizedException(
      "You do not have permission to remove members",
      ErrorCodeEnum.ACCESS_UNAUTHORIZED
    );
  }

  // Find the member to remove
  const memberToRemove = await MemberModel.findOne({
    userId: memberId,
    workspaceId,
  }).populate("role");

  if (!memberToRemove) throw new NotFoundException("Member not found");

  // Cannot remove the workspace owner
  if (memberToRemove.role?.name === Roles.OWNER) {
    throw new BadRequestException("Cannot remove the workspace owner");
  }

  // Admin cannot remove another Admin
  if (
    requesterRole === Roles.ADMIN &&
    memberToRemove.role?.name === Roles.ADMIN
  ) {
    throw new BadRequestException("Admins cannot remove other admins");
  }

  await MemberModel.deleteOne({ userId: memberId, workspaceId });

  return { message: "Member removed successfully" };
};