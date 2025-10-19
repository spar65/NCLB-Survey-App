/**
 * Input Validation and Security Tests
 * @rule 380 "Comprehensive testing standards with visual organization"
 * @rule 009 "Security testing for input validation"
 */

import { 
  validateQuestionResponse, 
  validateSurveyResponses, 
  sanitizeHtml, 
  sanitizeTextInput 
} from '@/lib/validation';

describe('🛡️ Input Validation and Security Tests', () => {
  beforeEach(() => {
    console.log('🧪 Setting up validation test environment');
  });

  describe('sanitizeHtml', () => {
    test('✅ Should remove HTML tags', () => {
      console.log('🧹 Testing HTML tag removal');

      const maliciousInputs = [
        '<script>alert("xss")</script>',
        '<img src="x" onerror="alert(1)">',
        '<div onclick="alert(1)">Click me</div>',
        'Normal text with <b>bold</b> tags',
      ];

      maliciousInputs.forEach(input => {
        const sanitized = sanitizeHtml(input);
        expect(sanitized).not.toContain('<script>');
        expect(sanitized).not.toContain('<img');
        expect(sanitized).not.toContain('onclick');
        expect(sanitized).not.toContain('<b>');
      });

      console.log('✅ HTML sanitization working correctly');
    });

    test('❌ Should prevent XSS attacks', () => {
      console.log('🚫 Testing XSS prevention');

      const xssPayloads = [
        'javascript:alert(1)',
        '<script>document.cookie</script>',
        '<iframe src="javascript:alert(1)"></iframe>',
        'onload="alert(1)"',
      ];

      xssPayloads.forEach(payload => {
        const sanitized = sanitizeHtml(payload);
        expect(sanitized).not.toContain('javascript:');
        expect(sanitized).not.toContain('<script>');
        expect(sanitized).not.toContain('<iframe>');
        expect(sanitized).not.toContain('onload=');
      });

      console.log('✅ XSS prevention working correctly');
    });
  });

  describe('validateQuestionResponse', () => {
    test('✅ Should validate open-ended responses', () => {
      console.log('📝 Testing open-ended response validation');

      const question = {
        id: 'q1',
        type: 'open_ended',
        required: true,
        validation: { minLength: 10, maxLength: 100 }
      };

      // Valid response
      expect(validateQuestionResponse('This is a valid response', question)).toEqual({
        valid: true,
        error: null
      });

      // Too short
      expect(validateQuestionResponse('Short', question)).toEqual({
        valid: false,
        error: 'Response must be at least 10 characters'
      });

      // Too long
      const longText = 'a'.repeat(101);
      expect(validateQuestionResponse(longText, question)).toEqual({
        valid: false,
        error: 'Response must be no more than 100 characters'
      });

      console.log('✅ Open-ended validation working');
    });

    test('✅ Should validate multiple choice responses', () => {
      console.log('☑️ Testing multiple choice validation');

      const question = {
        id: 'q2',
        type: 'multiple_choice',
        required: true,
        options: ['Option A', 'Option B', 'Option C']
      };

      // Valid option
      expect(validateQuestionResponse('Option A', question)).toEqual({
        valid: true,
        error: null
      });

      // Invalid option
      expect(validateQuestionResponse('Option D', question)).toEqual({
        valid: false,
        error: 'Invalid option selected'
      });

      console.log('✅ Multiple choice validation working');
    });

    test('✅ Should validate Likert scale responses', () => {
      console.log('📊 Testing Likert scale validation');

      const question = {
        id: 'q3',
        type: 'likert',
        required: true,
        validation: { min: 1, max: 5 }
      };

      // Valid scale value
      expect(validateQuestionResponse(3, question)).toEqual({
        valid: true,
        error: null
      });

      // Out of range
      expect(validateQuestionResponse(6, question)).toEqual({
        valid: false,
        error: 'Value must be between 1 and 5'
      });

      // Non-numeric
      expect(validateQuestionResponse('three', question)).toEqual({
        valid: false,
        error: 'Value must be a number'
      });

      console.log('✅ Likert scale validation working');
    });
  });

  describe('validateSurveyResponses', () => {
    const sampleQuestions = [
      {
        id: 'q1',
        type: 'open_ended',
        required: true,
        validation: { minLength: 5 }
      },
      {
        id: 'q2',
        type: 'multiple_choice',
        required: false,
        options: ['Yes', 'No', 'Maybe']
      }
    ];

    test('✅ Should validate complete valid responses', () => {
      console.log('✅ Testing complete response validation');

      const responses = {
        q1: 'This is a valid response',
        q2: 'Yes'
      };

      const result = validateSurveyResponses(responses, sampleQuestions);
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);

      console.log('✅ Complete response validation working');
    });

    test('❌ Should identify missing required fields', () => {
      console.log('❌ Testing missing required field detection');

      const responses = {
        q2: 'Yes'
        // q1 missing
      };

      const result = validateSurveyResponses(responses, sampleQuestions);
      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual({
        questionId: 'q1',
        error: 'This field is required'
      });

      console.log('✅ Missing required fields correctly identified');
    });

    test('❌ Should handle multiple validation errors', () => {
      console.log('❌ Testing multiple validation errors');

      const responses = {
        q1: 'Hi', // Too short
        q2: 'Invalid' // Not in options
      };

      const result = validateSurveyResponses(responses, sampleQuestions);
      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(2);

      console.log('✅ Multiple validation errors correctly handled');
    });
  });

  describe('sanitizeTextInput', () => {
    test('✅ Should normalize whitespace', () => {
      console.log('🧹 Testing whitespace normalization');

      const inputs = [
        '  Multiple   spaces  ',
        '\n\nNewlines\n\n',
        '\t\tTabs\t\t',
        'Normal text',
      ];

      inputs.forEach(input => {
        const sanitized = sanitizeTextInput(input);
        expect(sanitized).not.toMatch(/\s{2,}/); // No multiple spaces
        expect(sanitized).not.toMatch(/^\s/); // No leading spaces
        expect(sanitized).not.toMatch(/\s$/); // No trailing spaces
      });

      console.log('✅ Whitespace normalization working');
    });

    test('✅ Should limit input length', () => {
      console.log('📏 Testing input length limiting');

      const longInput = 'a'.repeat(3000);
      const sanitized = sanitizeTextInput(longInput);
      
      expect(sanitized.length).toBeLessThanOrEqual(2000);

      console.log('✅ Input length limiting working');
    });
  });
});
