import { z } from "zod";

export const emailSchema = z
  .string()
  .trim()
  .email("test@gmail.com")
  .min(1)
  .max(255);

export const passwordSchema = z.string().trim().min(8);

export const registerSchema = z.object({
  name: z.string().trim().min(1).max(255),
  email: emailSchema,
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().trim().min(1),
});

export const updateUserProfileSchema = z.object({
  name: z.string().trim().min(1).max(255).optional(),
  profilePicture: z.string().url().optional(),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().trim().min(1),
    newPassword: z.string().trim().min(8),
    confirmPassword: z.string().trim().min(8),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
