'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSurvey, usePublishSurvey, useAddQuestion } from '@/src/features/survey/hooks';
import { Button } from '@/src/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/src/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/components/ui/select';
import { Checkbox } from '@/src/components/ui/checkbox';
import { Textarea } from '@/src/components/ui/textarea';
import { DateTimePicker } from '@/src/components/ui/date-time-picker';
import type { QuestionType, CreateQuestionDto, CreateOptionDto } from '@/src/types';

// Helper function to get attachment URL
const getAttachmentUrl = (attachmentId: string) => {
  return `${process.env.NEXT_PUBLIC_API_URL}/Attachments/${attachmentId}`;
};

/**
 * Survey Detail Page
 * Shows survey details and allows publishing
 */
export default function SurveyDetailPage() {
  const router = useRouter();
  const params = useParams();
  const surveyId = params.id as string;

  const { data: survey, isLoading, error } = useSurvey(surveyId);
  const publishSurvey = usePublishSurvey();
  const addQuestion = useAddQuestion();

  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [addQuestionDialogOpen, setAddQuestionDialogOpen] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  // New question state
  const [newQuestionText, setNewQuestionText] = useState('');
  const [newQuestionType, setNewQuestionType] = useState<QuestionType>('SingleSelect');
  const [newQuestionRequired, setNewQuestionRequired] = useState(true);
  const [newQuestionOptions, setNewQuestionOptions] = useState<Array<{ text: string; value: string }>>([]);

  const getSurveyStatus = (startDate: string | null, endDate: string | null) => {
    if (!startDate || !endDate) {
      return { label: 'Taslak', color: 'bg-gray-100 text-gray-700' };
    }

    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (now < start) {
      return { label: 'Yakında Başlıyor', color: 'bg-blue-100 text-blue-700' };
    } else if (now >= start && now <= end) {
      return { label: 'Aktif', color: 'bg-green-100 text-green-700' };
    } else {
      return { label: 'Sona Erdi', color: 'bg-red-100 text-red-700' };
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handlePublish = async () => {
    if (!startDate || !endDate) {
      alert('Lütfen başlangıç ve bitiş tarihlerini girin');
      return;
    }

    if (endDate <= startDate) {
      alert('Bitiş tarihi başlangıç tarihinden sonra olmalıdır');
      return;
    }

    try {
      await publishSurvey.mutateAsync({
        surveyId,
        dates: {
          StartDate: startDate.toISOString(),
          EndDate: endDate.toISOString(),
        },
      });
      setPublishDialogOpen(false);
    } catch (error) {
      // Error handled by mutation hook
    }
  };

  const handleAddQuestion = async () => {
    if (!newQuestionText.trim()) {
      alert('Lütfen soru metnini girin');
      return;
    }

    if (newQuestionType !== 'OpenText' && newQuestionOptions.length === 0) {
      alert('Lütfen en az bir seçenek ekleyin');
      return;
    }

    const options: CreateOptionDto[] | null =
      newQuestionType === 'OpenText'
        ? null
        : newQuestionOptions.map((opt, index) => ({
            text: opt.text,
            order: index + 1,
            value: parseInt(opt.value, 10) || 0,
          }));

    const questionData: CreateQuestionDto = {
      text: newQuestionText,
      type: newQuestionType,
      order: (survey?.questions.length || 0) + 1,
      isRequired: newQuestionRequired,
      options,
      attachment: null,
      allowedAttachmentContentTypes: null,
    };

    try {
      await addQuestion.mutateAsync({
        surveyId,
        question: questionData,
      });
      // Reset form
      setNewQuestionText('');
      setNewQuestionType('SingleSelect');
      setNewQuestionRequired(true);
      setNewQuestionOptions([]);
      setAddQuestionDialogOpen(false);
    } catch (error) {
      // Error handled by mutation hook
    }
  };

  const addNewOption = () => {
    setNewQuestionOptions([
      ...newQuestionOptions,
      { text: '', value: '0' },
    ]);
  };

  const removeNewOption = (index: number) => {
    setNewQuestionOptions(newQuestionOptions.filter((_, i) => i !== index));
  };

  const updateNewOption = (index: number, field: 'text' | 'value', value: string) => {
    const updated = [...newQuestionOptions];
    updated[index] = { ...updated[index], [field]: value };
    setNewQuestionOptions(updated);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-slate-600">Yükleniyor...</div>
      </div>
    );
  }

  if (error || !survey) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="border-red-200">
          <CardContent className="pt-6">
            <p className="text-red-600">
              Anket yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.
            </p>
            <Button
              onClick={() => router.push('/admin/surveys')}
              variant="outline"
              className="mt-4"
            >
              Anketlere Geri Dön
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const status = getSurveyStatus(survey.startDate, survey.endDate);
  const isDraft = !survey.startDate && !survey.endDate;

  return (
    <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-slate-800">{survey.title}</h1>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${status.color}`}>
                {status.label}
              </span>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  survey.accessType === 'Internal'
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-orange-100 text-orange-700'
                }`}
              >
                {survey.accessType === 'Internal' ? 'Dahili' : 'Halka Açık'}
              </span>
            </div>
            <p className="text-slate-600">{survey.description}</p>

            {/* Survey Attachment */}
            {survey.attachment && (
              <div className="mt-4">
                <img
                  src={getAttachmentUrl(survey.attachment.id)}
                  alt={survey.attachment.fileName}
                  className="max-w-full h-auto rounded-lg border border-slate-200"
                  style={{ maxHeight: '300px' }}
                />
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push('/admin/surveys')}>
              Geri
            </Button>
            {isDraft && (
              <Dialog open={publishDialogOpen} onOpenChange={setPublishDialogOpen}>
                <DialogTrigger asChild>
                  <Button style={{ backgroundColor: '#0055a5' }}>Anketi Yayınla</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Anketi Yayınla</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div>
                      <Label htmlFor="startDate">Başlangıç Tarihi ve Saati *</Label>
                      <DateTimePicker
                        id="startDate"
                        selected={startDate}
                        onChange={(date) => setStartDate(date)}
                        placeholderText="Başlangıç tarihini seçin"
                        minDate={new Date()}
                      />
                      <p className="text-xs text-slate-500 mt-1">Format: GG.AA.YYYY SS:DD (24 saat formatı)</p>
                    </div>
                    <div>
                      <Label htmlFor="endDate">Bitiş Tarihi ve Saati *</Label>
                      <DateTimePicker
                        id="endDate"
                        selected={endDate}
                        onChange={(date) => setEndDate(date)}
                        placeholderText="Bitiş tarihini seçin"
                        minDate={startDate || new Date()}
                      />
                      <p className="text-xs text-slate-500 mt-1">Format: GG.AA.YYYY SS:DD (24 saat formatı)</p>
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setPublishDialogOpen(false)}
                      >
                        İptal
                      </Button>
                      <Button
                        onClick={handlePublish}
                        disabled={publishSurvey.isPending}
                        style={{ backgroundColor: '#0055a5' }}
                      >
                        {publishSurvey.isPending ? 'Yayınlanıyor...' : 'Yayınla'}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

        {/* Survey Info */}
        <Card>
          <CardHeader>
            <CardTitle>Anket Bilgileri</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm font-medium text-slate-600 mb-1">Soru Sayısı</p>
                <p className="text-2xl font-bold text-slate-800">{survey.questions.length}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm font-medium text-slate-600 mb-1">Başlangıç Tarihi</p>
                <p className="text-sm text-slate-800">{formatDate(survey.startDate)}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm font-medium text-slate-600 mb-1">Bitiş Tarihi</p>
                <p className="text-sm text-slate-800">{formatDate(survey.endDate)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Questions */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Sorular</CardTitle>
              <Dialog open={addQuestionDialogOpen} onOpenChange={setAddQuestionDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
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
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Yeni Soru Ekle</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div>
                      <Label>Soru Metni *</Label>
                      <Textarea
                        value={newQuestionText}
                        onChange={(e) => setNewQuestionText(e.target.value)}
                        placeholder="Soru metnini girin..."
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Soru Tipi *</Label>
                        <Select
                          value={newQuestionType}
                          onValueChange={(value) => {
                            setNewQuestionType(value as QuestionType);
                            if (value === 'OpenText') {
                              setNewQuestionOptions([]);
                            }
                          }}
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
                            checked={newQuestionRequired}
                            onCheckedChange={(checked) =>
                              setNewQuestionRequired(checked === true)
                            }
                          />
                          <span className="text-sm">Zorunlu soru</span>
                        </label>
                      </div>
                    </div>

                    {newQuestionType !== 'OpenText' && (
                      <div className="border-t pt-3">
                        <div className="flex items-center justify-between mb-2">
                          <Label className="text-sm">Seçenekler</Label>
                          <Button type="button" variant="outline" size="sm" onClick={addNewOption}>
                            Seçenek Ekle
                          </Button>
                        </div>

                        {newQuestionOptions.length === 0 ? (
                          <p className="text-sm text-slate-500 py-2">Henüz seçenek eklenmedi</p>
                        ) : (
                          <div className="space-y-2">
                            {newQuestionOptions.map((option, index) => (
                              <div key={index} className="flex gap-2">
                                <Input
                                  value={option.text}
                                  onChange={(e) =>
                                    updateNewOption(index, 'text', e.target.value)
                                  }
                                  placeholder={`Seçenek ${index + 1}`}
                                  className="flex-1"
                                />
                                <Input
                                  type="number"
                                  value={option.value}
                                  onChange={(e) =>
                                    updateNewOption(index, 'value', e.target.value)
                                  }
                                  placeholder="Değer"
                                  className="w-24"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeNewOption(index)}
                                  className="text-red-600"
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

                    <div className="flex justify-end gap-2 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setAddQuestionDialogOpen(false)}
                      >
                        İptal
                      </Button>
                      <Button
                        onClick={handleAddQuestion}
                        disabled={addQuestion.isPending}
                        style={{ backgroundColor: '#0055a5' }}
                      >
                        {addQuestion.isPending ? 'Ekleniyor...' : 'Soru Ekle'}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {survey.questions.map((question, index) => (
                <Card key={question.id} className="border-slate-200">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-medium text-sm">
                        {index + 1}
                      </span>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-medium text-slate-800">{question.text}</h3>
                          <div className="flex gap-2">
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${
                                question.isRequired
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-gray-100 text-gray-700'
                              }`}
                            >
                              {question.isRequired ? 'Zorunlu' : 'İsteğe Bağlı'}
                            </span>
                            <span className="px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-700">
                              {question.type === 'SingleSelect'
                                ? 'Tek Seçim'
                                : question.type === 'MultiSelect'
                                ? 'Çoklu Seçim'
                                : 'Açık Uçlu'}
                            </span>
                          </div>
                        </div>

                        {/* Question Attachment */}
                        {question.attachment && (
                          <div className="mt-3">
                            <img
                              src={getAttachmentUrl(question.attachment.id)}
                              alt={question.attachment.fileName}
                              className="max-w-full h-auto rounded border border-slate-200"
                              style={{ maxHeight: '300px' }}
                            />
                          </div>
                        )}

                        {question.options && question.options.length > 0 && (
                          <div className="mt-3 space-y-2">
                            {question.options.map((option) => (
                              <div key={option.id} className="pl-4">
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full"></span>
                                  {option.text} <span className="text-xs text-slate-400">({option.value})</span>
                                </div>
                                {/* Option Attachment */}
                                {option.attachment && (
                                  <div className="mt-2 ml-4">
                                    <img
                                      src={getAttachmentUrl(option.attachment.id)}
                                      alt={option.attachment.fileName}
                                      className="max-w-full h-auto rounded border border-slate-200"
                                      style={{ maxHeight: '150px' }}
                                    />
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
  );
}
