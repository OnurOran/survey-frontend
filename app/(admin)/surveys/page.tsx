'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ColumnDef, SortingState } from '@tanstack/react-table';
import { useSurveys, usePublishSurvey } from '@/src/features/survey/hooks';
import { Button } from '@/src/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/src/components/ui/dialog';
import { Label } from '@/src/components/ui/label';
import { DateTimePicker } from '@/src/components/ui/date-time-picker';
import { DataTable } from '@/src/components/ui/data-table';
import { SurveyListItemDto } from '@/src/types';

type SurveyStatus = {
  value: 'draft' | 'published';
  label: string;
  color: string;
};

const getSurveyStatus = (survey: SurveyListItemDto): SurveyStatus => {
  if (!survey.isActive) {
    return { value: 'draft', label: 'Taslak', color: 'bg-slate-100 text-slate-700' };
  }

  return { value: 'published', label: 'Yayınlanmış', color: 'bg-green-100 text-green-700' };
};

const formatDate = (dateString: string | null) => {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleString('tr-TR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Survey List Page - DataTable based
 */
export default function SurveysPage() {
  const router = useRouter();
  const { data: surveys, isLoading, error } = useSurveys();
  const publishSurvey = usePublishSurvey();

  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [selectedSurveyId, setSelectedSurveyId] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);

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
    } catch {
      // handled by mutation hook
    }
  };

  const columns: ColumnDef<SurveyListItemDto>[] = useMemo(
    () => [
      {
        accessorKey: 'title',
        header: 'Başlık',
        filterFn: 'includesString',
        cell: ({ row }) => (
          <div className="font-medium text-slate-900">{row.original.title}</div>
        ),
      },
      {
        id: 'accessType',
        header: 'Erişim',
        accessorFn: (row) => row.accessType,
        filterFn: 'equalsString',
        cell: ({ getValue }) => {
          const value = getValue<string>();
          const isInternal = value === 'Internal';
          return (
            <span
              className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${
                isInternal ? 'bg-purple-100 text-purple-700' : 'bg-orange-100 text-orange-700'
              }`}
            >
              {isInternal ? 'Dahili' : 'Halka Açık'}
            </span>
          );
        },
      },
      {
        id: 'status',
        header: 'Durum',
        accessorFn: (row) => getSurveyStatus(row).value,
        filterFn: 'equalsString',
        cell: ({ row }) => {
          const status = getSurveyStatus(row.original);
          return (
            <span
              className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${status.color}`}
            >
              {status.label}
            </span>
          );
        },
      },
      {
        accessorKey: 'startDate',
        header: ({ column }) => {
          return <span className="text-slate-800 font-semibold">Başlangıç</span>;
        },
        cell: ({ getValue }) => <span>{formatDate(getValue<string | null>())}</span>,
      },
      {
        accessorKey: 'endDate',
        header: 'Bitiş',
        cell: ({ getValue }) => <span>{formatDate(getValue<string | null>())}</span>,
      },
      {
        accessorKey: 'createdBy',
        header: 'Oluşturan',
        cell: ({ getValue }) => <span className="text-slate-700">{getValue<string>()}</span>,
      },
      {
        id: 'actions',
        header: 'İşlemler',
        cell: ({ row }) => {
          const survey = row.original;
          const status = getSurveyStatus(survey);
          const isDraft = status.value === 'draft';

          return (
            <div className="flex flex-wrap gap-2">
              {isDraft && (
                <Button size="sm" style={{ backgroundColor: '#0055a5' }} onClick={() => handlePublishClick(survey.id)}>
                  Yayınla
                </Button>
              )}
              {isDraft && (
                <Button variant="outline" size="sm" onClick={() => router.push(`/surveys/${survey.id}/edit`)}>
                  Düzenle
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={() => router.push(`/surveys/${survey.id}`)}>
                Ön İzleme
              </Button>
              {!isDraft && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/surveys/${survey.id}/report`)}
                  className="bg-green-50 border-green-200 hover:bg-green-100"
                >
                  📊 Rapor
                </Button>
              )}
            </div>
          );
        },
      },
    ],
    [router]
  );

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
        <div className="text-center text-red-600">
          Anketler yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="container mx-auto px-6 py-4 w-full">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-800">Anketler</h1>
              <p className="text-slate-600 mt-1">Departman anketlerinizi görüntüleyin ve yönetin</p>
            </div>
            <Button
              onClick={() => router.push('/surveys/new')}
              style={{ backgroundColor: '#0055a5' }}
              className="hover:opacity-90"
            >
              Anket Oluştur
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-6 w-full">
        <DataTable
          columns={columns}
          data={surveys ?? []}
          searchKey="title"
           sorting={sorting}
           onSortingChange={setSorting}
          filterableColumns={[
            {
              id: 'status',
              title: 'Durum',
              options: [
                { value: 'draft', label: 'Taslak' },
                { value: 'published', label: 'Yayınlanmış' },
              ],
            },
            {
              id: 'accessType',
              title: 'Erişim',
              options: [
                { value: 'Internal', label: 'Dahili' },
                { value: 'Public', label: 'Halka Açık' },
              ],
            },
          ]}
          toolbarContent={null}
          emptyMessage="Henüz anket bulunmuyor"
        />
      </div>

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
              <Button type="button" variant="outline" onClick={() => setPublishDialogOpen(false)}>
                İptal
              </Button>
              <Button onClick={handlePublish} disabled={publishSurvey.isPending} style={{ backgroundColor: '#0055a5' }}>
                {publishSurvey.isPending ? 'Yayınlanıyor...' : 'Yayınla'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
