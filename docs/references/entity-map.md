# MentorMatch - Domain Entity Map

> Domain entities and their relationships.

## Entity Relationship Diagram

```
Tenant ||--o{ User : has
Tenant ||--o{ Connection : has
Tenant ||--o{ LibraryItem : has
Tenant ||--o{ Invitation : has
User }o--o{ Skill : has (via UserSkill)
User ||--o{ Connection : mentor_in
User ||--o{ Connection : mentee_in
User ||--o{ WaitlistEntry : mentor_in
User ||--o{ WaitlistEntry : mentee_in
User ||--o{ LibraryItem : uploads
User ||--o{ Notification : receives
User ||--o{ Invitation : sends
Skill ||--o{ UserSkill : used_in
```

## Entity Descriptions

### Tenant (Company)
Represents a company using the platform. Each tenant gets a subdomain, custom branding, and isolated data.

### User
Platform user with role-based access. Can be mentor, mentee, admin, or super admin.

### Skill
Teachable/learnable capability. Shared across all tenants with usage-based ordering.

### Connection
Mentor-mentee relationship. Tracks status from pending to active.

### WaitlistEntry
Entry for mentees waiting when mentor has 4 active mentees.

### LibraryItem
Uploaded resource file (PDF, DOC, etc.) available to users.

### Invitation
Email invitation to join a specific tenant.

### Notification
In-app and push notification to users.

## Role Hierarchy

```
SUPER_ADMIN
└── All permissions across all tenants

ADMIN (Company Admin)
└── Full permissions within their tenant
    ├── Approve/reject users
    ├── Manage library
    ├── View reports
    └── Configure branding

MENTOR
└── Mentor-specific permissions
    ├── Accept/reject match requests
    ├── View mentees (max 4)
    ├── Manage waitlist
    └── Access library

MENTEE
└── Mentee-specific permissions
    ├── Browse mentors
    ├── Send match requests
    ├── View mentor contacts
    └── Access library
```
