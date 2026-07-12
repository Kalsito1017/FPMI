import { apiClient } from './client'
import type {
  CommunityPost,
  CommunityComment,
  CreatePostInput,
  CreateCommentInput,
  PaginatedResponse,
} from '@/types'

export async function fetchPosts(page = 1, limit = 20): Promise<PaginatedResponse<CommunityPost>> {
  const res = await apiClient.get<PaginatedResponse<CommunityPost>>('/community/posts', {
    params: { page, limit },
  })
  return res.data
}

export async function fetchPost(id: number): Promise<CommunityPost & { comments: CommunityComment[] }> {
  const res = await apiClient.get<CommunityPost & { comments: CommunityComment[] }>(
    `/community/posts/${id}`,
  )
  return res.data
}

export async function createPost(data: CreatePostInput): Promise<CommunityPost> {
  const res = await apiClient.post<CommunityPost>('/community/posts', data)
  return res.data
}

export async function updatePost(id: number, data: Partial<CreatePostInput>): Promise<CommunityPost> {
  const res = await apiClient.patch<CommunityPost>(`/community/posts/${id}`, data)
  return res.data
}

export async function deletePost(id: number): Promise<void> {
  await apiClient.delete(`/community/posts/${id}`)
}

export async function toggleLike(postId: number): Promise<{ liked: boolean }> {
  const res = await apiClient.post<{ liked: boolean }>(`/community/posts/${postId}/like`)
  return res.data
}

export async function createComment(data: CreateCommentInput): Promise<CommunityComment> {
  const res = await apiClient.post<CommunityComment>('/community/comments', data)
  return res.data
}

export async function updateComment(id: number, content: string): Promise<CommunityComment> {
  const res = await apiClient.patch<CommunityComment>(`/community/comments/${id}`, { content })
  return res.data
}

export async function deleteComment(id: number): Promise<void> {
  await apiClient.delete(`/community/comments/${id}`)
}
