"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const auth_service_1 = require("../../services/auth.service");
const user_model_1 = __importDefault(require("../../models/user.model"));
const account_model_1 = __importDefault(require("../../models/account.model"));
const workspace_model_1 = __importDefault(require("../../models/workspace.model"));
const roles_permission_model_1 = __importDefault(require("../../models/roles-permission.model"));
const member_model_1 = __importDefault(require("../../models/member.model"));
const appError_1 = require("../../utils/appError");
jest.mock("../../models/user.model");
jest.mock("../../models/account.model");
jest.mock("../../models/workspace.model");
jest.mock("../../models/roles-permission.model");
jest.mock("../../models/member.model");
describe("registerUserService", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        user_model_1.default.deleteOne.mockResolvedValue({});
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
        user_model_1.default.findOne.mockResolvedValue(null);
        user_model_1.default.mockImplementation(() => fakeUser);
        account_model_1.default.mockImplementation(() => ({ save: jest.fn() }));
        workspace_model_1.default.mockImplementation(() => fakeWorkspace);
        roles_permission_model_1.default.findOne.mockResolvedValue(fakeRole);
        member_model_1.default.mockImplementation(() => ({ save: jest.fn() }));
        const result = await (0, auth_service_1.registerUserService)({
            email: "john@test.com",
            name: "John",
            password: "1234",
        });
        expect(user_model_1.default.findOne).toHaveBeenCalledWith({ email: "john@test.com" });
        expect(result.userId).toBe("user1");
        expect(result.workspaceId).toBe("ws1");
    });
    it("should throw BadRequestException if user already exists", async () => {
        user_model_1.default.findOne.mockResolvedValue({
            _id: "user1",
            email: "john@test.com",
        });
        await expect((0, auth_service_1.registerUserService)({ email: "john@test.com", name: "John", password: "123" })).rejects.toThrow(appError_1.BadRequestException);
    });
    it("should throw NotFoundException if owner role not found", async () => {
        const fakeUser = { _id: "user1", save: jest.fn(), name: "John" };
        user_model_1.default.findOne.mockResolvedValue(null);
        user_model_1.default.mockImplementation(() => fakeUser);
        account_model_1.default.mockImplementation(() => ({ save: jest.fn() }));
        workspace_model_1.default.mockImplementation(() => ({ save: jest.fn(), _id: "ws1" }));
        roles_permission_model_1.default.findOne.mockResolvedValue(null);
        await expect((0, auth_service_1.registerUserService)({ email: "noRole@test.com", name: "John", password: "123" })).rejects.toThrow(appError_1.NotFoundException);
    });
});
