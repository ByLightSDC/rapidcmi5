# Overview

This library is designed to be frontend and backend agnostic.

It contains shared types, schemas, and utilities that can be used consistently across both client and server applications. The goal is to provide a single source of truth for data models, validation, and API contracts throughout the stack.

## Features

- Shared TypeScript types for frontend and backend applications
- Shared Zod schemas for runtime validation and type inference
- Centralized API contracts using TS-Rest
- Utilities for building fully type-safe APIs
- Support for scaffolding backend services directly from shared contracts

## API Contracts

API contracts are defined in this package using TS-Rest. These contracts can be consumed by both frontend clients and backend services to ensure end-to-end type safety.

Using the shared contracts, consumers can:

- Generate strongly typed API clients
- Scaffold backend route handlers
- Share request and response types across services
- Reduce duplication between frontend and backend implementations

## Goals

- Maintain a single source of truth for API definitions
- Eliminate duplicated types between applications
- Improve developer experience with end-to-end typing
- Keep the package framework-agnostic and reusable across environments
