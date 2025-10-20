/**
 * Admin Dashboard Page
 * @rule 042 "UI component architecture with data display"
 * @rule 054 "Accessibility requirements for dashboard"
 * @rule 030 "Visual design system for admin interface"
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Users, FileText, TrendingUp, Settings, Loader2, Download } from 'lucide-react';

interface DashboardStats {
  totalInvites: number;
  totalResponses: number;
  completionRate: number;
  responsesByGroup: Record<string, number>;
  averageCompletionTime: number;
  partialSubmissions: number;
  recentResponses: Array<{
    id: number;
    email: string;
    group: string;
    submittedAt: string;
    completionTime: number | null;
    partial: boolean;
  }>;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [productionMode, setProductionMode] = useState(false);
  const [isTogglingProduction, setIsTogglingProduction] = useState(false);

  useEffect(() => {
    loadDashboardStats();
    checkProductionMode();
  }, []);

  const checkProductionMode = async () => {
    try {
      const response = await fetch('/api/admin/toggle-production');
      const data = await response.json();
      setProductionMode(data.productionMode);
    } catch (error) {
      console.error('Failed to check production mode:', error);
    }
  };

  const loadDashboardStats = async () => {
    try {
      console.log('📊 Loading dashboard statistics');

      const response = await fetch('/api/admin/dashboard');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load dashboard data');
      }

      setStats(data.stats);
      console.log('✅ Dashboard statistics loaded');

    } catch (error) {
      console.error('❌ Failed to load dashboard:', error);
      setError(error instanceof Error ? error.message : 'Failed to load dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleProduction = async () => {
    const confirmation = prompt(
      '⚠️ CRITICAL: Switch to Production Mode?\n\n' +
      'This will:\n' +
      '• DELETE all survey responses\n' +
      '• RESET all invited users\n' +
      '• BLOCK test accounts from surveys\n' +
      '• This action CANNOT be undone via UI\n\n' +
      'Type "PRODUCTION" to confirm:'
    );

    if (confirmation !== 'PRODUCTION') {
      alert('❌ Production mode activation cancelled');
      return;
    }

    setIsTogglingProduction(true);
    try {
      const response = await fetch('/api/admin/toggle-production', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ confirmation: 'PRODUCTION' }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to activate production mode');
      }

      alert(
        `✅ PRODUCTION MODE ACTIVATED!\n\n` +
        `Deleted: ${data.deletedResponses} responses\n` +
        `Reset: ${data.resetUsers} users\n` +
        `Activated by: ${data.activatedBy}\n\n` +
        `The system is now ready for real data collection.`
      );

      setProductionMode(true);
      loadDashboardStats(); // Refresh to show empty stats

    } catch (error) {
      alert(`❌ Failed to activate production mode: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsTogglingProduction(false);
    }
  };

  const handleExport = async () => {
    try {
      console.log('📤 Initiating data export');

      const response = await fetch('/api/admin/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          format: 'excel',
          anonymize: true,
          includeMetadata: true,
        }),
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      // Download the file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `survey_responses_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      console.log('✅ Export downloaded successfully');

    } catch (error) {
      console.error('❌ Export failed:', error);
      setError('Failed to export data');
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertDescription>No dashboard data available</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-primary">Dashboard</h1>
            <p className="text-muted-foreground">Survey statistics and analytics</p>
          </div>
          <Button onClick={handleExport} className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
        </div>

        {/* Production Mode Indicator */}
        {!productionMode ? (
          <Alert className="border-orange-200 bg-orange-50">
            <AlertDescription className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-orange-800 font-semibold">⚠️ DEVELOPMENT MODE ACTIVE</span>
                <span className="text-orange-600 text-sm">
                  - Test accounts can access surveys and save data
                </span>
              </div>
              <Button 
                variant="destructive" 
                size="sm"
                onClick={handleToggleProduction}
                disabled={isTogglingProduction}
              >
                {isTogglingProduction ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Activating...
                  </>
                ) : (
                  '🚀 Switch to Production Mode'
                )}
              </Button>
            </AlertDescription>
          </Alert>
        ) : (
          <>
            <Alert className="border-green-200 bg-green-50">
              <AlertDescription className="flex items-center gap-2">
                <span className="text-green-800 font-semibold">✅ PRODUCTION MODE ACTIVE</span>
                <span className="text-green-600 text-sm">
                  - Test accounts blocked | Real data collection enabled
                </span>
              </AlertDescription>
            </Alert>
            <Alert className="border-primary/20 bg-primary/5">
              <AlertDescription className="text-sm text-primary/90">
                ℹ️ Showing production data only. Test accounts automatically excluded from all statistics.
              </AlertDescription>
            </Alert>
          </>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Invites</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalInvites}</div>
              <p className="text-xs text-muted-foreground">
                Participants invited
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Responses</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalResponses}</div>
              <p className="text-xs text-muted-foreground">
                Surveys completed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completionRate}%</div>
              <p className="text-xs text-muted-foreground">
                Response rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Time</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round(stats.averageCompletionTime / 60)}m
              </div>
              <p className="text-xs text-muted-foreground">
                Average completion
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Responses by Group */}
        <Card>
          <CardHeader>
            <CardTitle>Responses by Stakeholder Group</CardTitle>
            <CardDescription>
              Current response distribution across target groups
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(stats.responsesByGroup).map(([group, count]) => (
                <div key={group} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">{group}</Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="text-2xl font-bold">{count}</div>
                    <div className="text-sm text-muted-foreground">responses</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Responses */}
        {stats.recentResponses.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Recent Responses</CardTitle>
              <CardDescription>
                Latest survey submissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.recentResponses.slice(0, 5).map((response) => (
                  <div key={response.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Badge variant="outline">{response.group}</Badge>
                      <div className="text-sm">
                        <div className="font-medium">{response.email}</div>
                        <div className="text-muted-foreground">
                          {new Date(response.submittedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={response.partial ? "secondary" : "default"}>
                        {response.partial ? "Partial" : "Complete"}
                      </Badge>
                      {response.completionTime && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {Math.round(response.completionTime / 60)}m
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
