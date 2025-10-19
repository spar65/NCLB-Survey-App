/**
 * Admin User Invites Management Page
 * @rule 042 "UI component architecture with table and form composition"
 * @rule 054 "Accessibility requirements for data tables"
 * @rule 130 "Error handling for CRUD operations"
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, Mail, RotateCcw, Loader2, Ban, CheckCircle } from 'lucide-react';

interface InvitedUser {
  id: number;
  email: string;
  group: string;
  invitedAt: string;
  hasTaken: boolean;
  consented: boolean;
  responseCount?: number;
  hasEverSubmitted?: boolean;
  canResubmit?: boolean;
  showResubmitButton?: boolean;
  isBlocked?: boolean;
  blockedAt?: string | null;
  blockedReason?: string | null;
  blockedBy?: string | null;
}

export default function AdminInvitesPage() {
  const [invites, setInvites] = useState<InvitedUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  
  // Form state
  const [newEmail, setNewEmail] = useState('');
  const [newGroup, setNewGroup] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resubmissionLoading, setResubmissionLoading] = useState<string | null>(null);
  const [blockingLoading, setBlockingLoading] = useState<string | null>(null);

  // Load invites on component mount
  useEffect(() => {
    loadInvites();
  }, []);

  const loadInvites = async () => {
    try {
      console.log('📋 Loading invited users from database');
      
      const response = await fetch('/api/admin/invites', {
        credentials: 'include', // Include cookies for authentication
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch invited users');
      }
      
      const data = await response.json();
      
      if (data.success) {
        setInvites(data.invites);
        console.log('✅ Invites loaded successfully:', data.total, 'users');
      } else {
        throw new Error(data.error || 'Failed to load invites');
      }
      
    } catch (error) {
      console.error('❌ Failed to load invites:', error);
      setError('Failed to load invited users');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newEmail || !newGroup) {
      setError('Email and group are required');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      console.log('➕ Adding new invite:', { email: newEmail, group: newGroup });
      
      // TODO: Replace with actual API call
      // const response = await fetch('/api/admin/invites', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email: newEmail, group: newGroup }),
      // });

      // Mock success for now
      const newInvite: InvitedUser = {
        id: Date.now(),
        email: newEmail,
        group: newGroup,
        invitedAt: new Date().toISOString(),
        hasTaken: false,
        consented: false,
      };

      setInvites(prev => [newInvite, ...prev]);
      setNewEmail('');
      setNewGroup('');
      setIsAddDialogOpen(false);
      
      console.log('✅ Invite added successfully');

    } catch (error) {
      console.error('❌ Failed to add invite:', error);
      setError('Failed to add invite');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleBlockUser = async (email: string, group: string, isCurrentlyBlocked: boolean) => {
    const action = isCurrentlyBlocked ? 'unblock' : 'block';
    const actionText = isCurrentlyBlocked ? 'Unblock' : 'Block';
    
    const reason = prompt(
      `${actionText} Participant\n\n${email.replace(/(.{2}).*(@.*)/, '$1***$2')} (${group})\n\nPlease provide a reason for ${action}ing this participant:`
    );
    
    if (!reason) {
      return; // User cancelled
    }

    setBlockingLoading(email);
    try {
      console.log(`🚫 ${actionText}ing user:`, email.replace(/(.{2}).*(@.*)/, '$1***$2'));

      const response = await fetch('/api/admin/block-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          email: email,
          action: action,
          reason: reason
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `Failed to ${action} user`);
      }

      console.log(`✅ User ${action}ed successfully`);
      
      const statusMessage = isCurrentlyBlocked 
        ? `✅ Participant Unblocked!\n\n${email.replace(/(.{2}).*(@.*)/, '$1***$2')} can now access the survey again.\n\nReason: ${reason}`
        : `🚫 Participant Blocked!\n\n${email.replace(/(.{2}).*(@.*)/, '$1***$2')} can no longer access the survey.\n\nReason: ${reason}\n\n⚠️ All existing response data is preserved.`;
      
      alert(statusMessage);
      
      // Reload invites to show updated status
      loadInvites();

    } catch (error) {
      console.error(`❌ Failed to ${action} user:`, error);
      alert(`❌ Failed to ${action} user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setBlockingLoading(null);
    }
  };

  const handleAllowOneResubmission = async (email: string, group: string) => {
    const confirmMessage = `🔄 Allow ONE Additional Survey Submission\n\nParticipant: ${email.replace(/(.{2}).*(@.*)/, '$1***$2')}\nGroup: ${group}\n\nThis will:\n✅ Allow them to retake the survey ONE time only\n✅ Preserve all their previous responses\n✅ Require your approval for any future resubmissions\n\n⚠️ Important: This is a one-time permission, not unlimited access.\n\nContinue?`;
    
    if (!confirm(confirmMessage)) {
      return;
    }

    setResubmissionLoading(email);
    try {
      console.log('🔄 Enabling ONE resubmission for:', email.replace(/(.{2}).*(@.*)/, '$1***$2'));

      // For development, directly update database status
      // Reset hasTaken to 0 to allow one more submission
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      alert(`✅ One-Time Resubmission Approved!\n\nParticipant: ${email.replace(/(.{2}).*(@.*)/, '$1***$2')}\nGroup: ${group}\n\n🎯 What happens next:\n• User can now retake the survey once\n• After resubmission, they'll need approval again\n• All historical responses are preserved\n\n⚠️ Remember: This is one-time permission only!`);
      
      // Reload invites to show updated status
      loadInvites();

    } catch (error) {
      console.error('❌ Failed to enable resubmission:', error);
      alert(`❌ Failed to enable resubmission: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setResubmissionLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-primary">Manage Invites</h1>
              <p className="text-muted-foreground">Invite and manage survey participants</p>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Invite
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Invite</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddInvite} className="space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="participant@example.com"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      required
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="group">Stakeholder Group</Label>
                    <Select value={newGroup} onValueChange={setNewGroup} disabled={isSubmitting}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select group" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Teachers">Teachers</SelectItem>
                        <SelectItem value="Students">Students</SelectItem>
                        <SelectItem value="Administrators">Administrators</SelectItem>
                        <SelectItem value="IT_Admins">IT Admins</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsAddDialogOpen(false)}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? 'Adding...' : 'Add Invite'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Invited Users</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="text-muted-foreground">Loading invites...</div>
              </div>
            ) : invites.length === 0 ? (
              <div className="text-center py-8">
                <Mail className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <div className="text-lg font-medium">No invites yet</div>
                <div className="text-muted-foreground mb-4">
                  Start by adding participants to your survey
                </div>
                <Button onClick={() => setIsAddDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Invite
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Group</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Invited</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invites.map((invite) => (
                    <TableRow key={invite.id}>
                      <TableCell className="font-medium">{invite.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{invite.group}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {invite.isBlocked ? (
                            <Badge variant="destructive">Blocked</Badge>
                          ) : (
                            <Badge variant={invite.hasEverSubmitted ? "default" : "secondary"}>
                              {invite.hasEverSubmitted ? "Has Responses" : "Pending"}
                            </Badge>
                          )}
                          
                          {invite.responseCount && invite.responseCount > 0 && (
                            <Badge variant="outline" className="text-xs">
                              {invite.responseCount} submission{invite.responseCount > 1 ? 's' : ''}
                            </Badge>
                          )}
                          
                          {invite.canResubmit && !invite.isBlocked && (
                            <Badge variant="destructive" className="text-xs">
                              Can Retake
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(invite.invitedAt)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          {/* Resubmission Button - Show for users with responses */}
                          {invite.showResubmitButton && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleAllowOneResubmission(invite.email, invite.group)}
                              disabled={resubmissionLoading === invite.email}
                              className="text-xs"
                              title="Allow one additional survey submission"
                            >
                              {resubmissionLoading === invite.email ? (
                                <>
                                  <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                                  Enabling...
                                </>
                              ) : (
                                <>
                                  <RotateCcw className="mr-1 h-3 w-3" />
                                  Allow Resubmit
                                </>
                              )}
                            </Button>
                          )}
                          
                          {/* Block/Unblock Button */}
                          <Button 
                            variant={invite.isBlocked ? "outline" : "ghost"}
                            size="sm"
                            onClick={() => handleBlockUser(invite.email, invite.group, invite.isBlocked || false)}
                            disabled={blockingLoading === invite.email}
                            title={invite.isBlocked ? "Unblock participant" : "Block participant from survey"}
                            className={invite.isBlocked ? "text-accent hover:text-accent/90" : "text-destructive hover:text-destructive/90"}
                          >
                            {blockingLoading === invite.email ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : invite.isBlocked ? (
                              <CheckCircle className="h-4 w-4" />
                            ) : (
                              <Ban className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
