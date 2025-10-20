/**
 * Database-Driven Survey Page
 * @rule 060 "API standards for database-driven content"
 * @rule 042 "UI component architecture with data loading"
 */

'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react';

interface Question {
  id: string;
  text: string;
  type: string;
  required: boolean;
  placeholder?: string;
  options?: string[];
  validation?: {
    minLength?: number;
    maxLength?: number;
  };
  branching?: any;
}

interface SurveyVersion {
  id: number;
  version: string;
  group: string;
  questions: Question[];
  description: string;
}

export default function SurveyPage({ params }: { params: Promise<{ token: string }> }) {
  const resolvedParams = use(params);
  const [surveyVersion, setSurveyVersion] = useState<SurveyVersion | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const router = useRouter();

  useEffect(() => {
    loadSurveyFromDatabase();
  }, [resolvedParams.token]);

  const loadSurveyFromDatabase = async () => {
    try {
      console.log('📋 Loading survey from database');

      // Safely decode email from token
      let decodedEmail: string;
      try {
        // URL decode first in case the token was URL encoded
        const urlDecoded = decodeURIComponent(resolvedParams.token);
        // Then base64 decode
        decodedEmail = atob(urlDecoded);
      } catch (e) {
        console.error('❌ Token decode error:', e);
        throw new Error('Invalid access token format');
      }
      
      setEmail(decodedEmail);
      console.log('📧 Loading survey for:', decodedEmail.replace(/(.{2}).*(@.*)/, '$1***$2'));

      // Fetch survey version from database
      const response = await fetch('/api/survey/version', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: decodedEmail }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to load survey');
      }

      const surveyData = await response.json();
      setSurveyVersion(surveyData);
      
      console.log('✅ Survey loaded from database:', surveyData.group, 'with', surveyData.questions.length, 'questions');

    } catch (error) {
      console.error('❌ Failed to load survey:', error);
      setError(error instanceof Error ? error.message : 'Failed to load survey');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl text-center p-8">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading your survey from database...</p>
        </Card>
      </div>
    );
  }

  if (error || !surveyVersion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center p-8">
          <Alert variant="destructive">
            <AlertDescription>
              {error || 'Survey not found. Please check your access.'}
            </AlertDescription>
          </Alert>
          <Button className="mt-4" onClick={() => router.push('/')}>
            Return to Home
          </Button>
        </Card>
      </div>
    );
  }

  const question = surveyVersion.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / surveyVersion.questions.length) * 100;

  const handleNext = () => {
    if (surveyVersion && currentQuestion < surveyVersion.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      console.log('➡️ Moving to question', currentQuestion + 2);
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
      console.log('⬅️ Moving to question', currentQuestion);
    }
  };

  const handleSubmit = async () => {
    try {
      console.log('📤 Submitting survey responses:', responses);
      
      if (!surveyVersion || !email) {
        throw new Error('Missing survey data');
      }

      // Calculate completion time (mock for now)
      const completionTime = Math.floor(Math.random() * 300) + 120; // 2-7 minutes

      // Detect device type
      const userAgent = navigator.userAgent;
      let deviceType = 'desktop';
      if (/Mobile|Android|iPhone|iPad/.test(userAgent)) {
        deviceType = 'mobile';
      } else if (/Tablet|iPad/.test(userAgent)) {
        deviceType = 'tablet';
      }

      const submissionData = {
        email: email,
        surveyVersionId: surveyVersion.id,
        responses: responses,
        completionTime: completionTime,
        partial: false,
        userAgent: userAgent,
        deviceType: deviceType,
      };

      console.log('📤 Submitting to database:', {
        email: email.replace(/(.{2}).*(@.*)/, '$1***$2'),
        questionsAnswered: Object.keys(responses).length,
        totalQuestions: surveyVersion.questions.length,
      });

      const response = await fetch('/api/survey/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Submission failed');
      }

      const result = await response.json();
      console.log('✅ Survey submitted successfully:', result);

      // Show success message with details
      alert(`🎉 Survey Submitted Successfully!\n\nGroup: ${surveyVersion.group}\nQuestions Answered: ${result.questionsAnswered}/${result.totalQuestions}\nResponse ID: ${result.responseId}\n\nThank you for participating in the "No Concept Left Behind" research!`);
      
      router.push('/survey/success');
      
    } catch (error) {
      console.error('❌ Submission failed:', error);
      setError(error instanceof Error ? error.message : 'Failed to submit survey');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Progress */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Question {currentQuestion + 1} of {surveyVersion.questions.length}</span>
                <span>{Math.round(progress)}% complete</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Question */}
        <Card>
          <CardHeader>
            <CardTitle>Question {currentQuestion + 1}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <Label className="text-base font-medium leading-relaxed">
                {question.text}
              </Label>

              {question.type === 'open_ended' && (
                <Textarea
                  placeholder={question.placeholder}
                  value={responses[question.id] || ''}
                  onChange={(e) => setResponses(prev => ({ ...prev, [question.id]: e.target.value }))}
                  className="min-h-[150px]"
                />
              )}

              {question.type === 'multiple_choice' && question.options && (
                <RadioGroup 
                  value={responses[question.id] || ''} 
                  onValueChange={(value) => setResponses(prev => ({ ...prev, [question.id]: value }))}
                >
                  {question.options.map((option, index) => (
                    <div key={option} className="flex items-center space-x-2">
                      <RadioGroupItem value={option} id={`${question.id}-${index}`} />
                      <Label htmlFor={`${question.id}-${index}`} className="cursor-pointer">
                        {option}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              )}

              {/* Character count for open-ended questions */}
              {question.type === 'open_ended' && question.validation && (
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>
                    {question.validation.minLength && 
                      `Minimum ${question.validation.minLength} characters required`
                    }
                  </span>
                  <span>
                    {(responses[question.id] || '').length} / {question.validation.maxLength || 2000} characters
                  </span>
                </div>
              )}
            </div>

            {/* Navigation */}
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentQuestion === 0}
              >
                Back
              </Button>

              {currentQuestion === surveyVersion.questions.length - 1 ? (
                <Button 
                  onClick={handleSubmit}
                  disabled={question.required && !responses[question.id]}
                >
                  Submit Survey
                </Button>
              ) : (
                <Button 
                  onClick={handleNext}
                  disabled={question.required && !responses[question.id]}
                >
                  Next
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Survey Info */}
        <Card>
          <CardContent className="pt-6 text-center text-sm text-muted-foreground">
            <p>Survey: {surveyVersion.version}</p>
            <p>Group: {surveyVersion.group}</p>
            <p>Questions: {surveyVersion.questions.length}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}