'use client';

// Shim for react-router-dom that provides Next.js equivalents
// This is used by Next.js module aliasing so existing components
// don't need to be rewritten

import NextLink from 'next/link';
import { forwardRef, useEffect, Suspense } from 'react';
import {
  useRouter as useNextRouter,
  usePathname,
  useSearchParams as useNextSearchParams,
  useParams as useNextParams,
} from 'next/navigation';

// useNavigate
export function useNavigate() {
  const router = useNextRouter();
  return (path, options) => {
    if (typeof path === 'number') {
      if (path === -1) router.back();
      else router.forward();
    } else {
      if (options?.replace) {
        router.replace(path);
      } else {
        router.push(path);
      }
    }
  };
}

// useParams
export function useParams() {
  return useNextParams();
}

// useLocation
export function useLocation() {
  const pathname = usePathname();
  // Don't call useNextSearchParams here to avoid Suspense requirement
  // in components that only need pathname
  return {
    pathname,
    get search() {
      if (typeof window !== 'undefined') {
        return window.location.search;
      }
      return '';
    },
    get hash() {
      if (typeof window !== 'undefined') {
        return window.location.hash;
      }
      return '';
    },
  };
}

// useSearchParams - compatible with react-router-dom's [searchParams, setSearchParams]
export function useSearchParams() {
  const searchParams = useNextSearchParams();
  return [searchParams];
}

// Link component - maps react-router-dom's `to` prop to Next.js `href`
const Link = forwardRef(function Link({ to, ...props }, ref) {
  return <NextLink href={to || '#'} ref={ref} {...props} />;
});
Link.displayName = 'Link';
export { Link };

// Navigate component - used for <Navigate to="/path" replace />
export function Navigate({ to, replace: shouldReplace }) {
  const router = useNextRouter();
  useEffect(() => {
    if (shouldReplace) {
      router.replace(to);
    } else {
      router.push(to);
    }
  }, [to, shouldReplace, router]);
  return null;
}

// BrowserRouter - no-op wrapper (Next.js handles routing)
export function BrowserRouter({ children }) {
  return children;
}

// Routes and Route - no-ops (routing handled by file system)
export function Routes({ children }) {
  return children;
}

export function Route() {
  return null;
}
