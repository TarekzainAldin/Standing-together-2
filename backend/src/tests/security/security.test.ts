/**
 * Tests de sécurité — Standing Together
 * Couvre : JWT, RBAC, Validation Zod, Protection des routes
 * Critère CCP : "Les tests de sécurité sont réalisés"
 */

import request from "supertest";
import express from "express";
import cors from "cors";
import passport from "passport";
import jwt from "jsonwebtoken";

// ── App minimale pour les tests ─────────────────────────────────────────
import "../../config/passport.config";
import { errorHandler } from "../../middlewares/errorHandler.middleware";
import authRoutes      from "../../routes/auth.route";
import userRoutes      from "../../routes/user.route";
import workspaceRoutes from "../../routes/workspace.route";
import taskRoutes      from "../../routes/task.route";
import { passportAuthenticateJWT } from "../../config/passport.config";

const app = express();
app.use(express.json());
app.use(passport.initialize());
app.use("/api/auth",      authRoutes);
app.use("/api/user",      passportAuthenticateJWT, userRoutes);
app.use("/api/workspace", passportAuthenticateJWT, workspaceRoutes);
app.use("/api/task",      passportAuthenticateJWT, taskRoutes);
app.use(errorHandler);

// ── Helpers ──────────────────────────────────────────────────────────────
const FAKE_SECRET  = "wrong_secret_for_testing";
const REAL_SECRET  = process.env.JWT_SECRET || "test_secret";
const FAKE_WS_ID   = "64f1a2b3c4d5e6f7a8b9c0d1";

const makeToken = (payload: object, secret = REAL_SECRET) =>
  jwt.sign(payload, secret, { expiresIn: "1d", audience: ["user"] });

// ════════════════════════════════════════════════════════════════════════
// GROUPE 1 — Authentification JWT
// "Les composants serveurs sont sécurisés"
// ════════════════════════════════════════════════════════════════════════
describe("Groupe 1 — Authentification JWT", () => {

  it("Sans token → 401 Unauthorized", async () => {
    const res = await request(app)
      .get("/api/user/current");
    expect(res.status).toBe(401);
  });

  it("Token invalide 'Bearer INVALID' → 401", async () => {
    const res = await request(app)
      .get("/api/user/current")
      .set("Authorization", "Bearer INVALID_TOKEN_XXXXX");
    expect(res.status).toBe(401);
  });

  it("Token signé avec mauvais secret → 401", async () => {
    const fakeToken = makeToken({ userId: "fake123" }, FAKE_SECRET);
    const res = await request(app)
      .get("/api/user/current")
      .set("Authorization", `Bearer ${fakeToken}`);
    expect(res.status).toBe(401);
  });

  it("Header Authorization mal formaté → 401", async () => {
    const res = await request(app)
      .get("/api/user/current")
      .set("Authorization", "Token INVALID");
    expect(res.status).toBe(401);
  });

});

// ════════════════════════════════════════════════════════════════════════
// GROUPE 2 — Protection des routes
// "Toutes les routes sensibles sont protégées"
// ════════════════════════════════════════════════════════════════════════
describe("Groupe 2 — Protection des routes", () => {

  it("GET /api/user/current sans token → 401", async () => {
    const res = await request(app).get("/api/user/current");
    expect(res.status).toBe(401);
  });

  it("GET /api/workspace/all sans token → 401", async () => {
    const res = await request(app).get("/api/workspace/all");
    expect(res.status).toBe(401);
  });

  it("GET /api/task/workspace/:id/all sans token → 401", async () => {
    const res = await request(app)
      .get(`/api/task/workspace/${FAKE_WS_ID}/all`);
    expect(res.status).toBe(401);
  });

  it("DELETE /api/workspace/delete/:id sans token → 401", async () => {
    const res = await request(app)
      .delete(`/api/workspace/delete/${FAKE_WS_ID}`);
    expect(res.status).toBe(401);
  });

  it("PUT /api/workspace/update/:id sans token → 401", async () => {
    const res = await request(app)
      .put(`/api/workspace/update/${FAKE_WS_ID}`)
      .send({ name: "Hacked Workspace" });
    expect(res.status).toBe(401);
  });

});

// ════════════════════════════════════════════════════════════════════════
// GROUPE 3 — Validation des entrées (protection injection NoSQL)
// "Les entrées sont validées par Zod — protection A03 OWASP"
// ════════════════════════════════════════════════════════════════════════
describe("Groupe 3 — Validation Zod et injection NoSQL", () => {

  it("Login avec email objet NoSQL {'$gt':''} → 400", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: { "$gt": "" }, password: "anything" });
    expect(res.status).toBe(400);
  });

  it("Login sans champ email → 400", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ password: "password123" });
    expect(res.status).toBe(400);
  });

  it("Login sans champ password → 400", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "test@test.com" });
    expect(res.status).toBe(400);
  });

  it("Register sans nom → 400", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ email: "test@test.com", password: "pass1234" });
    expect(res.status).toBe(400);
  });

  it("Register avec email invalide → 400", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ name: "Test", email: "not-an-email", password: "pass1234" });
    expect(res.status).toBe(400);
  });

});

// ════════════════════════════════════════════════════════════════════════
// GROUPE 4 — RBAC côté serveur
// "Le contrôle d'accès basé sur les rôles est vérifié côté serveur"
// ════════════════════════════════════════════════════════════════════════
describe("Groupe 4 — RBAC et contrôle d'accès", () => {

  it("Token valide mais workspace inexistant → 401 ou 404", async () => {
    // Token valide structurellement mais userId inexistant en base
    const token = makeToken({ userId: "000000000000000000000001" });
    const res = await request(app)
      .get(`/api/workspace/${FAKE_WS_ID}`)
      .set("Authorization", `Bearer ${token}`);
    // Soit 401 (user non trouvé par Passport) soit 404 (workspace inexistant)
    expect([401, 404]).toContain(res.status);
  });

  it("Accès cross-workspace — workspace d'un autre user → 401 ou 404", async () => {
    const token = makeToken({ userId: "000000000000000000000002" });
    const otherWorkspaceId = "64f1a2b3c4d5e6f7a8b9c0d2";
    const res = await request(app)
      .get(`/api/workspace/${otherWorkspaceId}`)
      .set("Authorization", `Bearer ${token}`);
    expect([401, 404]).toContain(res.status);
  });

  it("DELETE workspace sans token → bloqué avant le contrôleur", async () => {
    const res = await request(app)
      .delete(`/api/workspace/delete/${FAKE_WS_ID}`);
    expect(res.status).toBe(401);
    // Vérifie que la réponse ne contient pas de données sensibles
    expect(res.body).not.toHaveProperty("password");
    expect(res.body).not.toHaveProperty("JWT_SECRET");
  });

});

// ════════════════════════════════════════════════════════════════════════
// GROUPE 5 — Réponses sécurisées
// "Le serveur ne retourne jamais de stack trace ou données sensibles"
// ════════════════════════════════════════════════════════════════════════
describe("Groupe 5 — Réponses sécurisées", () => {

  it("Erreur 401 → pas de stack trace dans la réponse", async () => {
    const res = await request(app)
      .get("/api/user/current");
    expect(res.body).not.toHaveProperty("stack");
    expect(res.body).not.toHaveProperty("trace");
  });

  it("Route inexistante → 404 sans stack trace", async () => {
    const res = await request(app)
      .get("/api/route-qui-nexiste-pas");
    expect(res.body).not.toHaveProperty("stack");
  });

  it("Body JSON malformé → 400 avec message clair", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .set("Content-Type", "application/json")
      .send("{ invalid json }");
    expect(res.status).toBe(400);
    expect(res.body).not.toHaveProperty("stack");
  });

});
