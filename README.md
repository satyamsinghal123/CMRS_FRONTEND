# CMRS React Frontend

## Run

1. Install packages with `npm install`.
2. Create `.env` using `.env.example`.
3. Start Django with `python manage.py runserver` from the backend folder.
4. Start React with `npm run dev`.
5. Open `http://localhost:5173`.

Demo accounts:
- admin / Admin@12345
- manager / Manager@12345
- vikas / Agent@12345

The menu and route access are based on the role saved after login. The backend must still enforce API permissions; frontend menu hiding is not a replacement for backend authorization.


## Collection assignment workflow
- Managers assign each customer to a collection agent from Customer Management.
- Agents see unpaid installments for their assigned customers in Collections.
- Record Payment from a task automatically uses its customer, loan, schedule, and remaining installment amount.
- Agents can record an unsuccessful collection attempt with a reason.
- Run `python manage.py migrate` after updating the backend.
