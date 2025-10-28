/**
 * Type definitions for the authentication system
 */

export interface AuthConfig {
  deploymentMode: 'saas' | 'selfhost';
  baseURL: string;
  secret: string;
  appName: string;
  database: {
    url: string;
  };
  oauth?: {
    github?: {
      clientId: string;
      clientSecret: string;
    };
    google?: {
      clientId: string;
      clientSecret: string;
      accessType: string;
    };
  };
}

export interface AuthUser {
  id: string;
  email: string;
  username: string | null;
  fullName: string | null;
  avatarUrl: string | null;
  role: 'admin' | 'user';
  status: 'active' | 'disabled' | 'pending';
  githubId: string | null;
  googleId: string | null;
  linuxdoId: string | null;
  inviterId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthSession {
  user: AuthUser;
  session: {
    id: string;
    expiresAt: Date;
    token: string;
  };
}
