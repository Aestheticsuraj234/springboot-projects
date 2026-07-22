Here’s a **recording outline** for the Google Photos clone — chapter by chapter, feature by feature, with the files to open on camera.

---

# Google Photos Clone — Recording Outline

**Stack at a glance:** Spring Boot 4.1 + JWT + PostgreSQL/Flyway + ImageKit | Next.js 16 + React Query + Zustand + shadcn

**Run order (demo setup):**
1. `docker compose up -d` → Postgres on `5433`
2. Backend: `./mvnw spring-boot:run` → `:8080`
3. Frontend: `cd frontend && npm run dev` → `:3000`

---

## Chapter 0 — Project Tour (2–3 min)

**Say:** Full-stack Google Photos-style app: metadata in Postgres, binaries in ImageKit, JWT auth, AI transforms via ImageKit URL APIs.

**Open / show:**
| File | What to say |
|------|-------------|
| Root tree | Backend at root, UI in `frontend/` |
| `pom.xml` | Spring Boot 4.1, Java 17, JPA, Security, Flyway, JWT, ImageKit |
| `docker-compose.yml` | Postgres 16, DB `google_photos`, port 5433 |
| `frontend/package.json` | Next 16, React Query, Zustand, Zod, shadcn |
| `application.properties` | Port, DB, JWT TTLs, CORS, multipart 20MB, ImageKit keys |
| `frontend/.env.local.example` | `NEXT_PUBLIC_API_URL=http://localhost:8080/api` |

**Package map (backend):**
```
controller → service → repository
domain / dto / config / security / exception
```

---

## Chapter 1 — Database & Domain Model

**Feature:** Schema that powers users, photos, albums, AI derivatives.

**Files (migrations — walk in order):**
1. `V1__create_users_table.sql` — `users`, `refresh_tokens`
2. `V2__create_photos_table.sql` — `photos`, unique `(user_id, imagekit_file_id)`
3. `V3__create_albums_table.sql` — `albums`, `album_photos`, `photos.deleted_at`
4. `V4__add_ai_transform_metadata.sql` — `parent_photo_id`, `ai_transform_type`

**Entities to open:**
| File | Talking point |
|------|----------------|
| `domain/User.java` | Email, password hash, display name |
| `domain/RefreshToken.java` | Opaque refresh tokens stored in DB |
| `domain/Photo.java` | ImageKit IDs/URLs, status, AI parent |
| `domain/PhotoStatus.java` | `ACTIVE` / `ARCHIVED` / `TRASH` |
| `domain/Album.java` + `AlbumPhoto.java` | Many-to-many + sort order |
| `domain/AiTransformType.java` | Remove BG, upscale, smart crop, etc. |

**Diagram to sketch on screen:**
```
users ──* photos
users ──* albums
albums *──* photos (album_photos)
photos ──? photos (parent_photo_id for AI results)
```

---

## Chapter 2 — Auth (Backend → Frontend)

**Feature:** Register, login, refresh, logout, `/me`.

### Backend walk
| Order | File | Point |
|------|------|--------|
| 1 | `config/JwtProperties.java` | Secret, 15m access / 7d refresh |
| 2 | `security/JwtService.java` | Access JWT (sub=userId); refresh value gen |
| 3 | `security/JwtAuthenticationFilter.java` | Bearer → SecurityContext |
| 4 | `security/UserDetailsServiceImpl.java` | Load user by email |
| 5 | `config/SecurityConfig.java` | Stateless; public register/login/refresh |
| 6 | `service/AuthService.java` | Hash, issue tokens, store refresh, logout |
| 7 | `controller/AuthController.java` | `/api/auth/*` |
| 8 | DTOs: `RegisterRequest`, `LoginRequest`, `AuthResponse`, `UserResponse` |

**Endpoints:**
- `POST /api/auth/register|login|refresh|logout`
- `GET /api/auth/me`

### Frontend walk
| File | Point |
|------|--------|
| `stores/auth-store.ts` | Persist tokens/user (`gp-auth`) |
| `lib/validations/auth.ts` | Zod schemas |
| `hooks/use-auth.ts` | Login/register/logout/me |
| `lib/api.ts` (auth section) | Typed calls + refresh handling |
| `components/auth-form.tsx` | Shared form |
| `(auth)/login/page.tsx`, `register/page.tsx` | Pages |
| `guest-guard.tsx` / `auth-guard.tsx` | Route protection |

**Demo:** Register → login → show token in storage → hit `/me` → logout.

---

## Chapter 3 — App Shell & Routing

**Feature:** Layout, nav, theme, route groups.

| File | Point |
|------|--------|
| `app/layout.tsx` | Fonts, ThemeProvider, QueryProvider, Sonner; dark default |
| `app/page.tsx` | `/` → `/photos` or `/login` |
| `(app)/layout.tsx` | AuthGuard + AppShell; clear selection on navigate |
| `layout/app-shell.tsx` | Sidebar shell |
| `layout/sidebar-nav.tsx` | Photos / Albums / Archive / Trash + storage + theme + logout |
| `providers/query-provider.tsx` | React Query |
| `providers/theme-provider.tsx` | next-themes |

**Routes to click through:**
`/photos` · `/photos/[id]` · `/albums` · `/albums/[id]` · `/archive` · `/trash`

---

## Chapter 4 — Photo Library (Core Feature)

**Feature:** List, upload, import metadata, archive / trash / restore / permanent delete.

### Backend
| File | Point |
|------|--------|
| `controller/PhotoController.java` | All photo endpoints |
| `service/PhotoService.java` | Upload, list by status, bulk lifecycle, derived AI photos |
| `service/ImageKitService.java` | Upload / delete / thumbnails |
| `repository/PhotoRepository.java` | User-scoped queries, storage sums |
| DTOs: `PhotoResponse`, `CreatePhotoRequest`, `BulkPhotoActionRequest`, `PageResponse` |

**Endpoints:**
- `GET /photos?status=&page=&size=`
- `GET /photos/{id}`
- `POST /photos/upload` (multipart)
- `POST /photos` (import by ImageKit id)
- `POST /photos/archive|trash|restore|delete-permanent`
- `DELETE /photos/{id}`

### Frontend
| File | Point |
|------|--------|
| `hooks/use-photos.ts` | Infinite list + mutations |
| `lib/photo-upload.ts` | Upload helper |
| `stores/photo-selection-store.ts` | Multi-select mode |
| `photos/photo-library-view.tsx` | Shared grid for Active/Archive/Trash |
| `photos/photo-grid.tsx` | Grid + selection |
| `photos/photo-bulk-toolbar.tsx` | Bulk actions + add to album |
| `photos/photo-upload-button.tsx` | File picker |
| `photos/page.tsx`, `archive/page.tsx`, `trash/page.tsx` | Same view, different `status` |

**Demo script:**
1. Upload a photo  
2. Select → Archive → Archive page  
3. Trash → Trash page → Restore  
4. Permanent delete (ImageKit file gone)

---

## Chapter 5 — Albums

**Feature:** CRUD albums, cover, add/remove photos.

### Backend
| File | Point |
|------|--------|
| `domain/Album.java`, `AlbumPhoto.java` | Model |
| `AlbumRepository`, `AlbumPhotoRepository` | Persistence |
| `service/AlbumService.java` | Business rules |
| `controller/AlbumController.java` | REST |
| DTOs: `CreateAlbumRequest`, `UpdateAlbumRequest`, `AlbumResponse`, `AddPhotosToAlbumRequest` |

**Endpoints:**
- `GET/POST /api/albums`
- `GET/PATCH/DELETE /api/albums/{id}`
- `GET/POST /api/albums/{id}/photos`
- `DELETE /api/albums/{id}/photos/{photoId}`

### Frontend
| File | Point |
|------|--------|
| `hooks/use-albums.ts` | Queries/mutations |
| `albums/page.tsx` | List + create |
| `albums/[id]/page.tsx` | Detail + photos + delete |
| `album-grid.tsx` | Cards |
| `create-album-dialog.tsx` | Create |
| `add-to-album-dialog.tsx` | From bulk toolbar |

**Demo:** Create album → select photos → add → open album → remove one → delete album.

---

## Chapter 6 — Library, Storage & ImageKit Import

**Feature:** Storage usage + browse ImageKit folder + bulk import into DB.

### Backend
| File | Point |
|------|--------|
| `controller/LibraryController.java` | `/api/library/*` |
| `service/LibraryService.java` | Usage, list assets, import |
| DTOs: `StorageUsageResponse`, `ImageKitAssetResponse`, `ImportPhotosRequest` |

**Endpoints:**
- `GET /api/library/storage`
- `GET /api/library/imagekit-assets`
- `POST /api/library/import`

### Frontend
| File | Point |
|------|--------|
| `hooks/use-library.ts` | Hooks |
| `library/storage-widget.tsx` | Sidebar bytes + count |
| `library/import-imagekit-dialog.tsx` | Pick assets → import |
| `lib/format-bytes.ts` | Human sizes |

**Say:** Postgres holds metadata; ImageKit holds files. Import links existing ImageKit files without re-uploading bytes.

---

## Chapter 7 — AI Photo Transforms

**Feature:** Preview transform URL → Apply → new derived photo with parent link.

### Backend
| File | Point |
|------|--------|
| `domain/AiTransformType.java` | Enum of transforms |
| `service/AiTransformService.java` | Map type → ImageKit chain; preview; apply |
| `ImageKitService.java` | Transform URLs + download with retries |
| `PhotoService` (derived create) | Save child photo + `parentPhotoId` |
| `controller/PhotoAiController.java` | Preview / apply |
| DTOs: `AiTransformRequest`, `AiTransformPreviewResponse` |

**Endpoints:**
- `POST /api/photos/{id}/ai/preview`
- `POST /api/photos/{id}/ai/apply`

**Types to name on camera:**  
`REMOVE_BACKGROUND`, `BACKGROUND_AND_SHADOW`, `CHANGE_BACKGROUND`, `GENERATIVE_FILL`, `SMART_CROP`, `OBJECT_CROP`, `RETOUCH`, `UPSCALE`, `AI_EDIT`

### Frontend
| File | Point |
|------|--------|
| `photos/[id]/page.tsx` | Detail + editor host |
| `photos/photo-ai-editor.tsx` | Pick type → preview → apply |
| `hooks/use-ai.ts` | Preview/apply mutations |

**Demo:** Open photo → preview remove BG → apply → show new photo in library + parent link in data.

---

## Chapter 8 — Cross-Cutting Concerns

**Feature:** Errors, CORS, validation, security scoping.

| File | Point |
|------|--------|
| `exception/GlobalExceptionHandler.java` | Consistent `ApiError` JSON |
| Custom exceptions | 400 / 401 / 404 / conflict / ImageKit |
| `config/AppConfig.java` + `CorsProperties` | CORS for `:3000` |
| `config/ImageKitConfig.java` + `ImageKitProperties` | Client bean |
| Every service | Always scope by `userId` (`findByIdAndUserId`) |

**Frontend glue:**
| File | Point |
|------|--------|
| `lib/api.ts` | Single typed client mirroring backend |
| `lib/query-keys.ts` | Cache key factories |
| `lib/query-client.ts` | Client defaults |

---

## Chapter 9 — End-to-End Demo Script (for recording close)

1. Start Docker + API + frontend  
2. Register / login  
3. Upload 2–3 photos  
4. Multi-select → archive one, trash one  
5. Create album → add photos  
6. Open storage widget → import from ImageKit (if assets exist)  
7. Open a photo → AI preview → apply  
8. Dark/light toggle + logout  

---

## Quick File Index (recording cheat sheet)

### Backend controllers
`AuthController` · `PhotoController` · `AlbumController` · `LibraryController` · `PhotoAiController`

### Backend services
`AuthService` · `UserService` · `PhotoService` · `AlbumService` · `LibraryService` · `ImageKitService` · `AiTransformService`

### Frontend pages
`(auth)/login` · `(auth)/register` · `photos` · `photos/[id]` · `albums` · `albums/[id]` · `archive` · `trash`

### Frontend hooks
`use-auth` · `use-photos` · `use-albums` · `use-library` · `use-ai`

