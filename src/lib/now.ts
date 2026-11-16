/**
 * The time of the current request. Server components render once per request, so reading the
 * clock here is intentional; client components receive this value as a prop to hydrate identically.
 */
export const requestTime = (): number => Date.now()
