# POS-System
## Overview
This project is a Point-of-Sale(POS) web application built using Node.js and Express. The system allows users to manage store inventory, process customer purchases, and view earnings.

The goal of the system is to simulate a small retail workflow where staff can :
- view home page (Landing page, navigation to all modules)
- View available products, add products, remove products
- complete sales and chechout(for expanding the project later)
- track store earnings (display revenue summary, show completed sales static)

The application demonstrates as the marking rubric requires:
1. Node/Express Setup
2. Static Assets & Layout
3. HTML Routing & Multi-page Structure
4. REST API
5. Code Organization & Quality 
6. Documentation and Reflection
7. Overall Polish & Professionalism

## Documentation

- Use ```npm i``` in both frontend and backend folders to install necessary packages to run the project
- To start the backend: ```cd backend``` & ```npm run start``` 
    - To run in brower: http://localhost:5173
- To start the frontend: ```cd frontend``` & ```npm run dev```
    - To run in browser: http://localhost:8080

- To install MongoDB in Mac: ```brew install mongodb-community``` 
- To run MongoDB in Mac: ```brew services start mongodb/brew/mongodb-community```
- To stop MongoBD in Mac: ```brew services stop mongodb/brew/mongodb-community```

- To install mongoose in backend: ```npm install mongoose```

## Route
document routes:
- /            (Home)
- /inventory   (Inventory)
- /earnings    (Earnings)
- /checkout    (Checkout(pending))

## Error handling
- invalid route returns 404 error
- bad request returns 400 error
- success returns 200 status code

## Project Structure
- server.js
- package.json
- /public
    - /css
    - /js
- /views
    - index.html
    - inventory.html
    - earnings.html

Documnet API :
- GET:       /api/cart       (Get all cart items) 
- POST:      /api/cart       (Add item to cart)
- DELETE:    /api/cart/:id   (Remove item by id)


## Challenges & Success
1. Understanding how frontend and backend communicate
2. Implementing RESTful routes correctly
3. Managing state without a database
4. Coordinating features across team members

Gained understanding of the following:
- Express routing 
- REST principles
- HTTP methods and status codes
- Static file serving
- Full-stack web development workflow

We have added a video demonstration purpose.
