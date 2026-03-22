'use client';

// Compatibility shim: provides react-router-dom-like hooks using Next.js APIs
// This allows existing page components to work without rewriting all navigation code

import { useRouter as useNextRouter, usePathname, useSearchParams, useParams as useNextParams } from 'next/navigation';

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

export function useParams() {
  return useNextParams();
}

export function useLocation() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  return {
    pathname,
    search: searchParams.toString() ? `?${searchParams.toString()}` : '',
    hash: typeof window !== 'undefined' ? window.location.hash : '',
  };
}

export function useSearchParamsCompat() {
  const searchParams = useSearchParams();
  return [searchParams];
}
