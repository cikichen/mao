# Cache Components API Reference

Complete API reference for Next.js Cache Components.

## Directive: `'use cache'`

Marks a function or file as cacheable. The cached output is included in the static shell during Partial Prerendering.

### Syntax

```tsx
// File-level (applies to all exports)
'use cache'

export async function getData() {
  /* ... */
}

// Function-level
async function Component() {
  'use cache'
  // ...
}
```

### Variants

| Directive             | Description              | Cache Storage            |
| --------------------- | ------------------------ | ------------------------ |
| `'use cache'`         | Standard cache (default) | Default handler + Remote |
| `'use cache: remote'` | Platform remote cache    | Remote handler only      |

### `'use cache: remote'`

Uses platform-specific remote cache handler. Requires network roundtrip.

```tsx
async function HeavyComputation() {
  'use cache: remote'
  cacheLife('days')

  return await expensiveCalculation()
}
```

### Understanding Cache Handlers

Next.js uses **cache handlers** to store and retrieve cached data. The directive variant determines which handlers are used.

- `'use cache'` → Uses both default and remote handlers
- `'use cache: remote'` → Uses only the remote handler

### Rules

1. **Must be async**
2. **First statement** - `'use cache'` must be the first statement in the function body
3. **No runtime APIs** - Cannot call `cookies()`, `headers()`, `searchParams` directly
4. **Serializable arguments**
5. **Serializable return values**

---

## Function: `cacheLife()`

Configures cache duration and revalidation behavior.

### Import

```tsx
import { cacheLife } from 'next/cache'
```

### Signature

```tsx
function cacheLife(profile: string): void
function cacheLife(options: CacheLifeOptions): void
```

### Predefined Profiles

| Profile     | stale | revalidate    | expire         |
| ----------- | ----- | ------------- | -------------- |
| `'default'` | 300   | 900           | ∞              |
| `'seconds'` | 30    | 1             | 60             |
| `'minutes'` | 300   | 60            | 3600           |
| `'hours'`   | 300   | 3600          | 86400          |
| `'days'`    | 300   | 86400         | 604800         |
| `'weeks'`   | 300   | 604800        | 2592000        |
| `'max'`     | 300   | 2592000       | 31536000       |

### Dynamic Threshold

Cache entries with `expire < 300` seconds are treated as dynamic holes during Partial Prerendering.

---

## Function: `cacheTag()`

Tags cached data for targeted invalidation.

```tsx
import { cacheTag } from 'next/cache'

async function UserProfile({ userId }: { userId: string }) {
  'use cache'
  cacheTag('users', `user-${userId}`)
  cacheLife('hours')

  return db.users.findUnique({ where: { id: userId } })
}
```

### Tag Constraints

- Max tag length: 256 characters
- Max total tags: 128

### Implicit Tags

Next.js also applies implicit route-based tags, enabling `revalidatePath()` without explicit `cacheTag()` calls.

---

## Understanding Cache Scope

A new cache entry is created when any of these differ:

- Function identity
- Arguments
- File path

Cache keys are composed of buildId, functionId, serializedArgs, and dev-only HMR hash.

---

## Function: `updateTag()`

Immediately invalidates cache entries and ensures read-your-own-writes.

```tsx
'use server'
import { updateTag } from 'next/cache'

export async function createPost(formData: FormData) {
  const post = await db.posts.create({ data: formData })
  updateTag('posts')
  updateTag(`user-${post.authorId}`)
}
```

---

## Function: `revalidateTag()`

Marks cache entries as stale for background revalidation.

```tsx
'use server'
import { revalidateTag } from 'next/cache'

export async function updateSettings(data: FormData) {
  await db.settings.update({ data })
  revalidateTag('settings', 'hours')
}
```

### Rule of Thumb

- `updateTag()` = the triggering user is waiting to see the result
- `revalidateTag()` = eventual consistency is acceptable

---

## Function: `revalidatePath()`

Revalidates all cache entries associated with a path.

```tsx
'use server'
import { revalidatePath } from 'next/cache'

export async function updateBlog() {
  await db.posts.update({})
  revalidatePath('/blog')
}
```

---

## Configuration: `next.config.ts`

```typescript
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  cacheComponents: true,
}

export default nextConfig
```

You can also configure custom cache profiles and cache handlers.

---

## `generateStaticParams` with Cache Components

Key rules:

1. Must return at least one parameter set
2. Params validate static safety
3. Partial params create reusable subshells
