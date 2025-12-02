import { Response } from 'express';
import prisma from '../config/db';
import { AuthRequest } from '../middlewares/auth.middleware';

// Post something
export const createPost = async (req: AuthRequest, res: Response) => {
  const { content } = req.body;
  
  const post = await prisma.post.create({
    data: { content, authorId: req.user.id }
  });

  // Log to Activity Wall
  await prisma.activityLog.create({
    data: {
      actorId: req.user.id,
      actionType: 'POST',
      targetId: post.id,
      metadata: `${req.user.name} posted: "${content.substring(0, 20)}..."`
    }
  });

  res.json(post);
};

// The Complex "Activity Wall" Logic
export const getFeed = async (req: AuthRequest, res: Response) => {
  const currentUserId = req.user.id;

  // 1. Get IDs of users who have blocked ME
  const blockedBy = await prisma.block.findMany({
    where: { blockedId: currentUserId },
    select: { blockerId: true }
  });
  const blockerIds = blockedBy.map(b => b.blockerId);

  // 2. Get IDs of users I have blocked (Optional: usually .. don't want to see them either)
  const blocking = await prisma.block.findMany({
    where: { blockerId: currentUserId },
    select: { blockedId: true }
  });
  const blockingIds = blocking.map(b => b.blockedId);

  const excludedIds = [...blockerIds, ...blockingIds];

  // 3. Fetch logs, filtering out blocked users
  const feed = await prisma.activityLog.findMany({
    where: {
      actorId: { notIn: excludedIds }
    },
    orderBy: { createdAt: 'desc' },
    take: 50, // Pagination limit (Performance optimization)
    include: {
      actor: {
        select: { id: true, name: true, role: true }
      }
    }
  });

  res.json(feed);
};