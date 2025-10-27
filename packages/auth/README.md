# @model-arena/auth

Authentication package for the model-arena monorepo.

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
3. **Integration**: Seamless integration with `@model-arena/database` and `apps/web`
4. **Security**: Proper CSRF protection, secure cookie handling
5. **Type Safety**: Full TypeScript support with proper type exports

## Usage (Future)

```typescript
// Server-side
import { auth, getCurrentUser } from '@model-arena/auth/server';

const session = await auth();
const user = await getCurrentUser();

// Client-side
import { useSession, useUser } from '@model-arena/auth/client';

function MyComponent() {
  const session = useSession();
  const user = useUser();
  // ...
}

// Middleware
import { authMiddleware } from '@model-arena/auth/middleware';

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

