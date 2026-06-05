---
title: Task Entity (Job Task)
created: 2026-06-05
updated: 2026-06-05
type: entity
tags: [task, activity, test/create, test/process]
sources: [oss/Task Management.mp4, oss/Service Team& Activity.mp4]
related: [[opportunity]], [[lead]], [[widget-special-controls]]
---

# Task Entity (Job Task)

## Overview

**Module**: Job Task (任务)
**Entry**: From any entity detail page (Opportunity, Lead, etc.) → "New Task" button, or Activity sidebar
**Context**: Tasks can be associated with Opportunity, Lead, Customer, or Contact

Tasks are assignable work items with deadlines, priorities, executors, and progress tracking. They support reminders, attachments, sub-tasks, and feedback loops.

## Field Registry (Video-Confirmed [V])

### Job Task Create Form

| Field Label | data-tid | Required | Type | Notes |
|-------------|----------|----------|------|-------|
| Deadline | — [V] | Yes (*) | Date/Time Picker | e.g., "06/05/2026 11:41 pm" |
| Owner | — [V] | Yes (*) | User Selector (chip) | Auto-filled with current user |
| Executor | — [V] | Yes (*) | User Selector (chip) | Person who executes the task |
| Priority | — [V] | Yes (*) | Dropdown | High / Second / Low |
| Associated Type | — [V] | Yes | Dropdown | Opportunity / Lead / Customer / Contact |
| Associated Data | — [V] | Auto | Read-Only Lookup | Auto-populated from parent record |
| C.C. Recipient | — [V] | No | User Selector | Multi-select |
| Description | — [V] | No | Text Area | Placeholder "Enter" |
| Superior Task | — [V] | Auto | Read-Only | Shows "-" when no parent |
| Attachment | — [V] | No | File Upload | "Upload the attachment" |

### Reminder Sub-Table

| Column | Type | Notes |
|--------|------|-------|
| Serial No. | Auto | Row numbering |
| Reminder Time | Dropdown | "1 day before", "At deadline", "15 min before", etc. |
| Method | Checkboxes | To-Do, Email (can select both) [V] |

**Row Actions**: Insert | Copy

### Task Details Page

**Header Metadata**:
| Field | Notes |
|-------|-------|
| Task Title | e.g., "Prepare Proposal" with star (favorite) icon |
| Status | Badge: "In progress" (blue) / "Completed" (green) [V] |
| Priority | Badge: "High" / "Second" (orange) / "Low" [V] |
| Created | e.g., "Today, 23:43" [V] |
| Owner | e.g., "Affendi" [V] |

**Tabs**:
1. **Basic Info** — Due Date, Executor, CC, Associated, Reminder, Progress, Description, Attachment, Sub-tasks
2. **Execution History** — Filters: In progress(0) / Completed(0) / To be confirm(1) [V]
3. **Task Feedback** — Timeline of feedback entries with progress % [V]

**Basic Info Fields**:
| Field | Notes |
|-------|-------|
| Due Date | e.g., "Tomorrow, 23:41" [V] |
| Executor | User avatar with name, subtext "0 in progress · 1 completed" [V] |
| CC | "None" or user list |
| Associated | Parent record link (e.g., Opportunity name) [V] |
| Reminder | e.g., "1 day before" |
| Progress | Progress bar with percentage (0% → 100%) [V] |
| Description | Task description text |
| Attachment | "None" or file list |
| Sub-tasks | "+ Add Sub-tasks" button [V] |

**Action Buttons** (top right):
- Edit (pencil icon)
- Delete (trash icon)
- Expand
- Close (X)
- "Task completed" button (disabled when already completed) [V]

### Task Feedback Modal

| Field | Type | Notes |
|-------|------|-------|
| Completion Progress | **Slider** (0-100%) | e.g., 54% [V] |
| Notify | Checkboxes | Owner, CC [V] |
| Description | **Rich Text Editor** (WYSIWYG) | Toolbar: Undo/Redo/Link/Font/Paragraph/List/Fullscreen; "Word count: 0" [V] |
| Attachment | File Upload | "Upload the attachment" |

**Action Buttons**: Confirm (blue) | Cancel

## Business Rules

1. **Contextual creation**: Task is created from a parent record (Opportunity/Lead/etc.); Associated Type and Associated Data are auto-filled [V]
2. **Owner vs Executor**: Owner creates/owns the task; Executor performs the work [V]
3. **Priority levels**: High / Second / Low [V]
4. **Dual-channel reminders**: Can notify via To-Do AND Email simultaneously [V]
5. **Progress tracking**: Executor updates progress via slider (0-100%) [V]
6. **Feedback loop**: Task Feedback creates entries visible in Execution History and Task Feedback tabs [V]
7. **Approval workflow**: "To be confirm" status indicates submitted work awaiting owner confirmation [V]
8. **Sub-task support**: Tasks can have child sub-tasks [V]
9. **Completion lock**: "Task completed" button is disabled after task is marked completed [V]

## Task Workflow

```
Task Created → In Progress → Executor updates progress → Task Feedback submitted → To be confirm → Owner confirms → Completed
```

## Task Workflow States

| Status | Color | Description |
|--------|-------|-------------|
| In progress | Blue | Task is being worked on |
| To be confirm | — | Feedback submitted, awaiting owner confirmation |
| Completed | Green | Task finished and confirmed |

## Language Note

Chinese labels in the Task UI are **defects**.
