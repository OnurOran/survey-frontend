# Survey Backend API Documentation

Base URL: `https://localhost:7123/api` (use `{{baseUrl}}` in Postman).

## Auth
### Login
- **Method & URL:** `POST /api/auth/login`
- **Authorization:** Public
- **Request Body:**
```json
{
  "username": "admin",
  "password": "Passw0rd!"
}
```
- **Success Response (200 OK):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "d0a81f6c-2a27-4e4d-9ad3-16e311a1b6a1",
  "expiresIn": 3600
}
```

### Refresh Token
- **Method & URL:** `POST /api/auth/refresh`
- **Authorization:** Public
- **Request Body:**
```json
{
  "refreshToken": "{{token}}"
}
```
- **Success Response (200 OK):** same shape as **Login**.

### Logout
- **Method & URL:** `POST /api/auth/logout`
- **Authorization:** Bearer Token
- **Request Body:**
```json
{
  "refreshToken": "{{token}}"
}
```
- **Success Response (204 No Content)**

### Auth Test
- **Method & URL:** `GET /api/auth/test`
- **Authorization:** Bearer Token
- **Request Body:** none
- **Success Response (200 OK):**
```json
{
  "isAuthenticated": true,
  "claims": [
    { "type": "sub", "value": "f5e4c7c9-86be-4f9e-8043-7361e5c6f5f3" },
    { "type": "role", "value": "Admin" }
  ]
}
```

### Update Admin Password
- **Method & URL:** `POST /api/auth/admin/password`
- **Authorization:** Bearer Token
- **Request Body:**
```json
{
  "newPassword": "N3wAdm1nPass!"
}
```
- **Success Response (204 No Content)**

## Surveys
### Create Survey
- **Method & URL:** `POST /api/surveys`
- **Authorization:** Bearer Token (ManageUsersOrDepartment)
- **Request Body (CreateSurveyCommand):**
```json
{
  "title": "Employee Satisfaction 2024",
  "description": "Quarterly pulse check",
  "accessType": "Internal",
  "questions": [
    {
      "text": "How satisfied are you with your work environment?",
      "type": "SingleSelect",
      "order": 1,
      "isRequired": true,
      "options": [
        { "text": "Very satisfied", "order": 1, "value": 5 },
        { "text": "Satisfied", "order": 2, "value": 4 },
        { "text": "Neutral", "order": 3, "value": 3 },
        { "text": "Dissatisfied", "order": 4, "value": 2 }
      ]
    },
    {
      "text": "What should we improve?",
      "type": "OpenText",
      "order": 2,
      "isRequired": false,
      "options": null
    }
  ]
}
```
- **Success Response (201 Created):** empty body, `Location` header pointing to `/api/surveys/{id}`.

### Get Survey
- **Method & URL:** `GET /api/surveys/{id}`
- **Authorization:** Public
- **Request Body:** none
- **Success Response (200 OK):**
```json
{
  "id": "{{surveyId}}",
  "title": "Employee Satisfaction 2024",
  "description": "Quarterly pulse check",
  "accessType": "Internal",
  "startDate": "2024-09-01T00:00:00Z",
  "endDate": "2024-10-01T00:00:00Z",
  "questions": [
    {
      "id": "{{questionId}}",
      "text": "How satisfied are you with your work environment?",
      "description": null,
      "type": "SingleSelect",
      "order": 1,
      "isRequired": true,
      "options": [
        { "id": "f8f2e2d0-6b1c-4d4b-9b6b-5dc149e42b0d", "text": "Very satisfied", "order": 1, "value": 5 }
      ]
    }
  ]
}
```

### Add Question
- **Method & URL:** `POST /api/surveys/{id}/questions`
- **Authorization:** Bearer Token (ManageUsersOrDepartment)
- **Request Body (CreateQuestionDto):**
```json
{
  "text": "Would you recommend working here to a friend?",
  "type": "SingleSelect",
  "order": 3,
  "isRequired": true,
  "options": [
    { "text": "Yes", "order": 1, "value": 1 },
    { "text": "No", "order": 2, "value": 0 }
  ]
}
```
- **Success Response (201 Created):** empty body, `Location` header pointing to the survey resource.

### Publish Survey
- **Method & URL:** `PATCH /api/surveys/{id}/publish`
- **Authorization:** Bearer Token (ManageUsersOrDepartment)
- **Request Body (PublishSurveyRequest):**
```json
{
  "startDate": "2024-09-01T00:00:00Z",
  "endDate": "2024-10-01T00:00:00Z"
}
```
- **Success Response (204 No Content)**
- **Important:** Survey ID comes from the URL; **do not include `surveyId` in the body**.

## Participations
### Start Participation
- **Method & URL:** `POST /api/participations/start`
- **Authorization:** Public
- **Request Body (StartParticipationRequest):**
```json
{
  "surveyId": "{{surveyId}}"
}
```
- **Success Response (200 OK):**
```json
"{{participationId}}"
```
- **Important:** External participant ID is resolved via the secure cookie `X-Survey-Participant`; **no `externalId` should be sent in the body**.

### Submit Answer
- **Method & URL:** `POST /api/participations/{id}/answers`
- **Authorization:** Public
- **Request Body (SubmitAnswerRequest):**
```json
{
  "questionId": "{{questionId}}",
  "textValue": "I appreciate the flexible hours.",
  "optionIds": ["c199edc7-b2a0-4c1d-b0c1-1ef38f68c2e4"]
}
```
- **Success Response (204 No Content)**
- **Important:** Participation ID comes from the URL; **do not include `participationId` in the body**.

### Complete Participation
- **Method & URL:** `PATCH /api/participations/{id}/complete`
- **Authorization:** Public
- **Request Body:** none
- **Success Response (204 No Content)**

## Management
### Roles
- **List Roles**
  - **Method & URL:** `GET /api/roles`
  - **Authorization:** Bearer Token (ManageUsersOrDepartment)
  - **Success Response (200 OK):**
```json
[
  {
    "id": "c56a4180-65aa-42ec-a945-5fd21dec0538",
    "name": "SurveyManager",
    "description": "Can create and publish surveys",
    "permissions": ["ManageUsers", "ManageDepartment"]
  }
]
```
- **Create Role**
  - **Method & URL:** `POST /api/roles`
  - **Authorization:** Bearer Token (ManageUsers)
  - **Request Body (CreateRoleCommand):**
```json
{
  "name": "DepartmentManager",
  "description": "Can manage surveys for their department",
  "permissions": ["ManageDepartment"]
}
```
  - **Success Response (201 Created):** empty body, `Location` header pointing to `/api/roles`.

### Permissions
- **Method & URL:** `GET /api/permissions`
- **Authorization:** Bearer Token (ManageUsersOrDepartment)
- **Success Response (200 OK):**
```json
[
  { "id": "5e9b3a4c-88ed-4d13-9ef2-b07f3bb9184a", "name": "ManageUsers", "description": "Full user and role management" },
  { "id": "c9ab59de-f274-4e6b-842d-df2a52fcb7c5", "name": "ManageDepartment", "description": "Manage users in own department" }
]
```

### Departments
- **List Departments**
  - **Method & URL:** `GET /api/departments`
  - **Authorization:** Bearer Token (ManageUsers)
  - **Success Response (200 OK):**
```json
[
  { "id": "b1c23b80-2f5c-4f97-bc1b-4be2f75f7d6c", "name": "Engineering", "externalIdentifier": "ENG-001" }
]
```
- **Department Users**
  - **Method & URL:** `GET /api/departments/{departmentId}/users`
  - **Authorization:** Bearer Token (ManageUsersOrDepartment)
  - **Success Response (200 OK):**
```json
[
  {
    "id": "7e95f2b3-2157-4f96-8cde-7644aa3c0f71",
    "username": "jane.doe",
    "email": "jane.doe@company.com",
    "roles": ["SurveyManager"]
  }
]
```

### Department Roles
- **Assign Role to User**
  - **Method & URL:** `POST /api/departmentrole/assign`
  - **Authorization:** Bearer Token (ManageUsersOrDepartment)
  - **Request Body (AssignRoleToUserCommand):**
```json
{
  "userId": "7e95f2b3-2157-4f96-8cde-7644aa3c0f71",
  "roleId": "c56a4180-65aa-42ec-a945-5fd21dec0538"
}
```
  - **Success Response (204 No Content)**

- **Remove Role from User**
  - **Method & URL:** `POST /api/departmentrole/remove`
  - **Authorization:** Bearer Token (ManageUsersOrDepartment)
  - **Request Body (RemoveRoleFromUserCommand):**
```json
{
  "userId": "7e95f2b3-2157-4f96-8cde-7644aa3c0f71",
  "roleId": "c56a4180-65aa-42ec-a945-5fd21dec0538"
}
```
  - **Success Response (204 No Content)**

