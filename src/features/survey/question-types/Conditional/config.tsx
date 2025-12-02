import { QuestionTypeConfig, ValidationError, QuestionFormData } from '../types';
import { ConditionalEditor } from './ConditionalEditor';

/**
 * Conditional question type configuration
 * Shows different child questions based on selected option
 */
export const conditionalConfig: QuestionTypeConfig = {
  type: 'Conditional',
  label: 'Koşullu Soru',
  description: 'Seçilen seçeneğe göre farklı alt sorular gösterir',
  icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12M8 12h12m-12 5h12M4 7h.01M4 12h.01M4 17h.01" />
    </svg>
  ),

  // Capabilities
  requiresOptions: true,
  supportsQuestionAttachment: true,
  supportsOptionAttachment: false,
  supportsAllowedContentTypes: false,

  // Components
  EditorComponent: ConditionalEditor,

  // Validation
  validateQuestion: (question: QuestionFormData): ValidationError[] => {
    const errors: ValidationError[] = [];

    if (!question.text.trim()) {
      errors.push({ field: 'text', message: 'Soru metni gereklidir' });
    }

    // Must have exactly 3 options
    if (question.options.length !== 3) {
      errors.push({ field: 'options', message: 'Koşullu sorular tam olarak 3 seçenek içermelidir' });
    }

    question.options.forEach((option, index) => {
      if (!option.text.trim()) {
        errors.push({ field: `options[${index}].text`, message: `Seçenek ${index + 1} metni gereklidir` });
      }
    });

    return errors;
  },
};
