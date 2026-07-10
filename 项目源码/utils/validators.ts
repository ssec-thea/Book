/**
 * 验证邮箱格式
 */
export function validateEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

/**
 * 验证密码强度（至少6字符，包含字母和数字）
 */
export function validatePassword(password: string): string | null {
  if (!password || password.length < 6) {
    return 'Password must be at least 6 characters';
  }
  if (!/[a-zA-Z]/.test(password)) {
    return 'Password must contain at least one letter';
  }
  if (!/[0-9]/.test(password)) {
    return 'Password must contain at least one number';
  }
  return null; // valid
}

/**
 * 验证用户名（2-50字符）
 */
export function validateUsername(username: string): string | null {
  if (!username || username.length < 2) {
    return 'Username must be at least 2 characters';
  }
  if (username.length > 50) {
    return 'Username must be at most 50 characters';
  }
  return null; // valid
}
