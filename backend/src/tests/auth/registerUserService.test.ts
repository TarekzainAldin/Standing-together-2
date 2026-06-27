import { registerUserService } from "../../services/auth.service";
import UserModel from "../../models/user.model";
import AccountModel from "../../models/account.model";
import WorkspaceModel from "../../models/workspace.model";
import RoleModel from "../../models/roles-permission.model";
import MemberModel from "../../models/member.model";
import { BadRequestException, NotFoundException } from "../../utils/appError";

jest.mock("../../models/user.model");
jest.mock("../../models/account.model");
jest.mock("../../models/workspace.model");
jest.mock("../../models/roles-permission.model");
jest.mock("../../models/member.model");

describe("registerUserService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (UserModel.deleteOne as jest.Mock).mockResolvedValue({});
  });

  it("should create user, account, workspace, and member successfully", async () => {
    const fakeUser = {
      _id: "user1",
      save: jest.fn(),
      name: "John",
      email: "john@test.com",
      currentWorkspace: null,
    };
    const fakeWorkspace = { _id: "ws1", save: jest.fn() };
    const fakeRole = { _id: "role1" };

    (UserModel.findOne as jest.Mock).mockResolvedValue(null);
    (UserModel as any).mockImplementation(() => fakeUser);
    (AccountModel as any).mockImplementation(() => ({ save: jest.fn() }));
    (WorkspaceModel as any).mockImplementation(() => fakeWorkspace);
    (RoleModel.findOne as jest.Mock).mockResolvedValue(fakeRole);
    (MemberModel as any).mockImplementation(() => ({ save: jest.fn() }));

    const result = await registerUserService({
      email: "john@test.com",
      name: "John",
      password: "1234",
    });

    expect(UserModel.findOne).toHaveBeenCalledWith({ email: "john@test.com" });
    expect(result.userId).toBe("user1");
    expect(result.workspaceId).toBe("ws1");
  });

  it("should throw BadRequestException if user already exists", async () => {
    (UserModel.findOne as jest.Mock).mockResolvedValue({
      _id: "user1",
      email: "john@test.com",
    });

    await expect(
      registerUserService({ email: "john@test.com", name: "John", password: "123" })
    ).rejects.toThrow(BadRequestException);
  });

  it("should throw NotFoundException if owner role not found", async () => {
    const fakeUser = { _id: "user1", save: jest.fn(), name: "John" };

    (UserModel.findOne as jest.Mock).mockResolvedValue(null);
    (UserModel as any).mockImplementation(() => fakeUser);
    (AccountModel as any).mockImplementation(() => ({ save: jest.fn() }));
    (WorkspaceModel as any).mockImplementation(() => ({ save: jest.fn(), _id: "ws1" }));
    (RoleModel.findOne as jest.Mock).mockResolvedValue(null);

    await expect(
      registerUserService({ email: "noRole@test.com", name: "John", password: "123" })
    ).rejects.toThrow(NotFoundException);
  });
});
