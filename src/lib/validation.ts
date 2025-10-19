/**
 * Input Validation and Sanitization
 * @rule 009 "Security considerations for input validation"
 * @rule 060 "API standards for data validation"
 * @rule 105 "TypeScript strict typing"
 */

import { z } from 'zod';
import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitizes HTML input to prevent XSS attacks
 */
export function sanitizeHtml(input: string): string {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [], // No HTML tags allowed
    ALLOWED_ATTR: [],
  });
}

/**
 * Sanitizes text input for survey responses
 */
export function sanitizeTextInput(input: string): string {
  return input
    .trim()
    .replace(/\s+/g, ' ') // Normalize whitespace
    .substring(0, 2000); // Limit length
}

/**
 * Validates survey response against question requirements
 */
export function validateQuestionResponse(
  value: unknown,
  question: {
    id: string;
    type: string;
    required: boolean;
    options?: string[];
    validation?: {
      minLength?: number;
      maxLength?: number;
      min?: number;
      max?: number;
    };
  }
): { valid: boolean; error: string | null } {
  // Check required fields
  if (question.required && (value === null || value === undefined || value === '')) {
    return { valid: false, error: 'This field is required' };
  }

  // Skip validation for optional empty fields
  if (!question.required && (value === null || value === undefined || value === '')) {
    return { valid: true, error: null };
  }

  // Type-specific validation
  switch (question.type) {
    case 'open_ended':
      return validateOpenEndedResponse(value as string, question.validation);
    
    case 'multiple_choice':
      return validateMultipleChoiceResponse(value as string, question.options || []);
    
    case 'likert':
      return validateLikertResponse(value as number, question.validation);
    
    default:
      return { valid: false, error: 'Unknown question type' };
  }
}

function validateOpenEndedResponse(
  value: string,
  validation?: { minLength?: number; maxLength?: number }
): { valid: boolean; error: string | null } {
  if (typeof value !== 'string') {
    return { valid: false, error: 'Response must be text' };
  }

  const sanitized = sanitizeTextInput(value);
  
  if (validation?.minLength && sanitized.length < validation.minLength) {
    return { 
      valid: false, 
      error: `Response must be at least ${validation.minLength} characters` 
    };
  }

  if (validation?.maxLength && sanitized.length > validation.maxLength) {
    return { 
      valid: false, 
      error: `Response must be no more than ${validation.maxLength} characters` 
    };
  }

  return { valid: true, error: null };
}

function validateMultipleChoiceResponse(
  value: string,
  options: string[]
): { valid: boolean; error: string | null } {
  if (typeof value !== 'string') {
    return { valid: false, error: 'Please select an option' };
  }

  if (!options.includes(value)) {
    return { valid: false, error: 'Invalid option selected' };
  }

  return { valid: true, error: null };
}

function validateLikertResponse(
  value: number,
  validation?: { min?: number; max?: number }
): { valid: boolean; error: string | null } {
  if (typeof value !== 'number') {
    return { valid: false, error: 'Value must be a number' };
  }

  const min = validation?.min || 1;
  const max = validation?.max || 5;

  if (value < min || value > max) {
    return { 
      valid: false, 
      error: `Value must be between ${min} and ${max}` 
    };
  }

  return { valid: true, error: null };
}

/**
 * Validates complete survey responses
 */
export function validateSurveyResponses(
  responses: Record<string, unknown>,
  questions: Array<{
    id: string;
    type: string;
    required: boolean;
    options?: string[];
    validation?: any;
  }>
): { valid: boolean; errors: Array<{ questionId: string; error: string }> } {
  const errors: Array<{ questionId: string; error: string }> = [];

  for (const question of questions) {
    const value = responses[question.id];
    const validation = validateQuestionResponse(value, question);
    
    if (!validation.valid && validation.error) {
      errors.push({
        questionId: question.id,
        error: validation.error,
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Email validation schema
 */
export const EmailSchema = z.string().email('Please enter a valid email address');

/**
 * OTP validation schema
 */
export const OTPSchema = z.string().regex(/^\d{6}$/, 'Access code must be exactly 6 digits');

/**
 * Survey response validation schema
 */
export const SurveyResponseSchema = z.object({
  versionId: z.number().int().positive('Survey version ID is required'),
  responses: z.record(z.unknown()).refine(
    (data) => Object.keys(data).length > 0,
    'At least one response is required'
  ),
  completionTime: z.number().int().positive().optional(),
  isPartial: z.boolean().default(false),
});
