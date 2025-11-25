// ============================================
// ENUMS & TYPES
// ============================================

/**
 * Survey access type - matches backend enum
 * Internal: Only for internal employees
 * Public: Open to external participants
 */
export type AccessType = 'Internal' | 'Public';

/**
 * Question type - matches backend enum
 * SingleSelect: Radio button - single choice
 * MultiSelect: Checkboxes - multiple choices
 * OpenText: Text input/textarea
 */
export type QuestionType = 'SingleSelect' | 'MultiSelect' | 'OpenText';

// ============================================
// AUTH
// ============================================

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface LogoutRequest {
  refreshToken: string;
}

export interface AuthTokensDto {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthTestResponse {
  isAuthenticated: boolean;
  claims: Array<{
    type: string;
    value: string;
  }>;
}

export interface UserPermissions {
  permissions: string[];
  isSuperAdmin: boolean;
}

export interface UpdateAdminPasswordRequest {
  newPassword: string;
}

// ============================================
// SURVEY
// ============================================

export interface CreateSurveyRequest {
  title: string;
  description: string;
  accessType: AccessType;
  questions: CreateQuestionDto[];
}

export interface CreateQuestionDto {
  text: string;
  description?: string | null;
  type: QuestionType;
  order: number;
  isRequired: boolean;
  options: CreateOptionDto[] | null;
}

export interface CreateOptionDto {
  text: string;
  order: number;
  value: number;
}

export interface PublishSurveyRequest {
  startDate: string; // ISO 8601 format
  endDate: string; // ISO 8601 format
}

export interface SurveyDetailDto {
  id: string;
  title: string;
  description: string;
  accessType: AccessType;
  startDate: string | null;
  endDate: string | null;
  questions: QuestionDto[];
}

export interface QuestionDto {
  id: string;
  text: string;
  description?: string | null;
  type: QuestionType;
  order: number;
  isRequired: boolean;
  options: OptionDto[];
}

export interface OptionDto {
  id: string;
  text: string;
  order: number;
  value: number;
}

// ============================================
// PARTICIPATION
// ============================================

export interface StartParticipationRequest {
  surveyId: string;
}

export interface SubmitAnswerRequest {
  questionId: string;
  textValue?: string | null;
  optionIds: string[];
}

// Response is just a string (participationId)
export type StartParticipationResponse = string;

// ============================================
// MANAGEMENT
// ============================================

export interface RoleDto {
  id: string;
  name: string;
  description: string;
  permissions: string[];
}

export interface CreateRoleCommand {
  name: string;
  description: string;
  permissions: string[];
}

export interface PermissionDto {
  id: string;
  name: string;
  description: string;
}

export interface DepartmentDto {
  id: string;
  name: string;
  externalIdentifier: string;
}

export interface UserDto {
  id: string;
  username: string;
  email: string;
  roles: string[];
}

export interface AssignRoleToUserCommand {
  userId: string;
  roleId: string;
}

export interface RemoveRoleFromUserCommand {
  userId: string;
  roleId: string;
}

// ============================================
// API ERROR RESPONSE
// ============================================

export interface ApiErrorResponse {
  message: string;
  errors?: Record<string, string[]>;
  statusCode?: number;
}

// ============================================
// UTILITY TYPES
// ============================================

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  pageSize: number;
  currentPage: number;
  totalPages: number;
}
