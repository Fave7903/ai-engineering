import {
  Router,
} from 'express';

import * as authService
  from '../services/auth.service';

import { validate } from '../middleware/validate';
import { registerSchema, loginSchema, refreshSchema } from '../validators/auth.validator';

const router = Router();

// ─────────────────────────────────────────────
// POST /api/auth/register
// ─────────────────────────────────────────────
 
/** 
 * @swagger 
 * /auth/register: 
 *   post: 
 *     summary: Register a new user 
 *     tags: [Authentication] 
 *     requestBody: 
 *       required: true 
 *       content: 
 *         application/json: 
 *           schema: 
 *             type: object 
 *             required: [email, password] 
 *             properties: 
 *               email: 
 *                 type: string 
 *                 format: email 
 *                 example: student@example.com 
 *               password: 
 *                 type: string 
 *                 minLength: 8 
 *                 example: MyPassword123 
 *     responses: 
 *       201: 
 *         description: User created successfully 
 *       400: 
 *         description: Validation error 
 *       409: 
 *         description: Email already registered 
 */ 
router.post(
  '/register',
  validate(registerSchema),
  async (req, res, next) => {
    try {
      const user =
        await authService.register(
          req.body,
        );

      return res.status(201).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  },
);

// ─────────────────────────────────────────────
// POST /api/auth/login
// ─────────────────────────────────────────────

router.post(
  '/login',
  validate(loginSchema),
  async (req, res, next) => {
    try {
      const result =
        await authService.login({
          ...req.body,
          deviceInfo:
            req.headers['user-agent'],
        });

      return res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },
);

// ─────────────────────────────────────────────
// POST /api/auth/refresh
// ─────────────────────────────────────────────

router.post(
  '/refresh',
  validate(refreshSchema),
  async (req, res, next) => {
    try {
      const {
        refreshToken,
      } = req.body;

      const result =
        await authService.refresh(
          refreshToken,
        );

      return res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },
);

// ─────────────────────────────────────────────
// POST /api/auth/logout
// ─────────────────────────────────────────────

router.post(
  '/logout',
  validate(refreshSchema),
  async (req, res, next) => {
    try {
      const {
        refreshToken,
      } = req.body;

      await authService.logout(
        refreshToken,
      );

      return res.json({ success: true, message: 'Logged out' });
    } catch (error) {
      next(error);
    }
  },
);

export default router;