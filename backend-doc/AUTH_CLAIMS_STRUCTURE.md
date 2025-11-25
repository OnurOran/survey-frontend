# Authentication Claims and Token Details

The details below are pulled from the current implementation (`JwtTokenService`, `AuthController`, `CurrentUserService`, and `appsettings.json`) so the claim names, payloads, and responses match what the API actually issues today.

## 1) JWT Token Claims Structure

Claims are built in `src/SurveyBackend.Infrastructure/Security/JwtTokenService.cs` using the authenticated `User` plus resolved permissions.

| Claim type | Example value | Source | Notes |
| --- | --- | --- | --- |
| `sub` | `8f7e2c3a-1c2b-4f5d-9a6b-1b2c3d4e5f60` | `JwtRegisteredClaimNames.Sub` set to `user.Id` | Registered subject; also used to identify the user. |
| `http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier` | `8f7e2c3a-1c2b-4f5d-9a6b-1b2c3d4e5f60` | `ClaimTypes.NameIdentifier` set to `user.Id` | Encoded as `sub` in the JWT by default claim mapping, then mapped back to this URI when read. |
| `username` | `admin` | `user.Username` | Plain username string. |
| `departmentId` | `11111111-1111-1111-1111-111111111111` | `user.DepartmentId` | `SystemDepartmentId` from `DatabaseSeeder` for the seeded admin; other users carry their own department. |
| `permissions` | `["CreateSurvey","EditSurvey","ViewSurveyResults","ManageUsers","ManageDepartment"]` | Distinct permission names resolved from the user’s roles (or all permissions for super admin) | Stored as a JSON array string in the claim. |
| `isSuperAdmin` | `true` | `user.IsSuperAdmin` as lowercase string | `true` for the seeded `admin` user. |

Standard JWT fields are also present via the token descriptor: `iss` = `SurveyBackend`, `aud` = `SurveyBackend`, and `exp` set to `AccessTokenMinutes` (15) from configuration. No email or role claim is emitted by the backend.

## 2) Auth Test Endpoint (`/api/auth/test`) Response

`AuthController.Test` (`src/SurveyBackend.Api/Controllers/AuthController.cs`) returns authentication state and the claims from the current `ClaimsPrincipal`.

- Shape:
  ```json
  {
    "isAuthenticated": true,
    "claims": [
      { "type": "...", "value": "..." }
    ]
  }
  ```
- Example response for the seeded super admin (after JWT validation maps inbound claims):
  ```json
  {
    "isAuthenticated": true,
    "claims": [
      { "type": "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier", "value": "8f7e2c3a-1c2b-4f5d-9a6b-1b2c3d4e5f60" },
      { "type": "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier", "value": "8f7e2c3a-1c2b-4f5d-9a6b-1b2c3d4e5f60" },
      { "type": "username", "value": "admin" },
      { "type": "departmentId", "value": "11111111-1111-1111-1111-111111111111" },
      { "type": "permissions", "value": "[\"CreateSurvey\",\"EditSurvey\",\"ViewSurveyResults\",\"ManageUsers\",\"ManageDepartment\"]" },
      { "type": "isSuperAdmin", "value": "true" },
      { "type": "iss", "value": "SurveyBackend" },
      { "type": "aud", "value": "SurveyBackend" }
    ]
  }
  ```
  (The duplicated `nameidentifier` entries come from having both a `sub` claim and a `ClaimTypes.NameIdentifier` claim, which are both mapped inbound to the same claim type.)

## 3) Login Endpoint (`/api/auth/login`) Response

`AuthController.Login` returns `AuthTokensDto` (`src/SurveyBackend.Application/Modules/Auth/DTOs/AuthTokensDto.cs`) serialized with the default camelCase JSON policy:

```json
{
  "accessToken": "<JWT string>",
  "refreshToken": "<base64 64-byte token>",
  "expiresIn": 900
}
```

- `accessToken`: JWT containing the claims above.
- `refreshToken`: 64-byte secure random token (Base64) valid for `RefreshTokenDays` (30).
- `expiresIn`: Seconds until the access token expires; calculated from `AccessTokenMinutes` (15 minutes => 900 seconds).

## 4) User Claims Mapping

- User ID: `sub` and `http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier` both carry `user.Id`.
- Username: `username`.
- Roles: **not emitted** as role claims; permissions derived from roles are emitted as a JSON array string in `permissions`.
- Email: **not emitted** in the JWT.
- Department: `departmentId`.
- Super admin flag: `isSuperAdmin`.

## 5) Role and Permission Structure

- Claim storage: roles themselves are **not** placed in the token; instead, the flattened permission names are stored in a single `permissions` claim as a JSON array string.
- Possible role values (seeded in `DatabaseSeeder`): `"Admin"` (all permissions) and `"Manager"` (CreateSurvey, EditSurvey, ViewSurveyResults, ManageDepartment). Additional roles can be created via the role APIs.
- Default permission set seeded: `CreateSurvey`, `EditSurvey`, `ViewSurveyResults`, `ManageUsers`, `ManageDepartment`.
- Super admin behavior: `isSuperAdmin = true` bypasses permission checks and injects all permissions into the `permissions` claim.

## 6) JWT Configuration (`appsettings.json`)

From `src/SurveyBackend.Api/appsettings.json`:

```json
"Jwt": {
  "Issuer": "SurveyBackend",
  "Audience": "SurveyBackend",
  "SecretKey": "ThisIsA_MuchLongerAndMoreSecureSecretKey_ForHS256_!@#$",
  "AccessTokenMinutes": 15,
  "RefreshTokenDays": 30
}
```

Development override (`src/SurveyBackend.Api/appsettings.Development.json`) keeps the same Issuer/Audience and durations but uses `"SecretKey": "ChangeThisDevelopmentSecretKey123!"`.
