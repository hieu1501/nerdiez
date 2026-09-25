# Project: [Name]

## Purpose
Backend system for an app for studying and reading topics about computer science and economics (combination of Duolingo and Reddit).

## Stack
- Language: Java
- Framework: Spring boot
- DB: MySQL

## Scope
### In scope
- [Administrator]: manage articles, lessons, users and permissions (who can post an articles).
- [Articles]: allow users to read, comment, upvote/downvote and post an article (if allowed).
- [Lessons]: allow users to learn, review and take tests on some topics.

### Out of scope (explicitly)
- No UI/frontend work.
- No email/notification systems.
- No third-party payment integration.

## Constraints
- RESTful API
- Read files in this project (backend) only.

## File/Module Map (optional but powerful)
backend/
└── src/main/
├── java/com/tmb/csnerd/demo/
│   ├── (root)                    # Application entry point
│   ├── admin/
│   │   ├── config/               # Admin-profile security (OAuth login)
│   │   └── controllers/          # Admin auth endpoints
│   ├── bootstrap/                # Startup seeding / one-time setup
│   ├── common/
│   │   ├── config/               # Shared Spring configuration
│   │   └── security/             # JWT, keys, principals, OAuth helpers
│   ├── domain/
│   │   ├── models/               # JPA entities
│   │   ├── repositories/         # Data access
│   │   └── services/
│   │       ├── auth/             # Authentication & user loading
│   │       ├── refreshtoken/     # Refresh token lifecycle
│   │       ├── post/             # Article business logic
│   │       ├── category/         # Category business logic
│   │       ├── topic/            # Topic business logic
│   │       └── user/             # User business logic
│   ├── public_api/
│   │   └── controllers/          # REST API endpoints
│   ├── dto/
│   │   ├── auth/
│   │   ├── post/
│   │   ├── category/
│   │   ├── topic/
│   │   └── user/
│   ├── exceptions/
│   │   ├── post/
│   │   ├── category/
│   │   └── topic/
│   └── utils/                    # Shared helpers
│
└── resources/
├── db/migration/             # Flyway SQL migrations
└── certs/                    # RSA keys for JWT signing