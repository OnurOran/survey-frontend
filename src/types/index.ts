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
  refreshToken?: string;
}

export interface LogoutRequest {
  refreshToken?: string;
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
  id: number;
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
  StartDate: Date; // Date object (PascalCase for C# backend)
  EndDate: Date; // Date object (PascalCase for C# backend)
}

export interface SurveyListItemDto {
  id: number;
  surveyNumber: number;
  slug: string;
  title: string;
  description: string;
  departmentId: number;
  accessType: AccessType;
  isActive: boolean;
  createdAt: Date;
  startDate: Date | null;
  endDate: Date | null;
  createdBy: string;
}

export interface SurveyDetailDto {
  id: number;
  surveyNumber: number;
  slug: string;
  title: string;
  description: string;
  introText?: string | null;
  consentText?: string | null;
  outroText?: string | null;
  accessType: AccessType;
  startDate: Date | null;
  endDate: Date | null;
  questions: QuestionDto[];
  attachment?: AttachmentMetadata | null;
}

export interface QuestionDto {
  id: number;
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
  id: number;
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
  Slug: string; // PascalCase for C# backend - format: "{slug}-{number}"
}

export interface SubmitAnswerRequest {
  questionId: number;
  textValue?: string | null;
  optionIds: number[];
  attachment?: AttachmentDto | null;
}

// Response is just a number (participationId)
export type StartParticipationResponse = number;

export interface ParticipationStatusResult {
  hasParticipated: boolean;
  isCompleted: boolean;
  completedAt: Date | null;
}

// ============================================
// MANAGEMENT
// ============================================

export interface RoleDto {
  id: number;
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
  id: number;
  name: string;
  description: string;
}

export interface DepartmentDto {
  id: number;
  name: string;
  externalIdentifier: string;
}

export interface UserDto {
  id: number;
  username: string;
  email: string;
  roles: string[];
}

export interface AssignRoleToUserCommand {
  userId: number;
  roleId: number;
}

export interface RemoveRoleFromUserCommand {
  userId: number;
  roleId: number;
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
  surveyId: number;
  title: string;
  description: string;
  introText?: string | null;
  outroText?: string | null;
  accessType: AccessType;
  startDate: Date | null;
  endDate: Date | null;
  isActive: boolean;
  totalParticipations: number;
  completedParticipations: number;
  completionRate: number;
  participants: ParticipantSummaryDto[];
  questions: QuestionReportDto[];
  attachment?: AttachmentMetadata | null;
}

export interface ParticipantSummaryDto {
  participationId: number;
  participantName: string | null;
  isCompleted: boolean;
  startedAt: Date;
}

export interface QuestionReportDto {
  questionId: number;
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
  optionId: number;
  text: string;
  order: number;
  selectionCount: number;
  percentage: number;
  attachment?: AttachmentMetadata | null;
}

export interface TextResponseDto {
  participationId: number;
  participantName?: string | null;
  textValue: string;
  submittedAt: Date;
}

export interface FileResponseDto {
  answerId: number;
  attachmentId: number;
  participationId: number;
  participantName?: string | null;
  fileName: string;
  contentType: string;
  sizeBytes: number;
  submittedAt: Date;
}

export interface ConditionalBranchResultDto {
  parentOptionId: number;
  parentOptionText: string;
  participantCount: number;
  childQuestions: QuestionReportDto[];
}

export interface ParticipantResponseDto {
  participationId: number;
  participantName: string | null;
  isCompleted: boolean;
  startedAt: Date;
  completedAt: Date | null;
  answers: ParticipantAnswerDto[];
}

export interface ParticipantAnswerDto {
  questionId: number;
  questionText: string;
  textValue: string | null;
  selectedOptions: string[];
  fileName: string | null;
  answerId: number | null;
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
