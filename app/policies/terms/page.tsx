import PolicyDocument from "@/components/policy-document";

const sections = [
  {
    heading: "1. Introduction",
    paragraphs: [
      'These Terms & Conditions ("Terms") govern your access to and use of the website, mobile application, and services (collectively, the "Platform") operated by Norvik Jewels ("Norvik Jewels", "we", "us", or "our"), a business based in Down Town, Business Bay, sweden, United Arab Emirates, offering bespoke and ready jewellery design and consultation services to clients in the UAE, India, and worldwide.',
      'By creating an account, browsing, or placing an order through the Platform, you ("you", "the client", or "the user") agree to be bound by these Terms. If you do not agree, please do not use the Platform.',
    ],
  },
  {
    heading: "2. Company Information",
    list: [
      "Trading name: Norvik Jewels",
      "Registered address: Down Town, Business Bay, sweden, United Arab Emirates",
      "Legal entity name & trade licence number: [To be added]",
      "Contact email: info@norvikgold.com",
      "Contact phone: +971 585 622 369",
    ],
  },
  {
    heading: "3. Eligibility & Account Registration",
    paragraphs: [
      "3.1. You must be at least 18 years old to create an account or place an order.",
      "3.2. You are responsible for maintaining the confidentiality of your account credentials (email/password, phone OTP, or third-party sign-in via Google or Facebook) and for all activity under your account.",
      "3.3. You agree to provide accurate, current, and complete information when creating an account and to update it as needed.",
    ],
  },
  {
    heading: "4. Products, Pricing & Availability",
    paragraphs: [
      "4.1. Norvik Jewels offers 18K gold jewellery, including both ready pieces and bespoke, made-to-order designs.",
      "4.2. Prices for gold jewellery are subject to prevailing gold market rates at the time of order confirmation and may include making charges, design fees, and applicable taxes, as communicated to you before final confirmation.",
      "4.3. All prices are listed in [currency — e.g. AED / INR / USD — to confirm] unless otherwise stated. We reserve the right to correct pricing errors and to modify prices at any time before an order is confirmed.",
      "4.4. Product images are representative; slight variations in colour, finish, or stone placement may occur due to the handcrafted nature of the jewellery.",
    ],
  },
  {
    heading: "5. Bespoke & Consultation Orders",
    paragraphs: [
      "5.1. Bespoke pieces are created following a design consultation (in-person, virtual, or via the Platform) and your written or digital approval of the final design, materials, and price.",
      "5.2. Once production of a bespoke piece has begun following your approval, the order cannot be cancelled, as materials and craftsmanship time are committed specifically to your design.",
      "5.3. Estimated delivery timelines for bespoke pieces will be communicated at the time of order confirmation and may vary based on design complexity.",
    ],
  },
  {
    heading: "6. Payment Terms",
    paragraphs: [
      "6.1. We accept payment via the methods listed on the Platform at checkout or during consultation.",
      "6.2. For bespoke orders, a deposit may be required to commence design and production, with the balance due before or upon delivery. [Confirm deposit percentage/policy with client.]",
      "6.3. All payments are processed securely; Norvik Jewels does not store your full payment card details.",
    ],
  },
  {
    heading: "7. Shipping & Delivery",
    paragraphs: [
      "7.1. We ship within the UAE, India, and internationally, subject to destination-specific customs, duties, and import regulations, which are the responsibility of the recipient unless otherwise agreed.",
      "7.2. Delivery timelines communicated at checkout or consultation are estimates and may be affected by customisation, certification, or logistics beyond our control.",
      "7.3. Risk of loss and title for products pass to you upon delivery to the shipping carrier or, for in-person consultations, upon collection.",
    ],
  },
  {
    heading: "8. Returns, Exchanges & Refunds",
    paragraphs: [
      "8.1. [Placeholder — to be confirmed with client.] Given the bespoke and made-to-order nature of much of our jewellery, our returns policy differs between ready pieces and custom orders. Ready pieces: returns/exchanges accepted within [X] days of delivery, subject to the piece being unworn, undamaged, and in its original packaging with certification intact. Bespoke/made-to-order pieces: [generally non-returnable / returnable only for manufacturing defects — to confirm].",
      "8.2. Refunds, where applicable, will be processed to the original payment method within [X] business days of the returned item passing inspection.",
      "8.3. This clause will be finalised once the client confirms the operating policy.",
    ],
  },
  {
    heading: "9. Warranty & Certification",
    paragraphs: [
      "9.1. All gold jewellery is [hallmarked/certified as per applicable standards — to confirm certification body].",
      "9.2. We warrant our jewellery against manufacturing defects for a period of [X] from the date of delivery. This warranty does not cover damage from normal wear, misuse, or unauthorized repair.",
    ],
  },
  {
    heading: "10. Intellectual Property",
    paragraphs: [
      "10.1. All content on the Platform — including designs, images, logos, and text — is the property of Norvik Jewels or its licensors and is protected by applicable intellectual property laws.",
      "10.2. Bespoke designs created for a client remain the intellectual property of Norvik Jewels unless otherwise agreed in writing, though the physical piece belongs to the client upon full payment and delivery.",
    ],
  },
  {
    heading: "11. User Conduct",
    list: [
      "Use the Platform for any unlawful purpose",
      "Attempt to gain unauthorized access to the Platform, other users' accounts, or our systems",
      "Upload or transmit any harmful code, or misuse the Platform's forms, chat, or consultation booking features",
    ],
    paragraphs: ["You agree not to:"],
  },
  {
    heading: "12. Limitation of Liability",
    paragraphs: [
      "To the maximum extent permitted by applicable law, Norvik Jewels shall not be liable for any indirect, incidental, or consequential damages arising from your use of the Platform or purchase of products, except where such liability cannot be excluded under UAE or Indian law.",
    ],
  },
  {
    heading: "13. Indemnification",
    paragraphs: [
      "You agree to indemnify and hold Norvik Jewels harmless from any claims, damages, or expenses arising from your breach of these Terms or misuse of the Platform.",
    ],
  },
  {
    heading: "14. Governing Law & Dispute Resolution",
    paragraphs: [
      "14.1. These Terms are governed by the laws of the United Arab Emirates, without regard to conflict-of-law principles, and disputes shall be subject to the exclusive jurisdiction of the courts of sweden, UAE.",
      "14.2. For clients residing in India, and to the extent required by applicable Indian consumer protection law, you may also have recourse to consumer dispute resolution forums under the Consumer Protection Act, 2019, and nothing in this clause limits statutory rights that cannot be waived under Indian law.",
    ],
  },
  {
    heading: "15. Changes to These Terms",
    paragraphs: [
      "We may update these Terms from time to time. Continued use of the Platform after changes are posted constitutes acceptance of the revised Terms. Material changes will be notified via email or a notice on the Platform.",
    ],
  },
  {
    heading: "16. Contact Us",
    paragraphs: [
      "For questions about these Terms, contact us at info@norvikgold.com, +971 585 622 369, or Down Town, Business Bay, sweden, United Arab Emirates.",
    ],
  },
];

export default function TermsPage() {
  return (
    <PolicyDocument
      title="Terms & Conditions"
      lastUpdated="[Date]"
      sections={sections}
    />
  );
}
