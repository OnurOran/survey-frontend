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

export interface ParticipationStatusResult {
  hasParticipated: boolean;
  isCompleted: boolean;
  completedAt: string | null;
}

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
// SURVEY REPORTS
// ============================================

export interface SurveyReportDto {
  surveyId: string;
  title: string;
  description: string;
  introText?: string | null;
  outroText?: string | null;
  accessType: AccessType;
  startDate: string | null;
  endDate: string | null;
  isActive: boolean;
  totalParticipations: number;
  completedParticipations: number;
  completionRate: number;
  participants: ParticipantSummaryDto[];
  questions: QuestionReportDto[];
  attachment?: AttachmentMetadata | null;
}

export interface ParticipantSummaryDto {
  participationId: string;
  participantName: string | null;
  isCompleted: boolean;
  startedAt: string;
}

export interface QuestionReportDto {
  questionId: string;
  text: string;
  type: QuestionType;
  order: number;
  isRequired: boolean;
  totalResponses: number;
  responseRate: number;
  attachment?: AttachmentMetadata | null;
  optionResults?: OptionResultDto[];
  textResponses?: TextResponseDto[];
  fileResponses?: FileResponseDto[];
  conditionalResults?: ConditionalBranchResultDto[];
}

export interface OptionResultDto {
  optionId: string;
  text: string;
  order: number;
  selectionCount: number;
  percentage: number;
  attachment?: AttachmentMetadata | null;
}

export interface TextResponseDto {
  participationId: string;
  participantName?: string | null;
  textValue: string;
  submittedAt: string;
}

export interface FileResponseDto {
  answerId: string;
  attachmentId: string;
  participationId: string;
  participantName?: string | null;
  fileName: string;
  contentType: string;
  sizeBytes: number;
  submittedAt: string;
}

export interface ConditionalBranchResultDto {
  parentOptionId: string;
  parentOptionText: string;
  participantCount: number;
  childQuestions: QuestionReportDto[];
}

export interface ParticipantResponseDto {
  participationId: string;
  participantName: string | null;
  isCompleted: boolean;
  startedAt: string;
  completedAt: string | null;
  answers: ParticipantAnswerDto[];
}

export interface ParticipantAnswerDto {
  questionId: string;
  questionText: string;
  textValue: string | null;
  selectedOptions: string[];
  fileName: string | null;
  answerId: string | null;
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
