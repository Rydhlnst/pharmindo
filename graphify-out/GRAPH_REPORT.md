# Graph Report - .  (2026-07-25)

## Corpus Check
- 360 files · ~234,437 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1902 nodes · 4628 edges · 180 communities (114 shown, 66 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 29 edges (avg confidence: 0.8)
- Token cost: 131,525 input · 0 output

## Community Hubs (Navigation)
- API Response & Pagination Helpers
- Admin User Onboarding UI
- Access Scoping & Audit Logging
- Household Draft Forms
- Admin Aid & Lost Items Pages
- Admin List Pages
- Aid Programs & Activities
- Database Package Dependencies
- Rate Limiting & Serialization
- Backend Dashboard & Reports
- Citizen Edit & Migration Forms
- Deployment Architecture
- Program & Election Detail UI
- Web TypeScript Config
- Household Detail UI
- Admin Dashboard Home
- Public Registration Form
- Root Workspace Config
- Backend Package Dependencies
- Citizen Contract Schemas
- RW Report Analytics UI
- Warga Lost Items UI
- Error Types & Storage
- Admin Layout & Citizen Detail
- Admin Users Contract Schemas
- Backend Bootstrap & WebSocket
- Admin Access Scope Library
- Warga Homepage & Aspirations
- App Root Layout & PWA
- Auth Registration Routes
- Community 30
- Community 31
- Community 32
- Community 33
- Community 34
- Community 35
- Community 36
- Community 37
- Community 38
- Community 39
- Community 40
- Community 41
- Community 42
- Community 43
- Community 44
- Community 45
- Community 46
- Community 47
- Community 48
- Community 49
- Community 50
- Community 51
- Community 52
- Community 53
- Community 54
- Community 55
- Community 56
- Community 57
- Community 58
- Community 59
- Community 60
- Community 61
- Community 62
- Community 63
- Community 64
- Community 65
- Community 66
- Community 67
- Community 68
- Community 69
- Community 70
- Community 71
- Community 72
- Community 73
- Community 74
- Community 75
- Community 76
- Community 77
- Community 78
- Community 79
- Community 80
- Community 81
- Community 82
- Community 83
- Community 84
- Community 85
- Community 86
- Community 87
- Community 88
- Community 89
- Community 90
- Community 91
- Community 92
- Community 93
- Community 94
- Community 95
- Community 96
- Community 97
- Community 98
- Community 99
- Community 100
- Community 101
- Community 102
- Community 103
- Community 104
- Community 105
- Community 106
- Community 107
- Community 108
- Community 109
- Community 110
- Community 111
- Community 112
- Community 113
- Community 114
- Community 115
- Community 116
- Community 117
- Community 118
- Community 124
- Community 125
- Community 126
- Community 127
- Community 128
- Community 129
- Community 130
- Community 131
- Community 132
- Community 133
- Community 134
- Community 135
- Community 136
- Community 137
- Community 138
- Community 139
- Community 140
- Community 141
- Community 142
- Community 143
- Community 144
- Community 145
- Community 146
- Community 147
- Community 148
- Community 149
- Community 150
- Community 151
- Community 152
- Community 153
- Community 154
- Community 155
- Community 156
- Community 157
- Community 158
- Community 159
- Community 160
- Community 161
- Community 162
- Community 163
- Community 164
- Community 165
- Community 166
- Community 168
- Community 169
- Community 172
- Community 173
- Community 174
- Community 179

## God Nodes (most connected - your core abstractions)
1. `cn()` - 85 edges
2. `platformFetch()` - 83 edges
3. `getDb()` - 68 edges
4. `Button` - 61 edges
5. `useActionToast()` - 54 edges
6. `useSyncVersions()` - 45 edges
7. `Input` - 38 edges
8. `toIso()` - 32 edges
9. `useToast()` - 30 edges
10. `notFound()` - 29 edges

## Surprising Connections (you probably didn't know these)
- `VPS Deployment Guide (git+docker+nginx)` --semantically_similar_to--> `Backend VPS Deploy (Node+PM2)`  [INFERRED] [semantically similar]
  DEPLOYMENT.md → apps/backend/DEPLOY_VPS.md
- `VPS Deployment Guide (git+docker+nginx)` --semantically_similar_to--> `Ubuntu VPS Backend Deploy`  [INFERRED] [semantically similar]
  DEPLOYMENT.md → deploy/UBUNTU_DEPLOY.md
- `Sign-in Screenshot (phase1)` --semantically_similar_to--> `Sign-in Screenshot (phase1 port 3001)`  [INFERRED] [semantically similar]
  sign-in-phase1.png → sign-in-phase1-3001.png
- `main()` --calls--> `getDb()`  [EXTRACTED]
  apps/backend/count_requests.ts → packages/db/src/index.ts
- `buildReplierMap()` --calls--> `getDb()`  [EXTRACTED]
  apps/backend/src/routes/admin-aspirations.ts → packages/db/src/index.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Vercel frontend + VPS Hono backend + Nginx** — concept_nextjs_web, concept_hono_backend, concept_nginx_proxy [EXTRACTED 1.00]
- **Shared secrets across Vercel and VPS** — concept_better_auth, concept_nik_encryption, concept_neon_postgres [EXTRACTED 1.00]
- **Frontend-only auth surface (Google OAuth + SMTP OTP + Better Auth)** — concept_google_oauth, concept_smtp_brevo, concept_better_auth [EXTRACTED 1.00]
- **Next.js starter template SVG assets** — apps_web_public_file_svg, apps_web_public_globe_svg, apps_web_public_window_svg, apps_web_public_next_svg, apps_web_public_vercel_svg [INFERRED 0.85]
- **Admin UI redesign: clamp-based responsive cards across modules** — diff_utf8_theme_bansos_module, diff_utf8_theme_data_penduduk_module, diff_utf8_theme_admin_header_actions_redesign, diff_utf8_theme_responsive_clamp_typography [EXTRACTED 1.00]
- **Backend service deployment stack** — docker_compose_yml_service_backend, docker_compose_yml_backend_dockerfile_ref, docker_compose_yml_backend_env_file, docker_compose_yml_port_binding_4000 [EXTRACTED 1.00]

## Communities (180 total, 66 thin omitted)

### Community 0 - "API Response & Pagination Helpers"
Cohesion: 0.06
Nodes (69): buildPageMeta(), getOffset(), ApiFailure, ApiSuccess, created(), fail(), ok(), idParamSchema (+61 more)

### Community 1 - "Admin User Onboarding UI"
Cohesion: 0.05
Nodes (52): ACCESS_SCOPE_OPTIONS, AccessScope, CreateAdminResponse, StepItem(), TambahPenggunaPage(), HouseholdDetail, INITIAL_FORM, TambahAnggotaKeluargaPage() (+44 more)

### Community 2 - "Access Scoping & Audit Logging"
Cohesion: 0.14
Nodes (48): isRtInScope(), createAuditLogService(), conflict(), forbidden(), notFound(), validationError(), decodeBase64Key32(), decryptNik() (+40 more)

### Community 3 - "Household Draft Forms"
Cohesion: 0.09
Nodes (38): AdminDraftsPage(), CitizenOption, HouseholdDetail, CitizenOption, FormState, normalizeAreaCode(), TambahKartuKeluargaPage(), RawRequestItem (+30 more)

### Community 4 - "Admin Aid & Lost Items Pages"
Cohesion: 0.09
Nodes (35): AdminBansosPage(), LaporanBarangHilangPage(), PRIORITY_CONFIG, STATUS_CONFIG, DataPendudukPage(), toNullableLabel(), HouseholdRow, KartuKeluargaPage() (+27 more)

### Community 5 - "Admin List Pages"
Cohesion: 0.09
Nodes (36): BansosApplication, BansosProgram, CitizenApiItem, CitizenRow, AdminLog, AdminUser, AVATAR_COLORS, avatarColor() (+28 more)

### Community 6 - "Aid Programs & Activities"
Cohesion: 0.11
Nodes (28): AdminBansosTambahPage(), ActivityItem, compareActivityDate(), EventCategory, getActivityDateParts(), KATEGORI_COLORS, KegiatanPage(), AdminTambahPemiluPage() (+20 more)

### Community 7 - "Database Package Dependencies"
Cohesion: 0.05
Nodes (37): dependencies, better-auth, @better-auth/utils, drizzle-orm, @neondatabase/serverless, pg, zod, devDependencies (+29 more)

### Community 8 - "Rate Limiting & Serialization"
Cohesion: 0.09
Nodes (30): tooManyRequests(), Bucket, buckets, createRateLimitMiddleware(), readClientIp(), DateLike, toIso(), buildObjectUrl() (+22 more)

### Community 9 - "Backend Dashboard & Reports"
Cohesion: 0.10
Nodes (27): main(), adminMiddleware, dashboardRoutes, MONTH_LABELS, ReportFilter, reportsRoutes, buildCanonicalCitizenWhere(), buildCanonicalHouseholdWhere() (+19 more)

### Community 10 - "Citizen Edit & Migration Forms"
Cohesion: 0.08
Nodes (26): CitizenForm, EditCitizenPage(), EMPTY, TambahAnggotaKeluargaPage(), ALASAN_PINDAH_OPTIONS, FormData, INITIAL_DATA, PEKERJAAN_OPTIONS (+18 more)

### Community 11 - "Deployment Architecture"
Cohesion: 0.09
Nodes (31): Backend VPS Deploy (Node+PM2), Backend Test Coverage Map, /api/platform/* Vercel rewrite to BACKEND_URL, Better Auth session/secret, Cloudflare R2 object storage, Docker Compose backend container, Drizzle migrator + poisoned journal timestamp, Google OAuth on frontend only (+23 more)

### Community 12 - "Program & Election Detail UI"
Cohesion: 0.12
Nodes (18): BansosProgram, PemiluEvent, Badge(), BadgeProps, badgeVariants, Card, CardContent, CardDescription (+10 more)

### Community 13 - "Web TypeScript Config"
Cohesion: 0.07
Nodes (28): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+20 more)

### Community 14 - "Household Detail UI"
Cohesion: 0.13
Nodes (23): Citizen, DetailKartuKeluargaPage(), displayRelationship(), getRelationshipBadge(), HouseholdAuditLog, HouseholdDetail, HouseholdMember, RELATIONSHIP_MAP (+15 more)

### Community 15 - "Admin Dashboard Home"
Cohesion: 0.12
Nodes (22): ACTION_MAP, ActivityItem, AdminDashboardPage(), DashboardResponse, displayAction(), getCategoryMeta(), quickActions, relativeTime() (+14 more)

### Community 16 - "Public Registration Form"
Cohesion: 0.10
Nodes (15): emailSchema, FormErrors, FormValues, passwordSchema, phoneSchema, RegisterClient(), schema, usernameSchema (+7 more)

### Community 17 - "Root Workspace Config"
Cohesion: 0.08
Nodes (25): concurrently, dependencies, turbo, devDependencies, concurrently, ts-node, ts-node, name (+17 more)

### Community 18 - "Backend Package Dependencies"
Cohesion: 0.08
Nodes (25): dependencies, @abdimas/contracts, @abdimas/db, @aws-sdk/client-s3, @aws-sdk/s3-request-presigner, @better-auth/utils, drizzle-orm, @hono/node-server (+17 more)

### Community 19 - "Citizen Contract Schemas"
Cohesion: 0.09
Nodes (23): birthDateSchema, citizenGenderSchema, citizenResponseSchema, citizenSchema, citizenStatusSchema, createCitizenSchema, nikSchema, updateCitizenSchema (+15 more)

### Community 20 - "RW Report Analytics UI"
Cohesion: 0.12
Nodes (21): AnalyticsData, BansosByProgram, BansosByRt, BansosSummaryData, buildFilterParams(), CitizenRow, DemographicsData, DistributionItem (+13 more)

### Community 21 - "Warga Lost Items UI"
Cohesion: 0.19
Nodes (15): DetailBarangHilangWarga(), PackageSearch(), BarangHilangWargaPage(), CardHeader, PesanAdmin(), RiwayatStatus(), StatusTracker(), formatDate() (+7 more)

### Community 22 - "Error Types & Storage"
Cohesion: 0.21
Nodes (16): logAdminActivity, AppError, unauthorized(), verificationRequired(), ALLOWED_CONTENT_TYPES, buildObjectKeyForEntity(), buildObjectKeyForFile(), deleteObject() (+8 more)

### Community 23 - "Admin Layout & Citizen Detail"
Cohesion: 0.13
Nodes (14): AdminLayout(), CitizenDetail, CitizenDetailPage(), getCitizenDetail(), getAdminVerifications(), getBackendServerUrl(), requireAdmin(), AdminVerificationBuckets (+6 more)

### Community 24 - "Admin Users Contract Schemas"
Cohesion: 0.10
Nodes (19): adminActivityLogListResponseSchema, adminActivityLogSchema, adminScopeSchema, adminUserListQuerySchema, adminUserListResponseSchema, adminUserResponseSchema, adminUserSchema, adminUserStatusSchema (+11 more)

### Community 25 - "Backend Bootstrap & WebSocket"
Cohesion: 0.16
Nodes (14): backendConfig, app, { injectWebSocket, upgradeWebSocket, wss }, server, addClient(), clients, removeClient(), subscribeClient() (+6 more)

### Community 26 - "Admin Access Scope Library"
Cohesion: 0.26
Nodes (17): ADMIN_RT_OPTIONS, ADMIN_RT_SET, AdminIdentity, buildAdminDisplayUsername(), buildAdminUsername(), buildScopeFilter(), getAdminScope(), getDisplayName() (+9 more)

### Community 27 - "Warga Homepage & Aspirations"
Cohesion: 0.15
Nodes (17): WargaPage(), WargaPageBody(), AspirasiItem, AspirasiStatus, FILTERS, statusClass(), statusLabel(), WargaAspirasiPage() (+9 more)

### Community 28 - "App Root Layout & PWA"
Cohesion: 0.13
Nodes (15): inter, metadata, viewport, PwaRegister(), ToastCard(), Toaster(), ToasterInner(), randomId() (+7 more)

### Community 29 - "Auth Registration Routes"
Cohesion: 0.25
Nodes (16): POST(), postSchema, bodySchema, getUniqueViolationTarget(), identityFieldsSchema, isSuspiciousNikPattern(), isValidNikDatePart(), POST() (+8 more)

### Community 30 - "Community 30"
Cohesion: 0.13
Nodes (18): AGAMA_OPTIONS, createEmptyHouseholdMember(), createEmptyPerson(), formatDate(), FormData, FormErrors, GOLONGAN_DARAH_OPTIONS, HouseholdMemberForm (+10 more)

### Community 31 - "Community 31"
Cohesion: 0.16
Nodes (13): ForceLight(), AdminTopbar(), NotifStatus, TITLE_MAP, Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList (+5 more)

### Community 32 - "Community 32"
Cohesion: 0.11
Nodes (10): AGAMA_OPTIONS, FAMILY_RELATIONSHIP_OPTIONS, FormField, FormValues, GOLONGAN_DARAH_OPTIONS, INITIAL_VALUES, onboardingSchema, PEKERJAAN_OPTIONS (+2 more)

### Community 33 - "Community 33"
Cohesion: 0.15
Nodes (15): AdminMobileSidebar(), AdminSidebar(), NAV_GROUPS, NavGroup, NavItem, SYSTEM_NAV, SheetContent, SheetContentProps (+7 more)

### Community 34 - "Community 34"
Cohesion: 0.12
Nodes (16): DUMMY_AUDIT_LOG, DUMMY_BARANG_HILANG, DUMMY_LAPORAN_SAYA, DUMMY_STATS, Attachment, AuditLogItem, BroadcastConfig, BroadcastPayload (+8 more)

### Community 35 - "Community 35"
Cohesion: 0.11
Nodes (17): barangHilangChecklistSchema, BarangHilangDto, barangHilangListQuerySchema, barangHilangListResponseSchema, barangHilangPhotoSchema, BarangHilangPriority, barangHilangPriorityOptions, barangHilangPrioritySchema (+9 more)

### Community 36 - "Community 36"
Cohesion: 0.12
Nodes (16): apiErrorCodeSchema, apiErrorSchema, halfHourTimeSchema, pageMetaSchema, rtQuerySchema, rtScopeCodeOptions, rtScopeCodeSchema, userIdParamSchema (+8 more)

### Community 37 - "Community 37"
Cohesion: 0.25
Nodes (12): DELETE(), checkHasKk(), WargaLayout(), getIdentityOrNull(), getSessionToken(), hasSessionCookie(), readCookie(), requireSession() (+4 more)

### Community 38 - "Community 38"
Cohesion: 0.14
Nodes (13): LaporanDetail(), PRIORITY_CONFIG, STATUS_CONFIG, Textarea, TextareaProps, BansosFlow(), BansosFlowProps, ProgramWithApplication (+5 more)

### Community 39 - "Community 39"
Cohesion: 0.21
Nodes (14): ActivityEvent, buildMonthGrid(), CATEGORY_LABEL, formatFullDateId(), formatMonthYearId(), formatTimestampId(), getCategoryLabel(), HARI (+6 more)

### Community 40 - "Community 40"
Cohesion: 0.16
Nodes (12): HistoryApiItem, HistoryClient(), isHistoryItem(), mapHistoryItem(), safeParseHistory(), TabLabel, TABS, tabToTipe() (+4 more)

### Community 41 - "Community 41"
Cohesion: 0.13
Nodes (14): adminAspirationDetailResponseSchema, adminAspirationListQuerySchema, adminAspirationListResponseSchema, adminAspirationReplySchema, aspirationAdminItemSchema, aspirationListQuerySchema, aspirationListResponseSchema, aspirationReplySchema (+6 more)

### Community 42 - "Community 42"
Cohesion: 0.17
Nodes (12): adminActivitiesRoutes, mapActivity(), scheduleRoutes, activityCategorySchema, activityListQuerySchema, activityListResponseSchema, activityResponseSchema, activitySchema (+4 more)

### Community 43 - "Community 43"
Cohesion: 0.23
Nodes (10): BackendBroadcast, getDismissedIds(), InfoKehilanganFab(), BroadcastBanner(), BroadcastBannerProps, BroadcastDetailModalProps, FoundItemForm(), FoundItemFormProps (+2 more)

### Community 44 - "Community 44"
Cohesion: 0.13
Nodes (14): adminBansosApplicationListQuerySchema, adminBansosApplicationListResponseSchema, adminBansosApplicationPayloadSchema, adminBansosApplicationResponseSchema, adminBansosApplicationSchema, bansosApplicationAttachmentSchema, bansosProgramListQuerySchema, bansosProgramListResponseSchema (+6 more)

### Community 45 - "Community 45"
Cohesion: 0.24
Nodes (10): { GET, POST, PUT, PATCH, DELETE }, auth, generateFallbackUsername(), getAuth(), uniqueOrigins(), getTransporter(), sendOtpEmail(), env (+2 more)

### Community 46 - "Community 46"
Cohesion: 0.20
Nodes (9): useIdentity(), useTheme(), WargaHomePage(), IdentityFormClient(), SettingsPage(), VerifyEmailClient(), useToast(), BarangHilangForm() (+1 more)

### Community 47 - "Community 47"
Cohesion: 0.14
Nodes (13): ASPIRASI_SUKSES, BANSOS_AKTIF, BANSOS_DIVERIFIKASI, BANSOS_TIDAK_LAYAK, KATEGORI_COLORS, MOCK_HISTORY, MOCK_JADWAL, MOCK_USER (+5 more)

### Community 48 - "Community 48"
Cohesion: 0.14
Nodes (13): compilerOptions, esModuleInterop, module, moduleResolution, noEmit, skipLibCheck, strict, target (+5 more)

### Community 49 - "Community 49"
Cohesion: 0.15
Nodes (13): devDependencies, tsx, @types/node, @types/pdfkit, @types/ws, typescript, vitest, @types/node (+5 more)

### Community 50 - "Community 50"
Cohesion: 0.15
Nodes (12): compilerOptions, declaration, esModuleInterop, module, moduleResolution, outDir, rootDir, skipLibCheck (+4 more)

### Community 51 - "Community 51"
Cohesion: 0.27
Nodes (7): SignInClient, SignInShellClient(), SignInPage(), OnboardingHero(), HomePage(), getSessionOrNull(), getUserRole()

### Community 52 - "Community 52"
Cohesion: 0.17
Nodes (5): BansosResultSheetProps, PROGRAM_NAMES, STATUS_CONFIG, BansosResult, StatusBansos

### Community 53 - "Community 53"
Cohesion: 0.17
Nodes (11): dependencies, zod, devDependencies, typescript, exports, typescript, zod, name (+3 more)

### Community 54 - "Community 54"
Cohesion: 0.17
Nodes (11): createMutationSchema, mutationAttachmentKindSchema, mutationAttachmentSchema, mutationDetailSchema, mutationListQuerySchema, mutationListResponseSchema, mutationResponseSchema, mutationSchema (+3 more)

### Community 55 - "Community 55"
Cohesion: 0.18
Nodes (9): hono, createApp(), dbState, reportingState, createApp(), dbState, createApp(), createApp() (+1 more)

### Community 56 - "Community 56"
Cohesion: 0.24
Nodes (8): PageHeader(), PageHeaderProps, PageHeaderVariant, PortalBrand(), PortalBrandProps, maskNik(), ProfileHeader(), ProfileHeaderProps

### Community 57 - "Community 57"
Cohesion: 0.18
Nodes (11): devDependencies, eslint-config-next, jest-environment-jsdom, tailwindcss, @testing-library/react, @types/jest, eslint-config-next, jest-environment-jsdom (+3 more)

### Community 58 - "Community 58"
Cohesion: 0.18
Nodes (9): createApiSuccessSchema(), updateUserPreferenceSchema, userPreferenceResponseSchema, userPreferenceSchema, bansosCheckResponseSchema, bansosCheckResultSchema, pemiluCheckResponseSchema, pemiluCheckResultSchema (+1 more)

### Community 59 - "Community 59"
Cohesion: 0.18
Nodes (10): dashboardSummarySchema, reportCitizenDrilldownQuerySchema, reportDemographicsResponseSchema, reportDemographicsSchema, reportDistributionItemSchema, reportFilterSchema, reportInfographicResponseSchema, reportInfographicSchema (+2 more)

### Community 60 - "Community 60"
Cohesion: 0.18
Nodes (10): compilerOptions, esModuleInterop, module, moduleResolution, noEmit, skipLibCheck, strict, target (+2 more)

### Community 61 - "Community 61"
Cohesion: 0.20
Nodes (9): name, private, scripts, build, dev, start, test, type (+1 more)

### Community 62 - "Community 62"
Cohesion: 0.22
Nodes (4): PemiluResultSheetProps, STATUS_CONFIG, PemiluResult, StatusPemilu

### Community 63 - "Community 63"
Cohesion: 0.20
Nodes (9): BarangHilangResult, FormAspirasi, FormBansos, FormPemilu, JenisAspirasi, ProgramBansos, StatusAspirasi, StatusPermohonan (+1 more)

### Community 64 - "Community 64"
Cohesion: 0.20
Nodes (8): pnpm Monorepo Structure, apps/backend/Dockerfile, apps/backend/.env, 127.0.0.1:4000 port binding, backend service (pharmindo-backend), allowBuilds (esbuild/sharp/unrs-resolver), apps/* workspace, packages/* workspace

### Community 65 - "Community 65"
Cohesion: 0.29
Nodes (9): adminUsers, __dirname, __filename, main(), normalizeDatabaseUrl(), printCredentialList(), readEnvValue(), upsertAdmin() (+1 more)

### Community 66 - "Community 66"
Cohesion: 0.22
Nodes (8): aspirationListResponseSchema, aspirationReplySchema, aspirationSchema, aspirationStatusSchema, client, pageMetaSchema, run(), toIso()

### Community 67 - "Community 67"
Cohesion: 0.31
Nodes (6): IdentityContext, IdentityContextValue, VerificationStatus, ThemeContext, ThemeContextType, WargaShellClient()

### Community 68 - "Community 68"
Cohesion: 0.22
Nodes (8): rwCodeSchema, createHouseholdRequestSchema, createMemberRequestSchema, createMutationRequestSchema, requestStatusSchema, requestTypeSchema, serviceRequestSchema, wargaMutationRequestTypeSchema

### Community 69 - "Community 69"
Cohesion: 0.22
Nodes (8): code, fs, keamananEnd, keamananStart, modeGelapEnd, modeGelapStart, tentangOldEnd, tentangOldStart

### Community 70 - "Community 70"
Cohesion: 0.25
Nodes (7): currentSessionUser, dbState, MULTI_RT_ADMIN, NOTE: Dashboard tests skipped due to pre-existing mock issue with, NOTE: /summary tests skipped due to pre-existing mock issue with, RT01_ADMIN, RW_ADMIN

### Community 71 - "Community 71"
Cohesion: 0.29
Nodes (6): HistoryCard(), HistoryCardProps, COLOR_MAP, DOT_MAP, StatusBadge(), StatusBadgeProps

### Community 72 - "Community 72"
Cohesion: 0.43
Nodes (7): main(), normalizeBaseUrl(), printCredentialList(), resolveBaseUrl(), routeExists(), seedMember(), testMembers

### Community 73 - "Community 73"
Cohesion: 0.25
Nodes (6): mutationAttachment, mutationAttachmentKindEnum, mutationAttachmentRelations, mutationRelations, mutationStatusEnum, mutationTypeEnum

### Community 74 - "Community 74"
Cohesion: 0.33
Nodes (6): aspirationReplySchema, aspirationSchema, aspirationStatusSchema, client, run(), toIso()

### Community 76 - "Community 76"
Cohesion: 0.29
Nodes (7): dependencies, @abdimas/contracts, @abdimas/db, @radix-ui/react-scroll-area, @abdimas/contracts, @abdimas/db, @radix-ui/react-scroll-area

### Community 77 - "Community 77"
Cohesion: 0.29
Nodes (7): scripts, build, dev, lint, start, test, test:watch

### Community 78 - "Community 78"
Cohesion: 0.29
Nodes (6): auth, dependencies, auth, _npx, packages, auth@latest

### Community 79 - "Community 79"
Cohesion: 0.43
Nodes (7): Repository Diff Snapshot, Admin Header Actions Redesign, Backend households.ts Route, Bansos Admin Module, Data Penduduk Admin Module, Household Relationship Normalization, Responsive clamp() Typography

### Community 80 - "Community 80"
Cohesion: 0.29
Nodes (6): dependencies, pnpm, pnpm, _npx, packages, pnpm@9.0.0

### Community 81 - "Community 81"
Cohesion: 0.29
Nodes (6): dependencies, pnpm, pnpm, _npx, packages, pnpm@10.0.0

### Community 82 - "Community 82"
Cohesion: 0.38
Nodes (6): fs, main(), { neon, neonConfig }, path, splitSqlStatements(), stripBom()

### Community 83 - "Community 83"
Cohesion: 0.29
Nodes (5): activityCategoryEnum, activityRelations, pemiluEvent, pemiluEventRelations, PemiluPollingStation

### Community 84 - "Community 84"
Cohesion: 0.29
Nodes (6): account, accountRelations, session, sessionRelations, userRelations, verification

### Community 85 - "Community 85"
Cohesion: 0.38
Nodes (5): citizenGenderEnum, citizenRelations, citizenStatusEnum, userIdentityRelations, verificationStatusEnum

### Community 86 - "Community 86"
Cohesion: 0.33
Nodes (4): dbState, logAdminActivity, sessionUser, storageState

### Community 89 - "Community 89"
Cohesion: 0.33
Nodes (5): paginationQuerySchema, historyItemSchema, historyListQuerySchema, historyListResponseSchema, historyTypeSchema

### Community 90 - "Community 90"
Cohesion: 0.33
Nodes (5): filterOpenIdx, fs, lines, startIdx, tempRtIdx

### Community 92 - "Community 92"
Cohesion: 0.50
Nodes (4): CATEGORY_TONE, CommentCarousel(), relativeTime(), ReplyItem

### Community 93 - "Community 93"
Cohesion: 0.40
Nodes (4): BansosApplication, BansosProgram, DUMMY_APPLICATIONS, DUMMY_PROGRAMS

### Community 94 - "Community 94"
Cohesion: 0.50
Nodes (5): PWA maskable icon SVG, App icon SVG, Next.js framework logo, Vercel platform logo, PWA / Web App (Next.js)

### Community 95 - "Community 95"
Cohesion: 0.40
Nodes (4): barangHilang, barangHilangRelations, reportPriorityEnum, reportStatusEnum

### Community 96 - "Community 96"
Cohesion: 0.40
Nodes (4): code, dialogFooterStart, fs, returnStart

### Community 97 - "Community 97"
Cohesion: 0.50
Nodes (3): name, private, version

### Community 98 - "Community 98"
Cohesion: 0.67
Nodes (4): Pharmindo25 Logo (Black/White variant), Pharmindo25 Logo (color), Pharmindo Building photo, Pharmindo25 Brand Identity

### Community 99 - "Community 99"
Cohesion: 0.50
Nodes (3): FrontendBackendTrace, frontendBackendTraceItemSchema, frontendBackendTraceSchema

### Community 100 - "Community 100"
Cohesion: 0.67
Nodes (3): base64(), main(), { randomBytes }

### Community 101 - "Community 101"
Cohesion: 0.83
Nodes (3): main(), normalizeDatabaseUrl(), readEnvValue()

### Community 102 - "Community 102"
Cohesion: 0.50
Nodes (3): serviceRequestRelations, serviceRequestStatusEnum, serviceRequestTypeEnum

### Community 103 - "Community 103"
Cohesion: 0.50
Nodes (3): files, fs, glob

### Community 108 - "Community 108"
Cohesion: 1.00
Nodes (3): Sign-in Authentication Flow, Sign-in Screenshot (phase1 port 3001), Sign-in Screenshot (phase1)

### Community 118 - "Community 118"
Cohesion: 0.67
Nodes (3): UI snapshot: empty <main>, UI snapshot: empty <main> w/ dev tools, UI snapshot: empty <main> w/ dev tools (repeat)

## Knowledge Gaps
- **728 isolated node(s):** `pnpm`, `pnpm@9.0.0`, `auth`, `auth@latest`, `pnpm` (+723 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **66 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `Community 76` to `Community 128`, `Community 129`, `Community 130`, `Community 131`, `Community 132`, `Community 133`, `Community 134`, `Community 135`, `Community 136`, `Community 137`, `Community 138`, `Community 139`, `Community 140`, `Community 141`, `Community 142`, `Community 143`, `Community 144`, `Community 145`, `Community 146`, `Community 147`, `Community 148`, `Community 149`, `App Root Layout & PWA`, `Community 97`, `Community 127`?**
  _High betweenness centrality (0.088) - this node is a cross-community bridge._
- **Why does `react` connect `App Root Layout & PWA` to `Community 46`, `Community 76`, `Community 30`?**
  _High betweenness centrality (0.086) - this node is a cross-community bridge._
- **Why does `useToast()` connect `Community 46` to `Community 32`, `Admin User Onboarding UI`, `Household Draft Forms`, `Admin List Pages`, `Aid Programs & Activities`, `Citizen Edit & Migration Forms`, `Community 43`, `Household Detail UI`, `Public Registration Form`, `Warga Lost Items UI`, `App Root Layout & PWA`?**
  _High betweenness centrality (0.082) - this node is a cross-community bridge._
- **What connects `pnpm`, `pnpm@9.0.0`, `auth` to the rest of the system?**
  _728 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `API Response & Pagination Helpers` be split into smaller, more focused modules?**
  _Cohesion score 0.058672276764843385 - nodes in this community are weakly interconnected._
- **Should `Admin User Onboarding UI` be split into smaller, more focused modules?**
  _Cohesion score 0.049019607843137254 - nodes in this community are weakly interconnected._
- **Should `Access Scoping & Audit Logging` be split into smaller, more focused modules?**
  _Cohesion score 0.13559322033898305 - nodes in this community are weakly interconnected._