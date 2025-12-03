'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSurveys, usePublishSurvey } from '@/src/features/survey/hooks';
import { Button } from '@/src/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/src/components/ui/dialog';
import { Label } from '@/src/components/ui/label';
import { DateTimePicker } from '@/src/components/ui/date-time-picker';

/**
 * Survey List Page
 * Shows department surveys with publish functionality
 * Accessible to all users with roles
 */
export default function SurveysPage() {
  const router = useRouter();
  const { data: surveys, isLoading, error } = useSurveys();
  const publishSurvey = usePublishSurvey();

  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [selectedSurveyId, setSelectedSurveyId] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

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
      month: 'short',
      day: 'numeric',
    });
  };

  const handlePublishClick = (surveyId: string) => {
    setSelectedSurveyId(surveyId);
    setStartDate(null);
    setEndDate(null);
    setPublishDialogOpen(true);
  };

  const handlePublish = async () => {
    if (!selectedSurveyId || !startDate || !endDate) {
      alert('Lütfen başlangıç ve bitiş tarihlerini girin');
      return;
    }

    if (endDate <= startDate) {
      alert('Bitiş tarihi başlangıç tarihinden sonra olmalıdır');
      return;
    }

    try {
      await publishSurvey.mutateAsync({
        surveyId: selectedSurveyId,
        dates: {
          StartDate: startDate.toISOString(),
          EndDate: endDate.toISOString(),
        },
      });
      setPublishDialogOpen(false);
      setSelectedSurveyId(null);
    } catch (error) {
      // Error handled by mutation hook
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-600">Yükleniyor...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="border-red-200 max-w-md">
          <CardContent className="pt-6">
            <p className="text-red-600">
              Anketler yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="container mx-auto px-6 py-4 max-w-7xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-800">Anketler</h1>
              <p className="text-slate-600 mt-1">
                Departman anketlerinizi görüntüleyin ve yönetin
              </p>
            </div>
            <Button
              onClick={() => router.push('/surveys/new')}
              style={{ backgroundColor: '#0055a5' }}
              className="hover:opacity-90"
            >
              <svg
                className="w-5 h-5 mr-2"
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
              Anket Oluştur
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 py-6 max-w-7xl">
        {!surveys || surveys.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-slate-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-slate-800 mb-2">
                  Henüz anket bulunmuyor
                </h3>
                <p className="text-slate-600 mb-6">
                  İlk anketinizi oluşturarak başlayın
                </p>
                <Button
                  onClick={() => router.push('/surveys/new')}
                  style={{ backgroundColor: '#0055a5' }}
                >
                  Anket Oluştur
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {surveys.map((survey) => {
              const status = getSurveyStatus(survey.startDate, survey.endDate);
              const isDraft = !survey.startDate && !survey.endDate;

              return (
                <Card
                  key={survey.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <CardTitle className="text-slate-800">
                            {survey.title}
                          </CardTitle>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${status.color}`}
                          >
                            {status.label}
                          </span>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              survey.accessType === 'Internal'
                                ? 'bg-purple-100 text-purple-700'
                                : 'bg-orange-100 text-orange-700'
                            }`}
                          >
                            {survey.accessType === 'Internal' ? 'Dahili' : 'Halka Açık'}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600">
                          {survey.description}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {isDraft && (
                          <Button
                            size="sm"
                            style={{ backgroundColor: '#0055a5' }}
                            onClick={() => handlePublishClick(survey.id)}
                          >
                            Yayınla
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/surveys/${survey.id}`)}
                        >
                          Görüntüle
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-6 text-sm text-slate-600">
                      <div className="flex items-center gap-2">
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
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                        <span>Oluşturan: {survey.createdBy}</span>
                      </div>
                      {survey.startDate && (
                        <div className="flex items-center gap-2">
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
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          <span>
                            {formatDate(survey.startDate)} - {formatDate(survey.endDate)}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Publish Dialog */}
      <Dialog open={publishDialogOpen} onOpenChange={setPublishDialogOpen}>
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
    </div>
  );
}
