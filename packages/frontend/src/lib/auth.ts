/**
 * Get authentication headers for API requests
 */
export function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('adminToken');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Basic ${token}`,
  };
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return !!localStorage.getItem('adminToken');
}

/**
 * Log out the user
 */
export function logout(): void {
  localStorage.removeItem('adminToken');
}
