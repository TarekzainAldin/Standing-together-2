"use strict";
<<<<<<< HEAD
// import { basename } from "path/posix";
// import { getEnv } from "../utils/get-env";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
// const appConfig = () => ({
//     NODE_ENV: getEnv("NODE_ENV", "development"),
//     PORT: getEnv("PORT", "5173"),
//     BASE_PATH: getEnv("BASE_PATH", "/api"),
//     MONGO_URI: getEnv("MONGO_URI", ""),
//     JWT_SECRET: getEnv("JWT_SECRET"),
//     JWT_EXPIRES_IN: getEnv("JWT_EXPIRES_IN", "1d"), 
//     SESSION_SECRET: getEnv("SESSION_SECRET"),
//     SESSION_EXPIRES_IN: getEnv("SESSION_EXPIRES_IN"),
//     GOOGLE_CLIENT_ID: getEnv("GOOGLE_CLIENT_ID"),
//     GOOGLE_CLIENT_SECRET: getEnv("GOOGLE_CLIENT_SECRET"),
//     GOOGLE_CLIENT_URI: getEnv("GOOGLE_CLIENT_URI"),
//     GOOGLE_CALLBACK_URL: getEnv("GOOGLE_CALLBACK_URL"),
//     FRONTEND_ORIGIN: getEnv("FRONTEND_ORIGIN", "localhost"),
//     FRONTEND_LOCAL: "localhost",
//     FRONTEND_GOOGLE_CALLBACK_URL: getEnv("FRONTEND_GOOGLE_CALLBACK_URL"),
// });
// export const config = appConfig();
const get_env_1 = require("../utils/get-env");
const appConfig = () => ({
    NODE_ENV: (0, get_env_1.getEnv)("NODE_ENV", "development"),
    PORT: (0, get_env_1.getEnv)("PORT", "8000"),
=======
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const get_env_1 = require("../utils/get-env");
const appConfig = () => ({
    NODE_ENV: (0, get_env_1.getEnv)("NODE_ENV", "development"),
    PORT: (0, get_env_1.getEnv)("PORT", "5000"),
>>>>>>> 8e4f80f3bec2d316a813eacf15e003c20af43cc5
    BASE_PATH: (0, get_env_1.getEnv)("BASE_PATH", "/api"),
    MONGO_URI: (0, get_env_1.getEnv)("MONGO_URI", ""),
    JWT_SECRET: (0, get_env_1.getEnv)("JWT_SECRET"),
    JWT_EXPIRES_IN: (0, get_env_1.getEnv)("JWT_EXPIRES_IN", "1d"),
    SESSION_SECRET: (0, get_env_1.getEnv)("SESSION_SECRET"),
    SESSION_EXPIRES_IN: (0, get_env_1.getEnv)("SESSION_EXPIRES_IN"),
    GOOGLE_CLIENT_ID: (0, get_env_1.getEnv)("GOOGLE_CLIENT_ID"),
    GOOGLE_CLIENT_SECRET: (0, get_env_1.getEnv)("GOOGLE_CLIENT_SECRET"),
<<<<<<< HEAD
    GOOGLE_CLIENT_URI: (0, get_env_1.getEnv)("GOOGLE_CLIENT_URI", "http://localhost:5173/auth/callback"),
    GOOGLE_CALLBACK_URL: (0, get_env_1.getEnv)("GOOGLE_CALLBACK_URL", "http://localhost:8000/api/auth/google/callback"),
    FRONTEND_ORIGIN: (0, get_env_1.getEnv)("FRONTEND_ORIGIN", "http://localhost:5173"),
    FRONTEND_LOCAL: "localhost",
    FRONTEND_GOOGLE_CALLBACK_URL: (0, get_env_1.getEnv)("FRONTEND_GOOGLE_CALLBACK_URL", "http://localhost:5173/auth/callback"),
=======
    GOOGLE_CLIENT_URI: (0, get_env_1.getEnv)("GOOGLE_CLIENT_URI"),
    GOOGLE_CALLBACK_URL: (0, get_env_1.getEnv)("GOOGLE_CALLBACK_URL"),
    FRONTEND_ORIGIN: (0, get_env_1.getEnv)("FRONTEND_ORIGIN", "localhost"),
    FRONTEND_GOOGLE_CALLBACK_URL: (0, get_env_1.getEnv)("FRONTEND_GOOGLE_CALLBACK_URL"),
>>>>>>> 8e4f80f3bec2d316a813eacf15e003c20af43cc5
});
exports.config = appConfig();
