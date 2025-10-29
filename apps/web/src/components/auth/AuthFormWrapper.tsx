/**
 * Wrapper component that determines whether to show OAuth buttons
 * based on deployment mode and OAuth credentials availability
 */

'use client';

import { env } from '@lmring/env';
import { SignInForm } from './SignInForm';
import { SignUpForm } from './SignUpForm';

interface AuthFormWrapperProps {
  type: 'signin' | 'signup';
  callbackUrl?: string;
}

export function AuthFormWrapper({ type, callbackUrl }: AuthFormWrapperProps) {
  // Check if we're in SaaS mode - OAuth is only available in SaaS mode
  const showOAuth = env.NEXT_PUBLIC_DEPLOYMENT_MODE === 'saas';

  if (type === 'signin') {
    return <SignInForm callbackUrl={callbackUrl} showOAuth={showOAuth} />;
  }

  return <SignUpForm callbackUrl={callbackUrl} showOAuth={showOAuth} />;
}
