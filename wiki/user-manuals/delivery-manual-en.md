---
title: Delivery (Shipment Tracking) User Manual (English)
created: 2026-06-04
updated: 2026-06-04
type: user-manual
tags: [delivery, user-manual, en]
---

# Delivery (Shipment Tracking) User Manual

> **Version**: V1.0 | **Date**: 2026-06-04 | **System**: Securemetric CRM (EasyCraft)

---

## Table of Contents

1. [Module Overview](#1-module-overview)
2. [List View](#2-list-view)
3. [Create a Delivery Record](#3-create-a-delivery-record)
4. [Details View](#4-details-view)
5. [Business Rules & Workflow](#5-business-rules--workflow)
6. [FAQ & Notes](#6-faq--notes)

---

## 1. Module Overview

The **Delivery** module tracks physical shipments and logistical handover events linked to Sales Orders. When goods or equipment are dispatched to a customer, a Delivery record captures all courier, shipping cost, air waybill, and weight details. This module serves as the operational record of fulfilment — separate from the financial tracking in the Payment Schedule.

### 1.1 Entry Points

| Entry Point | Path |
|-------------|------|
| Standalone list | Left sidebar → **SALES ORDER** → **Delivery** |

### 1.2 Core Functions

- Link shipments to the originating Sales Order
- Record courier service details (courier name, air waybill, weight)
- Track shipping costs and fuel surcharges in MYR
- Capture Proforma Invoice (PI) number and self-collect references
- Record the person responsible for shipping and the person who completed it
- Associate invoice numbers with the shipment

---

## 2. List View

The Delivery list shows all shipment records accessible to the current user.

| Column | Description |
|--------|-------------|
| Sales Order No. | Linked Sales Order reference |
| Customer Name | Customer receiving the shipment (auto from SO) |
| Date | Delivery record date |
| PI Number | Proforma Invoice number |
| Ship Date | Actual date goods were dispatched |
| Courier Services | Name of the courier company |
| Air Way Bill | AWB tracking number |
| Invoice Number | Commercial invoice number for this shipment |
| Done By | Staff member who completed the delivery |

Use the search bar to filter by Sales Order No., Customer Name, or AWB number.

---

## 3. Create a Delivery Record

### 3.1 Opening the Form

Navigate to Left sidebar → **SALES ORDER** → **Delivery** and click **+ New**.

### 3.2 Field Reference

| Field | Required | Type | Notes |
|-------|----------|------|-------|
| Sales Order No. | Yes | Relation (lookup) | Select the linked Sales Order |
| Date | No | Date/time picker | Date of the delivery record creation or delivery event |
| PI Number | No | Text input | Proforma Invoice number issued for this shipment |
| Self-collect ID | No | Text input | Reference ID if customer self-collects the goods |
| Customer Name | No (auto) | Read-only text | Auto-populated from the linked Sales Order |
| Sales Person | No | Address picker (user) | Account Manager or sales rep responsible for this order |
| Item Description | No | Textarea | Description of goods being shipped |
| Invoice Number | No | Text input | Commercial invoice number linked to this shipment |
| Done By | No | Address picker (user) | Staff member who physically completed the delivery or handover |
| Ship Date | No | Date/time picker | Actual date and time goods left the warehouse or office |
| Courier Services | No | Text input | Name of the courier company (e.g., DHL, FedEx, Pos Laju) |
| Fuel Surcharge MYR | No | Money input (MYR) | Fuel surcharge imposed by the courier, in MYR |
| Air Way Bill | No | Text input | Air Waybill (AWB) or tracking number from the courier |
| Weight | No | Number input | Shipment weight (kg or unit as applicable) |
| Courier Invoice Number | No | Text input | Invoice number issued by the courier company |
| Shipping Cost MYR | No | Money input (MYR) | Total shipping cost charged by the courier, in MYR |
| Remarks | No | Textarea | Additional notes about the shipment |
| Entity Code | No | Text input | Internal entity or subsidiary code for multi-entity operations |

### 3.3 Saving

Click **Save** in the top action bar. The Delivery record is saved and linked to the Sales Order. The Customer Name is populated automatically and cannot be edited directly.

---

## 4. Details View

### 4.1 Main Information

All fields from the Create form are displayed. Customer Name is read-only, auto-derived from the linked Sales Order.

### 4.2 Sub-tabs

| Tab | Content |
|-----|---------|
| Detail Information | All delivery fields |
| System Record | Creation and modification audit trail |

### 4.3 Editing

Click **Edit** in the top action bar to enter edit mode. All non-read-only fields can be updated. Click **Save** to confirm changes.

---

## 5. Business Rules & Workflow

### 5.1 Standard Delivery Workflow

```
Sales Order confirmed → Goods ready for dispatch
→ Create Delivery record → Select Sales Order No.
→ Customer Name auto-populates
→ Fill courier details (Courier Services, AWB, Weight, Ship Date)
→ Fill cost details (Shipping Cost MYR, Fuel Surcharge MYR)
→ Fill PI Number and Invoice Number
→ Assign Done By
→ Save
```

### 5.2 Sales Order is Mandatory

Every Delivery record **must be linked to a Sales Order**. The Sales Order drives the Customer Name. A Delivery cannot be created in isolation — it must trace back to a confirmed sale.

### 5.3 Customer Name is Auto-populated

Once the Sales Order is selected, the **Customer Name** field is automatically filled from the SO record. It is read-only and cannot be overridden. If the wrong customer appears, the wrong SO was selected — correct the SO link.

### 5.4 Shipping Costs in MYR

Both **Shipping Cost MYR** and **Fuel Surcharge MYR** are recorded in Malaysian Ringgit (MYR) regardless of the invoice currency. This is for internal cost tracking and reimbursement purposes. Convert foreign currency shipping costs to MYR at the prevailing rate before entering.

### 5.5 Self-collect Shipments

If the customer arranges their own collection (self-collect), fill in the **Self-collect ID** field with the reference provided by the customer or logistics coordinator. The Courier Services, AWB, and Weight fields may be left blank for self-collect records.

### 5.6 PI Number vs Invoice Number

| Field | Purpose |
|-------|---------|
| PI Number | Proforma Invoice number — issued before shipment for customs/payment reference |
| Invoice Number | Commercial/Tax Invoice number — issued after shipment for billing |

Both may apply to the same shipment. Fill whichever documents have been issued at the time of creating the record.

### 5.7 Entity Code

The **Entity Code** identifies which Securemetric subsidiary or business entity is handling the shipment. This is relevant for multi-entity operations (e.g., Malaysia entity shipping on behalf of a regional entity). Consult your manager if unsure which code to use.

---

## 6. FAQ & Notes

**Q: The Sales Order I need is not in the lookup dropdown. Why?**
The SO may be in a status that does not permit Delivery creation, or you may not have access rights to that SO. Check the SO status and your access permissions. Contact your manager if the SO should be accessible.

**Q: Can I create a Delivery record before the goods are actually shipped?**
Yes. The **Date** field records when you create the record, and the **Ship Date** field records when goods actually left. You can create the record in advance and fill in the Ship Date once the goods depart.

**Q: The courier gave me a combined invoice covering multiple shipments. How do I record it?**
Create separate Delivery records for each shipment linked to each respective Sales Order. Reference the same **Courier Invoice Number** on each record. The total cost may need to be manually apportioned across the records.

**Q: Do I need to record the delivery if the customer self-collects?**
Yes. Create a Delivery record and fill in the **Self-collect ID**. Leave courier-specific fields (AWB, Courier Services, Weight) blank. This ensures the fulfilment event is documented in the CRM.

**Q: Who should be set as "Done By"?**
The person who physically handed over the goods, signed the delivery note, or confirmed the handover with the courier. This may be a warehouse staff member, logistics coordinator, or sales rep, depending on your process.

**Q: Can I attach the courier's delivery confirmation document to the Delivery record?**
Check if your CRM configuration includes an attachment field on the Delivery form. If not, upload the document to the linked Sales Order's attachment section and note the reference in the Remarks field.

**Q: What is the "Entity Code" field used for?**
It identifies which legal entity (subsidiary) within the Securemetric group is responsible for the shipment. This is used for inter-company accounting and compliance reporting. Ask your Finance or Operations team for the correct code.
