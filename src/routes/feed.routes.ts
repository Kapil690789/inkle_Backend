import { Router } from 'express';
import { createPost, getFeed } from '../controllers/feed.controller';
import { authenticate } from '../middlewares/auth.middleware';
const router = Router();
router.post('/post', authenticate, createPost);
router.get('/', authenticate, getFeed);
export default router;