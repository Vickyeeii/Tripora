# Guide Login Requirements

## Why Guide Cannot Login

Guides require admin approval before they can login. This is by design.

## Workflow

1. Guide Registration
   - Guide creates account
   - Account status: approved = false
   - Cannot login yet

2. Admin Approval (Admin must do this)
   - Admin logs in
   - Goes to pending guides list
   - Approves the guide account
   - Guide status: approved = true

3. Guide Login (After approval)
   - Guide can now login
   - Redirects to /guide/dashboard

## Test Guide Login

Option 1: Use existing approved guide in database
Option 2: Approve a guide via admin panel
Option 3: Create guide with status=true in database

## Error Messages

- "Account not approved" - Guide needs admin approval
- "Invalid credentials" - Wrong email/password

## Current Login Behavior

- Tourist - Redirects to /dashboard
- Guide - Redirects to /guide/dashboard (after approval)
- Admin - Redirects to /admin/dashboard
