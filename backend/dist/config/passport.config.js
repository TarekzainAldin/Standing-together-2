"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.passportAuthenticateJWT = void 0;
const passport_1 = __importDefault(require("passport"));
const passport_google_oauth20_1 = require("passport-google-oauth20");
const passport_local_1 = require("passport-local");
const passport_jwt_1 = require("passport-jwt");
const app_config_1 = require("./app.config");
const appError_1 = require("../utils/appError");
const account_provider_enum_1 = require("../enums/account-provider.enum");
const auth_service_1 = require("../services/auth.service");
const jwt_1 = require("../utils/jwt");
// passport.use(
//   new GoogleStrategy(
//     {
//       clientID: config.GOOGLE_CLIENT_ID,
//       clientSecret: config.GOOGLE_CLIENT_SECRET,
//       callbackURL: config.GOOGLE_CALLBACK_URL,
//       scope: ["profile", "email"],
//       passReqToCallback: true,
//     },
//     async (req: Request, accessToken, refreshToken, profile, done) => {
//       try {
//         const { email, sub: googleId, picture } = profile._json;
//         console.log(profile, "profile");
//         console.log(googleId, "googleId");
//         if (!googleId) {
//           throw new NotFoundException("Google ID (sub) is missing");
//         }
//         const { user } = await loginOrCreateAccountService({
//           provider: ProviderEnum.GOOGLE,
//           displayName: profile.displayName,
//           providerId: googleId,
//           picture: picture ?? "", 
//           email: email ?? "",
//         });
//         const jwt = signJwtToken({userId:user._id});
//         req.jwt = jwt;
//         done(null, user);
//       } catch (error) {
//         done(error, false);
//       }
//     }
//   )
// );
// Google Strategy
passport_1.default.use(new passport_google_oauth20_1.Strategy({
    clientID: app_config_1.config.GOOGLE_CLIENT_ID,
    clientSecret: app_config_1.config.GOOGLE_CLIENT_SECRET,
    callbackURL: app_config_1.config.GOOGLE_CALLBACK_URL, // http://localhost:8000/api/auth/google/callback
    scope: ["profile", "email"],
    passReqToCallback: true,
}, async (req, accessToken, refreshToken, profile, done) => {
    try {
        const { email, sub: googleId, picture } = profile._json;
        const { user } = await (0, auth_service_1.loginOrCreateAccountService)({
            provider: account_provider_enum_1.ProviderEnum.GOOGLE,
            displayName: profile.displayName,
            providerId: googleId,
            picture: picture ?? "",
            email: email ?? "",
        });
        const jwt = (0, jwt_1.signJwtToken)({ userId: user._id });
        // خزن الـ JWT في req لاستخدامه لاحقًا في route callback
        // @ts-ignore
        req.jwt = jwt;
        done(null, user); // تمرير user فقط → يحل خطأ TypeScript
    }
    catch (error) {
        done(error, false);
    }
}));
passport_1.default.use(new passport_local_1.Strategy({
    usernameField: "email",
    passwordField: "password",
    session: false,
}, async (email, password, done) => {
    try {
        const user = await (0, auth_service_1.verifyUserService)({ email, password });
        return done(null, user);
    }
    catch (error) {
        if (error instanceof appError_1.AppError) {
            return done(error, false, { message: error.message });
        }
        return done(null, false, { message: "Authentication failed. Please try again." });
    }
}));
const options = {
    jwtFromRequest: passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: app_config_1.config.JWT_SECRET,
    audience: ["user"],
    algorithms: ["HS256"],
};
passport_1.default.use(new passport_jwt_1.Strategy(options, async (payload, done) => {
    try {
        const user = await (0, auth_service_1.findUserByIdService)(payload.userId);
        if (!user) {
            return done(null, false);
        }
        return done(null, user);
    }
    catch (error) {
        return done(null, false);
    }
}));
passport_1.default.serializeUser((user, done) => done(null, user));
passport_1.default.deserializeUser((user, done) => done(null, user));
exports.passportAuthenticateJWT = passport_1.default.authenticate("jwt", {
    session: false,
});
