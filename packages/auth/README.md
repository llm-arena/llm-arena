# @lmring/auth

Authentication package for LMRing using Better-Auth.

## Features

- Email/Password authentication
- OAuth (GitHub, Google) in SaaS mode
- Session management & account linking
- Type-safe API with error handling

## Required Environment Variables

- `DEPLOYMENT_MODE` - `saas` or `selfhost`
- `BETTER_AUTH_SECRET` - Min 32 characters
- `BETTER_AUTH_URL` - Your app URL
- `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` - For GitHub OAuth (SaaS only)
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` - For Google OAuth (SaaS only)

OAuth callback: `{BETTER_AUTH_URL}/api/auth/callback/{provider}`
