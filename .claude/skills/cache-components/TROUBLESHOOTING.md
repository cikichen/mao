# Cache Components Troubleshooting

Common issues, debugging techniques, and solutions for Cache Components.

## Quick Debugging Checklist

### Cache Not Working

- `cacheComponents: true` in next.config?
- Function is `async`?
- `'use cache'` is FIRST statement?
- Arguments are serializable?
- No `cookies()` / `headers()` inside cache?

### Stale Data After Mutation

- Called `updateTag()` or `revalidateTag()`?
- Invalidation tag matches `cacheTag()`?
- Using `updateTag()` when immediate update is needed?

### Build Errors

- Dynamic data wrapped in `<Suspense>`?
- `generateStaticParams()` returns at least one param?
- Not mixing `'use cache'` with `cookies()` / `headers()`?

## Common Errors

### Error: UseCacheTimeoutError

Cause: cached function accesses request-specific data.

Fix: remove `'use cache'` and stream user-specific content dynamically inside Suspense.

### Error: Cannot use 'use cache' with sync function

Fix: make the function `async`.

### Error: Dynamic Data Outside Suspense

Fix: wrap dynamic components using cookies/headers/searchParams in `<Suspense>`.

### Error: Uncached Data Outside Suspense

Fix: either cache the async I/O or move it into a Suspense boundary.

### Error: Empty generateStaticParams

Fix: provide at least one real param set.

### Error: Request Data Inside Cache

Fix: user-specific content should not be cached.

## Debugging Techniques

1. Check response headers with `curl -I`
2. Enable cache debug logs: `NEXT_PRIVATE_DEBUG_CACHE=1 npm run dev`
3. Inspect build output symbols: static / partial / dynamic
4. Log cache tags during development

## Common Mistakes Checklist

| Mistake | Fix |
| --- | --- |
| Missing `cacheComponents: true` | Add to next.config.ts |
| Sync function with `'use cache'` | Make it async |
| `'use cache'` not first | Move it to first line |
| Accessing request APIs in cache | Extract to non-cached wrapper |
| Non-serializable args | Use primitives/plain objects |
| Missing Suspense for dynamic content | Add Suspense |
| Wrong invalidation tag | Match cacheTag |
| Over-caching volatile data | Shorten cacheLife or remove cache |
