# Cache Components Patterns & Recipes

Common patterns for implementing Cache Components effectively.

## Pattern 1: Static + Cached + Dynamic Page

```tsx
import { Suspense } from 'react'
import { cacheLife } from 'next/cache'

function Header() {
  return <header>My Blog</header>
}

async function FeaturedPosts() {
  'use cache'
  cacheLife('hours')
  const posts = await db.posts.findMany({ where: { featured: true }, take: 5 })
  return <section>{posts.map((post) => <PostCard key={post.id} post={post} />)}</section>
}

async function PersonalizedFeed() {
  const session = await getSession()
  const feed = await db.posts.findMany({ where: { authorId: { in: session.following } } })
  return <FeedList posts={feed} />
}

export default async function HomePage() {
  return (
    <>
      <Header />
      <FeaturedPosts />
      <Suspense fallback={<FeedSkeleton />}>
        <PersonalizedFeed />
      </Suspense>
    </>
  )
}
```

## Pattern 2: Read-Your-Own-Writes with Server Actions

Use `updateTag()` after mutations so users see changes immediately.

## Pattern 3: Granular Cache Invalidation

Use multi-level tags such as:

- `posts`
- `post-${postId}`
- `author-${authorId}`

## Pattern 4: Cached Data Fetching Functions

Create reusable cached fetchers:

```tsx
export async function getUser(userId: string) {
  'use cache'
  cacheTag('users', `user-${userId}`)
  cacheLife('hours')
  return db.users.findUnique({ where: { id: userId } })
}
```

## Pattern 5: Stale-While-Revalidate for Background Updates

Use `revalidateTag()` for non-critical updates like analytics.

## Pattern 6: Conditional Caching Based on Content

Adjust `cacheLife()` and `cacheTag()` based on content volatility.

## Pattern 7: Nested Cached Components

Cache header, footer, sidebar, and content separately for finer invalidation.

## Pattern 8: E-commerce Product Page

Combine:

- Cached product details
- Cached reviews
- Dynamic inventory inside Suspense

## Pattern 9: Multi-tenant SaaS Application

Use tenant-scoped tags like `tenant-${tenantId}`.

## Pattern 10: Subshell Composition with `generateStaticParams`

Provide real route params to enable reusable subshell generation for deeper route trees.

## Pattern 11: Hierarchical Params for Deep Routes

Use route layouts with Suspense boundaries to maximize shell reuse.

## When to Use Suspense with Cached Components

- Dynamic components → Suspense required
- Cached components → Suspense optional but often recommended
- Long-lived caches (`hours`, `days`, `max`) → Suspense usually optional

## Anti-Patterns to Avoid

### ❌ Caching user-specific data without parameters

User-specific content should usually stream dynamically or include user ID in cache key.

### ❌ Over-caching volatile data

Real-time data should not use long cache lifetimes.

### ❌ Forgetting Suspense for dynamic content

Dynamic async I/O outside Suspense causes build/runtime issues with Cache Components.
