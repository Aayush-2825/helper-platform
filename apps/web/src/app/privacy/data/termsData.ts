export interface ContentElement {
  type: 'paragraph' | 'bullet';
  text: string;
}

export interface Section {
  num: string;
  title: string;
  elements: ContentElement[];
}

export interface Chapter {
  number: number;
  title: string;
  sections: Section[];
}

export interface DocumentMetadata {
  title: string;
  subtitle: string;
  effectiveDate: string;
  version: string;
  jurisdiction: string;
  governingLaw: string;
}

export const documentMetadata: DocumentMetadata = {
  title: "TERMS OF SERVICE",
  subtitle: "Comprehensive Legal Framework for Users & Helpers",
  effectiveDate: "31 July 2026",
  version: "1.0",
  jurisdiction: "Republic of India",
  governingLaw: "Indian Law"
};

export const chaptersData: Chapter[] = [
  {
    "number": 1,
    "title": "Introduction & Acceptance of Terms",
    "sections": [
      {
        "num": "",
        "title": "Nature of the Platform",
        "elements": [
          {
            "type": "paragraph",
            "text": "Dozo is a technology marketplace that enables Users and Helpers to connect."
          },
          {
            "type": "paragraph",
            "text": "Unless expressly stated otherwise, Dozo is **not the employer, contractor, agent, partner, or representative** of any Helper."
          },
          {
            "type": "paragraph",
            "text": "Helpers provide services independently and retain control over how, when, and whether to accept service requests, subject to the standards and policies of the Platform."
          },
          {
            "type": "paragraph",
            "text": "Dozo's role is limited to facilitating bookings, communication, payment processing where applicable, and maintaining trust and safety within the Platform."
          }
        ]
      },
      {
        "num": "",
        "title": "Independent Relationship",
        "elements": [
          {
            "type": "paragraph",
            "text": "Each Helper using Dozo operates as an independent service provider."
          },
          {
            "type": "paragraph",
            "text": "Nothing contained in these Terms shall be interpreted as creating an employment relationship, agency, partnership, joint venture, franchise, or fiduciary relationship between Dozo and any Helper."
          },
          {
            "type": "paragraph",
            "text": "Helpers are solely responsible for complying with applicable tax, labour, licensing, insurance, and regulatory obligations arising from the services they provide."
          }
        ]
      },
      {
        "num": "",
        "title": "Acceptance of Future Changes",
        "elements": [
          {
            "type": "paragraph",
            "text": "Technology, laws, and business operations evolve over time."
          },
          {
            "type": "paragraph",
            "text": "Accordingly, Dozo reserves the right to modify, update, replace, or amend these Terms at any time."
          },
          {
            "type": "paragraph",
            "text": "Material changes may be communicated through the Platform, email, SMS, or other reasonable means."
          },
          {
            "type": "paragraph",
            "text": "Your continued use of the Platform after such changes become effective constitutes your acceptance of the revised Terms."
          },
          {
            "type": "paragraph",
            "text": "If you do not agree with any updated Terms, you must stop using the Platform and close your account."
          }
        ]
      },
      {
        "num": "",
        "title": "Supplemental Policies",
        "elements": [
          {
            "type": "paragraph",
            "text": "Your use of the Platform is also governed by additional policies published by Dozo, including but not limited to:"
          },
          {
            "type": "bullet",
            "text": "Privacy Policy"
          },
          {
            "type": "bullet",
            "text": "Helper Agreement"
          },
          {
            "type": "bullet",
            "text": "Cancellation & Refund Policy"
          },
          {
            "type": "bullet",
            "text": "Payments Policy"
          },
          {
            "type": "bullet",
            "text": "Community Guidelines"
          },
          {
            "type": "bullet",
            "text": "Safety Standards"
          },
          {
            "type": "bullet",
            "text": "Cookie Policy"
          },
          {
            "type": "bullet",
            "text": "Verification Policy"
          },
          {
            "type": "bullet",
            "text": "Grievance Redressal Policy"
          },
          {
            "type": "paragraph",
            "text": "These policies form an integral part of these Terms and are incorporated herein by reference."
          }
        ]
      },
      {
        "num": "",
        "title": "Compliance with Applicable Laws",
        "elements": [
          {
            "type": "paragraph",
            "text": "All Users and Helpers agree to comply with all applicable laws, rules, regulations, and governmental requirements while using the Platform."
          },
          {
            "type": "paragraph",
            "text": "Users and Helpers must not use Dozo for any unlawful, fraudulent, abusive, harmful, discriminatory, or prohibited purpose."
          },
          {
            "type": "paragraph",
            "text": "Any activity that violates applicable law or these Terms may result in immediate suspension or permanent removal from the Platform."
          }
        ]
      },
      {
        "num": "",
        "title": "Platform Availability",
        "elements": [
          {
            "type": "paragraph",
            "text": "Dozo continually works to provide reliable and uninterrupted services."
          },
          {
            "type": "paragraph",
            "text": "However, the Platform is provided on an \"as available\" and \"as is\" basis."
          },
          {
            "type": "paragraph",
            "text": "Dozo does not guarantee uninterrupted availability and may temporarily suspend or restrict access for maintenance, security improvements, technical issues, legal compliance, emergencies, or operational requirements."
          }
        ]
      },
      {
        "num": "",
        "title": "Geographic Availability",
        "elements": [
          {
            "type": "paragraph",
            "text": "Dozo currently operates only in selected cities and regions."
          },
          {
            "type": "paragraph",
            "text": "Availability of Helpers, categories, pricing, response times, and Platform features may vary depending on location."
          },
          {
            "type": "paragraph",
            "text": "Dozo reserves the right to expand, suspend, or discontinue services in any location at its sole discretion."
          }
        ]
      },
      {
        "num": "",
        "title": "Electronic Communications",
        "elements": [
          {
            "type": "paragraph",
            "text": "By creating an account, you consent to receive communications from Dozo electronically, including emails, SMS, WhatsApp messages, push notifications, phone calls, and in-app notifications regarding bookings, security, promotions, account activity, policy updates, and legal notices, subject to applicable law and your communication preferences."
          }
        ]
      },
      {
        "num": "",
        "title": "Language",
        "elements": [
          {
            "type": "paragraph",
            "text": "These Terms are prepared in the English language."
          },
          {
            "type": "paragraph",
            "text": "If Dozo provides translations for convenience, the English version shall prevail in the event of any inconsistency or conflict, unless otherwise required by applicable law."
          }
        ]
      },
      {
        "num": "",
        "title": "Contact",
        "elements": [
          {
            "type": "paragraph",
            "text": "For legal notices, policy-related questions, or concerns regarding these Terms, Users and Helpers may contact Dozo through the official support channels published on the Platform."
          },
          {
            "type": "paragraph",
            "text": "These Terms constitute a legally binding agreement between you and Dozo governing your use of the Platform."
          }
        ]
      }
    ]
  },
  {
    "number": 2,
    "title": "Definitions",
    "sections": [
      {
        "num": "2.1",
        "title": "Dozo",
        "elements": [
          {
            "type": "paragraph",
            "text": "\"Dozo\", \"Company\", \"we\", \"our\", or \"us\" refers to the owner and operator of the Dozo Platform, including its website, mobile applications, software, products, services, technology infrastructure, affiliates, successors, and permitted assigns."
          }
        ]
      },
      {
        "num": "2.2",
        "title": "Platform",
        "elements": [
          {
            "type": "paragraph",
            "text": "\"Platform\" means the Dozo website, mobile applications, software, APIs, communication systems, payment interfaces, customer support systems, and all related digital services operated by Dozo."
          }
        ]
      },
      {
        "num": "2.3",
        "title": "User",
        "elements": [
          {
            "type": "paragraph",
            "text": "A \"User\" means any individual, household, organization, or business that creates an account on Dozo or otherwise accesses or uses the Platform for the purpose of discovering, requesting, booking, purchasing, or paying for services."
          }
        ]
      },
      {
        "num": "2.4",
        "title": "Helper",
        "elements": [
          {
            "type": "paragraph",
            "text": "A \"Helper\" or \"Service Provider\" means an independent individual or business that registers on the Platform to offer services to Users."
          },
          {
            "type": "paragraph",
            "text": "A Helper is not an employee, partner, representative, franchisee, or agent of Dozo unless expressly stated in a separate written agreement."
          },
          {
            "type": "paragraph",
            "text": "Helpers remain solely responsible for the services they provide."
          }
        ]
      },
      {
        "num": "2.5",
        "title": "Services",
        "elements": [
          {
            "type": "paragraph",
            "text": "\"Services\" means any lawful service offered through the Platform, including but not limited to:"
          },
          {
            "type": "bullet",
            "text": "Home cleaning"
          },
          {
            "type": "bullet",
            "text": "Housekeeping"
          },
          {
            "type": "bullet",
            "text": "Driver services"
          },
          {
            "type": "bullet",
            "text": "Electrician services"
          },
          {
            "type": "bullet",
            "text": "Plumbing"
          },
          {
            "type": "bullet",
            "text": "Appliance repair"
          },
          {
            "type": "bullet",
            "text": "Painting"
          },
          {
            "type": "bullet",
            "text": "Carpentry"
          },
          {
            "type": "bullet",
            "text": "Beauty & wellness"
          },
          {
            "type": "bullet",
            "text": "Cooking"
          },
          {
            "type": "bullet",
            "text": "Elder care"
          },
          {
            "type": "bullet",
            "text": "Child care (subject to applicable laws)"
          },
          {
            "type": "bullet",
            "text": "Pet care"
          },
          {
            "type": "bullet",
            "text": "Laundry"
          },
          {
            "type": "bullet",
            "text": "Car washing"
          },
          {
            "type": "bullet",
            "text": "Delivery assistance"
          },
          {
            "type": "bullet",
            "text": "Event assistance"
          },
          {
            "type": "bullet",
            "text": "Moving assistance"
          },
          {
            "type": "bullet",
            "text": "Gardening"
          },
          {
            "type": "bullet",
            "text": "Home maintenance"
          },
          {
            "type": "bullet",
            "text": "Any future service category introduced by Dozo."
          },
          {
            "type": "paragraph",
            "text": "Dozo may add, remove, modify, or suspend any service category without prior notice."
          }
        ]
      },
      {
        "num": "2.6",
        "title": "Booking",
        "elements": [
          {
            "type": "paragraph",
            "text": "A \"Booking\" means a request placed by a User through the Platform for a particular service, regardless of whether the request is accepted, cancelled, completed, or otherwise terminated."
          },
          {
            "type": "paragraph",
            "text": "A Booking is considered confirmed only after acceptance by the assigned Helper or confirmation by the Platform, as applicable."
          }
        ]
      },
      {
        "num": "2.7",
        "title": "Booking Fee",
        "elements": [
          {
            "type": "paragraph",
            "text": "A \"Booking Fee\" refers to any amount payable by the User for accessing or using services through the Platform, including service charges, platform fees, taxes, convenience fees, cancellation fees, and any other applicable charges disclosed before confirmation."
          }
        ]
      },
      {
        "num": "2.8",
        "title": "Helper Earnings",
        "elements": [
          {
            "type": "paragraph",
            "text": "\"Helper Earnings\" means the amount payable to a Helper for successfully completing a Booking after deduction of applicable platform commissions, taxes, penalties (if any), or other lawful deductions disclosed by Dozo."
          }
        ]
      },
      {
        "num": "2.9",
        "title": "Content",
        "elements": [
          {
            "type": "paragraph",
            "text": "\"Content\" includes text, photographs, videos, audio, reviews, ratings, profile information, logos, trademarks, designs, documents, comments, messages, and all other information uploaded, transmitted, displayed, or otherwise made available through the Platform."
          }
        ]
      },
      {
        "num": "2.10",
        "title": "Account",
        "elements": [
          {
            "type": "paragraph",
            "text": "An \"Account\" refers to the registered profile created by a User or Helper to access the Platform."
          },
          {
            "type": "paragraph",
            "text": "Each person is generally permitted to maintain only one personal account unless Dozo expressly authorizes otherwise."
          }
        ]
      },
      {
        "num": "2.11",
        "title": "Verification",
        "elements": [
          {
            "type": "paragraph",
            "text": "\"Verification\" means any identity, address, document, qualification, license, criminal background, bank account, facial recognition, biometric, or other verification process conducted directly by Dozo or through authorized third-party verification providers."
          },
          {
            "type": "paragraph",
            "text": "Verification by Dozo does not constitute a guarantee, certification, endorsement, warranty, or assurance regarding a person's conduct, competence, integrity, or suitability."
          }
        ]
      },
      {
        "num": "2.12",
        "title": "Applicable Law",
        "elements": [
          {
            "type": "paragraph",
            "text": "\"Applicable Law\" means all laws, statutes, regulations, governmental notifications, judicial decisions, regulatory requirements, and legally binding orders applicable to the Platform, Users, Helpers, and the services offered through Dozo."
          }
        ]
      },
      {
        "num": "2.13",
        "title": "Business Day",
        "elements": [
          {
            "type": "paragraph",
            "text": "A \"Business Day\" means any day other than Saturdays, Sundays, or officially recognized public holidays in the jurisdiction where the relevant activity is being performed, unless otherwise specified."
          }
        ]
      },
      {
        "num": "2.14",
        "title": "Personal Data",
        "elements": [
          {
            "type": "paragraph",
            "text": "\"Personal Data\" means any information relating to an identified or identifiable natural person, including but not limited to name, address, phone number, email address, identification details, payment information, location information, photographs, and other information protected under applicable privacy laws."
          }
        ]
      },
      {
        "num": "2.15",
        "title": "Confidential Information",
        "elements": [
          {
            "type": "paragraph",
            "text": "\"Confidential Information\" means any non-public business, financial, technical, operational, commercial, customer, pricing, product, or proprietary information belonging to Dozo, Users, or Helpers that is disclosed through or in connection with the Platform."
          }
        ]
      },
      {
        "num": "2.16",
        "title": "Intellectual Property",
        "elements": [
          {
            "type": "paragraph",
            "text": "\"Intellectual Property\" includes copyrights, trademarks, service marks, logos, trade dress, domain names, patents, designs, databases, source code, software, business methods, trade secrets, know-how, and all other proprietary rights recognized under applicable law."
          }
        ]
      },
      {
        "num": "2.17",
        "title": "Prohibited Conduct",
        "elements": [
          {
            "type": "paragraph",
            "text": "\"Prohibited Conduct\" means any activity that violates these Terms, applicable law, public policy, community guidelines, or the legitimate interests of Dozo, Users, Helpers, or third parties."
          }
        ]
      },
      {
        "num": "2.18",
        "title": "Force Majeure Event",
        "elements": [
          {
            "type": "paragraph",
            "text": "A \"Force Majeure Event\" includes any event beyond the reasonable control of Dozo, including but not limited to:"
          },
          {
            "type": "bullet",
            "text": "Natural disasters"
          },
          {
            "type": "bullet",
            "text": "Floods"
          },
          {
            "type": "bullet",
            "text": "Earthquakes"
          },
          {
            "type": "bullet",
            "text": "Fires"
          },
          {
            "type": "bullet",
            "text": "Epidemics"
          },
          {
            "type": "bullet",
            "text": "Pandemics"
          },
          {
            "type": "bullet",
            "text": "War"
          },
          {
            "type": "bullet",
            "text": "Terrorism"
          },
          {
            "type": "bullet",
            "text": "Civil unrest"
          },
          {
            "type": "bullet",
            "text": "Government restrictions"
          },
          {
            "type": "bullet",
            "text": "Internet failures"
          },
          {
            "type": "bullet",
            "text": "Telecommunications outages"
          },
          {
            "type": "bullet",
            "text": "Cyberattacks"
          },
          {
            "type": "bullet",
            "text": "Power failures"
          },
          {
            "type": "bullet",
            "text": "Labour strikes"
          },
          {
            "type": "bullet",
            "text": "Acts of God"
          },
          {
            "type": "bullet",
            "text": "Court orders"
          },
          {
            "type": "bullet",
            "text": "Any other unforeseen event preventing normal operations."
          }
        ]
      },
      {
        "num": "2.19",
        "title": "Third-Party Services",
        "elements": [
          {
            "type": "paragraph",
            "text": "\"Third-Party Services\" means products, payment gateways, mapping services, communication tools, identity verification providers, analytics providers, cloud infrastructure providers, or any other external service integrated with the Platform."
          },
          {
            "type": "paragraph",
            "text": "Dozo is not responsible for the independent acts or omissions of such third parties except to the extent required by applicable law."
          }
        ]
      },
      {
        "num": "2.20",
        "title": "Interpretation",
        "elements": [
          {
            "type": "paragraph",
            "text": "Unless the context otherwise requires:"
          },
          {
            "type": "bullet",
            "text": "Words importing the singular include the plural and vice versa."
          },
          {
            "type": "bullet",
            "text": "References to one gender include all genders."
          },
          {
            "type": "bullet",
            "text": "Headings are for convenience only and do not affect interpretation."
          },
          {
            "type": "bullet",
            "text": "The words \"including\", \"includes\", and \"such as\" shall be interpreted to mean \"including without limitation.\""
          },
          {
            "type": "bullet",
            "text": "References to statutes include any amendments, modifications, or replacements thereof."
          },
          {
            "type": "paragraph",
            "text": "These definitions apply throughout all Dozo legal documents unless expressly stated otherwise."
          }
        ]
      }
    ]
  },
  {
    "number": 3,
    "title": "Eligibility & Account Registration",
    "sections": [
      {
        "num": "3.1",
        "title": "Eligibility to Use the Platform",
        "elements": [
          {
            "type": "paragraph",
            "text": "To create an account or use the Dozo Platform, you must:"
          },
          {
            "type": "bullet",
            "text": "Be at least **18 years of age**, or the age of majority in your jurisdiction, whichever is higher."
          },
          {
            "type": "bullet",
            "text": "Have the legal capacity to enter into a binding contract under applicable law."
          },
          {
            "type": "bullet",
            "text": "Comply with these Terms of Service and all applicable laws."
          },
          {
            "type": "bullet",
            "text": "Not be prohibited from using the Platform by any applicable law, court order, or regulatory authority."
          },
          {
            "type": "paragraph",
            "text": "By registering or using Dozo, you represent and warrant that you satisfy these eligibility requirements."
          }
        ]
      },
      {
        "num": "3.2",
        "title": "Accounts for Minors",
        "elements": [
          {
            "type": "paragraph",
            "text": "Individuals under the age of 18 may only access services through the account of a parent or legal guardian."
          },
          {
            "type": "paragraph",
            "text": "The parent or guardian is solely responsible for all activities carried out through such account."
          },
          {
            "type": "paragraph",
            "text": "Dozo reserves the right to suspend or terminate any account found to be operated independently by a minor."
          }
        ]
      },
      {
        "num": "3.3",
        "title": "Account Registration",
        "elements": [
          {
            "type": "paragraph",
            "text": "To access certain features of the Platform, you must create a Dozo account."
          },
          {
            "type": "paragraph",
            "text": "During registration, you may be required to provide:"
          },
          {
            "type": "bullet",
            "text": "Full legal name"
          },
          {
            "type": "bullet",
            "text": "Mobile number"
          },
          {
            "type": "bullet",
            "text": "Email address (if applicable)"
          },
          {
            "type": "bullet",
            "text": "Residential or business address"
          },
          {
            "type": "bullet",
            "text": "Profile photograph (optional or mandatory depending on account type)"
          },
          {
            "type": "bullet",
            "text": "Government-issued identification where required"
          },
          {
            "type": "bullet",
            "text": "Additional information reasonably requested by Dozo"
          },
          {
            "type": "paragraph",
            "text": "You agree that all information submitted is true, accurate, complete, and up to date."
          }
        ]
      },
      {
        "num": "3.4",
        "title": "OTP and Identity Verification",
        "elements": [
          {
            "type": "paragraph",
            "text": "Dozo may verify your identity through one or more methods, including:"
          },
          {
            "type": "bullet",
            "text": "One-Time Password (OTP) verification"
          },
          {
            "type": "bullet",
            "text": "Email verification"
          },
          {
            "type": "bullet",
            "text": "Government-issued identification"
          },
          {
            "type": "bullet",
            "text": "Selfie or facial verification"
          },
          {
            "type": "bullet",
            "text": "Bank account verification"
          },
          {
            "type": "bullet",
            "text": "Address verification"
          },
          {
            "type": "bullet",
            "text": "Business registration documents"
          },
          {
            "type": "bullet",
            "text": "Other lawful verification methods"
          },
          {
            "type": "paragraph",
            "text": "Verification helps maintain the safety and integrity of the Platform but does not constitute a guarantee of any person's identity, reliability, or conduct."
          }
        ]
      },
      {
        "num": "3.5",
        "title": "Helper Verification",
        "elements": [
          {
            "type": "paragraph",
            "text": "Before accepting Bookings, Helpers may be required to complete additional verification, which may include:"
          },
          {
            "type": "bullet",
            "text": "Government-issued identity proof"
          },
          {
            "type": "bullet",
            "text": "Address proof"
          },
          {
            "type": "bullet",
            "text": "Recent photograph"
          },
          {
            "type": "bullet",
            "text": "Bank account verification"
          },
          {
            "type": "bullet",
            "text": "PAN details"
          },
          {
            "type": "bullet",
            "text": "GST registration (where applicable)"
          },
          {
            "type": "bullet",
            "text": "Professional licences or certifications (where required)"
          },
          {
            "type": "bullet",
            "text": "Police verification or background checks where permitted by law"
          },
          {
            "type": "bullet",
            "text": "Experience or skill verification for selected service categories"
          },
          {
            "type": "paragraph",
            "text": "Failure to complete required verification may limit or prevent access to certain features or service categories."
          }
        ]
      },
      {
        "num": "3.6",
        "title": "Accuracy of Information",
        "elements": [
          {
            "type": "paragraph",
            "text": "You are responsible for ensuring that all information associated with your account remains accurate and current."
          },
          {
            "type": "paragraph",
            "text": "Providing false, misleading, fraudulent, or outdated information may result in:"
          },
          {
            "type": "bullet",
            "text": "Temporary suspension"
          },
          {
            "type": "bullet",
            "text": "Permanent account termination"
          },
          {
            "type": "bullet",
            "text": "Cancellation of Bookings"
          },
          {
            "type": "bullet",
            "text": "Withholding of payments where legally permitted"
          },
          {
            "type": "bullet",
            "text": "Reporting to relevant authorities where required by law"
          }
        ]
      },
      {
        "num": "3.7",
        "title": "One Account Policy",
        "elements": [
          {
            "type": "paragraph",
            "text": "Unless expressly authorized by Dozo:"
          },
          {
            "type": "bullet",
            "text": "Each individual may maintain only one personal User account."
          },
          {
            "type": "bullet",
            "text": "Each Helper may maintain only one active Helper account."
          },
          {
            "type": "bullet",
            "text": "Creating duplicate, fake, or impersonation accounts is prohibited."
          },
          {
            "type": "paragraph",
            "text": "Dozo reserves the right to merge, suspend, or permanently remove duplicate accounts."
          }
        ]
      },
      {
        "num": "3.8",
        "title": "Business Accounts",
        "elements": [
          {
            "type": "paragraph",
            "text": "Businesses, organizations, and commercial entities may register for business-related services where such functionality is made available."
          },
          {
            "type": "paragraph",
            "text": "The person creating the account represents and warrants that they have the authority to bind the organization to these Terms."
          }
        ]
      },
      {
        "num": "3.9",
        "title": "Account Security",
        "elements": [
          {
            "type": "paragraph",
            "text": "You are solely responsible for maintaining the confidentiality of your account credentials, including passwords, OTPs, and verification codes."
          },
          {
            "type": "paragraph",
            "text": "You must not:"
          },
          {
            "type": "bullet",
            "text": "Share your account with another person."
          },
          {
            "type": "bullet",
            "text": "Allow unauthorized access to your account."
          },
          {
            "type": "bullet",
            "text": "Disclose OTPs or passwords to anyone, including individuals claiming to represent Dozo."
          },
          {
            "type": "bullet",
            "text": "Use another person's account without authorization."
          },
          {
            "type": "paragraph",
            "text": "All activities carried out through your account will be deemed to have been performed by you unless you promptly notify Dozo of unauthorized access."
          }
        ]
      },
      {
        "num": "3.10",
        "title": "Lost Devices and Unauthorized Access",
        "elements": [
          {
            "type": "paragraph",
            "text": "If you believe your account has been compromised, you must immediately:"
          },
          {
            "type": "bullet",
            "text": "Change your password (if applicable)."
          },
          {
            "type": "bullet",
            "text": "Log out of all active sessions where available."
          },
          {
            "type": "bullet",
            "text": "Notify Dozo through official support channels."
          },
          {
            "type": "bullet",
            "text": "Cooperate with any security investigation conducted by Dozo."
          },
          {
            "type": "paragraph",
            "text": "Dozo may temporarily suspend your account while investigating suspected unauthorized activity."
          }
        ]
      },
      {
        "num": "3.11",
        "title": "Device and Network Security",
        "elements": [
          {
            "type": "paragraph",
            "text": "Users and Helpers are responsible for maintaining the security of the devices used to access the Platform."
          },
          {
            "type": "paragraph",
            "text": "Dozo is not responsible for losses arising from:"
          },
          {
            "type": "bullet",
            "text": "Malware or viruses on your device"
          },
          {
            "type": "bullet",
            "text": "Weak passwords"
          },
          {
            "type": "bullet",
            "text": "Phishing attacks"
          },
          {
            "type": "bullet",
            "text": "SIM swap fraud"
          },
          {
            "type": "bullet",
            "text": "Unauthorized access caused by your negligence"
          }
        ]
      },
      {
        "num": "3.12",
        "title": "Communication Consent",
        "elements": [
          {
            "type": "paragraph",
            "text": "By registering an account, you consent to receive communications relating to:"
          },
          {
            "type": "bullet",
            "text": "Booking confirmations"
          },
          {
            "type": "bullet",
            "text": "OTPs and security alerts"
          },
          {
            "type": "bullet",
            "text": "Payment notifications"
          },
          {
            "type": "bullet",
            "text": "Service updates"
          },
          {
            "type": "bullet",
            "text": "Customer support"
          },
          {
            "type": "bullet",
            "text": "Legal notices"
          },
          {
            "type": "bullet",
            "text": "Policy changes"
          },
          {
            "type": "bullet",
            "text": "Promotional communications (subject to your preferences and applicable law)"
          },
          {
            "type": "paragraph",
            "text": "You may opt out of promotional communications where permitted, but essential service-related communications may continue."
          }
        ]
      },
      {
        "num": "3.13",
        "title": "Right to Refuse Registration",
        "elements": [
          {
            "type": "paragraph",
            "text": "Dozo reserves the right, at its sole discretion and in accordance with applicable law, to refuse, suspend, restrict, or terminate any account where there is a reasonable belief of:"
          },
          {
            "type": "bullet",
            "text": "Fraudulent activity"
          },
          {
            "type": "bullet",
            "text": "Identity theft"
          },
          {
            "type": "bullet",
            "text": "Misrepresentation"
          },
          {
            "type": "bullet",
            "text": "Abuse of the Platform"
          },
          {
            "type": "bullet",
            "text": "Violation of these Terms"
          },
          {
            "type": "bullet",
            "text": "Safety concerns"
          },
          {
            "type": "bullet",
            "text": "Repeated customer complaints"
          },
          {
            "type": "bullet",
            "text": "Repeated Helper misconduct"
          },
          {
            "type": "bullet",
            "text": "Illegal activity"
          },
          {
            "type": "bullet",
            "text": "Attempts to circumvent Platform policies"
          },
          {
            "type": "paragraph",
            "text": "Where appropriate, Dozo may provide the affected individual with an opportunity to respond before taking permanent action."
          }
        ]
      },
      {
        "num": "3.14",
        "title": "No Transfer of Accounts",
        "elements": [
          {
            "type": "paragraph",
            "text": "Accounts are personal and non-transferable."
          },
          {
            "type": "paragraph",
            "text": "You may not:"
          },
          {
            "type": "bullet",
            "text": "Sell your account."
          },
          {
            "type": "bullet",
            "text": "Transfer your account to another person."
          },
          {
            "type": "bullet",
            "text": "Rent your account."
          },
          {
            "type": "bullet",
            "text": "Allow another person to operate your account on your behalf without Dozo's prior written approval."
          },
          {
            "type": "paragraph",
            "text": "Any unauthorized transfer may result in immediate account suspension."
          }
        ]
      },
      {
        "num": "3.15",
        "title": "Deactivation by the User",
        "elements": [
          {
            "type": "paragraph",
            "text": "Users and Helpers may request account deletion or deactivation through the Platform or by contacting Dozo Support."
          },
          {
            "type": "paragraph",
            "text": "Certain information may be retained after account closure where required:"
          },
          {
            "type": "bullet",
            "text": "By applicable law."
          },
          {
            "type": "bullet",
            "text": "For fraud prevention."
          },
          {
            "type": "bullet",
            "text": "For dispute resolution."
          },
          {
            "type": "bullet",
            "text": "For tax, accounting, or regulatory obligations."
          },
          {
            "type": "bullet",
            "text": "To enforce these Terms."
          },
          {
            "type": "paragraph",
            "text": "The retention and deletion of personal data will be governed by the Dozo Privacy Policy and applicable privacy laws."
          }
        ]
      },
      {
        "num": "3.16",
        "title": "Account Ownership",
        "elements": [
          {
            "type": "paragraph",
            "text": "The account remains associated with the individual or business that originally registered it."
          },
          {
            "type": "paragraph",
            "text": "Dozo retains the right to verify ownership at any time and may require additional documentation before restoring access to an account where ownership is disputed."
          }
        ]
      },
      {
        "num": "3.17",
        "title": "Survival of Obligations",
        "elements": [
          {
            "type": "paragraph",
            "text": "Termination or deactivation of an account does not affect obligations that arose before termination, including payment obligations, dispute resolution provisions, confidentiality obligations, intellectual property protections, and any clauses that by their nature are intended to survive termination."
          },
          {
            "type": "paragraph",
            "text": "By creating and maintaining an account on Dozo, you acknowledge that compliance with this Chapter is essential to maintaining a safe, secure, and trustworthy marketplace for all Users and Helpers."
          }
        ]
      }
    ]
  },
  {
    "number": 4,
    "title": "About Dozo & Marketplace Relationship",
    "sections": [
      {
        "num": "4.1",
        "title": "About Dozo",
        "elements": [
          {
            "type": "paragraph",
            "text": "Dozo is a technology-enabled marketplace that connects individuals, households, and businesses (\"Users\") with independent service providers (\"Helpers\") for the purpose of discovering, booking, scheduling, and paying for on-demand services."
          },
          {
            "type": "paragraph",
            "text": "Dozo provides the digital infrastructure that facilitates these interactions, including account management, service discovery, booking tools, communication features, payment facilitation (where applicable), customer support, trust and safety features, and related technology services."
          }
        ]
      },
      {
        "num": "4.2",
        "title": "Nature of the Platform",
        "elements": [
          {
            "type": "paragraph",
            "text": "Dozo operates as an **intermediary technology platform**."
          },
          {
            "type": "paragraph",
            "text": "Except where expressly stated in writing, Dozo **does not itself provide** home services, repair services, transportation, caregiving, cleaning, maintenance, beauty services, delivery services, or any other services listed on the Platform."
          },
          {
            "type": "paragraph",
            "text": "The actual services are performed by independent Helpers who choose whether to accept bookings made through Dozo."
          }
        ]
      },
      {
        "num": "4.3",
        "title": "Independent Service Providers",
        "elements": [
          {
            "type": "paragraph",
            "text": "All Helpers using Dozo act as **independent service providers**."
          },
          {
            "type": "paragraph",
            "text": "Nothing in these Terms shall be interpreted as creating:"
          },
          {
            "type": "bullet",
            "text": "An employment relationship;"
          },
          {
            "type": "bullet",
            "text": "A partnership;"
          },
          {
            "type": "bullet",
            "text": "A joint venture;"
          },
          {
            "type": "bullet",
            "text": "A franchise;"
          },
          {
            "type": "bullet",
            "text": "An agency relationship; or"
          },
          {
            "type": "bullet",
            "text": "A fiduciary relationship"
          },
          {
            "type": "paragraph",
            "text": "between Dozo and any Helper."
          },
          {
            "type": "paragraph",
            "text": "Helpers retain control over how they perform services, subject to applicable law and Dozo's quality, safety, and community standards."
          }
        ]
      },
      {
        "num": "4.4",
        "title": "No Employment Relationship",
        "elements": [
          {
            "type": "paragraph",
            "text": "Helpers are **not employees** of Dozo."
          },
          {
            "type": "paragraph",
            "text": "Accordingly, Helpers are solely responsible for, where applicable:"
          },
          {
            "type": "bullet",
            "text": "Taxes;"
          },
          {
            "type": "bullet",
            "text": "Social security or labour law obligations;"
          },
          {
            "type": "bullet",
            "text": "Professional licences and permits;"
          },
          {
            "type": "bullet",
            "text": "Insurance;"
          },
          {
            "type": "bullet",
            "text": "Business registrations;"
          },
          {
            "type": "bullet",
            "text": "Equipment and tools;"
          },
          {
            "type": "bullet",
            "text": "Compliance with applicable laws."
          },
          {
            "type": "paragraph",
            "text": "Nothing contained on the Platform shall be construed as creating employer-employee rights or obligations between Dozo and any Helper."
          }
        ]
      },
      {
        "num": "4.5",
        "title": "User-Helper Relationship",
        "elements": [
          {
            "type": "paragraph",
            "text": "When a Booking is accepted, the service relationship exists primarily between the User and the Helper."
          },
          {
            "type": "paragraph",
            "text": "Dozo facilitates the transaction but is not a party to the underlying service contract except to the extent required by applicable law."
          },
          {
            "type": "paragraph",
            "text": "Dozo may assist with customer support, payment processing, or dispute resolution, but such assistance does not change the independent nature of the User-Helper relationship."
          }
        ]
      },
      {
        "num": "4.6",
        "title": "Scope of Dozo's Responsibilities",
        "elements": [
          {
            "type": "paragraph",
            "text": "Dozo may, from time to time:"
          },
          {
            "type": "bullet",
            "text": "Enable Users to search for Helpers."
          },
          {
            "type": "bullet",
            "text": "Display service categories and estimated pricing."
          },
          {
            "type": "bullet",
            "text": "Facilitate bookings."
          },
          {
            "type": "bullet",
            "text": "Process or facilitate payments."
          },
          {
            "type": "bullet",
            "text": "Verify certain information provided by Helpers."
          },
          {
            "type": "bullet",
            "text": "Maintain trust and safety systems."
          },
          {
            "type": "bullet",
            "text": "Offer customer support."
          },
          {
            "type": "bullet",
            "text": "Investigate complaints."
          },
          {
            "type": "bullet",
            "text": "Suspend or remove accounts that violate Platform policies."
          },
          {
            "type": "bullet",
            "text": "Introduce new products, features, or services."
          },
          {
            "type": "paragraph",
            "text": "The availability of any feature may vary by location, service category, or operational requirements."
          }
        ]
      },
      {
        "num": "4.7",
        "title": "What Dozo Does Not Guarantee",
        "elements": [
          {
            "type": "paragraph",
            "text": "While Dozo strives to maintain a reliable and trustworthy marketplace, Dozo does not guarantee:"
          },
          {
            "type": "bullet",
            "text": "That every Booking request will be accepted."
          },
          {
            "type": "bullet",
            "text": "Continuous availability of the Platform."
          },
          {
            "type": "bullet",
            "text": "Availability of Helpers in every location."
          },
          {
            "type": "bullet",
            "text": "Specific response times."
          },
          {
            "type": "bullet",
            "text": "Completion of every Booking."
          },
          {
            "type": "bullet",
            "text": "That a Helper will always meet a User's expectations."
          },
          {
            "type": "bullet",
            "text": "That a User will always meet a Helper's expectations."
          },
          {
            "type": "bullet",
            "text": "Error-free operation of the Platform."
          },
          {
            "type": "bullet",
            "text": "Uninterrupted access to the Platform."
          },
          {
            "type": "paragraph",
            "text": "To the fullest extent permitted by applicable law, all services are provided on an \"as available\" and \"as is\" basis."
          }
        ]
      },
      {
        "num": "4.8",
        "title": "Verification and Trust",
        "elements": [
          {
            "type": "paragraph",
            "text": "Dozo may verify certain information submitted by Helpers or Users, including identity, contact details, bank accounts, qualifications, licences, certifications, or other documents."
          },
          {
            "type": "paragraph",
            "text": "However, verification does not constitute a guarantee, endorsement, certification, warranty, or representation regarding:"
          },
          {
            "type": "bullet",
            "text": "Character;"
          },
          {
            "type": "bullet",
            "text": "Integrity;"
          },
          {
            "type": "bullet",
            "text": "Professional competence;"
          },
          {
            "type": "bullet",
            "text": "Reliability;"
          },
          {
            "type": "bullet",
            "text": "Safety; or"
          },
          {
            "type": "bullet",
            "text": "Future conduct."
          },
          {
            "type": "paragraph",
            "text": "Users should exercise reasonable judgment when interacting with Helpers, and Helpers should exercise reasonable judgment when accepting Bookings."
          }
        ]
      },
      {
        "num": "4.9",
        "title": "Ratings and Reviews",
        "elements": [
          {
            "type": "paragraph",
            "text": "The Platform may allow Users and Helpers to rate and review one another following completion of a Booking."
          },
          {
            "type": "paragraph",
            "text": "Ratings and reviews help improve the quality and transparency of the marketplace."
          },
          {
            "type": "paragraph",
            "text": "Users and Helpers agree that reviews must be:"
          },
          {
            "type": "bullet",
            "text": "Honest;"
          },
          {
            "type": "bullet",
            "text": "Accurate;"
          },
          {
            "type": "bullet",
            "text": "Based on genuine experiences;"
          },
          {
            "type": "bullet",
            "text": "Free from harassment, discrimination, or abusive language."
          },
          {
            "type": "paragraph",
            "text": "Dozo reserves the right to remove or moderate reviews that violate these Terms or applicable law."
          }
        ]
      },
      {
        "num": "4.10",
        "title": "Platform Standards",
        "elements": [
          {
            "type": "paragraph",
            "text": "Dozo may establish operational standards relating to:"
          },
          {
            "type": "bullet",
            "text": "Professional conduct;"
          },
          {
            "type": "bullet",
            "text": "Safety;"
          },
          {
            "type": "bullet",
            "text": "Service quality;"
          },
          {
            "type": "bullet",
            "text": "Communication;"
          },
          {
            "type": "bullet",
            "text": "Response times;"
          },
          {
            "type": "bullet",
            "text": "Verification;"
          },
          {
            "type": "bullet",
            "text": "Customer experience;"
          },
          {
            "type": "bullet",
            "text": "Community behaviour."
          },
          {
            "type": "paragraph",
            "text": "Failure to comply with these standards may result in warnings, temporary restrictions, suspension, or permanent removal from the Platform."
          }
        ]
      },
      {
        "num": "4.11",
        "title": "Pricing Information",
        "elements": [
          {
            "type": "paragraph",
            "text": "Prices displayed on the Platform may include:"
          },
          {
            "type": "bullet",
            "text": "Service charges;"
          },
          {
            "type": "bullet",
            "text": "Platform fees;"
          },
          {
            "type": "bullet",
            "text": "Taxes;"
          },
          {
            "type": "bullet",
            "text": "Convenience fees; and"
          },
          {
            "type": "bullet",
            "text": "Other applicable charges."
          },
          {
            "type": "paragraph",
            "text": "Final pricing may vary based on factors such as service duration, additional work requested, location, applicable taxes, surge pricing (if introduced), or other disclosed pricing components."
          },
          {
            "type": "paragraph",
            "text": "Users will be shown the applicable charges before confirming a Booking, except where additional services are requested during or after the Booking."
          }
        ]
      },
      {
        "num": "4.12",
        "title": "Availability of Services",
        "elements": [
          {
            "type": "paragraph",
            "text": "Dozo may add, modify, suspend, or discontinue:"
          },
          {
            "type": "bullet",
            "text": "Service categories;"
          },
          {
            "type": "bullet",
            "text": "Geographic coverage;"
          },
          {
            "type": "bullet",
            "text": "Features;"
          },
          {
            "type": "bullet",
            "text": "Promotional offers;"
          },
          {
            "type": "bullet",
            "text": "Pricing models;"
          },
          {
            "type": "bullet",
            "text": "Eligibility criteria; or"
          },
          {
            "type": "bullet",
            "text": "Operational policies,"
          },
          {
            "type": "paragraph",
            "text": "at its reasonable discretion and in accordance with applicable law."
          }
        ]
      },
      {
        "num": "4.13",
        "title": "Third-Party Services",
        "elements": [
          {
            "type": "paragraph",
            "text": "The Platform may integrate with third-party services, including payment gateways, mapping services, communication providers, identity verification providers, analytics services, and cloud infrastructure."
          },
          {
            "type": "paragraph",
            "text": "Dozo is not responsible for the independent acts, omissions, or service interruptions of such third parties, except to the extent required by applicable law."
          }
        ]
      },
      {
        "num": "4.14",
        "title": "Customer Support and Dispute Facilitation",
        "elements": [
          {
            "type": "paragraph",
            "text": "Dozo may provide customer support to assist Users and Helpers with issues relating to Bookings, payments, cancellations, or Platform use."
          },
          {
            "type": "paragraph",
            "text": "Where disputes arise between a User and a Helper, Dozo may:"
          },
          {
            "type": "bullet",
            "text": "Collect information from both parties;"
          },
          {
            "type": "bullet",
            "text": "Review relevant evidence;"
          },
          {
            "type": "bullet",
            "text": "Facilitate communication;"
          },
          {
            "type": "bullet",
            "text": "Recommend a resolution; or"
          },
          {
            "type": "bullet",
            "text": "Take action under Platform policies."
          },
          {
            "type": "paragraph",
            "text": "Unless required by law or expressly stated otherwise, Dozo is not obligated to adjudicate every dispute or guarantee any particular outcome."
          }
        ]
      },
      {
        "num": "4.15",
        "title": "Platform Integrity",
        "elements": [
          {
            "type": "paragraph",
            "text": "To protect the integrity of the marketplace, Dozo reserves the right to:"
          },
          {
            "type": "bullet",
            "text": "Investigate suspected fraud or abuse;"
          },
          {
            "type": "bullet",
            "text": "Monitor compliance with these Terms;"
          },
          {
            "type": "bullet",
            "text": "Restrict or suspend access where reasonably necessary;"
          },
          {
            "type": "bullet",
            "text": "Remove unlawful or inappropriate content;"
          },
          {
            "type": "bullet",
            "text": "Cancel Bookings affected by fraud, technical errors, or safety concerns; and"
          },
          {
            "type": "bullet",
            "text": "Cooperate with law enforcement or regulatory authorities where required by law."
          },
          {
            "type": "paragraph",
            "text": "Such actions will be taken in a fair, proportionate, and non-discriminatory manner."
          }
        ]
      },
      {
        "num": "4.16",
        "title": "No Exclusive Relationship",
        "elements": [
          {
            "type": "paragraph",
            "text": "Nothing in these Terms prevents Users from obtaining services outside the Platform or Helpers from offering their services through other lawful channels, unless otherwise agreed in a separate written agreement."
          },
          {
            "type": "paragraph",
            "text": "However, Users and Helpers must not misuse confidential information, interfere with the Platform, or engage in conduct that circumvents Dozo's legitimate business interests in violation of these Terms or any applicable agreement."
          }
        ]
      },
      {
        "num": "4.17",
        "title": "Commitment to a Trusted Marketplace",
        "elements": [
          {
            "type": "paragraph",
            "text": "Dozo is committed to building a marketplace founded on trust, transparency, fairness, and respect."
          },
          {
            "type": "paragraph",
            "text": "Users, Helpers, and Dozo each play an important role in maintaining a safe, reliable, and professional platform."
          },
          {
            "type": "paragraph",
            "text": "By using Dozo, all parties agree to act in good faith, comply with these Terms, and contribute to a positive experience for the entire community."
          }
        ]
      }
    ]
  },
  {
    "number": 5,
    "title": "User Accounts, Bookings & Platform Usage",
    "sections": [
      {
        "num": "5.1",
        "title": "Access to the Platform",
        "elements": [
          {
            "type": "paragraph",
            "text": "Registered Users may use the Dozo Platform to browse available service categories, compare service information, request Bookings, communicate through approved Platform channels, make payments, access booking history, and use other features made available by Dozo."
          },
          {
            "type": "paragraph",
            "text": "Access to certain features may vary depending on location, service category, account verification status, or technical availability."
          }
        ]
      },
      {
        "num": "5.2",
        "title": "Requesting a Booking",
        "elements": [
          {
            "type": "paragraph",
            "text": "A User may submit a Booking request by selecting the desired service, location, preferred schedule, and any additional information requested by the Platform."
          },
          {
            "type": "paragraph",
            "text": "Submission of a Booking request does **not** guarantee that a Helper will be available or that the request will be accepted."
          },
          {
            "type": "paragraph",
            "text": "A Booking becomes confirmed only when:"
          },
          {
            "type": "bullet",
            "text": "A Helper accepts the request; or"
          },
          {
            "type": "bullet",
            "text": "The Platform otherwise confirms the Booking."
          },
          {
            "type": "paragraph",
            "text": "Until confirmation, Dozo may modify or withdraw the Booking request due to availability, pricing updates, technical issues, safety concerns, or other operational reasons."
          }
        ]
      },
      {
        "num": "5.3",
        "title": "Accurate Booking Information",
        "elements": [
          {
            "type": "paragraph",
            "text": "Users must provide complete and accurate information when requesting a Booking, including, where applicable:"
          },
          {
            "type": "bullet",
            "text": "Service location;"
          },
          {
            "type": "bullet",
            "text": "Contact information;"
          },
          {
            "type": "bullet",
            "text": "Preferred time and date;"
          },
          {
            "type": "bullet",
            "text": "Description of the work required;"
          },
          {
            "type": "bullet",
            "text": "Special instructions;"
          },
          {
            "type": "bullet",
            "text": "Access requirements; and"
          },
          {
            "type": "bullet",
            "text": "Any known safety risks."
          },
          {
            "type": "paragraph",
            "text": "Dozo and the assigned Helper may rely on the information provided. Incorrect or misleading information may result in delays, additional charges, cancellation, or refusal of service."
          }
        ]
      },
      {
        "num": "5.4",
        "title": "Access to the Service Location",
        "elements": [
          {
            "type": "paragraph",
            "text": "Users are responsible for ensuring that the Helper can reasonably access the service location at the scheduled time."
          },
          {
            "type": "paragraph",
            "text": "Where applicable, Users must:"
          },
          {
            "type": "bullet",
            "text": "Be present or arrange for an authorized adult to be present."
          },
          {
            "type": "bullet",
            "text": "Provide any required entry permissions."
          },
          {
            "type": "bullet",
            "text": "Ensure pets are appropriately managed where necessary."
          },
          {
            "type": "bullet",
            "text": "Inform the Helper of known hazards."
          },
          {
            "type": "bullet",
            "text": "Provide a reasonably safe working environment."
          },
          {
            "type": "paragraph",
            "text": "If access cannot be obtained within a reasonable waiting period, the Booking may be cancelled and applicable cancellation charges may apply."
          }
        ]
      },
      {
        "num": "5.5",
        "title": "Safe Working Environment",
        "elements": [
          {
            "type": "paragraph",
            "text": "Users must provide a safe, respectful, and lawful environment for Helpers."
          },
          {
            "type": "paragraph",
            "text": "Users must not require or encourage a Helper to:"
          },
          {
            "type": "bullet",
            "text": "Perform illegal activities."
          },
          {
            "type": "bullet",
            "text": "Enter unsafe premises without reasonable precautions."
          },
          {
            "type": "bullet",
            "text": "Handle hazardous materials unless expressly agreed and legally permitted."
          },
          {
            "type": "bullet",
            "text": "Perform tasks outside the agreed scope without mutual consent."
          },
          {
            "type": "bullet",
            "text": "Work in conditions that pose an unreasonable risk to health or safety."
          },
          {
            "type": "paragraph",
            "text": "Helpers may decline or discontinue services where they reasonably believe that continuing would endanger their safety or violate applicable law."
          }
        ]
      },
      {
        "num": "5.6",
        "title": "Changes to the Scope of Work",
        "elements": [
          {
            "type": "paragraph",
            "text": "If a User requests additional work that materially changes the original Booking, the Helper may:"
          },
          {
            "type": "bullet",
            "text": "Accept the additional work;"
          },
          {
            "type": "bullet",
            "text": "Decline the request; or"
          },
          {
            "type": "bullet",
            "text": "Request an updated Booking through the Platform."
          },
          {
            "type": "paragraph",
            "text": "Additional charges may apply where extra work is agreed upon."
          },
          {
            "type": "paragraph",
            "text": "Where possible, such changes should be recorded through the Platform."
          }
        ]
      },
      {
        "num": "5.7",
        "title": "User Responsibilities",
        "elements": [
          {
            "type": "paragraph",
            "text": "Users agree to:"
          },
          {
            "type": "bullet",
            "text": "Treat Helpers with dignity, courtesy, and respect."
          },
          {
            "type": "bullet",
            "text": "Provide truthful information."
          },
          {
            "type": "bullet",
            "text": "Pay all applicable charges when due."
          },
          {
            "type": "bullet",
            "text": "Cooperate during service delivery."
          },
          {
            "type": "bullet",
            "text": "Follow applicable safety instructions."
          },
          {
            "type": "bullet",
            "text": "Use the Platform only for lawful purposes."
          },
          {
            "type": "bullet",
            "text": "Promptly report accidents, disputes, or safety concerns."
          },
          {
            "type": "bullet",
            "text": "Respect the time and professional commitments of Helpers."
          }
        ]
      },
      {
        "num": "5.8",
        "title": "Prohibited Conduct",
        "elements": [
          {
            "type": "paragraph",
            "text": "Users must not, directly or indirectly:"
          },
          {
            "type": "bullet",
            "text": "Provide false identity information."
          },
          {
            "type": "bullet",
            "text": "Impersonate another individual or organization."
          },
          {
            "type": "bullet",
            "text": "Harass, threaten, intimidate, abuse, or discriminate against any person."
          },
          {
            "type": "bullet",
            "text": "Request illegal services."
          },
          {
            "type": "bullet",
            "text": "Use the Platform to commit fraud."
          },
          {
            "type": "bullet",
            "text": "Submit fake or misleading Bookings."
          },
          {
            "type": "bullet",
            "text": "Deliberately waste a Helper's time."
          },
          {
            "type": "bullet",
            "text": "Circumvent Platform security measures."
          },
          {
            "type": "bullet",
            "text": "Attempt unauthorized access to the Platform."
          },
          {
            "type": "bullet",
            "text": "Upload malware or harmful software."
          },
          {
            "type": "bullet",
            "text": "Interfere with Platform operations."
          },
          {
            "type": "bullet",
            "text": "Use automated bots or scraping tools without authorization."
          },
          {
            "type": "bullet",
            "text": "Solicit bribes or offer unlawful payments."
          },
          {
            "type": "bullet",
            "text": "Engage in any activity that could harm Dozo, Users, Helpers, or third parties."
          },
          {
            "type": "paragraph",
            "text": "Violation of this Section may result in immediate suspension or permanent removal from the Platform."
          }
        ]
      },
      {
        "num": "5.9",
        "title": "Respectful Communication",
        "elements": [
          {
            "type": "paragraph",
            "text": "All communications conducted through the Platform must remain respectful and professional."
          },
          {
            "type": "paragraph",
            "text": "Users must not use abusive, obscene, defamatory, threatening, discriminatory, or hateful language toward Helpers, Dozo personnel, or other Users."
          },
          {
            "type": "paragraph",
            "text": "Dozo reserves the right to investigate abusive communications and take appropriate action."
          }
        ]
      },
      {
        "num": "5.10",
        "title": "Off-Platform Transactions",
        "elements": [
          {
            "type": "paragraph",
            "text": "To protect Users, Helpers, and the integrity of the marketplace, Users should complete bookings and payments through the Dozo Platform whenever those features are available."
          },
          {
            "type": "paragraph",
            "text": "Users must not encourage or pressure Helpers to bypass the Platform in order to avoid applicable platform fees or policies."
          },
          {
            "type": "paragraph",
            "text": "Where Dozo reasonably determines that Users have intentionally circumvented the Platform, Dozo may take action including warnings, temporary restrictions, or account suspension."
          },
          {
            "type": "paragraph",
            "text": "Nothing in this section prevents Users and Helpers from exercising rights that cannot lawfully be restricted under applicable law."
          }
        ]
      },
      {
        "num": "5.11",
        "title": "Booking Cancellations",
        "elements": [
          {
            "type": "paragraph",
            "text": "Users may cancel a Booking in accordance with the Dozo Cancellation & Refund Policy."
          },
          {
            "type": "paragraph",
            "text": "Cancellation fees, if applicable, will be clearly disclosed in the relevant policy or during the cancellation process."
          },
          {
            "type": "paragraph",
            "text": "Repeated cancellations without reasonable cause may result in temporary booking restrictions."
          }
        ]
      },
      {
        "num": "5.12",
        "title": "User No-Show",
        "elements": [
          {
            "type": "paragraph",
            "text": "If a User fails to be available at the scheduled service location without prior notice, the Booking may be treated as a \"User No-Show.\" Where a User No-Show occurs:"
          },
          {
            "type": "bullet",
            "text": "Applicable waiting or cancellation charges may apply."
          },
          {
            "type": "bullet",
            "text": "The Helper may leave after a reasonable waiting period."
          },
          {
            "type": "bullet",
            "text": "Repeated No-Shows may lead to account restrictions."
          }
        ]
      },
      {
        "num": "5.13",
        "title": "Completion of Services",
        "elements": [
          {
            "type": "paragraph",
            "text": "Upon completion of the agreed service, the User should verify, to the extent reasonably possible, that the requested work has been performed."
          },
          {
            "type": "paragraph",
            "text": "If the User identifies concerns, they should report them through the Platform within the timeframe specified in the applicable policy."
          },
          {
            "type": "paragraph",
            "text": "Reporting a concern does not automatically entitle the User to a refund or compensation. Each case will be assessed based on available information and applicable policies."
          }
        ]
      },
      {
        "num": "5.14",
        "title": "Ratings and Feedback",
        "elements": [
          {
            "type": "paragraph",
            "text": "Users are encouraged to provide honest ratings and reviews after completion of a Booking."
          },
          {
            "type": "paragraph",
            "text": "Reviews should:"
          },
          {
            "type": "bullet",
            "text": "Reflect genuine experiences;"
          },
          {
            "type": "bullet",
            "text": "Avoid offensive or unlawful content;"
          },
          {
            "type": "bullet",
            "text": "Not contain confidential or personal information of others; and"
          },
          {
            "type": "bullet",
            "text": "Not be used to extort discounts, refunds, or preferential treatment."
          },
          {
            "type": "paragraph",
            "text": "Dozo may remove reviews that violate these Terms or applicable law."
          }
        ]
      },
      {
        "num": "5.15",
        "title": "Emergencies",
        "elements": [
          {
            "type": "paragraph",
            "text": "The Dozo Platform is **not** an emergency response service."
          },
          {
            "type": "paragraph",
            "text": "Users must not rely on Dozo for emergency medical, police, fire, disaster response, or other urgent public safety services."
          },
          {
            "type": "paragraph",
            "text": "In an emergency, Users should immediately contact the appropriate local emergency authorities."
          }
        ]
      },
      {
        "num": "5.16",
        "title": "Platform Availability",
        "elements": [
          {
            "type": "paragraph",
            "text": "While Dozo aims to provide reliable access to the Platform, temporary interruptions may occur due to maintenance, upgrades, technical failures, cyber incidents, force majeure events, or circumstances beyond Dozo's reasonable control."
          },
          {
            "type": "paragraph",
            "text": "Dozo will use commercially reasonable efforts to restore normal operations as soon as practicable."
          }
        ]
      },
      {
        "num": "5.17",
        "title": "Records and Evidence",
        "elements": [
          {
            "type": "paragraph",
            "text": "Dozo may maintain electronic records relating to Bookings, communications, payments, support interactions, and other Platform activities in accordance with applicable law and the Dozo Privacy Policy."
          },
          {
            "type": "paragraph",
            "text": "Such records may be used for customer support, fraud prevention, regulatory compliance, security investigations, and dispute resolution."
          }
        ]
      },
      {
        "num": "5.18",
        "title": "Cooperation with Investigations",
        "elements": [
          {
            "type": "paragraph",
            "text": "Users agree to reasonably cooperate with Dozo in connection with investigations relating to fraud, safety incidents, payment disputes, policy violations, or legal requests."
          },
          {
            "type": "paragraph",
            "text": "Failure to cooperate may affect Dozo's ability to resolve the matter and may result in appropriate action under these Terms."
          }
        ]
      },
      {
        "num": "5.19",
        "title": "Fair Use of the Platform",
        "elements": [
          {
            "type": "paragraph",
            "text": "The Platform is intended to facilitate genuine service requests."
          },
          {
            "type": "paragraph",
            "text": "Users must not misuse promotional offers, referral programs, coupons, discounts, loyalty benefits, or any Platform feature in a fraudulent or abusive manner."
          },
          {
            "type": "paragraph",
            "text": "Dozo may cancel improperly obtained benefits and take proportionate enforcement action where misuse is identified."
          }
        ]
      },
      {
        "num": "5.20",
        "title": "Compliance with this Chapter",
        "elements": [
          {
            "type": "paragraph",
            "text": "By requesting or using services through Dozo, Users acknowledge that compliance with this Chapter is essential to maintaining a safe, efficient, and trustworthy marketplace for all participants."
          },
          {
            "type": "paragraph",
            "text": "Failure to comply with these obligations may result in warnings, temporary restrictions, cancellation of Bookings, suspension, or permanent termination of Platform access, subject to applicable law and Dozo's enforcement policies."
          }
        ]
      }
    ]
  },
  {
    "number": 6,
    "title": "Helper Terms, Service Delivery & Professional Standards",
    "sections": [
      {
        "num": "6.1",
        "title": "Independent Helper Status",
        "elements": [
          {
            "type": "paragraph",
            "text": "Each Helper using Dozo acts as an independent service provider and is solely responsible for the services they provide. Nothing in these Terms creates an employment, agency, partnership, or joint venture relationship between Dozo and any Helper."
          }
        ]
      },
      {
        "num": "6.2",
        "title": "Eligibility",
        "elements": [
          {
            "type": "paragraph",
            "text": "To register as a Helper, an individual or business must:"
          },
          {
            "type": "bullet",
            "text": "Be at least 18 years of age."
          },
          {
            "type": "bullet",
            "text": "Have legal authority to provide the relevant services."
          },
          {
            "type": "bullet",
            "text": "Complete any verification required by Dozo."
          },
          {
            "type": "bullet",
            "text": "Possess any licences, permits, or certifications required by applicable law for the services offered."
          },
          {
            "type": "bullet",
            "text": "Maintain accurate and up-to-date account information."
          }
        ]
      },
      {
        "num": "6.3",
        "title": "Acceptance of Bookings",
        "elements": [
          {
            "type": "paragraph",
            "text": "Helpers are generally free to accept or decline Booking requests."
          },
          {
            "type": "paragraph",
            "text": "Once a Booking has been accepted, the Helper is expected to fulfil the service professionally unless cancellation is reasonably necessary due to safety concerns, emergencies, force majeure events, or other legitimate reasons."
          },
          {
            "type": "paragraph",
            "text": "Repeated acceptance followed by avoidable cancellations may affect Platform privileges."
          }
        ]
      },
      {
        "num": "6.4",
        "title": "Arrival and Punctuality",
        "elements": [
          {
            "type": "paragraph",
            "text": "Helpers should make reasonable efforts to arrive at the agreed location within the scheduled time."
          },
          {
            "type": "paragraph",
            "text": "If a delay is expected, the Helper should notify the User through the Platform or other approved communication channels as soon as reasonably practicable."
          },
          {
            "type": "paragraph",
            "text": "Persistent delays without reasonable justification may result in performance review."
          }
        ]
      },
      {
        "num": "6.5",
        "title": "Professional Conduct",
        "elements": [
          {
            "type": "paragraph",
            "text": "Helpers must:"
          },
          {
            "type": "bullet",
            "text": "Treat Users respectfully and courteously."
          },
          {
            "type": "bullet",
            "text": "Communicate honestly and professionally."
          },
          {
            "type": "bullet",
            "text": "Perform services with reasonable care and skill."
          },
          {
            "type": "bullet",
            "text": "Respect the User's property and privacy."
          },
          {
            "type": "bullet",
            "text": "Follow applicable safety practices."
          },
          {
            "type": "bullet",
            "text": "Comply with all applicable laws and Platform policies."
          }
        ]
      },
      {
        "num": "6.6",
        "title": "Service Standards",
        "elements": [
          {
            "type": "paragraph",
            "text": "Helpers should provide services that reasonably match the description advertised on the Platform and the scope of the confirmed Booking."
          },
          {
            "type": "paragraph",
            "text": "Helpers must not knowingly misrepresent their qualifications, experience, certifications, or ability to perform a service."
          }
        ]
      },
      {
        "num": "6.7",
        "title": "Equipment and Materials",
        "elements": [
          {
            "type": "paragraph",
            "text": "Unless otherwise specified in the Booking:"
          },
          {
            "type": "bullet",
            "text": "Helpers are responsible for bringing the tools, equipment, or materials reasonably required to perform the"
          },
          {
            "type": "paragraph",
            "text": "agreed service."
          },
          {
            "type": "bullet",
            "text": "Users are responsible only for items expressly indicated in the Booking or otherwise mutually agreed."
          }
        ]
      },
      {
        "num": "6.8",
        "title": "Changes to the Scope of Work",
        "elements": [
          {
            "type": "paragraph",
            "text": "If a User requests additional work beyond the original Booking, the Helper may accept or decline the request."
          },
          {
            "type": "paragraph",
            "text": "Where additional work is accepted, any additional charges should, where possible, be processed through the Platform."
          }
        ]
      },
      {
        "num": "6.9",
        "title": "Safety Obligations",
        "elements": [
          {
            "type": "paragraph",
            "text": "Helpers must not perform services where:"
          },
          {
            "type": "bullet",
            "text": "The work requested is unlawful."
          },
          {
            "type": "bullet",
            "text": "The environment presents an unreasonable risk to health or safety."
          },
          {
            "type": "bullet",
            "text": "The User engages in threatening, abusive, discriminatory, or violent conduct."
          },
          {
            "type": "bullet",
            "text": "Continuing the service would violate applicable law or these Terms."
          },
          {
            "type": "paragraph",
            "text": "Helpers should promptly report such incidents through the Platform."
          }
        ]
      },
      {
        "num": "6.10",
        "title": "Prohibited Conduct",
        "elements": [
          {
            "type": "paragraph",
            "text": "Helpers must not:"
          },
          {
            "type": "bullet",
            "text": "Perform illegal services."
          },
          {
            "type": "bullet",
            "text": "Misrepresent their identity or qualifications."
          },
          {
            "type": "bullet",
            "text": "Demand payments outside the Platform where Platform payment is required."
          },
          {
            "type": "bullet",
            "text": "Use abusive, threatening, discriminatory, or harassing language."
          },
          {
            "type": "bullet",
            "text": "Damage User property intentionally."
          },
          {
            "type": "bullet",
            "text": "Consume alcohol or unlawful substances while providing services."
          },
          {
            "type": "bullet",
            "text": "Share confidential User information without authorization."
          },
          {
            "type": "bullet",
            "text": "Engage in fraud, theft, bribery, or corruption."
          },
          {
            "type": "bullet",
            "text": "Use another person's Helper account."
          },
          {
            "type": "bullet",
            "text": "Encourage Users to violate these Terms."
          }
        ]
      },
      {
        "num": "6.11",
        "title": "Customer Privacy",
        "elements": [
          {
            "type": "paragraph",
            "text": "Helpers must respect the privacy of Users."
          },
          {
            "type": "paragraph",
            "text": "Helpers must not:"
          },
          {
            "type": "bullet",
            "text": "Record audio or video without lawful authority or consent."
          },
          {
            "type": "bullet",
            "text": "Copy personal documents."
          },
          {
            "type": "bullet",
            "text": "Share addresses, phone numbers, photographs, or personal information obtained through the Platform"
          },
          {
            "type": "paragraph",
            "text": "except as necessary to perform the service or as required by law."
          }
        ]
      },
      {
        "num": "6.12",
        "title": "Earnings",
        "elements": [
          {
            "type": "paragraph",
            "text": "Helpers may receive earnings for completed Bookings in accordance with the applicable pricing structure and Payments Policy."
          },
          {
            "type": "paragraph",
            "text": "Dozo may deduct:"
          },
          {
            "type": "bullet",
            "text": "Platform service fees;"
          },
          {
            "type": "bullet",
            "text": "Applicable taxes;"
          },
          {
            "type": "bullet",
            "text": "Chargebacks;"
          },
          {
            "type": "bullet",
            "text": "Refund adjustments;"
          },
          {
            "type": "bullet",
            "text": "Penalties imposed under these Terms where permitted by law; and"
          },
          {
            "type": "bullet",
            "text": "Other lawful deductions disclosed to Helpers."
          },
          {
            "type": "paragraph",
            "text": "Payment timelines and settlement procedures will be described in the Payments Policy."
          }
        ]
      },
      {
        "num": "6.13",
        "title": "Ratings and Performance",
        "elements": [
          {
            "type": "paragraph",
            "text": "Dozo may consider factors such as:"
          },
          {
            "type": "bullet",
            "text": "Customer ratings;"
          },
          {
            "type": "bullet",
            "text": "Verified complaints;"
          },
          {
            "type": "bullet",
            "text": "Reliability;"
          },
          {
            "type": "bullet",
            "text": "Timely completion of Bookings;"
          },
          {
            "type": "bullet",
            "text": "Compliance with Platform policies; and"
          },
          {
            "type": "bullet",
            "text": "Overall service quality."
          },
          {
            "type": "paragraph",
            "text": "These factors may influence access to certain features, promotional opportunities, or continued participation on the Platform."
          }
        ]
      },
      {
        "num": "6.14",
        "title": "Insurance",
        "elements": [
          {
            "type": "paragraph",
            "text": "Where insurance is required by applicable law or by the nature of the services provided, Helpers are responsible for obtaining and maintaining appropriate coverage unless Dozo expressly provides otherwise in writing."
          }
        ]
      },
      {
        "num": "6.15",
        "title": "Taxes and Legal Compliance",
        "elements": [
          {
            "type": "paragraph",
            "text": "Helpers are responsible for complying with applicable tax, labour, licensing, and regulatory obligations arising from the services they provide."
          },
          {
            "type": "paragraph",
            "text": "Nothing in these Terms transfers such responsibilities to Dozo unless expressly required by applicable law."
          }
        ]
      },
      {
        "num": "6.16",
        "title": "Suspension or Removal",
        "elements": [
          {
            "type": "paragraph",
            "text": "Dozo may suspend, restrict, or terminate a Helper's access to the Platform where there is a reasonable belief of:"
          },
          {
            "type": "bullet",
            "text": "Fraud or deception;"
          },
          {
            "type": "bullet",
            "text": "Serious safety concerns;"
          },
          {
            "type": "bullet",
            "text": "Repeated poor performance supported by evidence;"
          },
          {
            "type": "bullet",
            "text": "Material violations of these Terms;"
          },
          {
            "type": "bullet",
            "text": "Criminal or unlawful conduct affecting Platform safety;"
          },
          {
            "type": "bullet",
            "text": "Misuse of the Platform; or"
          },
          {
            "type": "bullet",
            "text": "Other conduct that materially undermines trust in the marketplace."
          },
          {
            "type": "paragraph",
            "text": "Where appropriate, Dozo may provide the Helper with an opportunity to respond before permanent action is taken."
          }
        ]
      },
      {
        "num": "6.17",
        "title": "Cooperation with Investigations",
        "elements": [
          {
            "type": "paragraph",
            "text": "Helpers agree to cooperate in good faith with reasonable investigations relating to complaints, safety incidents, payment disputes, fraud prevention, or legal requests."
          },
          {
            "type": "paragraph",
            "text": "Failure to cooperate may affect the resolution of the matter and may result in Platform action."
          }
        ]
      },
      {
        "num": "6.18",
        "title": "Commitment to Professionalism",
        "elements": [
          {
            "type": "paragraph",
            "text": "By providing services through Dozo, each Helper agrees to uphold the values of professionalism, respect, transparency, safety, and reliability."
          },
          {
            "type": "paragraph",
            "text": "These standards are intended to promote a fair and trusted marketplace for both Users and Helpers and apply throughout the Helper's use of the Platform."
          }
        ]
      }
    ]
  },
  {
    "number": 7,
    "title": "Payments, Pricing & Taxes",
    "sections": [
      {
        "num": "7.1",
        "title": "General",
        "elements": [
          {
            "type": "paragraph",
            "text": "Dozo facilitates payments for services booked through the Platform where payment functionality is available."
          },
          {
            "type": "paragraph",
            "text": "All payments made through the Platform are subject to these Terms, the Dozo Payments Policy, and the terms of any authorized payment service providers engaged by Dozo."
          }
        ]
      },
      {
        "num": "7.2",
        "title": "Pricing",
        "elements": [
          {
            "type": "paragraph",
            "text": "The total amount payable for a Booking may include one or more of the following:"
          },
          {
            "type": "bullet",
            "text": "Service charges;"
          },
          {
            "type": "bullet",
            "text": "Platform or convenience fees;"
          },
          {
            "type": "bullet",
            "text": "Applicable taxes;"
          },
          {
            "type": "bullet",
            "text": "Cancellation or waiting charges;"
          },
          {
            "type": "bullet",
            "text": "Charges for additional services requested during a Booking;"
          },
          {
            "type": "bullet",
            "text": "Promotional discounts or credits (where applicable); and"
          },
          {
            "type": "bullet",
            "text": "Any other charges disclosed before confirmation of the Booking."
          },
          {
            "type": "paragraph",
            "text": "Prices displayed on the Platform may vary based on factors including location, service category, duration, demand, availability, or other operational considerations."
          }
        ]
      },
      {
        "num": "7.3",
        "title": "Price Transparency",
        "elements": [
          {
            "type": "paragraph",
            "text": "Before confirming a Booking, Users will be shown the applicable charges to the extent reasonably practicable."
          },
          {
            "type": "paragraph",
            "text": "Where the scope of work changes after confirmation, additional charges may apply with the User's consent or as otherwise permitted under these Terms."
          },
          {
            "type": "paragraph",
            "text": "Dozo will not intentionally impose undisclosed mandatory charges."
          }
        ]
      },
      {
        "num": "7.4",
        "title": "Payment Methods",
        "elements": [
          {
            "type": "paragraph",
            "text": "Users may pay for Bookings using payment methods supported by the Platform, which may include:"
          },
          {
            "type": "bullet",
            "text": "UPI;"
          },
          {
            "type": "bullet",
            "text": "Credit cards;"
          },
          {
            "type": "bullet",
            "text": "Debit cards;"
          },
          {
            "type": "bullet",
            "text": "Net banking;"
          },
          {
            "type": "bullet",
            "text": "Digital wallets;"
          },
          {
            "type": "bullet",
            "text": "Cash (where available);"
          },
          {
            "type": "bullet",
            "text": "Other approved payment methods introduced by Dozo."
          },
          {
            "type": "paragraph",
            "text": "Availability of payment methods may vary by location and service category."
          }
        ]
      },
      {
        "num": "7.5",
        "title": "Payment Authorization",
        "elements": [
          {
            "type": "paragraph",
            "text": "By submitting a payment, the User authorizes Dozo and its authorized payment partners to process the transaction using the selected payment method for the amount due, including any applicable taxes, fees, or authorized adjustments."
          },
          {
            "type": "paragraph",
            "text": "The User represents that they are authorized to use the chosen payment method."
          }
        ]
      },
      {
        "num": "7.6",
        "title": "Failed Payments",
        "elements": [
          {
            "type": "paragraph",
            "text": "If a payment fails due to insufficient funds, technical issues, payment reversals, or other reasons, Dozo may:"
          },
          {
            "type": "bullet",
            "text": "Request an alternative payment method;"
          },
          {
            "type": "bullet",
            "text": "Retry the transaction where permitted;"
          },
          {
            "type": "bullet",
            "text": "Suspend future Bookings until outstanding amounts are paid; or"
          },
          {
            "type": "bullet",
            "text": "Take other reasonable measures to recover amounts lawfully owed."
          }
        ]
      },
      {
        "num": "7.7",
        "title": "Helper Earnings",
        "elements": [
          {
            "type": "paragraph",
            "text": "Helpers are entitled to receive earnings for successfully completed Bookings, subject to:"
          },
          {
            "type": "bullet",
            "text": "Applicable platform service fees;"
          },
          {
            "type": "bullet",
            "text": "Taxes required by law;"
          },
          {
            "type": "bullet",
            "text": "Refunds or chargebacks where applicable;"
          },
          {
            "type": "bullet",
            "text": "Adjustments resulting from fraud investigations or payment disputes; and"
          },
          {
            "type": "bullet",
            "text": "Other deductions disclosed in advance or required by law."
          },
          {
            "type": "paragraph",
            "text": "Settlement timelines will be described in the Dozo Payments Policy."
          }
        ]
      },
      {
        "num": "7.8",
        "title": "Taxes",
        "elements": [
          {
            "type": "paragraph",
            "text": "Users are responsible for paying applicable taxes included in the Booking price."
          },
          {
            "type": "paragraph",
            "text": "Helpers remain responsible for their own tax reporting and payment obligations arising from their earnings, unless applicable law requires otherwise."
          },
          {
            "type": "paragraph",
            "text": "Dozo may collect, deduct, withhold, or remit taxes where required by law."
          }
        ]
      },
      {
        "num": "7.9",
        "title": "Promotional Offers",
        "elements": [
          {
            "type": "paragraph",
            "text": "From time to time, Dozo may offer promotional discounts, referral incentives, coupons, loyalty rewards, or credits."
          },
          {
            "type": "paragraph",
            "text": "Such offers:"
          },
          {
            "type": "bullet",
            "text": "Have no cash value unless expressly stated;"
          },
          {
            "type": "bullet",
            "text": "May be subject to eligibility requirements;"
          },
          {
            "type": "bullet",
            "text": "May expire;"
          },
          {
            "type": "bullet",
            "text": "May not be combined with other offers unless permitted; and"
          },
          {
            "type": "bullet",
            "text": "May be withdrawn or modified at any time in accordance with applicable law."
          },
          {
            "type": "paragraph",
            "text": "Fraudulent or abusive use of promotional offers may result in cancellation of benefits and enforcement action."
          }
        ]
      },
      {
        "num": "7.10",
        "title": "Chargebacks and Payment Disputes",
        "elements": [
          {
            "type": "paragraph",
            "text": "Where a payment is disputed, reversed, or charged back by a financial institution or payment provider, Dozo may investigate the matter and take appropriate action."
          },
          {
            "type": "paragraph",
            "text": "Users and Helpers agree to cooperate by providing relevant information reasonably requested to resolve the dispute."
          }
        ]
      },
      {
        "num": "7.11",
        "title": "Refunds",
        "elements": [
          {
            "type": "paragraph",
            "text": "Refunds, where applicable, shall be governed by the Dozo Cancellation & Refund Policy."
          },
          {
            "type": "paragraph",
            "text": "The availability, timing, and amount of any refund will depend on the circumstances of the Booking, the applicable policy, and relevant legal requirements."
          }
        ]
      },
      {
        "num": "7.12",
        "title": "Payment Security",
        "elements": [
          {
            "type": "paragraph",
            "text": "Dozo uses commercially reasonable measures to facilitate secure payment processing."
          },
          {
            "type": "paragraph",
            "text": "However, payment processing may be performed by regulated third-party payment service providers."
          },
          {
            "type": "paragraph",
            "text": "Dozo does not store complete payment card information unless permitted by law and handled in accordance with applicable security standards."
          }
        ]
      },
      {
        "num": "7.13",
        "title": "Errors and Corrections",
        "elements": [
          {
            "type": "paragraph",
            "text": "If Dozo identifies a genuine pricing, calculation, or technical error affecting a transaction, Dozo may correct the error after notifying the affected User or Helper where reasonably practicable."
          },
          {
            "type": "paragraph",
            "text": "Where a material error cannot be reasonably corrected, Dozo may cancel the affected Booking and process any appropriate refund."
          }
        ]
      },
      {
        "num": "7.14",
        "title": "Currency",
        "elements": [
          {
            "type": "paragraph",
            "text": "Unless otherwise stated, all prices displayed on the Platform are denominated in **Indian Rupees (INR)**."
          },
          {
            "type": "paragraph",
            "text": "Where services are introduced in other jurisdictions, additional currencies may be supported in accordance with applicable law."
          }
        ]
      },
      {
        "num": "7.15",
        "title": "Financial Compliance",
        "elements": [
          {
            "type": "paragraph",
            "text": "Users and Helpers must not use the Platform for:"
          },
          {
            "type": "bullet",
            "text": "Money laundering;"
          },
          {
            "type": "bullet",
            "text": "Terrorist financing;"
          },
          {
            "type": "bullet",
            "text": "Fraudulent transactions;"
          },
          {
            "type": "bullet",
            "text": "Stolen payment instruments;"
          },
          {
            "type": "bullet",
            "text": "Identity theft;"
          },
          {
            "type": "bullet",
            "text": "Unauthorized payment activity; or"
          },
          {
            "type": "bullet",
            "text": "Any other unlawful financial conduct."
          },
          {
            "type": "paragraph",
            "text": "Dozo may suspend transactions or accounts where required by law, regulatory direction, or reasonable fraud prevention measures."
          }
        ]
      },
      {
        "num": "7.16",
        "title": "Records",
        "elements": [
          {
            "type": "paragraph",
            "text": "Electronic payment records maintained by Dozo and its authorized payment partners shall, to the extent permitted by applicable law, constitute evidence of transactions conducted through the Platform."
          },
          {
            "type": "paragraph",
            "text": "Users and Helpers are encouraged to retain their own receipts and transaction records."
          }
        ]
      },
      {
        "num": "7.17",
        "title": "Compliance",
        "elements": [
          {
            "type": "paragraph",
            "text": "By making or receiving payments through the Platform, Users and Helpers agree to comply with this Chapter, the Dozo Payments Policy, and all applicable financial, tax, and anti-fraud laws."
          }
        ]
      }
    ]
  },
  {
    "number": 8,
    "title": "Cancellation, Refunds & Rescheduling",
    "sections": [
      {
        "num": "8.1",
        "title": "Purpose",
        "elements": [
          {
            "type": "paragraph",
            "text": "This Chapter governs the cancellation, refund, rescheduling, and no-show rules applicable to all Bookings made through the Dozo Platform. It is intended to balance the interests of both Users and Helpers while maintaining a fair and reliable marketplace."
          }
        ]
      },
      {
        "num": "8.2",
        "title": "User Cancellation Before Confirmation",
        "elements": [
          {
            "type": "paragraph",
            "text": "A User may cancel a Booking request at any time before it has been accepted or confirmed."
          },
          {
            "type": "paragraph",
            "text": "Unless otherwise stated during the booking process, no cancellation fee will apply for cancellations made before confirmation."
          }
        ]
      },
      {
        "num": "8.3",
        "title": "User Cancellation After Confirmation",
        "elements": [
          {
            "type": "paragraph",
            "text": "Once a Booking has been confirmed, a User may cancel it through the Platform."
          },
          {
            "type": "paragraph",
            "text": "Depending on factors such as the timing of the cancellation, the Helper's travel, or preparation for the Booking, a cancellation fee may apply. Any applicable fee will be disclosed through the Platform or in the applicable policy before confirmation where reasonably practicable."
          }
        ]
      },
      {
        "num": "8.4",
        "title": "Helper Cancellation",
        "elements": [
          {
            "type": "paragraph",
            "text": "A Helper should avoid cancelling a confirmed Booking except for legitimate reasons, including but not limited to:"
          },
          {
            "type": "bullet",
            "text": "Illness or medical emergency;"
          },
          {
            "type": "bullet",
            "text": "Safety concerns;"
          },
          {
            "type": "bullet",
            "text": "Force majeure events;"
          },
          {
            "type": "bullet",
            "text": "Incorrect or misleading booking information;"
          },
          {
            "type": "bullet",
            "text": "Circumstances beyond the Helper's reasonable control."
          },
          {
            "type": "paragraph",
            "text": "Repeated avoidable cancellations may result in warnings, reduced platform privileges, temporary suspension, or account termination."
          }
        ]
      },
      {
        "num": "8.5",
        "title": "Platform Cancellation",
        "elements": [
          {
            "type": "paragraph",
            "text": "Dozo may cancel a Booking where reasonably necessary, including in cases involving:"
          },
          {
            "type": "bullet",
            "text": "Fraud or suspected fraud;"
          },
          {
            "type": "bullet",
            "text": "Duplicate or erroneous bookings;"
          },
          {
            "type": "bullet",
            "text": "Payment failure;"
          },
          {
            "type": "bullet",
            "text": "Safety concerns;"
          },
          {
            "type": "bullet",
            "text": "Technical errors;"
          },
          {
            "type": "bullet",
            "text": "Force majeure events;"
          },
          {
            "type": "bullet",
            "text": "Legal or regulatory requirements; or"
          },
          {
            "type": "bullet",
            "text": "Other exceptional operational circumstances."
          },
          {
            "type": "paragraph",
            "text": "Where appropriate, affected Users and Helpers will be notified promptly."
          }
        ]
      },
      {
        "num": "8.6",
        "title": "Rescheduling",
        "elements": [
          {
            "type": "paragraph",
            "text": "Users may request to reschedule a confirmed Booking through the Platform, subject to:"
          },
          {
            "type": "bullet",
            "text": "Helper availability;"
          },
          {
            "type": "bullet",
            "text": "Operational feasibility; and"
          },
          {
            "type": "bullet",
            "text": "Any applicable rescheduling conditions disclosed during the process."
          },
          {
            "type": "paragraph",
            "text": "Rescheduling is not guaranteed and may result in revised pricing where the scope, timing, or location of the service changes."
          }
        ]
      },
      {
        "num": "8.7",
        "title": "Waiting Time",
        "elements": [
          {
            "type": "paragraph",
            "text": "Users should ensure that the Helper can begin the service at the scheduled time."
          },
          {
            "type": "paragraph",
            "text": "Where a User causes a delay, the Helper may wait for a reasonable period. After that period, the Booking may be treated as a User No-Show and applicable waiting or cancellation charges may apply in accordance with Platform policies."
          }
        ]
      },
      {
        "num": "8.8",
        "title": "User No-Show",
        "elements": [
          {
            "type": "paragraph",
            "text": "A User may be considered a \"No-Show\" if the User:"
          },
          {
            "type": "bullet",
            "text": "Is unavailable at the service location;"
          },
          {
            "type": "bullet",
            "text": "Cannot be contacted using the registered contact details after reasonable attempts;"
          },
          {
            "type": "bullet",
            "text": "Refuses access without prior notice; or"
          },
          {
            "type": "bullet",
            "text": "Otherwise prevents the Helper from reasonably commencing the service."
          },
          {
            "type": "paragraph",
            "text": "Repeated No-Shows may result in temporary booking restrictions or account suspension."
          }
        ]
      },
      {
        "num": "8.9",
        "title": "Helper No-Show",
        "elements": [
          {
            "type": "paragraph",
            "text": "A Helper may be considered a \"No-Show\" if the Helper fails to arrive within a reasonable period after the scheduled start time without notifying the User or Dozo."
          },
          {
            "type": "paragraph",
            "text": "Verified repeated No-Shows may affect the Helper's performance metrics and continued participation on the Platform."
          }
        ]
      },
      {
        "num": "8.10",
        "title": "Refund Eligibility",
        "elements": [
          {
            "type": "paragraph",
            "text": "Refund eligibility will depend on the circumstances of each Booking, including:"
          },
          {
            "type": "bullet",
            "text": "Whether the service was completed;"
          },
          {
            "type": "bullet",
            "text": "The reason for cancellation;"
          },
          {
            "type": "bullet",
            "text": "Payment status;"
          },
          {
            "type": "bullet",
            "text": "Applicable Platform policies; and"
          },
          {
            "type": "bullet",
            "text": "Requirements under applicable law."
          },
          {
            "type": "paragraph",
            "text": "Refunds may be issued in full, in part, or declined where appropriate."
          }
        ]
      },
      {
        "num": "8.11",
        "title": "Refund Processing",
        "elements": [
          {
            "type": "paragraph",
            "text": "Approved refunds will generally be processed using the original payment method where practicable."
          },
          {
            "type": "paragraph",
            "text": "Processing times may vary depending on the payment provider, financial institution, or banking system."
          },
          {
            "type": "paragraph",
            "text": "Dozo is not responsible for delays caused solely by third-party payment providers."
          }
        ]
      },
      {
        "num": "8.12",
        "title": "Service Dissatisfaction",
        "elements": [
          {
            "type": "paragraph",
            "text": "If a User believes that a completed service materially failed to match the agreed scope, the User should report the concern through the Platform within the timeframe specified by Dozo."
          },
          {
            "type": "paragraph",
            "text": "Dozo may review the matter by considering information from both the User and the Helper, including photographs, communications, invoices, or other relevant evidence."
          },
          {
            "type": "paragraph",
            "text": "Submission of a complaint does not automatically entitle the User to a refund."
          }
        ]
      },
      {
        "num": "8.13",
        "title": "Fraudulent Claims",
        "elements": [
          {
            "type": "paragraph",
            "text": "Users and Helpers must not submit false or misleading claims relating to cancellations, refunds, payments, or completed services."
          },
          {
            "type": "paragraph",
            "text": "Fraudulent claims may result in:"
          },
          {
            "type": "bullet",
            "text": "Rejection of the claim;"
          },
          {
            "type": "bullet",
            "text": "Recovery of improperly obtained amounts;"
          },
          {
            "type": "bullet",
            "text": "Suspension or termination of Platform access; and"
          },
          {
            "type": "bullet",
            "text": "Referral to appropriate authorities where required by law."
          }
        ]
      },
      {
        "num": "8.14",
        "title": "Force Majeure",
        "elements": [
          {
            "type": "paragraph",
            "text": "Neither Users, Helpers, nor Dozo shall be liable for delays or cancellations caused by Force Majeure Events, including natural disasters, government restrictions, widespread network failures, public emergencies, or other events beyond reasonable control."
          },
          {
            "type": "paragraph",
            "text": "Dozo may determine appropriate remedies, including rescheduling or refunds, after considering the specific circumstances."
          }
        ]
      },
      {
        "num": "8.15",
        "title": "Dispute Resolution",
        "elements": [
          {
            "type": "paragraph",
            "text": "Where a dispute arises regarding a cancellation or refund, Dozo may facilitate communication between the parties and review available evidence."
          },
          {
            "type": "paragraph",
            "text": "Dozo may recommend a fair resolution consistent with these Terms and applicable policies. Unless required by law, Dozo is not obligated to resolve every dispute in a particular manner."
          }
        ]
      },
      {
        "num": "8.16",
        "title": "Abuse of Cancellation Policies",
        "elements": [
          {
            "type": "paragraph",
            "text": "Repeated misuse of cancellations, refund requests, or rescheduling features--including fraudulent bookings, repeated last-minute cancellations without reasonable cause, or attempts to exploit Platform policies--may result in restrictions, suspension, or permanent removal from the Platform."
          }
        ]
      },
      {
        "num": "8.17",
        "title": "Final Determination",
        "elements": [
          {
            "type": "paragraph",
            "text": "Subject to applicable law, Dozo reserves the right to make reasonable decisions regarding cancellations, refunds, credits, and related adjustments after considering the available information, the interests of both Users and Helpers, and the integrity of the Platform."
          }
        ]
      }
    ]
  },
  {
    "number": 9,
    "title": "Ratings, Reviews & Community Guidelines",
    "sections": [
      {
        "num": "9.1",
        "title": "Purpose",
        "elements": [
          {
            "type": "paragraph",
            "text": "Dozo is committed to building a marketplace founded on **trust, professionalism, transparency, respect, and safety**."
          },
          {
            "type": "paragraph",
            "text": "This Chapter governs user-generated content, ratings, reviews, communications, and community behavior across the Platform."
          },
          {
            "type": "paragraph",
            "text": "All Users and Helpers agree to contribute to a respectful and trustworthy environment."
          }
        ]
      },
      {
        "num": "9.2",
        "title": "Honest Ratings and Reviews",
        "elements": [
          {
            "type": "paragraph",
            "text": "Following completion of a Booking, Users and Helpers may be invited to provide ratings and written reviews."
          },
          {
            "type": "paragraph",
            "text": "All ratings and reviews must:"
          },
          {
            "type": "bullet",
            "text": "Be based on genuine first-hand experiences."
          },
          {
            "type": "bullet",
            "text": "Be truthful and accurate."
          },
          {
            "type": "bullet",
            "text": "Reflect the actual service provided."
          },
          {
            "type": "bullet",
            "text": "Avoid exaggeration or misleading statements."
          },
          {
            "type": "bullet",
            "text": "Comply with applicable laws."
          },
          {
            "type": "paragraph",
            "text": "Fake, purchased, manipulated, or coordinated reviews are strictly prohibited."
          }
        ]
      },
      {
        "num": "9.3",
        "title": "Fair Review Practices",
        "elements": [
          {
            "type": "paragraph",
            "text": "Reviews must never be used to:"
          },
          {
            "type": "bullet",
            "text": "Threaten another person."
          },
          {
            "type": "bullet",
            "text": "Demand refunds or discounts."
          },
          {
            "type": "bullet",
            "text": "Force favourable treatment."
          },
          {
            "type": "bullet",
            "text": "Damage another person's reputation unfairly."
          },
          {
            "type": "bullet",
            "text": "Retaliate against lawful complaints."
          },
          {
            "type": "paragraph",
            "text": "Attempting to manipulate ratings or reviews may result in disciplinary action."
          }
        ]
      },
      {
        "num": "9.4",
        "title": "Respectful Behaviour",
        "elements": [
          {
            "type": "paragraph",
            "text": "Every User and Helper must interact respectfully."
          },
          {
            "type": "paragraph",
            "text": "The following conduct is prohibited:"
          },
          {
            "type": "bullet",
            "text": "Harassment;"
          },
          {
            "type": "bullet",
            "text": "Threats or intimidation;"
          },
          {
            "type": "bullet",
            "text": "Hate speech;"
          },
          {
            "type": "bullet",
            "text": "Discrimination based on race, religion, caste, ethnicity, nationality, disability, gender, sexual orientation,"
          },
          {
            "type": "paragraph",
            "text": "age, or any other legally protected characteristic;"
          },
          {
            "type": "bullet",
            "text": "Bullying;"
          },
          {
            "type": "bullet",
            "text": "Obscene language;"
          },
          {
            "type": "bullet",
            "text": "Defamation;"
          },
          {
            "type": "bullet",
            "text": "Personal attacks."
          },
          {
            "type": "paragraph",
            "text": "Dozo maintains a zero-tolerance approach toward abusive conduct."
          }
        ]
      },
      {
        "num": "9.5",
        "title": "Professional Communication",
        "elements": [
          {
            "type": "paragraph",
            "text": "Communications conducted through the Platform should remain courteous, relevant, and professional."
          },
          {
            "type": "paragraph",
            "text": "Users and Helpers should communicate only for purposes directly related to the Booking unless both parties voluntarily agree otherwise."
          }
        ]
      },
      {
        "num": "9.6",
        "title": "User-Generated Content",
        "elements": [
          {
            "type": "paragraph",
            "text": "Users and Helpers remain responsible for all content they upload or publish through the Platform, including:"
          },
          {
            "type": "bullet",
            "text": "Reviews;"
          },
          {
            "type": "bullet",
            "text": "Ratings;"
          },
          {
            "type": "bullet",
            "text": "Profile information;"
          },
          {
            "type": "bullet",
            "text": "Photographs;"
          },
          {
            "type": "bullet",
            "text": "Videos;"
          },
          {
            "type": "bullet",
            "text": "Messages;"
          },
          {
            "type": "bullet",
            "text": "Documents; and"
          },
          {
            "type": "bullet",
            "text": "Other content."
          },
          {
            "type": "paragraph",
            "text": "By submitting content, you represent that you have the legal right to share it."
          }
        ]
      },
      {
        "num": "9.7",
        "title": "Licence to Dozo",
        "elements": [
          {
            "type": "paragraph",
            "text": "By uploading content to the Platform, you grant Dozo a worldwide, non-exclusive, royalty-free, transferable licence (to the extent permitted by law) to host, store, reproduce, display, distribute, modify for technical formatting, and use such content solely for operating, improving, promoting, securing, and administering the Platform."
          },
          {
            "type": "paragraph",
            "text": "Ownership of your original content remains with you."
          }
        ]
      },
      {
        "num": "9.8",
        "title": "Prohibited Content",
        "elements": [
          {
            "type": "paragraph",
            "text": "Users and Helpers must not upload or distribute content that:"
          },
          {
            "type": "bullet",
            "text": "Is unlawful;"
          },
          {
            "type": "bullet",
            "text": "Is fraudulent or misleading;"
          },
          {
            "type": "bullet",
            "text": "Promotes violence;"
          },
          {
            "type": "bullet",
            "text": "Contains pornography or sexually explicit material;"
          },
          {
            "type": "bullet",
            "text": "Promotes illegal drugs or criminal activity;"
          },
          {
            "type": "bullet",
            "text": "Infringes intellectual property rights;"
          },
          {
            "type": "bullet",
            "text": "Contains malicious software;"
          },
          {
            "type": "bullet",
            "text": "Violates another person's privacy;"
          },
          {
            "type": "bullet",
            "text": "Reveals confidential information without authorization;"
          },
          {
            "type": "bullet",
            "text": "Contains spam or unsolicited commercial advertising."
          },
          {
            "type": "paragraph",
            "text": "Dozo may remove such content without prior notice."
          }
        ]
      },
      {
        "num": "9.9",
        "title": "Privacy of Others",
        "elements": [
          {
            "type": "paragraph",
            "text": "Users and Helpers must respect the privacy of others."
          },
          {
            "type": "paragraph",
            "text": "Without lawful authority or consent, you must not:"
          },
          {
            "type": "bullet",
            "text": "Publish another person's phone number."
          },
          {
            "type": "bullet",
            "text": "Share residential addresses."
          },
          {
            "type": "bullet",
            "text": "Share identity documents."
          },
          {
            "type": "bullet",
            "text": "Upload photographs intended to violate privacy."
          },
          {
            "type": "bullet",
            "text": "Record private conversations unlawfully."
          },
          {
            "type": "bullet",
            "text": "Publish sensitive personal information."
          }
        ]
      },
      {
        "num": "9.10",
        "title": "Reporting Violations",
        "elements": [
          {
            "type": "paragraph",
            "text": "Users and Helpers are encouraged to report:"
          },
          {
            "type": "bullet",
            "text": "Fraud;"
          },
          {
            "type": "bullet",
            "text": "Safety concerns;"
          },
          {
            "type": "bullet",
            "text": "Fake accounts;"
          },
          {
            "type": "bullet",
            "text": "Inappropriate reviews;"
          },
          {
            "type": "bullet",
            "text": "Harassment;"
          },
          {
            "type": "bullet",
            "text": "Discrimination;"
          },
          {
            "type": "bullet",
            "text": "Illegal activity; or"
          },
          {
            "type": "bullet",
            "text": "Other violations of these Terms."
          },
          {
            "type": "paragraph",
            "text": "Reports should be made honestly and in good faith."
          },
          {
            "type": "paragraph",
            "text": "Knowingly submitting false reports is prohibited."
          }
        ]
      },
      {
        "num": "9.11",
        "title": "Content Moderation",
        "elements": [
          {
            "type": "paragraph",
            "text": "To protect the Platform, Dozo may review, restrict, remove, edit, or disable access to content that reasonably appears to violate:"
          },
          {
            "type": "bullet",
            "text": "These Terms;"
          },
          {
            "type": "bullet",
            "text": "Community Guidelines;"
          },
          {
            "type": "bullet",
            "text": "Applicable law;"
          },
          {
            "type": "bullet",
            "text": "Intellectual property rights; or"
          },
          {
            "type": "bullet",
            "text": "Platform safety standards."
          },
          {
            "type": "paragraph",
            "text": "Content moderation decisions will be made using reasonable judgment and may involve automated systems together with human review where appropriate."
          }
        ]
      },
      {
        "num": "9.12",
        "title": "Identity Misrepresentation",
        "elements": [
          {
            "type": "paragraph",
            "text": "Users and Helpers must not:"
          },
          {
            "type": "bullet",
            "text": "Impersonate another individual."
          },
          {
            "type": "bullet",
            "text": "Create fake profiles."
          },
          {
            "type": "bullet",
            "text": "Misrepresent qualifications."
          },
          {
            "type": "bullet",
            "text": "Misrepresent professional licences."
          },
          {
            "type": "bullet",
            "text": "Use another person's photographs or identity."
          },
          {
            "type": "bullet",
            "text": "Claim affiliations that do not exist."
          },
          {
            "type": "paragraph",
            "text": "Misrepresentation may result in immediate suspension pending investigation."
          }
        ]
      },
      {
        "num": "9.13",
        "title": "Anti-Fraud Policy",
        "elements": [
          {
            "type": "paragraph",
            "text": "Activities prohibited on the Platform include:"
          },
          {
            "type": "bullet",
            "text": "Fake bookings;"
          },
          {
            "type": "bullet",
            "text": "Artificial inflation of ratings;"
          },
          {
            "type": "bullet",
            "text": "Fake referrals;"
          },
          {
            "type": "bullet",
            "text": "Coupon abuse;"
          },
          {
            "type": "bullet",
            "text": "Payment fraud;"
          },
          {
            "type": "bullet",
            "text": "Identity fraud;"
          },
          {
            "type": "bullet",
            "text": "Collusion between accounts;"
          },
          {
            "type": "bullet",
            "text": "Manipulation of Platform algorithms."
          },
          {
            "type": "paragraph",
            "text": "Dozo may investigate suspicious activity and take appropriate enforcement action."
          }
        ]
      },
      {
        "num": "9.14",
        "title": "Equal Opportunity",
        "elements": [
          {
            "type": "paragraph",
            "text": "Dozo seeks to provide equal access to the Platform."
          },
          {
            "type": "paragraph",
            "text": "Users and Helpers must not refuse, deny, or provide inferior treatment on the basis of any characteristic protected under applicable law, except where a lawful exception applies."
          }
        ]
      },
      {
        "num": "9.15",
        "title": "Community Safety",
        "elements": [
          {
            "type": "paragraph",
            "text": "All members of the Dozo community share responsibility for maintaining a safe marketplace."
          },
          {
            "type": "paragraph",
            "text": "Users and Helpers should:"
          },
          {
            "type": "bullet",
            "text": "Exercise reasonable judgment."
          },
          {
            "type": "bullet",
            "text": "Report unsafe situations."
          },
          {
            "type": "bullet",
            "text": "Respect personal boundaries."
          },
          {
            "type": "bullet",
            "text": "Cooperate during safety investigations."
          },
          {
            "type": "bullet",
            "text": "Follow Platform safety guidance."
          }
        ]
      },
      {
        "num": "9.16",
        "title": "Enforcement",
        "elements": [
          {
            "type": "paragraph",
            "text": "Where Dozo reasonably determines that a User or Helper has violated this Chapter, Dozo may take proportionate action, including:"
          },
          {
            "type": "bullet",
            "text": "Issuing warnings;"
          },
          {
            "type": "bullet",
            "text": "Removing content;"
          },
          {
            "type": "bullet",
            "text": "Restricting Platform features;"
          },
          {
            "type": "bullet",
            "text": "Suspending accounts;"
          },
          {
            "type": "bullet",
            "text": "Permanently terminating Platform access;"
          },
          {
            "type": "bullet",
            "text": "Cancelling affected Bookings; or"
          },
          {
            "type": "bullet",
            "text": "Reporting unlawful conduct to appropriate authorities where required by law."
          },
          {
            "type": "paragraph",
            "text": "Where appropriate, Dozo may provide an opportunity for the affected party to respond before taking permanent action."
          }
        ]
      },
      {
        "num": "9.17",
        "title": "Appeals",
        "elements": [
          {
            "type": "paragraph",
            "text": "Where a User or Helper believes enforcement action was taken in error, they may submit an appeal through the official support channels."
          },
          {
            "type": "paragraph",
            "text": "Dozo will review the appeal in good faith and may request additional information before making a final decision."
          }
        ]
      },
      {
        "num": "9.18",
        "title": "Commitment to the Dozo Community",
        "elements": [
          {
            "type": "paragraph",
            "text": "The success of Dozo depends upon mutual trust between Users, Helpers, and the Platform."
          },
          {
            "type": "paragraph",
            "text": "By using Dozo, you agree to contribute to a community built on honesty, professionalism, respect, accountability, and fairness."
          },
          {
            "type": "paragraph",
            "text": "These standards help create a marketplace where individuals can confidently request services, offer their skills, and build lasting relationships within a safe and transparent environment."
          }
        ]
      }
    ]
  },
  {
    "number": 10,
    "title": "Safety Standards & Emergency Procedures",
    "sections": [
      {
        "num": "10.1",
        "title": "Purpose",
        "elements": [
          {
            "type": "paragraph",
            "text": "The safety of Users, Helpers, employees, contractors, and the broader Dozo community is a core priority."
          },
          {
            "type": "paragraph",
            "text": "This Chapter establishes the minimum safety standards expected from all Platform participants and outlines the procedures applicable to safety-related incidents occurring before, during, or after a Booking."
          }
        ]
      },
      {
        "num": "10.2",
        "title": "Shared Responsibility",
        "elements": [
          {
            "type": "paragraph",
            "text": "Safety is a shared responsibility."
          },
          {
            "type": "paragraph",
            "text": "Users, Helpers, and Dozo each play an important role in maintaining a secure, respectful, and professional marketplace."
          },
          {
            "type": "paragraph",
            "text": "Every participant is expected to act reasonably, responsibly, and in good faith."
          }
        ]
      },
      {
        "num": "10.3",
        "title": "Safe Service Environment",
        "elements": [
          {
            "type": "paragraph",
            "text": "Users must provide a service environment that is reasonably safe for the agreed work."
          },
          {
            "type": "paragraph",
            "text": "Users should:"
          },
          {
            "type": "bullet",
            "text": "Ensure access pathways are reasonably safe."
          },
          {
            "type": "bullet",
            "text": "Inform Helpers of known hazards before work begins."
          },
          {
            "type": "bullet",
            "text": "Keep dangerous animals appropriately restrained where necessary."
          },
          {
            "type": "bullet",
            "text": "Maintain a workplace free from unlawful or dangerous conditions."
          },
          {
            "type": "bullet",
            "text": "Provide adequate information regarding any unusual risks relevant to the requested service."
          },
          {
            "type": "paragraph",
            "text": "Helpers may refuse or discontinue a Booking where they reasonably believe that continuing the work would create an unacceptable safety risk."
          }
        ]
      },
      {
        "num": "10.4",
        "title": "Helper Safety Obligations",
        "elements": [
          {
            "type": "paragraph",
            "text": "Helpers are expected to:"
          },
          {
            "type": "bullet",
            "text": "Follow applicable safety regulations."
          },
          {
            "type": "bullet",
            "text": "Use appropriate tools and equipment."
          },
          {
            "type": "bullet",
            "text": "Wear protective equipment where reasonably required."
          },
          {
            "type": "bullet",
            "text": "Perform services within the limits of their training and competence."
          },
          {
            "type": "bullet",
            "text": "Stop work immediately if continuing would create a serious safety risk."
          },
          {
            "type": "bullet",
            "text": "Comply with all lawful health and safety requirements."
          }
        ]
      },
      {
        "num": "10.5",
        "title": "User Conduct",
        "elements": [
          {
            "type": "paragraph",
            "text": "Users must not:"
          },
          {
            "type": "bullet",
            "text": "Threaten or intimidate Helpers."
          },
          {
            "type": "bullet",
            "text": "Engage in violent or abusive behaviour."
          },
          {
            "type": "bullet",
            "text": "Require Helpers to perform unlawful activities."
          },
          {
            "type": "bullet",
            "text": "Request work that materially exceeds the agreed Booking without mutual agreement."
          },
          {
            "type": "bullet",
            "text": "Force a Helper to continue working in unsafe conditions."
          },
          {
            "type": "paragraph",
            "text": "Repeated safety violations may result in permanent removal from the Platform."
          }
        ]
      },
      {
        "num": "10.6",
        "title": "Helper Conduct",
        "elements": [
          {
            "type": "paragraph",
            "text": "Helpers must not:"
          },
          {
            "type": "bullet",
            "text": "Enter a property without permission."
          },
          {
            "type": "bullet",
            "text": "Damage property intentionally."
          },
          {
            "type": "bullet",
            "text": "Carry prohibited weapons except where expressly permitted by applicable law and the relevant service"
          },
          {
            "type": "paragraph",
            "text": "category."
          },
          {
            "type": "bullet",
            "text": "Consume alcohol or unlawful substances while providing services."
          },
          {
            "type": "bullet",
            "text": "Harass, intimidate, or discriminate against Users."
          },
          {
            "type": "bullet",
            "text": "Ignore reasonable safety instructions."
          }
        ]
      },
      {
        "num": "10.7",
        "title": "Emergency Situations",
        "elements": [
          {
            "type": "paragraph",
            "text": "The Dozo Platform is **not an emergency service**."
          },
          {
            "type": "paragraph",
            "text": "Users must not rely on Dozo for:"
          },
          {
            "type": "bullet",
            "text": "Police assistance;"
          },
          {
            "type": "bullet",
            "text": "Fire and rescue services;"
          },
          {
            "type": "bullet",
            "text": "Ambulance or medical emergencies;"
          },
          {
            "type": "bullet",
            "text": "Disaster response; or"
          },
          {
            "type": "bullet",
            "text": "Any other urgent emergency response."
          },
          {
            "type": "paragraph",
            "text": "In the event of an emergency, Users and Helpers should immediately contact the appropriate emergency services."
          }
        ]
      },
      {
        "num": "10.8",
        "title": "Incident Reporting",
        "elements": [
          {
            "type": "paragraph",
            "text": "Users and Helpers should promptly report serious incidents through the Platform, including:"
          },
          {
            "type": "bullet",
            "text": "Physical injuries;"
          },
          {
            "type": "bullet",
            "text": "Threats or violence;"
          },
          {
            "type": "bullet",
            "text": "Property damage;"
          },
          {
            "type": "bullet",
            "text": "Theft;"
          },
          {
            "type": "bullet",
            "text": "Fraud;"
          },
          {
            "type": "bullet",
            "text": "Harassment;"
          },
          {
            "type": "bullet",
            "text": "Discrimination;"
          },
          {
            "type": "bullet",
            "text": "Criminal conduct; or"
          },
          {
            "type": "bullet",
            "text": "Other significant safety concerns."
          },
          {
            "type": "paragraph",
            "text": "Reports should be truthful, complete, and made in good faith."
          }
        ]
      },
      {
        "num": "10.9",
        "title": "Investigation of Safety Incidents",
        "elements": [
          {
            "type": "paragraph",
            "text": "Where a safety incident is reported, Dozo may:"
          },
          {
            "type": "bullet",
            "text": "Collect information from the parties involved."
          },
          {
            "type": "bullet",
            "text": "Review communications and Booking records."
          },
          {
            "type": "bullet",
            "text": "Request photographs, videos, or supporting documents."
          },
          {
            "type": "bullet",
            "text": "Temporarily suspend affected accounts where reasonably necessary."
          },
          {
            "type": "bullet",
            "text": "Cooperate with law enforcement or regulatory authorities where legally required."
          },
          {
            "type": "paragraph",
            "text": "Dozo will make reasonable efforts to conduct investigations fairly, impartially, and with respect for the rights of all parties."
          }
        ]
      },
      {
        "num": "10.10",
        "title": "Privacy During Investigations",
        "elements": [
          {
            "type": "paragraph",
            "text": "Information obtained during safety investigations will be handled in accordance with the Dozo Privacy Policy and applicable law."
          },
          {
            "type": "paragraph",
            "text": "Access to such information will be limited to individuals who reasonably require it for investigation, legal compliance, or dispute resolution."
          }
        ]
      },
      {
        "num": "10.11",
        "title": "Illegal Activity",
        "elements": [
          {
            "type": "paragraph",
            "text": "Dozo strictly prohibits use of the Platform for unlawful purposes."
          },
          {
            "type": "paragraph",
            "text": "Where Dozo reasonably believes that criminal activity may have occurred, it may preserve relevant records and cooperate with competent authorities in accordance with applicable law."
          }
        ]
      },
      {
        "num": "10.12",
        "title": "Health and Hygiene",
        "elements": [
          {
            "type": "paragraph",
            "text": "Where relevant to the service being provided, Users and Helpers are expected to maintain reasonable standards of cleanliness, hygiene, and public health."
          },
          {
            "type": "paragraph",
            "text": "Helpers should not knowingly attend a Booking while suffering from a contagious condition that could create a material risk to others, unless appropriate precautions are taken and permitted by applicable health guidance."
          }
        ]
      },
      {
        "num": "10.13",
        "title": "Personal Belongings",
        "elements": [
          {
            "type": "paragraph",
            "text": "Users remain responsible for safeguarding their valuables and personal belongings."
          },
          {
            "type": "paragraph",
            "text": "Helpers remain responsible for their own tools, equipment, and personal property."
          },
          {
            "type": "paragraph",
            "text": "Dozo encourages both parties to take reasonable precautions before, during, and after each Booking."
          }
        ]
      },
      {
        "num": "10.14",
        "title": "Insurance",
        "elements": [
          {
            "type": "paragraph",
            "text": "Dozo may, from time to time, introduce optional or mandatory insurance programs for certain service categories."
          },
          {
            "type": "paragraph",
            "text": "Unless expressly stated otherwise, Users and Helpers remain responsible for obtaining any insurance required by law or appropriate for their activities."
          },
          {
            "type": "paragraph",
            "text": "Participation in any insurance program is subject to the applicable policy terms."
          }
        ]
      },
      {
        "num": "10.15",
        "title": "Suspension for Safety Reasons",
        "elements": [
          {
            "type": "paragraph",
            "text": "Where Dozo reasonably believes that continued Platform access presents a significant risk to the safety of Users, Helpers, or the Platform, Dozo may temporarily restrict or suspend the relevant account while the matter is reviewed."
          },
          {
            "type": "paragraph",
            "text": "Such action may be taken without prior notice where immediate intervention is reasonably necessary to prevent harm."
          }
        ]
      },
      {
        "num": "10.16",
        "title": "Safety Education",
        "elements": [
          {
            "type": "paragraph",
            "text": "Dozo may publish educational materials, recommendations, training resources, or best practices to help Users and Helpers promote safe interactions."
          },
          {
            "type": "paragraph",
            "text": "Users and Helpers are encouraged to review and follow such guidance where relevant."
          }
        ]
      },
      {
        "num": "10.17",
        "title": "Good Faith Cooperation",
        "elements": [
          {
            "type": "paragraph",
            "text": "Users and Helpers agree to cooperate reasonably during safety investigations, including providing accurate information and relevant evidence when requested."
          },
          {
            "type": "paragraph",
            "text": "Knowingly providing false or misleading information may result in enforcement action."
          }
        ]
      },
      {
        "num": "10.18",
        "title": "Commitment to Safety",
        "elements": [
          {
            "type": "paragraph",
            "text": "Dozo is committed to fostering a marketplace where every participant is treated with dignity, respect, and care."
          },
          {
            "type": "paragraph",
            "text": "Maintaining a safe environment requires cooperation from Users, Helpers, and Dozo alike. Compliance with this Chapter is a condition of continued access to the Platform."
          }
        ]
      }
    ]
  },
  {
    "number": 11,
    "title": "Identity Verification & KYC",
    "sections": [
      {
        "num": "11.1",
        "title": "Purpose",
        "elements": [
          {
            "type": "paragraph",
            "text": "To promote trust, safety, fraud prevention, and compliance with applicable laws, Dozo may require identity verification (\"KYC\" or \"Know Your Customer\") for Users, Helpers, and, where applicable, business entities using the Platform."
          },
          {
            "type": "paragraph",
            "text": "Verification requirements may vary depending on the type of account, service category, payment method, legal obligations, or assessed risk."
          }
        ]
      },
      {
        "num": "11.2",
        "title": "Verification Is Not Mandatory for All Features",
        "elements": [
          {
            "type": "paragraph",
            "text": "Certain Platform features may be accessible without completing full verification."
          },
          {
            "type": "paragraph",
            "text": "However, Dozo may restrict or disable access to specific features, services, or payment capabilities until the required verification has been completed."
          }
        ]
      },
      {
        "num": "11.3",
        "title": "User Verification",
        "elements": [
          {
            "type": "paragraph",
            "text": "Where required, Users may be asked to provide one or more of the following:"
          },
          {
            "type": "bullet",
            "text": "Full legal name;"
          },
          {
            "type": "bullet",
            "text": "Mobile number verification (OTP);"
          },
          {
            "type": "bullet",
            "text": "Email verification;"
          },
          {
            "type": "bullet",
            "text": "Date of birth;"
          },
          {
            "type": "bullet",
            "text": "Government-issued identity document, where legally required;"
          },
          {
            "type": "bullet",
            "text": "Residential address or address proof, where appropriate;"
          },
          {
            "type": "bullet",
            "text": "Selfie or live facial verification, where reasonably necessary and legally permitted."
          },
          {
            "type": "paragraph",
            "text": "Users must ensure that all submitted information is accurate, current, and belongs to them."
          }
        ]
      },
      {
        "num": "11.4",
        "title": "Helper Verification",
        "elements": [
          {
            "type": "paragraph",
            "text": "Before offering services, Helpers may be required to complete enhanced verification, which may include:"
          },
          {
            "type": "bullet",
            "text": "Government-issued identity proof;"
          },
          {
            "type": "bullet",
            "text": "Address verification;"
          },
          {
            "type": "bullet",
            "text": "Recent photograph or selfie verification;"
          },
          {
            "type": "bullet",
            "text": "Bank account verification for payouts;"
          },
          {
            "type": "bullet",
            "text": "Tax-related information where required by law;"
          },
          {
            "type": "bullet",
            "text": "Professional licences or certifications relevant to the services offered;"
          },
          {
            "type": "bullet",
            "text": "Business registration documents, where applicable; and"
          },
          {
            "type": "bullet",
            "text": "Additional verification reasonably required for trust, safety, or legal compliance."
          },
          {
            "type": "paragraph",
            "text": "Completion of verification does not guarantee approval. Dozo may decline or defer approval where verification cannot be satisfactorily completed."
          }
        ]
      },
      {
        "num": "11.5",
        "title": "Business Verification",
        "elements": [
          {
            "type": "paragraph",
            "text": "Organizations registering business accounts may be asked to provide:"
          },
          {
            "type": "bullet",
            "text": "Business name;"
          },
          {
            "type": "bullet",
            "text": "Registration details;"
          },
          {
            "type": "bullet",
            "text": "Authorized representative information;"
          },
          {
            "type": "bullet",
            "text": "Tax registration details, where applicable;"
          },
          {
            "type": "bullet",
            "text": "Corporate address; and"
          },
          {
            "type": "bullet",
            "text": "Any additional documentation reasonably required to verify authority and legitimacy."
          },
          {
            "type": "paragraph",
            "text": "The person completing registration confirms that they are authorized to act on behalf of the organization."
          }
        ]
      },
      {
        "num": "11.6",
        "title": "Bank Account Verification",
        "elements": [
          {
            "type": "paragraph",
            "text": "Where Helpers receive payouts through the Platform, Dozo may require verification of the designated bank account or other supported payout method."
          },
          {
            "type": "paragraph",
            "text": "Helpers are responsible for ensuring that payout information is accurate and belongs to them or their authorized business."
          },
          {
            "type": "paragraph",
            "text": "Dozo is not responsible for delays or losses resulting from incorrect banking information provided by the Helper."
          }
        ]
      },
      {
        "num": "11.7",
        "title": "Re-Verification",
        "elements": [
          {
            "type": "paragraph",
            "text": "Dozo may require Users or Helpers to undergo re-verification where reasonably necessary, including when:"
          },
          {
            "type": "bullet",
            "text": "Account information changes materially;"
          },
          {
            "type": "bullet",
            "text": "Suspicious activity is detected;"
          },
          {
            "type": "bullet",
            "text": "Required by law or a regulatory authority;"
          },
          {
            "type": "bullet",
            "text": "Identity documents expire;"
          },
          {
            "type": "bullet",
            "text": "Security concerns arise; or"
          },
          {
            "type": "bullet",
            "text": "Periodic compliance reviews are conducted."
          },
          {
            "type": "paragraph",
            "text": "Failure to complete required re-verification may result in temporary restrictions or suspension of the relevant account."
          }
        ]
      },
      {
        "num": "11.8",
        "title": "Fraud Prevention",
        "elements": [
          {
            "type": "paragraph",
            "text": "To protect the Platform and its community, Dozo may use reasonable technical and operational measures to detect and prevent fraud, including review of account activity, device information, transaction patterns, and other relevant indicators."
          },
          {
            "type": "paragraph",
            "text": "Where suspicious activity is identified, Dozo may request additional verification before allowing continued access to the Platform."
          }
        ]
      },
      {
        "num": "11.9",
        "title": "Background Checks",
        "elements": [
          {
            "type": "paragraph",
            "text": "For certain service categories where safety is particularly important, Dozo may request or facilitate additional checks, such as criminal background verification or reference verification, where permitted by applicable law."
          },
          {
            "type": "paragraph",
            "text": "Any such checks will be conducted in accordance with applicable legal requirements and, where required, with the individual's knowledge or consent."
          },
          {
            "type": "paragraph",
            "text": "Completion of a background check does not constitute a guarantee regarding future conduct."
          }
        ]
      },
      {
        "num": "11.10",
        "title": "Accuracy of Submitted Information",
        "elements": [
          {
            "type": "paragraph",
            "text": "Users and Helpers represent and warrant that all documents and information submitted during verification:"
          },
          {
            "type": "bullet",
            "text": "Are genuine;"
          },
          {
            "type": "bullet",
            "text": "Have not been altered or falsified;"
          },
          {
            "type": "bullet",
            "text": "Belong to the submitting individual or authorized business;"
          },
          {
            "type": "bullet",
            "text": "Are complete and accurate to the best of their knowledge."
          },
          {
            "type": "paragraph",
            "text": "Submission of forged, stolen, expired (where not accepted), or fraudulent documents may result in immediate suspension or permanent termination of Platform access and, where appropriate, referral to competent authorities."
          }
        ]
      },
      {
        "num": "11.11",
        "title": "Confidential Handling of Verification Information",
        "elements": [
          {
            "type": "paragraph",
            "text": "Verification documents and related information will be handled in accordance with the Dozo Privacy Policy and applicable data protection laws."
          },
          {
            "type": "paragraph",
            "text": "Access will be limited to personnel, service providers, or authorities who require such information for verification, legal compliance, fraud prevention, or dispute resolution."
          }
        ]
      },
      {
        "num": "11.12",
        "title": "Third-Party Verification Providers",
        "elements": [
          {
            "type": "paragraph",
            "text": "Dozo may engage trusted third-party providers to assist with identity verification, document authentication, payment verification, or other compliance processes."
          },
          {
            "type": "paragraph",
            "text": "Where third-party providers are used, they will process information only for authorized purposes and in accordance with applicable contractual and legal obligations."
          }
        ]
      },
      {
        "num": "11.13",
        "title": "Verification Does Not Constitute Endorsement",
        "elements": [
          {
            "type": "paragraph",
            "text": "Verification by Dozo confirms only that certain information or documents have been reviewed to the extent described by the applicable verification process."
          },
          {
            "type": "paragraph",
            "text": "Verification should not be interpreted as:"
          },
          {
            "type": "bullet",
            "text": "A guarantee of honesty;"
          },
          {
            "type": "bullet",
            "text": "A guarantee of competence;"
          },
          {
            "type": "bullet",
            "text": "A professional certification;"
          },
          {
            "type": "bullet",
            "text": "A warranty of future behaviour;"
          },
          {
            "type": "bullet",
            "text": "A guarantee of safety; or"
          },
          {
            "type": "bullet",
            "text": "An endorsement by Dozo."
          },
          {
            "type": "paragraph",
            "text": "Users and Helpers remain responsible for exercising reasonable judgment in their interactions."
          }
        ]
      },
      {
        "num": "11.14",
        "title": "Refusal or Withdrawal of Verification",
        "elements": [
          {
            "type": "paragraph",
            "text": "Dozo reserves the right to refuse, suspend, or withdraw verification status where:"
          },
          {
            "type": "bullet",
            "text": "Information cannot be verified;"
          },
          {
            "type": "bullet",
            "text": "False information is provided;"
          },
          {
            "type": "bullet",
            "text": "Fraud is reasonably suspected;"
          },
          {
            "type": "bullet",
            "text": "Verification documents are inconsistent or invalid;"
          },
          {
            "type": "bullet",
            "text": "Continued verification would conflict with legal or regulatory obligations; or"
          },
          {
            "type": "bullet",
            "text": "Other reasonable trust and safety concerns arise."
          },
          {
            "type": "paragraph",
            "text": "Where appropriate, affected individuals may be invited to provide additional information before a final decision is made."
          }
        ]
      },
      {
        "num": "11.15",
        "title": "Record Retention",
        "elements": [
          {
            "type": "paragraph",
            "text": "Verification records may be retained for the period reasonably necessary to:"
          },
          {
            "type": "bullet",
            "text": "Comply with applicable law;"
          },
          {
            "type": "bullet",
            "text": "Resolve disputes;"
          },
          {
            "type": "bullet",
            "text": "Prevent fraud;"
          },
          {
            "type": "bullet",
            "text": "Enforce these Terms;"
          },
          {
            "type": "bullet",
            "text": "Meet tax, accounting, or regulatory obligations; and"
          },
          {
            "type": "bullet",
            "text": "Protect the rights, safety, and security of Dozo and its community."
          },
          {
            "type": "paragraph",
            "text": "Retention periods will be determined in accordance with applicable legal requirements and the Dozo Privacy Policy."
          }
        ]
      },
      {
        "num": "11.16",
        "title": "User Responsibilities During Verification",
        "elements": [
          {
            "type": "paragraph",
            "text": "Users and Helpers agree to:"
          },
          {
            "type": "bullet",
            "text": "Cooperate with reasonable verification requests;"
          },
          {
            "type": "bullet",
            "text": "Respond honestly to follow-up questions;"
          },
          {
            "type": "bullet",
            "text": "Promptly update information when material changes occur;"
          },
          {
            "type": "bullet",
            "text": "Protect the confidentiality of their own identity documents; and"
          },
          {
            "type": "bullet",
            "text": "Notify Dozo if they believe their identity has been compromised or misused."
          }
        ]
      },
      {
        "num": "11.17",
        "title": "Compliance with Applicable Law",
        "elements": [
          {
            "type": "paragraph",
            "text": "Verification activities conducted by Dozo will be carried out in accordance with applicable laws relating to privacy, data protection, anti-fraud measures, consumer protection, financial compliance, and other relevant legal obligations."
          },
          {
            "type": "paragraph",
            "text": "Where legal requirements change, Dozo may update its verification procedures accordingly."
          }
        ]
      },
      {
        "num": "11.18",
        "title": "Commitment to Trust",
        "elements": [
          {
            "type": "paragraph",
            "text": "Identity verification is intended to strengthen confidence in the Dozo marketplace by reducing fraud, improving accountability, and enhancing user safety."
          },
          {
            "type": "paragraph",
            "text": "By using the Platform, Users and Helpers acknowledge that reasonable verification measures are an essential component of maintaining a secure, reliable, and trusted marketplace."
          }
        ]
      }
    ]
  },
  {
    "number": 12,
    "title": "Intellectual Property Rights",
    "sections": [
      {
        "num": "12.1",
        "title": "Purpose",
        "elements": [
          {
            "type": "paragraph",
            "text": "This Chapter governs the ownership, protection, and permitted use of the intellectual property associated with the Dozo Platform."
          },
          {
            "type": "paragraph",
            "text": "All Users and Helpers agree to respect the intellectual property rights of Dozo and third parties while using the Platform."
          }
        ]
      },
      {
        "num": "12.2",
        "title": "Ownership of the Platform",
        "elements": [
          {
            "type": "paragraph",
            "text": "Unless expressly stated otherwise, the Dozo Platform, including its website, mobile applications, software, source code, object code, user interface, visual design, graphics, logos, icons, trademarks, databases, APIs, workflows, algorithms, AI systems, documentation, text, audio, video, images, layouts, and other proprietary materials are owned by or licensed to Dozo and are protected under applicable intellectual property laws."
          },
          {
            "type": "paragraph",
            "text": "Nothing in these Terms transfers ownership of any intellectual property from Dozo to any User or Helper."
          }
        ]
      },
      {
        "num": "12.3",
        "title": "Dozo Name and Branding",
        "elements": [
          {
            "type": "paragraph",
            "text": "The names **\"Dozo\"**, **\"Dozo.work\"**, logos, trademarks, service marks, trade dress, slogans, branding elements, and other distinctive identifiers are the exclusive property of Dozo or its licensors."
          },
          {
            "type": "paragraph",
            "text": "Users and Helpers shall not:"
          },
          {
            "type": "bullet",
            "text": "Use the Dozo name in a misleading manner;"
          },
          {
            "type": "bullet",
            "text": "Register confusingly similar domain names;"
          },
          {
            "type": "bullet",
            "text": "Create imitation websites or applications;"
          },
          {
            "type": "bullet",
            "text": "Use Dozo branding without prior written authorization;"
          },
          {
            "type": "bullet",
            "text": "Suggest sponsorship or endorsement where none exists."
          }
        ]
      },
      {
        "num": "12.4",
        "title": "Limited Licence to Use the Platform",
        "elements": [
          {
            "type": "paragraph",
            "text": "Subject to these Terms, Dozo grants Users and Helpers a limited, personal, non-exclusive, non-transferable, non-sublicensable, and revocable licence to access and use the Platform solely for its intended purpose."
          },
          {
            "type": "paragraph",
            "text": "This licence does not transfer ownership of the Platform or any intellectual property."
          }
        ]
      },
      {
        "num": "12.5",
        "title": "Restrictions on Use",
        "elements": [
          {
            "type": "paragraph",
            "text": "Except as expressly permitted by applicable law or written authorization from Dozo, Users and Helpers must not:"
          },
          {
            "type": "bullet",
            "text": "Copy, reproduce, or republish Platform content;"
          },
          {
            "type": "bullet",
            "text": "Modify or create derivative works;"
          },
          {
            "type": "bullet",
            "text": "Reverse engineer, decompile, or disassemble software;"
          },
          {
            "type": "bullet",
            "text": "Circumvent technical protection measures;"
          },
          {
            "type": "bullet",
            "text": "Sell, license, rent, or commercially exploit Platform technology;"
          },
          {
            "type": "bullet",
            "text": "Extract or scrape Platform data using automated tools;"
          },
          {
            "type": "bullet",
            "text": "Use bots, crawlers, or automated systems to access the Platform without authorization;"
          },
          {
            "type": "bullet",
            "text": "Remove copyright or proprietary notices."
          }
        ]
      },
      {
        "num": "12.6",
        "title": "User-Generated Content",
        "elements": [
          {
            "type": "paragraph",
            "text": "Users and Helpers retain ownership of the original content they create and upload to the Platform, including reviews, profile information, photographs, videos, and other lawful materials."
          },
          {
            "type": "paragraph",
            "text": "By submitting such content, you confirm that:"
          },
          {
            "type": "bullet",
            "text": "You own the content or have the necessary rights to share it."
          },
          {
            "type": "bullet",
            "text": "The content does not infringe the rights of others."
          },
          {
            "type": "bullet",
            "text": "The content complies with these Terms and applicable law."
          }
        ]
      },
      {
        "num": "12.7",
        "title": "Licence Granted to Dozo",
        "elements": [
          {
            "type": "paragraph",
            "text": "By uploading or submitting content through the Platform, you grant Dozo a worldwide, non-exclusive, royalty-free, transferable (only as necessary in connection with business operations), sublicensable, and revocable licence to:"
          },
          {
            "type": "bullet",
            "text": "Host;"
          },
          {
            "type": "bullet",
            "text": "Store;"
          },
          {
            "type": "bullet",
            "text": "Display;"
          },
          {
            "type": "bullet",
            "text": "Reproduce;"
          },
          {
            "type": "bullet",
            "text": "Format;"
          },
          {
            "type": "bullet",
            "text": "Distribute;"
          },
          {
            "type": "bullet",
            "text": "Translate;"
          },
          {
            "type": "bullet",
            "text": "Adapt for technical compatibility; and"
          },
          {
            "type": "bullet",
            "text": "Use the content solely for operating, maintaining, improving, promoting, securing, and administering the"
          },
          {
            "type": "paragraph",
            "text": "Platform."
          },
          {
            "type": "paragraph",
            "text": "This licence ends when the content is deleted from the Platform, except where retention is reasonably necessary for legal compliance, dispute resolution, backup systems, fraud prevention, or enforcement of these Terms."
          }
        ]
      },
      {
        "num": "12.8",
        "title": "Feedback",
        "elements": [
          {
            "type": "paragraph",
            "text": "If a User or Helper voluntarily provides feedback, suggestions, ideas, feature requests, or recommendations regarding the Platform, Dozo may use such feedback without restriction or obligation to provide compensation, unless otherwise agreed in writing."
          },
          {
            "type": "paragraph",
            "text": "This does not affect any rights that cannot be waived under applicable law."
          }
        ]
      },
      {
        "num": "12.9",
        "title": "Third-Party Intellectual Property",
        "elements": [
          {
            "type": "paragraph",
            "text": "The Platform may contain third-party trademarks, logos, software, or content licensed to Dozo or lawfully displayed for informational purposes."
          },
          {
            "type": "paragraph",
            "text": "Ownership of such intellectual property remains with the respective rights holders."
          },
          {
            "type": "paragraph",
            "text": "Nothing in these Terms grants Users or Helpers any rights to use third-party intellectual property beyond what is expressly permitted."
          }
        ]
      },
      {
        "num": "12.10",
        "title": "Copyright Complaints",
        "elements": [
          {
            "type": "paragraph",
            "text": "If you believe that content available on the Platform infringes your copyright or other intellectual property rights, you may submit a written complaint through Dozo's designated legal or grievance contact."
          },
          {
            "type": "paragraph",
            "text": "The complaint should include sufficient information to identify:"
          },
          {
            "type": "bullet",
            "text": "The work claimed to be infringed;"
          },
          {
            "type": "bullet",
            "text": "The allegedly infringing material;"
          },
          {
            "type": "bullet",
            "text": "Your contact details;"
          },
          {
            "type": "bullet",
            "text": "A statement of your rights; and"
          },
          {
            "type": "bullet",
            "text": "Any other information reasonably required for investigation."
          },
          {
            "type": "paragraph",
            "text": "Dozo may remove or restrict access to disputed content while reviewing the complaint where appropriate."
          }
        ]
      },
      {
        "num": "12.11",
        "title": "Respect for Others' Rights",
        "elements": [
          {
            "type": "paragraph",
            "text": "Users and Helpers must not upload, publish, distribute, or use content that infringes:"
          },
          {
            "type": "bullet",
            "text": "Copyrights;"
          },
          {
            "type": "bullet",
            "text": "Trademarks;"
          },
          {
            "type": "bullet",
            "text": "Patents;"
          },
          {
            "type": "bullet",
            "text": "Trade secrets;"
          },
          {
            "type": "bullet",
            "text": "Design rights;"
          },
          {
            "type": "bullet",
            "text": "Database rights;"
          },
          {
            "type": "bullet",
            "text": "Rights of publicity;"
          },
          {
            "type": "bullet",
            "text": "Privacy rights; or"
          },
          {
            "type": "bullet",
            "text": "Any other legally protected intellectual property rights."
          }
        ]
      },
      {
        "num": "12.12",
        "title": "Artificial Intelligence and Platform Technology",
        "elements": [
          {
            "type": "paragraph",
            "text": "Dozo may use artificial intelligence, machine learning, automation, or other advanced technologies to improve search, recommendations, fraud prevention, customer support, safety systems, service matching, operational efficiency, and other Platform features."
          },
          {
            "type": "paragraph",
            "text": "Unless expressly permitted, Users and Helpers may not copy, extract, train, replicate, or commercially exploit Dozo's proprietary AI systems, datasets, algorithms, or technical processes."
          }
        ]
      },
      {
        "num": "12.13",
        "title": "Open Source Software",
        "elements": [
          {
            "type": "paragraph",
            "text": "Certain components of the Platform may incorporate open-source software licensed under applicable open-source licences."
          },
          {
            "type": "paragraph",
            "text": "Where such licences apply, the relevant open-source licence terms will govern those specific components."
          }
        ]
      },
      {
        "num": "12.14",
        "title": "Reservation of Rights",
        "elements": [
          {
            "type": "paragraph",
            "text": "All rights not expressly granted under these Terms are reserved by Dozo and its licensors."
          },
          {
            "type": "paragraph",
            "text": "No implied licence shall be created by the use of the Platform."
          }
        ]
      },
      {
        "num": "12.15",
        "title": "Injunctive Relief",
        "elements": [
          {
            "type": "paragraph",
            "text": "Users and Helpers acknowledge that unauthorized use of Dozo's intellectual property may cause irreparable harm."
          },
          {
            "type": "paragraph",
            "text": "Accordingly, in addition to other remedies available under applicable law, Dozo may seek injunctive or equitable relief to prevent or stop unauthorized use of its intellectual property."
          }
        ]
      },
      {
        "num": "12.16",
        "title": "Survival",
        "elements": [
          {
            "type": "paragraph",
            "text": "The obligations contained in this Chapter shall survive the suspension, termination, or closure of any account to the extent necessary to protect Dozo's intellectual property rights and enforce these Terms."
          }
        ]
      },
      {
        "num": "12.17",
        "title": "Commitment to Innovation",
        "elements": [
          {
            "type": "paragraph",
            "text": "Dozo invests significant resources in developing its technology, marketplace infrastructure, software, and brand."
          },
          {
            "type": "paragraph",
            "text": "Respecting intellectual property rights helps foster innovation, fair competition, and the continued growth of a trusted platform for Users and Helpers."
          }
        ]
      }
    ]
  },
  {
    "number": 13,
    "title": "Privacy & Data Protection",
    "sections": [
      {
        "num": "13.1",
        "title": "Purpose",
        "elements": [
          {
            "type": "paragraph",
            "text": "Dozo respects the privacy of its Users, Helpers, business partners, and visitors."
          },
          {
            "type": "paragraph",
            "text": "This Chapter explains the general principles governing the collection, use, storage, disclosure, and protection of personal information when using the Dozo Platform."
          },
          {
            "type": "paragraph",
            "text": "Detailed information regarding Dozo's privacy practices is available in the **Dozo Privacy Policy**, which forms an integral part of these Terms."
          }
        ]
      },
      {
        "num": "13.2",
        "title": "Scope",
        "elements": [
          {
            "type": "paragraph",
            "text": "This Chapter applies to all personal information processed through:"
          },
          {
            "type": "bullet",
            "text": "The Dozo website;"
          },
          {
            "type": "bullet",
            "text": "Mobile applications;"
          },
          {
            "type": "bullet",
            "text": "Customer support channels;"
          },
          {
            "type": "bullet",
            "text": "Booking services;"
          },
          {
            "type": "bullet",
            "text": "Payment-related interactions;"
          },
          {
            "type": "bullet",
            "text": "Identity verification processes; and"
          },
          {
            "type": "bullet",
            "text": "Any other Platform services provided by Dozo."
          }
        ]
      },
      {
        "num": "13.3",
        "title": "Information We May Collect",
        "elements": [
          {
            "type": "paragraph",
            "text": "Depending on how the Platform is used, Dozo may collect information including:"
          },
          {
            "type": "bullet",
            "text": "Name;"
          },
          {
            "type": "bullet",
            "text": "Mobile number;"
          },
          {
            "type": "bullet",
            "text": "Email address;"
          },
          {
            "type": "bullet",
            "text": "Date of birth (where required);"
          },
          {
            "type": "bullet",
            "text": "Profile photographs;"
          },
          {
            "type": "bullet",
            "text": "Identity verification documents;"
          },
          {
            "type": "bullet",
            "text": "Address information;"
          },
          {
            "type": "bullet",
            "text": "Payment-related information;"
          },
          {
            "type": "bullet",
            "text": "Booking history;"
          },
          {
            "type": "bullet",
            "text": "Device information;"
          },
          {
            "type": "bullet",
            "text": "IP address;"
          },
          {
            "type": "bullet",
            "text": "Browser and operating system information;"
          },
          {
            "type": "bullet",
            "text": "Location information (where permission is granted);"
          },
          {
            "type": "bullet",
            "text": "Communications made through the Platform;"
          },
          {
            "type": "bullet",
            "text": "Ratings and reviews; and"
          },
          {
            "type": "bullet",
            "text": "Other information voluntarily provided by Users or Helpers."
          },
          {
            "type": "paragraph",
            "text": "Collection is limited to information reasonably necessary for providing and improving the Platform, complying with legal obligations, and ensuring trust and safety."
          }
        ]
      },
      {
        "num": "13.4",
        "title": "Purpose of Processing",
        "elements": [
          {
            "type": "paragraph",
            "text": "Dozo may process personal information for purposes including:"
          },
          {
            "type": "bullet",
            "text": "Creating and managing accounts;"
          },
          {
            "type": "bullet",
            "text": "Facilitating Bookings;"
          },
          {
            "type": "bullet",
            "text": "Processing payments;"
          },
          {
            "type": "bullet",
            "text": "Verifying identities;"
          },
          {
            "type": "bullet",
            "text": "Preventing fraud and abuse;"
          },
          {
            "type": "bullet",
            "text": "Providing customer support;"
          },
          {
            "type": "bullet",
            "text": "Improving Platform functionality;"
          },
          {
            "type": "bullet",
            "text": "Personalizing user experience;"
          },
          {
            "type": "bullet",
            "text": "Sending service-related communications;"
          },
          {
            "type": "bullet",
            "text": "Complying with legal and regulatory obligations;"
          },
          {
            "type": "bullet",
            "text": "Resolving disputes; and"
          },
          {
            "type": "bullet",
            "text": "Protecting the safety, security, and integrity of the Platform."
          }
        ]
      },
      {
        "num": "13.5",
        "title": "Legal Basis",
        "elements": [
          {
            "type": "paragraph",
            "text": "Where required by applicable law, Dozo will process personal information on an appropriate legal basis, including:"
          },
          {
            "type": "bullet",
            "text": "User consent;"
          },
          {
            "type": "bullet",
            "text": "Performance of contractual obligations;"
          },
          {
            "type": "bullet",
            "text": "Compliance with legal requirements;"
          },
          {
            "type": "bullet",
            "text": "Legitimate business interests that do not override applicable legal rights; or"
          },
          {
            "type": "bullet",
            "text": "Other lawful grounds recognized under applicable legislation."
          }
        ]
      },
      {
        "num": "13.6",
        "title": "Consent",
        "elements": [
          {
            "type": "paragraph",
            "text": "Where consent is required, Dozo will seek it through clear and transparent mechanisms."
          },
          {
            "type": "paragraph",
            "text": "Users and Helpers may withdraw consent for specific processing activities where permitted by law. Withdrawal of consent may affect the availability of certain Platform features or services."
          }
        ]
      },
      {
        "num": "13.7",
        "title": "Data Accuracy",
        "elements": [
          {
            "type": "paragraph",
            "text": "Users and Helpers are responsible for ensuring that the information provided to Dozo remains accurate, complete, and up to date."
          },
          {
            "type": "paragraph",
            "text": "Dozo may request updates where information becomes outdated or inconsistent."
          }
        ]
      },
      {
        "num": "13.8",
        "title": "Sharing of Information",
        "elements": [
          {
            "type": "paragraph",
            "text": "Dozo may share personal information only where reasonably necessary, including with:"
          },
          {
            "type": "bullet",
            "text": "Authorized payment service providers;"
          },
          {
            "type": "bullet",
            "text": "Identity verification partners;"
          },
          {
            "type": "bullet",
            "text": "Cloud hosting and technology providers;"
          },
          {
            "type": "bullet",
            "text": "Customer support providers;"
          },
          {
            "type": "bullet",
            "text": "Analytics and security service providers;"
          },
          {
            "type": "bullet",
            "text": "Professional advisers;"
          },
          {
            "type": "bullet",
            "text": "Regulatory authorities;"
          },
          {
            "type": "bullet",
            "text": "Law enforcement agencies where required by law; and"
          },
          {
            "type": "bullet",
            "text": "Other trusted service providers engaged to support Platform operations."
          },
          {
            "type": "paragraph",
            "text": "Dozo does not sell personal information to third parties."
          }
        ]
      },
      {
        "num": "13.9",
        "title": "International Data Transfers",
        "elements": [
          {
            "type": "paragraph",
            "text": "Where personal information is transferred outside the jurisdiction in which it was collected, Dozo will implement reasonable safeguards consistent with applicable law."
          },
          {
            "type": "paragraph",
            "text": "Such safeguards may include contractual protections, technical measures, or other legally recognized mechanisms."
          }
        ]
      },
      {
        "num": "13.10",
        "title": "Data Security",
        "elements": [
          {
            "type": "paragraph",
            "text": "Dozo employs commercially reasonable administrative, technical, and organizational measures designed to protect personal information against unauthorized access, disclosure, alteration, loss, or destruction."
          },
          {
            "type": "paragraph",
            "text": "Examples of such measures may include:"
          },
          {
            "type": "bullet",
            "text": "Encryption where appropriate;"
          },
          {
            "type": "bullet",
            "text": "Secure network infrastructure;"
          },
          {
            "type": "bullet",
            "text": "Access controls;"
          },
          {
            "type": "bullet",
            "text": "Authentication mechanisms;"
          },
          {
            "type": "bullet",
            "text": "Monitoring for suspicious activity;"
          },
          {
            "type": "bullet",
            "text": "Regular security assessments; and"
          },
          {
            "type": "bullet",
            "text": "Employee confidentiality obligations."
          },
          {
            "type": "paragraph",
            "text": "While Dozo strives to maintain a high level of security, no internet-based system can be guaranteed to be completely secure."
          }
        ]
      },
      {
        "num": "13.11",
        "title": "Data Retention",
        "elements": [
          {
            "type": "paragraph",
            "text": "Personal information will be retained only for as long as reasonably necessary to:"
          },
          {
            "type": "bullet",
            "text": "Provide the Platform;"
          },
          {
            "type": "bullet",
            "text": "Comply with legal obligations;"
          },
          {
            "type": "bullet",
            "text": "Resolve disputes;"
          },
          {
            "type": "bullet",
            "text": "Prevent fraud;"
          },
          {
            "type": "bullet",
            "text": "Enforce these Terms;"
          },
          {
            "type": "bullet",
            "text": "Meet accounting and tax requirements; or"
          },
          {
            "type": "bullet",
            "text": "Protect the rights and safety of Dozo and its community."
          },
          {
            "type": "paragraph",
            "text": "When information is no longer required, Dozo will securely delete, anonymize, or otherwise dispose of it in accordance with applicable law."
          }
        ]
      },
      {
        "num": "13.12",
        "title": "User Rights",
        "elements": [
          {
            "type": "paragraph",
            "text": "Subject to applicable law, Users and Helpers may have the right to:"
          },
          {
            "type": "bullet",
            "text": "Request access to certain personal information;"
          },
          {
            "type": "bullet",
            "text": "Request correction of inaccurate information;"
          },
          {
            "type": "bullet",
            "text": "Request deletion of personal information where appropriate;"
          },
          {
            "type": "bullet",
            "text": "Withdraw consent where processing is based on consent;"
          },
          {
            "type": "bullet",
            "text": "Request information regarding certain processing activities;"
          },
          {
            "type": "bullet",
            "text": "Lodge complaints with the appropriate authority; and"
          },
          {
            "type": "bullet",
            "text": "Exercise other rights available under applicable data protection laws."
          },
          {
            "type": "paragraph",
            "text": "Requests may be submitted through Dozo's designated privacy or support channels."
          }
        ]
      },
      {
        "num": "13.13",
        "title": "Cookies and Similar Technologies",
        "elements": [
          {
            "type": "paragraph",
            "text": "Dozo may use cookies, device identifiers, pixels, and similar technologies to:"
          },
          {
            "type": "bullet",
            "text": "Remember user preferences;"
          },
          {
            "type": "bullet",
            "text": "Maintain secure sessions;"
          },
          {
            "type": "bullet",
            "text": "Improve Platform functionality;"
          },
          {
            "type": "bullet",
            "text": "Analyze usage;"
          },
          {
            "type": "bullet",
            "text": "Detect fraud;"
          },
          {
            "type": "bullet",
            "text": "Measure performance; and"
          },
          {
            "type": "bullet",
            "text": "Enhance user experience."
          },
          {
            "type": "paragraph",
            "text": "Additional information regarding cookies is provided in the Dozo Cookie Policy."
          }
        ]
      },
      {
        "num": "13.14",
        "title": "Children's Privacy",
        "elements": [
          {
            "type": "paragraph",
            "text": "The Platform is not intended for individuals below the minimum age permitted under applicable law to independently use the Platform."
          },
          {
            "type": "paragraph",
            "text": "Dozo does not knowingly collect personal information from children in violation of applicable law."
          },
          {
            "type": "paragraph",
            "text": "Where Dozo becomes aware of such collection, reasonable steps will be taken to delete the information unless retention is legally required."
          }
        ]
      },
      {
        "num": "13.15",
        "title": "Marketing Communications",
        "elements": [
          {
            "type": "paragraph",
            "text": "Dozo may send promotional communications where permitted by law."
          },
          {
            "type": "paragraph",
            "text": "Users may opt out of marketing communications using the unsubscribe mechanism provided in the communication or through their account settings."
          },
          {
            "type": "paragraph",
            "text": "Service-related communications necessary for the operation of the Platform may continue even after marketing preferences are changed."
          }
        ]
      },
      {
        "num": "13.16",
        "title": "Data Breach Response",
        "elements": [
          {
            "type": "paragraph",
            "text": "In the event of a confirmed personal data breach, Dozo will take reasonable steps to:"
          },
          {
            "type": "bullet",
            "text": "Investigate the incident;"
          },
          {
            "type": "bullet",
            "text": "Mitigate potential harm;"
          },
          {
            "type": "bullet",
            "text": "Restore system security;"
          },
          {
            "type": "bullet",
            "text": "Notify affected individuals where required by law; and"
          },
          {
            "type": "bullet",
            "text": "Notify relevant regulatory authorities where legally required."
          }
        ]
      },
      {
        "num": "13.17",
        "title": "Third-Party Services",
        "elements": [
          {
            "type": "paragraph",
            "text": "The Platform may integrate with third-party services such as payment gateways, mapping providers, communication tools, analytics services, and identity verification providers."
          },
          {
            "type": "paragraph",
            "text": "Use of such services may also be subject to the respective third party's privacy practices and terms."
          },
          {
            "type": "paragraph",
            "text": "Dozo encourages Users and Helpers to review those policies where relevant."
          }
        ]
      },
      {
        "num": "13.18",
        "title": "Compliance with Applicable Laws",
        "elements": [
          {
            "type": "paragraph",
            "text": "Dozo processes personal information in accordance with applicable privacy and data protection laws, including the **Digital Personal Data Protection Act, 2023 (India)** and any other laws applicable to the operation of the Platform."
          },
          {
            "type": "paragraph",
            "text": "Where legal requirements evolve, Dozo may update its privacy practices accordingly."
          }
        ]
      },
      {
        "num": "13.19",
        "title": "Privacy Policy",
        "elements": [
          {
            "type": "paragraph",
            "text": "The **Dozo Privacy Policy** forms an integral part of these Terms."
          },
          {
            "type": "paragraph",
            "text": "In the event of any inconsistency between this Chapter and the Privacy Policy regarding detailed data processing practices, the Privacy Policy shall prevail to the extent permitted by applicable law."
          }
        ]
      },
      {
        "num": "13.20",
        "title": "Commitment to Privacy",
        "elements": [
          {
            "type": "paragraph",
            "text": "Protecting personal information is fundamental to maintaining trust in the Dozo marketplace."
          },
          {
            "type": "paragraph",
            "text": "Dozo is committed to processing personal information responsibly, transparently, and securely while continuously improving its privacy and security practices in accordance with evolving technology, legal requirements, and industry standards."
          }
        ]
      }
    ]
  },
  {
    "number": 14,
    "title": "Prohibited Activities",
    "sections": [
      {
        "num": "14.1",
        "title": "Purpose",
        "elements": [
          {
            "type": "paragraph",
            "text": "This Chapter identifies activities that are prohibited on the Dozo Platform in order to protect Users, Helpers, Dozo, and the integrity of the marketplace."
          },
          {
            "type": "paragraph",
            "text": "All Users and Helpers agree to comply with these restrictions while accessing or using the Platform."
          }
        ]
      },
      {
        "num": "14.2",
        "title": "General Obligation",
        "elements": [
          {
            "type": "paragraph",
            "text": "Users and Helpers must use the Platform:"
          },
          {
            "type": "bullet",
            "text": "Lawfully;"
          },
          {
            "type": "bullet",
            "text": "Honestly;"
          },
          {
            "type": "bullet",
            "text": "Responsibly;"
          },
          {
            "type": "bullet",
            "text": "In good faith; and"
          },
          {
            "type": "bullet",
            "text": "In compliance with these Terms and all applicable laws."
          },
          {
            "type": "paragraph",
            "text": "Any activity that undermines the safety, security, reliability, or reputation of the Platform may result in enforcement action."
          }
        ]
      },
      {
        "num": "14.3",
        "title": "Illegal Activities",
        "elements": [
          {
            "type": "paragraph",
            "text": "You must not use the Platform to:"
          },
          {
            "type": "bullet",
            "text": "Commit or facilitate any criminal offence."
          },
          {
            "type": "bullet",
            "text": "Offer, request, or perform unlawful services."
          },
          {
            "type": "bullet",
            "text": "Engage in money laundering or terrorist financing."
          },
          {
            "type": "bullet",
            "text": "Traffic stolen property."
          },
          {
            "type": "bullet",
            "text": "Facilitate human trafficking, forced labour, or exploitation."
          },
          {
            "type": "bullet",
            "text": "Promote or participate in illegal gambling."
          },
          {
            "type": "bullet",
            "text": "Violate sanctions or export control laws."
          },
          {
            "type": "bullet",
            "text": "Engage in tax evasion or financial fraud."
          },
          {
            "type": "bullet",
            "text": "Assist or encourage any unlawful conduct."
          }
        ]
      },
      {
        "num": "14.4",
        "title": "Fraud and Deception",
        "elements": [
          {
            "type": "paragraph",
            "text": "Users and Helpers must not:"
          },
          {
            "type": "bullet",
            "text": "Create fake accounts."
          },
          {
            "type": "bullet",
            "text": "Use another person's identity."
          },
          {
            "type": "bullet",
            "text": "Submit forged documents."
          },
          {
            "type": "bullet",
            "text": "Misrepresent qualifications or experience."
          },
          {
            "type": "bullet",
            "text": "Provide false Booking information."
          },
          {
            "type": "bullet",
            "text": "Submit fraudulent refund claims."
          },
          {
            "type": "bullet",
            "text": "Manipulate pricing."
          },
          {
            "type": "bullet",
            "text": "Engage in payment fraud."
          },
          {
            "type": "bullet",
            "text": "Artificially inflate ratings or reviews."
          },
          {
            "type": "bullet",
            "text": "Circumvent Platform policies through multiple accounts."
          }
        ]
      },
      {
        "num": "14.5",
        "title": "Misuse of the Platform",
        "elements": [
          {
            "type": "paragraph",
            "text": "You must not:"
          },
          {
            "type": "bullet",
            "text": "Interfere with Platform operations."
          },
          {
            "type": "bullet",
            "text": "Attempt unauthorized access to accounts, servers, databases, or systems."
          },
          {
            "type": "bullet",
            "text": "Introduce viruses, malware, ransomware, spyware, or malicious code."
          },
          {
            "type": "bullet",
            "text": "Reverse engineer or exploit Platform software except where permitted by law."
          },
          {
            "type": "bullet",
            "text": "Use automated bots, scrapers, crawlers, or scripts without Dozo's prior written authorization."
          },
          {
            "type": "bullet",
            "text": "Overload or disrupt Platform infrastructure."
          }
        ]
      },
      {
        "num": "14.6",
        "title": "Circumvention of the Platform",
        "elements": [
          {
            "type": "paragraph",
            "text": "To preserve the integrity of the marketplace, Users and Helpers must not intentionally circumvent Dozo's systems by:"
          },
          {
            "type": "bullet",
            "text": "Avoiding applicable Platform fees through off-platform arrangements initiated to bypass Dozo;"
          },
          {
            "type": "bullet",
            "text": "Repeatedly soliciting off-platform payments where Platform payments are required;"
          },
          {
            "type": "bullet",
            "text": "Using the Platform solely to obtain contact information for transactions outside the Platform."
          },
          {
            "type": "paragraph",
            "text": "Nothing in this Section restricts rights that cannot lawfully be limited under applicable law."
          }
        ]
      },
      {
        "num": "14.7",
        "title": "Abuse of Promotions",
        "elements": [
          {
            "type": "paragraph",
            "text": "Users and Helpers must not misuse:"
          },
          {
            "type": "bullet",
            "text": "Referral programmes;"
          },
          {
            "type": "bullet",
            "text": "Coupons;"
          },
          {
            "type": "bullet",
            "text": "Promotional credits;"
          },
          {
            "type": "bullet",
            "text": "Loyalty rewards;"
          },
          {
            "type": "bullet",
            "text": "Introductory offers; or"
          },
          {
            "type": "bullet",
            "text": "Other incentives."
          },
          {
            "type": "paragraph",
            "text": "Examples of prohibited conduct include creating multiple accounts, colluding with others, or exploiting technical errors to obtain benefits."
          }
        ]
      },
      {
        "num": "14.8",
        "title": "Harassment and Abuse",
        "elements": [
          {
            "type": "paragraph",
            "text": "The following behaviour is strictly prohibited:"
          },
          {
            "type": "bullet",
            "text": "Harassment;"
          },
          {
            "type": "bullet",
            "text": "Threats;"
          },
          {
            "type": "bullet",
            "text": "Intimidation;"
          },
          {
            "type": "bullet",
            "text": "Bullying;"
          },
          {
            "type": "bullet",
            "text": "Hate speech;"
          },
          {
            "type": "bullet",
            "text": "Discrimination;"
          },
          {
            "type": "bullet",
            "text": "Stalking;"
          },
          {
            "type": "bullet",
            "text": "Sexual harassment;"
          },
          {
            "type": "bullet",
            "text": "Obscene or abusive language;"
          },
          {
            "type": "bullet",
            "text": "Retaliation against another person for reporting misconduct."
          },
          {
            "type": "paragraph",
            "text": "Dozo maintains a zero-tolerance policy for serious abuse."
          }
        ]
      },
      {
        "num": "14.9",
        "title": "Dangerous Activities",
        "elements": [
          {
            "type": "paragraph",
            "text": "Users and Helpers must not:"
          },
          {
            "type": "bullet",
            "text": "Request or perform services involving illegal weapons or explosives."
          },
          {
            "type": "bullet",
            "text": "Require work in conditions presenting an unreasonable risk to life or safety."
          },
          {
            "type": "bullet",
            "text": "Use the Platform to facilitate violent acts or criminal conspiracies."
          },
          {
            "type": "bullet",
            "text": "Encourage self-harm or violence."
          }
        ]
      },
      {
        "num": "14.10",
        "title": "Intellectual Property Violations",
        "elements": [
          {
            "type": "paragraph",
            "text": "Users and Helpers must not:"
          },
          {
            "type": "bullet",
            "text": "Upload content that infringes copyright or trademarks."
          },
          {
            "type": "bullet",
            "text": "Misappropriate trade secrets."
          },
          {
            "type": "bullet",
            "text": "Copy Dozo's proprietary content without authorization."
          },
          {
            "type": "bullet",
            "text": "Use another person's intellectual property without lawful permission."
          }
        ]
      },
      {
        "num": "14.11",
        "title": "Privacy Violations",
        "elements": [
          {
            "type": "paragraph",
            "text": "Users and Helpers must not:"
          },
          {
            "type": "bullet",
            "text": "Publish another person's confidential information without authorization."
          },
          {
            "type": "bullet",
            "text": "Record private conversations unlawfully."
          },
          {
            "type": "bullet",
            "text": "Share identity documents or payment information belonging to others."
          },
          {
            "type": "bullet",
            "text": "Misuse personal data obtained through the Platform."
          }
        ]
      },
      {
        "num": "14.12",
        "title": "Payment Misconduct",
        "elements": [
          {
            "type": "paragraph",
            "text": "The following conduct is prohibited:"
          },
          {
            "type": "bullet",
            "text": "Unauthorized chargebacks."
          },
          {
            "type": "bullet",
            "text": "Use of stolen payment methods."
          },
          {
            "type": "bullet",
            "text": "Knowingly submitting false payment disputes."
          },
          {
            "type": "bullet",
            "text": "Manipulating transactions."
          },
          {
            "type": "bullet",
            "text": "Withholding payments through fraudulent conduct."
          },
          {
            "type": "bullet",
            "text": "Assisting others in payment fraud."
          }
        ]
      },
      {
        "num": "14.13",
        "title": "Interference with Investigations",
        "elements": [
          {
            "type": "paragraph",
            "text": "Users and Helpers must not:"
          },
          {
            "type": "bullet",
            "text": "Destroy relevant evidence."
          },
          {
            "type": "bullet",
            "text": "Submit false information during investigations."
          },
          {
            "type": "bullet",
            "text": "Intimidate witnesses."
          },
          {
            "type": "bullet",
            "text": "Obstruct Dozo's reasonable fraud or safety investigations."
          },
          {
            "type": "bullet",
            "text": "Encourage others to provide misleading information."
          }
        ]
      },
      {
        "num": "14.14",
        "title": "Commercial Misuse",
        "elements": [
          {
            "type": "paragraph",
            "text": "Without Dozo's prior written permission, Users and Helpers must not:"
          },
          {
            "type": "bullet",
            "text": "Copy substantial portions of Platform content."
          },
          {
            "type": "bullet",
            "text": "Build competing databases using Platform information."
          },
          {
            "type": "bullet",
            "text": "Resell Platform data."
          },
          {
            "type": "bullet",
            "text": "Operate unauthorized commercial services using Dozo's technology."
          },
          {
            "type": "bullet",
            "text": "Use the Platform primarily for unsolicited advertising or spam."
          }
        ]
      },
      {
        "num": "14.15",
        "title": "Repeated Policy Violations",
        "elements": [
          {
            "type": "paragraph",
            "text": "Repeated or serious violations of these Terms, Community Guidelines, or related Platform policies may result in progressive enforcement measures, including warnings, feature restrictions, suspension, permanent account termination, cancellation of Bookings, recovery of improperly obtained benefits, or referral to competent authorities where appropriate."
          }
        ]
      },
      {
        "num": "14.16",
        "title": "Reporting Violations",
        "elements": [
          {
            "type": "paragraph",
            "text": "Users and Helpers are encouraged to report suspected violations through the official Dozo support channels."
          },
          {
            "type": "paragraph",
            "text": "Reports should be made honestly and in good faith. Knowingly false or malicious reports may themselves constitute a violation of these Terms."
          }
        ]
      },
      {
        "num": "14.17",
        "title": "Enforcement",
        "elements": [
          {
            "type": "paragraph",
            "text": "Where Dozo reasonably believes that prohibited activity has occurred, Dozo may, to the extent permitted by applicable law:"
          },
          {
            "type": "bullet",
            "text": "Investigate the matter;"
          },
          {
            "type": "bullet",
            "text": "Request additional information;"
          },
          {
            "type": "bullet",
            "text": "Remove content;"
          },
          {
            "type": "bullet",
            "text": "Restrict Platform functionality;"
          },
          {
            "type": "bullet",
            "text": "Suspend or terminate accounts;"
          },
          {
            "type": "bullet",
            "text": "Cancel affected Bookings or transactions;"
          },
          {
            "type": "bullet",
            "text": "Recover improperly obtained funds or credits where legally permissible; and"
          },
          {
            "type": "bullet",
            "text": "Cooperate with law enforcement or regulatory authorities when required by law."
          },
          {
            "type": "paragraph",
            "text": "Where appropriate and consistent with safety or legal requirements, Dozo may provide the affected User or Helper an opportunity to respond before permanent enforcement action is taken."
          }
        ]
      },
      {
        "num": "14.18",
        "title": "Survival",
        "elements": [
          {
            "type": "paragraph",
            "text": "The obligations contained in this Chapter survive account suspension or termination to the extent necessary to investigate misconduct, enforce these Terms, recover losses, protect intellectual property, comply with legal obligations, or resolve disputes."
          }
        ]
      },
      {
        "num": "14.19",
        "title": "Commitment to a Fair Marketplace",
        "elements": [
          {
            "type": "paragraph",
            "text": "Dozo is committed to maintaining a marketplace built on integrity, transparency, professionalism, and mutual respect."
          },
          {
            "type": "paragraph",
            "text": "By using the Platform, every User and Helper agrees to refrain from prohibited activities and to contribute to a secure, trustworthy, and lawful community for everyone."
          }
        ]
      }
    ]
  },
  {
    "number": 15,
    "title": "Suspension & Account Termination",
    "sections": [
      {
        "num": "15.1",
        "title": "Purpose",
        "elements": [
          {
            "type": "paragraph",
            "text": "This Chapter explains the circumstances under which Dozo may restrict, suspend, deactivate, or permanently terminate access to the Platform."
          },
          {
            "type": "paragraph",
            "text": "These provisions are intended to protect the safety, security, integrity, and reliability of the Dozo marketplace while ensuring fair treatment of Users and Helpers."
          }
        ]
      },
      {
        "num": "15.2",
        "title": "User-Initiated Account Closure",
        "elements": [
          {
            "type": "paragraph",
            "text": "Users and Helpers may request closure of their account at any time through the Platform or by contacting Dozo Support."
          },
          {
            "type": "paragraph",
            "text": "Account closure does not automatically:"
          },
          {
            "type": "bullet",
            "text": "Cancel outstanding Bookings;"
          },
          {
            "type": "bullet",
            "text": "Eliminate unpaid fees or other financial obligations;"
          },
          {
            "type": "bullet",
            "text": "Remove legal responsibilities arising before closure; or"
          },
          {
            "type": "bullet",
            "text": "Require immediate deletion of information where retention is permitted or required by law."
          }
        ]
      },
      {
        "num": "15.3",
        "title": "Temporary Restrictions",
        "elements": [
          {
            "type": "paragraph",
            "text": "Dozo may temporarily restrict access to some or all Platform features where reasonably necessary, including in situations involving:"
          },
          {
            "type": "bullet",
            "text": "Identity verification pending completion;"
          },
          {
            "type": "bullet",
            "text": "Security reviews;"
          },
          {
            "type": "bullet",
            "text": "Suspected fraud;"
          },
          {
            "type": "bullet",
            "text": "Payment disputes;"
          },
          {
            "type": "bullet",
            "text": "Repeated policy violations;"
          },
          {
            "type": "bullet",
            "text": "Safety investigations;"
          },
          {
            "type": "bullet",
            "text": "Technical issues;"
          },
          {
            "type": "bullet",
            "text": "Compliance with legal obligations."
          },
          {
            "type": "paragraph",
            "text": "Restrictions may remain in place until the relevant issue has been resolved."
          }
        ]
      },
      {
        "num": "15.4",
        "title": "Suspension",
        "elements": [
          {
            "type": "paragraph",
            "text": "Dozo may suspend an account where there is a reasonable belief that the User or Helper has:"
          },
          {
            "type": "bullet",
            "text": "Materially violated these Terms;"
          },
          {
            "type": "bullet",
            "text": "Violated Community Guidelines;"
          },
          {
            "type": "bullet",
            "text": "Engaged in fraudulent conduct;"
          },
          {
            "type": "bullet",
            "text": "Created significant safety risks;"
          },
          {
            "type": "bullet",
            "text": "Submitted false verification information;"
          },
          {
            "type": "bullet",
            "text": "Misused Platform features;"
          },
          {
            "type": "bullet",
            "text": "Failed to cooperate with legitimate investigations; or"
          },
          {
            "type": "bullet",
            "text": "Otherwise jeopardized the integrity of the Platform."
          },
          {
            "type": "paragraph",
            "text": "Suspension may be temporary or indefinite depending on the circumstances."
          }
        ]
      },
      {
        "num": "15.5",
        "title": "Immediate Suspension",
        "elements": [
          {
            "type": "paragraph",
            "text": "Where immediate action is reasonably necessary to prevent harm, protect other Platform participants, comply with legal obligations, or preserve evidence, Dozo may suspend an account without prior notice."
          },
          {
            "type": "paragraph",
            "text": "Examples include:"
          },
          {
            "type": "bullet",
            "text": "Credible reports of violence;"
          },
          {
            "type": "bullet",
            "text": "Serious safety threats;"
          },
          {
            "type": "bullet",
            "text": "Identity theft;"
          },
          {
            "type": "bullet",
            "text": "Payment fraud;"
          },
          {
            "type": "bullet",
            "text": "Unauthorized account access;"
          },
          {
            "type": "bullet",
            "text": "Criminal activity reasonably connected with Platform use."
          }
        ]
      },
      {
        "num": "15.6",
        "title": "Permanent Termination",
        "elements": [
          {
            "type": "paragraph",
            "text": "Dozo may permanently terminate an account where:"
          },
          {
            "type": "bullet",
            "text": "Serious or repeated violations occur;"
          },
          {
            "type": "bullet",
            "text": "Fraud is confirmed;"
          },
          {
            "type": "bullet",
            "text": "Criminal misuse of the Platform is established;"
          },
          {
            "type": "bullet",
            "text": "Multiple suspensions fail to resolve misconduct;"
          },
          {
            "type": "bullet",
            "text": "Continued access creates unacceptable risk to the Platform or its community; or"
          },
          {
            "type": "bullet",
            "text": "Applicable law requires termination."
          },
          {
            "type": "paragraph",
            "text": "Termination decisions will be made using reasonable judgment and available evidence."
          }
        ]
      },
      {
        "num": "15.7",
        "title": "Effects of Suspension or Termination",
        "elements": [
          {
            "type": "paragraph",
            "text": "Following suspension or termination, Dozo may:"
          },
          {
            "type": "bullet",
            "text": "Disable Platform access;"
          },
          {
            "type": "bullet",
            "text": "Cancel pending Bookings where appropriate;"
          },
          {
            "type": "bullet",
            "text": "Remove or restrict User-generated content in accordance with these Terms;"
          },
          {
            "type": "bullet",
            "text": "Prevent creation of new accounts by the same individual where permitted by law;"
          },
          {
            "type": "bullet",
            "text": "Withhold payouts where legally justified pending investigation or resolution of disputes;"
          },
          {
            "type": "bullet",
            "text": "Retain records as required by law or the Privacy Policy."
          }
        ]
      },
      {
        "num": "15.8",
        "title": "Outstanding Payments",
        "elements": [
          {
            "type": "paragraph",
            "text": "Suspension or termination does not affect any lawful obligation to pay:"
          },
          {
            "type": "bullet",
            "text": "Outstanding Booking charges;"
          },
          {
            "type": "bullet",
            "text": "Platform fees;"
          },
          {
            "type": "bullet",
            "text": "Applicable taxes;"
          },
          {
            "type": "bullet",
            "text": "Approved refunds;"
          },
          {
            "type": "bullet",
            "text": "Chargebacks;"
          },
          {
            "type": "bullet",
            "text": "Other lawful financial obligations arising before the account action."
          },
          {
            "type": "paragraph",
            "text": "Dozo may recover outstanding amounts using lawful means."
          }
        ]
      },
      {
        "num": "15.9",
        "title": "Right to Respond",
        "elements": [
          {
            "type": "paragraph",
            "text": "Where appropriate and consistent with safety, legal obligations, or fraud prevention, Dozo may provide the affected User or Helper an opportunity to explain or respond before a final decision on permanent termination is made."
          },
          {
            "type": "paragraph",
            "text": "Nothing in this Section requires Dozo to provide advance notice where immediate action is reasonably necessary."
          }
        ]
      },
      {
        "num": "15.10",
        "title": "Appeals",
        "elements": [
          {
            "type": "paragraph",
            "text": "Users and Helpers who believe their account has been suspended or terminated in error may submit an appeal through the designated Dozo support process."
          },
          {
            "type": "paragraph",
            "text": "An appeal should include:"
          },
          {
            "type": "bullet",
            "text": "The account holder's name;"
          },
          {
            "type": "bullet",
            "text": "Relevant Booking or account details;"
          },
          {
            "type": "bullet",
            "text": "A description of the issue;"
          },
          {
            "type": "bullet",
            "text": "Supporting documents or evidence, where available."
          },
          {
            "type": "paragraph",
            "text": "Dozo will review appeals in good faith and communicate its decision within a reasonable period."
          },
          {
            "type": "paragraph",
            "text": "The outcome of an appeal shall be final unless applicable law provides otherwise."
          }
        ]
      },
      {
        "num": "15.11",
        "title": "Voluntary Reinstatement",
        "elements": [
          {
            "type": "paragraph",
            "text": "Following review of an appeal, Dozo may, at its reasonable discretion:"
          },
          {
            "type": "bullet",
            "text": "Reinstate the account;"
          },
          {
            "type": "bullet",
            "text": "Maintain existing restrictions;"
          },
          {
            "type": "bullet",
            "text": "Require additional verification;"
          },
          {
            "type": "bullet",
            "text": "Require completion of corrective measures or training where applicable; or"
          },
          {
            "type": "bullet",
            "text": "Uphold the suspension or termination."
          },
          {
            "type": "paragraph",
            "text": "Reinstatement is not guaranteed."
          }
        ]
      },
      {
        "num": "15.12",
        "title": "Repeated Account Creation",
        "elements": [
          {
            "type": "paragraph",
            "text": "Users and Helpers whose accounts have been permanently terminated must not create or attempt to create new accounts to circumvent enforcement measures without Dozo's prior written approval."
          },
          {
            "type": "paragraph",
            "text": "Dozo may remove duplicate or replacement accounts identified as attempts to evade enforcement."
          }
        ]
      },
      {
        "num": "15.13",
        "title": "Preservation of Evidence",
        "elements": [
          {
            "type": "paragraph",
            "text": "Where an investigation is ongoing, Dozo may preserve account records, communications, transaction histories, verification information, and other relevant materials for purposes including:"
          },
          {
            "type": "bullet",
            "text": "Fraud prevention;"
          },
          {
            "type": "bullet",
            "text": "Legal compliance;"
          },
          {
            "type": "bullet",
            "text": "Dispute resolution;"
          },
          {
            "type": "bullet",
            "text": "Protection of rights;"
          },
          {
            "type": "bullet",
            "text": "Cooperation with competent authorities."
          },
          {
            "type": "paragraph",
            "text": "Retention will be handled in accordance with applicable law and the Dozo Privacy Policy."
          }
        ]
      },
      {
        "num": "15.14",
        "title": "Third-Party Obligations",
        "elements": [
          {
            "type": "paragraph",
            "text": "Where account suspension or termination affects services provided by third-party payment providers, verification partners, or other integrated services, those providers may also apply their own terms and policies independently of Dozo."
          }
        ]
      },
      {
        "num": "15.15",
        "title": "No Waiver of Rights",
        "elements": [
          {
            "type": "paragraph",
            "text": "Failure by Dozo to suspend or terminate an account immediately after a violation does not constitute a waiver of its rights."
          },
          {
            "type": "paragraph",
            "text": "Dozo may take enforcement action at a later time where appropriate and permitted by law."
          }
        ]
      },
      {
        "num": "15.16",
        "title": "Survival of Obligations",
        "elements": [
          {
            "type": "paragraph",
            "text": "Termination of an account does not affect provisions of these Terms that are intended to survive termination, including provisions relating to:"
          },
          {
            "type": "bullet",
            "text": "Payment obligations;"
          },
          {
            "type": "bullet",
            "text": "Intellectual property;"
          },
          {
            "type": "bullet",
            "text": "Privacy and data retention;"
          },
          {
            "type": "bullet",
            "text": "Limitation of liability;"
          },
          {
            "type": "bullet",
            "text": "Indemnification;"
          },
          {
            "type": "bullet",
            "text": "Dispute resolution;"
          },
          {
            "type": "bullet",
            "text": "Governing law; and"
          },
          {
            "type": "bullet",
            "text": "Any other provisions that by their nature should continue after termination."
          }
        ]
      },
      {
        "num": "15.17",
        "title": "Commitment to Fair Enforcement",
        "elements": [
          {
            "type": "paragraph",
            "text": "Dozo seeks to enforce these Terms consistently, fairly, and proportionately."
          },
          {
            "type": "paragraph",
            "text": "Enforcement decisions are made with the objective of protecting Users, Helpers, the Platform, and the wider community while respecting applicable legal rights and principles of procedural fairness."
          },
          {
            "type": "paragraph",
            "text": "All enforcement actions will be carried out in accordance with applicable law and Dozo's internal trust and safety procedures."
          }
        ]
      }
    ]
  },
  {
    "number": 16,
    "title": "Disclaimers",
    "sections": [
      {
        "num": "16.1",
        "title": "Purpose",
        "elements": [
          {
            "type": "paragraph",
            "text": "This Chapter sets out important disclaimers regarding the Dozo Platform, the services facilitated through it, and the responsibilities of Users, Helpers, and Dozo."
          },
          {
            "type": "paragraph",
            "text": "Nothing in this Chapter excludes or limits rights that cannot lawfully be excluded or limited under applicable law."
          }
        ]
      },
      {
        "num": "16.2",
        "title": "Marketplace Platform",
        "elements": [
          {
            "type": "paragraph",
            "text": "Dozo operates as a technology-enabled marketplace that facilitates connections between Users and independent Helpers."
          },
          {
            "type": "paragraph",
            "text": "Unless expressly stated otherwise, Dozo does not itself provide the services listed on the Platform and is not the employer, agent, partner, or representative of any Helper."
          },
          {
            "type": "paragraph",
            "text": "Services are performed by independent Helpers who decide whether to accept and complete Bookings."
          }
        ]
      },
      {
        "num": "16.3",
        "title": "No Guarantee of Service Availability",
        "elements": [
          {
            "type": "paragraph",
            "text": "Dozo does not guarantee:"
          },
          {
            "type": "bullet",
            "text": "Availability of Helpers at all times or locations;"
          },
          {
            "type": "bullet",
            "text": "Acceptance of every Booking request;"
          },
          {
            "type": "bullet",
            "text": "Availability of every service category;"
          },
          {
            "type": "bullet",
            "text": "Continuous Platform operation;"
          },
          {
            "type": "bullet",
            "text": "Error-free functionality; or"
          },
          {
            "type": "bullet",
            "text": "That a specific Helper will be available for a requested service."
          },
          {
            "type": "paragraph",
            "text": "Service availability depends on various operational, geographic, and technical factors."
          }
        ]
      },
      {
        "num": "16.4",
        "title": "No Guarantee of Outcomes",
        "elements": [
          {
            "type": "paragraph",
            "text": "While Dozo seeks to maintain a high-quality marketplace, Dozo does not guarantee that:"
          },
          {
            "type": "bullet",
            "text": "Every service will meet a User's expectations;"
          },
          {
            "type": "bullet",
            "text": "Every User will meet a Helper's expectations;"
          },
          {
            "type": "bullet",
            "text": "Every Booking will be completed;"
          },
          {
            "type": "bullet",
            "text": "Every dispute can be resolved to the satisfaction of all parties; or"
          },
          {
            "type": "bullet",
            "text": "Every interaction will be free from misunderstandings or unforeseen circumstances."
          },
          {
            "type": "paragraph",
            "text": "Users and Helpers remain responsible for exercising reasonable judgment."
          }
        ]
      },
      {
        "num": "16.5",
        "title": "Verification Disclaimer",
        "elements": [
          {
            "type": "paragraph",
            "text": "Dozo may verify certain identity documents, qualifications, licences, certifications, or other information."
          },
          {
            "type": "paragraph",
            "text": "Such verification is intended to improve trust and safety and should not be interpreted as:"
          },
          {
            "type": "bullet",
            "text": "A guarantee of honesty;"
          },
          {
            "type": "bullet",
            "text": "A guarantee of competence;"
          },
          {
            "type": "bullet",
            "text": "A warranty of future behaviour;"
          },
          {
            "type": "bullet",
            "text": "Professional certification;"
          },
          {
            "type": "bullet",
            "text": "A guarantee of service quality; or"
          },
          {
            "type": "bullet",
            "text": "An endorsement by Dozo."
          }
        ]
      },
      {
        "num": "16.6",
        "title": "Third-Party Services",
        "elements": [
          {
            "type": "paragraph",
            "text": "The Platform may rely on third-party providers, including payment processors, mapping services, cloud infrastructure providers, communication services, and identity verification partners."
          },
          {
            "type": "paragraph",
            "text": "Dozo does not control the independent operations of such third parties and cannot guarantee their uninterrupted availability or performance."
          }
        ]
      },
      {
        "num": "16.7",
        "title": "Information Accuracy",
        "elements": [
          {
            "type": "paragraph",
            "text": "Dozo makes reasonable efforts to keep information on the Platform accurate and current."
          },
          {
            "type": "paragraph",
            "text": "However, Dozo does not warrant that all information, pricing, availability, descriptions, or other content will always be complete, accurate, or free from inadvertent errors."
          },
          {
            "type": "paragraph",
            "text": "Where material errors are identified, Dozo may correct them in accordance with these Terms."
          }
        ]
      },
      {
        "num": "16.8",
        "title": "User-Generated Content",
        "elements": [
          {
            "type": "paragraph",
            "text": "Ratings, reviews, profile information, and other content submitted by Users or Helpers represent the views of their respective authors."
          },
          {
            "type": "paragraph",
            "text": "Except where required by law, Dozo does not endorse or guarantee the accuracy of such content."
          }
        ]
      },
      {
        "num": "16.9",
        "title": "Technical Interruptions",
        "elements": [
          {
            "type": "paragraph",
            "text": "The Platform may occasionally experience interruptions, delays, maintenance, software defects, cybersecurity incidents, or connectivity issues."
          },
          {
            "type": "paragraph",
            "text": "Dozo does not guarantee uninterrupted access and will use commercially reasonable efforts to restore service as soon as practicable."
          }
        ]
      },
      {
        "num": "16.10",
        "title": "Device and Internet Requirements",
        "elements": [
          {
            "type": "paragraph",
            "text": "Users and Helpers are responsible for maintaining compatible devices, internet connectivity, software updates, and other technical requirements necessary to access the Platform."
          },
          {
            "type": "paragraph",
            "text": "Dozo is not responsible for failures arising from incompatible devices or internet service interruptions outside its reasonable control."
          }
        ]
      },
      {
        "num": "16.11",
        "title": "External Links",
        "elements": [
          {
            "type": "paragraph",
            "text": "The Platform may contain links to third-party websites or services for user convenience."
          },
          {
            "type": "paragraph",
            "text": "Such links do not constitute an endorsement by Dozo."
          },
          {
            "type": "paragraph",
            "text": "Dozo is not responsible for the content, privacy practices, products, or services of external websites that are not owned or controlled by Dozo."
          }
        ]
      },
      {
        "num": "16.12",
        "title": "Professional Advice",
        "elements": [
          {
            "type": "paragraph",
            "text": "Information made available through the Platform is provided for general informational purposes only."
          },
          {
            "type": "paragraph",
            "text": "Unless expressly stated otherwise, nothing on the Platform constitutes legal, medical, financial, engineering, tax, or other regulated professional advice."
          },
          {
            "type": "paragraph",
            "text": "Users should obtain advice from appropriately qualified professionals where required."
          }
        ]
      },
      {
        "num": "16.13",
        "title": "User Responsibility",
        "elements": [
          {
            "type": "paragraph",
            "text": "Users are responsible for:"
          },
          {
            "type": "bullet",
            "text": "Evaluating whether a requested service is appropriate for their needs;"
          },
          {
            "type": "bullet",
            "text": "Providing accurate Booking information;"
          },
          {
            "type": "bullet",
            "text": "Maintaining a safe service environment;"
          },
          {
            "type": "bullet",
            "text": "Reviewing completed services where reasonably possible; and"
          },
          {
            "type": "bullet",
            "text": "Complying with applicable laws."
          }
        ]
      },
      {
        "num": "16.14",
        "title": "Helper Responsibility",
        "elements": [
          {
            "type": "paragraph",
            "text": "Helpers remain solely responsible for:"
          },
          {
            "type": "bullet",
            "text": "Performing services competently;"
          },
          {
            "type": "bullet",
            "text": "Maintaining required licences and permits;"
          },
          {
            "type": "bullet",
            "text": "Complying with applicable laws;"
          },
          {
            "type": "bullet",
            "text": "Maintaining required insurance where applicable;"
          },
          {
            "type": "bullet",
            "text": "Paying applicable taxes; and"
          },
          {
            "type": "bullet",
            "text": "Performing services safely and professionally."
          }
        ]
      },
      {
        "num": "16.15",
        "title": "Security Disclaimer",
        "elements": [
          {
            "type": "paragraph",
            "text": "Although Dozo employs commercially reasonable security measures, no digital platform can guarantee absolute protection against cyber threats, unauthorized access, or data breaches."
          },
          {
            "type": "paragraph",
            "text": "Users and Helpers are responsible for protecting their account credentials and promptly reporting suspected unauthorized access."
          }
        ]
      },
      {
        "num": "16.16",
        "title": "No Warranty",
        "elements": [
          {
            "type": "paragraph",
            "text": "To the fullest extent permitted by applicable law, the Platform and related services are provided on an **\"as is\"** and **\"as available\"** basis."
          },
          {
            "type": "paragraph",
            "text": "Except where prohibited by law, Dozo disclaims all express, implied, statutory, or other warranties, including implied warranties of merchantability, fitness for a particular purpose, satisfactory quality, non-infringement, and uninterrupted availability."
          },
          {
            "type": "paragraph",
            "text": "Nothing in this Section limits any statutory consumer rights that cannot lawfully be excluded."
          }
        ]
      },
      {
        "num": "16.17",
        "title": "Changes to the Platform",
        "elements": [
          {
            "type": "paragraph",
            "text": "Dozo may introduce, modify, suspend, or discontinue features, technologies, service categories, pricing models, or operational processes to improve the Platform or comply with legal and regulatory requirements."
          },
          {
            "type": "paragraph",
            "text": "Dozo does not guarantee that every feature will remain available indefinitely."
          }
        ]
      },
      {
        "num": "16.18",
        "title": "Compliance with Applicable Law",
        "elements": [
          {
            "type": "paragraph",
            "text": "All disclaimers contained in this Chapter shall be interpreted to the fullest extent permitted under applicable law."
          },
          {
            "type": "paragraph",
            "text": "Where any disclaimer is found to be invalid or unenforceable, the remaining provisions shall continue in full force and effect."
          }
        ]
      },
      {
        "num": "16.19",
        "title": "Commitment to Transparency",
        "elements": [
          {
            "type": "paragraph",
            "text": "While Dozo cannot guarantee every outcome associated with an independent marketplace, Dozo is committed to operating the Platform responsibly, improving service quality, protecting Users and Helpers, and complying with applicable legal obligations."
          },
          {
            "type": "paragraph",
            "text": "These disclaimers are intended to clarify the respective responsibilities of all parties and promote transparent expectations regarding the use of the Platform."
          }
        ]
      }
    ]
  },
  {
    "number": 17,
    "title": "Limitation of Liability",
    "sections": [
      {
        "num": "17.1",
        "title": "Purpose",
        "elements": [
          {
            "type": "paragraph",
            "text": "This Chapter allocates certain risks between Dozo, Users, and Helpers in connection with the use of the Platform."
          },
          {
            "type": "paragraph",
            "text": "Nothing in this Chapter excludes or limits liability that cannot lawfully be excluded or limited under applicable law."
          }
        ]
      },
      {
        "num": "17.2",
        "title": "Nature of the Platform",
        "elements": [
          {
            "type": "paragraph",
            "text": "Dozo provides a technology-enabled marketplace that facilitates connections between Users and independent Helpers."
          },
          {
            "type": "paragraph",
            "text": "Except where expressly stated otherwise, Dozo does not itself perform the services requested through the Platform and is not responsible for the day-to-day execution of those services by independent Helpers."
          }
        ]
      },
      {
        "num": "17.3",
        "title": "User and Helper Responsibility",
        "elements": [
          {
            "type": "paragraph",
            "text": "Users and Helpers acknowledge that they remain primarily responsible for:"
          },
          {
            "type": "bullet",
            "text": "Their own decisions and conduct;"
          },
          {
            "type": "bullet",
            "text": "Information they provide through the Platform;"
          },
          {
            "type": "bullet",
            "text": "Compliance with applicable laws;"
          },
          {
            "type": "bullet",
            "text": "Safety precautions reasonably expected in the circumstances;"
          },
          {
            "type": "bullet",
            "text": "Performance of agreed services; and"
          },
          {
            "type": "bullet",
            "text": "Communications and interactions with one another."
          }
        ]
      },
      {
        "num": "17.4",
        "title": "Indirect and Consequential Losses",
        "elements": [
          {
            "type": "paragraph",
            "text": "To the fullest extent permitted by applicable law, Dozo shall not be liable for any indirect, incidental, special, exemplary, punitive, or consequential damages arising from or relating to the use of the Platform, including loss of profits, business opportunities, goodwill, anticipated savings, or data, where such exclusion is legally permissible."
          },
          {
            "type": "paragraph",
            "text": "This limitation does not apply where liability cannot be excluded by law."
          }
        ]
      },
      {
        "num": "17.5",
        "title": "Platform Availability",
        "elements": [
          {
            "type": "paragraph",
            "text": "Dozo does not guarantee uninterrupted or error-free access to the Platform."
          },
          {
            "type": "paragraph",
            "text": "To the extent permitted by law, Dozo shall not be liable for losses arising solely from temporary interruptions caused by:"
          },
          {
            "type": "bullet",
            "text": "Scheduled maintenance;"
          },
          {
            "type": "bullet",
            "text": "Software updates;"
          },
          {
            "type": "bullet",
            "text": "Technical failures;"
          },
          {
            "type": "bullet",
            "text": "Internet outages;"
          },
          {
            "type": "bullet",
            "text": "Cybersecurity incidents;"
          },
          {
            "type": "bullet",
            "text": "Force Majeure Events; or"
          },
          {
            "type": "bullet",
            "text": "Other circumstances beyond Dozo's reasonable control."
          }
        ]
      },
      {
        "num": "17.6",
        "title": "Third-Party Services",
        "elements": [
          {
            "type": "paragraph",
            "text": "The Platform may integrate with third-party providers, including payment gateways, cloud service providers, mapping services, identity verification providers, and communication services."
          },
          {
            "type": "paragraph",
            "text": "To the extent permitted by law, Dozo is not responsible for losses arising solely from the independent acts or omissions of such third parties."
          }
        ]
      },
      {
        "num": "17.7",
        "title": "User-Generated Content",
        "elements": [
          {
            "type": "paragraph",
            "text": "Dozo is not responsible for the accuracy, completeness, legality, or reliability of reviews, ratings, photographs, messages, profile information, or other content submitted by Users or Helpers, except to the extent required by law."
          }
        ]
      },
      {
        "num": "17.8",
        "title": "Verification",
        "elements": [
          {
            "type": "paragraph",
            "text": "Identity verification, document review, background screening (where applicable), or other trust and safety measures are intended to reduce risk but do not constitute a guarantee of a person's honesty, competence, qualifications, or future conduct."
          }
        ]
      },
      {
        "num": "17.9",
        "title": "Service Quality",
        "elements": [
          {
            "type": "paragraph",
            "text": "Dozo does not guarantee that every service performed by a Helper will satisfy every User's expectations."
          },
          {
            "type": "paragraph",
            "text": "Similarly, Dozo does not guarantee that every User will meet a Helper's expectations regarding cooperation, communication, or working conditions."
          },
          {
            "type": "paragraph",
            "text": "Where disputes arise, Dozo may facilitate communication, but Dozo is not responsible for the underlying performance of independent contractual obligations between Users and Helpers, except where applicable law provides otherwise."
          }
        ]
      },
      {
        "num": "17.10",
        "title": "Property Damage and Personal Injury",
        "elements": [
          {
            "type": "paragraph",
            "text": "Where a claim involves property damage or personal injury arising during a Booking, responsibility will depend upon the specific facts, applicable law, and the conduct of the relevant parties."
          },
          {
            "type": "paragraph",
            "text": "Nothing in these Terms excludes liability for death, personal injury, fraud, or any other liability that cannot lawfully be excluded or limited under applicable law."
          }
        ]
      },
      {
        "num": "17.11",
        "title": "Maximum Liability",
        "elements": [
          {
            "type": "paragraph",
            "text": "To the fullest extent permitted by applicable law, and except for liabilities that cannot legally be limited, Dozo's aggregate liability arising out of or relating to a specific Booking or dispute shall not exceed the total amount of Platform fees actually received by Dozo in connection with that Booking."
          },
          {
            "type": "paragraph",
            "text": "This limitation does not affect any statutory rights that Users may have under applicable consumer protection laws."
          }
        ]
      },
      {
        "num": "17.12",
        "title": "Duty to Mitigate",
        "elements": [
          {
            "type": "paragraph",
            "text": "Users and Helpers agree to take reasonable steps to minimize or mitigate any losses or damages that may arise in connection with the use of the Platform."
          },
          {
            "type": "paragraph",
            "text": "Failure to take reasonable mitigation measures may affect the remedies available under applicable law."
          }
        ]
      },
      {
        "num": "17.13",
        "title": "No Liability for Unauthorized Account Access",
        "elements": [
          {
            "type": "paragraph",
            "text": "Users and Helpers are responsible for maintaining the confidentiality of their login credentials."
          },
          {
            "type": "paragraph",
            "text": "Subject to applicable law, Dozo shall not be liable for losses resulting from unauthorized use of an account where such use results from the account holder's failure to protect login credentials or promptly report suspected unauthorized access."
          }
        ]
      },
      {
        "num": "17.14",
        "title": "Business Losses",
        "elements": [
          {
            "type": "paragraph",
            "text": "The Platform is primarily designed to facilitate marketplace transactions."
          },
          {
            "type": "paragraph",
            "text": "To the extent permitted by applicable law, Dozo shall not be liable for business interruption, loss of commercial opportunity, or similar economic losses arising from the use or inability to use the Platform, except where liability cannot lawfully be excluded."
          }
        ]
      },
      {
        "num": "17.15",
        "title": "Legal Compliance",
        "elements": [
          {
            "type": "paragraph",
            "text": "Users and Helpers remain solely responsible for complying with:"
          },
          {
            "type": "bullet",
            "text": "Tax laws;"
          },
          {
            "type": "bullet",
            "text": "Labour laws;"
          },
          {
            "type": "bullet",
            "text": "Licensing requirements;"
          },
          {
            "type": "bullet",
            "text": "Health and safety regulations;"
          },
          {
            "type": "bullet",
            "text": "Consumer protection obligations applicable to them; and"
          },
          {
            "type": "bullet",
            "text": "Other legal responsibilities arising from their activities."
          },
          {
            "type": "paragraph",
            "text": "Dozo shall not be liable for losses resulting from an individual's failure to comply with applicable law."
          }
        ]
      },
      {
        "num": "17.16",
        "title": "Allocation of Risk",
        "elements": [
          {
            "type": "paragraph",
            "text": "The pricing, fees, and operational structure of the Platform reflect the allocation of risks described in these Terms."
          },
          {
            "type": "paragraph",
            "text": "Users and Helpers acknowledge that these limitations are an essential basis upon which Dozo makes the Platform available."
          }
        ]
      },
      {
        "num": "17.17",
        "title": "Severability",
        "elements": [
          {
            "type": "paragraph",
            "text": "If any limitation contained in this Chapter is held invalid or unenforceable under applicable law, that limitation shall be interpreted only to the minimum extent necessary, and the remaining provisions shall continue in full force and effect."
          }
        ]
      },
      {
        "num": "17.18",
        "title": "Survival",
        "elements": [
          {
            "type": "paragraph",
            "text": "The provisions of this Chapter shall survive the suspension, termination, or closure of any account and shall continue to apply to claims arising out of events occurring during the period of Platform use."
          }
        ]
      },
      {
        "num": "17.19",
        "title": "Commitment to Fairness",
        "elements": [
          {
            "type": "paragraph",
            "text": "Dozo seeks to allocate responsibilities fairly among all participants while respecting applicable legal rights."
          },
          {
            "type": "paragraph",
            "text": "Nothing in this Chapter is intended to deprive Users or Helpers of mandatory legal protections that cannot be waived under applicable law. Instead, these provisions clarify the respective responsibilities of Dozo, Users, and Helpers in operating a trusted, transparent, and sustainable marketplace."
          }
        ]
      }
    ]
  },
  {
    "number": 18,
    "title": "Indemnification",
    "sections": [
      {
        "num": "18.1",
        "title": "Purpose",
        "elements": [
          {
            "type": "paragraph",
            "text": "This Chapter describes the circumstances in which Users and Helpers agree to indemnify and hold harmless Dozo for certain losses, claims, liabilities, and expenses arising from their own conduct."
          },
          {
            "type": "paragraph",
            "text": "Nothing in this Chapter limits any rights or protections that cannot lawfully be excluded under applicable law."
          }
        ]
      },
      {
        "num": "18.2",
        "title": "Agreement to Indemnify",
        "elements": [
          {
            "type": "paragraph",
            "text": "To the fullest extent permitted by applicable law, each User and Helper agrees to defend (where requested), indemnify, and hold harmless Dozo, its parent entities, subsidiaries, affiliates, officers, directors, employees, contractors, agents, licensors, successors, and assigns from and against claims, actions, damages, losses, liabilities, judgments, penalties, costs, and reasonable legal expenses arising out of or relating to:"
          },
          {
            "type": "bullet",
            "text": "Their breach of these Terms;"
          },
          {
            "type": "bullet",
            "text": "Their unlawful conduct;"
          },
          {
            "type": "bullet",
            "text": "Their negligent or wrongful acts or omissions;"
          },
          {
            "type": "bullet",
            "text": "Their misuse of the Platform;"
          },
          {
            "type": "bullet",
            "text": "Their violation of another person's rights; or"
          },
          {
            "type": "bullet",
            "text": "Their failure to comply with applicable law."
          }
        ]
      },
      {
        "num": "18.3",
        "title": "Intellectual Property Claims",
        "elements": [
          {
            "type": "paragraph",
            "text": "Users and Helpers agree to indemnify Dozo against claims arising from content, materials, trademarks, photographs, videos, documents, software, or other materials uploaded or submitted by them that infringe the intellectual property rights of another person."
          },
          {
            "type": "paragraph",
            "text": "This obligation applies only where the infringement results from the User's or Helper's own acts or omissions."
          }
        ]
      },
      {
        "num": "18.4",
        "title": "User-Generated Content",
        "elements": [
          {
            "type": "paragraph",
            "text": "Where a claim arises because of reviews, ratings, profile information, messages, photographs, videos, or other content submitted by a User or Helper, the submitting party shall be responsible for that content and, where legally permissible, shall indemnify Dozo against resulting third-party claims."
          }
        ]
      },
      {
        "num": "18.5",
        "title": "Violation of Law",
        "elements": [
          {
            "type": "paragraph",
            "text": "Users and Helpers shall indemnify Dozo against losses arising from their violation of applicable laws, regulations, licences, permits, or governmental requirements in connection with their use of the Platform."
          }
        ]
      },
      {
        "num": "18.6",
        "title": "Fraud and Misrepresentation",
        "elements": [
          {
            "type": "paragraph",
            "text": "Indemnification includes claims resulting from:"
          },
          {
            "type": "bullet",
            "text": "Identity fraud;"
          },
          {
            "type": "bullet",
            "text": "Forged documents;"
          },
          {
            "type": "bullet",
            "text": "False qualifications;"
          },
          {
            "type": "bullet",
            "text": "Payment fraud;"
          },
          {
            "type": "bullet",
            "text": "Chargeback fraud;"
          },
          {
            "type": "bullet",
            "text": "Fake reviews;"
          },
          {
            "type": "bullet",
            "text": "Misrepresentation of services; or"
          },
          {
            "type": "bullet",
            "text": "Other dishonest conduct attributable to the User or Helper."
          }
        ]
      },
      {
        "num": "18.7",
        "title": "Tax Obligations",
        "elements": [
          {
            "type": "paragraph",
            "text": "Helpers remain responsible for their own tax obligations arising from income earned through the Platform."
          },
          {
            "type": "paragraph",
            "text": "Where a Helper's failure to comply with applicable tax laws causes Dozo to incur penalties, assessments, or legal costs that are attributable to the Helper's non-compliance, the Helper agrees, to the extent permitted by law, to indemnify Dozo for such losses."
          }
        ]
      },
      {
        "num": "18.8",
        "title": "Employment Classification",
        "elements": [
          {
            "type": "paragraph",
            "text": "Helpers acknowledge that they provide services as independent service providers unless otherwise expressly agreed in writing."
          },
          {
            "type": "paragraph",
            "text": "Where a User or Helper makes claims inconsistent with this relationship and such claims arise from their own conduct or representations, the responsible party shall indemnify Dozo to the extent permitted by applicable law for resulting losses."
          },
          {
            "type": "paragraph",
            "text": "Nothing in this Section overrides any employment rights determined by a competent authority."
          }
        ]
      },
      {
        "num": "18.9",
        "title": "Cooperation",
        "elements": [
          {
            "type": "paragraph",
            "text": "Where Dozo seeks indemnification under this Chapter, Dozo may:"
          },
          {
            "type": "bullet",
            "text": "Notify the relevant User or Helper of the claim within a reasonable time;"
          },
          {
            "type": "bullet",
            "text": "Request relevant information or documents;"
          },
          {
            "type": "bullet",
            "text": "Require reasonable cooperation in defending or resolving the matter; and"
          },
          {
            "type": "bullet",
            "text": "Participate in the defence where its interests may be materially affected."
          },
          {
            "type": "paragraph",
            "text": "The indemnifying party shall provide reasonable assistance in good faith."
          }
        ]
      },
      {
        "num": "18.10",
        "title": "Settlement of Claims",
        "elements": [
          {
            "type": "paragraph",
            "text": "A User or Helper may not settle any claim affecting Dozo's rights or obligations without Dozo's prior written consent, such consent not to be unreasonably withheld, conditioned, or delayed."
          },
          {
            "type": "paragraph",
            "text": "Dozo may participate in settlement discussions where appropriate."
          }
        ]
      },
      {
        "num": "18.11",
        "title": "Limitation",
        "elements": [
          {
            "type": "paragraph",
            "text": "The indemnification obligations described in this Chapter apply only to the extent that losses are caused by the acts or omissions of the relevant User or Helper."
          },
          {
            "type": "paragraph",
            "text": "Nothing in this Chapter requires a User or Helper to indemnify Dozo for losses arising solely from Dozo's own fraud, wilful misconduct, or gross negligence where applicable law prohibits such indemnification."
          }
        ]
      },
      {
        "num": "18.12",
        "title": "Third-Party Claims",
        "elements": [
          {
            "type": "paragraph",
            "text": "This Chapter applies to claims brought by third parties, including:"
          },
          {
            "type": "bullet",
            "text": "Other Users;"
          },
          {
            "type": "bullet",
            "text": "Helpers;"
          },
          {
            "type": "bullet",
            "text": "Government authorities;"
          },
          {
            "type": "bullet",
            "text": "Intellectual property rights holders;"
          },
          {
            "type": "bullet",
            "text": "Payment providers;"
          },
          {
            "type": "bullet",
            "text": "Business partners; or"
          },
          {
            "type": "bullet",
            "text": "Other persons whose rights have allegedly been affected."
          }
        ]
      },
      {
        "num": "18.13",
        "title": "Continuing Obligations",
        "elements": [
          {
            "type": "paragraph",
            "text": "The indemnification obligations in this Chapter continue even after:"
          },
          {
            "type": "bullet",
            "text": "Completion of a Booking;"
          },
          {
            "type": "bullet",
            "text": "Suspension of an account;"
          },
          {
            "type": "bullet",
            "text": "Closure of an account; or"
          },
          {
            "type": "bullet",
            "text": "Termination of these Terms,"
          },
          {
            "type": "paragraph",
            "text": "to the extent that the underlying events occurred while these Terms were in effect."
          }
        ]
      },
      {
        "num": "18.14",
        "title": "No Waiver",
        "elements": [
          {
            "type": "paragraph",
            "text": "Failure by Dozo to immediately enforce its rights under this Chapter shall not constitute a waiver of those rights."
          },
          {
            "type": "paragraph",
            "text": "Dozo may exercise its indemnification rights at a later time where permitted by law."
          }
        ]
      },
      {
        "num": "18.15",
        "title": "Relationship with Other Remedies",
        "elements": [
          {
            "type": "paragraph",
            "text": "The rights described in this Chapter are cumulative and are in addition to any other rights or remedies available to Dozo under these Terms, applicable law, or equity."
          },
          {
            "type": "paragraph",
            "text": "Nothing in this Chapter limits Dozo's ability to seek injunctive relief, recover unpaid amounts, enforce contractual obligations, or pursue other lawful remedies where appropriate."
          }
        ]
      },
      {
        "num": "18.16",
        "title": "Severability",
        "elements": [
          {
            "type": "paragraph",
            "text": "If any provision of this Chapter is held to be invalid, illegal, or unenforceable under applicable law, the remaining provisions shall continue in full force and effect."
          },
          {
            "type": "paragraph",
            "text": "The invalid provision shall be interpreted or modified only to the minimum extent necessary to make it enforceable where possible."
          }
        ]
      },
      {
        "num": "18.17",
        "title": "Commitment to Fair Allocation of Responsibility",
        "elements": [
          {
            "type": "paragraph",
            "text": "Dozo believes that responsibility should rest with the party whose actions caused the relevant loss."
          },
          {
            "type": "paragraph",
            "text": "This Chapter is intended to ensure that Users, Helpers, and Dozo each bear responsibility for their own conduct while supporting a fair, transparent, and legally compliant marketplace."
          }
        ]
      }
    ]
  },
  {
    "number": 19,
    "title": "Force Majeure",
    "sections": [
      {
        "num": "19.1",
        "title": "Purpose",
        "elements": [
          {
            "type": "paragraph",
            "text": "This Chapter explains the rights and obligations of Dozo, Users, and Helpers where the performance of obligations under these Terms is prevented, delayed, or materially affected by events beyond their reasonable control (\"Force Majeure Events\")."
          },
          {
            "type": "paragraph",
            "text": "Nothing in this Chapter limits obligations that cannot lawfully be excluded under applicable law."
          }
        ]
      },
      {
        "num": "19.2",
        "title": "Definition of Force Majeure",
        "elements": [
          {
            "type": "paragraph",
            "text": "A **Force Majeure Event** is an event or circumstance beyond the reasonable control of the affected party that could not reasonably have been prevented or avoided through the exercise of reasonable care."
          },
          {
            "type": "paragraph",
            "text": "Force Majeure Events may include, but are not limited to:"
          },
          {
            "type": "bullet",
            "text": "Natural disasters, including earthquakes, floods, cyclones, storms, landslides, or wildfires;"
          },
          {
            "type": "bullet",
            "text": "Epidemics, pandemics, or public health emergencies;"
          },
          {
            "type": "bullet",
            "text": "War, armed conflict, invasion, terrorism, civil unrest, riots, or acts of public enemies;"
          },
          {
            "type": "bullet",
            "text": "Government actions, sanctions, embargoes, lockdowns, or changes in law that materially affect Platform"
          },
          {
            "type": "paragraph",
            "text": "operations;"
          },
          {
            "type": "bullet",
            "text": "Nationwide or regional internet failures;"
          },
          {
            "type": "bullet",
            "text": "Widespread telecommunications outages;"
          },
          {
            "type": "bullet",
            "text": "Major cloud infrastructure failures;"
          },
          {
            "type": "bullet",
            "text": "Power grid failures;"
          },
          {
            "type": "bullet",
            "text": "Cyberattacks of exceptional scale despite commercially reasonable security measures;"
          },
          {
            "type": "bullet",
            "text": "Labour strikes or industrial actions not caused by the affected party;"
          },
          {
            "type": "bullet",
            "text": "Court orders or regulatory directives; and"
          },
          {
            "type": "bullet",
            "text": "Any other extraordinary event beyond the reasonable control of the affected party."
          }
        ]
      },
      {
        "num": "19.3",
        "title": "Effect on Obligations",
        "elements": [
          {
            "type": "paragraph",
            "text": "Where a Force Majeure Event prevents or materially delays performance, the affected party shall not be considered in breach of these Terms solely because of the delay or non-performance, provided that reasonable efforts are made to reduce the impact of the event."
          },
          {
            "type": "paragraph",
            "text": "Performance of the affected obligation shall be suspended only for the duration reasonably necessary to address the Force Majeure Event."
          }
        ]
      },
      {
        "num": "19.4",
        "title": "Notice of Force Majeure",
        "elements": [
          {
            "type": "paragraph",
            "text": "Where reasonably practicable, the affected party should notify the other affected parties or Dozo (as applicable) of:"
          },
          {
            "type": "bullet",
            "text": "The nature of the Force Majeure Event;"
          },
          {
            "type": "bullet",
            "text": "The expected impact on performance; and"
          },
          {
            "type": "bullet",
            "text": "Any known estimated duration."
          },
          {
            "type": "paragraph",
            "text": "Failure to provide notice shall not automatically remove Force Majeure protection where notice was not reasonably possible."
          }
        ]
      },
      {
        "num": "19.5",
        "title": "Duty to Mitigate",
        "elements": [
          {
            "type": "paragraph",
            "text": "The affected party shall use commercially reasonable efforts to:"
          },
          {
            "type": "bullet",
            "text": "Minimize disruption;"
          },
          {
            "type": "bullet",
            "text": "Resume performance as soon as reasonably practicable;"
          },
          {
            "type": "bullet",
            "text": "Cooperate with affected parties where appropriate; and"
          },
          {
            "type": "bullet",
            "text": "Take reasonable steps to reduce foreseeable losses."
          },
          {
            "type": "paragraph",
            "text": "Nothing in this Chapter requires a party to take actions that would be unlawful or expose them to unreasonable risk."
          }
        ]
      },
      {
        "num": "19.6",
        "title": "Platform Operations",
        "elements": [
          {
            "type": "paragraph",
            "text": "During a Force Majeure Event, Dozo may, where reasonably necessary:"
          },
          {
            "type": "bullet",
            "text": "Temporarily suspend Platform features;"
          },
          {
            "type": "bullet",
            "text": "Delay customer support responses;"
          },
          {
            "type": "bullet",
            "text": "Restrict certain services or service categories;"
          },
          {
            "type": "bullet",
            "text": "Extend operational timelines;"
          },
          {
            "type": "bullet",
            "text": "Modify Booking procedures;"
          },
          {
            "type": "bullet",
            "text": "Implement emergency safety measures; or"
          },
          {
            "type": "bullet",
            "text": "Take other reasonable actions to protect the Platform and its community."
          },
          {
            "type": "paragraph",
            "text": "Dozo will make commercially reasonable efforts to restore normal operations as soon as practicable."
          }
        ]
      },
      {
        "num": "19.7",
        "title": "Bookings Affected by Force Majeure",
        "elements": [
          {
            "type": "paragraph",
            "text": "Where a Booking cannot reasonably be completed due to a Force Majeure Event, the affected User and Helper are encouraged to cooperate in good faith to:"
          },
          {
            "type": "bullet",
            "text": "Reschedule the Booking;"
          },
          {
            "type": "bullet",
            "text": "Cancel the Booking; or"
          },
          {
            "type": "bullet",
            "text": "Reach another mutually acceptable solution."
          },
          {
            "type": "paragraph",
            "text": "Refunds, credits, or other financial adjustments shall be handled in accordance with Dozo's applicable Cancellation and Refund Policy and any mandatory legal requirements."
          }
        ]
      },
      {
        "num": "19.8",
        "title": "Payment Obligations",
        "elements": [
          {
            "type": "paragraph",
            "text": "Unless otherwise required by applicable law or expressly stated in these Terms, a Force Majeure Event does not automatically extinguish payment obligations that became due before the Force Majeure Event occurred."
          }
        ]
      },
      {
        "num": "19.9",
        "title": "No Liability for Force Majeure",
        "elements": [
          {
            "type": "paragraph",
            "text": "To the fullest extent permitted by applicable law, neither Dozo nor any User or Helper shall be liable for delays or failures in performance directly caused by a Force Majeure Event."
          },
          {
            "type": "paragraph",
            "text": "This limitation does not apply to obligations or liabilities that cannot lawfully be excluded."
          }
        ]
      },
      {
        "num": "19.10",
        "title": "Government Requirements",
        "elements": [
          {
            "type": "paragraph",
            "text": "Where governmental authorities issue legally binding orders affecting Platform operations or the performance of services, Dozo, Users, and Helpers shall comply with such orders."
          },
          {
            "type": "paragraph",
            "text": "Dozo may suspend or modify Platform operations as reasonably necessary to comply with applicable legal or regulatory requirements."
          }
        ]
      },
      {
        "num": "19.11",
        "title": "Extended Force Majeure",
        "elements": [
          {
            "type": "paragraph",
            "text": "If a Force Majeure Event continues for an extended period such that continued performance of a Booking or these Terms becomes impracticable, Dozo may, where appropriate:"
          },
          {
            "type": "bullet",
            "text": "Cancel affected Bookings;"
          },
          {
            "type": "bullet",
            "text": "Suspend relevant Platform services;"
          },
          {
            "type": "bullet",
            "text": "Offer rescheduling options where feasible; or"
          },
          {
            "type": "bullet",
            "text": "Take other reasonable operational measures consistent with applicable law."
          }
        ]
      },
      {
        "num": "19.12",
        "title": "Preservation of Rights",
        "elements": [
          {
            "type": "paragraph",
            "text": "Except as expressly modified by this Chapter, all other rights and obligations under these Terms remain in effect during a Force Majeure Event."
          },
          {
            "type": "paragraph",
            "text": "Any obligations that are capable of being performed despite the Force Majeure Event shall continue to be performed where reasonably practicable."
          }
        ]
      },
      {
        "num": "19.13",
        "title": "Relationship with Applicable Law",
        "elements": [
          {
            "type": "paragraph",
            "text": "This Chapter shall be interpreted consistently with applicable contract law and any mandatory legal provisions governing Force Majeure, impossibility of performance, frustration of contract, or similar legal doctrines."
          },
          {
            "type": "paragraph",
            "text": "Where applicable law provides greater protection, such law shall prevail."
          }
        ]
      },
      {
        "num": "19.14",
        "title": "Survival",
        "elements": [
          {
            "type": "paragraph",
            "text": "The provisions of this Chapter shall survive termination of these Terms to the extent necessary to resolve rights or obligations arising from a Force Majeure Event that occurred while these Terms were in effect."
          }
        ]
      },
      {
        "num": "19.15",
        "title": "Commitment to Business Continuity",
        "elements": [
          {
            "type": "paragraph",
            "text": "Dozo is committed to maintaining reliable Platform operations and supporting Users and Helpers during extraordinary events."
          },
          {
            "type": "paragraph",
            "text": "Although certain disruptions may be unavoidable, Dozo will make commercially reasonable efforts to communicate transparently, restore services promptly, and minimize disruption while prioritizing safety, legal compliance, and the interests of the Dozo community."
          }
        ]
      }
    ]
  },
  {
    "number": 20,
    "title": "Governing Law & Dispute Resolution",
    "sections": [
      {
        "num": "20.1",
        "title": "Purpose",
        "elements": [
          {
            "type": "paragraph",
            "text": "This Chapter governs the interpretation, enforcement, and resolution of disputes arising from or relating to these Terms, the Dozo Platform, or any Booking facilitated through the Platform."
          },
          {
            "type": "paragraph",
            "text": "Dozo encourages the fair, efficient, and good-faith resolution of disputes while preserving the legal rights of all parties."
          }
        ]
      },
      {
        "num": "20.2",
        "title": "Governing Law",
        "elements": [
          {
            "type": "paragraph",
            "text": "These Terms shall be governed by and construed in accordance with the laws of the **Republic of India**, without regard to its conflict of law principles."
          },
          {
            "type": "paragraph",
            "text": "Nothing in these Terms limits any mandatory rights or protections available under applicable Indian law."
          }
        ]
      },
      {
        "num": "20.3",
        "title": "Good Faith Resolution",
        "elements": [
          {
            "type": "paragraph",
            "text": "Before initiating formal legal proceedings, Users, Helpers, and Dozo agree to make reasonable efforts to resolve disputes through good-faith discussions."
          },
          {
            "type": "paragraph",
            "text": "A party raising a dispute should provide:"
          },
          {
            "type": "bullet",
            "text": "A description of the issue;"
          },
          {
            "type": "bullet",
            "text": "Relevant Booking or transaction details;"
          },
          {
            "type": "bullet",
            "text": "Supporting documents or evidence where available; and"
          },
          {
            "type": "bullet",
            "text": "The outcome being requested."
          },
          {
            "type": "paragraph",
            "text": "The parties should cooperate in good faith to reach a mutually acceptable resolution whenever reasonably possible."
          }
        ]
      },
      {
        "num": "20.4",
        "title": "Customer Support",
        "elements": [
          {
            "type": "paragraph",
            "text": "Users and Helpers are encouraged to first contact Dozo Customer Support for assistance."
          },
          {
            "type": "paragraph",
            "text": "Dozo may request additional information or documentation to investigate the matter and facilitate communication between the parties."
          },
          {
            "type": "paragraph",
            "text": "Participation in this process does not prevent a party from exercising legal rights available under applicable law."
          }
        ]
      },
      {
        "num": "20.5",
        "title": "Mediation",
        "elements": [
          {
            "type": "paragraph",
            "text": "Where a dispute cannot be resolved through customer support, the parties are encouraged to consider mediation before commencing arbitration or court proceedings."
          },
          {
            "type": "paragraph",
            "text": "Participation in mediation is voluntary unless otherwise required by applicable law or a separate written agreement."
          }
        ]
      },
      {
        "num": "20.6",
        "title": "Arbitration",
        "elements": [
          {
            "type": "paragraph",
            "text": "Subject to applicable law, disputes that cannot be resolved amicably may be referred to arbitration in accordance with the **Arbitration and Conciliation Act, 1996**, as amended."
          },
          {
            "type": "paragraph",
            "text": "Unless otherwise agreed in writing:"
          },
          {
            "type": "bullet",
            "text": "The arbitration shall be conducted by a **sole arbitrator** appointed by mutual agreement of the parties."
          },
          {
            "type": "bullet",
            "text": "If the parties cannot agree on the appointment, the arbitrator may be appointed in accordance with"
          },
          {
            "type": "paragraph",
            "text": "applicable law."
          },
          {
            "type": "bullet",
            "text": "The **seat and legal place of arbitration** shall be **[Registered Office City, India]**."
          },
          {
            "type": "bullet",
            "text": "The arbitration proceedings shall be conducted in the **English language**."
          },
          {
            "type": "bullet",
            "text": "The arbitral award shall be final and binding, subject to any rights available under applicable law."
          },
          {
            "type": "paragraph",
            "text": "Nothing in this Section prevents either party from seeking interim or emergency relief from a court of competent jurisdiction where legally permissible."
          }
        ]
      },
      {
        "num": "20.7",
        "title": "Jurisdiction of Courts",
        "elements": [
          {
            "type": "paragraph",
            "text": "Where a dispute is not subject to arbitration or where court proceedings are permitted by applicable law, the courts having jurisdiction over **[Registered Office City, State, India]** shall have exclusive jurisdiction, subject to any mandatory legal provisions providing otherwise."
          }
        ]
      },
      {
        "num": "20.8",
        "title": "Consumer Rights",
        "elements": [
          {
            "type": "paragraph",
            "text": "Nothing in these Terms limits or excludes any rights available to consumers under:"
          },
          {
            "type": "bullet",
            "text": "The **Consumer Protection Act, 2019**;"
          },
          {
            "type": "bullet",
            "text": "Applicable data protection laws;"
          },
          {
            "type": "bullet",
            "text": "Competition laws;"
          },
          {
            "type": "bullet",
            "text": "Other mandatory provisions of Indian law; or"
          },
          {
            "type": "bullet",
            "text": "Any other legal rights that cannot lawfully be waived."
          }
        ]
      },
      {
        "num": "20.9",
        "title": "Injunctive Relief",
        "elements": [
          {
            "type": "paragraph",
            "text": "Nothing in this Chapter prevents Dozo from seeking urgent interim, equitable, or injunctive relief before a court of competent jurisdiction where such relief is reasonably necessary to:"
          },
          {
            "type": "bullet",
            "text": "Protect intellectual property;"
          },
          {
            "type": "bullet",
            "text": "Prevent fraud;"
          },
          {
            "type": "bullet",
            "text": "Preserve confidential information;"
          },
          {
            "type": "bullet",
            "text": "Protect Platform security; or"
          },
          {
            "type": "bullet",
            "text": "Prevent irreparable harm."
          }
        ]
      },
      {
        "num": "20.10",
        "title": "Limitation Period",
        "elements": [
          {
            "type": "paragraph",
            "text": "To the extent permitted by applicable law, parties are encouraged to raise disputes within a reasonable period after becoming aware of the facts giving rise to the dispute."
          },
          {
            "type": "paragraph",
            "text": "Nothing in this Section shortens any statutory limitation period prescribed under applicable law."
          }
        ]
      },
      {
        "num": "20.11",
        "title": "Electronic Evidence",
        "elements": [
          {
            "type": "paragraph",
            "text": "Users, Helpers, and Dozo acknowledge that electronic records, emails, Platform logs, transaction histories, verification records, communications, and other digital evidence may be used in dispute resolution processes to the extent permitted under applicable law."
          }
        ]
      },
      {
        "num": "20.12",
        "title": "Continued Performance",
        "elements": [
          {
            "type": "paragraph",
            "text": "Unless impracticable or prohibited by law, the parties should continue to perform any obligations that are not directly affected by the dispute while efforts to resolve the dispute are ongoing."
          }
        ]
      },
      {
        "num": "20.13",
        "title": "Costs",
        "elements": [
          {
            "type": "paragraph",
            "text": "Unless otherwise determined by the arbitrator, a court, or required by law, each party shall bear its own legal and professional costs incurred in connection with a dispute."
          },
          {
            "type": "paragraph",
            "text": "Any allocation of arbitration costs shall be determined in accordance with applicable law and the arbitral tribunal's decision."
          }
        ]
      },
      {
        "num": "20.14",
        "title": "Severability",
        "elements": [
          {
            "type": "paragraph",
            "text": "If any provision of this Chapter is held invalid or unenforceable, the remaining provisions shall remain in full force and effect."
          },
          {
            "type": "paragraph",
            "text": "The invalid provision shall be interpreted only to the minimum extent necessary to make it enforceable where possible."
          }
        ]
      },
      {
        "num": "20.15",
        "title": "Survival",
        "elements": [
          {
            "type": "paragraph",
            "text": "This Chapter survives the suspension, termination, or expiration of these Terms and continues to apply to disputes arising from events occurring during the period of Platform use."
          }
        ]
      },
      {
        "num": "20.16",
        "title": "Commitment to Fair Resolution",
        "elements": [
          {
            "type": "paragraph",
            "text": "Dozo is committed to resolving disputes in a fair, transparent, efficient, and legally compliant manner."
          },
          {
            "type": "paragraph",
            "text": "The objective of this Chapter is to encourage cooperative resolution wherever possible while ensuring that Users, Helpers, and Dozo retain access to appropriate legal remedies in accordance with applicable law."
          }
        ]
      }
    ]
  },
  {
    "number": 21,
    "title": "Amendments & Updates",
    "sections": [
      {
        "num": "21.1",
        "title": "Purpose",
        "elements": [
          {
            "type": "paragraph",
            "text": "Dozo continuously improves its Platform, services, technology, policies, and operational processes. As a result, it may become necessary to amend or update these Terms from time to time."
          },
          {
            "type": "paragraph",
            "text": "This Chapter explains how such amendments will be made and how Users and Helpers will be informed."
          }
        ]
      },
      {
        "num": "21.2",
        "title": "Right to Amend",
        "elements": [
          {
            "type": "paragraph",
            "text": "Dozo reserves the right to modify, revise, replace, or update these Terms where reasonably necessary, including to:"
          },
          {
            "type": "bullet",
            "text": "Comply with changes in applicable law or regulatory requirements;"
          },
          {
            "type": "bullet",
            "text": "Improve Platform functionality or security;"
          },
          {
            "type": "bullet",
            "text": "Introduce new products, services, or features;"
          },
          {
            "type": "bullet",
            "text": "Reflect operational or business changes;"
          },
          {
            "type": "bullet",
            "text": "Address fraud, abuse, or security risks;"
          },
          {
            "type": "bullet",
            "text": "Clarify existing provisions; or"
          },
          {
            "type": "bullet",
            "text": "Correct drafting or administrative errors."
          },
          {
            "type": "paragraph",
            "text": "Amendments will be made in good faith and in accordance with applicable law."
          }
        ]
      },
      {
        "num": "21.3",
        "title": "Notice of Material Changes",
        "elements": [
          {
            "type": "paragraph",
            "text": "Where a change materially affects the rights or obligations of Users or Helpers, Dozo will make reasonable efforts to provide advance notice, unless immediate changes are required by law, security concerns, or emergency circumstances."
          },
          {
            "type": "paragraph",
            "text": "Notice may be provided through one or more of the following:"
          },
          {
            "type": "bullet",
            "text": "Email;"
          },
          {
            "type": "bullet",
            "text": "SMS;"
          },
          {
            "type": "bullet",
            "text": "In-app notifications;"
          },
          {
            "type": "bullet",
            "text": "Platform announcements;"
          },
          {
            "type": "bullet",
            "text": "Website banners; or"
          },
          {
            "type": "bullet",
            "text": "Any other reasonable communication channel used by Dozo."
          }
        ]
      },
      {
        "num": "21.4",
        "title": "Effective Date",
        "elements": [
          {
            "type": "paragraph",
            "text": "Each version of these Terms will include an **\"Effective Date\"** indicating when that version becomes operative."
          },
          {
            "type": "paragraph",
            "text": "Unless otherwise stated, amendments become effective on the published Effective Date."
          },
          {
            "type": "paragraph",
            "text": "Where applicable law requires a longer notice period, Dozo will comply with those requirements."
          }
        ]
      },
      {
        "num": "21.5",
        "title": "Continued Use of the Platform",
        "elements": [
          {
            "type": "paragraph",
            "text": "After the Effective Date of revised Terms, continued access to or use of the Platform constitutes acceptance of the updated Terms."
          },
          {
            "type": "paragraph",
            "text": "If a User or Helper does not agree with the revised Terms, they should discontinue use of the Platform and may request account closure in accordance with these Terms."
          },
          {
            "type": "paragraph",
            "text": "Nothing in this Section limits any rights that cannot lawfully be waived."
          }
        ]
      },
      {
        "num": "21.6",
        "title": "Immediate Updates",
        "elements": [
          {
            "type": "paragraph",
            "text": "Certain updates may take effect immediately where reasonably necessary to:"
          },
          {
            "type": "bullet",
            "text": "Comply with applicable law;"
          },
          {
            "type": "bullet",
            "text": "Protect the security or integrity of the Platform;"
          },
          {
            "type": "bullet",
            "text": "Prevent fraud or abuse;"
          },
          {
            "type": "bullet",
            "text": "Address urgent technical issues; or"
          },
          {
            "type": "bullet",
            "text": "Respond to regulatory or judicial orders."
          },
          {
            "type": "paragraph",
            "text": "Where practicable, Dozo will notify affected Users and Helpers as soon as reasonably possible."
          }
        ]
      },
      {
        "num": "21.7",
        "title": "Minor Changes",
        "elements": [
          {
            "type": "paragraph",
            "text": "Editorial corrections, formatting improvements, typographical corrections, clarification of language, or other changes that do not materially affect legal rights or obligations may be implemented without prior notice."
          },
          {
            "type": "paragraph",
            "text": "Such updates do not alter the substance of these Terms."
          }
        ]
      },
      {
        "num": "21.8",
        "title": "Archived Versions",
        "elements": [
          {
            "type": "paragraph",
            "text": "Dozo may maintain previous versions of these Terms for historical, legal, audit, or compliance purposes."
          },
          {
            "type": "paragraph",
            "text": "Where available, archived versions may be made accessible through the Platform or upon reasonable request."
          }
        ]
      },
      {
        "num": "21.9",
        "title": "Policy Updates",
        "elements": [
          {
            "type": "paragraph",
            "text": "Related Platform policies may also be updated from time to time, including but not limited to:"
          },
          {
            "type": "bullet",
            "text": "Privacy Policy;"
          },
          {
            "type": "bullet",
            "text": "Cancellation & Refund Policy;"
          },
          {
            "type": "bullet",
            "text": "Community Guidelines;"
          },
          {
            "type": "bullet",
            "text": "Cookie Policy;"
          },
          {
            "type": "bullet",
            "text": "Helper Standards;"
          },
          {
            "type": "bullet",
            "text": "Safety Guidelines; and"
          },
          {
            "type": "bullet",
            "text": "Any other policies referenced in these Terms."
          },
          {
            "type": "paragraph",
            "text": "Where those policies form part of these Terms, updates will be made consistently with this Chapter."
          }
        ]
      },
      {
        "num": "21.10",
        "title": "Regulatory Changes",
        "elements": [
          {
            "type": "paragraph",
            "text": "If changes in applicable law require modifications to these Terms or Platform operations, Dozo may implement such changes as reasonably necessary to ensure legal compliance."
          },
          {
            "type": "paragraph",
            "text": "Where possible, Users and Helpers will be informed of material changes arising from new legal requirements."
          }
        ]
      },
      {
        "num": "21.11",
        "title": "User Responsibility",
        "elements": [
          {
            "type": "paragraph",
            "text": "Users and Helpers are encouraged to review these Terms periodically to remain informed about their rights and obligations."
          },
          {
            "type": "paragraph",
            "text": "Failure to review updated Terms does not prevent them from becoming effective where notice has been provided in accordance with this Chapter and applicable law."
          }
        ]
      },
      {
        "num": "21.12",
        "title": "No Retroactive Effect",
        "elements": [
          {
            "type": "paragraph",
            "text": "Unless required by law or expressly stated otherwise, amendments apply prospectively from their Effective Date."
          },
          {
            "type": "paragraph",
            "text": "They do not alter rights or obligations that arose before the Effective Date of the amendment."
          }
        ]
      },
      {
        "num": "21.13",
        "title": "Severability",
        "elements": [
          {
            "type": "paragraph",
            "text": "If any provision of this Chapter is determined to be invalid or unenforceable under applicable law, the remaining provisions shall remain in full force and effect."
          },
          {
            "type": "paragraph",
            "text": "The invalid provision shall be interpreted only to the extent necessary to make it enforceable where possible."
          }
        ]
      },
      {
        "num": "21.14",
        "title": "Survival",
        "elements": [
          {
            "type": "paragraph",
            "text": "This Chapter shall survive the suspension, termination, or expiration of these Terms to the extent necessary to determine which version of the Terms applies to a particular dispute or event."
          }
        ]
      },
      {
        "num": "21.15",
        "title": "Commitment to Transparency",
        "elements": [
          {
            "type": "paragraph",
            "text": "Dozo believes that transparency is essential to maintaining the trust of its Users and Helpers."
          },
          {
            "type": "paragraph",
            "text": "When changes to these Terms are necessary, Dozo will strive to communicate them clearly, provide reasonable notice where appropriate, and ensure that updates are implemented fairly, responsibly, and in accordance with applicable law."
          }
        ]
      }
    ]
  },
  {
    "number": 22,
    "title": "Notices & Communications",
    "sections": [
      {
        "num": "22.1",
        "title": "Purpose",
        "elements": [
          {
            "type": "paragraph",
            "text": "This Chapter governs how Dozo, Users, and Helpers communicate with one another regarding the Platform, Bookings, legal matters, operational updates, and other notices relating to these Terms."
          },
          {
            "type": "paragraph",
            "text": "By creating an account or using the Platform, Users and Helpers consent to receive communications from Dozo in accordance with this Chapter and applicable law."
          }
        ]
      },
      {
        "num": "22.2",
        "title": "Electronic Communications",
        "elements": [
          {
            "type": "paragraph",
            "text": "Users and Helpers acknowledge and agree that Dozo may provide communications electronically."
          },
          {
            "type": "paragraph",
            "text": "Electronic communications may satisfy any legal requirement that a communication be in writing, to the extent permitted by applicable law."
          },
          {
            "type": "paragraph",
            "text": "Electronic communications include, but are not limited to:"
          },
          {
            "type": "bullet",
            "text": "Email;"
          },
          {
            "type": "bullet",
            "text": "SMS or text messages;"
          },
          {
            "type": "bullet",
            "text": "In-app notifications;"
          },
          {
            "type": "bullet",
            "text": "Push notifications;"
          },
          {
            "type": "bullet",
            "text": "Website notices;"
          },
          {
            "type": "bullet",
            "text": "Account dashboard messages; and"
          },
          {
            "type": "bullet",
            "text": "Other digital communication methods supported by the Platform."
          }
        ]
      },
      {
        "num": "22.3",
        "title": "Contact Information",
        "elements": [
          {
            "type": "paragraph",
            "text": "Users and Helpers are responsible for maintaining accurate and up-to-date contact information, including:"
          },
          {
            "type": "bullet",
            "text": "Mobile number;"
          },
          {
            "type": "bullet",
            "text": "Email address;"
          },
          {
            "type": "bullet",
            "text": "Mailing address (where requested); and"
          },
          {
            "type": "bullet",
            "text": "Other information reasonably necessary for communication."
          },
          {
            "type": "paragraph",
            "text": "Dozo is not responsible for missed communications resulting from outdated or incorrect contact details provided by the User or Helper."
          }
        ]
      },
      {
        "num": "22.4",
        "title": "Booking Communications",
        "elements": [
          {
            "type": "paragraph",
            "text": "Dozo may send communications relating to:"
          },
          {
            "type": "bullet",
            "text": "Booking confirmations;"
          },
          {
            "type": "bullet",
            "text": "Booking cancellations;"
          },
          {
            "type": "bullet",
            "text": "Rescheduling requests;"
          },
          {
            "type": "bullet",
            "text": "Payment updates;"
          },
          {
            "type": "bullet",
            "text": "Refund notifications;"
          },
          {
            "type": "bullet",
            "text": "Service reminders;"
          },
          {
            "type": "bullet",
            "text": "Safety alerts;"
          },
          {
            "type": "bullet",
            "text": "Ratings and review requests; and"
          },
          {
            "type": "bullet",
            "text": "Other information necessary for the operation of the Platform."
          },
          {
            "type": "paragraph",
            "text": "Such communications are considered service-related and may continue even if a User has opted out of marketing communications."
          }
        ]
      },
      {
        "num": "22.5",
        "title": "Marketing Communications",
        "elements": [
          {
            "type": "paragraph",
            "text": "Where permitted by applicable law, Dozo may send promotional messages regarding:"
          },
          {
            "type": "bullet",
            "text": "New services;"
          },
          {
            "type": "bullet",
            "text": "Discounts and offers;"
          },
          {
            "type": "bullet",
            "text": "Product updates;"
          },
          {
            "type": "bullet",
            "text": "Loyalty or referral programs;"
          },
          {
            "type": "bullet",
            "text": "Surveys; and"
          },
          {
            "type": "bullet",
            "text": "Other marketing initiatives."
          },
          {
            "type": "paragraph",
            "text": "Users may opt out of marketing communications at any time through the unsubscribe link, account settings, or other methods provided by Dozo."
          },
          {
            "type": "paragraph",
            "text": "Opting out of marketing communications does not affect essential service-related notices."
          }
        ]
      },
      {
        "num": "22.6",
        "title": "Legal Notices",
        "elements": [
          {
            "type": "paragraph",
            "text": "Legal notices relating to these Terms may be delivered by Dozo through one or more of the following methods:"
          },
          {
            "type": "bullet",
            "text": "Email sent to the registered email address;"
          },
          {
            "type": "bullet",
            "text": "Notification through the Platform;"
          },
          {
            "type": "bullet",
            "text": "Registered or courier mail where required by law;"
          },
          {
            "type": "bullet",
            "text": "Publication on the Dozo website where appropriate; or"
          },
          {
            "type": "bullet",
            "text": "Any other method permitted under applicable law."
          },
          {
            "type": "paragraph",
            "text": "A notice shall be deemed delivered when it is sent using the chosen communication method, subject to any mandatory legal requirements."
          }
        ]
      },
      {
        "num": "22.7",
        "title": "Communications from Users and Helpers",
        "elements": [
          {
            "type": "paragraph",
            "text": "Users and Helpers may contact Dozo regarding:"
          },
          {
            "type": "bullet",
            "text": "Customer support;"
          },
          {
            "type": "bullet",
            "text": "Account issues;"
          },
          {
            "type": "bullet",
            "text": "Safety concerns;"
          },
          {
            "type": "bullet",
            "text": "Complaints;"
          },
          {
            "type": "bullet",
            "text": "Privacy requests;"
          },
          {
            "type": "bullet",
            "text": "Legal notices;"
          },
          {
            "type": "bullet",
            "text": "Intellectual property claims; or"
          },
          {
            "type": "bullet",
            "text": "Other Platform-related matters."
          },
          {
            "type": "paragraph",
            "text": "Communications should be submitted through the official support channels published by Dozo."
          }
        ]
      },
      {
        "num": "22.8",
        "title": "Language",
        "elements": [
          {
            "type": "paragraph",
            "text": "Unless otherwise required by applicable law, official communications from Dozo shall be provided in **English**."
          },
          {
            "type": "paragraph",
            "text": "Dozo may also provide translations or communications in additional languages for convenience. In the event of any inconsistency, the English version shall prevail unless applicable law requires otherwise."
          }
        ]
      },
      {
        "num": "22.9",
        "title": "Recording and Monitoring",
        "elements": [
          {
            "type": "paragraph",
            "text": "To improve service quality, ensure security, investigate disputes, prevent fraud, and comply with legal obligations, Dozo may monitor or retain communications made through the Platform, including support interactions, to the extent permitted by applicable law and the Dozo Privacy Policy."
          }
        ]
      },
      {
        "num": "22.10",
        "title": "Delivery Failures",
        "elements": [
          {
            "type": "paragraph",
            "text": "Dozo is not responsible for communication failures resulting from:"
          },
          {
            "type": "bullet",
            "text": "Incorrect contact information;"
          },
          {
            "type": "bullet",
            "text": "Full email inboxes;"
          },
          {
            "type": "bullet",
            "text": "Spam filters;"
          },
          {
            "type": "bullet",
            "text": "Network outages;"
          },
          {
            "type": "bullet",
            "text": "Mobile carrier issues;"
          },
          {
            "type": "bullet",
            "text": "Device settings; or"
          },
          {
            "type": "bullet",
            "text": "Other circumstances outside Dozo's reasonable control."
          },
          {
            "type": "paragraph",
            "text": "Users and Helpers remain responsible for regularly checking their registered email address and Platform notifications."
          }
        ]
      },
      {
        "num": "22.11",
        "title": "Emergency Communications",
        "elements": [
          {
            "type": "paragraph",
            "text": "Where reasonably necessary to protect safety, security, or the integrity of the Platform, Dozo may send urgent communications regardless of marketing communication preferences."
          },
          {
            "type": "paragraph",
            "text": "Such communications may include:"
          },
          {
            "type": "bullet",
            "text": "Security alerts;"
          },
          {
            "type": "bullet",
            "text": "Fraud warnings;"
          },
          {
            "type": "bullet",
            "text": "Account compromise notifications;"
          },
          {
            "type": "bullet",
            "text": "Critical service interruptions;"
          },
          {
            "type": "bullet",
            "text": "Mandatory legal notices; or"
          },
          {
            "type": "bullet",
            "text": "Emergency operational updates."
          }
        ]
      },
      {
        "num": "22.12",
        "title": "Communication Records",
        "elements": [
          {
            "type": "paragraph",
            "text": "Dozo may retain records of communications for purposes including:"
          },
          {
            "type": "bullet",
            "text": "Customer support;"
          },
          {
            "type": "bullet",
            "text": "Fraud prevention;"
          },
          {
            "type": "bullet",
            "text": "Legal compliance;"
          },
          {
            "type": "bullet",
            "text": "Dispute resolution;"
          },
          {
            "type": "bullet",
            "text": "Quality assurance;"
          },
          {
            "type": "bullet",
            "text": "Internal auditing; and"
          },
          {
            "type": "bullet",
            "text": "Enforcement of these Terms."
          },
          {
            "type": "paragraph",
            "text": "Retention shall be carried out in accordance with applicable law and the Dozo Privacy Policy."
          }
        ]
      },
      {
        "num": "22.13",
        "title": "Third-Party Communication Providers",
        "elements": [
          {
            "type": "paragraph",
            "text": "Dozo may use trusted third-party providers to deliver emails, SMS messages, push notifications, customer support services, and other communications."
          },
          {
            "type": "paragraph",
            "text": "Such providers may process information solely for the purpose of delivering communications on behalf of Dozo and in accordance with applicable contractual and legal obligations."
          }
        ]
      },
      {
        "num": "22.14",
        "title": "Severability",
        "elements": [
          {
            "type": "paragraph",
            "text": "If any provision of this Chapter is held invalid or unenforceable under applicable law, the remaining provisions shall remain valid and enforceable."
          },
          {
            "type": "paragraph",
            "text": "The affected provision shall be interpreted only to the extent necessary to comply with applicable law."
          }
        ]
      },
      {
        "num": "22.15",
        "title": "Survival",
        "elements": [
          {
            "type": "paragraph",
            "text": "The provisions of this Chapter shall survive the suspension, termination, or expiration of these Terms where necessary to:"
          },
          {
            "type": "bullet",
            "text": "Resolve disputes;"
          },
          {
            "type": "bullet",
            "text": "Comply with legal obligations;"
          },
          {
            "type": "bullet",
            "text": "Maintain legally required records; or"
          },
          {
            "type": "bullet",
            "text": "Enforce rights arising under these Terms."
          }
        ]
      },
      {
        "num": "22.16",
        "title": "Commitment to Clear Communication",
        "elements": [
          {
            "type": "paragraph",
            "text": "Dozo is committed to maintaining timely, transparent, and reliable communication with its Users and Helpers."
          },
          {
            "type": "paragraph",
            "text": "By keeping contact information current and reviewing Platform communications, Users and Helpers help ensure the smooth operation of the marketplace and the effective protection of their rights and responsibilities."
          }
        ]
      }
    ]
  },
  {
    "number": 23,
    "title": "Miscellaneous Legal Provisions",
    "sections": [
      {
        "num": "23.1",
        "title": "Purpose",
        "elements": [
          {
            "type": "paragraph",
            "text": "This Chapter contains general legal provisions that govern the interpretation, validity, and operation of these Terms."
          },
          {
            "type": "paragraph",
            "text": "These provisions are intended to ensure that the Terms remain effective, enforceable, and consistent with applicable law."
          }
        ]
      },
      {
        "num": "23.2",
        "title": "Entire Agreement",
        "elements": [
          {
            "type": "paragraph",
            "text": "These Terms, together with any documents expressly incorporated by reference (including the Privacy Policy and other applicable Platform policies), constitute the entire agreement between Dozo and the User or Helper regarding the use of the Platform."
          },
          {
            "type": "paragraph",
            "text": "They supersede all prior discussions, understandings, representations, or agreements relating to the same subject matter, except where a separate written agreement expressly provides otherwise."
          }
        ]
      },
      {
        "num": "23.3",
        "title": "Severability",
        "elements": [
          {
            "type": "paragraph",
            "text": "If any provision of these Terms is determined by a court or other competent authority to be invalid, illegal, or unenforceable, that provision shall be interpreted or modified only to the minimum extent necessary to make it enforceable where possible."
          },
          {
            "type": "paragraph",
            "text": "The remaining provisions shall continue in full force and effect."
          }
        ]
      },
      {
        "num": "23.4",
        "title": "No Waiver",
        "elements": [
          {
            "type": "paragraph",
            "text": "Failure or delay by Dozo in exercising any right or remedy under these Terms shall not constitute a waiver of that right or remedy."
          },
          {
            "type": "paragraph",
            "text": "Any waiver shall be effective only if made in writing by an authorized representative of Dozo."
          },
          {
            "type": "paragraph",
            "text": "A waiver relating to one breach shall not be interpreted as a waiver of any subsequent or different breach."
          }
        ]
      },
      {
        "num": "23.5",
        "title": "Assignment",
        "elements": [
          {
            "type": "paragraph",
            "text": "Dozo may assign, transfer, or otherwise delegate its rights or obligations under these Terms as part of:"
          },
          {
            "type": "bullet",
            "text": "A merger;"
          },
          {
            "type": "bullet",
            "text": "Acquisition;"
          },
          {
            "type": "bullet",
            "text": "Corporate restructuring;"
          },
          {
            "type": "bullet",
            "text": "Sale of assets;"
          },
          {
            "type": "bullet",
            "text": "Financing transaction; or"
          },
          {
            "type": "bullet",
            "text": "Any other lawful business transaction."
          },
          {
            "type": "paragraph",
            "text": "Users and Helpers may not assign or transfer their rights or obligations under these Terms without Dozo's prior written consent, except where such restriction is prohibited by applicable law."
          }
        ]
      },
      {
        "num": "23.6",
        "title": "Relationship of the Parties",
        "elements": [
          {
            "type": "paragraph",
            "text": "Nothing in these Terms creates or shall be interpreted as creating:"
          },
          {
            "type": "bullet",
            "text": "An employment relationship;"
          },
          {
            "type": "bullet",
            "text": "A partnership;"
          },
          {
            "type": "bullet",
            "text": "A joint venture;"
          },
          {
            "type": "bullet",
            "text": "A franchise;"
          },
          {
            "type": "bullet",
            "text": "An agency relationship; or"
          },
          {
            "type": "bullet",
            "text": "A fiduciary relationship"
          },
          {
            "type": "paragraph",
            "text": "between Dozo and any User or Helper, unless expressly agreed in writing."
          },
          {
            "type": "paragraph",
            "text": "Helpers remain independent service providers unless applicable law or a competent authority determines otherwise."
          }
        ]
      },
      {
        "num": "23.7",
        "title": "Third-Party Rights",
        "elements": [
          {
            "type": "paragraph",
            "text": "Except where expressly provided by applicable law, these Terms are intended solely for the benefit of Dozo, Users, and Helpers."
          },
          {
            "type": "paragraph",
            "text": "No third party shall have the right to enforce these Terms solely by virtue of being mentioned in them."
          }
        ]
      },
      {
        "num": "23.8",
        "title": "Interpretation",
        "elements": [
          {
            "type": "paragraph",
            "text": "For the purposes of these Terms:"
          },
          {
            "type": "bullet",
            "text": "Headings are included for convenience only and do not affect interpretation."
          },
          {
            "type": "bullet",
            "text": "Words in the singular include the plural and vice versa where the context requires."
          },
          {
            "type": "bullet",
            "text": "References to one gender include all genders."
          },
          {
            "type": "bullet",
            "text": "The terms \"including\", \"includes\", and \"such as\" shall be interpreted as meaning \"including without"
          },
          {
            "type": "paragraph",
            "text": "limitation.\""
          },
          {
            "type": "bullet",
            "text": "References to laws include amendments, replacements, and subordinate legislation."
          }
        ]
      },
      {
        "num": "23.9",
        "title": "Electronic Records and Signatures",
        "elements": [
          {
            "type": "paragraph",
            "text": "To the extent permitted by applicable law, electronic records, electronic communications, and electronic acceptance of these Terms shall have the same legal effect as written documents and handwritten signatures."
          },
          {
            "type": "paragraph",
            "text": "Users and Helpers acknowledge that clicking an acceptance button, checking a consent box, or otherwise electronically accepting these Terms creates a legally binding agreement."
          }
        ]
      },
      {
        "num": "23.10",
        "title": "Compliance with Law",
        "elements": [
          {
            "type": "paragraph",
            "text": "Users, Helpers, and Dozo agree to comply with all applicable laws, regulations, governmental directions, and judicial orders relevant to their respective rights and obligations under these Terms."
          },
          {
            "type": "paragraph",
            "text": "Where any provision of these Terms conflicts with mandatory legal requirements, the applicable law shall prevail to the extent of the conflict."
          }
        ]
      },
      {
        "num": "23.11",
        "title": "Language",
        "elements": [
          {
            "type": "paragraph",
            "text": "These Terms are drafted in the English language."
          },
          {
            "type": "paragraph",
            "text": "Where translations are provided for convenience, the English version shall prevail in the event of any inconsistency, unless applicable law requires otherwise."
          }
        ]
      },
      {
        "num": "23.12",
        "title": "Survival",
        "elements": [
          {
            "type": "paragraph",
            "text": "The following provisions survive the suspension, expiration, or termination of these Terms to the extent necessary for their intended purpose:"
          },
          {
            "type": "bullet",
            "text": "Intellectual Property Rights;"
          },
          {
            "type": "bullet",
            "text": "Privacy and Data Protection;"
          },
          {
            "type": "bullet",
            "text": "Payments and Taxes;"
          },
          {
            "type": "bullet",
            "text": "Limitation of Liability;"
          },
          {
            "type": "bullet",
            "text": "Indemnification;"
          },
          {
            "type": "bullet",
            "text": "Governing Law and Dispute Resolution;"
          },
          {
            "type": "bullet",
            "text": "Notices;"
          },
          {
            "type": "bullet",
            "text": "Record Retention; and"
          },
          {
            "type": "bullet",
            "text": "Any other provision that by its nature is intended to survive termination."
          }
        ]
      },
      {
        "num": "23.13",
        "title": "Independent Interpretation",
        "elements": [
          {
            "type": "paragraph",
            "text": "Each provision of these Terms shall be interpreted independently."
          },
          {
            "type": "paragraph",
            "text": "The invalidity or unenforceability of one provision shall not affect the validity or enforceability of any other provision except where such interpretation would fundamentally alter the agreement."
          }
        ]
      },
      {
        "num": "23.14",
        "title": "Remedies",
        "elements": [
          {
            "type": "paragraph",
            "text": "Except where expressly stated otherwise, the rights and remedies available to Dozo under these Terms are cumulative and are in addition to any rights or remedies available under applicable law."
          },
          {
            "type": "paragraph",
            "text": "The exercise of one remedy does not prevent Dozo from exercising any other lawful remedy."
          }
        ]
      },
      {
        "num": "23.15",
        "title": "Successors and Permitted Assigns",
        "elements": [
          {
            "type": "paragraph",
            "text": "These Terms shall be binding upon and benefit the parties and, where applicable, their lawful successors and permitted assigns."
          }
        ]
      },
      {
        "num": "23.16",
        "title": "Good Faith",
        "elements": [
          {
            "type": "paragraph",
            "text": "Users, Helpers, and Dozo agree to exercise their rights and perform their obligations under these Terms honestly, reasonably, and in good faith, consistent with applicable law."
          }
        ]
      },
      {
        "num": "23.17",
        "title": "Compliance with Mandatory Law",
        "elements": [
          {
            "type": "paragraph",
            "text": "Nothing contained in these Terms shall be interpreted as limiting, excluding, or waiving any legal right or obligation that cannot lawfully be limited, excluded, or waived under applicable law."
          },
          {
            "type": "paragraph",
            "text": "Where mandatory legal protections apply, those protections shall prevail."
          }
        ]
      },
      {
        "num": "23.18",
        "title": "Final Provisions",
        "elements": [
          {
            "type": "paragraph",
            "text": "These Terms are intended to establish a transparent, balanced, and legally compliant framework governing the use of the Dozo Platform."
          },
          {
            "type": "paragraph",
            "text": "They should be interpreted in a manner that promotes fairness, protects the legitimate interests of all parties, supports innovation, and enables the continued operation of a safe, trusted, and reliable marketplace."
          }
        ]
      }
    ]
  },
  {
    "number": 24,
    "title": "Contact Information & Grievance Officer",
    "sections": [
      {
        "num": "24.1",
        "title": "Purpose",
        "elements": [
          {
            "type": "paragraph",
            "text": "This Chapter explains how Users, Helpers, regulators, and other stakeholders may contact Dozo regarding customer support, legal matters, privacy requests, intellectual property concerns, complaints, and other official communications."
          }
        ]
      },
      {
        "num": "24.2",
        "title": "Company Information",
        "elements": [
          {
            "type": "bullet",
            "text": "*Dozo** is a technology platform that facilitates connections between Users and independent Helpers."
          },
          {
            "type": "bullet",
            "text": "*Legal Entity:** [DOZO LEGAL ENTITY NAME]"
          },
          {
            "type": "bullet",
            "text": "*Registered Office:**"
          },
          {
            "type": "paragraph",
            "text": "[Registered Office Address] [City, State, PIN Code] India"
          },
          {
            "type": "bullet",
            "text": "*Corporate Identification Number (CIN):** [To be updated after incorporation]"
          },
          {
            "type": "bullet",
            "text": "*GSTIN (if applicable):** [To be updated]"
          }
        ]
      },
      {
        "num": "24.3",
        "title": "Customer Support",
        "elements": [
          {
            "type": "paragraph",
            "text": "For questions relating to:"
          },
          {
            "type": "bullet",
            "text": "Bookings"
          },
          {
            "type": "bullet",
            "text": "Payments"
          },
          {
            "type": "bullet",
            "text": "Refunds"
          },
          {
            "type": "bullet",
            "text": "Account access"
          },
          {
            "type": "bullet",
            "text": "Technical issues"
          },
          {
            "type": "bullet",
            "text": "Safety concerns"
          },
          {
            "type": "bullet",
            "text": "General support"
          },
          {
            "type": "paragraph",
            "text": "please contact:"
          },
          {
            "type": "bullet",
            "text": "*Customer Support Email:** [support@dozo.work](mailto:support@dozo.work)"
          },
          {
            "type": "bullet",
            "text": "*Website:** https://www.dozo.work"
          },
          {
            "type": "bullet",
            "text": "*Support Hours:** Monday-Saturday, 9:00 AM-6:00 PM IST (excluding notified public holidays)"
          },
          {
            "type": "paragraph",
            "text": "Dozo will use commercially reasonable efforts to respond within a reasonable time."
          }
        ]
      },
      {
        "num": "24.4",
        "title": "Legal Notices",
        "elements": [
          {
            "type": "paragraph",
            "text": "Formal legal notices relating to these Terms should be sent to:"
          },
          {
            "type": "bullet",
            "text": "*Legal Department**"
          },
          {
            "type": "paragraph",
            "text": "Dozo Email: [legal@dozo.work](mailto:legal@dozo.work) Postal Address:"
          },
          {
            "type": "paragraph",
            "text": "[Registered Office Address] [City, State, India] Where permitted by applicable law, notices sent electronically may constitute valid legal notice."
          }
        ]
      },
      {
        "num": "24.5",
        "title": "Privacy Requests",
        "elements": [
          {
            "type": "paragraph",
            "text": "For requests relating to:"
          },
          {
            "type": "bullet",
            "text": "Personal data"
          },
          {
            "type": "bullet",
            "text": "Access requests"
          },
          {
            "type": "bullet",
            "text": "Correction of information"
          },
          {
            "type": "bullet",
            "text": "Deletion requests"
          },
          {
            "type": "bullet",
            "text": "Data portability (where applicable)"
          },
          {
            "type": "bullet",
            "text": "Privacy concerns"
          },
          {
            "type": "paragraph",
            "text": "please contact:"
          },
          {
            "type": "bullet",
            "text": "*Privacy Team**"
          },
          {
            "type": "paragraph",
            "text": "Email: [privacy@dozo.work](mailto:privacy@dozo.work) Requests will be handled in accordance with applicable law and the Dozo Privacy Policy."
          }
        ]
      },
      {
        "num": "24.6",
        "title": "Intellectual Property Complaints",
        "elements": [
          {
            "type": "paragraph",
            "text": "If you believe that content available on the Platform infringes your copyright, trademark, or other intellectual property rights, please submit a written notice including:"
          },
          {
            "type": "bullet",
            "text": "Your contact information;"
          },
          {
            "type": "bullet",
            "text": "A description of the intellectual property;"
          },
          {
            "type": "bullet",
            "text": "Identification of the allegedly infringing material;"
          },
          {
            "type": "bullet",
            "text": "A statement explaining the basis of your claim; and"
          },
          {
            "type": "bullet",
            "text": "Any supporting documentation reasonably available."
          },
          {
            "type": "paragraph",
            "text": "Email:"
          },
          {
            "type": "paragraph",
            "text": "[support@dozo.work](mailto:support@dozo.work) Dozo will review complaints in good faith and take appropriate action where warranted."
          }
        ]
      },
      {
        "num": "24.7",
        "title": "Grievance Officer",
        "elements": [
          {
            "type": "paragraph",
            "text": "Where required under applicable Indian law, Dozo shall appoint a **Grievance Officer**."
          },
          {
            "type": "bullet",
            "text": "*Grievance Officer**"
          },
          {
            "type": "paragraph",
            "text": "Name: [To be updated] Designation: Grievance Officer Email: [grievance@dozo.work](mailto:grievance@dozo.work) Postal Address:"
          },
          {
            "type": "paragraph",
            "text": "[Registered Office Address] India The Grievance Officer shall receive and address eligible complaints in accordance with applicable law, including the **Information Technology Act, 2000** and any rules issued thereunder, as applicable."
          }
        ]
      },
      {
        "num": "24.8",
        "title": "Regulatory Cooperation",
        "elements": [
          {
            "type": "paragraph",
            "text": "Dozo may cooperate with courts, law enforcement agencies, regulators, or other competent authorities where required by applicable law."
          },
          {
            "type": "paragraph",
            "text": "Such cooperation may include responding to lawful requests for information, preserving records, or taking actions necessary to comply with legal obligations."
          }
        ]
      },
      {
        "num": "24.9",
        "title": "Response Times",
        "elements": [
          {
            "type": "paragraph",
            "text": "While response times may vary depending on the complexity of the matter, Dozo aims to:"
          },
          {
            "type": "bullet",
            "text": "Acknowledge customer support requests within a reasonable period;"
          },
          {
            "type": "bullet",
            "text": "Review safety-related reports as a priority;"
          },
          {
            "type": "bullet",
            "text": "Respond to privacy requests within applicable legal timelines;"
          },
          {
            "type": "bullet",
            "text": "Address grievance submissions in accordance with applicable legal requirements; and"
          },
          {
            "type": "bullet",
            "text": "Keep users informed where additional time is reasonably required."
          },
          {
            "type": "paragraph",
            "text": "Nothing in this Section creates a contractual guarantee of a specific response time unless required by law."
          }
        ]
      },
      {
        "num": "24.10",
        "title": "Updates to Contact Information",
        "elements": [
          {
            "type": "paragraph",
            "text": "Dozo may update its contact details, support channels, office address, or designated officers from time to time."
          },
          {
            "type": "paragraph",
            "text": "Updated contact information will be published on the Platform and, where required, communicated in accordance with Chapter 21 (Amendments & Updates)."
          }
        ]
      },
      {
        "num": "24.11",
        "title": "Official Communication Channels",
        "elements": [
          {
            "type": "paragraph",
            "text": "To protect Users and Helpers from fraud, Dozo recommends communicating only through its official channels."
          },
          {
            "type": "paragraph",
            "text": "Dozo is not responsible for communications originating from unauthorized third parties falsely claiming to represent Dozo."
          }
        ]
      },
      {
        "num": "24.12",
        "title": "Business Records",
        "elements": [
          {
            "type": "paragraph",
            "text": "Communications submitted to Dozo may be retained for customer support, dispute resolution, legal compliance, fraud prevention, and record-keeping purposes in accordance with applicable law and the Dozo Privacy Policy."
          }
        ]
      },
      {
        "num": "24.13",
        "title": "Severability",
        "elements": [
          {
            "type": "paragraph",
            "text": "If any provision of this Chapter is held invalid or unenforceable, the remaining provisions shall continue in full force and effect."
          }
        ]
      },
      {
        "num": "24.14",
        "title": "Entire Terms",
        "elements": [
          {
            "type": "paragraph",
            "text": "These Terms of Service, together with all policies expressly incorporated by reference, constitute the complete agreement governing the use of the Dozo Platform."
          },
          {
            "type": "paragraph",
            "text": "Users and Helpers acknowledge that they have read, understood, and agreed to these Terms before using the Platform."
          }
        ]
      },
      {
        "num": "24.15",
        "title": "Effective Date",
        "elements": [
          {
            "type": "bullet",
            "text": "*Version:** 1.0"
          },
          {
            "type": "paragraph",
            "text": "The current version of these Terms will remain available on the Platform. Archived versions may be maintained where appropriate for legal, compliance, or historical purposes."
          }
        ]
      },
      {
        "num": "24.16",
        "title": "Closing Statement",
        "elements": [
          {
            "type": "paragraph",
            "text": "Thank you for choosing **Dozo**."
          },
          {
            "type": "paragraph",
            "text": "Our mission is to build a trusted, transparent, and technology-driven marketplace that creates meaningful opportunities for Helpers while making everyday services simple, reliable, and accessible for Users."
          },
          {
            "type": "paragraph",
            "text": "By working together with honesty, professionalism, and mutual respect, we can create a platform that benefits everyone in the Dozo community."
          }
        ]
      }
    ]
  }
];
