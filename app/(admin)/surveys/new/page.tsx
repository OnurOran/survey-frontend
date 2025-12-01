'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/src/components/ui/button';
import { SurveyBasicInfo, QuestionList } from '@/src/features/survey/components/SurveyCreator';
import { SurveyFormData, QuestionFormData, getAllQuestionTypes } from '@/src/features/survey/question-types';
import { useCreateSurvey } from '@/src/features/survey/hooks';
import { CreateSurveyRequest, CreateQuestionDto } from '@/src/types';

/**
 * Create New Survey Page
 * Modular architecture - easy to add/remove question types
 */
export default function NewSurveyPage() {
  const router = useRouter();
  const createSurvey = useCreateSurvey();

  // Form state
  const [survey, setSurvey] = useState<SurveyFormData>({
    title: '',
    description: '',
    introText: '',
    consentText: '',
    outroText: '',
    accessType: 'Internal',
    attachment: null,
    questions: [],
  });

  // Update survey field
  const updateSurvey = (field: keyof SurveyFormData, value: any) => {
    setSurvey({ ...survey, [field]: value });
  };

  // Validate and submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate survey
    const errors: string[] = [];

    if (!survey.title.trim()) {
      errors.push('Anket başlığı gereklidir');
    }

    if (!survey.description.trim()) {
      errors.push('Anket açıklaması gereklidir');
    }

    if (survey.questions.length === 0) {
      errors.push('En az bir soru eklenmelidir');
    }

    // Validate questions
    survey.questions.forEach((question, index) => {
      const questionTypes = getAllQuestionTypes();
      const questionType = questionTypes.find((qt) => qt.type === question.type);

      if (questionType) {
        const questionErrors = questionType.validateQuestion(question);
        questionErrors.forEach((err) => {
          errors.push(`Soru ${index + 1}: ${err.message}`);
        });
      }
    });

    // Show errors
    if (errors.length > 0) {
      alert('Lütfen aşağıdaki hataları düzeltin:\n\n' + errors.join('\n'));
      return;
    }

    // Convert to API format with PascalCase for C# backend
    // IMPORTANT: Field order must match backend record constructor parameters
    const request: any = {
      Title: survey.title,
      Description: survey.description,
      IntroText: survey.introText || null,
      ConsentText: survey.consentText || null,
      OutroText: survey.outroText || null,
      AccessType: survey.accessType,
      Questions: survey.questions.map((q) => ({
        Text: q.text,
        Type: q.type,
        Order: q.order,
        IsRequired: q.isRequired,
        Options:
          q.type === 'OpenText' || q.type === 'FileUpload'
            ? null
            : q.options.map((opt) => ({
                Text: opt.text,
                Order: opt.order,
                Value: opt.value || 0,
                Attachment: opt.attachment || null,
              })),
        Attachment: q.attachment || null,
        AllowedAttachmentContentTypes: q.type === 'FileUpload' ? q.allowedAttachmentContentTypes || null : null,
      })),
      Attachment: survey.attachment || null,
    };

    try {
      const surveyId = await createSurvey.mutateAsync(request);

      if (surveyId) {
        router.push(`/surveys/${surveyId}`);
      } else {
        router.push('/surveys');
      }
    } catch (error) {
      // Error handled by mutation hook
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Yeni Anket Oluştur</h1>
          <p className="text-slate-600 mt-1">
            Anket bilgilerini ve sorularını tanımlayın
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            İptal
          </Button>
          <Button
            type="submit"
            style={{ backgroundColor: '#0055a5' }}
            disabled={createSurvey.isPending}
          >
            {createSurvey.isPending ? 'Oluşturuluyor...' : 'Anketi Oluştur'}
          </Button>
        </div>
      </div>

      {/* Basic Information */}
      <SurveyBasicInfo
        title={survey.title}
        description={survey.description}
        introText={survey.introText}
        consentText={survey.consentText}
        outroText={survey.outroText}
        accessType={survey.accessType}
        attachment={survey.attachment}
        onTitleChange={(title) => updateSurvey('title', title)}
        onDescriptionChange={(description) => updateSurvey('description', description)}
        onIntroTextChange={(introText) => updateSurvey('introText', introText)}
        onConsentTextChange={(consentText) => updateSurvey('consentText', consentText)}
        onOutroTextChange={(outroText) => updateSurvey('outroText', outroText)}
        onAccessTypeChange={(accessType) => updateSurvey('accessType', accessType)}
        onAttachmentChange={(attachment) => updateSurvey('attachment', attachment)}
      />

      {/* Questions */}
      <QuestionList
        questions={survey.questions}
        onChange={(questions) => updateSurvey('questions', questions)}
      />
    </form>
  );
}
