import PolicyDocument from "@/components/policy-document";

const sections = [
  {
    heading: "1. Introduction",
    paragraphs: [
      'Norvik Jewels ("Norvik Jewels", "we", "us", or "our") respects your privacy and is committed to protecting your personal data. This Privacy Policy explains what information we collect through our website and mobile application (the "Platform"), how we use it, and your rights regarding it.',
      "This policy applies to visitors and registered users of the Platform, based in the UAE, India, or elsewhere.",
    ],
  },
  {
    heading: "2. Information We Collect",
    paragraphs: [
      "Information you provide directly: full name, email address, phone number, and password (encrypted); if you sign in via Google or Facebook, we receive your name, email, and profile photo as shared by that provider; consultation and order details including design preferences and delivery address; payment information processed by our third-party payment provider — Norvik Jewels does not store full card numbers on our servers.",
      "Information collected automatically: usage data (pages visited, time spent), device and log data (IP address, browser type, device identifiers), and cookies used to keep you signed in and understand Platform usage.",
    ],
  },
  {
    heading: "3. How We Use Your Information",
    list: [
      "Create and manage your account",
      "Process and fulfil orders and bespoke consultations",
      "Communicate with you about your orders, appointments, and enquiries",
      "Send updates, offers, or newsletters, where you have opted in",
      "Improve and secure the Platform",
      "Comply with legal, tax, and regulatory obligations in the UAE and India",
    ],
  },
  {
    heading: "4. Legal Basis for Processing",
    paragraphs: [
      "UAE: we process personal data in accordance with UAE Federal Decree-Law No. 45 of 2021 on the Protection of Personal Data (PDPL).",
      "India: for users in India, we process personal data in accordance with the Digital Personal Data Protection Act, 2023 (DPDPA), relying on your consent and, where applicable, legitimate business purposes such as fulfilling your order.",
    ],
  },
  {
    heading: "5. Cookies & Tracking",
    paragraphs: [
      "We use cookies and similar technologies to keep you signed in (authentication session cookies), remember your preferences, and understand how visitors use the Platform.",
      "You can control cookies through your browser settings; disabling certain cookies may affect Platform functionality, including staying signed in.",
    ],
  },
  {
    heading: "6. Third-Party Services We Use",
    paragraphs: [
      "To operate the Platform, we share limited data with the following categories of service providers, each bound by their own privacy and security practices:",
    ],
    list: [
      "Authentication & database provider (Supabase): stores your account credentials, session data, and profile information securely",
      "Google / Facebook (optional sign-in): if you choose social sign-in, these providers share your name, email, and profile photo with us per your consent",
      "Payment processor: handles payment transactions securely; we do not store full payment details",
      "SMS provider (for phone/OTP login, when enabled): used solely to deliver one-time passcodes",
      "Hosting & infrastructure provider (Vercel): hosts the Platform and processes technical/log data",
      "Analytics provider(s): [to be confirmed]",
    ],
  },
  {
    heading: "7. Data Sharing & Disclosure",
    paragraphs: ["We may disclose your information:"],
    list: [
      "To service providers listed above, strictly to operate the Platform",
      "To comply with legal obligations, court orders, or regulatory requests in the UAE, India, or other applicable jurisdictions",
      "To protect the rights, property, or safety of Norvik Jewels, our clients, or others",
      "In connection with a business transfer (e.g. merger or acquisition), with notice where required by law",
    ],
  },
  {
    heading: "8. Data Retention",
    paragraphs: [
      "We retain your personal data for as long as your account is active or as needed to provide services, comply with legal obligations (e.g. tax and financial record-keeping under UAE and Indian law), resolve disputes, and enforce our agreements. You may request deletion of your account and associated data, subject to Section 10.",
    ],
  },
  {
    heading: "9. Data Security",
    paragraphs: [
      "We implement reasonable technical and organizational measures — including encrypted password storage, secure session handling, and access controls — to protect your data. However, no method of transmission or storage is completely secure, and we cannot guarantee absolute security.",
    ],
  },
  {
    heading: "10. Your Rights",
    paragraphs: [
      "Depending on your location, you may have the right to access the personal data we hold about you, correct inaccurate or incomplete data, request deletion of your data (subject to legal retention requirements), withdraw consent for marketing communications, object to or restrict certain processing, and request a copy of your data in a portable format.",
      "To exercise these rights, contact us at info@norvikgold.com. We will respond within the timeframe required by applicable law (UAE PDPL or India\u2019s DPDPA).",
      "Grievance Officer (India): in accordance with Indian data protection requirements, users in India may direct privacy-related grievances to [Name and contact details of Grievance Officer — to be appointed], email info@norvikgold.com.",
    ],
  },
  {
    heading: "11. Children's Privacy",
    paragraphs: [
      "The Platform is not intended for individuals under 18 years of age, and we do not knowingly collect personal data from minors. If we become aware that we have inadvertently collected such data, we will take steps to delete it.",
    ],
  },
  {
    heading: "12. International Data Transfers",
    paragraphs: [
      "As Norvik Jewels serves clients in the UAE, India, and worldwide, your data may be processed or stored in countries other than your own, including where our service providers (e.g. hosting, authentication) operate their infrastructure. We take steps to ensure such transfers are protected consistent with applicable law.",
    ],
  },
  {
    heading: "13. Changes to This Policy",
    paragraphs: [
      'We may update this Privacy Policy periodically. Material changes will be communicated via email or a notice on the Platform. The "Last updated" date at the top reflects the most recent revision.',
    ],
  },
  {
    heading: "14. Contact Us",
    paragraphs: [
      "For any questions or requests regarding this Privacy Policy or your personal data: info@norvikgold.com, +971 585 622 369, Down Town, Business Bay, Dubai, United Arab Emirates.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <PolicyDocument
      title="Privacy Policy"
      lastUpdated="[Date]"
      sections={sections}
    />
  );
}
