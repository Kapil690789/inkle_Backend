import { Response } from 'express';
import prisma from '../config/db';
import { AuthRequest } from '../middlewares/auth.middleware';

export const followUser = async (req: AuthRequest, res: Response) => {
  const targetId = Number(req.params.id);
  
  await prisma.follow.create({
    data: { followerId: req.user.id, followingId: targetId }
  });

  // Log Activity
  const target = await prisma.user.findUnique({ where: { id: targetId } });
  await prisma.activityLog.create({
    data: {
      actorId: req.user.id,
      actionType: 'FOLLOW',
      targetId: targetId,
      metadata: `${req.user.name} followed ${target?.name}`
    }
  });

  res.json({ message: 'Followed successfully' });
};

export const blockUser = async (req: AuthRequest, res: Response) => {
  const targetId = Number(req.params.id);
  
  await prisma.block.create({
    data: { blockerId: req.user.id, blockedId: targetId }
  });
  
  res.json({ message: 'User blocked. You will no longer see their activities.' });
};

// ADMIN ONLY
export const adminDeletePost = async (req: AuthRequest, res: Response) => {
  const postId = Number(req.params.id);
  await prisma.post.delete({ where: { id: postId } });
  
  // Log Admin Action
  await prisma.activityLog.create({
    data: {
      actorId: req.user.id,
      actionType: 'POST', 
      metadata: `Admin ${req.user.name} deleted a post`
    }
  });

  res.json({ message: 'Post deleted by admin' });
};

export const likePost = async (req: AuthRequest, res: Response) => {
    const postId = Number(req.params.id);
    const userId = req.user.id;
  
    // Check if already liked to prevent duplicates
    const existingLike = await prisma.like.findUnique({
      where: { userId_postId: { userId, postId } }
    });
  
    if (existingLike) {
      return res.status(400).json({ message: "You already liked this post" });
    }
  
    await prisma.like.create({ data: { userId, postId } });
  
    // Log Activity
    const post = await prisma.post.findUnique({ where: { id: postId }, include: { author: true } });
    
    await prisma.activityLog.create({
      data: {
        actorId: userId,
        actionType: 'LIKE', // Ensure 'LIKE' is in your Prisma Enum ActionType
        targetId: postId,
        metadata: `${req.user.name} liked ${post?.author.name}'s post`
      }
    });
  
    res.json({ message: "Post liked successfully" });
  };

  export const promoteToAdmin = async (req: AuthRequest, res: Response) => {
    const targetUserId = Number(req.params.id);
    
    await prisma.user.update({
      where: { id: targetUserId },
      data: { role: 'ADMIN' }
    });
  
    res.json({ message: "User promoted to Admin successfully" });
  };
  
  // 2. Delete a User Profile (Requirement: "User deleted by Owner")
  export const deleteUser = async (req: AuthRequest, res: Response) => {
    const targetUserId = Number(req.params.id);
  
    // Prevent deleting yourself
    if (targetUserId === req.user.id) {
      return res.status(400).json({ error: "You cannot delete yourself" });
    }
  
    await prisma.user.delete({
      where: { id: targetUserId }
    });
  
    // Log this major action
    await prisma.activityLog.create({
      data: {
        actorId: req.user.id,
        actionType: 'POST', // Using generic type for simplicity
        metadata: `Owner ${req.user.name} deleted a user profile`
      }
    });
  
    res.json({ message: "User profile deleted by Owner" });
  };