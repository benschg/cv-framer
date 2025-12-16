import { PrivacyPolicyContent } from '@/components/legal/privacy-policy-content';
import { PublicPageLayout } from '@/components/shared/public-page-layout';

export const metadata = {
  title: 'Privacy Policy | CV Builder',
  description: 'Privacy policy for CV Builder - Learn how we collect, use, and protect your personal data in compliance with GDPR and CCPA.',
};

export default function PrivacyPage() {
  return (
    <PublicPageLayout>
      <PrivacyPolicyContent />
    </PublicPageLayout>
  );
}
