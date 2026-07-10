---
title: CRM Module Deep Documentation — Task Management
created: 2026-06-05
updated: 2026-06-05
type: documentation
tags: [task, job-task, workflow, feedback, reminder]
sources: [oss/Task Management.mp4, video-analysis-2026-06-05]
related: [[opportunity]], [[lead]], [[entities/task]]
---

# Module Deep Documentation: Task Management

> **Audience**: New team members who need to understand the CRM task/workflow system
> **Source**: Video recording (6.6 min) + Audio transcription (2,869 chars) + 5 key frame analysis
> **Date**: 2026-06-05

---

## 1. Overview

The Task Management module allows users to:
1. **Create tasks** linked to any entity (Opportunity, Lead, Customer, Contact)
2. **Assign tasks** to other team members (Executors)
3. **Track progress** through a feedback loop
4. **Set reminders** via To-Do and Email notifications

Tasks are a **cross-entity feature** — they can be created from any detail page and are associated with the parent record.

---

## 2. Task Lifecycle

```
Task Created (by Owner)
  ↓
Assigned to Executor (via To-Do + Email notification)
  ↓
Executor works on task
  ↓
Executor submits Task Feedback (updates progress %)
  ↓
Status: "To be confirm"
  ↓
Owner reviews and clicks "Pass"
  ↓
Task marked "Completed" (100%)
```

### 2.1 Task States

| Status | Color | Meaning |
|--------|-------|---------|
| In progress | Blue | Task is being worked on by Executor |
| To be confirm | — | Executor submitted feedback, awaiting Owner approval |
| Completed | Green | Owner confirmed, task is done |

---

## 3. Creating a Task

### 3.1 Entry Point

Tasks are created **from a parent record's detail page**:
1. Navigate to any detail page (Opportunity, Lead, etc.)
2. Find the Task section (right sidebar or tab)
3. Click "New Task" button

### 3.2 Task Create Form — Complete Field Reference

| Field | Type | Required | Notes | Example |
|-------|------|----------|-------|---------|
| Deadline | Date/Time Picker | Yes (*) | When the task must be completed | "06/05/2026 11:41 pm" |
| Owner | User Selector (chip) | Yes (*) | Auto-filled with current user | "Affendi" |
| Executor | User Selector (chip) | Yes (*) | Person who will do the work | "Danny" |
| Priority | Dropdown | Yes (*) | Task urgency level | "High" |
| Associated Type | Dropdown | Yes | Auto-filled with parent entity type | "Opportunity" |
| Associated Data | Read-Only Lookup | Auto | Auto-filled with parent record name | "eKYC & Digital Identity Verification..." |
| C.C. Recipient | User Selector | No | People who should know about the task (but don't need to act) | — |
| Description | Text Area | No | Task details; placeholder "Enter" | "prepare a solution for..." |
| Superior Task | Read-Only | Auto | Shows "-" when no parent task | — |
| Attachment | File Upload | No | "Upload the attachment" | — |

### 3.3 Reminder Configuration

At the bottom of the create form, there's a **Reminder sub-table**:

| Column | Type | Options | Default |
|--------|------|---------|---------|
| Serial No. | Auto | — | 1 |
| Reminder Time | Dropdown | "1 day before", "3 hours before", "1 hour before", "30 min before", "15 min before", "At deadline" | "1 day before" |
| Method | Checkboxes | ☑ To-Do, ☑ Email | Both checked |

**How it works**:
- Reminder is calculated relative to the **Deadline**
- "1 day before" = notification sent 24 hours before deadline
- "3 hours before" = notification sent 3 hours before deadline
- Default notification methods: **To-Do item** AND **Email**

**Multiple reminders**: Click "Insert" or "Copy" to add additional reminder rows.

### 3.4 Task Creation Example (from video)

**Scenario**: Owner "Affendi" creates a task for Executor "Danny" on an Opportunity.

```
Task Title: "Prepare Proposal"
Deadline: Friday (tomorrow) 11:00 PM
Executor: Danny
Priority: High
Associated Type: Opportunity (auto-filled)
Associated Data: "eKYC & Digital Identity Verification Platform for CIMB Bank Berhad" (auto-filled)
Description: "prepare a solution for..."
Reminder: 1 day before via To-Do + Email
```

After saving:
1. Task appears in the Opportunity's Task list
2. Danny receives a To-Do item and email notification
3. Danny can view and work on the task from his account

---

## 4. Task Details Page

### 4.1 Header Information

| Field | Notes |
|-------|-------|
| Task Title | e.g., "Prepare Proposal" with star (favorite) icon |
| Status | Badge: "In progress" (blue) / "Completed" (green) |
| Priority | Badge: "High" / "Second" (orange) / "Low" |
| Created | e.g., "Today, 23:43" |
| Owner | e.g., "Affendi" |

### 4.2 Tabs

| Tab | Content |
|-----|---------|
| **Basic Info** | Due Date, Executor, CC, Associated, Reminder, Progress, Description, Attachment, Sub-tasks |
| **Execution History** | Filtered by status: In progress(0) / Completed(0) / To be confirm(1) |
| **Task Feedback** | Timeline of feedback entries with progress % |

### 4.3 Basic Info Fields

| Field | Notes |
|-------|-------|
| Due Date | e.g., "Tomorrow, 23:41" |
| Executor | User avatar + name; subtext shows "0 in progress · 1 completed" |
| CC | "None" or user list |
| Associated | Parent record link (e.g., Opportunity name) |
| Reminder | e.g., "1 day before" |
| Progress | Progress bar with percentage (0% → 100%) |
| Description | Task description text |
| Attachment | "None" or file list |
| Sub-tasks | "+ Add Sub-tasks" button (for breaking down large tasks) |

### 4.4 Action Buttons (Top Right)

| Button | Purpose |
|--------|---------|
| Edit (pencil) | Modify task details |
| Delete (trash) | Delete the task |
| Expand | Full-screen view |
| Close (X) | Close task details |
| **Task completed** | Mark task as complete (disabled after completion) |

---

## 5. Task Feedback — Executor Workflow

### 5.1 How Executor Submits Feedback

1. Executor (Danny) logs into his account
2. Checks his To-Do list → sees the task "Prepare Proposal"
3. Clicks the task to open details
4. Clicks "Task Feedback" button
5. In the feedback modal:

| Field | Type | Notes |
|-------|------|-------|
| Completion Progress | **Slider** (0-100%) | Drag to set percentage (e.g., 54%) |
| Notify | Checkboxes | ☑ Owner, ☑ CC — who gets notified of this update |
| Description | **Rich Text Editor** (WYSIWYG) | Toolbar: Undo/Redo/Link/Font/Paragraph/List/Fullscreen; Word count: 0 |
| Attachment | File Upload | Optional supporting documents |

6. Click "Confirm" to submit

### 5.2 What Happens After Feedback

- Task status changes to **"To be confirm"**
- Owner receives notification (if checked)
- Feedback appears in the Task Feedback timeline
- Progress bar updates to the submitted percentage

### 5.3 Owner Confirmation

1. Owner (Affendi) views the task
2. Sees the Executor's feedback and progress update
3. Clicks "Pass" (or equivalent confirmation button)
4. Task status changes to **"Completed"**
5. Progress bar shows 100%
6. "Task completed" button becomes disabled (prevents double-completion)

---

## 6. Sub-Tasks

Tasks can have **child sub-tasks** for breaking down complex work:

- **Entry point**: "Add Sub-tasks" button on Task Details page
- Sub-tasks follow the same workflow as parent tasks
- Useful for complex tasks that need multiple steps

---

## 7. Key Concepts

### 7.1 Owner vs. Executor

| Role | Responsibility |
|------|----------------|
| **Owner** | Creates the task, assigns it, reviews feedback, confirms completion |
| **Executor** | Receives the task, works on it, submits feedback with progress updates |

### 7.2 C.C. Recipient

- People who should be **informed** about the task but don't need to take action
- Similar to email CC — they receive notifications but can't edit or confirm
- Optional field

### 7.3 Reminder Channels

| Channel | How It Works |
|---------|-------------|
| **To-Do** | Creates a To-Do item in the user's task list |
| **Email** | Sends an email notification |

Both can be selected simultaneously (default behavior).

---

## 8. Known Issues

| # | Issue | Description | Severity | Audio Reference |
|---|-------|-------------|----------|-----------------|
| 1 | Task Feedback edit page has problems | "This page still has a problem, but it's okay" — edit functionality may be broken | Medium | From video: "And this page still has a problem" |
| 2 | Task completion button state | Button should be disabled after completion to prevent double-completion | Low | Observed: button is greyed out after completion |

---

## 9. Testing Requirements

### 9.1 Task Creation Tests

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| Create task from Opportunity | Navigate to Opportunity → New Task → Fill form → Save | Task created, appears in Task list |
| Verify auto-fill fields | Check Associated Type and Associated Data | Auto-filled with parent Opportunity info |
| Set reminder | Set "1 day before" with To-Do + Email | Reminder configured correctly |
| Add C.C. recipient | Select user in C.C. field | User will receive notifications |

### 9.2 Task Execution Tests

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| Executor receives notification | Create task → Login as Executor → Check To-Do | Task appears in To-Do list |
| Submit feedback (partial) | Click Task Feedback → Set slider to 54% → Confirm | Progress shows 54%, status "To be confirm" |
| Submit feedback (complete) | Set slider to 100% → Confirm | Progress shows 100% |
| Owner confirms task | Owner views task → Click "Pass" | Task status "Completed", progress 100% |

### 9.3 Reminder Tests

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| To-Do reminder | Create task with To-Do reminder | To-Do item appears in Executor's list |
| Email reminder | Create task with Email reminder | Email received by Executor |
| Both channels | Create task with To-Do + Email | Both notifications received |
| Multiple reminders | Add 2 reminder rules (1 day + 3 hours) | Both reminders trigger at correct times |

---

## 10. Quick Reference — Task Workflow Summary

```
1. Owner creates task from any detail page
2. Sets deadline, assigns Executor, configures reminders
3. Executor receives To-Do + Email notification
4. Executor works on task, submits feedback with progress %
5. Owner reviews feedback, clicks "Pass"
6. Task marked "Completed" (100%)
```

| Priority Options | High / Second / Low |
|------------------|---------------------|
| Reminder Timing | 1 day / 3 hours / 1 hour / 30 min / 15 min / At deadline |
| Notification Methods | To-Do, Email |
| Task States | In progress → To be confirm → Completed |
