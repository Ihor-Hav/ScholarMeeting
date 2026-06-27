# Scholar

A meeting scheduling platform designed for educational institutions.

| | |
|---|---|
| 🌐 Live Demo | https://scholarshipmeetings.online |
| 🚀 Tech Stack | Next.js • TypeScript • Prisma • PostgreSQL |
| 🎥 Video Providers | Zoom • Google Meet |
| 📄 License | MIT |

## About

Scholar is a scheduling platform focused on educational organizations.

Teachers can publish booking pages that allow students to reserve available meeting slots. Meetings can be conducted online using Zoom or Google Meet or held in person.

The platform also provides organization management, contact management, calendar synchronization, and a complete meeting history.

## Features

### 📅 Scheduling Pages

Create reusable booking pages with configurable meeting duration, availability, and meeting provider.

Students can reserve available time slots directly from the teacher's public profile.

<img width="768" height="419" alt="Scheduling" src="https://github.com/user-attachments/assets/206b2506-5bf3-438e-93ae-f93c973f63c8" />

---

### 👥 Organizations

Manage educational organizations with role-based permissions.

Current roles:

- Owner
- Teacher
- Student

Users can also schedule meetings independently outside an organization.

---

### 📆 Calendar

View all meetings inside an integrated calendar.

Upcoming meetings are automatically displayed on their scheduled dates.

---

### 🎥 Video Meeting Integrations

Supported providers:

- Zoom
- Google Meet

Meetings can also be marked as in-person.

---

### 🤝 Contacts

Store frequently used contacts for faster scheduling.
<img width="795" height="428" alt="Contacts" src="https://github.com/user-attachments/assets/6337681a-9758-4593-9834-5f76918acf45" />


---

### 📖 Meetings

Complete history of meetings where the user is either:

- Host
- Participant

Meeting status includes:

- Scheduled
- Accepted
- Declined
- Cancelled

  <img width="800" height="432" alt="Meetings" src="https://github.com/user-attachments/assets/35febe32-05b7-40ab-8501-dc2a48c3e981" />

---

### 🔌 Plugins

Connect external providers.

Currently supported:

- Zoom
- Google

## Demo Notice

This application was built as a portfolio project to demonstrate software architecture, UI/UX, authentication, scheduling, and third-party integrations.

Some integrations are intentionally limited due to external service requirements.

### Current limitations

- ✅ Zoom meeting integration is fully functional.
- ⚠️ Google Meet integration is unavailable because Google requires OAuth verification before allowing production access.
- The source code contains the complete integration, but production usage is blocked until verification is approved by Google.
- ⚠️ This repository is a portfolio project intended for demonstration purposes.
