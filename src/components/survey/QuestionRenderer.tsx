/**
 * Dynamic Question Renderer Component
 * @rule 042 "UI component architecture with proper composition"
 * @rule 054 "Accessibility requirements for form elements"
 * @rule 030 "Visual design system for survey components"
 */

'use client';

import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';

interface Question {
  id: string;
  text: string;
  type: 'open_ended' | 'multiple_choice' | 'likert';
  required: boolean;
  placeholder?: string;
  options?: string[];
  validation?: {
    minLength?: number;
    maxLength?: number;
  };
}

interface QuestionRendererProps {
  question: Question;
  value: unknown;
  onChange: (questionId: string, value: unknown) => void;
  error?: string | null;
}

export function QuestionRenderer({ 
  question, 
  value, 
  onChange, 
  error 
}: QuestionRendererProps) {
  const handleChange = (newValue: unknown) => {
    onChange(question.id, newValue);
  };

  return (
    <div className="space-y-4">
      {/* Question Text */}
      <div className="space-y-2">
        <Label className="text-base font-medium leading-relaxed">
          {question.text}
          {question.required && (
            <span className="text-destructive ml-1" aria-label="required">*</span>
          )}
        </Label>
      </div>

      {/* Question Input Based on Type */}
      {question.type === 'open_ended' && (
        <OpenEndedQuestion
          question={question}
          value={value as string}
          onChange={handleChange}
          error={error}
        />
      )}

      {question.type === 'multiple_choice' && (
        <MultipleChoiceQuestion
          question={question}
          value={value as string}
          onChange={handleChange}
          error={error}
        />
      )}

      {question.type === 'likert' && (
        <LikertScaleQuestion
          question={question}
          value={value as number}
          onChange={handleChange}
          error={error}
        />
      )}

      {/* Error Message */}
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

function OpenEndedQuestion({ 
  question, 
  value = '', 
  onChange, 
  error 
}: {
  question: Question;
  value: string;
  onChange: (value: string) => void;
  error?: string | null;
}) {
  const maxLength = question.validation?.maxLength || 2000;
  const currentLength = value.length;

  return (
    <div className="space-y-2">
      <Textarea
        placeholder={question.placeholder || 'Share your thoughts...'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`min-h-[150px] resize-none ${error ? 'border-destructive' : ''}`}
        maxLength={maxLength}
        aria-describedby={`${question.id}-help`}
      />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span id={`${question.id}-help`}>
          {question.validation?.minLength && 
            `Minimum ${question.validation.minLength} characters required`
          }
        </span>
        <span>
          {currentLength} / {maxLength} characters
        </span>
      </div>
    </div>
  );
}

function MultipleChoiceQuestion({ 
  question, 
  value = '', 
  onChange, 
  error 
}: {
  question: Question;
  value: string;
  onChange: (value: string) => void;
  error?: string | null;
}) {
  if (!question.options) {
    return <div className="text-destructive">No options provided for multiple choice question</div>;
  }

  return (
    <RadioGroup 
      value={value} 
      onValueChange={onChange}
      className={error ? 'border-destructive border rounded-md p-2' : ''}
    >
      <div className="space-y-3">
        {question.options.map((option, index) => (
          <div key={option} className="flex items-center space-x-2">
            <RadioGroupItem 
              value={option} 
              id={`${question.id}-${index}`}
            />
            <Label 
              htmlFor={`${question.id}-${index}`} 
              className="cursor-pointer flex-1"
            >
              {option}
            </Label>
          </div>
        ))}
      </div>
    </RadioGroup>
  );
}

function LikertScaleQuestion({ 
  question, 
  value = 3, 
  onChange, 
  error 
}: {
  question: Question;
  value: number;
  onChange: (value: number) => void;
  error?: string | null;
}) {
  const likertLabels = [
    '', // Index 0 (not used)
    'Strongly Disagree',
    'Disagree', 
    'Neutral',
    'Agree',
    'Strongly Agree'
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Slider
          value={[value]}
          onValueChange={([newValue]) => onChange(newValue)}
          min={1}
          max={5}
          step={1}
          className={`w-full ${error ? 'border-destructive' : ''}`}
        />
        
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Strongly Disagree</span>
          <span>Neutral</span>
          <span>Strongly Agree</span>
        </div>
        
        <div className="text-center">
          <div className="inline-flex items-center space-x-2 bg-muted px-3 py-1 rounded-full">
            <span className="text-sm font-medium">
              Selected: {likertLabels[value]}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
