'use client';

import { useState, useRef, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSurveyReport, useParticipantResponse } from '@/src/features/survey/hooks';
import { Button } from '@/src/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/src/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/src/components/ui/popover';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { apiClient } from '@/src/lib/api';
import type { QuestionReportDto, OptionResultDto, ParticipantResponseDto } from '@/src/types';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/src/lib/utils';

const COLORS = ['#0055a5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

// Authenticated Image Component for Answer Attachments
function AuthenticatedImage({ attachmentId, fileName, className }: { attachmentId: string; fileName: string; className?: string }) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchImage = async () => {
      try {
        const response = await apiClient.get(`/attachments/answers/${attachmentId}`, {
          responseType: 'blob',
        });
        const url = URL.createObjectURL(response.data);
        setImageUrl(url);
      } catch (err) {
        console.error('Failed to load image:', err);
        setError(true);
      }
    };

    fetchImage();

    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [attachmentId]);

  if (error) return null;
  if (!imageUrl) return <div className="text-sm text-slate-500">Görsel yükleniyor...</div>;

  return <img src={imageUrl} alt={fileName} className={className} />;
}

// Authenticated Image Component for Question Attachments
function QuestionAttachmentImage({ attachmentId, fileName, className }: { attachmentId: string; fileName: string; className?: string }) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchImage = async () => {
      try {
        const response = await apiClient.get(`/attachments/${attachmentId}`, {
          responseType: 'blob',
        });
        const url = URL.createObjectURL(response.data);
        setImageUrl(url);
      } catch (err) {
        console.error('Failed to load question attachment:', err);
        setError(true);
      }
    };

    fetchImage();

    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [attachmentId]);

  if (error) return null;
  if (!imageUrl) return <div className="text-sm text-slate-500">Görsel yükleniyor...</div>;

  return <img src={imageUrl} alt={fileName} className={className} />;
}

export default function SurveyReportPage() {
  const params = useParams();
  const router = useRouter();
  const surveyId = params?.id as string;
  const reportRef = useRef<HTMLDivElement>(null);

  const { data: report, isLoading, error } = useSurveyReport(surveyId);
  const [selectedParticipantId, setSelectedParticipantId] = useState<string>('');
  const [selectedParticipantName, setSelectedParticipantName] = useState<string>('');
  const { data: participantResponse } = useParticipantResponse(surveyId, selectedParticipantName);
  const [exportingPDF, setExportingPDF] = useState(false);
  const [comboboxOpen, setComboboxOpen] = useState(false);

  const handleParticipantSelect = (participantName: string) => {
    if (!participantName || participantName === 'all') {
      setSelectedParticipantId('');
      setSelectedParticipantName('');
      setComboboxOpen(false);
      return;
    }

    const participant = report?.participants.find(p => p.participantName === participantName);
    if (participant) {
      setSelectedParticipantId(participant.participationId);
      setSelectedParticipantName(participantName);
    }
    setComboboxOpen(false);
  };

  const handleFileDownload = async (attachmentId: string, fileName: string) => {
    try {
      const response = await apiClient.get(`/attachments/answers/${attachmentId}`, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download error:', err);
      alert('Dosya indirilirken bir hata oluştu');
    }
  };

  const handleExportPDF = async () => {
    if (!reportRef.current || !report) return;

    setExportingPDF(true);

    // Create a temporary style element to override problematic CSS colors
    const styleOverride = document.createElement('style');
    styleOverride.id = 'pdf-color-override';
    styleOverride.textContent = `
      /* Override all potentially problematic colors with RGB equivalents */
      * {
        color: inherit !important;
        background-color: transparent !important;
        border-color: rgb(203, 213, 225) !important;
      }
      body, .bg-white, [class*="bg-white"] {
        background-color: rgb(255, 255, 255) !important;
      }
      .bg-slate-50, [class*="bg-slate-50"] {
        background-color: rgb(248, 250, 252) !important;
      }
      .bg-slate-100, [class*="bg-slate-100"] {
        background-color: rgb(241, 245, 249) !important;
      }
      .bg-blue-50, [class*="bg-blue-50"] {
        background-color: rgb(239, 246, 255) !important;
      }
      .text-slate-600, [class*="text-slate-600"] {
        color: rgb(71, 85, 105) !important;
      }
      .text-slate-700, [class*="text-slate-700"] {
        color: rgb(51, 65, 85) !important;
      }
      .text-slate-800, [class*="text-slate-800"] {
        color: rgb(30, 41, 59) !important;
      }
      .text-slate-900, [class*="text-slate-900"] {
        color: rgb(15, 23, 42) !important;
      }
      .text-blue-900, [class*="text-blue-900"] {
        color: rgb(30, 58, 138) !important;
      }
      .text-green-600, [class*="text-green-600"] {
        color: rgb(22, 163, 74) !important;
      }
      .text-blue-600, [class*="text-blue-600"] {
        color: rgb(37, 99, 235) !important;
      }
      .border-slate-200, [class*="border-slate-200"] {
        border-color: rgb(226, 232, 240) !important;
      }
      .border-blue-100, [class*="border-blue-100"] {
        border-color: rgb(219, 234, 254) !important;
      }
      .border-blue-200, [class*="border-blue-200"] {
        border-color: rgb(191, 219, 254) !important;
      }
    `;

    try {
      // Wait for all images to load
      const images = reportRef.current.querySelectorAll('img');
      const imagePromises = Array.from(images).map((img) => {
        if (img.complete) return Promise.resolve();
        return new Promise((resolve) => {
          img.onload = resolve;
          img.onerror = resolve;
          setTimeout(resolve, 3000);
        });
      });

      await Promise.all(imagePromises);
      await new Promise(resolve => setTimeout(resolve, 500));

      // Add the style override
      document.head.appendChild(styleOverride);

      // Wait for styles to apply
      await new Promise(resolve => setTimeout(resolve, 100));

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;

      // Title
      pdf.setFontSize(18);
      pdf.text(report.title, margin, 20);
      pdf.setFontSize(11);
      const subtitle = selectedParticipantId
        ? `Katılımcı: ${selectedParticipantName}`
        : `Toplam Katılım: ${report.totalParticipations} | Tamamlanan: ${report.completedParticipations} (${report.completionRate.toFixed(1)}%)`;
      pdf.text(subtitle, margin, 28);

      const canvas = await html2canvas(reportRef.current, {
        scale: 1.5,
        useCORS: true,
        logging: false,
        allowTaint: true,
        imageTimeout: 0,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');
      const imgWidth = pageWidth - 2 * margin;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 35;

      pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
      heightLeft -= pageHeight - position - margin;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight + margin;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
        heightLeft -= pageHeight - margin;
      }

      const filename = selectedParticipantId
        ? `${report.title}_${selectedParticipantName}_Rapor.pdf`
        : `${report.title}_Rapor.pdf`;
      pdf.save(filename);
    } catch (err) {
      console.error('PDF export error:', err);
      alert('PDF oluşturulurken bir hata oluştu: ' + (err as Error).message);
    } finally {
      // Remove the style override
      const styleEl = document.getElementById('pdf-color-override');
      if (styleEl) {
        styleEl.remove();
      }
      setExportingPDF(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
          <p className="mt-4 text-sm text-slate-600">Rapor yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center text-red-600">
          Rapor yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.
        </div>
      </div>
    );
  }

  const isIndividualView = !!selectedParticipantId && !!participantResponse;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="container mx-auto px-6 py-4 w-full">
          <div className="flex items-center justify-between">
            <div>
              <Button variant="outline" onClick={() => router.back()} className="mb-2">
                ← Geri Dön
              </Button>
              <h1 className="text-3xl font-bold text-slate-800">{report.title}</h1>
              <p className="text-slate-600 mt-1">{report.description}</p>
            </div>
            <Button
              onClick={handleExportPDF}
              disabled={exportingPDF}
              style={{ backgroundColor: '#0055a5' }}
              className="hover:opacity-90"
            >
              {exportingPDF ? 'PDF Oluşturuluyor...' : 'PDF İndir'}
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-6 w-full">
        <div className="space-y-6" ref={reportRef}>
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Toplam Katılım</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900">{report.totalParticipations}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Tamamlanan</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">{report.completedParticipations}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Tamamlanma Oranı</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">{report.completionRate.toFixed(1)}%</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Soru Sayısı</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900">{report.questions.length}</div>
              </CardContent>
            </Card>
          </div>

          {/* Survey Info - Intro/Outro/Attachment */}
          {(report.introText || report.outroText || report.attachment) && (
            <Card className="bg-white">
              <CardHeader>
                <CardTitle>Anket Bilgileri</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {report.introText && (
                  <div>
                    <div className="text-sm font-semibold text-slate-700 mb-1">Giriş Metni</div>
                    <div className="text-sm text-slate-600 whitespace-pre-wrap bg-slate-50 p-3 rounded">
                      {report.introText}
                    </div>
                  </div>
                )}
                {report.outroText && (
                  <div>
                    <div className="text-sm font-semibold text-slate-700 mb-1">Bitiş Metni</div>
                    <div className="text-sm text-slate-600 whitespace-pre-wrap bg-slate-50 p-3 rounded">
                      {report.outroText}
                    </div>
                  </div>
                )}
                {report.attachment && (
                  <div>
                    <div className="text-sm font-semibold text-slate-700 mb-2">📎 Anket Eki</div>
                    {report.attachment.contentType.startsWith('image/') ? (
                      <QuestionAttachmentImage
                        attachmentId={report.attachment.id}
                        fileName={report.attachment.fileName}
                        className="max-w-md max-h-64 rounded border border-slate-300 object-contain"
                      />
                    ) : (
                      <div className="text-sm text-slate-700 bg-slate-50 p-3 rounded">
                        {report.attachment.fileName} ({(report.attachment.sizeBytes / 1024).toFixed(2)} KB)
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Participant Selector - Only for Internal surveys */}
          {report.accessType === 'Internal' && report.participants.length > 0 && (
            <Card className="bg-white">
              <CardHeader>
                <CardTitle>Katılımcı Seçimi</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 items-center">
                  <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={comboboxOpen}
                        className="w-full md:w-96 justify-between bg-white"
                      >
                        {selectedParticipantName
                          ? `👤 ${selectedParticipantName}`
                          : '📊 Tüm Katılımcılar (Toplu Rapor)'}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full md:w-96 p-0 bg-white" align="start">
                      <Command className="bg-white">
                        <CommandInput placeholder="Katılımcı ara..." className="bg-white" />
                        <CommandList className="bg-white">
                          <CommandEmpty>Katılımcı bulunamadı.</CommandEmpty>
                          <CommandGroup className="bg-white">
                            <CommandItem
                              value="all"
                              onSelect={() => handleParticipantSelect('all')}
                              className="bg-white hover:bg-slate-100"
                            >
                              <Check
                                className={cn(
                                  'mr-2 h-4 w-4',
                                  !selectedParticipantName ? 'opacity-100' : 'opacity-0'
                                )}
                              />
                              📊 Tüm Katılımcılar (Toplu Rapor)
                            </CommandItem>
                            {report.participants.map((participant) => (
                              <CommandItem
                                key={participant.participationId}
                                value={participant.participantName || ''}
                                onSelect={handleParticipantSelect}
                                className="bg-white hover:bg-slate-100"
                              >
                                <Check
                                  className={cn(
                                    'mr-2 h-4 w-4',
                                    selectedParticipantName === participant.participantName
                                      ? 'opacity-100'
                                      : 'opacity-0'
                                  )}
                                />
                                👤 {participant.participantName || 'İsimsiz'}{' '}
                                {participant.isCompleted ? '✓' : '⏳'}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  {selectedParticipantId && (
                    <Button variant="outline" onClick={() => handleParticipantSelect('all')} className="bg-white">
                      Temizle
                    </Button>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  {isIndividualView
                    ? 'Seçili katılımcının tüm yanıtlarını görüyorsunuz'
                    : 'Bireysel yanıtları görmek için bir katılımcı seçin veya arayın'}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Questions with optional individual answers */}
          {report.questions.map((question, index) => (
            <QuestionResultCard
              key={question.questionId}
              question={question}
              index={index}
              onFileDownload={handleFileDownload}
              participantResponse={isIndividualView ? participantResponse : undefined}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// Individual Participant Response View
function IndividualResponseView({
  response,
  onFileDownload
}: {
  response: ParticipantResponseDto;
  onFileDownload: (attachmentId: string, fileName: string) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Yanıtlar</CardTitle>
        <div className="text-sm text-slate-600">
          Başlangıç: {new Date(response.startedAt).toLocaleString('tr-TR')}
          {response.completedAt && ` | Tamamlanma: ${new Date(response.completedAt).toLocaleString('tr-TR')}`}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {response.answers.map((answer, idx) => (
            <div key={answer.questionId} className="p-4 bg-slate-50 rounded-md">
              <div className="font-semibold text-slate-900 mb-2">S{idx + 1}: {answer.questionText}</div>
              <div className="text-slate-700">
                {answer.textValue && (
                  <div className="whitespace-pre-wrap">{answer.textValue}</div>
                )}
                {answer.selectedOptions.length > 0 && (
                  <ul className="list-disc list-inside">
                    {answer.selectedOptions.map((opt, i) => (
                      <li key={i}>{opt}</li>
                    ))}
                  </ul>
                )}
                {answer.fileName && answer.answerId && (
                  <div className="mt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onFileDownload(answer.answerId!, answer.fileName!)}
                    >
                      📎 {answer.fileName}
                    </Button>
                  </div>
                )}
                {!answer.textValue && answer.selectedOptions.length === 0 && !answer.fileName && (
                  <span className="text-slate-400 italic">Yanıt verilmedi</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Component for rendering individual question results (aggregate view)
function QuestionResultCard({
  question,
  index,
  onFileDownload,
  participantResponse
}: {
  question: QuestionReportDto;
  index: number;
  onFileDownload: (attachmentId: string, fileName: string) => void;
  participantResponse?: ParticipantResponseDto;
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Find this participant's answer for this question
  const participantAnswer = participantResponse?.answers.find(a => a.questionId === question.questionId);

  // Debug logging
  if (participantResponse && participantAnswer) {
    console.log('Question:', question.questionId, question.text);
    console.log('Participant Answer:', participantAnswer);
    console.log('Has fileName:', !!participantAnswer.fileName);
    console.log('Has answerId:', !!participantAnswer.answerId);
    console.log('Has textValue:', !!participantAnswer.textValue);
    console.log('selectedOptions length:', participantAnswer.selectedOptions?.length);
  }

  const renderQuestionContent = () => {
    // If participant is selected, don't show aggregate views (they'll see their answer in the blue box below)
    if (participantResponse) {
      return null;
    }

    switch (question.type) {
      case 'SingleSelect':
      case 'MultiSelect':
        return <BarChartView data={question.optionResults || []} type={question.type} />;

      case 'OpenText':
        return <OpenTextView
          responses={question.textResponses || []}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          selectedParticipantName={participantResponse?.participantName || undefined}
        />;

      case 'FileUpload':
        return <FileUploadView
          responses={question.fileResponses || []}
          onFileDownload={onFileDownload}
          selectedParticipantName={participantResponse?.participantName || undefined}
        />;

      case 'Conditional':
        return <ConditionalView question={question} onFileDownload={onFileDownload} />;

      default:
        return <div className="text-sm text-slate-500">Desteklenmeyen soru tipi</div>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">
              S{index + 1}: {question.text}
            </CardTitle>
            <div className="flex gap-4 mt-2 text-sm text-slate-600">
              <span>Tip: {question.type}</span>
              <span>Yanıt: {question.totalResponses}</span>
              <span>Oran: {question.responseRate.toFixed(1)}%</span>
              {question.isRequired && <span className="text-red-600">*Zorunlu</span>}
            </div>
            {/* Question Attachment Display */}
            {question.attachment && (
              <div className="mt-3 p-3 bg-blue-50 rounded-md border border-blue-200">
                <div className="text-xs font-medium text-blue-900 mb-2">📎 Soru Eki</div>
                {question.attachment.contentType.startsWith('image/') ? (
                  <QuestionAttachmentImage
                    attachmentId={question.attachment.id}
                    fileName={question.attachment.fileName}
                    className="max-w-sm max-h-48 rounded border border-blue-300 object-contain"
                  />
                ) : (
                  <div className="text-sm text-blue-800">
                    {question.attachment.fileName} ({(question.attachment.sizeBytes / 1024).toFixed(2)} KB)
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {renderQuestionContent()}

        {/* Individual Participant Answer */}
        {participantAnswer && (
          <div className="mt-6 pt-4 border-t-2 border-blue-200">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="text-sm font-bold text-blue-900">
                  👤 {participantResponse?.participantName || 'Seçili Katılımcı'} - Yanıt
                </div>
              </div>
              <div className="text-sm text-slate-800">
                {participantAnswer.textValue && (
                  <div className="whitespace-pre-wrap bg-white p-3 rounded border border-blue-100">
                    {participantAnswer.textValue}
                  </div>
                )}
                {participantAnswer.selectedOptions && participantAnswer.selectedOptions.length > 0 && (
                  <ul className="list-disc list-inside space-y-1 bg-white p-3 rounded border border-blue-100">
                    {participantAnswer.selectedOptions.map((opt, i) => (
                      <li key={i} className="text-slate-700">{opt}</li>
                    ))}
                  </ul>
                )}
                {participantAnswer.fileName && (
                  <div className="bg-white p-3 rounded border border-blue-100">
                    {participantAnswer.answerId ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onFileDownload(participantAnswer.answerId!, participantAnswer.fileName!)}
                        className="bg-blue-50 border-blue-200 hover:bg-blue-100"
                      >
                        📎 {participantAnswer.fileName}
                      </Button>
                    ) : (
                      <div className="text-sm text-slate-600">
                        📎 {participantAnswer.fileName}
                      </div>
                    )}
                  </div>
                )}
                {!participantAnswer.textValue &&
                 (!participantAnswer.selectedOptions || participantAnswer.selectedOptions.length === 0) &&
                 !participantAnswer.fileName && (
                  <span className="text-slate-500 italic">Yanıt verilmedi</span>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Bar Chart for SingleSelect and MultiSelect
function BarChartView({ data, type }: { data: OptionResultDto[]; type: string }) {
  const chartData = data.map((opt) => ({
    name: opt.text.length > 30 ? opt.text.substring(0, 30) + '...' : opt.text,
    count: opt.selectionCount,
    percentage: opt.percentage,
  }));

  return (
    <div className="space-y-4">
      <ResponsiveContainer width="100%" height={Math.max(300, data.length * 60)}>
        <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis dataKey="name" type="category" width={150} />
          <Tooltip formatter={(value: number, name: string) => [`${value} (${chartData.find(d => d.count === value)?.percentage.toFixed(1)}%)`, name === 'count' ? 'Seçim Sayısı' : name]} />
          <Legend />
          <Bar dataKey="count" fill="#0055a5" name="Seçim Sayısı">
            {chartData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="grid grid-cols-1 gap-2">
        {data.map((opt, idx) => (
          <div key={opt.optionId} className="p-3 bg-slate-50 rounded-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                <span className="text-sm font-medium">{opt.text}</span>
              </div>
              <div className="text-sm text-slate-600">
                {opt.selectionCount} ({opt.percentage.toFixed(1)}%)
              </div>
            </div>
            {/* Option Attachment Display */}
            {opt.attachment && (
              <div className="mt-2 ml-7 p-2 bg-white rounded border border-slate-200">
                <div className="text-xs text-slate-600 mb-1">📎 Seçenek Eki</div>
                {opt.attachment.contentType.startsWith('image/') ? (
                  <QuestionAttachmentImage
                    attachmentId={opt.attachment.id}
                    fileName={opt.attachment.fileName}
                    className="max-w-xs max-h-32 rounded object-contain"
                  />
                ) : (
                  <div className="text-xs text-slate-700">
                    {opt.attachment.fileName} ({(opt.attachment.sizeBytes / 1024).toFixed(2)} KB)
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Open Text Responses with Pagination
function OpenTextView({
  responses,
  currentPage,
  itemsPerPage,
  onPageChange,
  selectedParticipantName,
}: {
  responses: any[];
  currentPage: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  selectedParticipantName?: string;
}) {
  // Filter responses if a specific participant is selected
  const filteredResponses = selectedParticipantName
    ? responses.filter(r => r.participantName === selectedParticipantName)
    : responses;

  const totalPages = Math.ceil(filteredResponses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedResponses = filteredResponses.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="space-y-4">
      <div className="text-sm text-slate-600">
        {selectedParticipantName ? `${filteredResponses.length} yanıt` : `Toplam ${filteredResponses.length} yanıt`}
      </div>

      {paginatedResponses.map((response, idx) => (
        <div key={response.participationId + idx} className="p-4 bg-slate-50 rounded-md">
          <div className="flex justify-between items-start mb-2">
            {response.participantName && <span className="text-xs font-medium text-slate-700">{response.participantName}</span>}
            <span className="text-xs text-slate-500">{new Date(response.submittedAt).toLocaleString('tr-TR')}</span>
          </div>
          <p className="text-sm text-slate-900 whitespace-pre-wrap">{response.textValue}</p>
        </div>
      ))}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <Button variant="outline" size="sm" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>
            Önceki
          </Button>
          <span className="text-sm text-slate-600">
            Sayfa {currentPage} / {totalPages}
          </span>
          <Button variant="outline" size="sm" onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}>
            Sonraki
          </Button>
        </div>
      )}
    </div>
  );
}

// File Upload Responses with preview
function FileUploadView({
  responses,
  onFileDownload,
  selectedParticipantName,
}: {
  responses: any[];
  onFileDownload: (attachmentId: string, fileName: string) => void;
  selectedParticipantName?: string;
}) {
  // Filter responses if a specific participant is selected
  const filteredResponses = selectedParticipantName
    ? responses.filter(r => r.participantName === selectedParticipantName)
    : responses;

  return (
    <div className="space-y-2">
      <div className="text-sm text-slate-600 mb-3">
        {selectedParticipantName ? `${filteredResponses.length} dosya` : `Toplam ${filteredResponses.length} dosya`}
      </div>
      {filteredResponses.map((file) => {
        const isImage = file.contentType.startsWith('image/');
        return (
          <div key={file.answerId} className="p-3 bg-slate-50 rounded-md">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="text-sm font-medium text-slate-900">{file.fileName}</div>
                <div className="text-xs text-slate-500 mt-1">
                  {file.participantName && `${file.participantName} - `}
                  {(file.sizeBytes / 1024).toFixed(2)} KB - {new Date(file.submittedAt).toLocaleString('tr-TR')}
                </div>
                {isImage && (
                  <div className="mt-2">
                    <AuthenticatedImage
                      attachmentId={file.attachmentId}
                      fileName={file.fileName}
                      className="max-w-md max-h-64 rounded border border-slate-200 object-contain"
                    />
                  </div>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onFileDownload(file.attachmentId, file.fileName)}
              >
                İndir
              </Button>
            </div>
          </div>
        );
      })}
      {filteredResponses.length === 0 && <div className="text-sm text-slate-500">Dosya yüklenmemiş</div>}
    </div>
  );
}

// Conditional Question Results
function ConditionalView({
  question,
  onFileDownload
}: {
  question: QuestionReportDto;
  onFileDownload: (attachmentId: string, fileName: string) => void;
}) {
  return (
    <div className="space-y-6">
      {/* Parent question options */}
      <div>
        <h4 className="font-semibold text-slate-900 mb-3">Ana Soru Dağılımı</h4>
        <BarChartView data={question.optionResults || []} type="Conditional" />
      </div>

      {/* Child questions for each branch */}
      {question.conditionalResults?.map((branch) => (
        <div key={branch.parentOptionId} className="border-l-4 border-blue-500 pl-4 ml-4">
          <h4 className="font-semibold text-slate-900 mb-2">
            "{branch.parentOptionText}" seçeneği için ({branch.participantCount} katılımcı)
          </h4>
          <div className="space-y-4">
            {branch.childQuestions.map((childQ, idx) => (
              <div key={childQ.questionId} className="bg-slate-50 p-4 rounded-md">
                <h5 className="font-medium text-sm text-slate-800 mb-2">
                  {idx + 1}. {childQ.text}
                </h5>
                {childQ.type === 'SingleSelect' || childQ.type === 'MultiSelect' ? (
                  <BarChartView data={childQ.optionResults || []} type={childQ.type} />
                ) : childQ.type === 'OpenText' ? (
                  <OpenTextView responses={childQ.textResponses || []} currentPage={1} itemsPerPage={5} onPageChange={() => {}} />
                ) : childQ.type === 'FileUpload' ? (
                  <FileUploadView responses={childQ.fileResponses || []} onFileDownload={onFileDownload} />
                ) : (
                  <div className="text-sm text-slate-500">Yanıt sayısı: {childQ.totalResponses}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
