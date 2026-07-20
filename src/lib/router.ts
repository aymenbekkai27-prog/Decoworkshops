import { useEffect, useState } from 'react';

export type RoutePath = '/track' | '/worker' | '/admin' | '/login';

function currentPath(): RoutePath {
  const hash = window.location.hash.replace(/^#/, '');
  if (hash === '/worker' || hash === '/admin' || hash === '/login') return hash;
  return '/track';
}

export function navigate(path: RoutePath) {
  window.location.hash = path;
}

export function useHashRoute(): RoutePath {
  const [path, setPath] = useState<RoutePath>(currentPath);
  useEffect(() => {
    const onChange = () => setPath(currentPath());
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return path;
}
