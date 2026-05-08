// Mock role system
let currentRole = 'user'; // Can be: 'user', 'reader', 'admin'

export const setRole = (role) => {
  currentRole = role;
};

export const getRole = () => {
  return currentRole;
};

export const isUser = () => currentRole === 'user';
export const isReader = () => currentRole === 'reader';
export const isAdmin = () => currentRole === 'admin';
