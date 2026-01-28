"""
Sample documents for RAG evaluation.
These are realistic enterprise documents that can be ingested into your KB.
"""

SAMPLE_DOCUMENTS = [
    {
        "title": "Security Access Control Policy",
        "content": """
# Security Access Control Policy

## Document Classification Levels

The organization uses four levels of document classification:

1. **Public (Level 1)**: Information that can be freely shared. Examples include marketing materials and public announcements.

2. **Internal (Level 2)**: Information for employees only. Includes internal memos, project updates, and general company communications.

3. **Confidential (Level 3)**: Sensitive business information. Includes financial reports, strategic plans, and client contracts. Access requires manager approval.

4. **Critical (Level 4)**: Highly sensitive information. Includes executive decisions, M&A documents, and security configurations. Access requires:
   - Admin role assignment
   - Explicit Critical clearance from CISO
   - Two-factor authentication enabled
   - Quarterly access review

## Access Request Procedure

1. Submit access request through IT portal
2. Manager approval required within 48 hours
3. Security team review for Level 3+
4. Access granted with audit logging enabled

## Audit Requirements

All document access is logged with:
- User ID and timestamp
- Document ID and classification level
- Action performed (view, download, edit)
- IP address and device information
""",
        "access_level": 2,
        "department": "Security"
    },
    {
        "title": "Financial Transaction Processing Guidelines",
        "content": """
# Financial Transaction Processing Guidelines

## Transaction Risk Classification

Transactions are classified into three risk tiers:

### Low Risk (Under $10,000)
- Automated approval
- Single authorization required
- Standard audit trail

### Medium Risk ($10,000 - $100,000)
- Manager approval required
- Dual authorization from any two authorized signers
- Enhanced monitoring for 30 days

### High Risk (Over $100,000)
- Senior manager approval (VP level or above)
- Dual authorization required from two senior managers
- Must be logged in the secure vault system
- Real-time fraud detection screening
- Compliance team notification within 24 hours
- Monthly review by Audit Committee

## Processing Timeframes

| Transaction Type | SLA |
|-----------------|-----|
| Domestic Wire | Same day |
| International Wire | 2-3 business days |
| ACH Transfer | 3-5 business days |
| High-Risk Review | Additional 24-48 hours |

## Compliance Requirements

All transactions must comply with:
- Anti-Money Laundering (AML) regulations
- Know Your Customer (KYC) requirements
- OFAC sanctions screening
- SOX controls for public company reporting
""",
        "access_level": 3,
        "department": "Finance"
    },
    {
        "title": "Data Retention and Archival Policy",
        "content": """
# Data Retention and Archival Policy

## Retention Periods by Data Type

### Financial Records
- **General ledger**: 7 years minimum
- **Tax records**: 7 years from filing date
- **Audit documentation**: 7 years minimum
- **Legal audit logs**: Minimum 7 years in compliance with regional financial regulations

### Human Resources
- **Employee records**: Duration of employment + 7 years
- **Payroll records**: 7 years
- **Benefits records**: 6 years after plan termination

### Legal Documents
- **Contracts**: Duration + 10 years
- **Litigation files**: Permanent retention
- **Corporate governance**: Permanent retention

### Operational Data
- **Email communications**: 3 years (7 years for executives)
- **System logs**: 2 years minimum
- **Security audit logs**: 7 years minimum
- **Access control logs**: 5 years

## Archival Process

1. Data older than active retention period moves to cold storage
2. Archived data remains searchable via archive portal
3. Retrieval requests processed within 24-48 hours
4. Destruction requires Legal and Compliance approval

## GDPR Compliance

For EU data subjects:
- Right to erasure requests processed within 30 days
- Retention exceptions documented and justified
- Annual retention review conducted by DPO
""",
        "access_level": 2,
        "department": "Legal"
    },
    {
        "title": "Employee Onboarding Procedures",
        "content": """
# Employee Onboarding Procedures

## Day 1 Checklist

### Before Arrival
- [ ] Workstation setup complete
- [ ] Email and system accounts created
- [ ] Building access card prepared
- [ ] Welcome kit assembled

### Morning Session
1. **HR Welcome** (9:00 AM)
   - Benefits enrollment
   - Policy acknowledgments
   - Emergency contact forms

2. **IT Setup** (10:30 AM)
   - Laptop distribution
   - Software installation
   - Security training (mandatory)
   - Password setup with MFA

### Afternoon Session
1. **Department Introduction** (1:00 PM)
   - Team meet and greet
   - Role overview
   - First week expectations

2. **Systems Training** (3:00 PM)
   - Core application access
   - Knowledge base training
   - Communication tools setup

## First Week Goals

| Day | Focus Area |
|-----|-----------|
| Day 1 | Admin setup and orientation |
| Day 2 | Department deep dive |
| Day 3 | Shadow senior team member |
| Day 4 | Begin first assignment |
| Day 5 | Week 1 check-in with manager |

## Probation Period

- Duration: 90 days
- Reviews: Day 30, Day 60, Day 90
- Mentor assigned for first 90 days
- Full benefits eligibility after 90 days
""",
        "access_level": 1,
        "department": "HR"
    },
    {
        "title": "Incident Response Playbook",
        "content": """
# Incident Response Playbook

## Incident Severity Levels

### SEV-1 (Critical)
- Complete service outage
- Data breach confirmed
- Response time: Immediate (< 15 minutes)
- Escalation: CTO, CISO, CEO notified immediately

### SEV-2 (High)
- Partial service degradation
- Potential security breach
- Response time: < 30 minutes
- Escalation: Department head, Security team

### SEV-3 (Medium)
- Minor service issues
- Non-critical system affected
- Response time: < 2 hours
- Escalation: Team lead

### SEV-4 (Low)
- Cosmetic issues
- Workaround available
- Response time: Next business day

## Response Procedure

1. **Detection & Triage** (0-15 min)
   - Identify incident scope
   - Assign severity level
   - Create incident channel

2. **Containment** (15-60 min)
   - Isolate affected systems
   - Preserve evidence
   - Implement temporary fixes

3. **Eradication** (1-4 hours)
   - Remove root cause
   - Patch vulnerabilities
   - Verify containment

4. **Recovery** (4-24 hours)
   - Restore normal operations
   - Monitor for recurrence
   - Update status page

5. **Post-Incident** (24-72 hours)
   - Conduct blameless retrospective
   - Document lessons learned
   - Update runbooks
   - Close incident ticket

## Communication Templates

During SEV-1/SEV-2 incidents:
- Status updates every 30 minutes
- Customer communication via status page
- Internal updates via #incident-response channel
""",
        "access_level": 2,
        "department": "Engineering"
    }
]


# Test questions generated from these documents with ground truth answers
TEST_QUESTIONS = [
    {
        "question": "What is the policy for processing high-risk financial transactions?",
        "ground_truth": "High-risk transactions (over $100,000) require senior manager approval at VP level or above, dual authorization from two senior managers, must be logged in the secure vault system, real-time fraud detection screening, compliance team notification within 24 hours, and monthly review by Audit Committee.",
        "source_doc": "Financial Transaction Processing Guidelines"
    },
    {
        "question": "How long are legal audit logs retained?",
        "ground_truth": "Legal audit logs are retained for a minimum of 7 years in compliance with regional financial regulations.",
        "source_doc": "Data Retention and Archival Policy"
    },
    {
        "question": "Who has access to critical level documents?",
        "ground_truth": "Access to Critical (Level 4) documents requires Admin role assignment, explicit Critical clearance from CISO, two-factor authentication enabled, and quarterly access review.",
        "source_doc": "Security Access Control Policy"
    },
    {
        "question": "What is the response time for a SEV-1 incident?",
        "ground_truth": "SEV-1 (Critical) incidents require immediate response within 15 minutes, with CTO, CISO, and CEO notified immediately.",
        "source_doc": "Incident Response Playbook"
    },
    {
        "question": "How long is the employee probation period?",
        "ground_truth": "The probation period is 90 days, with reviews at Day 30, Day 60, and Day 90. A mentor is assigned for the first 90 days, and full benefits eligibility begins after 90 days.",
        "source_doc": "Employee Onboarding Procedures"
    },
    {
        "question": "What are the four document classification levels?",
        "ground_truth": "The four classification levels are: Public (Level 1), Internal (Level 2), Confidential (Level 3) requiring manager approval, and Critical (Level 4) requiring Admin role, CISO clearance, and 2FA.",
        "source_doc": "Security Access Control Policy"
    },
    {
        "question": "What is the SLA for international wire transfers?",
        "ground_truth": "International wire transfers have an SLA of 2-3 business days.",
        "source_doc": "Financial Transaction Processing Guidelines"
    },
    {
        "question": "How long are employee records retained after employment ends?",
        "ground_truth": "Employee records are retained for the duration of employment plus 7 years.",
        "source_doc": "Data Retention and Archival Policy"
    }
]
