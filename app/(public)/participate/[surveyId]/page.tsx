'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSurvey } from '@/src/features/survey/hooks';
import { useStartParticipation, useSubmitAnswer, useCompleteParticipation } from '@/src/features/participation/hooks';
import { Button } from '@/src/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Label } from '@/src/components/ui/label';
import { Input } from '@/src/components/ui/input';
import { Textarea } from '@/src/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/src/components/ui/radio-group';
import { Checkbox } from '@/src/components/ui/checkbox';
import type { QuestionDto } from '@/src/types';

// Character limit for open text answers
const MAX_TEXT_ANSWER_LENGTH = 2000;

// Helper function to get attachment URL
const getAttachmentUrl = (attachmentId: string) => {
  return `${process.env.NEXT_PUBLIC_API_URL}/Attachments/${attachmentId}`;
};

/**
 * Public Survey Participation Page
 * Accessible via shareable link: /participate/{surveyId}
 */
export default function ParticipatePage() {
  const params = useParams();
  const router = useRouter();
  const surveyId = params.surveyId as string;

  const { data: survey, isLoading, error } = useSurvey(surveyId);
  const startParticipation = useStartParticipation();
  const submitAnswer = useSubmitAnswer();
  const completeParticipation = useCompleteParticipation();

  const [participationId, setParticipationId] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [consentGiven, setConsentGiven] = useState(false);

  // Start participation when user begins
  const handleStart = async () => {
    try {
      const participationIdResult = await startParticipation.mutateAsync(surveyId);
      setParticipationId(participationIdResult);
    } catch (error) {
      alert('Ankete başlanırken bir hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  // Handle answer change
  const handleAnswerChange = (questionId: string, value: any) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  // Submit current answer and move to next
  const handleNext = async () => {
    if (!participationId || !survey) return;

    const currentQuestion = survey.questions[currentQuestionIndex];
    const answer = answers[currentQuestion.id];

    // Validate required questions
    if (currentQuestion.isRequired && !answer) {
      alert('Bu soru zorunludur. Lütfen cevap verin.');
      return;
    }

    // For Conditional questions, validate child questions
    if (currentQuestion.type === 'Conditional' && answer) {
      const selectedOption = currentQuestion.options.find(opt => opt.id === answer);
      if (selectedOption && selectedOption.childQuestions) {
        for (const childQuestion of selectedOption.childQuestions) {
          const childAnswer = answers[childQuestion.id];
          if (childQuestion.isRequired && !childAnswer) {
            alert(`Zorunlu soru cevaplanmadı: ${childQuestion.text}`);
            return;
          }
        }
      }
    }

    // Prepare answer based on question type
    let textValue = null;
    let optionIds: string[] = [];

    if (currentQuestion.type === 'OpenText') {
      textValue = answer || null;
    } else if (currentQuestion.type === 'SingleSelect' || currentQuestion.type === 'Conditional') {
      optionIds = answer ? [answer] : [];
    } else if (currentQuestion.type === 'MultiSelect') {
      optionIds = answer || [];
    }

    // Submit answers
    try {
      // Submit parent question answer
      await submitAnswer.mutateAsync({
        participationId,
        answer: {
          questionId: currentQuestion.id,
          textValue,
          optionIds,
        },
      });

      // For Conditional questions, submit child question answers
      if (currentQuestion.type === 'Conditional' && answer) {
        const selectedOption = currentQuestion.options.find(opt => opt.id === answer);
        if (selectedOption && selectedOption.childQuestions) {
          for (const childQuestion of selectedOption.childQuestions) {
            const childAnswer = answers[childQuestion.id];
            if (childAnswer) {
              let childTextValue = null;
              let childOptionIds: string[] = [];

              if (childQuestion.type === 'OpenText') {
                childTextValue = childAnswer;
              } else if (childQuestion.type === 'SingleSelect') {
                childOptionIds = [childAnswer];
              } else if (childQuestion.type === 'MultiSelect') {
                childOptionIds = childAnswer;
              }

              await submitAnswer.mutateAsync({
                participationId,
                answer: {
                  questionId: childQuestion.id,
                  textValue: childTextValue,
                  optionIds: childOptionIds,
                },
              });
            }
          }
        }
      }

      // Move to next question or complete
      if (currentQuestionIndex < survey.questions.length - 1) {
        setCurrentQuestionIndex((prev) => prev + 1);
      } else {
        // Complete participation
        await handleComplete();
      }
    } catch (error) {
      alert('Cevap gönderilirken bir hata oluştu.');
    }
  };

  // Go back to previous question
  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  // Complete participation
  const handleComplete = async () => {
    if (!participationId) return;

    setIsSubmitting(true);
    try {
      await completeParticipation.mutateAsync(participationId);
      setIsCompleted(true);
    } catch (error) {
      alert('Anket tamamlanırken bir hata oluştu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-600">Yükleniyor...</div>
      </div>
    );
  }

  // Error state
  if (error || !survey) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <p className="text-red-600">Anket bulunamadı veya yüklenemedi.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Completed state
  if (isCompleted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full">
          <CardHeader>
            <CardTitle className="text-center text-2xl text-green-600">Teşekkürler!</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-4">
              <p className="text-slate-700 whitespace-pre-wrap">
                {survey.outroText || 'Anket katılımınız başarıyla tamamlandı.\n\nKatkılarınız için teşekkür ederiz.'}
              </p>
              <div className="mt-6">
                <Button onClick={() => router.push('/')} variant="outline">
                  Ana Sayfaya Dön
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Welcome screen (before starting)
  if (!participationId) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full">
          <CardHeader>
            <CardTitle className="text-3xl text-slate-800">{survey.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Intro Text (Legal/GDPR Information) */}
            {survey.introText && (
              <div className="bg-slate-100 border border-slate-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-slate-700 whitespace-pre-wrap">{survey.introText}</p>
              </div>
            )}

            {/* Survey Description */}
            <p className="text-slate-700 whitespace-pre-wrap">{survey.description}</p>

            {/* Survey Attachment */}
            {survey.attachment && (
              <div className="pt-4">
                <img
                  src={getAttachmentUrl(survey.attachment.id)}
                  alt={survey.attachment.fileName}
                  className="max-w-full h-auto rounded-lg border border-slate-200"
                  style={{ maxHeight: '300px' }}
                />
              </div>
            )}

            {/* Survey Info */}
            <div className="pt-4 space-y-2 text-sm text-slate-600">
              <p>• Toplam {survey.questions.length} soru</p>
              <p>• Tahmini süre: {Math.ceil(survey.questions.length * 0.5)} dakika</p>
            </div>

            {/* Consent Checkbox (if consent text exists) */}
            {survey.consentText && (
              <div className="flex items-start space-x-3 border-t border-slate-200 pt-4 mt-4">
                <Checkbox
                  id="consent"
                  checked={consentGiven}
                  onCheckedChange={(checked) => setConsentGiven(checked as boolean)}
                  className="mt-1"
                />
                <Label htmlFor="consent" className="text-sm text-slate-700 cursor-pointer leading-relaxed">
                  {survey.consentText}
                </Label>
              </div>
            )}

            {/* Start Button */}
            <div className="pt-6">
              <Button
                onClick={handleStart}
                disabled={startParticipation.isPending || (survey.consentText && !consentGiven)}
                style={{ backgroundColor: '#0055a5' }}
                className="w-full"
              >
                {startParticipation.isPending ? 'Başlatılıyor...' : 'Ankete Başla'}
              </Button>
              {survey.consentText && !consentGiven && (
                <p className="text-sm text-red-600 mt-2 text-center">
                  Devam etmek için lütfen onay kutusunu işaretleyin.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Question screen
  const currentQuestion = survey.questions[currentQuestionIndex];
  const currentAnswer = answers[currentQuestion.id];
  const progress = ((currentQuestionIndex + 1) / survey.questions.length) * 100;

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-slate-600 mb-2">
            <span>Soru {currentQuestionIndex + 1} / {survey.questions.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question card */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <CardTitle className="text-xl text-slate-800">
                {currentQuestion.text}
                {currentQuestion.isRequired && <span className="text-red-500 ml-1">*</span>}
              </CardTitle>
            </div>
            {currentQuestion.description && (
              <p className="text-sm text-slate-600 mt-2">{currentQuestion.description}</p>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Question Attachment */}
            {currentQuestion.attachment && (
              <div className="mb-4">
                <img
                  src={getAttachmentUrl(currentQuestion.attachment.id)}
                  alt={currentQuestion.attachment.fileName}
                  className="max-w-full h-auto rounded-lg border border-slate-200"
                  style={{ maxHeight: '400px' }}
                />
              </div>
            )}
            {/* Single Select (Radio) */}
            {currentQuestion.type === 'SingleSelect' && (
              <RadioGroup value={currentAnswer} onValueChange={(value) => handleAnswerChange(currentQuestion.id, value)}>
                {currentQuestion.options.map((option) => (
                  <div key={option.id} className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value={option.id} id={option.id} />
                      <Label htmlFor={option.id} className="cursor-pointer">
                        {option.text}
                      </Label>
                    </div>
                    {option.attachment && (
                      <div className="ml-6">
                        <img
                          src={getAttachmentUrl(option.attachment.id)}
                          alt={option.attachment.fileName}
                          className="max-w-full h-auto rounded border border-slate-200"
                          style={{ maxHeight: '200px' }}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </RadioGroup>
            )}

            {/* Multi Select (Checkboxes) */}
            {currentQuestion.type === 'MultiSelect' && (
              <div className="space-y-3">
                {currentQuestion.options.map((option) => (
                  <div key={option.id} className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={option.id}
                        checked={currentAnswer?.includes(option.id) || false}
                        onCheckedChange={(checked) => {
                          const newValue = currentAnswer ? [...currentAnswer] : [];
                          if (checked) {
                            newValue.push(option.id);
                          } else {
                            const index = newValue.indexOf(option.id);
                            if (index > -1) newValue.splice(index, 1);
                          }
                          handleAnswerChange(currentQuestion.id, newValue);
                        }}
                      />
                      <Label htmlFor={option.id} className="cursor-pointer">
                        {option.text}
                      </Label>
                    </div>
                    {option.attachment && (
                      <div className="ml-6">
                        <img
                          src={getAttachmentUrl(option.attachment.id)}
                          alt={option.attachment.fileName}
                          className="max-w-full h-auto rounded border border-slate-200"
                          style={{ maxHeight: '200px' }}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Open Text */}
            {currentQuestion.type === 'OpenText' && (
              <div className="space-y-2">
                <Textarea
                  value={currentAnswer || ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value.length <= MAX_TEXT_ANSWER_LENGTH) {
                      handleAnswerChange(currentQuestion.id, value);
                    }
                  }}
                  placeholder="Cevabınızı buraya yazın..."
                  rows={5}
                  maxLength={MAX_TEXT_ANSWER_LENGTH}
                />
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">
                    Maksimum {MAX_TEXT_ANSWER_LENGTH} karakter
                  </span>
                  <span className={`${
                    (currentAnswer?.length || 0) > MAX_TEXT_ANSWER_LENGTH * 0.9
                      ? 'text-orange-600 font-medium'
                      : 'text-slate-600'
                  }`}>
                    {currentAnswer?.length || 0} / {MAX_TEXT_ANSWER_LENGTH}
                  </span>
                </div>
              </div>
            )}

            {/* Conditional (Shows child questions based on selection) */}
            {currentQuestion.type === 'Conditional' && (
              <div className="space-y-4">
                {/* Parent options */}
                <RadioGroup value={currentAnswer} onValueChange={(value) => handleAnswerChange(currentQuestion.id, value)}>
                  {currentQuestion.options.map((option) => (
                    <div key={option.id}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value={option.id} id={option.id} />
                        <Label htmlFor={option.id} className="cursor-pointer font-medium">
                          {option.text}
                        </Label>
                      </div>
                    </div>
                  ))}
                </RadioGroup>

                {/* Child questions (shown when parent option is selected) */}
                {currentAnswer && currentQuestion.options.map((option) => {
                  if (option.id !== currentAnswer) return null;
                  if (!option.childQuestions || option.childQuestions.length === 0) return null;

                  return (
                    <div key={option.id} className="mt-6 space-y-6 pl-6 border-l-4 border-blue-300">
                      {option.childQuestions.map((childQuestion) => (
                        <Card key={childQuestion.id} className="border-slate-200 bg-slate-50">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-base text-slate-800">
                              {childQuestion.text}
                              {childQuestion.isRequired && <span className="text-red-500 ml-1">*</span>}
                            </CardTitle>
                            {childQuestion.description && (
                              <p className="text-sm text-slate-600 mt-1">{childQuestion.description}</p>
                            )}
                          </CardHeader>
                          <CardContent>
                            {/* Child Question Attachment */}
                            {childQuestion.attachment && (
                              <div className="mb-4">
                                <img
                                  src={getAttachmentUrl(childQuestion.attachment.id)}
                                  alt={childQuestion.attachment.fileName}
                                  className="max-w-full h-auto rounded border border-slate-200"
                                  style={{ maxHeight: '300px' }}
                                />
                              </div>
                            )}

                            {/* Child SingleSelect */}
                            {childQuestion.type === 'SingleSelect' && (
                              <RadioGroup
                                value={answers[childQuestion.id]}
                                onValueChange={(value) => handleAnswerChange(childQuestion.id, value)}
                              >
                                {childQuestion.options.map((childOption) => (
                                  <div key={childOption.id} className="flex items-center space-x-2">
                                    <RadioGroupItem value={childOption.id} id={childOption.id} />
                                    <Label htmlFor={childOption.id} className="cursor-pointer">
                                      {childOption.text}
                                    </Label>
                                  </div>
                                ))}
                              </RadioGroup>
                            )}

                            {/* Child MultiSelect */}
                            {childQuestion.type === 'MultiSelect' && (
                              <div className="space-y-3">
                                {childQuestion.options.map((childOption) => (
                                  <div key={childOption.id} className="flex items-center space-x-2">
                                    <Checkbox
                                      id={childOption.id}
                                      checked={answers[childQuestion.id]?.includes(childOption.id) || false}
                                      onCheckedChange={(checked) => {
                                        const newValue = answers[childQuestion.id] ? [...answers[childQuestion.id]] : [];
                                        if (checked) {
                                          newValue.push(childOption.id);
                                        } else {
                                          const index = newValue.indexOf(childOption.id);
                                          if (index > -1) newValue.splice(index, 1);
                                        }
                                        handleAnswerChange(childQuestion.id, newValue);
                                      }}
                                    />
                                    <Label htmlFor={childOption.id} className="cursor-pointer">
                                      {childOption.text}
                                    </Label>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Child OpenText */}
                            {childQuestion.type === 'OpenText' && (
                              <div className="space-y-2">
                                <Textarea
                                  value={answers[childQuestion.id] || ''}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    if (value.length <= MAX_TEXT_ANSWER_LENGTH) {
                                      handleAnswerChange(childQuestion.id, value);
                                    }
                                  }}
                                  placeholder="Cevabınızı buraya yazın..."
                                  rows={4}
                                  maxLength={MAX_TEXT_ANSWER_LENGTH}
                                />
                                <div className="flex justify-end text-sm text-slate-600">
                                  <span>{answers[childQuestion.id]?.length || 0} / {MAX_TEXT_ANSWER_LENGTH}</span>
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  );
                })}
              </div>
            )}

            {/* File Upload - TODO */}
            {currentQuestion.type === 'FileUpload' && (
              <div className="text-slate-500">
                <p>Dosya yükleme özelliği yakında eklenecek.</p>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex justify-between pt-6">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
              >
                Önceki
              </Button>
              <Button
                onClick={handleNext}
                disabled={submitAnswer.isPending || isSubmitting}
                style={{ backgroundColor: '#0055a5' }}
              >
                {currentQuestionIndex === survey.questions.length - 1
                  ? isSubmitting
                    ? 'Gönderiliyor...'
                    : 'Tamamla'
                  : submitAnswer.isPending
                  ? 'Gönderiliyor...'
                  : 'Sonraki'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
