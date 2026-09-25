/** Exact public routes only: subpaths must retain normal session protection. */
export function isPublicAuthPath(pathname: string): boolean {
  return ["/login", "/auth/callback"].includes(pathname);
}
