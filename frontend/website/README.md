# Nerdiez website

Next.js, strict TypeScript, and Tailwind CSS frontend for reading articles, exploring developer subjects, joining topic discussions, and managing your own content.

## Development

```sh
npm install
npm run dev
```

Set `API_BASE_URL` to the backend origin (default: `http://localhost:8080`); only server-side reads use it. Browser API and OAuth requests use relative paths that nginx routes to the backend (see `nginx/` at the repo root), so open the site through nginx (`http://localhost`), not port 3000.

## Request flow

Public resources use category/tag slugs and resource public URIs. The frontend extracts a resource's public URI from the `canonicalUri` returned by the backend; it does not reconstruct public keys from titles or use numeric admin IDs. Public and personal canonical paths are parsed explicitly, and request path segments are URL-encoded.

| Operation | Method and endpoint |
| --- | --- |
| Categories | `GET /api/categories` |
| Tags | `GET /api/tags` |
| Category article briefs | `GET /api/categories/{categorySlug}/articles` |
| Read an article | `GET /api/articles/{publicUri}` |
| Category topics | `GET /api/categories/{categorySlug}/topics` |
| Topic talks | `GET /api/topics/{topicPublicUri}/talks` |
| My article briefs | `GET /api/me/articles` |
| My article detail | `GET /api/me/articles/{publicUri}` |
| My topics | `GET /api/me/topics` |
| My talks for a topic | `GET /api/me/topics/{topicPublicUri}/talks` |
| Create article/topic/talk | `POST /api/articles`, `/api/topics`, `/api/talks` |
| Edit article/topic/talk | `PATCH /api/articles/{publicUri}`, `/api/topics/{publicUri}`, `/api/talks/{publicUri}` |
| Delete article/topic/talk | `DELETE /api/articles/{publicUri}`, `/api/topics/{publicUri}`, `/api/talks/{publicUri}` |
| Vote | `PUT /api/articles/{publicUri}/vote`, `/api/talks/{publicUri}/vote` |

Listings use zero-based `page` and `size` parameters; visible website page numbers start at 1. All personal reads and mutations include cookies. An expired session gets one refresh attempt. Protected requests never retry anonymously. Public reads can retry without rejected credentials. Successful `204` deletions do not require a JSON body.

### Public authoring DTOs

These match the backend's public request DTOs, which are separate from its numeric-ID admin DTOs:

- Article creation: `title`, `content`, `categorySlug`, `tagSlugs`, plus optional `description`, `featuredImage`, and `isActive`. Article PATCH supports `title`, `content`, `description`, `featuredImage`, `tagSlugs`, and `isActive`.
- Topic creation: `name`, `categorySlug`, `tagSlugs`, and optional `description`. Topic PATCH supports `name`, `description`, `categorySlug`, and `tagSlugs`.
- Talk creation: `content`, `topicPublicUri`, and optional `isActive`. Talk PATCH supports `content` and `isActive`.
- Votes send `{ "vote": -1 | 0 | 1 }`.

Editors send only changed fields on PATCH, preserve existing featured images, and do not change categories or publication status during editing. API types support the full public DTO even where an editor does not expose a corresponding control.

## Pages and authentication

- `/` and `/categories` open the first available subject. `/categories/{categorySlug}` lists articles; `?view=topics` lists questions. Both support `?page=N`.
- `/articles/{categorySlug}/{publicUri}` reads an article. Normal in-app article links open this route in a modal while preserving the current page; direct navigation, refresh, and new-tab navigation render the standalone reader. Older category-list URLs redirect to the hub; older plain article slugs redirect only when uniquely resolvable.
- `/topics/{topicPublicUri}` reads an article-style question and paginated discussion. Older `/topics/{categorySlug}/{topicPublicUri}` links permanently redirect to this route, preserving query parameters.
- `/me?view=articles|topics&page=N` is the signed-in user’s profile dashboard. It shows the display name and username alongside article/topic management. The account control in the header links here.
- `/me/articles/new` and `/me/topics/new` create content; `/me/articles/{publicUri}/edit` and `/me/topics/{publicUri}/edit` edit it.

There is no individual topic GET in the current backend. Public topic pages search categories sequentially and scan their topic slices until the canonical public identifier matches, while personal editors search `/api/me/topics`, using up to 100 items per lookup request. This supports direct links at the cost of additional requests for large listings.

The header, votes, and personal pages share one sign-in dialog. OAuth returns to the intended same-origin route. Unsaved editor fields are kept in session storage under an account-specific key and restored only for that account; saving after reauthentication always requires another explicit click. Successful sign-out clears personal recovery data. Authentication service failures and `403` permission errors remain separate from login prompts.

The global application shell uses a persistent Subjects rail on desktop and an accessible drawer on smaller screens. Subject entries show the category name with a stable colour and icon derived from its slug (`app/components/subject.tsx`). Signed-in users also see “Your space” shortcuts. Writing and asking start from the Write/Ask actions on each subject page. Category navigation loads independently so a category-service failure does not hide the current page. All text, including articles, uses Inter (articles at a 15px reading size); code uses JetBrains Mono. Colours are CSS tokens in `app/globals.css` with light and dark sets.

Each subject page is the primary feed surface: a subject header, a composer with Write and Ask actions, and Articles/Discussions tabs. Both actions pass the current category as a validated default. A recovered draft takes precedence over that default. Wide screens add a side panel explaining how reading, asking, and explaining work.

The article feed is a responsive card grid (one column on mobile, two on larger screens) with cover, title, a two-line description (truncated with “…”), tags, votes, and publish date. Votes cast in the article modal update the card counts immediately from client state; a reload fetches fresh data. Public article briefs include a nullable `featuredImage`; articles without one show a subject-coloured placeholder. The loading state reserves both image and content space. Discussions list as question cards linking to the topic page. Feed rendering uses only the category listing request and does not fetch every article detail. Backend failures remain errors and are not converted into empty or synthetic frontend results.

Article reading uses a root intercepted parallel route. Soft navigation opens an accessible reader dialog with close and new-tab controls, Back and Forward preserve modal history, and hard navigation renders the canonical standalone page. Both presentations share a technical editorial layout with a compact `2:1` featured cover before the article header. A sticky desktop table of contents remains available for the full article and tracks the active H1–H3 section with page- and modal-specific offsets; narrower screens use a collapsible contents panel. Repeated headings receive unique anchors. Modal loading, missing-content, and API error states remain inside the overlay.

New articles publish immediately. New topics remain non-public until administrator activation. Owners are offered editing and deletion from My content. Deletion is permanent for both articles and topics; the UI confirms it and refreshes the listing after success.

Signed-in readers can add replies inline on a topic, with required Markdown content (10,000 characters maximum) and Write/Preview controls. New replies publish immediately. Owners can edit content or confirm permanent deletion. PATCH sends only changed content and keeps publication status unchanged.

The discussion defaults to All replies. `?view=mine&page=N#discussion` shows the signed-in reader’s own replies, including inactive entries marked Not public. Adding a reply opens My replies page one; editing refreshes the current view, and deleting the last entry on a later page returns to the preceding page. Public discussions retain voting. Reply fetches use a compact loading placeholder so an empty result does not collapse the bottom of the page and shift the viewport upward.

Reply drafts are scoped to the account, topic, and reply in session storage. Unsaved changes survive failed requests and reauthentication; submitting after sign-in requires another explicit click. Cancel or switching editors/filters prompts before discarding changes. Private state clears when the account changes, and old requests cannot populate another account’s view.

Site copy uses functional labels and concise feedback. The interface calls categories “subjects” and discussion entries “replies”; `category` and `talk`/`talks` remain the internal terms in routes, code, API endpoints, types, and storage keys. Public user profiles, personalized feeds, subject subscriptions, search, and aggregate profile counts require backend capabilities that are not currently available. User-authored descriptions and content are preserved. Image uploads, tag creation, nested comments, and moderation remain outside this update.

## Current backend limitations

This project changes only the website. The following limitations were observed in the backend source and are not bypassed by the frontend:

- Talk create/PATCH DTOs currently apply numeric `@Max(10_000)` to String content instead of a length constraint, which may reject ordinary Markdown. Talk edits/deletions also resolve active resources only, so inactive talks listed in My replies may return `404`. These backend issues require backend fixes; the website preserves rejected drafts and does not claim success.
- Resource mutation services still resolve active resources only, so editing or deleting an inactive article/topic may return `404` even though it appears in a personal listing.
- The topic command controller's service fields are not constructor-injected; topic updates also require backend verification for independently changing descriptions and categories.
- Article edits without a featured image and clearing optional descriptions require backend verification; the UI preserves input and reports rejected requests.
- The existing sign-out flow calls `POST /api/auth/logout`; the inspected auth controller exposes refresh but no logout handler. Failed sign-out is reported rather than claiming the session was cleared.

## Validation

```sh
npm run lint
npm test
npx tsc --noEmit --incremental false
npm run build
```

Contract tests cover public and personal canonical URIs, slug-based mutation payloads, talk parent URIs, pagination, cookie authentication, refresh/anonymous fallback rules, permission failures, `204` deletions, topic lookup across slices, legacy article ambiguity, and account-specific recovery keys. They use Node's test runner and the installed TypeScript compiler without additional test dependencies.

If the environment cannot open Turbopack's local worker port, use `npm run build -- --webpack` for production build validation. Browser verification uses an isolated synthetic API and does not modify real backend content.
