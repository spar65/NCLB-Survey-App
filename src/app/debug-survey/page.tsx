/**
 * Debug Survey Page
 * @rule 042 "UI component architecture for debugging"
 */

'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

export default function DebugSurveyPage() {
  const [response, setResponse] = useState('');

  // Simple student survey questions
  const studentQuestions = [
    {
      id: 'q1_ai_use',
      text: 'How often do you use AI tools like ChatGPT for your schoolwork, and for what purposes?',
      placeholder: 'Describe your AI tool usage...'
    },
    {
      id: 'q2_cheating_perception', 
      text: 'Do you think using AI for schoolwork is helpful or constitutes cheating?',
      placeholder: 'Share your thoughts...'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-primary">
              Debug: Student Survey Questions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-sm text-green-800">
                ✅ Survey loaded successfully for Students group
              </p>
            </div>

            {studentQuestions.map((question, index) => (
              <div key={question.id} className="space-y-3">
                <Label className="text-base font-medium">
                  Question {index + 1}: {question.text}
                </Label>
                <Textarea
                  placeholder={question.placeholder}
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  className="min-h-[120px]"
                />
              </div>
            ))}

            <div className="flex justify-between">
              <Button variant="outline">Back</Button>
              <Button>Next Question</Button>
            </div>

            <div className="text-center text-sm text-muted-foreground">
              <p>Survey Version: v1.0-Students</p>
              <p>Stakeholder Group: Students</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
