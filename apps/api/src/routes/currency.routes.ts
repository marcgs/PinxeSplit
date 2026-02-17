import { Router } from 'express';
import * as currencyController from '../controllers/currency.controller.js';

const router = Router();

/**
 * GET /api/v1/currencies
 * Get all currencies sorted alphabetically
 */
router.get('/', currencyController.getCurrencies);

export default router;
