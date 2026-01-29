# API Gateway Service

A high-performance API Gateway built with Go and Kubernetes, designed to manage, route, and secure API traffic for microservices architectures. The gateway handles authentication, rate limiting, request/response transformation, and serves as a single entry point for all client requests.

The system implements custom plugins for JWT validation, OAuth2 integration, and request throttling using Redis-backed counters. Built with extensibility in mind, the gateway supports dynamic configuration updates without downtime and provides real-time metrics through Prometheus integration. Successfully deployed in production handling 10,000+ requests per second with sub-millisecond latency.
