import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { QueryPostsDto } from './dto/query-posts.dto';

@Injectable()
export class CommunityService {
  constructor(private prisma: PrismaService) {}

  async findAllPosts(query: QueryPostsDto, userId?: number) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      this.prisma.communityPost.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          author: {
            select: { id: true, name: true, avatar: true },
          },
          _count: {
            select: {
              comments: true,
              likes: true,
            },
          },
          likes: userId
            ? {
                where: { userId },
                select: { id: true },
                take: 1,
              }
            : false,
        },
      }),
      this.prisma.communityPost.count(),
    ]);

    const postsWithLiked = posts.map(({ likes, ...post }) => ({
      ...post,
      likedByMe: Array.isArray(likes) ? likes.length > 0 : false,
    }));

    return {
      data: postsWithLiked,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOnePost(id: number, userId?: number) {
    const post = await this.prisma.communityPost.findUnique({
      where: { id },
      include: {
        author: {
          select: { id: true, name: true, avatar: true },
        },
        _count: {
          select: { comments: true, likes: true },
        },
        likes: userId
          ? {
              where: { userId },
              select: { id: true },
              take: 1,
            }
          : false,
        comments: {
          where: { parentCommentId: null },
          orderBy: { createdAt: 'asc' },
          include: {
            author: {
              select: { id: true, name: true, avatar: true },
            },
            replies: {
              orderBy: { createdAt: 'asc' },
              include: {
                author: {
                  select: { id: true, name: true, avatar: true },
                },
              },
            },
          },
        },
      },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const { likes, ...rest } = post;
    return {
      ...rest,
      likedByMe: Array.isArray(likes) ? likes.length > 0 : false,
    };
  }

  async createPost(dto: CreatePostDto, userId: number) {
    return this.prisma.communityPost.create({
      data: {
        title: dto.title,
        content: dto.content,
        imageUrl: dto.imageUrl ?? null,
        authorId: userId,
      },
      include: {
        author: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });
  }

  async updatePost(id: number, dto: UpdatePostDto, userId: number, role: Role) {
    const post = await this.prisma.communityPost.findUnique({
      where: { id },
    });
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    if (post.authorId !== userId && role !== Role.MODERATOR && role !== Role.ADMIN) {
      throw new ForbiddenException('You can only edit your own posts');
    }
    return this.prisma.communityPost.update({
      where: { id },
      data: dto,
      include: {
        author: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });
  }

  async deletePost(id: number, userId: number, role: Role) {
    const post = await this.prisma.communityPost.findUnique({
      where: { id },
    });
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    if (post.authorId !== userId && role !== Role.MODERATOR && role !== Role.ADMIN) {
      throw new ForbiddenException('You can only delete your own posts');
    }
    await this.prisma.communityPost.delete({ where: { id } });
  }

  async toggleLike(postId: number, userId: number) {
    const post = await this.prisma.communityPost.findUnique({
      where: { id: postId },
    });
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    const existing = await this.prisma.communityLike.findUnique({
      where: { postId_userId: { postId, userId } },
    });
    if (existing) {
      await this.prisma.communityLike.delete({ where: { id: existing.id } });
      return { liked: false };
    }
    await this.prisma.communityLike.create({
      data: { postId, userId },
    });
    return { liked: true };
  }

  async createComment(dto: CreateCommentDto, userId: number) {
    const post = await this.prisma.communityPost.findUnique({
      where: { id: dto.postId },
    });
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    if (dto.parentCommentId) {
      const parent = await this.prisma.communityComment.findUnique({
        where: { id: dto.parentCommentId },
      });
      if (!parent || parent.postId !== dto.postId) {
        throw new NotFoundException('Parent comment not found');
      }
    }
    return this.prisma.communityComment.create({
      data: {
        content: dto.content,
        postId: dto.postId,
        parentCommentId: dto.parentCommentId ?? null,
        authorId: userId,
      },
      include: {
        author: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });
  }

  async updateComment(
    id: number,
    dto: UpdateCommentDto,
    userId: number,
    role: Role,
  ) {
    const comment = await this.prisma.communityComment.findUnique({
      where: { id },
    });
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }
    if (comment.authorId !== userId && role !== Role.MODERATOR && role !== Role.ADMIN) {
      throw new ForbiddenException('You can only edit your own comments');
    }
    return this.prisma.communityComment.update({
      where: { id },
      data: { content: dto.content },
      include: {
        author: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });
  }

  async deleteComment(id: number, userId: number, role: Role) {
    const comment = await this.prisma.communityComment.findUnique({
      where: { id },
    });
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }
    if (comment.authorId !== userId && role !== Role.MODERATOR && role !== Role.ADMIN) {
      throw new ForbiddenException('You can only delete your own comments');
    }
    await this.prisma.communityComment.delete({ where: { id } });
  }
}
