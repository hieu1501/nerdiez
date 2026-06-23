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

## File/Module Map (optional but powerful)
src
├── controllers/    # Controlling endpoints
├── services/       # Business logic
├── models/         # DB schema
├── repositories/   # Layer to talk to DB
├── security/       # Security logic
├── dtos/           # DTO
└── utils/          # Shared helpers