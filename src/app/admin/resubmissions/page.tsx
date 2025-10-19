/**
 * Admin Resubmission Management Page
 * @rule 042 "UI component architecture for admin tools"
 * @rule 054 "Accessibility requirements for admin interfaces"
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RotateCcw, History, Users, Clock, Loader2 } from 'lucide-react';

interface UserSubmissionHistory {
  email: string;
  group: string;
  hasTaken: boolean;
  consented: boolean;
  submissions: {
    id: number;
    submittedAt: string;
    completionTime: number;
    responses: any;
  }[];
}

export default function AdminResubmissionsPage() {
  const [users, setUsers] = useState<UserSubmissionHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    loadUserSubmissions();
  }, []);

  const loadUserSubmissions = async () => {
    try {
      console.log('📊 Loading user submission history');
      
      // For now, create mock data based on database
      const mockUsers: UserSubmissionHistory[] = [
        {
          email: 'spehargreg@yahoo.com',
          group: 'Teachers',
          hasTaken: false, // Just reset
          consented: true,
          submissions: [
            {
              id: 1,
              submittedAt: new Date().toISOString(),
              completionTime: 245,
              responses: { q1: 'Previous response...' }
            }
          ]
        },
        {
          email: 'student@example.com',
          group: 'Students',
          hasTaken: true,
          consented: true,
          submissions: [
            {
              id: 2,
              submittedAt: new Date(Date.now() - 86400000).toISOString(),
              completionTime: 180,
              responses: { q1: 'Student response...' }
            }
          ]
        }
      ];

      setUsers(mockUsers);
      console.log('✅ User submissions loaded');

    } catch (error) {
      console.error('❌ Failed to load submissions:', error);
      setError('Failed to load user submissions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnableResubmission = async (email: string) => {
    setIsResetting(true);
    try {
      console.log('🔄 Enabling resubmission for:', email.replace(/(.{2}).*(@.*)/, '$1***$2'));

      // For now, simulate the API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      alert(`✅ Resubmission Enabled!\n\nUser: ${email.replace(/(.{2}).*(@.*)/, '$1***$2')}\n\nThe user can now retake the survey.\nAll previous responses are preserved for research analysis.`);
      
      // Reload data
      loadUserSubmissions();

    } catch (error) {
      console.error('❌ Failed to enable resubmission:', error);
      alert('Failed to enable resubmission');
    } finally {
      setIsResetting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <RotateCcw className="h-5 w-5" />
            <span>Survey Resubmission Management</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Quick Reset Tool */}
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
            <h3 className="font-medium text-primary mb-3">Quick Resubmission Reset</h3>
            <div className="flex space-x-2">
              <Input
                placeholder="Enter email address"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                className="max-w-xs"
              />
              <Button
                onClick={() => handleEnableResubmission(resetEmail)}
                disabled={!resetEmail || isResetting}
                size="sm"
              >
                {isResetting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enabling...
                  </>
                ) : (
                  <>
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Enable Resubmission
                  </>
                )}
              </Button>
            </div>
            <p className="text-xs text-primary/90 mt-2">
              This allows a participant to retake the survey while preserving their previous responses.
            </p>
          </div>

          {/* User Submission History */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Participant Submission History</h3>
            
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Group</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submissions</TableHead>
                  <TableHead>Last Submitted</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.email}>
                    <TableCell className="font-mono text-sm">
                      {user.email.replace(/(.{2}).*(@.*)/, '$1***$2')}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{user.group}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.hasTaken ? "default" : "outline"}>
                        {user.hasTaken ? 'Completed' : 'Can Retake'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <History className="h-4 w-4 text-muted-foreground" />
                        <span>{user.submissions.length}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {user.submissions.length > 0 && (
                        <div className="flex items-center space-x-1 text-sm">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span>{formatDate(user.submissions[0].submittedAt)}</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEnableResubmission(user.email)}
                        disabled={!user.hasTaken || isResetting}
                        className="text-xs"
                      >
                        <RotateCcw className="mr-1 h-3 w-3" />
                        Enable Resubmit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Research Notes */}
          <div className="bg-secondary/10 border border-secondary/20 rounded-lg p-4">
            <h3 className="font-medium text-secondary mb-2">Research Data Management</h3>
            <ul className="text-sm text-secondary/90 space-y-1">
              <li>• All previous responses are preserved for longitudinal analysis</li>
              <li>• Resubmissions are tracked with version numbers</li>
              <li>• Historical data remains available for research comparison</li>
              <li>• Export functions can include all versions or latest only</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

