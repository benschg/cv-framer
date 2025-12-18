import { AlertCircle } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';

interface PublicCVErrorProps {
  message: string;
}

export function PublicCVError({ message }: PublicCVErrorProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6 text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <h1 className="mb-2 text-xl font-semibold">CV Not Available</h1>
          <p className="text-muted-foreground">{message}</p>
        </CardContent>
      </Card>
    </div>
  );
}
