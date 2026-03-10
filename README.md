HEAD

# 🛒 E-Commerce Backend API

A RESTful backend API for a full-featured E-Commerce system built with:

- Node.js
- Express.js
- Sequelize ORM
- MySQL
- JWT Authentication
- Paystack Payment Gateway

This backend supports multi-role authentication, inventory reservation, wallet payments, manual bank transfer approvals, and order lifecycle management.

---

# 🚀 Features

## 🔐 Authentication & Authorization

- JWT-based authentication (stored in HTTP-only cookies)
- Role-Based Access Control (RBAC)
- Roles:
  - User
  - Staff
  - Admin

---

## 👤 User Authentication

### ➤ Register User

**POST** `/user/register`

```json
{
  "fullName": "John Doe",
  "userName": "user",
  "email": "user@email.com",
  "password": "123456",
  "confirmPassword": "123456"
}

### User Login
```

**POST** /user/login

````json

{
  "email": "user@email.com",
  "password": "123456"
}
- Return
userDetail

send JWT as cookies

### Staff Registration

**POST** `/user/register`

```json
{
  "name": "John Doe",
  "email": "user@email.com",
  "password": "123456",
  "confirmPassword": "123456"
}

### Staff Login
````

**POST** /user/login

```json
{
  "email": "user@email.com",
  "password": "123456"
}
```

- Return
  userDetail

send JWT as cookies only on login and not in regration because registration in done by admin

# shop-backend

5dee417a468b7eecd299090b5bab4b2c631857e7
