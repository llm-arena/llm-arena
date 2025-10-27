# @lmring/auth

Authentication package for the lmring monorepo.

## Status

🚧 **Under Construction** - This package is a placeholder for future authentication implementation.

## Planned Features

- User authentication (sign-in, sign-out, sign-up)
- Session management
- Protected routes middleware
- Server-side and client-side auth utilities
- Integration with Supabase Auth or alternative providers

## Implementation Notes

When implementing this package, consider:

1. **Authentication Provider**: Better Auth, Auth.js, Supabase Auth, etc.
2. **Session Storage**: Cookies, JWT tokens, database sessions
3. **Integration**: Seamless integration with `@lmring/database` and `apps/web`
4. **Security**: Proper CSRF protection, secure cookie handling
5. **Type Safety**: Full TypeScript support with proper type exports

## Usage (Future)

```typescript
// Server-side
import { auth, getCurrentUser } from '@lmring/auth/server';

const session = await auth();
const user = await getCurrentUser();

// Client-side
import { useSession, useUser } from '@lmring/auth/client';

function MyComponent() {
  const session = useSession();
  const user = useUser();
  // ...
}

// Middleware
import { authMiddleware } from '@lmring/auth/middleware';

export default authMiddleware;
```

## Getting Started

When ready to implement:

1. Choose an authentication provider
2. Install required dependencies
3. Implement core authentication functions
4. Add session management
5. Create middleware for route protection
6. Add client-side hooks
7. Write tests
8. Update this README with actual usage examples

