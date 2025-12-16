'use client';

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PrivacyPolicyContent } from './privacy-policy-content';
import { ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface PrivacyPolicyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAccept?: () => void;
}

export function PrivacyPolicyDialog({ open, onOpenChange, onAccept }: PrivacyPolicyDialogProps) {
  const handleAccept = () => {
    if (onAccept) {
      onAccept();
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Privacy Policy
            <Link
              href="/privacy"
              target="_blank"
              className="text-sm font-normal text-primary hover:underline flex items-center gap-1"
            >
              Open in new tab
              <ExternalLink className="h-3 w-3" />
            </Link>
          </DialogTitle>
          <DialogDescription>
            Please review our privacy policy before creating your account.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <PrivacyPolicyContent compact />
        </ScrollArea>

        <DialogFooter className="flex-row justify-between sm:justify-between gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          {onAccept && (
            <Button onClick={handleAccept}>
              I Accept
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
