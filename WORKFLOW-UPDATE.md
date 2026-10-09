CMRS Collection Workflow Update

- Manager/admin/operations: use Customer Management to assign a customer to a collection agent using the Assigned agent dropdown.
- Collection agent: open Collections to see due and overdue unpaid installments for assigned customers.
- Select Record payment on a task. Customer ID, loan ID, and installment are supplied automatically; enter the actual amount received and save.
- Use Not collected to record an unsuccessful collection attempt and choose a reason.
- The backend remains authoritative for all role permissions, assignment checks, payment calculations, and balance updates.

Run with npm install and npm run dev. Configure VITE_API_URL in .env only if the Django API is not at http://127.0.0.1:8000/api.
