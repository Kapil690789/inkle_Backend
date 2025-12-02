import { Router } from 'express';
import { followUser, blockUser, adminDeletePost,likePost,promoteToAdmin,deleteUser } from '../controllers/user.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

// User Actions
router.post('/follow/:id', authenticate, followUser);
router.post('/block/:id', authenticate, blockUser);
router.post('/post/:id/like', authenticate, likePost);

// Admin Actions
router.delete('/admin/post/:id', authenticate, authorize(['ADMIN', 'OWNER']), adminDeletePost);
router.put('/owner/promote/:id', authenticate, authorize(['OWNER']), promoteToAdmin);
router.delete('/owner/user/:id', authenticate, authorize(['OWNER']), deleteUser);

export default router;