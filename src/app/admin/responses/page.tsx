/**
 * Admin Survey Responses Page - Enhanced
 * @rule 042 "UI component architecture for data display"
 * @rule 054 "Accessibility requirements for data tables"
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Download, FileText, Clock, Loader2, Eye, History, Users, BarChart3 } from 'lucide-react';

interface SurveyResponse {
  id: number;
  email: string;
  group: string;
  submittedAt: string;
  completionTime: number | null;
  partial: boolean;
  deviceType: string | null;
  userAgent: string;
  questionsAnswered: number;
  submissionNumber: number;
  version: {
    version: string;
    group: string;
    description: string;
  };
}

export default function AdminResponsesPage() {
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    loadResponses();
  }, []);

  const loadResponses = async () => {
    try {
      console.log('📋 Loading survey responses from database');

      const response = await fetch('/api/admin/responses', {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch responses');
      }

      const data = await response.json();

      if (data.success) {
        setResponses(data.responses);
        console.log('✅ Responses loaded successfully:', data.responses.length, 'responses');
      } else {
        throw new Error(data.error || 'Failed to load responses');
      }

    } catch (error) {
      console.error('❌ Failed to load responses:', error);
      setError(error instanceof Error ? error.message : 'Failed to load responses');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async (format: 'excel' | 'csv') => {
    setIsExporting(true);
    try {
      console.log(`📤 Exporting data as ${format}`);

      const response = await fetch('/api/admin/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ format }),
      });

      if (!response.ok) {
        throw new Error(`Failed to export ${format} file`);
      }

      // Download the file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `survey-responses.${format === 'excel' ? 'xlsx' : 'csv'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      console.log(`✅ ${format.toUpperCase()} export downloaded successfully`);

    } catch (error) {
      console.error('❌ Export failed:', error);
      setError(`Failed to export ${format} file`);
    } finally {
      setIsExporting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCompletionTime = (seconds: number | null) => {
    if (!seconds) return '-';
    const minutes = Math.round(seconds / 60);
    return `${minutes} min`;
  };

  const uniqueParticipants = new Set(responses.map(r => r.email)).size;
  const completeResponses = responses.filter(r => !r.partial).length;
  const partialResponses = responses.filter(r => r.partial).length;

  return (
    <div className="container mx-auto py-8 px-4 space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Survey Responses</span>
          </CardTitle>
          <CardDescription>
            View and manage all survey submissions with export capabilities
          </CardDescription>
        </CardHeader>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Statistics Overview */}
      {!isLoading && responses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Response Statistics</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-primary/5 rounded-lg">
                <div className="text-3xl font-bold text-primary">{responses.length}</div>
                <div className="text-sm text-muted-foreground">Total Responses</div>
              </div>
              <div className="text-center p-4 bg-accent/10 rounded-lg">
                <div className="text-3xl font-bold text-accent">{completeResponses}</div>
                <div className="text-sm text-muted-foreground">Complete</div>
              </div>
              <div className="text-center p-4 bg-secondary/10 rounded-lg">
                <div className="text-3xl font-bold text-secondary">{partialResponses}</div>
                <div className="text-sm text-muted-foreground">Partial</div>
              </div>
              <div className="text-center p-4 bg-primary/10 rounded-lg">
                <div className="text-3xl font-bold text-primary">{uniqueParticipants}</div>
                <div className="text-sm text-muted-foreground">Unique Participants</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Export Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Data Export</CardTitle>
          <CardDescription>
            Export anonymized survey data for research analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => handleExport('excel')}
              disabled={isExporting || responses.length === 0}
              className="flex items-center space-x-2"
            >
              {isExporting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              <span>Export Excel</span>
            </Button>
            <Button
              onClick={() => handleExport('csv')}
              disabled={isExporting || responses.length === 0}
              variant="outline"
              className="flex items-center space-x-2"
            >
              {isExporting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FileText className="h-4 w-4" />
              )}
              <span>Export CSV</span>
            </Button>
          </div>
          
          {isExporting && (
            <div className="mt-4 p-3 bg-primary/5 border border-primary/20 rounded-lg">
              <p className="text-sm text-primary/90 flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Preparing export with anonymized data and privacy protection...</span>
              </p>
            </div>
          )}

          {responses.length === 0 && !isLoading && (
            <div className="mt-4 p-3 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">
                No responses available for export. Responses will appear here once participants complete surveys.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Responses Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Individual Responses</span>
          </CardTitle>
          <CardDescription>
            Detailed view of all survey submissions with anonymized participant data
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center space-y-3">
                <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                <p className="text-muted-foreground">Loading survey responses...</p>
              </div>
            </div>
          ) : responses.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Survey Responses Yet</h3>
              <p className="text-muted-foreground mb-4">
                Survey responses will appear here once participants complete the survey.
              </p>
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 max-w-md mx-auto">
                <p className="text-sm text-primary/90">
                  💡 <strong>Tip:</strong> Use the "Invites" tab to add participants and track their progress.
                </p>
              </div>
            </div>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Participant</TableHead>
                    <TableHead>Group</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Questions</TableHead>
                    <TableHead>Completion</TableHead>
                    <TableHead>Device</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {responses.map((response) => (
                    <TableRow key={response.id} className="hover:bg-muted/50">
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-mono text-sm">{response.email}</div>
                          {response.submissionNumber > 1 && (
                            <Badge variant="secondary" className="text-xs">
                              Submission #{response.submissionNumber}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{response.group}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={response.partial ? "secondary" : "default"}>
                          {response.partial ? "Partial" : "Complete"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <span className="font-medium">{response.questionsAnswered}</span>
                          <span className="text-muted-foreground"> answered</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {response.completionTime ? (
                          <div className="flex items-center space-x-1 text-sm">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <span>{formatCompletionTime(response.completionTime)}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {response.deviceType || 'Unknown'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {formatDate(response.submittedAt)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-1">
                          <Button variant="secondary" size="sm" title="View Response Details">
                            <Eye className="h-4 w-4" />
                          </Button>
                          {response.submissionNumber > 1 && (
                            <Button 
                              variant="secondary" 
                              size="sm" 
                              title="View Submission History"
                            >
                              <History className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}