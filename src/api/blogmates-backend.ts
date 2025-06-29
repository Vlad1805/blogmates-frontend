import axios from "axios";
import { API_BASE_URL, ENDPOINTS } from "@/config";


export interface SignUpRequest {
  username: string;
  email: string;
  password: string;
  password2: string;
}

export interface SignUpResponse {
  message: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
}

export interface LogoutResponse {
  message: string;
}

export interface UserDataResponse {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  follower_count: number;
  following_count: number;
  profile_picture: string;  // base64 encoded image data
  profile_picture_content_type: string;  // MIME type of the image
  friendship_status: string;
  biography: string;
}

interface UpdateProfileRequest {
  username?: string;
  first_name?: string;
  last_name?: string;
  profile_picture?: ArrayBuffer | Uint8Array;  // Binary data for the image
  profile_picture_content_type?: string;       // MIME type of the image
}

export interface PendingRequest {
  id: number;
  sender_id: number;
  sender_name: string;
  created_at: string;
}

export interface FollowData {
  id: number;
  username: string;
}

export enum PostVisibility {
  FRIENDS = 'friends',
  PUBLIC = 'public',
  JOURNAL = 'journal'
}

export interface CreatePostRequest {
  title: string;
  content: string;
  visibility: PostVisibility;
}

export interface CreatePostResponse {
  id: number;
  title: string;
  content: string;
  visibility: PostVisibility;
  author: number;
  author_name: string;
  created_at: string;
  updated_at: string;
}

export interface QueryPostResponse {
  count: number;
  total_pages: number;
  current_page: number;
  page_size: number;
  results: CreatePostResponse[];
}

export interface PostCommentRequest {
  content: string;
}

export interface PostCommentResponse {
  id: number;
  content: string;
  author: number;
  author_name: string;
  created_at: string;
  updated_at: string;
}

export interface QueryCommentResponse {
  count: number;
  total_pages: number;
  current_page: number;
  page_size: number;
  results: PostCommentResponse[];
}

export interface LikesResponse {
  id: number;
  user: number;
  created_at: string;
}

export interface SearchResponse {
  users: {
    count: number;
    total_pages: number;
    current_page: number;
    page_size: number;
    results: UserDataResponse[];
  }
  blog_entries: {
    count: number;
    total_pages: number;
    current_page: number;
    page_size: number;
    results: CreatePostResponse[];
  }
}

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 5000,
  withCredentials: true,
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && 
        originalRequest && 
        !originalRequest._retry && 
        !originalRequest.url?.includes(ENDPOINTS.REFRESH_TOKEN)) {
      originalRequest._retry = true;

      try {
        // Try to refresh the token
        await apiClient.post(ENDPOINTS.REFRESH_TOKEN, {}, { withCredentials: true });
        
        // If refresh successful, retry the original request
        return apiClient(originalRequest);
      } catch (refreshError) {
        // If refresh fails, redirect to login
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export async function signUpApi(data: SignUpRequest): Promise<SignUpResponse> {
  const response = await apiClient.post<SignUpResponse>(ENDPOINTS.SIGN_UP, data);
  return response.data;
}

export async function loginUser(data: LoginRequest): Promise<LoginResponse> {
  try {
    const response = await apiClient.post<LoginResponse>(ENDPOINTS.LOGIN, data);
    return response.data;
  } catch (error: any) {
    console.error("Login failed:", error);
    throw error;
  }
}

export async function logoutUser(): Promise<LogoutResponse> {
  try {
    const response = await apiClient.post<LogoutResponse>(ENDPOINTS.LOGOUT);
    return response.data;
  } catch (error: any) {
    console.error("Logout failed:", error);
    throw error;
  }
}

export async function getUserData(): Promise<UserDataResponse> {
  try {
    const response = await apiClient.get<UserDataResponse>(ENDPOINTS.USER_DATA);
    return response.data;
  } catch (error: any) {
    console.error("Get user data failed:", error);
    throw error;
  }
}

export async function getUserProfile(username: string): Promise<UserDataResponse> {
  try {
    const response = await apiClient.post<UserDataResponse>(ENDPOINTS.USER_PROFILE, { username: username });
    return response.data;
  } catch (error: any) {
    console.error("Get user profile failed:", error);
    throw error;
  }
}

export async function getUserProfileById(id: number): Promise<UserDataResponse> {
  try {
    const response = await apiClient.get<UserDataResponse>(ENDPOINTS.USER_PROFILE, {
      params: { user_id: id }
    });
    return response.data;
  } catch (error: any) {
    console.error("Get user profile by ID failed:", error);
    throw error;
  }
}

export async function updateUserProfile(data: UpdateProfileRequest): Promise<UserDataResponse> {
  try {
    const response = await apiClient.patch<UserDataResponse>(ENDPOINTS.USER_PROFILE, data);
    return response.data;
  } catch (error: any) {
    console.error("Update user profile failed:", error);
    throw error;
  }
}

export async function refreshToken(): Promise<void> {
  try {
    await apiClient.post(ENDPOINTS.REFRESH_TOKEN, {}, { withCredentials: true });
  } catch (error) {
    console.error("Token refresh failed:", error);
    throw error;
  }
}

export async function sendFollowRequest(id: number): Promise<void> {
  try {
    await apiClient.post(ENDPOINTS.SEND_FOLLOW_REQUEST, {
      receiver_id: id
    });
  } catch (error: any) {
    console.error("Send friend request failed:", error);
    throw error;
  }
}

export async function getPendingFriendRequests(): Promise<PendingRequest[]> {
  try {
    const response = await apiClient.get<PendingRequest[]>(ENDPOINTS.PENDING_FOLLOW_REQUESTS);
    return response.data;
  } catch (error: any) {
    console.error("Get pending friend requests failed:", error);
    throw error;
  }
}

export async function getPendingSentFriendRequests(): Promise<PendingRequest[]> {
  try {
    const response = await apiClient.get<PendingRequest[]>(ENDPOINTS.PENDING_SENT_FOLLOW_REQUESTS);
    return response.data;
  } catch (error: any) {
    console.error("Get pending sent friend requests failed:", error);
    throw error;
  }
}

export async function acceptFollowRequest(id: number): Promise<void> {
  try {
    await apiClient.post(ENDPOINTS.ACCEPT_FOLLOW_REQUEST + id + "/");
  } catch (error: any) {
    console.error("Accept follow request failed:", error);
    throw error;
  }
}

export async function declineFollowRequest(id: number): Promise<void> {
  try {
    await apiClient.delete(ENDPOINTS.REMOVE_FOLLOW_REQUEST + id + "/");
  } catch (error: any) {
    console.error("Decline follow request failed:", error);
    throw error;
  }
}

export async function unfollowUser(id: number): Promise<void> {
  try {
    await apiClient.delete(ENDPOINTS.UNFOLLOW_USER + id + "/");
  } catch (error: any) {
    console.error("Unfollow user failed:", error);
    throw error;
  }
}

export async function getFollowers(): Promise<FollowData[]> {
  try {
    const response = await apiClient.get<FollowData[]>(ENDPOINTS.FOLLOWERS);
    return response.data;
  } catch (error: any) {
    console.error("Get followers failed:", error);
    throw error;
  }
}

export async function getFollowing(): Promise<FollowData[]> {
  try {
    const response = await apiClient.get<FollowData[]>(ENDPOINTS.FOLLOWING);
    return response.data;
  } catch (error: any) {
    console.error("Get following failed:", error);
    throw error;
  }
}

export async function createPost(data: CreatePostRequest): Promise<CreatePostResponse> {
  try {
    const response = await apiClient.post<CreatePostResponse>(ENDPOINTS.CREATE_POST, data);
    return response.data;
  } catch (error: any) {
    console.error("Create post failed:", error);
    throw error; // Pass through the original error to preserve the server's message
  }
}

export async function getAllPosts(page: number = 1, page_size: number = 6): Promise<QueryPostResponse> {
  try {
    const response = await apiClient.get<QueryPostResponse>(ENDPOINTS.GET_ALL_POSTS, {
      params: {
        page,
        page_size
      }
    });
    return response.data;
  } catch (error: any) {
    console.error("Get all posts failed:", error);
    throw error;
  }
}

export async function getPostById(id: number): Promise<CreatePostResponse> {
  try {
    const response = await apiClient.get<CreatePostResponse>(ENDPOINTS.GET_POST_BY_ID + id + "/");
    return response.data;
  } catch (error: any) {
    console.error("Get post by id failed:", error);
    throw error;
  }
}

export async function deletePostById(id: number): Promise<void> {
  try {
    await apiClient.delete(ENDPOINTS.GET_POST_BY_ID + id + "/");
  } catch (error: any) {
    console.error("Delete post by id failed:", error);
    throw error;
  }
}

export async function getMyPosts(page: number = 1, page_size: number = 5): Promise<QueryPostResponse> {
  try {
    const response = await apiClient.get<QueryPostResponse>(ENDPOINTS.GET_MY_POSTS, {
      params: {
        page,
        page_size
      }
    });
    return response.data;
  } catch (error: any) {
    console.error("Get my posts failed:", error);
    throw error;
  }
}

export async function getUserPosts(username: string, page: number = 1, page_size: number = 5): Promise<QueryPostResponse> {
  try {
    const response = await apiClient.post<QueryPostResponse>(
      ENDPOINTS.GET_USER_POSTS,
      { username }, // send username in the body
      {
        params: {
          page,
          page_size
        }
      }
    );
    return response.data;
  } catch (error: any) {
    console.error("Get user posts failed:", error);
    throw error;
  }
}

export async function postComment(post_id: number, data: PostCommentRequest): Promise<PostCommentResponse> {
  try {
    const response = await apiClient.post<PostCommentResponse>(ENDPOINTS.POST_COMMENT + post_id + "/", data);
    return response.data;
  } catch (error: any) {
    console.error("Post comment failed:", error);
    throw error;
  }
}

export async function deleteComment(comment_id: number, post_id: number): Promise<void> {
  try {
    await apiClient.delete(ENDPOINTS.POST_COMMENT + post_id + "/" + comment_id + "/");
  } catch (error: any) {
    console.error("Delete comment failed:", error);
    throw error;
  }
}

export async function getComments(post_id: number, page: number = 1, page_size: number = 10): Promise<QueryCommentResponse> {
  try {
    const response = await apiClient.get<QueryCommentResponse>(ENDPOINTS.GET_COMMENTS + post_id + "/", {
      params: {
        page,
        page_size
      }
    });
    return response.data;
  } catch (error: any) {
    console.error("Get comments failed:", error);
    throw error;
  }
}

export async function getCommentsCount(post_id: number): Promise<{ comment_count: number }> {
  try {
    const response = await apiClient.get<{ comment_count: number }>(ENDPOINTS.GET_COMMENTS_COUNT + post_id + "/");
    return response.data;
  } catch (error: any) {
    console.error("Get comments count failed:", error);
    throw error;
  }
}

export async function postLikeComment(comment_id: number): Promise<void> {
  try {
    await apiClient.post(ENDPOINTS.POST_LIKE_COMMENT + comment_id + "/");
  } catch (error: any) {
    console.error("Post like comment failed:", error);
    throw error;
  }
}

export async function deleteLikeComment(comment_id: number): Promise<void> {
  try {
    await apiClient.delete(ENDPOINTS.POST_LIKE_COMMENT + comment_id + "/");
  } catch (error: any) {
    console.error("Delete like comment failed:", error);
    throw error;
  }
}

export async function getCommentLikes(comment_id: number): Promise<LikesResponse[]> {
  try {
    const response = await apiClient.get<LikesResponse[]>(ENDPOINTS.GET_COMMENT_LIKES + comment_id + "/");
    return response.data;
  } catch (error: any) {
    console.error("Get comment likes failed:", error);
    throw error;
  }
}

export async function getCommentLikesCount(comment_id: number): Promise<number> {
  try {
    const response = await apiClient.get<number>(ENDPOINTS.GET_COMMENT_LIKES_COUNT + comment_id + "/");
    return response.data;
  } catch (error: any) {
    console.error("Get comment likes count failed:", error);
    throw error;
  }
}

export async function postBlogLike(post_id: number): Promise<void> {
  try {
    await apiClient.post(ENDPOINTS.POST_BLOG_LIKE + post_id + "/");
  } catch (error: any) {
    console.error("Post blog like failed:", error);
    throw error;
  }
}

export async function deleteBlogLike(post_id: number): Promise<void> {
  try {
    await apiClient.delete(ENDPOINTS.POST_BLOG_LIKE + post_id + "/");
  } catch (error: any) {
    console.error("Delete blog like failed:", error);
    throw error;
  }
}

export async function getBlogLikes(post_id: number): Promise<LikesResponse[]> {
  try {
    const response = await apiClient.get<LikesResponse[]>(ENDPOINTS.GET_BLOG_LIKES + post_id + "/");
    return response.data;
  } catch (error: any) {
    console.error("Get blog likes failed:", error);
    throw error;
  }
}

export async function getBlogLikesCount(post_id: number): Promise<number> {
  try {
    const response = await apiClient.get<number>(ENDPOINTS.GET_BLOG_LIKES_COUNT + post_id + "/");
    return response.data;
  } catch (error: any) {
    console.error("Get blog likes count failed:", error);
    throw error;
  }
}

export async function search(q: string, users_page: number = 1, users_page_size: number = 6, blog_entries_page: number = 1, blog_entries_page_size: number = 1): Promise<SearchResponse> {
  try {
    const response = await apiClient.get<SearchResponse>(ENDPOINTS.SEARCH, {
      params: {
        q,
        user_page: users_page,
        user_page_size: users_page_size,
        blog_page: blog_entries_page,
        blog_page_size: blog_entries_page_size
      }
    });
    return response.data;
  } catch (error: any) {
    console.error("Search failed:", error);
    throw error;
  }
}