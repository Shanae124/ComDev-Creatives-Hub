# ProtexxaLearn Backend - AI Coding Agent Instructions

## Project Overview

ProtexxaLearn is a **Learning Management System (LMS) backend** built with Node.js, Express, and PostgreSQL. It manages users, courses, modules, lessons, and student progress tracking through RESTful APIs.

### Architecture

- **server.js**: Express REST API server (port 3000)
- **db.js**: PostgreSQL connection pool (hardcoded credentials for local dev)
- **initdb.js**: Schema initialization script with table creation and ON CONFLICT handling

### Database Schema

The database defines a hierarchical learning structure:
```
users → courses → modules → lessons → lesson_progress
       → enrollments (junction table)
```

Key patterns:
- **Cascading deletes** on foreign keys (ON DELETE CASCADE)
- **Unique constraints** on natural key combinations (user_id, course_id) in enrollments
- **Timestamps** auto-set to CURRENT_TIMESTAMP for audit trails
- **Default values** for role ('student') and lesson_type ('reading')

## Critical Data Flows

### Enrollment Model
```
POST /enroll with (user_id, course_id) 
→ INSERT ... ON CONFLICT ... DO UPDATE SET status='active'
```
This **upsert pattern** allows re-enrolling users without duplicates; status resets to 'active' if previously set otherwise.

### GET /enrollments
Returns **joined view** of enrollments with user and course details in a single query (avoids N+1 queries).

## Conventions & Patterns

### Error Handling
- **Validation first**: Check required fields (`name`, `email`, `title`) before database operations
- **400 vs 500**: Return 400 for input validation/constraint errors, 500 for unexpected query failures
- **Error messages**: Pass `err.message` directly (suitable for dev; review for production)

### Query Parameters
- All GET endpoints use `ORDER BY id ASC` for consistent pagination baseline
- POST endpoints accept optional fields with `|| fallback` syntax (e.g., `role || "student"`)

### Response Format
- Single resource creation: Returns `result.rows[0]` (the created object)
- Collections: Return full `result.rows` array with all requested joins
- Errors: Return JSON object with `error` key

## Critical Developer Workflows

### Database Initialization
```bash
node initdb.js
```
**Must run before first API request** to create schema. This is NOT automated on server startup; it exits after completion (`process.exit()`).

### Start Development Server
```bash
node server.js
```
Listens on `http://localhost:3000`; no watch mode configured.

### Current Gaps
- No test framework configured
- No environment file (.env) - credentials hardcoded in db.js
- No production database setup documented

## Integration Points & Dependencies

- **pg (node-postgres)**: Connection pooling via native driver
- **express@5.2.1**: Latest major version with breaking changes potential
- **cors@2.8.5**: Enabled globally for all routes (no origin restrictions)

## Key Files to Reference

When implementing similar patterns:
- [server.js](server.js) - REST endpoint templates with try-catch wrapping
- [initdb.js](initdb.js) - Schema definition and migration approach
- [db.js](db.js) - Pool configuration and export pattern

## Common Modifications

**Adding a new endpoint:**
1. Define GET/POST handler in server.js with `pool.query()` call
2. Validate required fields first (return 400 if missing)
3. Use `RETURNING *` for write operations to echo back created/updated rows
4. Wrap in try-catch with `res.status(500).json({ error: err.message })`

**Adding a new table:**
1. Add `CREATE TABLE IF NOT EXISTS` block in initdb.js
2. Define foreign key references and cascading delete behavior
3. Re-run `node initdb.js` to apply schema changes
