# POS-System
CPS630 Assignment


This project is a Point-of-Sale(POS) web application built using Node.js and Express. The system allows users to manage store inventory, process customer purchases, and view earnings.

The goal of the system is to simulate a small retail workflow where staff can :
-view home page (Landing page, navigation to all modules)
- View available products, add products, remove products
- complete sales and chechout(for expanding the project later)
- track store earnings (display revenue summary, show completed sales static)

The application demonstrates as the marking rubric requires:
1.Node/Express Setup
2.Static Assets & Layout
3.HTML Routing & Multi-page Structure
4.REST API
5.Code Organization & Quality 
6.Documentation and Reflection
7.Overall Polish & Professionalism





- Use ```npm i``` everytime you pull the file from github
- To start the server: ```node server.js``` or ```npx nodemon server.js``` to update the files
- Have a file called ```.gitignore``` with this content in the file: ```node_modules```
- To install lucide icons library: ```npm install lucide```
- to open in browser used: http://localhost:8000

document routes:
/            Home
/inventory   Inventory
/earnings    Earnings
/checkout    Checkout(pending)

invalid route returns 404 error
bad request returns 400 error
success returns 200 error

Project Structure
server.js
package.json
/public
   /css
   /js
/views
   index.html
   inventory.html
   earnings.html

Documnet API :
GET       /api/cart       Get all cart items
POST      /api/cart       Add item to cart
DELETE    /api/cart/:id   Remove item by id


Challenges
1.Understanding how frontend and backend communicate
2.Implementing RESTful routes correctly
3.Managing state without a database
4.Coordinating features across team members

Gained understanding of the following:
-Express routing 
-REST principles
-HTTP methods and status codes
-Static file serving
-Full-stack web development workflow

We have added a video demonstration purpose.
