/**
 * Admin Survey Versions Management Page
 * @rule 042 "UI component architecture for version management"
 * @rule 054 "Accessibility requirements for forms and tables"
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, FileText, Users, Calendar } from 'lucide-react';

interface SurveyVersion {
  id: number;
  version: string;
  group: string;
  description: string | null;
  questionCount: number;
  responseCount: number;
  isActive: boolean;
  createdAt: string;
}

export default function AdminVersionsPage() {
  const [versions, setVersions] = useState<SurveyVersion[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadVersions();
  }, []);

  const loadVersions = async () => {
    try {
      console.log('📋 Loading survey versions');
      
      // Mock data for now - will be replaced with API call
      const mockVersions: SurveyVersion[] = [
        {
          id: 1,
          version: 'v1.0-Teachers',
          group: 'Teachers',
          description: 'Initial teacher survey based on NCLB framework',
          questionCount: 5,
          responseCount: 45,
          isActive: true,
          createdAt: new Date().toISOString(),
        },
        {
          id: 2,
          version: 'v1.0-Students',
          group: 'Students',
          description: 'Initial student survey based on NCLB framework',
          questionCount: 5,
          responseCount: 78,
          isActive: true,
          createdAt: new Date().toISOString(),
        },
        {
          id: 3,
          version: 'v1.0-Administrators',
          group: 'Administrators',
          description: 'Initial administrator survey based on NCLB framework',
          questionCount: 5,
          responseCount: 23,
          isActive: true,
          createdAt: new Date().toISOString(),
        },
        {
          id: 4,
          version: 'v1.0-IT_Admins',
          group: 'IT_Admins',
          description: 'Initial IT administrator survey based on NCLB framework',
          questionCount: 6,
          responseCount: 10,
          isActive: true,
          createdAt: new Date().toISOString(),
        },
      ];
      
      setVersions(mockVersions);
      console.log('✅ Survey versions loaded');
      
    } catch (error) {
      console.error('❌ Failed to load versions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Survey Versions</h1>
            <p className="text-muted-foreground">
              Manage survey versions for different stakeholder groups
            </p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Version
          </Button>
        </div>

        {/* Versions Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Survey Versions</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="text-muted-foreground">Loading survey versions...</div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Version</TableHead>
                    <TableHead>Group</TableHead>
                    <TableHead>Questions</TableHead>
                    <TableHead>Responses</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {versions.map((version) => (
                    <TableRow key={version.id}>
                      <TableCell className="font-medium">
                        {version.version}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{version.group}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                          {version.questionCount}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                          {version.responseCount}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={version.isActive ? "default" : "secondary"}>
                          {version.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                          {formatDate(version.createdAt)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button variant="secondary" size="sm">
                            Edit
                          </Button>
                          <Button variant="secondary" size="sm">
                            View
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
      </div>
    </div>
  );
}
