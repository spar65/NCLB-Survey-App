/**
 * Survey Blocked Page
 * @rule 042 "UI component architecture for status pages"
 * @rule 054 "Accessibility requirements for informational content"
 */

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Ban, Home, Mail } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function SurveyBlockedPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const group = searchParams.get('group') || 'Participant';
  const blockedAt = searchParams.get('blockedAt');

  const maskEmail = (email: string) => {
    if (!email) return 'Participant';
    const [local, domain] = email.split('@');
    if (!local || !domain) return 'Participant';
    
    const maskedLocal = local.length > 2 ? 
      local.substring(0, 2) + '*'.repeat(Math.min(local.length - 2, 3)) : 
      local;
    const maskedDomain = domain.length > 4 ? 
      domain.substring(0, 1) + '*'.repeat(Math.min(domain.length - 4, 3)) + domain.slice(-3) : 
      domain;
    
    return `${maskedLocal}@${maskedDomain}`;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Recently';
    try {
      return new Date(parseInt(dateString)).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return 'Recently';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-destructive/5 to-destructive/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <Ban className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle className="text-2xl text-destructive">
            Survey Access Restricted
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6 text-center">
          <Alert variant="destructive">
            <Ban className="h-4 w-4" />
            <AlertDescription className="text-left">
              <strong>Access to this survey has been restricted for your account.</strong>
              <br />
              This may be due to administrative requirements or survey completion policies.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <p className="text-lg text-muted-foreground">
              We apologize, but you are currently unable to access the 
              <strong> "No Concept Left Behind"</strong> research survey.
            </p>
          </div>

          {/* Participant Information */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
              Account Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center justify-center space-x-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>Account:</span>
                <code className="bg-muted px-2 py-1 rounded text-xs">
                  {maskEmail(email)}
                </code>
              </div>
              
              <div className="flex items-center justify-center space-x-2">
                <Ban className="h-4 w-4 text-destructive" />
                <span>Status:</span>
                <span className="font-medium text-destructive">Access Restricted</span>
              </div>
            </div>

            {blockedAt && (
              <div className="pt-2 border-t text-xs text-muted-foreground">
                <p>Access restricted on: {formatDate(blockedAt)}</p>
              </div>
            )}
          </div>

          {/* Next Steps */}
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 text-left">
            <h3 className="font-medium text-primary mb-2">What You Can Do</h3>
            <ul className="text-sm text-primary/90 space-y-2">
              <li>• <strong>Contact the research team</strong> if you believe this is an error</li>
              <li>• <strong>Check with your administrator</strong> about survey participation requirements</li>
              <li>• <strong>Wait for further instructions</strong> from the research coordinators</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/">
              <Button variant="outline" className="w-full sm:w-auto">
                <Home className="mr-2 h-4 w-4" />
                Return to Home
              </Button>
            </Link>
          </div>

          {/* Contact Information */}
          <div className="text-xs text-muted-foreground pt-4 border-t">
            <p>
              If you have questions about your survey access status, 
              please contact the research team for assistance.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

