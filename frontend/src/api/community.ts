import { request } from "@/src/api/client";

export interface CommunityMe {
  nickname: string;
  is_premium: boolean;
  can_post: boolean;
  can_dm: boolean;
}

export interface CommunityPost {
  id: string;
  author_nickname: string;
  channel: string;
  content: string;
  created_at: string;
  replies: number;
  likes: number;
}

export interface CommunityThread {
  peer_nickname: string;
  last_message: string;
  last_at: string;
  unread: number;
}

export interface CommunityDM {
  id: string;
  participants: string[];
  from_nickname: string;
  to_nickname: string;
  text: string;
  created_at: string;
}

export interface CommunityStatsResponse {
  channels: Record<string, { posts_count: number; last_post_at?: string }>;
  total_posts: number;
}

export const communityApi = {
  me: () => request<CommunityMe>("/community/me"),
  setNickname: (nickname: string) =>
    request<{ ok: boolean; nickname: string }>("/community/nickname", {
      method: "POST",
      body: JSON.stringify({ nickname }),
    }),
  feed: (channel = "all") => request<CommunityPost[]>(`/community/feed?channel=${encodeURIComponent(channel)}`),
  stats: () => request<CommunityStatsResponse>("/community/stats"),
  createPost: (payload: { content: string; channel: string }) =>
    request<CommunityPost>("/community/posts", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  inbox: () => request<CommunityThread[]>("/community/dm/inbox"),
  thread: (peer: string) => request<CommunityDM[]>(`/community/dm/thread/${encodeURIComponent(peer)}`),
  sendDM: (peer: string, text: string) =>
    request<{ ok: boolean; message: CommunityDM }>(`/community/dm/thread/${encodeURIComponent(peer)}`, {
      method: "POST",
      body: JSON.stringify({ text }),
    }),
};
