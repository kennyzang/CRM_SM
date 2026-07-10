# CRM Permission Configuration Guide

> **Audience:** CRM System Administrators
> Quickly configure role permissions for employees across different job functions

---

## 1. Configuration Entry Point

### Role Permission Management

Navigation path: **Permission Mgt → Role Permission**

Direct link: `http://[system-domain]/web/#/manage/sys-right/sysRightGroup/list`

This page lists all roles created in the system. Each role defines a set of permissions. Once a user is assigned to a role, they inherit all permissions associated with that role.

---

## 2. Core Concepts

Configuring permissions for an employee involves two steps:

```
Step 1: Create or edit a role
  → Define what operations this role can perform (check permission items)

Step 2: Assign the role to users or organizations
  → Role edit page → Role users → Add the relevant people or organizations
```

> **Important:** The role's permission scope controls "which buttons the employee can click," but **which data records they can see** requires a separate configuration (see Chapter 7).

---

## 3. Creating and Editing Roles

### 3.1 Create a New Role

1. Go to Permission Mgt → Role Permission
2. Click **Create** in the upper right
3. Fill in:
   - **Role Name:** e.g., "Sales Executive"
   - **Role users:** Select users or organizations to assign this role to (multi-select)
   - **Role Permission:** Check the required permissions in the permission tree
4. Click **Save**

### 3.2 Edit an Existing Role

1. Find the target role and click **Edit** at the end of the row
2. Add or remove checkboxes in the permission tree
3. Click **Save**

> **Tip:** Use the search box at the top of the permission tree to quickly locate permissions by keyword (e.g., "Lead", "Customer").

---

## 4. Existing System Roles

The system includes 8 pre-configured business roles (+ 1 system admin role) that can be adjusted as needed:

| Role Name | Assigned Organizations | Description |
|-----------|----------------------|-------------|
| **Account Manager** | SMMY, SCMY, MSMY, and 6 more | Most comprehensive business role for sales |
| **Presales** | Not assigned | Focuses on opportunities and competitive analysis |
| **Marketing** | Not assigned | Handles lead imports and marketing activities |
| **Finance Team** | Not assigned | Views financial-related data |
| **Operation Team** | Not assigned | Views orders and contracts; handles deliveries |
| **Project Management** | Not assigned | Manages SOs, contracts, and collections |
| **Customer Support** | Not assigned | Views customer and contract status |
| **Sales Administrator** | Not assigned | Pending configuration — currently no permissions |
| **seradmin** | seradmin, Affendi, Soo, Wo | System administrator with full access |

---

## 5. Role Permission Details

### 5.1 Account Manager — Most Comprehensive Business Role

**Assigned Organizations:** SMMY, SCMY, MSMY, PTSM, PTSK, SMPH, SMVN, Signing Cloud, Securemetric

**Lead Module Permissions:**

| Permission | Description |
|-----------|-------------|
| Sales Lead_View List | View lead list |
| Sales Lead-Create | Create new leads |
| Sales Lead-Claim | Claim leads from the lead queue |
| Sales Lead-Assign | Assign leads to others |
| Sales Lead-Return | Return leads to the queue |
| Sales Lead-Transfer | Transfer leads to another queue |
| Sales Lead-Convertion | Convert leads |
| Sales Lead-Change Owner | Change lead owner |
| Sales Lead-Follow up | Follow up on leads (⚠️ Owner only) |
| Sales Lead-Merge | Merge/aggregate leads (⚠️ Owner only) |
| Sales Lead_Invalid | Mark leads as invalid (⚠️ Owner or queue admin) |
| Sales Lead_Pushing Stage | Advance lead stage (⚠️ Owner only) |
| Sales Lead_Stage Pusher | Configure stage advancement rules |
| Sales Lead-Print | Print leads |

**Customer & Opportunity Permissions:**

| Permission | Description |
|-----------|-------------|
| Customer_Create | Create new customers |
| Customer_View | View customer list |
| Customer_Claim | Claim customers from public pool |
| Customer_Return | Return customers to public pool |
| Customer_Change Owner | Change customer owner |
| Customer_Print | Print customer information |
| Account Info_Create | Create account information |
| Contact_Create | Create contacts |
| Contact_View (implied by Contact_Create) | View contacts |
| Contact_Change Owner | Change contact owner |
| Contact_Print | Print contacts |
| Opportunity_Create | Create opportunities |
| Opportunity_View (implied by create) | View opportunities |
| Opportunity_Stage Advance | Advance/revert opportunity stage |
| Opportunity_Change Owner | Change opportunity owner |
| Quote_Create | Create quotations |
| P&L_Create | Create P&L profit & loss statements |
| Sales Record_Create | Create sales records (activity log) |
| Joint Follow-up_Create | Create joint follow-ups |

**Order & Finance Permissions:**

| Permission | Description |
|-----------|-------------|
| Create Contract | Create contracts |
| Create SO | Create sales orders |
| Create Repayment Schedule | Create repayment schedules |
| Create Repayment | Create collection records |
| Create Repayment Detail | Create collection details |
| Create Billing REQ | Create billing requests |
| PO_Create | Create purchase orders |
| Delivery Order_Create | Create delivery orders |

**Basic Data Permissions:**

| Permission | Description |
|-----------|-------------|
| Company - Check | View companies |
| Company Account - Check | View company accounts |
| Product - New | Create products |
| Tax Rate - Check | View tax rates |
| Related Team - Add Member | Add members to service teams |
| Related Team - Delete Member | Remove members from service teams |
| Stage Booster Example - New/Check | Create/view stage booster examples |

**Competitor Permissions:**

| Permission | Description |
|-----------|-------------|
| Competitor_Create | Create competitors |
| Competitive Product_Create | Create competitive products |
| Competitive Analysis_Create | Create competitive analyses |

---

### 5.2 Marketing

**Description:** Manages lead sources and marketing activities; does not participate in the customer sales flow.

| Permission | Description |
|-----------|-------------|
| Sales Lead_View List | View lead list |
| Sales Lead-Create | Create new leads |
| Sales Lead-Import | **Bulk import leads** (core permission) |
| Lead Queue_View | View lead queues |
| Customer_View | View customers (read-only) |
| Contact_View | View contacts (read-only) |
| Opportunity_View | View opportunities (read-only) |
| Task_Create / Task_View | Create and view tasks |

> **Note:** The Marketing role is currently not assigned to any organization. Add the marketing department under **Role users** on the Edit page.

---

### 5.3 Presales

**Description:** Focuses on opportunity advancement, competitive analysis, and P&L modeling.

| Permission | Description |
|-----------|-------------|
| Sales Lead_View List | View leads (read-only) |
| Customer_View | View customers (read-only) |
| Opportunity_View | View opportunities (read-only) |
| Opportunity Closure Req_View | View closure requests |
| Public Pool_View | View public pool |
| Sales Record_View | View sales records |
| P&L_Create | Create P&L profit & loss statements |
| Competitor_Create | Create competitors |
| Competitive Product_Create | Create competitive products |
| Competitive Analysis_Create | Create competitive analyses |
| Task_Create / Task_View | Create and view tasks |

---

### 5.4 Finance Team

**Description:** Views business data and maintains financial base configuration.

**Read-only permissions:**

| Permission | Description |
|-----------|-------------|
| Sales Lead_View List | View lead list |
| Lead Queue_View | View lead queues |
| Customer_View | View customers |
| Opportunity_View | View opportunities |
| Contact_View | View contacts |
| Quote_View | View quotations |
| Sales Record_View | View sales records |
| Public Pool_View | View public pool |
| Customer Name Change_View | View name change requests |
| Customer Churn_View | View churn requests |
| Joint Follow-up_View | View joint follow-ups |
| Opportunity Closure Req_View | View closure requests |

**Operational permissions:**

| Permission | Description |
|-----------|-------------|
| Company - New | Create companies |
| Company Account - New / Data Maintenance | Create and maintain company accounts |
| Tax Rate - New / Data Maintenance | Create and maintain tax rates |

> **Note:** Finance Team does not have operational permissions for billing, collection, or SO & PAYMENT modules. If needed, add `Create Billing REQ`, `Create Repayment`, etc. in the Edit page.

---

### 5.5 Operation Team

**Description:** Views order execution status; handles shipments.

| Permission | Description |
|-----------|-------------|
| Customer_View | View customers |
| SO Enquiry | View sales orders |
| Contract Enquiry | View contracts |
| Billing Request Enquiry | View billing requests |
| Billing Detail Enquiry | View billing details |
| Repayment Schedule Enquiry | View repayment schedules |
| Product Enquiry | View products |
| Company - Check | View companies |
| Company Account - Check | View company accounts |
| **Delivery Order_Create** | **Create delivery orders** (core operational permission) |

---

### 5.6 Project Management

**Description:** Manages contract execution, collections, and orders.

| Permission | Description |
|-----------|-------------|
| Customer_View | View customers |
| Opportunity_View | View opportunities |
| Quote_View | View quotations |
| Sales Record_View | View sales records |
| SO Enquiry / SO_Data Maintenance | View and maintain sales orders |
| Contract Enquiry / Contract_Data Maintenance | View and maintain contracts |
| Repayment Enquiry / Repayment Schedule Enquiry | View collections and repayment schedules |
| Repayment Sch_Data Maintenance | Maintain repayment schedules |
| Repayment Detail Enquiry | View collection details |
| Billing Request Enquiry / Billing Detail Enquiry | View billing |
| PO_Create / PO_Maintain All Data | Create and maintain purchase orders |
| Payment Plan_Default Access | Default access to payment plans |
| Task_Create / Task_View | Create and view tasks |

---

### 5.7 Customer Support

**Description:** Handles customer issues; views contract and order status.

| Permission | Description |
|-----------|-------------|
| Customer_View | View customers |
| Sales Record_View | View sales records |
| SO Enquiry | View sales orders |
| Contract Enquiry | View contracts |
| Repayment Enquiry | View collections |
| Repayment Schedule Enquiry | View repayment schedules |
| Billing Request Enquiry / Billing Detail Enquiry | View billing |
| Product Enquiry | View products |
| Task_Create / Task_View | Create and view tasks |

---

### 5.8 Sales Administrator

**Current Status: No permissions configured**

This role is empty and should be configured based on your organization's needs. We recommend starting from Account Manager permissions and adding the following administrative permissions:

| Suggested Permissions | Description |
|----------------------|-------------|
| Sales Lead-Export | Export lead data |
| Customer_Export | Export customer data |
| Sales Lead-Reclaim | Reclaim assigned leads |
| Customer_Reclaim | Reclaim assigned customers |
| Customer_Assign | Assign customers |
| Sales Lead_View List (all data scope) | View all leads |
| Customer Business Rule Mgmt | Configure customer business rules |
| Lead Rules | Configure lead business rules |
| Lead Queue_Maintain All Data | Maintain lead queue configuration |

---

## 6. Common Configuration Scenarios

### Scenario 1: New Employee Joining as a Sales Person

1. Go to Permission Mgt → Role Permission
2. Find the **Account Manager** role and click **Edit**
3. Under **Role users**, click ➕ to add the employee (or their organization)
4. Click **Save**

The employee immediately gains all Account Manager permissions.

---

### Scenario 2: Creating a Read-Only Role for Data Viewing

1. Click **Create** to create a new role
2. Set the role name to "Data Analyst" or "Read-Only Viewer"
3. In the permission tree, only check `*_View`, `*_Enquiry`, and `*_Check` type permissions
4. Save and assign to the relevant users

---

### Scenario 3: Finance Needs to Process Billing and Collections

The current Finance Team role does **not** have billing and collection operation permissions. Steps:

1. Find the **Finance Team** role and click **Edit**
2. Search for `Billing` in the permission tree and check:
   - `Create Billing REQ` (create billing requests)
   - `Billing REQ_Data Maintenance` (maintain billing requests)
3. Search for `Repayment` and check:
   - `Create Repayment` (create collection records)
   - `Repayment_Data Maintenance` (maintain collection records)
4. Click **Save**

---

### Scenario 4: Sales Staff Report "Can't Click a Button"

Troubleshoot in this order:

**Step 1: Confirm the role has the required permission**
Go to the employee's role (Edit page), search for the operation name, and confirm it is checked.

**Step 2: Confirm the employee can see the record**
If the employee cannot see the record in the list, they cannot access the detail page either.

**Step 3: Check for "owner-only" restrictions**
The following buttons are only visible to the record owner, even if the role permission is granted:

| Button | Restriction |
|--------|-------------|
| Lead — Follow up | Owner only |
| Lead — Push Stage | Owner only |
| Lead — Invalid | Owner or lead queue admin only |
| Lead — Merge/Aggregate | Owner only |
| Customer — Transfer | Owner or public pool admin only |
| Marketing Activity — Status Change | Owner only |

If business needs require non-owners to perform these operations, contact platform technical support to remove the owner restriction in the operation configuration.

---

## 7. Data Visibility Configuration (Advanced)

Role permissions control "which buttons can be clicked," while **data scope** controls "which records can be seen."

Configuration entry: Admin backend sys-modeling → corresponding module (e.g., LEAD MGT) → **Permissions** tab

### Common Data Scope Configuration Methods

| Goal | Configuration |
|------|--------------|
| Employee sees only their own records | Readers → Other readers → Form fields: set to `Owner` |
| Manager sees all subordinate records | Readers → Formula Definition: recursive formula for multi-level org hierarchy |
| Admin sees everything | Readers → Default reader → Set to "View All" via role permission |
| Queue members see unclaimed leads | Readers → Formula Definition → Formula checks status = pending and returns queue members |

### Lead Module Special Notes

Lead visibility is automatically determined by stacked rules — **administrators do not need extra configuration**:

| Who Sees It Automatically | Trigger Condition |
|--------------------------|-------------------|
| Lead queue administrators | The lead belongs to a queue they manage |
| All queue members | Lead is in "Pending" status (no owner) and queue has "member visibility" enabled |
| All superiors of the owner | Auto-traced up the hierarchy when an owner is assigned (up to 9 levels) |
| Owner of the associated customer | Requires enabling "Related Follow-up Visibility" in customer business rules |

---

## Appendix: Permission Quick Reference Index

### A. Lead Permissions

| Permission Name | Function |
|----------------|---------|
| Sales Lead_View List | View lead list |
| Sales Lead-Create | Create leads |
| Sales Lead-Import | Bulk import |
| Sales Lead-Export | Export data |
| Sales Lead-Print | Print |
| Sales Lead-Claim | Claim leads |
| Sales Lead-Assign | Assign leads |
| Sales Lead-Return | Return to queue |
| Sales Lead-Reclaim | Reclaim leads |
| Sales Lead-Transfer | Transfer to another queue |
| Sales Lead-Change Owner | Change owner |
| Sales Lead-Convertion | Convert leads |
| Sales Lead-Follow up | Follow up (owner-restricted) |
| Sales Lead-Merge | Merge (owner-restricted) |
| Sales Lead_Invalid | Mark invalid (owner/queue admin) |
| Sales Lead_Pushing Stage | Advance stage (owner-restricted) |
| Sales Lead-Maintain All Data | Edit/delete all leads |
| Lead Queue_View | View lead queues |
| Lead Queue_Create | Create lead queues |
| Lead Queue_Maintain All Data | Maintain lead queues |
| Lead Rules | Configure lead business rules |

### B. Customer Permissions

| Permission Name | Function |
|----------------|---------|
| Customer_View | View customer list |
| Customer_Create | Create customers |
| Customer_Import / Export / Print | Import/export/print |
| Customer_Claim | Claim from public pool |
| Customer_Assign | Assign customers |
| Customer_Return | Return to public pool |
| Customer_Reclaim | Reclaim customers |
| Customer_Transfer | Transfer (owner/pool admin) |
| Customer_Change Owner | Change owner |
| Customer_Merge | Merge customers |
| Customer_Maintain All Data | Edit/delete all customers |
| Customer Business Rule Mgmt | Configure business rules |
| Public Pool_View / Create / Maintain | View/create/maintain public pool |

### C. Opportunity / Contact / Quotation Permissions

| Permission Name | Function |
|----------------|---------|
| Opportunity_View / Create / Maintain All Data | View/create/maintain opportunities |
| Opportunity_Change Owner | Change opportunity owner |
| Opportunity_Stage Advance | Advance opportunity stage |
| Contact_View / Create / Maintain All Data | View/create/maintain contacts |
| Contact_Change Owner | Change contact owner |
| Quote_View / Create / Maintain All Data | View/create/maintain quotations |
| Sales Record_View / Create / Maintain All Data | View/create/maintain sales records |
| P&L_Create | Create P&L statements |

### D. Order & Collection Permissions

| Permission Name | Function |
|----------------|---------|
| Contract Enquiry / Create / Maintain | View/create/maintain contracts |
| SO Enquiry / Create SO / SO_Data Maintenance | View/create/maintain sales orders |
| Billing Request Enquiry / Create / Maintain | View/create/maintain billing requests |
| Repayment Enquiry / Create / Maintain | View/create/maintain collections |
| Repayment Schedule Enquiry / Create / Maintain | View/create/maintain repayment schedules |
| PO_Create / Maintain | Create/maintain purchase orders |
| Delivery Order_Create | Create delivery orders |
| Invoice Return Enquiry / Maintain | View/maintain invoice return requests |

### E. Basic Data Permissions

| Permission Name | Function |
|----------------|---------|
| Product - Check / New / Maintenance / On&Off Sale | View/create/maintain/toggle products |
| Company - Check / New / Maintenance | View/create/maintain companies |
| Company Account - Check / New / Maintenance | View/create/maintain company accounts |
| Tax Rate - Check / New / Maintenance | View/create/maintain tax rates |
| Related Team - Check / New / Maintenance | View/create/maintain service teams |
| Related Team - Add Member / Delete Member | Manage service team members |
| Business Stage - Check / New / Maintenance | View/create/maintain business stages |
| Stage Management - Check / New / Maintenance | View/create/maintain stage management |
