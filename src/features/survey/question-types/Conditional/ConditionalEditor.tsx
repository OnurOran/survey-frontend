'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { Button } from '@/src/components/ui/button';
import { Checkbox } from '@/src/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/components/ui/select';
import { Textarea } from '@/src/components/ui/textarea';
import { QuestionFormData, ChildQuestionFormData, OptionFormData } from '../types';
import { QuestionType } from '@/src/types';
import { Trash2, Plus, ChevronDown, ChevronRight } from 'lucide-react';
import { AttachmentUpload } from '../../components/AttachmentUpload';

const AVAILABLE_CONTENT_TYPES = [
  { value: 'image/png', label: 'PNG Images' },
  { value: 'image/jpeg', label: 'JPEG Images' },
  { value: 'image/jpg', label: 'JPG Images' },
  { value: 'image/webp', label: 'WebP Images' },
  { value: 'application/pdf', label: 'PDF Documents' },
];

interface ConditionalEditorProps {
  question: QuestionFormData;
  onChange: (question: QuestionFormData) => void;
}

export function ConditionalEditor({ question, onChange }: ConditionalEditorProps) {
  const [expandedOptions, setExpandedOptions] = useState<Record<number, boolean>>({});

  // Initialize options/childQuestions safely (avoid setState during render)
  useEffect(() => {
    const needsOptions = question.options.length < 2;
    const needsChildren = question.childQuestions === undefined;

    if (!needsOptions && !needsChildren) {
      return;
    }

    const fixedOptions = needsOptions
      ? [
          ...(question.options.length > 0
            ? question.options.map((opt, idx) => ({ ...opt, order: idx + 1, value: idx + 1 }))
            : []),
          ...Array.from({ length: 2 - question.options.length }, (_, idx) => {
            const order = question.options.length + idx + 1;
            return { text: '', order, value: order, attachment: null };
          }),
        ]
      : question.options;

    onChange({
      ...question,
      options: fixedOptions,
      childQuestions: question.childQuestions ?? [],
    });
  }, [onChange, question]);

  const handleOptionTextChange = (index: number, text: string) => {
    const newOptions = [...question.options];
    newOptions[index] = { ...newOptions[index], text };
    onChange({ ...question, options: newOptions });
  };

  const toggleOptionExpanded = (order: number) => {
    setExpandedOptions(prev => ({ ...prev, [order]: !prev[order] }));
  };

  const addChildQuestion = (parentOptionOrder: number) => {
    const childQuestions = question.childQuestions || [];
    const newChildQuestion: ChildQuestionFormData = {
      parentOptionOrder,
      text: '',
      description: undefined,
      type: 'SingleSelect',
      order: childQuestions.filter(cq => cq.parentOptionOrder === parentOptionOrder).length + 1,
      isRequired: false,
      attachment: null,
      options: [],
    };

    onChange({
      ...question,
      childQuestions: [...childQuestions, newChildQuestion],
    });
  };

  const removeChildQuestion = (parentOptionOrder: number, childIndex: number) => {
    const childQuestions = question.childQuestions || [];
    const optionChildren = childQuestions.filter(cq => cq.parentOptionOrder === parentOptionOrder);
    const childToRemove = optionChildren[childIndex];

    const newChildQuestions = childQuestions.filter(cq => cq !== childToRemove);

    onChange({
      ...question,
      childQuestions: newChildQuestions,
    });
  };

  const updateChildQuestion = (parentOptionOrder: number, childIndex: number, updates: Partial<ChildQuestionFormData>) => {
    const childQuestions = question.childQuestions || [];
    const optionChildren = childQuestions.filter(cq => cq.parentOptionOrder === parentOptionOrder);
    const childToUpdate = optionChildren[childIndex];

    const newChildQuestions = childQuestions.map(cq =>
      cq === childToUpdate ? { ...cq, ...updates } : cq
    );

    onChange({
      ...question,
      childQuestions: newChildQuestions,
    });
  };

  const addChildOption = (parentOptionOrder: number, childIndex: number) => {
    const childQuestions = question.childQuestions || [];
    const optionChildren = childQuestions.filter(cq => cq.parentOptionOrder === parentOptionOrder);
    const child = optionChildren[childIndex];

    const newOption: OptionFormData = {
      text: '',
      order: child.options.length + 1,
      value: child.options.length + 1,
      attachment: null,
    };

    updateChildQuestion(parentOptionOrder, childIndex, {
      options: [...child.options, newOption],
    });
  };

  const removeChildOption = (parentOptionOrder: number, childIndex: number, optionIndex: number) => {
    const childQuestions = question.childQuestions || [];
    const optionChildren = childQuestions.filter(cq => cq.parentOptionOrder === parentOptionOrder);
    const child = optionChildren[childIndex];

    const newOptions = child.options.filter((_, idx) => idx !== optionIndex);

    updateChildQuestion(parentOptionOrder, childIndex, {
      options: newOptions,
    });
  };

  const updateChildOption = (parentOptionOrder: number, childIndex: number, optionIndex: number, text: string) => {
    const childQuestions = question.childQuestions || [];
    const optionChildren = childQuestions.filter(cq => cq.parentOptionOrder === parentOptionOrder);
    const child = optionChildren[childIndex];

    const newOptions = [...child.options];
    newOptions[optionIndex] = { ...newOptions[optionIndex], text };

    updateChildQuestion(parentOptionOrder, childIndex, {
      options: newOptions,
    });
  };

  const getChildrenForOption = (optionOrder: number): ChildQuestionFormData[] => {
    return (question.childQuestions || [])
      .filter(cq => cq.parentOptionOrder === optionOrder)
      .sort((a, b) => a.order - b.order);
  };

  const reorderChildQuestion = (parentOptionOrder: number, fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;

    const childQuestions = question.childQuestions || [];
    const optionChildren = getChildrenForOption(parentOptionOrder);

    // Get the child being moved
    const movedChild = optionChildren[fromIndex];

    // Create a new ordered array for this option's children
    const reordered = [...optionChildren];
    reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, movedChild);

    // Update order values
    reordered.forEach((child, idx) => {
      child.order = idx + 1;
    });

    // Rebuild the full childQuestions array with updated orders
    const otherChildren = childQuestions.filter(cq => cq.parentOptionOrder !== parentOptionOrder);
    const newChildQuestions = [...otherChildren, ...reordered];

    onChange({ ...question, childQuestions: newChildQuestions });
  };

  const toggleChildQuestionContentType = (parentOptionOrder: number, childIndex: number, contentType: string) => {
    const childQuestions = question.childQuestions || [];
    const optionChildren = childQuestions.filter(cq => cq.parentOptionOrder === parentOptionOrder);
    const child = optionChildren[childIndex];

    const current = child.allowedAttachmentContentTypes || [];
    const updated = current.includes(contentType)
      ? current.filter((t) => t !== contentType)
      : [...current, contentType];

    updateChildQuestion(parentOptionOrder, childIndex, {
      allowedAttachmentContentTypes: updated.length > 0 ? updated : undefined,
    });
  };

  // Question types available for child questions (exclude Conditional to prevent nesting)
  const childQuestionTypes: QuestionType[] = ['SingleSelect', 'MultiSelect', 'OpenText', 'FileUpload'];

  const addParentOption = () => {
    if (question.options.length >= 5) return;
    const newOptions = [
      ...question.options,
      { text: '', order: question.options.length + 1, value: question.options.length + 1, attachment: null },
    ];
    onChange({ ...question, options: newOptions });
  };

  const removeParentOption = (index: number) => {
    const optionToRemove = question.options[index];
    const remainingOptions = question.options.filter((_, i) => i !== index);

    // Remove child questions associated with this option
    const remainingChildren = (question.childQuestions || []).filter(
      (cq) => cq.parentOptionOrder !== optionToRemove.order
    );

    // Re-order options and child parentOptionOrder
    const reindexedOptions = remainingOptions.map((opt, idx) => ({ ...opt, order: idx + 1, value: idx + 1 }));
    const reindexedChildren = remainingChildren.map((cq) => {
      // If parent order was higher than removed, decrement
      const newOrder = cq.parentOptionOrder > optionToRemove.order ? cq.parentOptionOrder - 1 : cq.parentOptionOrder;
      return { ...cq, parentOptionOrder: newOrder };
    });

    onChange({
      ...question,
      options: reindexedOptions,
      childQuestions: reindexedChildren,
    });
  };

  return (
    <div className="space-y-6">
      {/* Parent Question */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="question-text">Soru Metni *</Label>
          <Input
            id="question-text"
            value={question.text}
            onChange={(e) => onChange({ ...question, text: e.target.value, description: undefined })}
            placeholder="Koşullu sorunuzu yazın..."
          />
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="is-required"
            checked={question.isRequired}
            onCheckedChange={(checked) => onChange({ ...question, isRequired: checked as boolean, description: undefined })}
          />
          <Label htmlFor="is-required" className="cursor-pointer">
            Zorunlu soru
          </Label>
        </div>
      </div>

      {/* Options with Child Questions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-lg font-medium">Seçenekler (2-5 adet)</Label>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={addParentOption}
            disabled={question.options.length >= 5}
          >
            <Plus className="h-4 w-4 mr-2" />
            Seçenek Ekle
          </Button>
        </div>

        {question.options.map((option, index) => {
          const isExpanded = expandedOptions[option.order];
          const children = getChildrenForOption(option.order);

          return (
            <Card key={option.order} className="border-blue-200">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleOptionExpanded(option.order)}
                    className="p-1"
                  >
                    {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </Button>

                  <div className="flex-1">
                    <Label>Seçenek {option.order}</Label>
                    <Input
                      value={option.text}
                      onChange={(e) => handleOptionTextChange(index, e.target.value)}
                      placeholder={`Seçenek ${option.order} metni...`}
                      className="mt-1"
                    />
                  </div>

                  <div className="text-sm text-slate-500">
                    {children.length} alt soru
                  </div>
                  {question.options.length > 2 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeParentOption(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>

              {isExpanded && (
                <CardContent className="space-y-4">
                  {/* Child Questions */}
                  {children.length > 0 && (
                    <div className="space-y-3">
                      {children.map((child, childIdx) => (
                        <Card key={childIdx} className="border-slate-200 bg-slate-50">
                          <CardContent className="pt-4 space-y-3">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 space-y-3">
                                {/* Child Question Text */}
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <Label className="flex-1">Alt Soru {childIdx + 1}</Label>
                                    <Select
                                      value={String(childIdx + 1)}
                                      onValueChange={(value) => reorderChildQuestion(option.order, childIdx, parseInt(value) - 1)}
                                    >
                                      <SelectTrigger className="w-20 h-8 text-sm bg-white">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent className="bg-white z-50">
                                        {Array.from({ length: children.length }, (_, i) => (
                                          <SelectItem key={i} value={String(i + 1)}>
                                            {i + 1}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <Input
                                    value={child.text}
                                    onChange={(e) => updateChildQuestion(option.order, childIdx, { text: e.target.value })}
                                    placeholder="Alt soru metni..."
                                  />
                                </div>

                                {/* Child Question Type */}
                                <div className="flex gap-3">
                                  <div className="flex-1">
                                    <Label>Soru Tipi</Label>
                                    <Select
                                      value={child.type}
                                      onValueChange={(value) => updateChildQuestion(option.order, childIdx, { type: value as QuestionType })}
                                    >
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent className="bg-white z-50">
                                        {childQuestionTypes.map(type => (
                                          <SelectItem key={type} value={type}>
                                            {type === 'SingleSelect' ? 'Tek Seçim' :
                                             type === 'MultiSelect' ? 'Çoklu Seçim' :
                                             type === 'OpenText' ? 'Açık Uçlu' :
                                             'Dosya Yükleme'}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>

                                  <div className="flex items-end">
                                    <div className="flex items-center space-x-2">
                                      <Checkbox
                                        id={`child-required-${option.order}-${childIdx}`}
                                        checked={child.isRequired}
                                        onCheckedChange={(checked) => updateChildQuestion(option.order, childIdx, { isRequired: checked as boolean })}
                                      />
                                      <Label htmlFor={`child-required-${option.order}-${childIdx}`} className="cursor-pointer text-sm">
                                        Zorunlu
                                      </Label>
                                    </div>
                                  </div>
                                </div>

                                {/* Child Question Attachment */}
                                <div>
                                  <Label className="text-sm font-semibold text-slate-700">Soru Eki (Opsiyonel)</Label>
                                  <AttachmentUpload
                                    attachment={child.attachment}
                                    onChange={(attachment) => updateChildQuestion(option.order, childIdx, { attachment })}
                                    label="Dosya Ekle"
                                  />
                                </div>

                                {/* File Type Selector (for FileUpload) */}
                                {child.type === 'FileUpload' && (
                                  <div className="border-t pt-3">
                                    <Label className="mb-2 block text-sm font-semibold">
                                      İzin Verilen Dosya Tipleri
                                      <span className="text-xs text-slate-500 font-normal ml-2">(Boş bırakılırsa tüm tipler kabul edilir)</span>
                                    </Label>
                                    <div className="space-y-2">
                                      {AVAILABLE_CONTENT_TYPES.map((type) => {
                                        const allowedTypes = child.allowedAttachmentContentTypes || [];
                                        return (
                                          <div key={type.value} className="flex items-center gap-2">
                                            <Checkbox
                                              checked={allowedTypes.includes(type.value)}
                                              onCheckedChange={() => toggleChildQuestionContentType(option.order, childIdx, type.value)}
                                            />
                                            <Label className="cursor-pointer text-sm font-normal">{type.label}</Label>
                                          </div>
                                        );
                                      })}
                                    </div>

                                    {child.allowedAttachmentContentTypes && child.allowedAttachmentContentTypes.length > 0 && (
                                      <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded text-xs" style={{ color: '#0055a5' }}>
                                        <strong>Seçili tipler:</strong> {child.allowedAttachmentContentTypes.join(', ')}
                                      </div>
                                    )}
                                  </div>
                                )}

                                {/* Child Question Options (for SingleSelect/MultiSelect) */}
                                {(child.type === 'SingleSelect' || child.type === 'MultiSelect') && (
                                  <div className="space-y-2">
                                    <Label className="text-sm">Seçenekler</Label>
                                    {child.options.map((opt, optIdx) => (
                                      <div key={optIdx} className="p-2 border rounded bg-white space-y-2">
                                        <div className="flex gap-2">
                                          <Input
                                            value={opt.text}
                                            onChange={(e) => updateChildOption(option.order, childIdx, optIdx, e.target.value)}
                                            placeholder={`Seçenek ${optIdx + 1}`}
                                            className="flex-1"
                                          />
                                          <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removeChildOption(option.order, childIdx, optIdx)}
                                          >
                                            <Trash2 className="h-4 w-4" />
                                          </Button>
                                        </div>
                                        {/* Option attachment */}
                                        <div className="pl-2">
                                          <AttachmentUpload
                                            attachment={opt.attachment}
                                            onChange={(attachment) => {
                                              const childQuestions = question.childQuestions || [];
                                              const optionChildren = childQuestions.filter(cq => cq.parentOptionOrder === option.order);
                                              const childToUpdate = optionChildren[childIdx];
                                              const newOptions = [...childToUpdate.options];
                                              newOptions[optIdx] = { ...newOptions[optIdx], attachment };
                                              updateChildQuestion(option.order, childIdx, { options: newOptions });
                                            }}
                                            label="Ek Ekle"
                                          />
                                        </div>
                                      </div>
                                    ))}
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => addChildOption(option.order, childIdx)}
                                      className="w-full"
                                    >
                                      <Plus className="h-4 w-4 mr-2" />
                                      Seçenek Ekle
                                    </Button>
                                  </div>
                                )}
                              </div>

                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeChildQuestion(option.order, childIdx)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}

                  {/* Add Child Question Button */}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => addChildQuestion(option.order)}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Alt Soru Ekle
                  </Button>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      <div className="text-sm text-slate-600 bg-blue-50 border border-blue-200 rounded-lg p-3">
        <strong>Not:</strong> Koşullu sorular tam olarak 3 seçenek içerir. Katılımcı bir seçenek seçtiğinde, o seçeneğe bağlı alt sorular gösterilir.
      </div>
    </div>
  );
}
