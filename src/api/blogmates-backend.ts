import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { API_BASE_URL, ENDPOINTS } from "@/config";

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

// 🔹 Interfaces for API requests & responses
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
// 🔹 API Client with default settings
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 5000,
  withCredentials: true, // Important for sending cookies
});

// 🔄 Interceptor for Refreshing Tokens
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config;
    
    // Only handle 401 errors and if we haven't retried this request
    if (error.response?.status === 401 && originalRequest && !(originalRequest as CustomAxiosRequestConfig)._retry) {
      (originalRequest as CustomAxiosRequestConfig)._retry = true;

      try {
        // Try to refresh the token
        const response = await axios.post(`${API_BASE_URL}${ENDPOINTS.REFRESH_TOKEN}`, {}, { withCredentials: true });
        
        // If refresh successful, retry the original request
        if (response.status === 200) {
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // If refresh fails, clear tokens and redirect to login
        document.cookie = "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        document.cookie = "refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

// ✨ **Sign Up API**
export async function signUpApi(data: SignUpRequest): Promise<SignUpResponse> {
  const response = await apiClient.post<SignUpResponse>(ENDPOINTS.SIGN_UP, data);
  return response.data;
}

// ✨ **Login API**
export async function loginUser(data: LoginRequest): Promise<LoginResponse> {
  try {
    const response = await apiClient.post<LoginResponse>(ENDPOINTS.LOGIN, data);
    return response.data;
  } catch (error) {
    console.error("Login failed:", error);
    throw new Error("Invalid credentials or server error");
  }
}

// ✨ **Logout API**
export async function logoutUser(): Promise<LogoutResponse> {
  try {
    const response = await apiClient.post<LogoutResponse>(ENDPOINTS.LOGOUT);
    return response.data;
  } catch (error) {
    console.error("Logout failed:", error);
    throw new Error("Error logging out");
  }
}

// ✨ **Get User Data API**
export async function getUserData(): Promise<UserDataResponse> {
  try {
    const response = await apiClient.get<UserDataResponse>(ENDPOINTS.USER_DATA);
    return response.data;
  } catch (error) {
    console.error("Get user data failed:", error);
    throw new Error("Error getting user data");
  }
}

// ✨ **Get User Profile API**
export async function getUserProfile(username: string): Promise<UserDataResponse> {
  try {
    const response = await apiClient.post<UserDataResponse>(ENDPOINTS.USER_PROFILE, { username: username });
    return response.data;
  } catch (error) {
    console.error("Get user profile failed:", error);
    throw new Error("Error getting user profile");
  }
}

// ✨ **Get User Profile API by ID**
export async function getUserProfileById(id: number): Promise<UserDataResponse> {
  try {
    const response = await apiClient.get<UserDataResponse>(ENDPOINTS.USER_PROFILE, {
      params: { user_id: id }
    });
    return response.data;
  } catch (error) {
    console.error("Get user profile by ID failed:", error);
    throw new Error("Error getting user profile by ID");
  }
}

// ✨ **Update User Profile API**
export async function updateUserProfile(data: UpdateProfileRequest): Promise<UserDataResponse> {
  try {
    const response = await apiClient.patch<UserDataResponse>(ENDPOINTS.USER_PROFILE, data);
    return response.data;
  } catch (error) {
    console.error("Update user profile failed:", error);
    throw new Error("Error updating user profile");
  }
}

// ✨ **Refresh Token API**
export async function refreshToken(): Promise<void> {
  try {
    await apiClient.post(ENDPOINTS.REFRESH_TOKEN, {}, { withCredentials: true });
  } catch (error) {
    console.error("Token refresh failed:", error);
    throw error;
  }
}

// ✨ **Send follow request API**
export async function sendFollowRequest(id: number): Promise<void> {
  try {
    await apiClient.post(ENDPOINTS.SEND_FOLLOW_REQUEST, {
      receiver_id: id
    });
  } catch (error) {
    console.error("Send friend request failed:", error);
    throw new Error("Error sending friend request");
  }
}

// ✨ **Get pending friend requests API**
export async function getPendingFriendRequests(): Promise<PendingRequest[]> {
  try {
    const response = await apiClient.get<PendingRequest[]>(ENDPOINTS.PENDING_FOLLOW_REQUESTS);
    return response.data;
  } catch (error) {
    console.error("Get pending friend requests failed:", error);
    throw new Error("Error getting pending friend requests");
  }
}

// ✨ **Get pending sent friend requests API**
export async function getPendingSentFriendRequests(): Promise<PendingRequest[]> {
  try {
    const response = await apiClient.get<PendingRequest[]>(ENDPOINTS.PENDING_SENT_FOLLOW_REQUESTS);
    return response.data;
  } catch (error) {
    console.error("Get pending sent friend requests failed:", error);
    throw new Error("Error getting pending sent friend requests");
  }
}

// ✨ **Accept follow request API**
export async function acceptFollowRequest(id: number): Promise<void> {
  try {
    await apiClient.post(ENDPOINTS.ACCEPT_FOLLOW_REQUEST + id + "/");
  } catch (error) {
    console.error("Accept follow request failed:", error);
    throw new Error("Error accepting follow request");
  }
}

// ✨ **Decline follow request API**
export async function declineFollowRequest(id: number): Promise<void> {
  try {
    await apiClient.delete(ENDPOINTS.REMOVE_FOLLOW_REQUEST + id + "/");
  } catch (error) {
    console.error("Decline follow request failed:", error);
    throw new Error("Error declining follow request");
  }
}

// Unfollow user API
export async function unfollowUser(id: number): Promise<void> {
  try {
    await apiClient.delete(ENDPOINTS.UNFOLLOW_USER + id + "/");
  } catch (error) {
    console.error("Unfollow user failed:", error);
    throw new Error("Error unfollowing user");
  }
}
export async function getFollowers(): Promise<FollowData[]> {
  try {
    const response = await apiClient.get<FollowData[]>(ENDPOINTS.FOLLOWERS);
    return response.data;
  } catch (error) {
    console.error("Get followers failed:", error);
    throw new Error("Error getting followers");
  }
}

export async function getFollowing(): Promise<FollowData[]> {
  try {
    const response = await apiClient.get<FollowData[]>(ENDPOINTS.FOLLOWING);
    return response.data;
  } catch (error) {
    console.error("Get following failed:", error);
    throw new Error("Error getting following");
  }
}
