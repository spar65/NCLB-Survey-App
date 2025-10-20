/**
 * Test Survey Page for Development
 * @rule 042 "UI component architecture for testing"
 */

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function TestSurveyPage() {
  // Create safe base64 tokens
  const createToken = (email: string) => {
    try {
      return btoa(email);
    } catch (e) {
      console.error('Token creation error:', e);
      return encodeURIComponent(email);
    }
  };

  const testUsers = [
    { email: 'teacher@example.com', group: 'Teachers', token: createToken('teacher@example.com') },
    { email: 'student@example.com', group: 'Students', token: createToken('student@example.com') },
    { email: 'admin_survey@example.com', group: 'Administrators', token: createToken('admin_survey@example.com') },
    { email: 'it@example.com', group: 'IT_Admins', token: createToken('it@example.com') },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-primary">Survey Testing Page</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-6">
              Direct links to test surveys for each stakeholder group:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {testUsers.map((user) => (
                <Card key={user.email} className="border-2">
                  <CardHeader>
                    <CardTitle className="text-lg">{user.group}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Email: <code className="bg-muted px-1 rounded">{user.email}</code>
                    </p>
                    <Link href={`/survey/${user.token}`}>
                      <Button className="w-full">
                        Test {user.group} Survey
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-medium text-blue-800 mb-2">Development Notes:</h3>
              <ul className="text-sm text-blue-600 space-y-1">
                <li>• Each group sees different questions tailored to their role</li>
                <li>• Students see questions about AI tool usage and perceptions</li>
                <li>• Teachers see questions about classroom technology integration</li>
                <li>• Administrators see questions about district policies</li>
                <li>• IT Admins see questions about infrastructure readiness</li>
              </ul>
            </div>

            <div className="mt-4 text-center">
              <Link href="/">
                <Button variant="outline">
                  Back to Landing Page
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
