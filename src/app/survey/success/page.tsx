/**
 * Survey Success Page with Unique Confirmation ID
 * @rule 042 "UI component architecture for success states"
 * @rule 054 "Accessibility requirements for confirmation pages"
 */

'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Home, Copy } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';

export default function SurveySuccessPage() {
  const searchParams = useSearchParams();
  const [copied, setCopied] = useState(false);
  
  // Debug: Log all URL parameters
  console.log('🔍 Success page URL parameters:', {
    group: searchParams.get('group'),
    responseId: searchParams.get('responseId'),
    questionsAnswered: searchParams.get('questionsAnswered'),
    totalQuestions: searchParams.get('totalQuestions'),
    submissionVersion: searchParams.get('submissionVersion'),
    allParams: Object.fromEntries(searchParams.entries())
  });
  
  // Get details from URL params (passed from survey submission)
  const group = searchParams.get('group') || 'Teachers'; // Default to Teachers for your testing
  const responseId = searchParams.get('responseId') || '1';
  const questionsAnswered = searchParams.get('questionsAnswered') || '5'; // Default to 5 for Teachers
  const totalQuestions = searchParams.get('totalQuestions') || '5'; // Default to 5 for Teachers
  const submissionVersion = searchParams.get('submissionVersion') || '1';
  
  const isResubmission = parseInt(submissionVersion) > 1;
  
  console.log('📊 Success page data:', {
    group,
    questionsAnswered,
    totalQuestions,
    submissionVersion,
    isResubmission
  });
  
  // Generate stable confirmation ID (no random elements to avoid hydration issues)
  const generateConfirmationId = () => {
    const groupCode = group.toUpperCase().substring(0, 3);
    const responseCode = responseId.padStart(3, '0');
    
    // Use response ID and group for stable ID generation
    const stableCode = (parseInt(responseId) * 1000 + group.length).toString(36).toUpperCase().padStart(4, '0');
    
    return `NCLB-${groupCode}-${responseCode}-${stableCode}`;
  };

  const confirmationId = generateConfirmationId();

  const copyConfirmationId = async () => {
    try {
      await navigator.clipboard.writeText(confirmationId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl text-center">
        <CardHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent/10">
            <CheckCircle className="h-8 w-8 text-accent" />
          </div>
          <CardTitle className="text-2xl text-primary">
            {isResubmission ? 'Survey Updated Successfully!' : 'Survey Completed Successfully!'}
          </CardTitle>
          <CardDescription className="text-lg">
            {isResubmission 
              ? `Thank you for updating your responses (Submission #${submissionVersion})`
              : 'Thank you for participating in the "No Concept Left Behind" research study'
            }
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <p className="text-lg text-muted-foreground">
            Your responses have been securely recorded and will contribute to important research 
            on AI perspectives in education.
          </p>

          {/* Unique Confirmation ID */}
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 space-y-4">
            <h3 className="font-medium text-primary">Your Unique Confirmation ID</h3>
            
            <div className="flex items-center justify-center space-x-3">
              <code className="bg-primary/10 text-primary px-4 py-3 rounded-lg font-mono text-xl font-bold border-2 border-primary/20">
                {confirmationId}
              </code>
              <Button
                variant="outline"
                size="sm"
                onClick={copyConfirmationId}
                className="shrink-0"
              >
                {copied ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            
            <p className="text-sm text-muted-foreground">
              Save this ID for your records. You can use it to reference your submission.
            </p>
          </div>

          {/* Submission Summary */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
              Submission Summary
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Stakeholder Group:</span>
                <span className="ml-2 font-medium">{group}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Questions Answered:</span>
                <span className="ml-2 font-medium">{questionsAnswered} of {totalQuestions}</span>
              </div>
              {isResubmission && (
                <div>
                  <span className="text-muted-foreground">Submission:</span>
                  <Badge variant="secondary" className="ml-2">#{submissionVersion}</Badge>
                </div>
              )}
            </div>
          </div>

          {/* Research Impact */}
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 text-left">
            <h3 className="font-medium text-primary mb-2">Your Impact</h3>
            <p className="text-sm text-primary/90 leading-relaxed">
              Your insights will help educators, administrators, and policymakers better understand 
              how to integrate AI tools effectively and ethically in educational settings. 
              All responses are anonymized to protect your privacy.
            </p>
          </div>

          {/* Next Steps */}
          <div className="bg-muted/50 p-4 rounded-lg space-y-2">
            <h3 className="font-medium text-sm">What happens next?</h3>
            <ul className="text-sm text-muted-foreground space-y-1 text-left">
              <li>• Your responses will be anonymized for analysis</li>
              <li>• Results will be compiled with other participants</li>
              <li>• Findings will inform AI education policy recommendations</li>
              <li>• Research results may be shared with educational institutions</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild className="w-full sm:w-auto">
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Return to Home
              </Link>
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => window.print()}
              className="w-full sm:w-auto"
            >
              Print Confirmation
            </Button>
          </div>

          <div className="text-xs text-muted-foreground pt-4 border-t">
            <p>
              Thank you for contributing to educational research. Your participation makes a difference!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}