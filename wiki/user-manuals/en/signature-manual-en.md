---
title: Signature Upload User Manual (English)
created: 2026-06-09
updated: 2026-06-09
type: user-manual
tags: [signature, signature-upload, user-manual, en]
---

# Signature Upload User Manual

> **Version**: V1.0 | **Date**: 2026-06-09 | **System**: Securemetric CRM (EasyCraft)

---

## Quick Setup (3 Steps)

> **When is this needed?** Only **P&L** and **Quotation** modules have an approval workflow that requires a digital signature. If you are involved in P&L or Quotation approvals, set up your default signature once — it will be automatically selected every time you sign.

### Step 1 — Open My Signature

Go to: **[My Signature](http://172.18.114.231:8088/web/#/current/sys-modeling/app/km-signature/listView/1h63ga1itwsaw4jj8w1mr6an91ehjp1a1bw0/1h2aj825lw2cvwfjuw1s2ro5g2gqb7p033w0?navId=1h63ga1irwsaw4jj7w11052cb3erb8a6p8w0&appId=1gokoobhhwd3qwh5ow3id3n7b10j1gmf1aw0)**

In the left sidebar click **Signature image** → **My Signature**, then click **Create**.

![My Signature list page — left nav and Create button](../../assets/signature-001-list.png)

### Step 2 — Fill in the key fields

In the **Signature Library Create** form, three things matter:

| Field | What to select |
|-------|---------------|
| **Auto-authorize** | ✅ **Password-free** |
| **Default Signature** | ✅ **Default signature** *(appears after selecting Password-free)* |
| **Signature image** | Upload your signature image file (jpg / gif / png, ≤ 10 MB) |

Leave everything else as-is (Signature name = anything you like, status = Enabled).

![Form filled — Password-free selected, Default signature selected, image upload ready](../../assets/signature-003-form-filled.png)

### Step 3 — Submit

Click **Submit**. Once the approval workflow passes, your default signature is active and will be automatically pre-selected whenever you sign a P&L or Quotation approval.

---

## Signature Image Tips

Prepare your image before uploading:

| Attribute | Recommendation |
|-----------|---------------|
| Format | **PNG** (transparent background preferred) |
| Size | 300–600 px wide × 100–200 px tall |
| File size | ≤ 500 KB |
| Background | Transparent or white — no coloured backgrounds |
| Ink | Black on light background, legible at small sizes |

> **Tip**: Crop tightly — remove large blank margins around the signature. The image will appear small in approval panels.

---

## Understanding the Two Key Settings

### Auto-authorize

| Option | What happens |
|--------|-------------|
| Password required | You must enter a password every time you apply the signature |
| **Password-free** ✓ | No password prompt — signature is applied instantly |

**Always choose Password-free** for your personal default signature. It removes the extra step during every approval.

### Default Signature

The **Default Signature** field only appears after selecting **Password-free**.

- **Default signature** → this entry is automatically pre-selected in the signature pad
- Non-default signature → you must manually pick it each time

Only one signature should be set as default. If you create additional signatures later, mark all others as *Non-default signature*.

---

## Full Field Reference

| Field | Required | Notes |
|-------|----------|-------|
| Signature | Yes | Display name — e.g. your name |
| Signature type | No | Personal Signature or Company seal |
| Authorized users | No | Who can use this signature; auto-filled with you |
| Auto-authorize | Yes | **Password-free** recommended |
| Default Signature | No | **Default signature** recommended (appears after Password-free) |
| Signature image | Yes | jpg / gif / png, max 10 MB |
| Signature Description | No | Optional memo |
| Signature status | Yes | Enabled |

---

## FAQ

**Q: The Default Signature field is not visible.**
Select **Password-free** under Auto-authorize first — the Default Signature row only appears after that.

**Q: My signature is not appearing in approval forms after I submitted.**
The signature record goes through an approval workflow. It becomes active only after that approval is passed. Check the Process Approvals panel on the right of the form.

**Q: My image shows a coloured box in the PDF.**
Export the image as PNG with a **transparent** background. A white-filled background will appear as a white box overlaid on the document.

**Q: Which modules need a signature?**
Only **P&L** and **Quotation** approval workflows require a digital signature. Other modules (Lead, Contact, Customer, SO, etc.) do not use signatures.
