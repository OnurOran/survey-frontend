import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { Textarea } from '@/src/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/components/ui/select';
import { AttachmentUpload } from '../AttachmentUpload';
import { AttachmentData } from '../../question-types/types';

interface SurveyBasicInfoProps {
  title: string;
  description: string;
  accessType: 'Internal' | 'Public';
  attachment: AttachmentData | null;
  onTitleChange: (title: string) => void;
  onDescriptionChange: (description: string) => void;
  onAccessTypeChange: (accessType: 'Internal' | 'Public') => void;
  onAttachmentChange: (attachment: AttachmentData | null) => void;
}

/**
 * Survey Basic Information Component
 * Title, description, access type, and survey-level attachment
 */
export function SurveyBasicInfo({
  title,
  description,
  accessType,
  attachment,
  onTitleChange,
  onDescriptionChange,
  onAccessTypeChange,
  onAttachmentChange,
}: SurveyBasicInfoProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Temel Bilgiler</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Title */}
        <div>
          <Label htmlFor="title">Anket Başlığı *</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="Örn: Çalışan Memnuniyet Anketi 2025"
            required
          />
        </div>

        {/* Description */}
        <div>
          <Label htmlFor="description">Açıklama *</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            placeholder="Anket hakkında kısa bir açıklama..."
            rows={3}
            required
          />
        </div>

        {/* Access Type */}
        <div>
          <Label htmlFor="accessType">Erişim Tipi *</Label>
          <Select value={accessType} onValueChange={onAccessTypeChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="Internal">Dahili (Sadece Çalışanlar)</SelectItem>
              <SelectItem value="Public">Halka Açık</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Survey Attachment */}
        <div>
          <Label>Anket Eki (Opsiyonel)</Label>
          <p className="text-sm text-slate-500 mb-2">
            Anketin başında gösterilecek bir dosya ekleyebilirsiniz (örn: logo, açıklama dokümanı)
          </p>
          <AttachmentUpload
            attachment={attachment}
            onChange={onAttachmentChange}
            label="Dosya Ekle"
          />
        </div>
      </CardContent>
    </Card>
  );
}
