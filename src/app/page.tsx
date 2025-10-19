/**
 * Landing Page for AI Education Survey
 * @rule 042 "UI component architecture with proper composition"
 * @rule 054 "Accessibility requirements with semantic HTML"
 * @rule 030 "Visual design system with education-focused theme"
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Mail, Shield } from "lucide-react";
import Link from 'next/link';

export default function Home() {
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [consented, setConsented] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [devCode, setDevCode] = useState(''); // For development testing
  const router = useRouter();

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      console.log('📧 Requesting OTP for:', email.replace(/(.{2}).*(@.*)/, '$1***$2'));

      // First, check if user has already completed the survey
      console.log('🔍 Checking if user has already completed survey...');
      const userCheckResponse = await fetch('/api/survey/user-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (userCheckResponse.ok) {
        const userData = await userCheckResponse.json();
        if (userData.hasTaken) {
          console.log('ℹ️ User has already completed survey, redirecting...');
          
          // Redirect to already-completed page
          const params = new URLSearchParams({
            group: userData.group,
            responseId: '1', // We know they have a response
            submittedAt: Date.now().toString(),
            email: email, // Pass email for privacy-safe display
          });
          
          window.location.href = `/survey/already-completed?${params.toString()}`;
          return;
        }
      }

      // Proceed with OTP request if user hasn't completed survey
      const response = await fetch('/api/auth/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send access code');
      }

      // Store dev code for testing
      if (data.devCode) {
        setDevCode(data.devCode);
      }

      setStep('otp');
      console.log('✅ OTP request successful');

    } catch (error) {
      console.error('❌ OTP request failed:', error);
      setError(error instanceof Error ? error.message : 'Failed to send access code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      console.log('🔐 Verifying OTP');

      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: otp, consented }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Invalid access code');
      }

      console.log('✅ OTP verification successful');
      
      // Redirect to survey
      router.push(`/survey/${btoa(email)}`); // Simple token for now

    } catch (error) {
      console.error('❌ OTP verification failed:', error);
      setError(error instanceof Error ? error.message : 'Invalid access code');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-primary">
            AI in Education Survey
          </CardTitle>
          <CardDescription>
            Help us understand perspectives on AI integration in education
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {step === 'email' ? (
            /* Email Input Section */
            <form onSubmit={handleRequestOTP} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="w-full"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading || !email}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending Code...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Request Access Code
                  </>
                )}
              </Button>
            </form>
          ) : (
            /* OTP Verification Section */
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="otp">Enter 6-Digit Access Code</Label>
                  {otp.length > 0 && (
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => setOtp('')}
                      className="text-xs h-auto p-1"
                    >
                      Clear
                    </Button>
                  )}
                </div>
                <InputOTP 
                  maxLength={6} 
                  value={otp} 
                  onChange={setOtp}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
                {devCode && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm font-medium text-blue-800 mb-1">Development Mode</p>
                    <p className="text-xs text-blue-600">
                      Use this code: <code className="bg-blue-100 px-2 py-1 rounded font-mono text-blue-800">{devCode}</code>
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setOtp(devCode)}
                      className="mt-2 text-xs h-7"
                    >
                      Auto-fill Code
                    </Button>
                  </div>
                )}
              </div>

              {/* Consent Checkbox */}
              <div className="flex items-start space-x-2">
                <Checkbox 
                  id="consent" 
                  checked={consented}
                  onCheckedChange={(checked) => setConsented(checked === true)}
                  className="mt-1" 
                />
                <Label htmlFor="consent" className="text-sm leading-relaxed">
                  I consent to participate in this survey and allow anonymous use of my responses for research purposes.
                </Label>
              </div>

              <div className="flex space-x-2">
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={() => setStep('email')}
                  disabled={isLoading}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button 
                  type="submit"
                  className="flex-1" 
                  disabled={isLoading || otp.length !== 6 || !consented}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <Shield className="mr-2 h-4 w-4" />
                      Continue
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}

          {/* Footer */}
          <div className="text-center space-y-3">
            <p className="text-xs text-muted-foreground">
              Part of the "No Concept Left Behind" research initiative
            </p>
            
            {/* Admin Access Link */}
            <div className="pt-2 border-t border-muted">
              <Link 
                href="/admin/login" 
                className="text-xs text-muted-foreground hover:text-primary transition-colors inline-flex items-center space-x-1"
              >
                <Shield className="h-3 w-3" />
                <span>Administrator Access</span>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}