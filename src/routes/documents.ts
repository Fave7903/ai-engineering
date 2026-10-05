import { Router } from 'express';
import { authenticate } from '../middleware/auth'; // Ensure this exists
import { validate } from '../middleware/validate';
import {
  createDocumentSchema,
  listDocumentsSchema,
  documentParamsSchema,
} from '../validators/document.validator';
import { requirePermission } from '../middleware/authorize';

const router = Router();

// Assuming you have an authenticate middleware protecting these routes
router.use(authenticate); 
/** 
 * @swagger 
 * /documents: 
 *   get: 
 *     summary: List user's documents 
 *     tags: [Documents] 
 *     security: 
 *       - bearerAuth: [] 
 *     parameters: 
 *       - in: query 
 *         name: page 
 *         schema: 
 *           type: integer 
 *           default: 1 
 *       - in: query 
 *         name: limit 
 *         schema: 
 *           type: integer 
 *           default: 20 
 *       - in: query 
 *         name: status 
 *         schema: 
 *           type: string 
 *           enum: [pending, processing, ready, failed] 
 *     responses: 
 *       200: 
 *         description: List of documents 
 *       401: 
 *         description: Not authenticated 
 */ 
router.get(
  '/',
  requirePermission('document:read'),
  validate(listDocumentsSchema),
  async (req, res, next) => {
    try {
      // const documents = await documentService.list(req.query);
      return res.json({
        success: true,
        data: [], // Replace with actual documents
      });
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  '/',
  requirePermission('document:create'),
  validate(createDocumentSchema),
  async (req, res, next) => {
    try {
      // const doc = await documentService.create(req.body);
      return res.status(201).json({
        success: true,
        data: {}, // Replace with actual created doc
      });
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  '/:id',
  requirePermission('document:read'),
  validate(documentParamsSchema),
  async (req, res, next) => {
    try {
      return res.json({
        success: true,
        data: {}, 
      });
    } catch (error) {
      next(error);
    }
  }
);

router.delete(
  '/:id',
  requirePermission('document:delete'),
  validate(documentParamsSchema),
  async (req, res, next) => {
    try {
      return res.json({
        success: true,
        data: { message: 'Document deleted' },
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;