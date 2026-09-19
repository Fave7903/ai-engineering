import {
  Router,
} from 'express';

import {
  authenticate,
} from '../middleware/auth';

const router = Router();

router.get(
  '/documents',
  authenticate,
  async (req, res) => {
    return res.json({
      message: 'You are authenticated',
      user: req.user,
    });
  },
);

export default router;