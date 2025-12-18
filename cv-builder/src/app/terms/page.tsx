import { TermsOfServiceContent } from '@/components/legal/terms-of-service-content';
import { PublicPageLayout } from '@/components/shared/public-page-layout';

export const metadata = {
  title: 'Terms of Service | CV Builder',
  description:
    'Terms of Service for CV Builder - Learn about the rules and guidelines for using our CV building platform.',
};

export default function TermsPage() {
  return (
    <PublicPageLayout>
      <TermsOfServiceContent />
    </PublicPageLayout>
  );
}
