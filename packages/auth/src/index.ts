/**
 * @lmring/auth - Authentication package
 * 
 * This package will contain authentication logic for the monorepo.
 * To be implemented with authentication providers like Better Auth, Auth.js, etc.
 */

// Export placeholder types for now
export type AuthUser = {
  id: string;
  email: string;
  name?: string;
};

export type AuthSession = {
  user: AuthUser;
  sessionId: string;
};

// Placeholder exports - to be implemented
export const auth = () => {
  throw new Error('Auth not implemented yet');
};

export const signIn = () => {
  throw new Error('SignIn not implemented yet');
};

export const signOut = () => {
  throw new Error('SignOut not implemented yet');
};

