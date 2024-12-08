import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/dashboard", authMiddleware, (req, res) => {
  res.json({ message: `Welcome to the dashboard, ${req.user.email}` });
});

export default router;
