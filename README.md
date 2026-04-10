# POS-System
## Overview
TechPOS is a full-stack Point-of-Sale (POS) web application built using the MERN stack (MongoDB, Express, React, Node.js) with real-time capabilities powered by Socket.io. The system allows retail staff to manage store inventory, process customer purchases, view earnings, and process refunds.

The application incorporates Role-Based Access Control (RBAC) to simulate a real retail workflow, distributing permissions across ```worker```, ```manager```, and ```owner``` roles.


## Key Features
- Authentication & Authorization: Secure login/registration using JWT and ```bcrypt```. Routes and actions are restricted based on user roles.
- Real-Time Synchronization: Inventory changes, completed checkouts, and processed refunds are instantly broadcasted to all connected clients via WebSockets.
- Inventory Management: Add, edit, and remove products (restricted to managers/owners).
- Sales & Checkout: Process orders, calculate taxes/totals, and automatically deduct stock from the database.
- Invoice & Refund Management: 
    -  View all historical sales data.
    - Process full or partial refunds for eligible invoices (within a 14-day window).
    - Automatically restock inventory upon refund.

## Tech Stack
- <b>Frontend</b>: React (Vite), React Router DOM, Socket.io-client, CSS
- <b>Backend</b>: Node.js, Express, Socket.io
- <b>Database</b>: MongoDB, Mongoose
- <b>Security</b>: JSON Web Tokens (JWT), Bcrypt

## Installation & Setup
### Prerequisites
- Node.js installed
- MongoDB installed and running

1. Database Setup in Mac
    ```
    # Install MongoDB
    brew install mongodb-community

    # Start MongoDB service
    brew services start mongodb-community

    # To stop MongoDB later
    brew services stop mongodb-community
    ```
2. Backend Setup
- Open a terminal and navigate to the backend folder:
    ```
    cd backend
    npm install
    npm run start
    ```
<i>The backend will run on http://localhost:8080 and will automatically seed default users, products, and invoices if the database is empty.</i>

3. Frontend Setup
- Open a new terminal and navigate to the frontend folder:
    ```
    cd frontend
    npm install
    npm run dev
    ```
<i>The frontend will be accessible at http://localhost:5173.</i>

### Default Accounts (for testing)
- Worker: ```worker1``` / ```123456``` <i>(Can process checkouts)</i>
- Manager: ```manager1``` / ```123456``` <i>(Can manage inventory and process refunds)</i>
- Owner: ```owner1``` / ```123456``` <i>(Full system access)</i>


### How to Use
1. <b>Login</b>: Use the provided test credentials (e.g., worker1 / 123456).
2. <b>Inventory</b>: Managers and Owners can add/edit products.
3. <b>Checkout</b>: Add items to the cart and process the sale. This triggers a real-time stock deduction.
4. <b>Invoices & Refunds</b>: Access historical data via the Invoices tab. Refunds automatically restock items if processed within 14 days.
5. <b>Earnings</b>: Owner can access the Earnings tab to keep track of their units sold and sales revenue.

## Route
document routes:
- /            (Home)
- /inventory   (Inventory)
- /invoices    (Invoices)
- /earnings    (Earnings)
- /login       (Login)

## Error handling
- invalid route returns 404 error
- authentication error returns 401 error
- bad request returns 400 error
- success returns 200 status code

## Project Structure
```
- /backend
    - /data
        - invoices.json
        - products.json
    - /models
        - Invoice.js
        - Products.js
        - User.js
    - package.json
    - server.js
- /frontend
    - /src
        - /assets
            - login.jpg
            - react.svg
        - /components
            - Header.jsx
            - InventoryCard.jsx
            - ProductCard.jsx
            - Sidebar.jsx
        - /css
            - App.css
            - home.css
            - index.css
            - inventory.css
            - invoices.css
            - login.css
        - /pages
            - Earnings.jsx
            - Home.jsx
            - Inventory.jsx
            - Invoices.jsx
            - Login.jsx
    - App.jsx
    - main.jsx
    - socket.js
- README.md
```

## Document API

All protected routes require a valid JWT token in the Authorization header.
### Authentication
- POST:  /api/login              (User login)
- POST:  /api/register           (Create new user - owner only)
- GET:   /api/me                 (Get current user info)

### Users (Owner Only)
- GET:    /api/users             (Get all users)
- PUT:    /api/users/:id         (Update user password)
- DELETE: /api/users/:id         (Delete user)

### Products / Inventory
- GET:    /api/items             (Get all products)
- GET:    /api/items/:id         (Get single product)
- POST:   /api/items             (Create product - manager/owner)
- PUT:    /api/items/:id         (Update product - manager/owner)
- DELETE: /api/items/:id         (Delete product - manager/owner)

### Invoices / Checkout
- POST:  /api/invoices           (Create invoice / checkout)
- GET:   /api/invoices           (Get all invoices - manager/owner)
- POST:  /api/invoices/:id/refund (Process refund - manager/owner)


## Challenges & Successes

### Challenges
- Maintaining consistent UI styling across components.
- Handling authentication and routing without refresh issues.
- Keeping layouts consistent across different pages.
- Coordinating frontend and backend data structures.
- Implementing real-time updates with Socket.io.

### Successes
- Built a full-stack POS system using the MERN stack.
- Implemented role-based access control (worker, manager, owner).
- Achieved real-time synchronization across users.
- Developed a responsive and user-friendly interface.
- Integrated inventory, checkout, invoices, and refunds into one system.

Gained understanding of the following:
- Express routing 
- REST principles
- HTTP methods and status codes
- Static file serving
- Full-stack web development workflow

We have added a video demonstration purpose.
