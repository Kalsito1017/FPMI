import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CommunityService } from './community.service';

describe('CommunityService', () => {
  let service: CommunityService;
  let prisma: {
    communityPost: {
      findMany: jest.Mock;
      findUnique: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
      count: jest.Mock;
    };
    communityComment: {
      findUnique: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
    communityLike: {
      findUnique: jest.Mock;
      create: jest.Mock;
      delete: jest.Mock;
    };
  };

  const mockAuthor = { id: 1, name: 'Test User', avatar: null };
  const mockPost = {
    id: 1,
    title: 'Test Post',
    content: 'Test content',
    imageUrl: null,
    authorId: 1,
    author: mockAuthor,
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    updatedAt: new Date('2024-01-01T00:00:00.000Z'),
  };
  const mockComment = {
    id: 1,
    content: 'Test comment',
    postId: 1,
    authorId: 2,
    parentCommentId: null,
    author: { id: 2, name: 'Other User', avatar: null },
    createdAt: new Date('2024-01-02T00:00:00.000Z'),
    updatedAt: new Date('2024-01-02T00:00:00.000Z'),
  };

  beforeEach(async () => {
    prisma = {
      communityPost: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
      },
      communityComment: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      communityLike: {
        findUnique: jest.fn(),
        create: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommunityService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(CommunityService);
  });

  describe('findAllPosts', () => {
    it('returns paginated posts with likedByMe mapping when userId provided', async () => {
      prisma.communityPost.findMany.mockResolvedValue([
        {
          ...mockPost,
          _count: { comments: 3, likes: 5 },
          likes: [{ id: 1 }],
        },
      ]);
      prisma.communityPost.count.mockResolvedValue(10);

      const result = await service.findAllPosts({ page: 1, limit: 20 }, 1);

      expect(result.data[0].likedByMe).toBe(true);
      expect(result.meta.total).toBe(10);
      expect(result.meta.page).toBe(1);
      expect(result.meta.limit).toBe(20);
      expect(result.meta.totalPages).toBe(1);
    });

    it('returns likedByMe false when no likes found', async () => {
      prisma.communityPost.findMany.mockResolvedValue([
        {
          ...mockPost,
          _count: { comments: 0, likes: 0 },
          likes: [],
        },
      ]);
      prisma.communityPost.count.mockResolvedValue(1);

      const result = await service.findAllPosts({}, 1);

      expect(result.data[0].likedByMe).toBe(false);
    });

    it('returns likedByMe false when userId not provided (likes: false)', async () => {
      prisma.communityPost.findMany.mockResolvedValue([
        {
          ...mockPost,
          _count: { comments: 0, likes: 0 },
          likes: false,
        },
      ]);
      prisma.communityPost.count.mockResolvedValue(1);

      const result = await service.findAllPosts({});

      expect(result.data[0].likedByMe).toBe(false);
    });

    it('calculates skip from page correctly', async () => {
      prisma.communityPost.findMany.mockResolvedValue([]);
      prisma.communityPost.count.mockResolvedValue(0);

      await service.findAllPosts({ page: 3, limit: 10 });

      expect(prisma.communityPost.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 20, take: 10 }),
      );
    });
  });

  describe('findOnePost', () => {
    it('returns post with comments, replies, and likedByMe', async () => {
      prisma.communityPost.findUnique.mockResolvedValue({
        ...mockPost,
        _count: { comments: 1, likes: 2 },
        likes: [{ id: 1 }],
        comments: [
          {
            ...mockComment,
            replies: [],
          },
        ],
      });

      const result = await service.findOnePost(1, 1);

      expect(result.likedByMe).toBe(true);
      expect(result.comments).toHaveLength(1);
      expect(result).not.toHaveProperty('likes');
    });

    it('throws NotFoundException when post not found', async () => {
      prisma.communityPost.findUnique.mockResolvedValue(null);

      await expect(service.findOnePost(999, 1)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('createPost', () => {
    it('creates a post with author include', async () => {
      prisma.communityPost.create.mockResolvedValue(mockPost);

      const result = await service.createPost(
        { title: 'Test Post', content: 'Test content' },
        1,
      );

      expect(prisma.communityPost.create).toHaveBeenCalledWith({
        data: {
          title: 'Test Post',
          content: 'Test content',
          imageUrl: null,
          authorId: 1,
        },
        include: { author: { select: { id: true, name: true, avatar: true } } },
      });
      expect(result).toEqual(mockPost);
    });

    it('creates a post with imageUrl', async () => {
      prisma.communityPost.create.mockResolvedValue({
        ...mockPost,
        imageUrl: 'https://example.com/img.png',
      });

      await service.createPost(
        {
          title: 'Test Post',
          content: 'Test content',
          imageUrl: 'https://example.com/img.png',
        },
        1,
      );

      expect(prisma.communityPost.create).toHaveBeenCalledWith({
        data: {
          title: 'Test Post',
          content: 'Test content',
          imageUrl: 'https://example.com/img.png',
          authorId: 1,
        },
        include: { author: { select: { id: true, name: true, avatar: true } } },
      });
    });
  });

  describe('updatePost', () => {
    it('allows owner to update their post', async () => {
      prisma.communityPost.findUnique.mockResolvedValue(mockPost);
      const updated = { ...mockPost, title: 'Updated Title' };
      prisma.communityPost.update.mockResolvedValue(updated);

      const result = await service.updatePost(
        1,
        { title: 'Updated Title' },
        1,
        'STUDENT',
      );

      expect(result.title).toBe('Updated Title');
    });

    it('allows admin to update any post', async () => {
      prisma.communityPost.findUnique.mockResolvedValue({
        ...mockPost,
        authorId: 2,
      });
      const updated = { ...mockPost, title: 'Admin Edit' };
      prisma.communityPost.update.mockResolvedValue(updated);

      const result = await service.updatePost(
        1,
        { title: 'Admin Edit' },
        1,
        'ADMIN',
      );

      expect(result.title).toBe('Admin Edit');
    });

    it('allows moderator to update any post', async () => {
      prisma.communityPost.findUnique.mockResolvedValue({
        ...mockPost,
        authorId: 2,
      });
      const updated = { ...mockPost, title: 'Mod Edit' };
      prisma.communityPost.update.mockResolvedValue(updated);

      const result = await service.updatePost(
        1,
        { title: 'Mod Edit' },
        1,
        'MODERATOR',
      );

      expect(result.title).toBe('Mod Edit');
    });

    it('throws NotFoundException when post not found', async () => {
      prisma.communityPost.findUnique.mockResolvedValue(null);

      await expect(
        service.updatePost(999, { title: 'Nope' }, 1, 'STUDENT'),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws ForbiddenException when non-owner non-admin tries to update', async () => {
      prisma.communityPost.findUnique.mockResolvedValue({
        ...mockPost,
        authorId: 2,
      });

      await expect(
        service.updatePost(1, { title: 'Nope' }, 1, 'STUDENT'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('deletePost', () => {
    it('allows owner to delete their post', async () => {
      prisma.communityPost.findUnique.mockResolvedValue(mockPost);
      prisma.communityPost.delete.mockResolvedValue(mockPost);

      await service.deletePost(1, 1, 'STUDENT');

      expect(prisma.communityPost.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('allows admin to delete any post', async () => {
      prisma.communityPost.findUnique.mockResolvedValue({
        ...mockPost,
        authorId: 2,
      });
      prisma.communityPost.delete.mockResolvedValue(mockPost);

      await service.deletePost(1, 1, 'ADMIN');

      expect(prisma.communityPost.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('throws NotFoundException when post not found', async () => {
      prisma.communityPost.findUnique.mockResolvedValue(null);

      await expect(service.deletePost(999, 1, 'STUDENT')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('throws ForbiddenException when non-owner non-admin tries to delete', async () => {
      prisma.communityPost.findUnique.mockResolvedValue({
        ...mockPost,
        authorId: 2,
      });

      await expect(service.deletePost(1, 1, 'STUDENT')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('toggleLike', () => {
    it('creates like when none exists (likes the post)', async () => {
      prisma.communityPost.findUnique.mockResolvedValue(mockPost);
      prisma.communityLike.findUnique.mockResolvedValue(null);
      prisma.communityLike.create.mockResolvedValue({
        id: 1,
        postId: 1,
        userId: 1,
      });

      const result = await service.toggleLike(1, 1);

      expect(prisma.communityLike.create).toHaveBeenCalledWith({
        data: { postId: 1, userId: 1 },
      });
      expect(result).toEqual({ liked: true });
    });

    it('deletes like when already exists (unlikes the post)', async () => {
      prisma.communityPost.findUnique.mockResolvedValue(mockPost);
      prisma.communityLike.findUnique.mockResolvedValue({
        id: 5,
        postId: 1,
        userId: 1,
      });
      prisma.communityLike.delete.mockResolvedValue({});

      const result = await service.toggleLike(1, 1);

      expect(prisma.communityLike.delete).toHaveBeenCalledWith({
        where: { id: 5 },
      });
      expect(result).toEqual({ liked: false });
    });

    it('throws NotFoundException when post not found', async () => {
      prisma.communityPost.findUnique.mockResolvedValue(null);

      await expect(service.toggleLike(999, 1)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('createComment', () => {
    it('creates a top-level comment', async () => {
      prisma.communityPost.findUnique.mockResolvedValue(mockPost);
      prisma.communityComment.create.mockResolvedValue(mockComment);

      const result = await service.createComment(
        { content: 'Test comment', postId: 1 },
        2,
      );

      expect(prisma.communityComment.create).toHaveBeenCalledWith({
        data: {
          content: 'Test comment',
          postId: 1,
          parentCommentId: null,
          authorId: 2,
        },
        include: {
          author: { select: { id: true, name: true, avatar: true } },
        },
      });
      expect(result).toEqual(mockComment);
    });

    it('creates a reply comment with valid parent', async () => {
      prisma.communityPost.findUnique.mockResolvedValue(mockPost);
      prisma.communityComment.findUnique.mockResolvedValue({
        ...mockComment,
        postId: 1,
      });
      const replyComment = {
        ...mockComment,
        id: 2,
        parentCommentId: 1,
        content: 'Reply',
      };
      prisma.communityComment.create.mockResolvedValue(replyComment);

      await service.createComment(
        { content: 'Reply', postId: 1, parentCommentId: 1 },
        3,
      );

      expect(prisma.communityComment.create).toHaveBeenCalledWith({
        data: {
          content: 'Reply',
          postId: 1,
          parentCommentId: 1,
          authorId: 3,
        },
        include: {
          author: { select: { id: true, name: true, avatar: true } },
        },
      });
    });

    it('throws NotFoundException when post not found', async () => {
      prisma.communityPost.findUnique.mockResolvedValue(null);

      await expect(
        service.createComment({ content: 'Test', postId: 999 }, 1),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws NotFoundException when parent comment not found', async () => {
      prisma.communityPost.findUnique.mockResolvedValue(mockPost);
      prisma.communityComment.findUnique.mockResolvedValue(null);

      await expect(
        service.createComment(
          { content: 'Test', postId: 1, parentCommentId: 999 },
          1,
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws NotFoundException when parent comment belongs to different post', async () => {
      prisma.communityPost.findUnique.mockResolvedValue(mockPost);
      prisma.communityComment.findUnique.mockResolvedValue({
        ...mockComment,
        postId: 2,
      });

      await expect(
        service.createComment(
          { content: 'Test', postId: 1, parentCommentId: 1 },
          1,
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateComment', () => {
    it('allows owner to update their comment', async () => {
      prisma.communityComment.findUnique.mockResolvedValue(mockComment);
      const updated = { ...mockComment, content: 'Updated content' };
      prisma.communityComment.update.mockResolvedValue(updated);

      const result = await service.updateComment(
        1,
        { content: 'Updated content' },
        2,
        'STUDENT',
      );

      expect(prisma.communityComment.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { content: 'Updated content' },
        include: {
          author: { select: { id: true, name: true, avatar: true } },
        },
      });
      expect(result.content).toBe('Updated content');
    });

    it('allows admin to update any comment', async () => {
      prisma.communityComment.findUnique.mockResolvedValue({
        ...mockComment,
        authorId: 2,
      });
      const updated = { ...mockComment, content: 'Admin edit' };
      prisma.communityComment.update.mockResolvedValue(updated);

      const result = await service.updateComment(
        1,
        { content: 'Admin edit' },
        1,
        'ADMIN',
      );

      expect(result.content).toBe('Admin edit');
    });

    it('throws NotFoundException when comment not found', async () => {
      prisma.communityComment.findUnique.mockResolvedValue(null);

      await expect(
        service.updateComment(999, { content: 'Nope' }, 1, 'STUDENT'),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws ForbiddenException when non-owner non-admin tries to update', async () => {
      prisma.communityComment.findUnique.mockResolvedValue({
        ...mockComment,
        authorId: 2,
      });

      await expect(
        service.updateComment(1, { content: 'Nope' }, 1, 'STUDENT'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('deleteComment', () => {
    it('allows owner to delete their comment', async () => {
      prisma.communityComment.findUnique.mockResolvedValue(mockComment);
      prisma.communityComment.delete.mockResolvedValue(mockComment);

      await service.deleteComment(1, 2, 'STUDENT');

      expect(prisma.communityComment.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('allows admin to delete any comment', async () => {
      prisma.communityComment.findUnique.mockResolvedValue({
        ...mockComment,
        authorId: 2,
      });
      prisma.communityComment.delete.mockResolvedValue(mockComment);

      await service.deleteComment(1, 1, 'ADMIN');

      expect(prisma.communityComment.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('throws NotFoundException when comment not found', async () => {
      prisma.communityComment.findUnique.mockResolvedValue(null);

      await expect(service.deleteComment(999, 1, 'STUDENT')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('throws ForbiddenException when non-owner non-admin tries to delete', async () => {
      prisma.communityComment.findUnique.mockResolvedValue({
        ...mockComment,
        authorId: 2,
      });

      await expect(service.deleteComment(1, 1, 'STUDENT')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
