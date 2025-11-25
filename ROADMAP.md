# Survey Frontend - Implementation Roadmap

## Project Overview
Production-ready Next.js 14+ (App Router) frontend for Survey Backend API built with TypeScript, Tailwind CSS, and modern React patterns.

---

## Architecture Decisions

### 1. State Management Strategy
- **React Query (@tanstack/react-query)**: Server state, caching, and data fetching
- **React Context**: Auth state (tokens, user info) - single source of truth
- **Local State**: Component-level UI state with React hooks

### 2. Authentication Flow
- **Token Storage**: `localStorage` for accessToken and refreshToken
- **Token Refresh**: Automatic refresh using axios interceptors (401 → refresh → retry)
- **Cookie Support**: `withCredentials: true` for X-Survey-Participant cookie (external participants)
- **Protected Routes**: Auth context with route guards

### 3. API Client Architecture
- **Base Client**: Axios instance with interceptors
- **Request Interceptor**: Auto-attach Bearer token from localStorage
- **Response Interceptor**: Handle 401 errors with automatic token refresh
- **Error Handling**: Centralized error parsing and user-friendly messages

### 4. Type Safety
- **Full Type Coverage**: TypeScript interfaces matching backend DTOs exactly
- **Zod Schemas**: Runtime validation for forms
- **Type Guards**: Ensure type safety at runtime

---

## Core Implementation Plan

### Phase 1: Foundation Setup ✅

#### 1.1 Dependencies Installation
```bash
npm install axios @tanstack/react-query react-hook-form @hookform/resolvers zod clsx tailwind-merge lucide-react
```

#### 1.2 Folder Structure
```
src/
├── app/                          # Next.js App Router
├── components/
│   └── ui/                       # Shadcn UI components
├── features/                     # Feature-based modules
│   ├── auth/
│   │   ├── hooks/               # useLogin, useLogout, useAuthTest
│   │   ├── components/          # LoginForm, ProtectedRoute
│   │   └── context/             # AuthContext, AuthProvider
│   ├── survey/
│   │   ├── hooks/               # useCreateSurvey, useGetSurvey, usePublishSurvey
│   │   └── components/          # SurveyForm, QuestionBuilder
│   ├── participation/
│   │   ├── hooks/               # useStartParticipation, useSubmitAnswer
│   │   └── components/          # ParticipationFlow, AnswerForm
│   └── management/
│       ├── hooks/               # useRoles, useDepartments, usePermissions
│       └── components/          # RoleManager, DepartmentList
├── lib/
│   ├── api.ts                   # Axios instance + interceptors
│   ├── utils.ts                 # cn() utility for Shadcn
│   └── errors.ts                # Error handling utilities
├── providers/
│   └── QueryProvider.tsx        # React Query setup
└── types/
    └── index.ts                 # TypeScript definitions

```

### Phase 2: Core Infrastructure

#### 2.1 Environment Configuration
**Files:**
- `.env.local` (gitignored)
- `.env.example` (committed)

**Variables:**
```env
NEXT_PUBLIC_API_URL=http://localhost:5123/api
NEXT_PUBLIC_TOKEN_STORAGE_KEY=survey_access_token
NEXT_PUBLIC_REFRESH_TOKEN_STORAGE_KEY=survey_refresh_token
```

#### 2.2 TypeScript Type Definitions (`src/types/index.ts`)

**Key Types:**

**Enums (String-based, matching backend):**
```typescript
export type AccessType = 'Internal' | 'Public';
export type QuestionType = 'SingleSelect' | 'MultiSelect' | 'OpenText';
```

**Auth:**
```typescript
LoginRequest { username, password }
RefreshTokenRequest { refreshToken }
LogoutRequest { refreshToken }
AuthTokensDto { accessToken, refreshToken, expiresIn }
AuthTestResponse { isAuthenticated, claims }
UpdateAdminPasswordRequest { newPassword }
```

**Survey:**
```typescript
CreateSurveyRequest { title, description, accessType, questions[] }
CreateQuestionDto { text, type, order, isRequired, options[] }
PublishSurveyRequest { startDate, endDate }
SurveyDetailDto { id, title, description, accessType, startDate, endDate, questions[] }
QuestionDto { id, text, description, type, order, isRequired, options[] }
OptionDto { id, text, order, value }
```

**Participation:**
```typescript
StartParticipationRequest { surveyId }
SubmitAnswerRequest { questionId, textValue?, optionIds[] }
```

**Management:**
```typescript
RoleDto { id, name, description, permissions[] }
CreateRoleCommand { name, description, permissions[] }
PermissionDto { id, name, description }
DepartmentDto { id, name, externalIdentifier }
UserDto { id, username, email, roles[] }
AssignRoleToUserCommand { userId, roleId }
RemoveRoleFromUserCommand { userId, roleId }
```

#### 2.3 API Client (`src/lib/api.ts`)

**Features:**
- Base URL from environment variable
- `withCredentials: true` for cookie support
- Request interceptor: Attach `Authorization: Bearer {token}`
- Response interceptor: Handle 401 with automatic token refresh
- Token refresh logic: POST /api/auth/refresh → update localStorage → retry original request
- Prevent refresh loops with flag

**Example Structure:**
```typescript
export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' }
});

// Request interceptor: attach token
// Response interceptor: handle 401 errors
```

#### 2.4 Auth Context (`src/features/auth/context/AuthContext.tsx`)

**Responsibilities:**
- Manage auth state (tokens, user info, loading)
- Provide login/logout methods
- Token persistence (localStorage)
- Initial auth check on mount
- Expose `isAuthenticated` boolean

**API:**
```typescript
{
  isAuthenticated: boolean,
  isLoading: boolean,
  user: { userId: string, roles: string[] } | null,
  login: (username, password) => Promise<void>,
  logout: () => Promise<void>,
  refreshTokens: () => Promise<void>
}
```

#### 2.5 React Query Setup (`src/providers/QueryProvider.tsx`)

**Configuration:**
```typescript
defaultOptions: {
  queries: {
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    refetchOnWindowFocus: false
  }
}
```

#### 2.6 Error Handling (`src/lib/errors.ts`)

**Features:**
- Parse API error responses
- User-friendly error messages
- Type-safe error handling
- Logging for debugging

---

### Phase 3: Feature Implementation

#### 3.1 Auth Feature (`src/features/auth/`)

**Hooks:**
- `useLogin()` → POST /api/auth/login
- `useLogout()` → POST /api/auth/logout
- `useRefreshToken()` → POST /api/auth/refresh
- `useAuthTest()` → GET /api/auth/test
- `useUpdateAdminPassword()` → POST /api/auth/admin/password

**Components:**
- `LoginForm` (react-hook-form + zod)
- `ProtectedRoute` (wrapper for authenticated pages)

#### 3.2 Survey Feature (`src/features/survey/`)

**Hooks:**
- `useCreateSurvey()` → POST /api/surveys
- `useGetSurvey(id)` → GET /api/surveys/{id}
- `useAddQuestion(surveyId)` → POST /api/surveys/{id}/questions
- `usePublishSurvey(surveyId)` → PATCH /api/surveys/{id}/publish

**Components:**
- `SurveyForm` (multi-step survey creation)
- `QuestionBuilder` (dynamic question/option editor)

#### 3.3 Participation Feature (`src/features/participation/`)

**Hooks:**
- `useStartParticipation()` → POST /api/participations/start
- `useSubmitAnswer(participationId)` → POST /api/participations/{id}/answers
- `useCompleteParticipation(participationId)` → PATCH /api/participations/{id}/complete

**Components:**
- `ParticipationFlow` (step-by-step survey participation)
- `AnswerForm` (handles SingleSelect, MultiSelect, OpenText)

#### 3.4 Management Feature (`src/features/management/`)

**Hooks:**
- `useRoles()` → GET /api/roles
- `useCreateRole()` → POST /api/roles
- `usePermissions()` → GET /api/permissions
- `useDepartments()` → GET /api/departments
- `useDepartmentUsers(deptId)` → GET /api/departments/{id}/users
- `useAssignRole()` → POST /api/departmentrole/assign
- `useRemoveRole()` → POST /api/departmentrole/remove

---

## Production Best Practices

### Security
1. **Token Security:**
   - Store tokens in localStorage (XSS protection via CSP)
   - HttpOnly cookies for X-Survey-Participant (handled by backend)
   - Never expose tokens in URLs or logs

2. **HTTPS Only:**
   - Enforce HTTPS in production
   - Set secure environment variables

3. **Input Validation:**
   - Zod schemas for all forms
   - Server-side validation respected

### Performance
1. **React Query Optimization:**
   - Implement proper cache invalidation
   - Use prefetching for predictable navigation
   - Optimistic updates for better UX

2. **Code Splitting:**
   - Dynamic imports for feature modules
   - Route-based code splitting (Next.js automatic)

3. **Image Optimization:**
   - Next.js Image component
   - Proper sizing and formats

### Error Handling
1. **User Feedback:**
   - Toast notifications for errors
   - Form validation errors
   - Loading states

2. **Logging:**
   - Console errors in development
   - Error tracking service in production (e.g., Sentry)

### Accessibility
1. **ARIA Labels:**
   - Proper semantic HTML
   - Screen reader support

2. **Keyboard Navigation:**
   - Focus management
   - Tab order

---

## Implementation Steps (Current Plan)

1. ✅ Review backend documentation
2. ✅ Create roadmap document
3. ⏳ Install dependencies
4. ⏳ Create folder structure
5. ⏳ Set up environment configuration
6. ⏳ Create TypeScript type definitions
7. ⏳ Create Shadcn UI utils
8. ⏳ Create API client with interceptors
9. ⏳ Create error handling utility
10. ⏳ Create Auth Context
11. ⏳ Create React Query Provider
12. ⏳ Update root layout
13. ⏳ Create auth hooks
14. ⏳ Create survey hooks
15. ⏳ Create participation hooks
16. ⏳ Create management hooks

---

## Questions & Decisions Needed

### 1. Token Refresh Strategy
**Current Plan:** Automatic refresh on 401 using axios interceptor
**Alternative:** Proactive refresh before token expires
**Question:** Do you prefer automatic (reactive) or proactive refresh?

### 2. Error Toast/Notification System
**Current Plan:** Will implement basic error handling, but no UI library yet
**Question:** Do you want me to add a toast library (react-hot-toast, sonner) or build custom?

### 3. Form Validation Error Display
**Current Plan:** Inline errors below form fields
**Question:** Any specific UX pattern you prefer for validation errors?

### 4. Route Protection Strategy
**Current Plan:** Auth context + ProtectedRoute wrapper component
**Alternative:** Middleware-based protection (Next.js middleware)
**Question:** Prefer component-based or middleware-based route protection?

### 5. Shadcn UI Components
**Current Plan:** Create utils, but won't pre-install Shadcn components
**Question:** Should I set up Shadcn CLI and install initial components (Button, Input, Form, etc.)?

---

## Next Steps

Once you review this roadmap:
1. Provide feedback on architecture decisions
2. Answer the questions above
3. Approve to proceed with implementation

I'll then execute the implementation step-by-step, creating each file with production-ready code.
