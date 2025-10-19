/**
 * Admin Testing Dashboard
 * Central hub for all testing and debug pages
 */

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { 
  Microscope, 
  Palette, 
  Bug, 
  FileText, 
  Settings,
  ExternalLink,
  CheckCircle2
} from 'lucide-react';

interface TestPage {
  id: string;
  name: string;
  description: string;
  path: string;
  category: 'UI' | 'Debug' | 'Demo';
  icon: typeof Microscope;
  status: 'active' | 'archived';
}

const testPages: TestPage[] = [
  {
    id: 'button-transparency',
    name: 'Button Transparency Test',
    description: 'Test all button variants for transparency issues and solid backgrounds. Includes dropdown menu testing.',
    path: '/test-buttons',
    category: 'UI',
    icon: Palette,
    status: 'active',
  },
  {
    id: 'css-debug',
    name: 'CSS Variable Debug',
    description: 'Debug CSS variables and Tailwind color classes. Shows computed values and color swatches.',
    path: '/debug-css',
    category: 'Debug',
    icon: Settings,
    status: 'active',
  },
  {
    id: 'survey-debug',
    name: 'Survey Debug',
    description: 'Debug survey flow and question rendering without requiring authentication.',
    path: '/debug-survey',
    category: 'Debug',
    icon: Bug,
    status: 'active',
  },
  {
    id: 'demo-survey',
    name: 'Demo Survey',
    description: 'Demo version of the survey for testing and demonstrations.',
    path: '/demo-survey',
    category: 'Demo',
    icon: FileText,
    status: 'active',
  },
  {
    id: 'test-survey',
    name: 'Test Survey',
    description: 'Test version of the survey with sample questions and validation.',
    path: '/test-survey',
    category: 'Demo',
    icon: CheckCircle2,
    status: 'active',
  },
];

export default function AdminTestingPage() {
  const categorizedTests = {
    UI: testPages.filter(t => t.category === 'UI'),
    Debug: testPages.filter(t => t.category === 'Debug'),
    Demo: testPages.filter(t => t.category === 'Demo'),
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'UI': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Debug': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Demo': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Microscope className="h-6 w-6" />
            Testing & Debug Pages
          </h1>
          <p className="text-muted-foreground mt-1">
            Access all testing, debugging, and demo pages for development and QA
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold">{testPages.length}</div>
                <div className="text-sm text-muted-foreground">Total Test Pages</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold">{testPages.filter(t => t.status === 'active').length}</div>
                <div className="text-sm text-muted-foreground">Active Tests</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold">{Object.keys(categorizedTests).length}</div>
                <div className="text-sm text-muted-foreground">Categories</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Test Pages by Category */}
        {Object.entries(categorizedTests).map(([category, tests]) => (
          <div key={category} className="space-y-4">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold">{category} Tests</h2>
              <Badge variant="outline">{tests.length}</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tests.map((test) => {
                const Icon = test.icon;
                return (
                  <Card key={test.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${getCategoryColor(test.category)}`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{test.name}</CardTitle>
                            <Badge className="mt-1" variant={test.status === 'active' ? 'default' : 'secondary'}>
                              {test.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <CardDescription className="text-sm">
                        {test.description}
                      </CardDescription>
                      
                      <div className="flex items-center gap-2">
                        <Link href={test.path} target="_blank" className="flex-1">
                          <Button variant="outline" className="w-full">
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Open Test Page
                          </Button>
                        </Link>
                        <Link href={test.path}>
                          <Button variant="secondary">
                            View
                          </Button>
                        </Link>
                      </div>
                      
                      <div className="text-xs text-muted-foreground font-mono bg-muted/50 p-2 rounded">
                        {test.path}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        ))}

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common testing and debugging tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Button variant="outline" asChild>
                <Link href="/test-buttons">
                  <Palette className="mr-2 h-4 w-4" />
                  UI Component Tests
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/debug-css">
                  <Settings className="mr-2 h-4 w-4" />
                  CSS Debugging
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/demo-survey">
                  <FileText className="mr-2 h-4 w-4" />
                  Demo Survey
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        <Card className="border-blue-200 bg-blue-50/50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Microscope className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="space-y-2">
                <h3 className="font-medium text-blue-900">Testing Best Practices</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Use these pages to verify UI components before deploying to production</li>
                  <li>• Button transparency tests ensure professional appearance across all browsers</li>
                  <li>• CSS debug page helps diagnose color and styling issues</li>
                  <li>• Demo/test surveys allow testing without affecting real data</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

