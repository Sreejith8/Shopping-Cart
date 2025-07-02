
# 🛒 Shopping Cart Web Application

A simple full-stack **eCommerce shopping cart application** built with **Node.js**, **Express.js**, **MongoDB**, and **Handlebars (HBS)**.

This project allows users to browse products, add them to a shopping cart, place orders, and provides an **admin panel** for managing products, orders, and users.

---

## 🚀 Features

### ✅ User Side:

- Browse all products
- Add products to cart
- Place orders
- View order history
- User signup & login

### ✅ Admin Side:

- Admin login
- Add, edit, and delete products
- View all orders
- Manage order status (e.g., Ordered, Shipped, Delivered)
- View all registered users
- Remove users from the system

---

## 🛠️ Technologies Used

- Node.js
- Express.js
- MongoDB
- Handlebars (HBS) – for server-side templating
- Bootstrap – for frontend styling
- jQuery – for AJAX operations
- Razorpay API – for payment integration

---

## 💳 Payment Integration

This project integrates with **Razorpay** for online payment processing.

> ⚠️ **Note:** API keys (`key_id` and `key_secret`) are loaded via environment variables for security.  
> Actual keys are **not included** in this repository.

---

## 📂 Folder Structure Overview

```
project-root/
├── public/                  # Static files (CSS, JS, images)
│   └── product-images/       # Uploaded product images (Git-ignored)
├── routes/                  # Express route handlers
├── helpers/                 # Business logic and database queries
├── views/                   # Handlebars views (HBS templates)
├── .env                     # Environment variables (ignored in Git)
├── app.js                   # Entry point
├── package.json
└── README.md
```

---

## ⚙️ Setup Instructions (Local Development)

1. **Clone the repository:**

```bash
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name
```

2. **Install dependencies:**

```bash
npm install
```

3. **Create a `.env` file:**  
_(This file will store your Razorpay keys and other sensitive environment configs)_

Example `.env` content:

```
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

4. **Configure MongoDB:**

Make sure MongoDB is running locally (or update your MongoDB URI in your database config file to use Atlas or any remote database).

5. **Run the server:**

```bash
npm start
```

By default, the app will start on:

```
http://localhost:3000/
```

---

## 📌 Important Notes

- **Product Images:**  
All uploaded product images are saved in `/public/product-images/`, but this folder is **excluded from version control (GitHub)** to prevent repository bloating and accidental data leaks.

- **API Keys and Secrets:**  
Sensitive data like API keys and secrets are managed via `.env` files and **not committed to GitHub**.

- **MongoDB Setup:**  
Ensure you have a MongoDB server running or configure the connection to a MongoDB Atlas cloud database.

---

## ✅ Future Improvements (Ideas)

- Store images in cloud storage (like AWS S3 or Cloudinary)
- Add user profile management
- Add product search and filtering
- Improve frontend UI with modern frontend frameworks (React/Vue)
- Implement user email notifications for order status


---

## 📃 License

This project is for **learning, portfolio, and demonstration purposes only**.
