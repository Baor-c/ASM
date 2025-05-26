// User interfaces
export interface User {
  id: string;
  displayName: string;
  email: string;
  password: string; // In a real app, we would never store plain text passwords
  avatarUrl: string;
  createdAt: Date;
}

export interface AuthUser extends Omit<User, 'password'> {
  // Omit password for auth user
}

// Post interfaces
export interface Post {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  authorId: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface PostWithAuthor extends Post {
  author: AuthUser;
  commentCount: number;
}

// Comment interfaces
export interface Comment {
  id: string;
  content: string;
  postId: string;
  authorId: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface CommentWithAuthor extends Comment {
  author: AuthUser;
}

// Notification interface
export interface Notification {
  id: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'danger';
  autoHide?: boolean;
}

// Form interface
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  displayName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

// App State interface for managing page navigation
export type AppPage = 'home' | 'login' | 'register' | 'post-detail' | 'profile' | 'edit-profile' | 'create-post' | 'edit-post';

export interface AppState {
  currentPage: AppPage;
  currentUser: AuthUser | null;
  selectedPost: string | null;
  selectedProfile: string | null;
  notifications: Notification[];
}