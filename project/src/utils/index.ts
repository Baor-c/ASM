// Generate a unique ID
export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Format date to a readable format
export function formatDate(date: Date): string {
  // If less than 24 hours ago, show relative time
  const now = new Date();
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
  
  if (diffInHours < 24) {
    if (diffInHours < 1) {
      const minutes = Math.round(diffInHours * 60);
      return `${minutes} phút trước`;
    } else {
      return `${Math.round(diffInHours)} giờ trước`;
    }
  }
  
  // Otherwise, show formatted date
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  });
}

// Truncate text with ellipsis
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

// Validate email format
export function isValidEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// Password validation (at least 8 chars, 1 letter, 1 number)
export function isValidPassword(password: string): boolean {
  return password.length >= 8 && 
         /[A-Za-z]/.test(password) && 
         /[0-9]/.test(password);
}

// Check if the user is logged in
export function isLoggedIn(currentUser: any): boolean {
  return !!currentUser;
}

// Create a debounce function for search inputs, etc.
export function debounce(fn: Function, ms = 300) {
  let timeoutId: ReturnType<typeof setTimeout>;
  return function(...args: any[]) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), ms);
  };
}