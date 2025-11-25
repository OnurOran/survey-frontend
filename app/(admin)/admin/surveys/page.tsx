'use client';

import { useRouter } from 'next/navigation';
import { useSurveys } from '@/src/features/survey/hooks';
import { Button } from '@/src/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';

/**
 * Survey List Page
 * Shows all surveys with their status
 */
export default function SurveysPage() {
  const router = useRouter();
  const { data: surveys, isLoading, error } = useSurveys();

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-slate-600">Yükleniyor...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="border-red-200">
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
    <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Anketler</h1>
            <p className="text-slate-600 mt-1">
              Tüm anketleri görüntüleyin ve yönetin
            </p>
          </div>
          <Button
            onClick={() => router.push('/admin/surveys/new')}
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
            Yeni Anket Oluştur
          </Button>
        </div>

        {/* Survey List */}
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
                  onClick={() => router.push('/admin/surveys/new')}
                  style={{ backgroundColor: '#0055a5' }}
                >
                  Yeni Anket Oluştur
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {surveys.map((survey) => {
              const status = getSurveyStatus(survey.startDate, survey.endDate);
              return (
                <Card
                  key={survey.id}
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => router.push(`/admin/surveys/${survey.id}`)}
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
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/admin/surveys/${survey.id}`);
                        }}
                      >
                        Görüntüle
                      </Button>
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
                            d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span>{survey.questions.length} Soru</span>
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
  );
}
