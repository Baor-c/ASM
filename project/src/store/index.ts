import { reactive } from 'vue';
import { AppState, User, Post, Comment, AuthUser, Notification } from '../types';
import { generateId } from '../utils';

// Create reactive state stores
const users = reactive<User[]>([]);
const posts = reactive<Post[]>([]);
const comments = reactive<Comment[]>([]);
const appState = reactive<AppState>({
  currentPage: 'home',
  currentUser: null,
  selectedPost: null,
  selectedProfile: null,
  notifications: []
});

// Initialize store with sample data
export function initializeStore() {
  // Create sample users
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

  // Create sample posts
  posts.push({
    id: generateId(),
    title: 'The Future of AI Technology',
    content: 'Artificial Intelligence is transforming how we live and work. From smart assistants to autonomous vehicles, AI is becoming an integral part of our daily lives. What are your thoughts on the future of AI?',
    authorId: user1.id,
    imageUrl: 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=600',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000)
  });

  posts.push({
    id: generateId(),
    title: 'My Travel Experiences',
    content: 'Just got back from an amazing trip to Japan! The culture, food, and landscapes were breathtaking. I highly recommend visiting Kyoto during cherry blossom season. #Travel #Japan',
    authorId: user2.id,
    imageUrl: 'https://images.pexels.com/photos/1440476/pexels-photo-1440476.jpeg?auto=compress&cs=tinysrgb&w=600',
    createdAt: new Date()
  });

  // Create sample comments
  comments.push({
    id: generateId(),
    content: 'Great insights on AI! I think ethical considerations will be crucial as this technology advances.',
    postId: posts[0].id,
    authorId: user2.id,
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000)
  });

  comments.push({
    id: generateId(),
    content: 'Wow, Japan looks amazing! Did you visit Tokyo as well?',
    postId: posts[1].id,
    authorId: user1.id,
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000)
  });
}

// User functions
export function getUsers() {
  return users;
}

export function getUserById(id: string): User | undefined {
  return users.find(user => user.id === id);
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
  appState.currentPage = 'home';
  
  return { success: true, user: authUser };
}

export function loginUser(email: string, password: string) {
  const user = users.find(user => user.email === email && user.password === password);
  
  if (!user) {
    return { success: false, message: 'Invalid email or password' };
  }
  
  const { password: _, ...authUser } = user;
  appState.currentUser = authUser as AuthUser;
  appState.currentPage = 'home';
  
  return { success: true, user: authUser };
}

export function logoutUser() {
  appState.currentUser = null;
  appState.currentPage = 'home';
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
    appState.currentUser = {
      ...appState.currentUser,
      displayName,
      avatarUrl
    };
  }
  
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
  
  return { success: true, message: 'Password updated successfully' };
}

// Post functions
export function getPosts() {
  return posts.map(post => {
    const author = getAuthUser(post.authorId);
    const commentCount = comments.filter(c => c.postId === post.id).length;
    return { ...post, author, commentCount };
  }).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export function getPostsByUser(userId: string) {
  return posts
    .filter(post => post.authorId === userId)
    .map(post => {
      const author = getAuthUser(post.authorId);
      const commentCount = comments.filter(c => c.postId === post.id).length;
      return { ...post, author, commentCount };
    })
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export function getPostById(id: string) {
  const post = posts.find(post => post.id === id);
  if (!post) return null;
  
  const author = getAuthUser(post.authorId);
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
    createdAt: new Date()
  };
  
  posts.push(newPost);
  
  return { success: true, post: newPost };
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
  
  comments[commentIndex] = {
    ...comments[commentIndex],
    content,
    updatedAt: new Date()
  };
  
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
  
  comments.splice(commentIndex, 1);
  
  return { success: true };
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
  
  return notification;
}

export function removeNotification(id: string) {
  const index = appState.notifications.findIndex(notification => notification.id === id);
  if (index !== -1) {
    appState.notifications.splice(index, 1);
  }
}