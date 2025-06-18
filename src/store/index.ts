import { reactive } from 'vue';
import { AppState, User, Post, Comment, AuthUser, Notification, PostActivity, CommentActivity, LikeActivity } from '../types';
import { generateId } from '../utils';
import { saveAuthUser, getAuthUserFromStorage } from './auth';

// Create reactive state stores
const users = reactive<User[]>([]);
const posts = reactive<Post[]>([]);
const comments = reactive<Comment[]>([]);
const postActivities = reactive<PostActivity[]>([]);
const commentActivities = reactive<CommentActivity[]>([]);
const likeActivities = reactive<LikeActivity[]>([]);

const appState = reactive<AppState>({
  currentPage: 'home',
  currentUser: getAuthUserFromStorage(),
  selectedPost: null,
  selectedProfile: null,
  notifications: []
});

const USERS_KEY = 'users';
const POSTS_KEY = 'posts';
const COMMENTS_KEY = 'comments';
const POST_ACTIVITIES_KEY = 'post_activities';
const COMMENT_ACTIVITIES_KEY = 'comment_activities';
const LIKE_ACTIVITIES_KEY = 'like_activities';

function saveData() {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
  localStorage.setItem(COMMENTS_KEY, JSON.stringify(comments));
  localStorage.setItem(POST_ACTIVITIES_KEY, JSON.stringify(postActivities));
  localStorage.setItem(COMMENT_ACTIVITIES_KEY, JSON.stringify(commentActivities));
  localStorage.setItem(LIKE_ACTIVITIES_KEY, JSON.stringify(likeActivities));
}

function loadData() {
  const usersStr = localStorage.getItem(USERS_KEY);
  const postsStr = localStorage.getItem(POSTS_KEY);
  const commentsStr = localStorage.getItem(COMMENTS_KEY);
  const postActivitiesStr = localStorage.getItem(POST_ACTIVITIES_KEY);
  const commentActivitiesStr = localStorage.getItem(COMMENT_ACTIVITIES_KEY);
  const likeActivitiesStr = localStorage.getItem(LIKE_ACTIVITIES_KEY);

  if (usersStr) {
    const arr = JSON.parse(usersStr);
    arr.forEach(u => {
      if (u.createdAt) u.createdAt = new Date(u.createdAt);
    });
    users.splice(0, users.length, ...arr);
  }
  if (postsStr) {
    const arr = JSON.parse(postsStr);
    arr.forEach(p => {
      if (p.createdAt) p.createdAt = new Date(p.createdAt);
      if (p.updatedAt) p.updatedAt = new Date(p.updatedAt);
    });
    posts.splice(0, posts.length, ...arr);
  }
  if (commentsStr) {
    const arr = JSON.parse(commentsStr);
    arr.forEach(c => {
      if (c.createdAt) c.createdAt = new Date(c.createdAt);
      if (c.updatedAt) c.updatedAt = new Date(c.updatedAt);
    });
    comments.splice(0, comments.length, ...arr);
  }
  if (postActivitiesStr) {
    const arr = JSON.parse(postActivitiesStr);
    arr.forEach(a => {
      if (a.createdAt) a.createdAt = new Date(a.createdAt);
    });
    postActivities.splice(0, postActivities.length, ...arr);
  }
  if (commentActivitiesStr) {
    const arr = JSON.parse(commentActivitiesStr);
    arr.forEach(a => {
      if (a.createdAt) a.createdAt = new Date(a.createdAt);
    });
    commentActivities.splice(0, commentActivities.length, ...arr);
  }
  if (likeActivitiesStr) {
    const arr = JSON.parse(likeActivitiesStr);
    arr.forEach(a => {
      if (a.createdAt) a.createdAt = new Date(a.createdAt);
    });
    likeActivities.splice(0, likeActivities.length, ...arr);
  }
}

// Gọi loadData khi khởi động
loadData();

export function initializeStore() {
  const user1: User = {
    id: generateId(),
    displayName: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
    avatarUrl: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=300',
    createdAt: new Date()
  };

  const user2: User = {
    id: generateId(),
    displayName: 'Jane Smith',
    email: 'jane@example.com',
    password: 'password123',
    avatarUrl: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=300',
    createdAt: new Date()
  };

  users.push(user1, user2);
}

// Activity tracking functions
function addPostActivity(userId: string, postId: string, type: 'create' | 'update' | 'delete', postTitle: string, postContent: string) {
  const activity: PostActivity = {
    id: generateId(),
    userId,
    postId,
    type,
    createdAt: new Date(),
    postTitle,
    postContent
  };
  postActivities.push(activity);
}

function addCommentActivity(userId: string, commentId: string, postId: string, type: 'create' | 'update' | 'delete', commentContent: string, postTitle: string) {
  const activity: CommentActivity = {
    id: generateId(),
    userId,
    commentId,
    postId,
    type,
    createdAt: new Date(),
    commentContent,
    postTitle
  };
  commentActivities.push(activity);
}

function addLikeActivity(userId: string, postId: string, type: 'like' | 'unlike', postTitle: string, postAuthor: string) {
  const activity: LikeActivity = {
    id: generateId(),
    userId,
    postId,
    type,
    createdAt: new Date(),
    postTitle,
    postAuthor
  };
  likeActivities.push(activity);
}

// User functions
export function getUsers() {
  return users;
}

export function getUserById(id: string): User {
  const user = users.find(user => user.id === id);
  if (user) return user;
  return {
    id: 'unknown',
    displayName: 'Người dùng ẩn danh',
    email: 'unknown@example.com',
    password: '',
    avatarUrl: 'https://ui-avatars.com/api/?name=Unknown&background=random',
    createdAt: new Date()
  };
}

export function getAuthUser(id: string): AuthUser | null {
  const user = getUserById(id);
  if (!user) return null;
  const { password, ...authUser } = user;
  return authUser as AuthUser;
}

export function registerUser(displayName: string, email: string, password: string, avatarUrl: string = '') {
  // Check if email is already registered
  if (users.some(user => user.email === email)) {
    return { success: false, message: 'Email already registered' };
  }

  const newUser: User = {
    id: generateId(),
    displayName,
    email,
    password,
    avatarUrl: avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=random`,
    createdAt: new Date()
  };
  
  users.push(newUser);
  
  // Set current user (auto login after registration)
  const { password: _, ...authUser } = newUser;
  appState.currentUser = authUser as AuthUser;
  saveAuthUser(authUser as AuthUser);
  appState.currentPage = 'home';
  
  saveData();
  
  return { success: true, user: authUser };
}

export function loginUser(email: string, password: string) {
  const user = users.find(user => user.email === email && user.password === password);
  
  if (!user) {
    return { success: false, message: 'Invalid email or password' };
  }
  
  const { password: _, ...authUser } = user;
  appState.currentUser = authUser as AuthUser;
  saveAuthUser(authUser as AuthUser);
  appState.currentPage = 'home';
  
  saveData();
  
  return { success: true, user: authUser };
}

export function logoutUser() {
  appState.currentUser = null;
  saveAuthUser(null);
  appState.currentPage = 'home';
  
  saveData();
}

export function updateUserProfile(userId: string, displayName: string, avatarUrl: string) {
  const userIndex = users.findIndex(user => user.id === userId);
  
  if (userIndex === -1) {
    return { success: false, message: 'User not found' };
  }
  
  users[userIndex] = {
    ...users[userIndex],
    displayName,
    avatarUrl
  };
  
  // Update current user if it's the same user
  if (appState.currentUser && appState.currentUser.id === userId) {
    const updatedUser = {
      ...appState.currentUser,
      displayName,
      avatarUrl
    };
    appState.currentUser = updatedUser;
    saveAuthUser(updatedUser);
  }
  
  saveData();
  
  return { success: true, user: appState.currentUser };
}

export function updateUserPassword(userId: string, currentPassword: string, newPassword: string) {
  const userIndex = users.findIndex(user => user.id === userId);
  
  if (userIndex === -1) {
    return { success: false, message: 'User not found' };
  }
  
  if (users[userIndex].password !== currentPassword) {
    return { success: false, message: 'Current password is incorrect' };
  }
  
  users[userIndex].password = newPassword;
  
  saveData();
  
  return { success: true, message: 'Password updated successfully' };
}

// Post functions
function getValidAuthor(authorId: string): AuthUser {
  const user = getAuthUser(authorId);
  if (user) return user;
  return {
    id: 'unknown',
    displayName: 'Người dùng ẩn danh',
    avatarUrl: 'https://ui-avatars.com/api/?name=Unknown&background=random'
  };
}

export function getPosts() {
  return posts.map(post => {
    const author = getValidAuthor(post.authorId);
    const commentCount = comments.filter(c => c.postId === post.id).length;
    return { ...post, author, commentCount };
  }).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export function getPostsByUser(userId: string) {
  return posts
    .filter(post => post.authorId === userId)
    .map(post => {
      const author = getValidAuthor(post.authorId);
      const commentCount = comments.filter(c => c.postId === post.id).length;
      return { ...post, author, commentCount };
    })
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export function getPostById(id: string) {
  const post = posts.find(post => post.id === id);
  if (!post) return null;
  
  const author = getValidAuthor(post.authorId);
  const commentCount = comments.filter(c => c.postId === post.id).length;
  return { ...post, author, commentCount };
}

export function createPost(title: string, content: string, imageUrl: string | undefined, authorId: string) {
  if (!appState.currentUser) {
    return { success: false, message: 'You must be logged in to create a post' };
  }

  const newPost: Post = {
    id: generateId(),
    title,
    content,
    imageUrl,
    authorId,
    createdAt: new Date(),
    likes: []
  };
  
  posts.push(newPost);
  
  // Add activity tracking
  addPostActivity(authorId, newPost.id, 'create', title, content);
  
  // Trả về post kèm author đúng kiểu cho PostCard
  const author = getValidAuthor(authorId);
  const commentCount = comments.filter(c => c.postId === newPost.id).length;
  saveData();
  return { success: true, post: { ...newPost, author, commentCount } };
}

export function updatePost(postId: string, title: string, content: string, imageUrl?: string) {
  const postIndex = posts.findIndex(post => post.id === postId);
  
  if (postIndex === -1) {
    return { success: false, message: 'Post not found' };
  }
  
  if (!appState.currentUser || posts[postIndex].authorId !== appState.currentUser.id) {
    return { success: false, message: 'You can only edit your own posts' };
  }
  
  posts[postIndex] = {
    ...posts[postIndex],
    title,
    content,
    imageUrl,
    updatedAt: new Date()
  };
  
  // Add activity tracking
  addPostActivity(appState.currentUser.id, postId, 'update', title, content);
  
  saveData();
  
  return { success: true, post: posts[postIndex] };
}

export function deletePost(postId: string) {
  const postIndex = posts.findIndex(post => post.id === postId);
  
  if (postIndex === -1) {
    return { success: false, message: 'Post not found' };
  }
  
  if (!appState.currentUser || posts[postIndex].authorId !== appState.currentUser.id) {
    return { success: false, message: 'You can only delete your own posts' };
  }
  
  const post = posts[postIndex];
  
  // Add activity tracking before deletion
  addPostActivity(appState.currentUser.id, postId, 'delete', post.title, post.content);
  
  // Delete all comments associated with this post
  const postComments = comments.filter(comment => comment.postId === postId);
  postComments.forEach(comment => {
    const commentIndex = comments.findIndex(c => c.id === comment.id);
    if (commentIndex !== -1) {
      comments.splice(commentIndex, 1);
    }
  });
  
  // Delete the post
  posts.splice(postIndex, 1);
  
  saveData();
  
  return { success: true };
}

// Comment functions
export function getCommentsByPostId(postId: string) {
  return comments
    .filter(comment => comment.postId === postId)
    .map(comment => {
      const author = getAuthUser(comment.authorId);
      return { ...comment, author };
    })
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
}

export function addComment(postId: string, content: string, authorId: string) {
  if (!appState.currentUser) {
    return { success: false, message: 'You must be logged in to comment' };
  }

  const newComment: Comment = {
    id: generateId(),
    content,
    postId,
    authorId,
    createdAt: new Date()
  };
  
  comments.push(newComment);
  
  // Add activity tracking
  const post = getPostById(postId);
  const postTitle = post ? post.title : 'Bài viết không xác định';
  addCommentActivity(authorId, newComment.id, postId, 'create', content, postTitle);
  
  saveData();
  
  return { success: true, comment: newComment };
}

export function updateComment(commentId: string, content: string) {
  const commentIndex = comments.findIndex(comment => comment.id === commentId);
  
  if (commentIndex === -1) {
    return { success: false, message: 'Comment not found' };
  }
  
  if (!appState.currentUser || comments[commentIndex].authorId !== appState.currentUser.id) {
    return { success: false, message: 'You can only edit your own comments' };
  }
  
  const comment = comments[commentIndex];
  
  comments[commentIndex] = {
    ...comments[commentIndex],
    content,
    updatedAt: new Date()
  };
  
  // Add activity tracking
  const post = getPostById(comment.postId);
  const postTitle = post ? post.title : 'Bài viết không xác định';
  addCommentActivity(appState.currentUser.id, commentId, comment.postId, 'update', content, postTitle);
  
  saveData();
  
  return { success: true, comment: comments[commentIndex] };
}

export function deleteComment(commentId: string) {
  const commentIndex = comments.findIndex(comment => comment.id === commentId);
  
  if (commentIndex === -1) {
    return { success: false, message: 'Comment not found' };
  }
  
  if (!appState.currentUser || comments[commentIndex].authorId !== appState.currentUser.id) {
    return { success: false, message: 'You can only delete your own comments' };
  }
  
  const comment = comments[commentIndex];
  
  // Add activity tracking before deletion
  const post = getPostById(comment.postId);
  const postTitle = post ? post.title : 'Bài viết không xác định';
  addCommentActivity(appState.currentUser.id, commentId, comment.postId, 'delete', comment.content, postTitle);
  
  comments.splice(commentIndex, 1);
  
  saveData();
  
  return { success: true };
}

// Like functions
export function likePost(postId: string, userId: string) {
  const post = posts.find(p => p.id === postId);
  if (!post) return { success: false, message: 'Post not found' };
  if (!post.likes) post.likes = [];
  if (!post.likes.includes(userId)) {
    post.likes.push(userId);
    
    // Add activity tracking
    const author = getValidAuthor(post.authorId);
    addLikeActivity(userId, postId, 'like', post.title, author.displayName);
    
    saveData();
    return { success: true };
  }
  return { success: false, message: 'Already liked' };
}

export function unlikePost(postId: string, userId: string) {
  const post = posts.find(p => p.id === postId);
  if (!post || !post.likes) return { success: false, message: 'Post not found' };
  const idx = post.likes.indexOf(userId);
  if (idx !== -1) {
    post.likes.splice(idx, 1);
    
    // Add activity tracking
    const author = getValidAuthor(post.authorId);
    addLikeActivity(userId, postId, 'unlike', post.title, author.displayName);
    
    saveData();
    return { success: true };
  }
  return { success: false, message: 'Not liked yet' };
}

// History functions
export function getUserPostActivities(userId: string) {
  return postActivities
    .filter(activity => activity.userId === userId)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export function getUserCommentActivities(userId: string) {
  return commentActivities
    .filter(activity => activity.userId === userId)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export function getUserLikeActivities(userId: string) {
  return likeActivities
    .filter(activity => activity.userId === userId)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

// Application state functions
export function getAppState() {
  return appState;
}

export function navigateTo(page: AppState['currentPage'], params?: Record<string, string>) {
  appState.currentPage = page;
  
  if (params) {
    if (params.postId) {
      appState.selectedPost = params.postId;
    }
    
    if (params.userId) {
      appState.selectedProfile = params.userId;
    }
  }
}

// Notification functions
export function addNotification(message: string, type: Notification['type'] = 'info', autoHide: boolean = true) {
  const notification: Notification = {
    id: generateId(),
    message,
    type,
    autoHide
  };
  
  appState.notifications.push(notification);
  
  if (autoHide) {
    setTimeout(() => removeNotification(notification.id), 5000);
  }
  
  saveData();
  
  return notification;
}

export function removeNotification(id: string) {
  const index = appState.notifications.findIndex(notification => notification.id === id);
  if (index !== -1) {
    appState.notifications.splice(index, 1);
  }
  
  saveData();
}