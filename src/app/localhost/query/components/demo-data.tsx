'use client';

import React, { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const DEMO_DATA = [
  { level: 'info', message: 'Application started', timestamp: new Date().toISOString(), service: 'api', requestId: 'req-001' },
  { level: 'debug', message: 'Connected to database', timestamp: new Date().toISOString(), service: 'db', requestId: 'req-001' },
  { level: 'info', message: 'User logged in', timestamp: new Date().toISOString(), service: 'auth', userId: 'user-123', requestId: 'req-002' },
  { level: 'warn', message: 'Rate limit approaching', timestamp: new Date().toISOString(), service: 'api', requestId: 'req-003' },
  { level: 'error', message: 'Failed to process payment', timestamp: new Date().toISOString(), service: 'payment', userId: 'user-456', requestId: 'req-004', error: 'Insufficient funds' },
  { level: 'info', message: 'Order created', timestamp: new Date().toISOString(), service: 'orders', orderId: 'order-789', userId: 'user-456', requestId: 'req-005' },
  { level: 'debug', message: 'Cache hit for product data', timestamp: new Date().toISOString(), service: 'products', cacheKey: 'prod-999', requestId: 'req-006' },
  { level: 'info', message: 'Email notification sent', timestamp: new Date().toISOString(), service: 'notifications', userId: 'user-123', emailId: 'email-321', requestId: 'req-007' },
];

export function DemoData() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const isDemo = searchParams.get('demo') === 'true';
  const [isLoading, setIsLoading] = React.useState(false);
  const [isDemoDataLoaded, setIsDemoDataLoaded] = React.useState(false);

  useEffect(() => {
    if (isDemo && !isDemoDataLoaded) {
      loadDemoData();
    }
  }, [isDemo, isDemoDataLoaded]);

  const loadDemoData = async () => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/v1/ingest/demo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ logs: DEMO_DATA }),
      });

      if (!response.ok) {
        throw new Error('Failed to load demo data');
      }

      setIsDemoDataLoaded(true);
      
      toast({
        title: 'Demo data loaded',
        description: 'Example logs have been loaded for you to explore.',
      });
      
      const newParams = new URLSearchParams(searchParams.toString());
      newParams.delete('demo');
      router.replace(`/localhost/query?${newParams.toString()}`);
      
    } catch (error) {
      console.error('Error loading demo data:', error);
      toast({
        title: 'Failed to load demo data',
        description: 'There was an error loading the example logs.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isDemo || isDemoDataLoaded) {
    return null;
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Welcome to Humanlog!</CardTitle>
        <CardDescription>
          We're setting up some example data for you to explore.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          This will load a set of sample logs that demonstrate Humanlog's query capabilities.
          You can use these to learn how to effectively search and analyze your logs.
        </p>
      </CardContent>
      <CardFooter>
        <Button disabled={isLoading} onClick={loadDemoData} className="w-full">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading demo data...
            </>
          ) : (
            'Load Demo Data'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
