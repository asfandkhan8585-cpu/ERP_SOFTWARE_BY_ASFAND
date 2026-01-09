# ERP_SOFTWARE_BY_ASFAND
This project is a **single-page retail ERP and POS web app** for shops that need billing, inventory, basic accounting, and reporting in one browser-based dashboard.

## Overview

- **Purpose**: Manage day-to-day retail operations (sales, purchases, stock, expenses, banking, HR) with a fast POS screen and lightweight ERP-style reports.
- **Status**: Prototype running fully in the browser using `localStorage` for data persistence; **cloud storage and a proper database backend will be integrated later**.
- **Tech stack**: Pure HTML, CSS, and JavaScript.

## Core features

- **Dashboard**  
  - Summary tiles for total sales, cash/credit/online sales, and profit (admin-only).
  - Quick actions for Sales, Profit, Expense, and Stock reports by date range, with print options.

- **POS (Sale)**  
  - Barcode / name / code search with fuzzy matching and fast cart management.
  - Supports cash, credit, and online/bank modes, customer selection, discounts, tax, service charges, and bill save / save+print.

- **Purchases & Inventory**  
  - Purchase entry linked to suppliers, automatically updating item stock and purchase totals.
  - Inventory view showing cost/price, location, low-stock indicators, and total stock value, with admin-only add/edit/delete.

- **Ledger & Parties**  
  - Customer and supplier lists with opening balances, balances, and actions.
  - Customer and supplier ledger reports filtered by date, plus printable statements.

- **Expenses & Banking**  
  - Expense tracker with category, description, date filters, and total expense footer.
  - Banking module with multiple bank accounts, balances, transactions (deposit/withdraw/adjust), and net totals.

- **HR & Attendance**  
  - Employee master data and attendance marking (present/absent/late/leave).
  - Attendance summary and date-range reports, with print options.

## Advance reporting

- **Advance Reports tab**  
  - User selects date range, metric (Sales / Profit / Expenses), and grouping (Day / Month).
  - Renders a canvas-based time series chart so users can visualize trends over days and months.
  - Restricted to Admin role via the existing role-based access system.

## Roles and licensing

- **Role-based access control**  
  - Two roles: Employee and Admin, switched via an admin password.
  - Sensitive areas (profit, HR, Settings, some reports) are hidden or blocked for employees.

- **License system (prototype)**  
  - License status pill in the header and a startup activation/trial modal.
  - Dedicated License section in Settings with a key input in the format `RS-TISK-4CGE-YB2C-G3` and a verify button; once verified, the UI updates to show licensed status.
[9](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/137666868/9eb7f6ec-a11f-410e-b209-83acb167b3f5/swan-by-claude.docx)
[10](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/137666868/9fd62815-e741-4b18-acfd-4ddbef3bfb1c/paste.txt)
[11](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/137666868/e5c97f6f-b99e-467d-b12a-c0d76079b01a/paste.txt)
