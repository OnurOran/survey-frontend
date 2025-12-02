import { QuestionType } from '@/src/types';

/**
 * Attachment data for survey/question/option
 * Max 5MB, allowed types: png, jpg, jpeg, webp, pdf
 */
export interface AttachmentData {
  fileName: string;
  contentType: string;
  base64Content: string;
}

/**
 * Option form data (used in editor)
 */
export interface OptionFormData {
  text: string;
  order: number;
  value: number;
  attachment: AttachmentData | null;
}

/**
 * Child question form data (for Conditional questions)
 */
export interface ChildQuestionFormData {
  parentOptionOrder: number; // Which option this child belongs to (1, 2, or 3)
  text: string;
  description?: string;
  type: QuestionType;
  order: number;
  isRequired: boolean;
  attachment: AttachmentData | null;
  options: OptionFormData[];
  allowedAttachmentContentTypes?: string[]; // Only for FileUpload
}

/**
 * Question form data (used in editor)
 */
export interface QuestionFormData {
  text: string;
  description?: string;
  type: QuestionType;
  order: number;
  isRequired: boolean;
  attachment: AttachmentData | null;
  options: OptionFormData[];
  allowedAttachmentContentTypes?: string[]; // Only for FileUpload
  childQuestions?: ChildQuestionFormData[]; // Only for Conditional type
}

/**
 * Survey form data (used in editor)
 */
export interface SurveyFormData {
  title: string;
  description: string;
  introText?: string;
  consentText?: string;
  outroText?: string;
  accessType: 'Internal' | 'Public';
  attachment: AttachmentData | null;
  questions: QuestionFormData[];
}

/**
 * Validation error
 */
export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Props for question editor component
 */
export interface QuestionEditorProps {
  question: QuestionFormData;
  questionIndex: number;
  totalQuestions: number;
  onChange: (updated: QuestionFormData) => void;
  onRemove: () => void;
  onReorder: (newOrder: number) => void;
}

/**
 * Question type configuration
 */
export interface QuestionTypeConfig {
  type: QuestionType;
  label: string;
  description: string;
  icon: React.ReactNode;

  // Capabilities
  requiresOptions: boolean;
  supportsQuestionAttachment: boolean;
  supportsOptionAttachment: boolean;
  supportsAllowedContentTypes: boolean;

  // Editor component
  EditorComponent: React.ComponentType<QuestionEditorProps>;

  // Validation
  validateQuestion: (data: QuestionFormData) => ValidationError[];
}
