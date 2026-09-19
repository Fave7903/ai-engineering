import {
  Router,
} from 'express';

import * as authService
  from '../services/auth.service';

const router = Router();

// ─────────────────────────────────────────────
// POST /api/auth/register
// ─────────────────────────────────────────────

router.post(
  '/register',
  async (req, res, next) => {
    try {
      const user =
        await authService.register(
          req.body,
        );

      return res.status(201).json({
        user,
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
  async (req, res, next) => {
    try {
      const result =
        await authService.login({
          ...req.body,
          deviceInfo:
            req.headers['user-agent'],
        });

      return res.json(result);
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
  async (req, res, next) => {
    try {
      const {
        refreshToken,
      } = req.body;

      const result =
        await authService.refresh(
          refreshToken,
        );

      return res.json(result);
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
  async (req, res, next) => {
    try {
      const {
        refreshToken,
      } = req.body;

      await authService.logout(
        refreshToken,
      );

      return res.json({
        message: 'Logged out',
      });
    } catch (error) {
      next(error);
    }
  },
);

export default router;