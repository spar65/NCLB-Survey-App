/**
 * Admin Layout with Navigation
 * @rule 042 "UI component architecture for layout composition"
 * @rule 054 "Accessibility requirements for navigation"
 */

'use client';

import { useRouter } from 'next/navigation';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import { BarChart3, Users, FileText, Settings, LogOut, User } from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      console.log('🔓 Logging out admin user');

      const response = await fetch('/api/admin/logout', {
        method: 'POST',
      });

      if (response.ok) {
        console.log('✅ Logout successful');
        router.push('/admin/login');
      } else {
        console.error('❌ Logout failed');
      }
    } catch (error) {
      console.error('❌ Logout error:', error);
      // Force redirect even if API fails
      router.push('/admin/login');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/admin/dashboard" className="flex items-center space-x-2">
              <BarChart3 className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">Survey Admin</span>
            </Link>
            
            <div className="flex items-center space-x-4">
              <Tabs defaultValue="dashboard" className="w-auto">
                <TabsList>
                  <TabsTrigger value="dashboard" asChild>
                    <Link href="/admin/dashboard">Dashboard</Link>
                  </TabsTrigger>
                  <TabsTrigger value="invites" asChild>
                    <Link href="/admin/invites">Invites</Link>
                  </TabsTrigger>
                  <TabsTrigger value="versions" asChild>
                    <Link href="/admin/versions">Versions</Link>
                  </TabsTrigger>
                  <TabsTrigger value="responses" asChild>
                    <Link href="/admin/responses">Responses</Link>
                  </TabsTrigger>
                  <TabsTrigger value="resubmissions" asChild>
                    <Link href="/admin/resubmissions">Resubmissions</Link>
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              {/* Admin User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="flex items-center space-x-2 bg-primary text-primary-foreground hover:bg-primary/90">
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline">Admin</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-white border border-border shadow-lg" sideOffset={5}>
                  <DropdownMenuItem 
                    onClick={handleLogout}
                    className="flex items-center space-x-2 text-destructive hover:text-destructive/90 hover:bg-destructive/10 cursor-pointer focus:bg-destructive/10 focus:text-destructive/90 bg-white"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </nav>

      {/* Page Content */}
      {children}
    </div>
  );
}
