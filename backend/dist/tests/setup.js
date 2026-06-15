"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
mongoose_1.default.set("bufferCommands", false);
// Suppress console.error noise from the errorHandler during tests
console.error = () => { };
process.env.NODE_ENV = "test";
process.env.PORT = "8000";
process.env.BASE_PATH = "/api";
process.env.MONGO_URI = "mongodb://localhost:27017/test";
process.env.JWT_SECRET = "test_jwt_secret_for_tests_only";
process.env.JWT_EXPIRES_IN = "1d";
process.env.SESSION_SECRET = "test_session_secret";
process.env.SESSION_EXPIRES_IN = "1d";
process.env.GOOGLE_CLIENT_ID = "test_google_client_id";
process.env.GOOGLE_CLIENT_SECRET = "test_google_client_secret";
process.env.GOOGLE_CLIENT_URI = "http://localhost:8000";
process.env.GOOGLE_CALLBACK_URL = "http://localhost:8000/api/auth/google/callback";
process.env.FRONTEND_ORIGIN = "http://localhost:5173";
process.env.FRONTEND_GOOGLE_CALLBACK_URL = "http://localhost:5173/auth/google/callback";
