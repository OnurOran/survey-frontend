import { getQuestionType, QuestionFormData } from '../../question-types';

interface QuestionEditorProps {
  question: QuestionFormData;
  questionIndex: number;
  totalQuestions: number;
  onChange: (updated: QuestionFormData) => void;
  onRemove: () => void;
  onReorder: (newOrder: number) => void;
}

/**
 * Question Editor Wrapper
 * Dynamically loads the correct editor component based on question type
 */
export function QuestionEditor(props: QuestionEditorProps) {
  const questionType = getQuestionType(props.question.type);

  if (!questionType) {
    return (
      <div className="p-4 border border-red-200 bg-red-50 rounded text-red-600">
        Unknown question type: {props.question.type}
      </div>
    );
  }

  const { EditorComponent } = questionType;

  return <EditorComponent {...props} />;
}
