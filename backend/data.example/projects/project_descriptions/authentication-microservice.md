# Authentication Microservice

A secure authentication and authorization microservice built with Node.js and Express, providing centralized identity management for microservices architectures. The service implements OAuth2, OpenID Connect, and JWT token management with support for multi-factor authentication.

Features include social login integration (Google, GitHub, Azure AD), single sign-on (SSO) across applications, role-based access control (RBAC), and session management with Redis. Implemented rate limiting, account lockout policies, and comprehensive audit logging. Built following OWASP security best practices with bcrypt for password hashing, CSRF protection, and secure token storage. Handles 100,000+ authentication requests daily with 99.99% uptime.
