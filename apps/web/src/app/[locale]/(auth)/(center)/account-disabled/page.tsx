import type { Metadata } from 'next';
import Link from 'next/link';
import { setRequestLocale } from 'next-intl/server';

type IAccountDisabledPageProps = {
  params: Promise<{ locale: string }>;
};

export const metadata: Metadata = {
  title: 'Account Disabled',
  description: 'Your account has been disabled',
};

export default async function AccountDisabledPage(props: IAccountDisabledPageProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  return (
    <div className="w-full max-w-md space-y-8">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
          <svg
            className="h-8 w-8 text-destructive"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Account Disabled</h1>
        <p className="mt-4 text-muted-foreground">
          Your account has been disabled by an administrator.
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          If you believe this is an error, please contact support.
        </p>
      </div>

      <div className="space-y-4">
        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="mb-2 font-semibold">What does this mean?</h2>
          <p className="text-sm text-muted-foreground">
            Your account has been temporarily or permanently disabled. You will not be able to
            access protected areas of the application until your account is reactivated.
          </p>
        </div>

        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="mb-2 font-semibold">Need help?</h2>
          <p className="text-sm text-muted-foreground">
            Contact our support team for assistance with your account status.
          </p>
        </div>
      </div>

      <div className="text-center">
        <Link
          href={`/${locale}`}
          className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Return to home
        </Link>
      </div>
    </div>
  );
}
