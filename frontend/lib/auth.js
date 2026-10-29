export const getTokenKey = () => 'auth_token';
export const getUserKey = () => 'auth_user';

export const getToken = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(getTokenKey());
};

export const setToken = (token) => {
  if (typeof window === 'undefined') return;
  const key = getTokenKey();
  localStorage.setItem(key, token);
  document.cookie = `${key}=${token}; path=/; max-age=86400; SameSite=Lax`;
};

export const removeToken = () => {
  if (typeof window === 'undefined') return;
  const tKey = getTokenKey();
  const uKey = getUserKey();
  localStorage.removeItem(tKey);
  localStorage.removeItem(uKey);
  document.cookie = `${tKey}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  window.dispatchEvent(new Event('auth_state_change'));
};

export const getUser = () => {
  if (typeof window === 'undefined') return null;
  const user = localStorage.getItem(getUserKey());
  return user ? JSON.parse(user) : null;
};

export const setUser = (user) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(getUserKey(), JSON.stringify(user));
  window.dispatchEvent(new Event('auth_state_change'));
};

export const isAdmin = () => {
  const user = getUser();
  if (!user) return false;
  const role = user.role?.toLowerCase();
  return role === 'admin' || role === 'staff' || role === 'role_admin' || role === 'role_staff';
};

export const logout = () => {
  removeToken();
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
};
