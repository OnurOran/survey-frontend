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
 * FileUpload: File upload - max 5MB
 * Conditional: Conditional branching - shows different child questions based on selected option
 */
export type QuestionType = 'SingleSelect' | 'MultiSelect' | 'OpenText' | 'FileUpload' | 'Conditional';

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

// Attachment for upload (CREATE operations)
export interface AttachmentDto {
  fileName: string;
  contentType: string;
  base64Content: string;
}

// Attachment metadata from backend (READ operations)
export interface AttachmentMetadata {
  id: string;
  fileName: string;
  contentType: string;
  sizeBytes: number;
}

export interface CreateSurveyRequest {
  title: string;
  description: string;
  introText?: string | null;
  consentText?: string | null;
  outroText?: string | null;
  accessType: AccessType;
  attachment?: AttachmentDto | null;
  questions: CreateQuestionDto[];
}

export interface CreateQuestionDto {
  text: string;
  type: QuestionType;
  order: number;
  isRequired: boolean;
  options: CreateOptionDto[] | null;
  attachment?: AttachmentDto | null;
  allowedAttachmentContentTypes?: string[] | null; // Only for FileUpload type
  childQuestions?: CreateChildQuestionDto[] | null; // Only for Conditional type
}

export interface CreateChildQuestionDto {
  parentOptionOrder: number;
  text: string;
  type: QuestionType;
  order: number;
  isRequired: boolean;
  options: CreateOptionDto[] | null;
  attachment?: AttachmentDto | null;
  allowedAttachmentContentTypes?: string[] | null;
}

export interface CreateOptionDto {
  text: string;
  order: number;
  value: number | null;
  attachment?: AttachmentDto | null;
}

export interface PublishSurveyRequest {
  StartDate: string; // ISO 8601 format (PascalCase for C# backend)
  EndDate: string; // ISO 8601 format (PascalCase for C# backend)
}

export interface SurveyListItemDto {
  id: string;
  title: string;
  description: string;
  departmentId: string;
  accessType: AccessType;
  isActive: boolean;
  createdAt: string;
  startDate: string | null;
  endDate: string | null;
  createdBy: string;
}

export interface SurveyDetailDto {
  id: string;
  title: string;
  description: string;
  introText?: string | null;
  consentText?: string | null;
  outroText?: string | null;
  accessType: AccessType;
  startDate: string | null;
  endDate: string | null;
  questions: QuestionDto[];
  attachment?: AttachmentMetadata | null;
}

export interface QuestionDto {
  id: string;
  text: string;
  description?: string | null;
  type: QuestionType;
  order: number;
  isRequired: boolean;
  options: OptionDto[];
  attachment?: AttachmentMetadata | null;
  allowedAttachmentContentTypes?: string[] | null;
}

export interface OptionDto {
  id: string;
  text: string;
  order: number;
  value: number;
  attachment?: AttachmentMetadata | null;
  childQuestions?: QuestionDto[] | null; // Only for Conditional question options
}

// ============================================
// PARTICIPATION
// ============================================

export interface StartParticipationRequest {
  SurveyId: string; // PascalCase for C# backend
}

export interface SubmitAnswerRequest {
  questionId: string;
  textValue?: string | null;
  optionIds: string[];
  attachment?: AttachmentDto | null;
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
