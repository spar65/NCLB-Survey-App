import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Download, Eye, Ban, CheckCircle, ArrowLeft, Copy, User, LogOut, Settings, MoreVertical } from "lucide-react";

export default function TestButtonsPage() {
  return (
    <div className="p-8 space-y-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold">Button Transparency Test</h1>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">
          All Variants (Should Have Solid Backgrounds)
        </h2>
        <div className="flex flex-wrap gap-3">
          <Button variant="default">Default (Primary)</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline (MUST BE SOLID)</Button>
          <Button variant="ghost">Ghost (Transparent Until Hover)</Button>
          <Button variant="destructive">Destructive</Button>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">🚨 TRANSPARENCY TEST</h2>
        <p className="text-sm text-muted-foreground">
          If you can see the diagonal stripes through any button, there's a
          transparency issue.
        </p>
        <div
          className="p-6 rounded-lg flex flex-wrap gap-3"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, #f0f0f0 0, #f0f0f0 10px, #e0e0e0 10px, #e0e0e0 20px)",
          }}
        >
          <Button variant="default">Default</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline (CRITICAL TEST)</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
        </div>
        <p className="text-xs text-destructive font-bold">
          ❌ If you see diagonal lines through outline/secondary buttons =
          TRANSPARENCY ISSUE
        </p>
        <p className="text-xs text-accent font-bold">
          ✅ Only ghost button should show stripes (until hover)
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Real-World Button Examples</h2>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1">
              Back
            </Button>
            <Button variant="default" className="flex-1">
              Next
            </Button>
          </div>

          <div className="flex gap-2">
            <Button variant="secondary">
              <Copy className="mr-2 h-4 w-4" />
              Print
            </Button>
            <Button variant="default">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Isolated Debug Test</h2>
        <div className="space-y-4">
          {/* Test inline style (should always work) */}
          <button
            className="px-4 py-2 rounded mr-4"
            style={{ backgroundColor: "#3B82F6", color: "white" }}
          >
            Inline Style Button
          </button>

          {/* Test Tailwind classes */}
          <button className="px-4 py-2 bg-primary text-primary-foreground rounded mr-4">
            Tailwind Button
          </button>

          {/* Test Button component */}
          <Button variant="outline">Component Button</Button>
        </div>
        <div className="text-sm space-y-1">
          <p><strong>Diagnosis:</strong></p>
          <p>• If inline works but component doesn't: Issue in button component</p>
          <p>• If Tailwind works but component doesn't: Issue in component definition</p>
          <p>• If none work: Environment/browser issue</p>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">🔽 DROPDOWN TRANSPARENCY TEST</h2>
        <p className="text-sm text-muted-foreground">
          Test dropdown menus for solid backgrounds. Click each dropdown and verify no transparency.
        </p>
        
        <div className="space-y-4">
          <div className="flex flex-wrap gap-4">
            {/* Admin-style dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>Admin Test</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-white border border-border shadow-lg">
                <DropdownMenuItem className="flex items-center space-x-2 text-destructive hover:text-destructive/90 hover:bg-destructive/10 cursor-pointer bg-white">
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center space-x-2 cursor-pointer bg-white">
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Action menu dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem className="cursor-pointer">
                  <Eye className="mr-2 h-4 w-4" />
                  View
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  <Copy className="mr-2 h-4 w-4" />
                  Copy
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer text-destructive">
                  <Ban className="mr-2 h-4 w-4" />
                  Block
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Secondary dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Export Options
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-44">
                <DropdownMenuItem className="cursor-pointer">
                  <Download className="mr-2 h-4 w-4" />
                  Export Excel
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  <Download className="mr-2 h-4 w-4" />
                  Export CSV
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
            <h3 className="font-medium text-primary mb-2">Dropdown Test Instructions</h3>
            <ul className="text-sm text-primary/90 space-y-1">
              <li>• <strong>Click each dropdown trigger</strong> - Should open with solid white background</li>
              <li>• <strong>Check dropdown container</strong> - Should have visible border and white background</li>
              <li>• <strong>Hover over menu items</strong> - Should show light gray or colored backgrounds</li>
              <li>• <strong>No transparency</strong> - Should not see page content through dropdown</li>
              <li>• <strong>Destructive items</strong> - Should show light background on hover</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">🎯 TRANSPARENCY TEST ON COMPLEX BACKGROUND</h2>
        <p className="text-sm text-muted-foreground">
          Test buttons and dropdowns on a complex background pattern.
        </p>
        <div
          className="p-6 rounded-lg space-y-4"
          style={{
            backgroundImage: 'repeating-linear-gradient(45deg, #f0f0f0 0, #f0f0f0 10px, #e0e0e0 10px, #e0e0e0 20px), repeating-linear-gradient(-45deg, #fafafa 0, #fafafa 5px, #f5f5f5 5px, #f5f5f5 10px)',
          }}
        >
          <div className="flex flex-wrap gap-3">
            <Button variant="default">Primary Action</Button>
            <Button variant="secondary">Secondary Action</Button>
            <Button variant="outline">Outline Button</Button>
            <Button variant="destructive">Destructive Action</Button>
          </div>
          
          <div className="flex gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <User className="mr-2 h-4 w-4" />
                  Dropdown Test
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem className="cursor-pointer">Normal Item</DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer text-destructive">Destructive Item</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
          <p className="text-sm text-destructive">
            <strong>❌ FAIL:</strong> If you can see the diagonal pattern through any button or dropdown
          </p>
        </div>
        <div className="bg-accent/10 border border-accent/20 rounded-lg p-3">
          <p className="text-sm text-accent">
            <strong>✅ PASS:</strong> All buttons and dropdowns have solid backgrounds (no pattern visible through them)
          </p>
        </div>
      </section>
    </div>
  );
}
