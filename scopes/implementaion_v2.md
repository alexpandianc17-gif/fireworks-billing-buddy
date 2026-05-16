# Implementation Plan: Professional Billing & Ledger System

This plan outlines the evolution of Kavya Billings from a simple generator to a professional GST-compliant invoicing and payment tracking system.

---

## 🏗️ Phase 3: Professional GST Invoicing
**Goal:** Align the invoice output with industrial standards (GST/Sivakasi Trade patterns).

### 3.1 Data Model Expansion
*   **Company Settings**: Add `LIC_No`, `Bank_Name`, `Account_No`, `IFSC`, `Branch`, and `Full_Address`.
*   **Invoice Header**: Add `LR_No`, `LR_Date`, `Order_No`, `Order_Date`, `Despatched_Through`, `Destination`, and `Payment_Terms`.
*   **Status Tracking**: Add `Payment_Status` (Paid, Unpaid, Partial) and `Balance_Due` to the Invoices sheet.

### 3.2 Professional "Pro-Print" Template
*   **Grid Layout**: Replace the modern cards with a formal black-and-white grid structure.
*   **Sl. No & Cases**: Dedicated columns for sequential numbering and carton counts.
*   **Amount in Words**: Implement a utility to convert the Grand Total to Indian Rupees text.
*   **Tax Summary Table**: A HSN-wise breakup table at the bottom of the invoice.
*   **Legal Footer**: Bank details box, Declaration, and Authorized Signatory area.

---

## 📈 Phase 4: Invoice History & Ledger
**Goal:** Manage past transactions and track payments.

### 4.1 Invoices History Page (`/invoices`)
*   **Search & Filter**: Find invoices by Customer Name, Date, or Status (Paid/Unpaid).
*   **Actions**: 
    *   `View/Print`: Re-generate the PDF for an old invoice.
    *   `Receive Payment`: Open a dialog for Unpaid/Partial invoices.
    *   `Edit`: Only allowed if the status is NOT "Paid".

### 4.2 Payment Management (The Ledger)
*   **Receive Payment Dialog**: 
    *   Input: `Amount_Received`.
    *   Input: `Payment_Method` (Cash, UPI, NEFT, Cheque).
    *   Logic: Automatically updates `Balance_Due` and changes status to "Paid" if balance reaches zero.
*   **Google Sheets Sync**: Create a new tab `Payments` to track every payment entry against an Invoice ID.

---

## 🔄 Revised Billing Workflow
1.  **Draft**: User fills the bill.
2.  **Preview**: User clicks "Preview Bill" to see the "Pro-Print" layout.
3.  **Save & Status**: User clicks "Save Invoice". They choose the initial status:
    *   **Unpaid**: Full amount is marked as due.
    *   **Paid**: Full amount is received immediately.
    *   **Partial**: User enters how much was received upfront.
4.  **Final Action**: After saving, the "Generate PDF" option becomes available.

---

## 🛠️ Technical Requirements
*   **Libraries**: `number-to-words` (or custom script) for currency text.
*   **Sheet Updates**: New headers in `Invoices` sheet and a new `Payments` tab.
*   **Protection**: UI logic to disable inputs if `status === 'Paid'`.

---

> [!IMPORTANT]
> **Next Steps:**
> 1. User approves this scope.
> 2. We update the Google Sheets headers to support the new data.
> 3. We implement the new Settings and Billing Header fields.
