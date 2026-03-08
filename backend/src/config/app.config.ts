<<<<<<< HEAD
// import { basename } from "path/posix";
// import { getEnv } from "../utils/get-env";

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
import { getEnv } from "../utils/get-env";

const appConfig = () => ({
  NODE_ENV: getEnv("NODE_ENV", "development"),
  PORT: getEnv("PORT", "8000"),
  BASE_PATH: getEnv("BASE_PATH", "/api"),
  MONGO_URI: getEnv("MONGO_URI", ""),

  JWT_SECRET: getEnv("JWT_SECRET"),
  JWT_EXPIRES_IN: getEnv("JWT_EXPIRES_IN", "1d"),

  SESSION_SECRET: getEnv("SESSION_SECRET"),
  SESSION_EXPIRES_IN: getEnv("SESSION_EXPIRES_IN"),

  GOOGLE_CLIENT_ID: getEnv("GOOGLE_CLIENT_ID"),
  GOOGLE_CLIENT_SECRET: getEnv("GOOGLE_CLIENT_SECRET"),
  GOOGLE_CLIENT_URI: getEnv("GOOGLE_CLIENT_URI", "http://localhost:5173/auth/callback"),
  GOOGLE_CALLBACK_URL: getEnv("GOOGLE_CALLBACK_URL", "http://localhost:8000/api/auth/google/callback"),

  FRONTEND_ORIGIN: getEnv("FRONTEND_ORIGIN", "http://localhost:5173"),
  FRONTEND_LOCAL: "localhost",
  FRONTEND_GOOGLE_CALLBACK_URL: getEnv("FRONTEND_GOOGLE_CALLBACK_URL", "http://localhost:5173/auth/callback"),
});

export const config = appConfig();





=======
import { basename } from "path/posix";
import { getEnv } from "../utils/get-env";

const appConfig = () => ({
    NODE_ENV: getEnv("NODE_ENV", "development"),
    PORT: getEnv("PORT", "5000"),
    BASE_PATH: getEnv("BASE_PATH", "/api"),
    MONGO_URI: getEnv("MONGO_URI", ""),

    JWT_SECRET: getEnv("JWT_SECRET"),
    JWT_EXPIRES_IN: getEnv("JWT_EXPIRES_IN", "1d"), 

    SESSION_SECRET: getEnv("SESSION_SECRET"),
    SESSION_EXPIRES_IN: getEnv("SESSION_EXPIRES_IN"),

    GOOGLE_CLIENT_ID: getEnv("GOOGLE_CLIENT_ID"),
    GOOGLE_CLIENT_SECRET: getEnv("GOOGLE_CLIENT_SECRET"),
    GOOGLE_CLIENT_URI: getEnv("GOOGLE_CLIENT_URI"),
    GOOGLE_CALLBACK_URL: getEnv("GOOGLE_CALLBACK_URL"),

    FRONTEND_ORIGIN: getEnv("FRONTEND_ORIGIN", "localhost"),
    FRONTEND_GOOGLE_CALLBACK_URL: getEnv("FRONTEND_GOOGLE_CALLBACK_URL"),
});

export const config = appConfig();
>>>>>>> 8e4f80f3bec2d316a813eacf15e003c20af43cc5
