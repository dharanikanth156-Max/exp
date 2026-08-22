# FARMERS DIRECT PRODUCE MARKETPLACE PORTAL

## Problem Statement

Small farmers largely depend on intermediaries to sell their produce, which reduces their earnings, while local buyers have no easy way to purchase fresh produce directly from nearby farmers at a fair price.

## Proposal

FarmLink Direct is a web-based marketplace that connects farmers directly with local buyers. Farmers can register, add and manage their produce, set prices and quantities, and view customer orders. Buyers can browse, search, and filter fresh produce based on type and location, and place orders or send inquiries. The system reduces dependency on intermediaries, supports fair pricing, and provides customers with easier access to fresh, locally sourced produce.

## System Architecture

```text
                 FARMERS / CUSTOMERS / ADMIN
                            │
                            ▼
                ┌─────────────────────┐
                │      FRONTEND       │
                │     React.js        │
                │ HTML + CSS + JS     │
                │     Bootstrap       │
                └──────────┬──────────┘
                           │
                        REST API
                           │
                           ▼
                ┌─────────────────────┐
                │       BACKEND       │
                │      Node.js        │
                │     Express.js      │
                │   Business Logic    │
                └──────────┬──────────┘
                           │
                           ▼
                ┌─────────────────────┐
                │      DATABASE       │
                │        MySQL        │
                └─────────────────────┘
```

## Main Modules

### Farmer

* Register / Login
* Add Products
* Set Price and Quantity
* Update / Remove Products
* View Customer Orders
* Manage Sales

### Customer

* Register / Login
* Browse Products
* Search and Filter Products
* View Farmer Details
* Place Orders
* Send Inquiries
* Track Order Status

### Admin

* Manage Farmers and Customers
* Manage Products
* Monitor Orders
* Manage Users
* View System Activities

## Technology Stack

1. **React.js** – Frontend development
2. **HTML** – Webpage structure
3. **CSS** – Styling
4. **Bootstrap** – Responsive design
5. **JavaScript** – Frontend functionality
6. **Node.js** – Backend runtime
7. **Express.js** – Backend framework
8. **MySQL** – Database
9. **REST API** – Frontend–backend communication
10. **Git & GitHub** – Version control

## Team Members

**ANUSOUNDHARYA K** – 73152413012
**DHARANIKANTH M** – 73152413042
