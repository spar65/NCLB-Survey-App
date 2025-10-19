'use client';

export default function DebugCSSPage() {
  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold">CSS Variable Debug</h1>
      
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Current CSS Variable Values</h2>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 border rounded">
            <div className="font-bold">--primary</div>
            <div 
              className="h-20 rounded mt-2" 
              style={{ backgroundColor: 'hsl(var(--primary))' }}
            />
            <code className="text-xs block mt-2">
              {typeof window !== 'undefined' && 
                getComputedStyle(document.documentElement).getPropertyValue('--primary')}
            </code>
          </div>

          <div className="p-4 border rounded">
            <div className="font-bold">--destructive</div>
            <div 
              className="h-20 rounded mt-2" 
              style={{ backgroundColor: 'hsl(var(--destructive))' }}
            />
            <code className="text-xs block mt-2">
              {typeof window !== 'undefined' && 
                getComputedStyle(document.documentElement).getPropertyValue('--destructive')}
            </code>
          </div>

          <div className="p-4 border rounded">
            <div className="font-bold">--secondary</div>
            <div 
              className="h-20 rounded mt-2" 
              style={{ backgroundColor: 'hsl(var(--secondary))' }}
            />
            <code className="text-xs block mt-2">
              {typeof window !== 'undefined' && 
                getComputedStyle(document.documentElement).getPropertyValue('--secondary')}
            </code>
          </div>

          <div className="p-4 border rounded">
            <div className="font-bold">--accent</div>
            <div 
              className="h-20 rounded mt-2" 
              style={{ backgroundColor: 'hsl(var(--accent))' }}
            />
            <code className="text-xs block mt-2">
              {typeof window !== 'undefined' && 
                getComputedStyle(document.documentElement).getPropertyValue('--accent')}
            </code>
          </div>
        </div>

        <h2 className="text-xl font-semibold mt-8">Tailwind Classes Test</h2>
        <div className="space-y-2">
          <div className="bg-primary text-white p-4 rounded border-4 border-black">
            🔵 bg-primary class (should be SKY BLUE #3B82F6)
          </div>
          <div className="bg-destructive text-white p-4 rounded border-4 border-black">
            🔴 bg-destructive class (should be RED #DC2626)
          </div>
          <div className="bg-secondary text-white p-4 rounded border-4 border-black">
            🟦 bg-secondary class (should be DARK BLUE-GRAY #364756)
          </div>
          <div className="bg-accent text-white p-4 rounded border-4 border-black">
            🔷 bg-accent class (should be TEAL #0EA5E9)
          </div>
        </div>
      </div>
    </div>
  );
}

