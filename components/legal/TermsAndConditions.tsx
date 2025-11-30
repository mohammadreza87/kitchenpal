'use client'

import { Modal } from '@/components/ui/Modal'

interface TermsAndConditionsProps {
  isOpen: boolean
  onClose: () => void
}

export function TermsAndConditions({ isOpen, onClose }: TermsAndConditionsProps) {
  const lastUpdated = 'November 30, 2025'
  const companyName = 'KitchenPal'
  const companyEmail = 'support@kitchenpal.app'
  const websiteUrl = 'kitchenpal.app'

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Terms and Conditions" size="full">
      <div className="prose prose-sm max-w-none text-foreground prose-headings:text-foreground prose-p:text-muted-foreground prose-li:text-muted-foreground prose-strong:text-foreground">
        <p className="text-sm text-muted-foreground">
          <strong>Last Updated:</strong> {lastUpdated}
        </p>

        <p>
          Welcome to {companyName}. These Terms and Conditions (&quot;Terms&quot;) govern your access to and use of our mobile application, website, and services (collectively, the &quot;Service&quot;). By accessing or using the Service, you agree to be bound by these Terms. If you do not agree, please do not use the Service.
        </p>

        <h3>1. Acceptance of Terms</h3>
        <p>
          By creating an account or using {companyName}, you confirm that you are at least 13 years of age (or the minimum age required in your jurisdiction) and have the legal capacity to enter into these Terms. If you are using the Service on behalf of an organization, you represent that you have authority to bind that organization to these Terms.
        </p>

        <h3>2. Description of Service</h3>
        <p>
          {companyName} provides a recipe discovery and meal planning platform that allows users to:
        </p>
        <ul>
          <li>Input available ingredients and receive personalized recipe suggestions</li>
          <li>Browse, save, and organize recipes</li>
          <li>Create meal plans and shopping lists</li>
          <li>Access nutritional information and dietary filters</li>
          <li>Share recipes and interact with other users</li>
        </ul>
        <p>
          We reserve the right to modify, suspend, or discontinue any aspect of the Service at any time without prior notice.
        </p>

        <h3>3. User Accounts</h3>
        <h4>3.1 Registration</h4>
        <p>
          To access certain features, you must create an account. You agree to provide accurate, current, and complete information during registration and to update such information to keep it accurate.
        </p>
        <h4>3.2 Account Security</h4>
        <p>
          You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.
        </p>
        <h4>3.3 Account Termination</h4>
        <p>
          We reserve the right to suspend or terminate your account at any time for violation of these Terms, fraudulent activity, or any other reason at our sole discretion.
        </p>

        <h3>4. User Content</h3>
        <h4>4.1 Your Content</h4>
        <p>
          You retain ownership of any content you submit, post, or display through the Service (&quot;User Content&quot;). By submitting User Content, you grant {companyName} a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, adapt, publish, and display such content for the purpose of operating and improving the Service.
        </p>
        <h4>4.2 Content Standards</h4>
        <p>You agree not to submit content that:</p>
        <ul>
          <li>Is unlawful, harmful, threatening, abusive, harassing, defamatory, or invasive of privacy</li>
          <li>Infringes any patent, trademark, copyright, or other intellectual property rights</li>
          <li>Contains viruses, malware, or other harmful code</li>
          <li>Is false, misleading, or promotes illegal activities</li>
          <li>Violates any applicable law or regulation</li>
        </ul>

        <h3>5. Intellectual Property</h3>
        <h4>5.1 Our Rights</h4>
        <p>
          The Service, including its original content, features, functionality, and design, is owned by {companyName} and protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
        </p>
        <h4>5.2 Third-Party Content</h4>
        <p>
          Recipes and content from third-party sources remain the property of their respective owners. We provide attribution where required and do not claim ownership of third-party content.
        </p>

        <h3>6. Prohibited Uses</h3>
        <p>You agree not to:</p>
        <ul>
          <li>Use the Service for any unlawful purpose or in violation of these Terms</li>
          <li>Attempt to gain unauthorized access to any part of the Service or its systems</li>
          <li>Use automated means (bots, scrapers) to access or collect data from the Service without permission</li>
          <li>Interfere with or disrupt the Service or servers connected to the Service</li>
          <li>Impersonate any person or entity or falsely state your affiliation</li>
          <li>Use the Service to send unsolicited communications (spam)</li>
          <li>Reverse engineer, decompile, or attempt to extract the source code of the Service</li>
        </ul>

        <h3>7. Health and Safety Disclaimer</h3>
        <p>
          <strong>Important:</strong> {companyName} provides recipe suggestions and nutritional information for informational purposes only. We are not a medical or nutritional authority.
        </p>
        <ul>
          <li>Always verify ingredients for allergens before preparing any recipe</li>
          <li>Consult a healthcare professional before making dietary changes, especially if you have medical conditions</li>
          <li>Nutritional information is estimated and may vary based on ingredients and preparation methods</li>
          <li>We are not responsible for adverse reactions to recipes or ingredients</li>
        </ul>

        <h3>8. Privacy</h3>
        <p>
          Your privacy is important to us. Our Privacy Policy explains how we collect, use, and protect your personal information. By using the Service, you consent to our data practices as described in the Privacy Policy.
        </p>

        <h3>9. Third-Party Services</h3>
        <p>
          The Service may contain links to or integrations with third-party websites and services. We are not responsible for the content, privacy policies, or practices of third parties. Your use of third-party services is at your own risk.
        </p>

        <h3>10. Payment Terms</h3>
        <p>
          If you subscribe to premium features:
        </p>
        <ul>
          <li>Subscription fees are billed in advance on a recurring basis</li>
          <li>You may cancel your subscription at any time; cancellation takes effect at the end of the current billing period</li>
          <li>Refunds are provided in accordance with applicable law and our refund policy</li>
          <li>We reserve the right to change subscription pricing with 30 days&apos; notice</li>
        </ul>

        <h3>11. Disclaimer of Warranties</h3>
        <p>
          THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR SECURE.
        </p>

        <h3>12. Limitation of Liability</h3>
        <p>
          TO THE MAXIMUM EXTENT PERMITTED BY LAW, {companyName.toUpperCase()} AND ITS OFFICERS, DIRECTORS, EMPLOYEES, AND AGENTS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOSS OF PROFITS, DATA, OR OTHER INTANGIBLE LOSSES, RESULTING FROM:
        </p>
        <ul>
          <li>Your use or inability to use the Service</li>
          <li>Any unauthorized access to or use of our servers and/or personal information</li>
          <li>Any interruption or cessation of transmission to or from the Service</li>
          <li>Any bugs, viruses, or other harmful code transmitted through the Service</li>
        </ul>

        <h3>13. Indemnification</h3>
        <p>
          You agree to indemnify, defend, and hold harmless {companyName} and its affiliates, officers, directors, employees, and agents from any claims, damages, losses, liabilities, and expenses (including legal fees) arising out of your use of the Service, violation of these Terms, or infringement of any third-party rights.
        </p>

        <h3>14. Modifications to Terms</h3>
        <p>
          We reserve the right to modify these Terms at any time. We will notify you of material changes by posting the updated Terms on the Service and updating the &quot;Last Updated&quot; date. Your continued use of the Service after changes are posted constitutes acceptance of the modified Terms.
        </p>

        <h3>15. Governing Law and Dispute Resolution</h3>
        <p>
          These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which {companyName} operates, without regard to conflict of law principles. Any disputes arising under these Terms shall be resolved through binding arbitration, except where prohibited by law.
        </p>

        <h3>16. Severability</h3>
        <p>
          If any provision of these Terms is found to be unenforceable or invalid, that provision shall be limited or eliminated to the minimum extent necessary, and the remaining provisions shall remain in full force and effect.
        </p>

        <h3>17. Entire Agreement</h3>
        <p>
          These Terms, together with our Privacy Policy and any other agreements expressly incorporated by reference, constitute the entire agreement between you and {companyName} regarding the Service and supersede all prior agreements and understandings.
        </p>

        <h3>18. Contact Information</h3>
        <p>
          If you have any questions about these Terms, please contact us at:
        </p>
        <ul>
          <li><strong>Email:</strong> {companyEmail}</li>
          <li><strong>Website:</strong> {websiteUrl}</li>
        </ul>

        <div className="mt-8 rounded-lg bg-muted p-4">
          <p className="text-sm">
            By clicking &quot;Accept&quot; or using our Service, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.
          </p>
        </div>
      </div>
    </Modal>
  )
}
