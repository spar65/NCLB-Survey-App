/**
 * Survey Already Completed Page
 * @rule 042 "UI component architecture for status pages"
 * @rule 054 "Accessibility requirements for informational content"
 */

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Calendar, Users, ArrowLeft, Mail } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function AlreadyCompletedPage() {
  const searchParams = useSearchParams();
  const group = searchParams.get('group') || 'Participant';
  const submittedAt = searchParams.get('submittedAt');
  const responseId = searchParams.get('responseId');
  const email = searchParams.get('email') || '';
  
  // Create privacy-safe email display
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
  
  // Generate a unique confirmation ID based on response data
  const generateUniqueId = () => {
    if (responseId && submittedAt) {
      // Create a unique ID from response ID and timestamp
      const timestamp = parseInt(submittedAt) || Date.now();
      const uniqueId = `NCLB-${group.toUpperCase().substring(0,3)}-${responseId.padStart(3, '0')}-${timestamp.toString().slice(-6)}`;
      return uniqueId;
    }
    // Fallback unique ID
    return `NCLB-${group.toUpperCase().substring(0,3)}-${Date.now().toString().slice(-8)}`;
  };

  const uniqueConfirmationId = generateUniqueId();

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Recently';
    try {
      return new Date(parseInt(dateString)).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Recently';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent/10">
            <CheckCircle className="h-8 w-8 text-accent" />
          </div>
          <CardTitle className="text-2xl text-primary">
            Survey Already Completed
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6 text-center">
          <div className="space-y-4">
            <p className="text-lg text-muted-foreground">
              Thank you for your participation in the <strong>"No Concept Left Behind"</strong> research study!
            </p>
            
            <p className="text-muted-foreground">
              You have already submitted your survey responses. We appreciate your valuable insights 
              on AI in education.
            </p>
          </div>

          {/* Submission Details */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
              Submission Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center justify-center space-x-2">
                <Users className="h-4 w-4 text-primary" />
                <span>Group:</span>
                <Badge variant="secondary">{group}</Badge>
              </div>
              
              <div className="flex items-center justify-center space-x-2">
                <Calendar className="h-4 w-4 text-primary" />
                <span>Submitted:</span>
                <span className="font-medium">{formatDate(submittedAt)}</span>
              </div>
            </div>

            {/* Privacy-safe email display */}
            {email && (
              <div className="flex items-center justify-center space-x-2 text-sm pt-2 border-t">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Participant:</span>
                <code className="bg-muted px-2 py-1 rounded text-xs">
                  {maskEmail(email)}
                </code>
              </div>
            )}

            {/* Unique Confirmation ID - Prominent Display */}
            <div className="pt-4 border-t">
              <div className="flex items-center justify-center space-x-2">
                <CheckCircle className="h-4 w-4 text-primary" />
                <span className="font-medium">Confirmation ID:</span>
              </div>
              <code className="bg-primary/10 text-primary px-3 py-2 rounded-lg font-mono text-lg font-bold mt-2 inline-block">
                {uniqueConfirmationId}
              </code>
            </div>
          </div>

          {/* Research Information */}
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 text-left">
            <h3 className="font-medium text-primary mb-2">About This Research</h3>
            <p className="text-sm text-primary/90 leading-relaxed">
              Your responses are contributing to important research on AI perspectives in education. 
              All data is anonymized and will be used to better understand how different stakeholders 
              view the integration of AI tools in educational settings.
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/">
              <Button variant="outline" className="w-full sm:w-auto">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Return to Home
              </Button>
            </Link>
            
            <Button 
              variant="secondary" 
              onClick={() => window.print()}
              className="w-full sm:w-auto"
            >
              Print Confirmation
            </Button>
          </div>

          {/* Contact Information */}
          <div className="text-xs text-muted-foreground pt-4 border-t">
            <p>
              If you have questions about this research or need to update your responses, 
              please contact the research team.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
