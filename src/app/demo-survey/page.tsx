/**
 * Demo Survey Page - No Authentication Required
 * @rule 042 "UI component architecture for demo purposes"
 */

'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

export default function DemoSurveyPage() {
  const [selectedGroup, setSelectedGroup] = useState<string>('Students');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState<Record<string, string>>({});

  // Complete question sets from database
  const surveyData = {
    Students: {
      group: 'Students',
      version: 'v1.0-Students',
      questions: [
        {
          id: 'q1_ai_use',
          text: 'How often do you use AI tools like ChatGPT for your schoolwork, and for what purposes (e.g., writing essays, solving math problems)?',
          type: 'open_ended',
          placeholder: 'Describe your AI tool usage patterns and purposes...',
          validation: { minLength: 30, maxLength: 800 }
        },
        {
          id: 'q2_cheating_perception',
          text: 'Do you think using AI for schoolwork is helpful or constitutes cheating?',
          type: 'open_ended',
          placeholder: 'Share your perspective on AI and academic integrity...',
          validation: { minLength: 20, maxLength: 800 }
        },
        {
          id: 'q3_banning_feelings',
          text: 'How do you feel about schools banning AI tools, and what do you think is the best approach for schools regarding AI use?',
          type: 'open_ended',
          placeholder: 'Share your thoughts on school AI policies...',
          validation: { minLength: 30, maxLength: 800 }
        },
        {
          id: 'q4_guidance_needs',
          text: 'What kind of education or guidance do you think students need to use AI responsibly and effectively?',
          type: 'open_ended',
          placeholder: 'Describe what AI education students need...',
          validation: { minLength: 30, maxLength: 800 }
        },
        {
          id: 'q5_learning_improvement',
          text: 'In what ways do you think AI can improve your learning experience, and are there any concerns you have about its use in education?',
          type: 'open_ended',
          placeholder: 'Describe AI benefits and concerns for learning...',
          validation: { minLength: 30, maxLength: 800 }
        }
      ]
    },
    Teachers: {
      group: 'Teachers',
      version: 'v1.0-Teachers',
      questions: [
        {
          id: 'q1_tech_use',
          text: 'How do you currently use technology in your classrooms, and what role do you see for AI in enhancing your teaching practices?',
          type: 'open_ended',
          placeholder: 'Describe your current technology use and AI vision...',
          validation: { minLength: 50, maxLength: 1000 }
        },
        {
          id: 'q2_benefits_challenges',
          text: 'What benefits do you anticipate from using AI in education, and what challenges or concerns do you have? (e.g., Cheating)',
          type: 'open_ended',
          placeholder: 'Share your thoughts on benefits and challenges...',
          validation: { minLength: 50, maxLength: 1000 }
        },
        {
          id: 'q3_training_needs',
          text: 'What kind of training or support would you need to effectively integrate AI into your teaching?',
          type: 'open_ended',
          placeholder: 'Describe training and support needs...',
          validation: { minLength: 30, maxLength: 1000 }
        },
        {
          id: 'q4_diverse_needs',
          text: 'How do you think AI can help address the diverse learning needs of your students?',
          type: 'open_ended',
          placeholder: 'Describe how AI can support diverse learners...',
          validation: { minLength: 30, maxLength: 1000 }
        },
        {
          id: 'q5_ethics',
          text: 'What are your thoughts on the ethical use of AI in education, particularly regarding issues like bias and data privacy?',
          type: 'open_ended',
          placeholder: 'Share your thoughts on AI ethics in education...',
          validation: { minLength: 30, maxLength: 1000 }
        }
      ]
    },
    Administrators: {
      group: 'Administrators',
      version: 'v1.0-Administrators',
      questions: [
        {
          id: 'q1_district_stance',
          text: 'What is the district\'s current stance on AI in education, and are there any policies or guidelines in place?',
          type: 'open_ended',
          placeholder: 'Describe current district policies and stance...',
          validation: { minLength: 50, maxLength: 1000 }
        },
        {
          id: 'q2_integration_plan',
          text: 'How does the district plan to integrate AI into the curriculum, and what are the potential benefits and challenges?',
          type: 'open_ended',
          placeholder: 'Describe integration plans and considerations...',
          validation: { minLength: 50, maxLength: 1000 }
        },
        {
          id: 'q3_equitable_access',
          text: 'How will the district ensure equal access to AI tools for all students, including those from underserved communities?',
          type: 'open_ended',
          placeholder: 'Describe equity and access strategies...',
          validation: { minLength: 40, maxLength: 1000 }
        },
        {
          id: 'q4_outcomes_role',
          text: 'What role does the district see for AI in improving student outcomes, and how will this be measured?',
          type: 'open_ended',
          placeholder: 'Describe expected outcomes and measurement approaches...',
          validation: { minLength: 40, maxLength: 1000 }
        },
        {
          id: 'q5_privacy_steps',
          text: 'What steps will the district take to address data privacy and security concerns with AI implementation?',
          type: 'open_ended',
          placeholder: 'Describe privacy and security measures...',
          validation: { minLength: 40, maxLength: 1000 }
        }
      ]
    },
    IT_Admins: {
      group: 'IT_Admins',
      version: 'v1.0-IT_Admins',
      questions: [
        {
          id: 'q1_infrastructure_state',
          text: 'What is the current state of your school district\'s technological infrastructure, and is it ready to support AI tools?',
          type: 'open_ended',
          placeholder: 'Describe current infrastructure and AI readiness...',
          validation: { minLength: 50, maxLength: 1000 }
        },
        {
          id: 'q2_privacy_risks',
          text: 'What are the potential data privacy and security risks associated with implementing AI in education, and how can we mitigate them?',
          type: 'open_ended',
          placeholder: 'Describe privacy risks and mitigation strategies...',
          validation: { minLength: 50, maxLength: 1000 }
        },
        {
          id: 'q3_staff_skills',
          text: 'Do we have the necessary IT staff and skills to manage and maintain AI tools?',
          type: 'open_ended',
          placeholder: 'Assess current IT capabilities and needs...',
          validation: { minLength: 30, maxLength: 1000 }
        },
        {
          id: 'q4_accessibility',
          text: 'How will we ensure that AI tools are accessible and usable for all students, including those with disabilities?',
          type: 'open_ended',
          placeholder: 'Describe accessibility considerations and approaches...',
          validation: { minLength: 40, maxLength: 1000 }
        },
        {
          id: 'q5_costs_budget',
          text: 'What are the costs associated with implementing and maintaining AI tools, and how will we budget for them?',
          type: 'open_ended',
          placeholder: 'Describe cost considerations and budget planning...',
          validation: { minLength: 30, maxLength: 1000 }
        },
        {
          id: 'q6_integration_opinion',
          text: 'In your opinion, how can we integrate AI tools with our existing educational technology systems?',
          type: 'open_ended',
          placeholder: 'Share your thoughts on system integration approaches...',
          validation: { minLength: 40, maxLength: 1000 }
        }
      ]
    }
  };

  const currentSurvey = surveyData[selectedGroup as keyof typeof surveyData];
  const question = currentSurvey.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / currentSurvey.questions.length) * 100;

  const handleNext = () => {
    if (currentQuestion < currentSurvey.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleGroupChange = (group: string) => {
    setSelectedGroup(group);
    setCurrentQuestion(0);
    setResponses({});
  };

  const handleSubmit = () => {
    alert(`Demo Survey Completed!\n\nGroup: ${selectedGroup}\nQuestions Answered: ${Object.keys(responses).length}/${currentSurvey.questions.length}\n\nThis is a demonstration of the complete survey system.`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Group Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-primary">Demo Survey - All Groups</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 mb-4">
              {Object.keys(surveyData).map((group) => (
                <Button
                  key={group}
                  variant={selectedGroup === group ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleGroupChange(group)}
                >
                  {group} ({surveyData[group as keyof typeof surveyData].questions.length} questions)
                </Button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">Current: {selectedGroup}</Badge>
              <Badge variant="outline">{currentSurvey.version}</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Progress */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Question {currentQuestion + 1} of {currentSurvey.questions.length}</span>
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

              <Textarea
                placeholder={question.placeholder}
                value={responses[question.id] || ''}
                onChange={(e) => setResponses(prev => ({ ...prev, [question.id]: e.target.value }))}
                className="min-h-[150px]"
                maxLength={question.validation?.maxLength || 2000}
              />

              {/* Character count */}
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>
                  {question.validation?.minLength && 
                    `Minimum ${question.validation.minLength} characters required`
                  }
                </span>
                <span>
                  {(responses[question.id] || '').length} / {question.validation?.maxLength || 2000} characters
                </span>
              </div>
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

              {currentQuestion === currentSurvey.questions.length - 1 ? (
                <Button onClick={handleSubmit}>
                  Complete Demo
                </Button>
              ) : (
                <Button onClick={handleNext}>
                  Next
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Info */}
        <Card>
          <CardContent className="pt-6 text-center text-sm text-muted-foreground">
            <p>📋 Demo Survey System</p>
            <p>All {Object.values(surveyData).reduce((sum, survey) => sum + survey.questions.length, 0)} questions loaded from database schema</p>
            <p>Switch between groups to see different question sets</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
