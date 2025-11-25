'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCreateSurvey } from '@/src/features/survey/hooks';
import { Button } from '@/src/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { Textarea } from '@/src/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/components/ui/select';
import { Checkbox } from '@/src/components/ui/checkbox';
import type { AccessType, QuestionType, CreateQuestionDto, CreateOptionDto } from '@/src/types';

interface QuestionForm extends Omit<CreateQuestionDto, 'options'> {
  options: OptionForm[];
}

interface OptionForm extends Omit<CreateOptionDto, 'value'> {
  value: string; // Keep as string for form input, convert to number on submit
}

/**
 * Create New Survey Page
 * Allows admins to create a survey with questions
 */
export default function NewSurveyPage() {
  const router = useRouter();
  const createSurvey = useCreateSurvey();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [accessType, setAccessType] = useState<AccessType>('Internal');
  const [questions, setQuestions] = useState<QuestionForm[]>([]);

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        text: '',
        description: null,
        type: 'SingleSelect',
        order: questions.length + 1,
        isRequired: true,
        options: [],
      },
    ]);
  };

  const removeQuestion = (index: number) => {
    const updated = questions.filter((_, i) => i !== index);
    // Re-order remaining questions
    updated.forEach((q, i) => {
      q.order = i + 1;
    });
    setQuestions(updated);
  };

  const updateQuestion = (index: number, field: keyof QuestionForm, value: any) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };

    // Reset options if changing to OpenText
    if (field === 'type' && value === 'OpenText') {
      updated[index].options = [];
    }

    setQuestions(updated);
  };

  const addOption = (questionIndex: number) => {
    const updated = [...questions];
    const question = updated[questionIndex];
    question.options.push({
      text: '',
      order: question.options.length + 1,
      value: '0',
    });
    setQuestions(updated);
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    const updated = [...questions];
    const question = updated[questionIndex];
    question.options = question.options.filter((_, i) => i !== optionIndex);
    // Re-order remaining options
    question.options.forEach((opt, i) => {
      opt.order = i + 1;
    });
    setQuestions(updated);
  };

  const updateOption = (
    questionIndex: number,
    optionIndex: number,
    field: keyof OptionForm,
    value: string
  ) => {
    const updated = [...questions];
    updated[questionIndex].options[optionIndex] = {
      ...updated[questionIndex].options[optionIndex],
      [field]: value,
    };
    setQuestions(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!title.trim()) {
      alert('Lütfen anket başlığı girin');
      return;
    }

    if (questions.length === 0) {
      alert('Lütfen en az bir soru ekleyin');
      return;
    }

    // Validate questions
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.text.trim()) {
        alert(`Lütfen ${i + 1}. sorunun metnini girin`);
        return;
      }
      if (q.type !== 'OpenText' && q.options.length === 0) {
        alert(`Lütfen ${i + 1}. soru için en az bir seçenek ekleyin`);
        return;
      }
      // Validate options
      for (let j = 0; j < q.options.length; j++) {
        const opt = q.options[j];
        if (!opt.text.trim()) {
          alert(`Lütfen ${i + 1}. sorunun ${j + 1}. seçeneğinin metnini girin`);
          return;
        }
      }
    }

    // Convert to API format
    const questionsData: CreateQuestionDto[] = questions.map((q) => ({
      text: q.text,
      description: q.description || null,
      type: q.type,
      order: q.order,
      isRequired: q.isRequired,
      options:
        q.type === 'OpenText'
          ? null
          : q.options.map((opt) => ({
              text: opt.text,
              order: opt.order,
              value: parseInt(opt.value, 10) || 0,
            })),
    }));

    try {
      const surveyId = await createSurvey.mutateAsync({
        title,
        description,
        accessType,
        questions: questionsData,
      });

      if (surveyId) {
        router.push(`/admin/surveys/${surveyId}`);
      } else {
        router.push('/admin/surveys');
      }
    } catch (error) {
      // Error is handled by the mutation hook
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
        <Card>
          <CardHeader>
            <CardTitle>Temel Bilgiler</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Anket Başlığı *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Örn: Çalışan Memnuniyet Anketi 2024"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Açıklama</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Anket hakkında kısa bir açıklama..."
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="accessType">Erişim Tipi *</Label>
              <Select
                value={accessType}
                onValueChange={(value) => setAccessType(value as AccessType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Internal">Dahili (Sadece Çalışanlar)</SelectItem>
                  <SelectItem value="Public">Halka Açık</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Questions */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Sorular</CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addQuestion}
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Soru Ekle
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {questions.length === 0 ? (
              <div className="text-center py-8 text-slate-600">
                <p>Henüz soru eklenmedi.</p>
                <p className="text-sm mt-1">Başlamak için &quot;Soru Ekle&quot; butonuna tıklayın.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {questions.map((question, qIndex) => (
                  <Card key={qIndex} className="border-slate-200">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-600">
                          Soru {qIndex + 1}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeQuestion(qIndex)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <Label>Soru Metni *</Label>
                        <Input
                          value={question.text}
                          onChange={(e) =>
                            updateQuestion(qIndex, 'text', e.target.value)
                          }
                          placeholder="Soru metnini girin..."
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label>Soru Tipi *</Label>
                          <Select
                            value={question.type}
                            onValueChange={(value) =>
                              updateQuestion(qIndex, 'type', value as QuestionType)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="SingleSelect">Tek Seçim</SelectItem>
                              <SelectItem value="MultiSelect">Çoklu Seçim</SelectItem>
                              <SelectItem value="OpenText">Açık Uçlu</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="flex items-end">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <Checkbox
                              checked={question.isRequired}
                              onCheckedChange={(checked) =>
                                updateQuestion(qIndex, 'isRequired', checked === true)
                              }
                            />
                            <span className="text-sm">Zorunlu soru</span>
                          </label>
                        </div>
                      </div>

                      {/* Options (only for SingleSelect and MultiSelect) */}
                      {question.type !== 'OpenText' && (
                        <div className="border-t pt-3 mt-3">
                          <div className="flex items-center justify-between mb-2">
                            <Label className="text-sm">Seçenekler</Label>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => addOption(qIndex)}
                            >
                              Seçenek Ekle
                            </Button>
                          </div>

                          {question.options.length === 0 ? (
                            <p className="text-sm text-slate-500 py-2">
                              Henüz seçenek eklenmedi
                            </p>
                          ) : (
                            <div className="space-y-2">
                              {question.options.map((option, oIndex) => (
                                <div key={oIndex} className="flex gap-2">
                                  <Input
                                    value={option.text}
                                    onChange={(e) =>
                                      updateOption(qIndex, oIndex, 'text', e.target.value)
                                    }
                                    placeholder={`Seçenek ${oIndex + 1}`}
                                    className="flex-1"
                                  />
                                  <Input
                                    type="number"
                                    value={option.value}
                                    onChange={(e) =>
                                      updateOption(qIndex, oIndex, 'value', e.target.value)
                                    }
                                    placeholder="Değer"
                                    className="w-24"
                                  />
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeOption(qIndex, oIndex)}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <svg
                                      className="w-4 h-4"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                      />
                                    </svg>
                                  </Button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </form>
  );
}
