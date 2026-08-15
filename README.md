# CivicAI

> **AI-Powered Civic Reporting, Community Verification, and Transparent Issue Resolution**

CivicAI is an AI-powered civic issue reporting and management platform designed to connect citizens with the government departments responsible for solving public problems.

Instead of acting as a simple complaint form, CivicAI transforms reports into **structured, prioritized, and trackable civic issues**. Citizens and guests can report problems using **text, images, voice, and location**. AI helps analyze and route reports, registered citizens can verify community issues, and authorities can manage them through a transparent resolution workflow.

---

## 📌 Table of Contents

- [About CivicAI](#about-civicai)
- [The Problem](#the-problem)
- [Our Solution](#our-solution)
- [Key Features](#key-features)
- [How CivicAI Works](#how-civicai-works)
- [User Roles](#user-roles)
- [Technology Stack](#technology-stack)
- [Database Integration](#database-integration)
- [Privacy and Security](#privacy-and-security)
- [Government-Ready Sustainability](#government-ready-sustainability)
- [Measurable Public Value](#measurable-public-value)
- [Revenue Model](#revenue-model)
- [Hackathon Demo Flow](#hackathon-demo-flow)
- [Project Vision](#project-vision)
- [Team](#team)
- [License](#license)

---

## About CivicAI

CivicAI is designed around the complete civic issue lifecycle:

```text
Report
  ↓
Understand
  ↓
Verify
  ↓
Prioritize
  ↓
Route
  ↓
Resolve
  ↓
Prove
  ↓
Track
```

The goal is not simply to collect complaints.

The goal is to turn civic reports into **structured, actionable, transparent public-service workflows**.

---

## The Problem

Civic problems such as **potholes, damaged streetlights, overflowing waste, drainage problems, water leakage, and damaged public property** are common.

However, reporting and resolving them is often difficult.

### Citizens may not know:

- Where to report a problem
- Which department is responsible
- Whether their complaint was received
- Whether other citizens are facing the same issue
- What is happening after the report is submitted
- Whether the problem was actually resolved

### Government departments may face:

- Duplicate complaints
- Incorrect department routing
- Large numbers of unstructured reports
- Difficulty identifying urgent issues
- Limited visibility across departments
- Weak communication with citizens

CivicAI is designed to make this process **simpler, smarter, and more transparent**.

---

## Our Solution

CivicAI combines:

> **AI Assistance + Community Participation + Government Workflow + Transparent Tracking**

The platform helps turn raw citizen complaints into structured civic issues that can be:

- Analyzed
- Categorized
- Prioritized
- Verified
- Routed
- Assigned
- Resolved
- Tracked

---

# Key Features

## 🤖 AI-Powered Civic Reporting

CivicAI converts **text, images, voice, and location** into structured civic complaints.

AI can help identify:

- **Issue category**
- **Severity**
- **Priority**
- **Report summary**
- **Responsible department**

This reduces the amount of manual work required to understand and classify incoming complaints.

---

## 👤 Guest Reporting

Anyone can report a civic problem **without creating an account**.

Guest users can:

- Submit a complaint
- Add location
- Upload evidence
- Receive a tracking reference
- Track the progress of the report later

This makes civic reporting accessible even to users who do not want to register.

---

## 🏛️ Smart Department Routing

CivicAI automatically maps issues to the appropriate government department.

### Examples

| Civic Issue | Responsible Department |
|---|---|
| Potholes | Roads & Infrastructure |
| Damaged streetlights | Electricity / Street Lighting |
| Drainage problems | Water & Sanitation |
| Public property damage | Public Works |

This helps reduce delays caused by complaints being sent to the wrong department.

---

## 🗳️ Community Verification

Registered citizens can review community reports and vote:

- ✅ **Agree**
- ❌ **Disagree**

These votes act as an additional legitimacy and importance signal.

> **Community verification does not automatically declare a report true or false.**

Instead, it helps authorities understand whether multiple citizens support or recognize the reported issue.

---

## 🔁 Duplicate Problem Detection

Repeated complaints about the same or nearby issue can be identified as possible duplicates.

Instead of creating unnecessary duplicate work, CivicAI can connect similar reports so authorities can focus on solving the actual problem.

---

## 🚨 Priority Intelligence

CivicAI combines **AI severity assessment** with **community support** to help authorities identify urgent issues first.

Priority can consider factors such as:

- Severity
- AI analysis
- Category
- Location
- Community verification
- Duplicate reports
- Current workflow status

> CivicAI is designed to **support human decision-making, not replace it**.

---

## 📍 Transparent Status Tracking

Citizens can follow the progress of their reports through a clear workflow:

```text
Submitted → Under Review → In Progress → Completed
```

Status history is stored so users can see how a report progressed over time.

---

## 📸 Evidence-Based Resolution

Authorities can attach:

- Resolution notes
- Completion images
- Supporting evidence

This gives citizens visible proof of what was done after a complaint was resolved.

---

## 🔐 Role-Based Government Workflow

CivicAI provides dedicated permissions and dashboards for different user roles.

---

# User Roles

## 👨‍💻 Citizen

Citizens can:

- Submit detailed civic reports
- View their own reports
- View community issues
- Agree or Disagree with reports
- View status history
- Receive notifications
- View resolution evidence

---

## 👤 Guest

Guests can:

- Report a problem without registering
- Submit location and evidence
- Receive a tracking reference
- Track complaint status

Guests do not receive registered-user voting or administrative permissions.

---

## 🏢 Authority

Authorities can:

- View reports assigned to their department
- Review civic issues
- Update work status
- Add internal notes
- Attach resolution evidence
- Mark work as completed
- View AI priority
- View community signals

Authorities are restricted to their assigned department.

---

## 🛡️ Admin

Admins can:

- Monitor reports across departments
- Review priority queues
- View critical issues
- Manage categories
- Manage citizens and authority accounts
- Assign departments
- View city maps
- Access AI insights
- View analytics
- Supervise the overall civic workflow

---

# How CivicAI Works

```text
Citizen / Guest
      ↓
Report a Civic Problem
      ↓
Text + Image + Voice + Location
      ↓
AI Analysis
      ↓
Category + Severity + Priority
      ↓
Smart Department Routing
      ↓
Community Verification
      ↓
Authority Review
      ↓
Under Review
      ↓
In Progress
      ↓
Resolution Evidence
      ↓
Completed
      ↓
Citizen Notification / Guest Tracking
```

---

## Community Verification and Priority

Community voting acts as an additional prioritization signal.

A report can receive:

```text
Agree / Disagree
```

When enough registered users support an issue, CivicAI can increase its community legitimacy and effective priority.

Community support is used as a **decision-support signal**, not as automatic proof or automatic resolution.

---

# Technology Stack

## Frontend

- **React**
- **Vite**
- **React Router**
- Responsive role-based dashboards

## Backend

- **Node.js**
- **Express.js**

## Database

- **SQLite**
- **WAL mode**
- Foreign key relationships
- Persistent operational storage

## Authentication

- **bcrypt password hashing**
- Server-side sessions
- CSRF protection
- Role-based route authorization
- Role-based API authorization

## Artificial Intelligence

- **Groq** as the primary AI provider
- **NVIDIA** fallback
- Structured server-side AI analysis

## File Handling

- Secure uploads
- MIME validation
- File-signature validation
- Protected evidence access

---

## Technology Summary

| Layer | Technology |
|---|---|
| Frontend | React |
| Build Tool | Vite |
| Routing | React Router |
| Backend | Node.js |
| API Framework | Express.js |
| Database | SQLite |
| Authentication | bcrypt + Server-Side Sessions |
| Security | CSRF + Role-Based Authorization |
| Primary AI | Groq |
| AI Fallback | NVIDIA |

---

# Database Integration

CivicAI uses **real persistent database storage** for operational data.

The system stores information such as:

- Users
- Reports
- Community votes
- Evidence
- Report assignments
- Report notes
- Status history
- Notifications
- Sessions
- Verification tokens
- Password reset tokens
- Audit information

This means dashboards and report states are based on **real application data instead of temporary frontend mock data**.

---

# Privacy and Security

CivicAI includes multiple security measures designed to protect users and government workflows.

### Security Features

- **bcrypt password hashing**
- **HttpOnly session cookies**
- **Hashed session tokens**
- **Role-based authorization**
- **Department-level authority restrictions**
- **CSRF protection**
- **Protected APIs**
- **Safe public report projections**
- **Upload MIME validation**
- **File-signature validation**
- **Safe generated filenames**
- **Guest tracking protections**
- **Server-side AI credentials**
- **No password exposure to administrators**

Sensitive internal information is not exposed through public community reports.

---

# Government-Ready Sustainability

CivicAI is designed to **integrate with existing municipal systems rather than replace them**.

A municipality could use CivicAI as:

- A citizen-facing reporting layer
- An AI triage system
- A department-routing service
- A community verification layer
- An analytics dashboard
- An API integration with an existing complaint-management platform

This allows phased implementation.

```text
Pilot Department
      ↓
Municipal Deployment
      ↓
Multi-Department Integration
      ↓
Analytics + API Integration
      ↓
City-Wide Civic Platform
```

A government can begin with a **single department or pilot area** and expand later.

---

# Measurable Public Value

CivicAI can help cities:

- Reduce duplicate complaints
- Improve department routing
- Identify urgent problems faster
- Reduce manual complaint classification
- Improve resource prioritization
- Provide transparent status updates
- Collect resolution evidence
- Increase citizen participation
- Improve accountability
- Strengthen public trust

---

# Revenue Model

CivicAI can operate as a sustainable **government technology platform**.

## 1. Government Subscriptions

Municipalities can pay a recurring subscription for access to:

- CivicAI dashboards
- Reporting infrastructure
- Administrative tools
- Government workflow features

---

## 2. Implementation Fees

One-time implementation fees can cover:

- Deployment
- Configuration
- Department setup
- Workflow customization
- Migration
- Staff onboarding

---

## 3. System Integrations

Paid integrations can connect CivicAI with:

- Municipal databases
- GIS platforms
- Existing complaint-management systems
- Notification services
- Identity systems
- Government portals

---

## 4. Advanced Analytics

Advanced operational analytics can help municipalities analyze:

- Issue trends
- Department performance
- Geographic problem hotspots
- Resolution performance
- Category distribution
- Resource planning

---

## 5. Managed Hosting

CivicAI can provide secure managed hosting for municipalities that do not want to operate their own infrastructure.

---

## 6. Support and Maintenance

Ongoing support contracts can include:

- Technical support
- Software updates
- Security maintenance
- Backups
- Operational assistance

---

# Why CivicAI?

Traditional complaint systems often stop at:

```text
Submit Complaint
```

CivicAI is designed around the entire civic resolution cycle:

```text
Report
→ Understand
→ Verify
→ Prioritize
→ Route
→ Resolve
→ Prove
→ Track
```

## CivicAI is more than a complaint box.

It is designed to turn civic reports into **structured, actionable, transparent public-service workflows**.

---

# Hackathon Demo Flow

A simple hackathon demonstration can follow this sequence:

1. Open the **CivicAI landing page**.
2. Submit a civic issue as a **Citizen or Guest**.
3. Show **AI-assisted categorization and priority**.
4. Open **Community Issues**.
5. Demonstrate **Agree / Disagree verification**.
6. Open the **Authority Dashboard**.
7. Move the issue to **Under Review**.
8. Move the issue to **In Progress**.
9. Add optional **completion evidence**.
10. Mark the issue as **Completed**.
11. Return to the Citizen account.
12. Show the **notification and status timeline**.
13. Open the **Admin Dashboard**.
14. Show **priority queues, maps, user management, and analytics**.

---

# Project Vision

CivicAI aims to create a clearer connection between citizens and the institutions responsible for maintaining their communities.

The platform combines:

> **AI Assistance + Community Participation + Government Workflow + Transparent Tracking**

to make civic problem reporting:

- **Simpler**
- **Smarter**
- **More Transparent**
- **More Accountable**

---

# Team

## CivicAI

**Team:** `4NOUGHT4`

**Project:** `CivicAI`

---

# License

A project license has not yet been specified.

Add the appropriate **open-source or proprietary license** before production distribution if required.

---

<p align="center">
  <b>Making civic problem reporting simpler, smarter, and more transparent.</b>
</p>
