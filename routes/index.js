import express from 'express';
import AppController from '../controllers/AppController';

const router = express.Router();

router.route('/status').get(AppController.getStatus);
router.route('/stats').get(AppController.getStats);

export default router;
