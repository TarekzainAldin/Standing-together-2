"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePasswordSchema = exports.updateUserProfileSchema = exports.loginSchema = exports.registerSchema = exports.passwordSchema = exports.emailSchema = void 0;
const zod_1 = require("zod");
exports.emailSchema = zod_1.z
    .string()
    .trim()
    .email("test@gmail.com")
    .min(1)
    .max(255);
exports.passwordSchema = zod_1.z.string().trim().min(8);
exports.registerSchema = zod_1.z.object({
    name: zod_1.z.string().trim().min(1).max(255),
    email: exports.emailSchema,
    password: exports.passwordSchema,
});
exports.loginSchema = zod_1.z.object({
    email: exports.emailSchema,
    password: zod_1.z.string().trim().min(1),
});
exports.updateUserProfileSchema = zod_1.z.object({
    name: zod_1.z.string().trim().min(1).max(255).optional(),
    profilePicture: zod_1.z.string().url().optional(),
});
exports.changePasswordSchema = zod_1.z
    .object({
    currentPassword: zod_1.z.string().trim().min(1),
    newPassword: zod_1.z.string().trim().min(8),
    confirmPassword: zod_1.z.string().trim().min(8),
})
    .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});
