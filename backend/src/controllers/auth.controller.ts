import { NextFunction, Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import { config } from "../config/app.config";
import { registerSchema, loginSchema } from "../validation/auth.validation";
import { HTTPSTATUS } from "../config/http.config";
import { registerUserService } from "../services/auth.service";
import passport from "passport";
import { signJwtToken } from "../utils/jwt";




export const googleLoginCallback = asyncHandler(
  async (req: Request, res: Response) => {
    const jwt = req.jwt
    const currentWorkspace = req.user?.currentWorkspace;

    if (!jwt) {
      return res.redirect(
        `${config.FRONTEND_GOOGLE_CALLBACK_URL}?status=failure`
      );
    }

  //   return res.redirect(
  //     `${config.FRONTEND_ORIGIN}/workspace/${currentWorkspace}`
  //   );
     return res.redirect(
  `${config.FRONTEND_GOOGLE_CALLBACK_URL}?status=success&access_token=${jwt}&current_workspace=${currentWorkspace}`
);
  }
   
);

export const registerUserController = asyncHandler(
  async (req: Request, res: Response) => {
    const body = registerSchema.parse({
      ...req.body,
    });

    await registerUserService(body);

    return res.status(HTTPSTATUS.CREATED).json({
      message: "User created successfully",
    });
  }
);

export const loginController = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    loginSchema.parse(req.body);
    passport.authenticate(
      "local",
      (
        err: Error | null,
        user: Express.User | false,
        info: { message: string } | undefined
      ) => {
        if (err) {
          return next(err);
        }

        if (!user) {
          return res.status(HTTPSTATUS.UNAUTHORIZED).json({
            message: info?.message || "Invalid email or password",
          });
        }

        // req.logIn(user, (err) => {
        //   if (err) {
        //     return next(err);
        //   }

        //   return res.status(HTTPSTATUS.OK).json({
        //     message: "Logged in successfully",
        //     user,
        //   });
        // });
        let access_token: string;
        try {
          access_token = signJwtToken({userId:user._id});
        } catch (jwtErr) {
          return next(jwtErr);
        }
        return res.status(HTTPSTATUS.OK).json({
            message: "Logged in successfully",
            access_token,
            user,
          });
      }
    )(req, res, next);
  }
);

// export const logOutController = asyncHandler(
//   async (req: Request, res: Response) => {
//     req.logout((err) => {
//       if (err) {
//         console.error("Logout error:", err);
//         return res
//           .status(HTTPSTATUS.INTERNAL_SERVER_ERROR)
//           .json({ error: "Failed to log out" });
//       }
//     });

//     req.session = null;
//     return res
//       .status(HTTPSTATUS.OK)
//       .json({ message: "Logged out successfully" });
//   }
// );

// export const logOutController = asyncHandler(
//   async (req: Request, res: Response) => {
//     // 1️⃣ إنهاء جلسة Passport
//     (req.logout as (callback: (err: any) => void) => void)((err) => {
//       if (err) {
//         console.error("Logout error:", err);
//         return res
//           .status(HTTPSTATUS.INTERNAL_SERVER_ERROR)
//           .json({ error: "Failed to log out" });
//       }

//       // 2️⃣ مسح الجلسة إذا موجودة
//       if (req.session) {
//         req.session.destroy((err) => {
//           if (err) {
//             console.error("Session destroy error:", err);
//             return res
//               .status(HTTPSTATUS.INTERNAL_SERVER_ERROR)
//               .json({ error: "Failed to destroy session" });
//           }

//           // 3️⃣ إرسال الرد النهائي
//           return res
//             .status(HTTPSTATUS.OK)
//             .json({ message: "Logged out successfully" });
//         });
//       } else {
//         // إذا لم تكن هناك جلسة
//         return res
//           .status(HTTPSTATUS.OK)
//           .json({ message: "Logged out successfully" });
//       }
//     });
//   }
// );
export const logOutController = asyncHandler(async (req: Request, res: Response) => {
  // في JWT stateless، فقط نعلم العميل أن يمسح التوكن
  return res.status(HTTPSTATUS.OK).json({ message: "Logged out successfully" });
});
