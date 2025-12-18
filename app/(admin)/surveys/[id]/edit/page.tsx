'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/src/components/ui/button';
import { SurveyBasicInfo, QuestionList } from '@/src/features/survey/components/SurveyCreator';
import { SurveyFormData, QuestionFormData, getAllQuestionTypes } from '@/src/features/survey/question-types';
import { useSurvey, useUpdateSurvey } from '@/src/features/survey/hooks';
import { CreateSurveyRequest, SurveyDetailDto } from '@/src/types';

/**
 * Edit Survey Page (Draft only)
 * Reuses the creation UI, pre-filled with existing survey data.
 */
export default function EditSurveyPage() {
  const params = useParams();
  const router = useRouter();
  const surveyId = parseInt(params.id as string);

  const { data: survey, isLoading, error } = useSurvey(surveyId);
  const updateSurvey = useUpdateSurvey(surveyId);

  const [form, setForm] = useState<SurveyFormData | null>(null);

  // Prefill when survey loads
  useEffect(() => {
    if (survey) {
      setForm(mapSurveyToFormData(survey));
    }
  }, [survey]);

  const isDraft = useMemo(() => {
    if (!survey) return true;
    return !survey.startDate && !survey.endDate;
  }, [survey]);

  // Redirect published surveys back to detail view
  useEffect(() => {
    if (survey && !isDraft) {
      router.replace(`/surveys/${surveyId}`);
    }
  }, [survey, isDraft, router, surveyId]);

  const updateField = (field: keyof SurveyFormData, value: any) => {
    setForm((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;

    const errors: string[] = [];

    if (!form.title.trim()) {
      errors.push('Anket başlığı gereklidir');
    }

    if (!form.description.trim()) {
      errors.push('Anket açıklaması gereklidir');
    }

    if (form.questions.length === 0) {
      errors.push('En az bir soru eklenmelidir');
    }

    // Validate questions
    form.questions.forEach((question, index) => {
      const questionTypes = getAllQuestionTypes();
      const questionType = questionTypes.find((qt) => qt.type === question.type);

      if (questionType) {
        const questionErrors = questionType.validateQuestion(question);
        questionErrors.forEach((err) => {
          errors.push(`Soru ${index + 1}: ${err.message}`);
        });
      }
    });

    if (errors.length > 0) {
      alert('Lütfen aşağıdaki hataları düzeltin:\n\n' + errors.join('\n'));
      return;
    }

    const request: CreateSurveyRequest = {
      title: form.title,
      description: form.description,
      introText: form.introText || null,
      consentText: form.consentText || null,
      outroText: form.outroText || null,
      accessType: form.accessType,
      questions: form.questions.map((q) => ({
        text: q.text,
        type: q.type,
        order: q.order,
        isRequired: q.isRequired,
        options:
          q.type === 'OpenText' || q.type === 'FileUpload'
            ? null
            : q.options.map((opt) => ({
                text: opt.text,
                order: opt.order,
                value: opt.value || 0,
                attachment: opt.attachment || null,
              })),
        attachment: q.attachment || null,
        allowedAttachmentContentTypes: q.type === 'FileUpload' ? q.allowedAttachmentContentTypes || null : null,
        childQuestions:
          q.type === 'Conditional' && q.childQuestions
            ? q.childQuestions.map((cq) => ({
                parentOptionOrder: cq.parentOptionOrder,
                text: cq.text,
                type: cq.type,
                order: cq.order,
                isRequired: cq.isRequired,
                options:
                  cq.type === 'OpenText' || cq.type === 'FileUpload'
                    ? null
                    : cq.options.map((opt) => ({
                        text: opt.text,
                        order: opt.order,
                        value: opt.value || 0,
                        attachment: opt.attachment || null,
                      })),
                attachment: cq.attachment || null,
                allowedAttachmentContentTypes: cq.type === 'FileUpload' ? cq.allowedAttachmentContentTypes || null : null,
              }))
            : null,
      })),
      attachment: form.attachment || null,
    };

    try {
      await updateSurvey.mutateAsync(request);
      router.push(`/surveys/${surveyId}`);
    } catch {
      // errors are handled in hook toast
    }
  };

  if (isLoading || !form) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-slate-600">Yükleniyor...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-red-600">Anket yüklenemedi.</div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Anketi Düzenle</h1>
          <p className="text-slate-600 mt-1">Yalnızca yayınlanmamış anketler düzenlenebilir</p>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            İptal
          </Button>
          <Button type="submit" style={{ backgroundColor: '#0055a5' }} disabled={updateSurvey.isPending}>
            {updateSurvey.isPending ? 'Güncelleniyor...' : 'Kaydet'}
          </Button>
        </div>
      </div>

      {/* Basic Information */}
      <SurveyBasicInfo
        title={form.title}
        description={form.description}
        introText={form.introText}
        consentText={form.consentText}
        outroText={form.outroText}
        accessType={form.accessType}
        attachment={form.attachment}
        onTitleChange={(title) => updateField('title', title)}
        onDescriptionChange={(description) => updateField('description', description)}
        onIntroTextChange={(introText) => updateField('introText', introText)}
        onConsentTextChange={(consentText) => updateField('consentText', consentText)}
        onOutroTextChange={(outroText) => updateField('outroText', outroText)}
        onAccessTypeChange={(accessType) => updateField('accessType', accessType)}
        onAttachmentChange={(attachment) => updateField('attachment', attachment)}
      />

      {/* Questions */}
      <QuestionList questions={form.questions} onChange={(questions) => updateField('questions', questions)} />
    </form>
  );
}

function mapSurveyToFormData(survey: SurveyDetailDto): SurveyFormData {
  const questions: QuestionFormData[] = survey.questions.map((q) => ({
    text: q.text,
    description: q.description || '',
    type: q.type,
    order: q.order,
    isRequired: q.isRequired,
    attachment: null, // Existing attachments are not auto-reused; user can re-upload if needed
    options:
      q.type === 'OpenText' || q.type === 'FileUpload'
        ? []
        : q.options.map((opt) => ({
            text: opt.text,
            order: opt.order,
            value: opt.value,
            attachment: null,
          })),
    allowedAttachmentContentTypes: q.allowedAttachmentContentTypes || undefined,
    childQuestions:
      q.type === 'Conditional' && q.options.length > 0
        ? q.options.flatMap((opt, idx) => {
            if (!opt.childQuestions) return [];
            return opt.childQuestions.map((child) => ({
              parentOptionOrder: opt.order,
              text: child.text,
              description: child.description || '',
              type: child.type,
              order: child.order,
              isRequired: child.isRequired,
              attachment: null,
              options:
                child.type === 'OpenText' || child.type === 'FileUpload'
                  ? []
                  : child.options.map((copt) => ({
                      text: copt.text,
                      order: copt.order,
                      value: copt.value,
                      attachment: null,
                    })),
              allowedAttachmentContentTypes: child.allowedAttachmentContentTypes || undefined,
            }));
          })
        : undefined,
  }));

  return {
    title: survey.title,
    description: survey.description || '',
    introText: survey.introText || '',
    consentText: survey.consentText || '',
    outroText: survey.outroText || '',
    accessType: survey.accessType,
    attachment: null,
    questions,
  };
}
