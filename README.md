# 🚀 Expense Tracker with Analytics

A full-stack expense management application built with **Next.js**, **Node.js**, **Express**, and **PostgreSQL**, featuring authentication, analytics dashboards, category management, CSV export, and monthly breakdown insights.

## 🔧 Tech Stack

### **Frontend**
- Next.js  
- Tailwind CSS  
- Deployed on **Vercel**

### **Backend**
- Node.js (Express or NestJS)  
- PostgreSQL  
- JWT Authentication  
- Deployed on **Render**

### **Development Environment**
- Built using **Cursor**
- Public GitHub repository

## ✨ Features

### 🔐 Authentication
- User Registration & Login  
- JWT-based authentication  
- Per-user data isolation  

### 💸 Expense Management
- Add new expenses  
- Edit existing expenses  
- Delete expenses  
- Reverse chronological ordering  
- Category & monthly filters  

### 🗂 Categories
- Default categories: **Food, Travel, Bills, Shopping, Others**  
- Users can create custom categories  

### 📊 Dashboard & Analytics
- Monthly total expense  
- Compare this month vs last month  
- Recent 5 expenses  
- Pie chart → Category distribution  
- Bar chart → Last 6 months expenses  

### 📤 CSV Export
- Download all expenses of the logged-in user  
- Export fields: **title, amount, category, date**

### 📅 Monthly Breakdown
- Select month + year  
- View expenses for selected period  
- Monthly total summary  

## 🧱 API Endpoints (Overview)

### **Authentication**

- POST /api/auth/signup
- POST /api/auth/login

### **Categories**

 -  GET /api/categories
 -  POST /api/categories

### **Expenses**

- GET /api/expenses?month=&year=
- POST /api/expenses
- PUT /api/expenses/:id
- DELETE /api/expenses/:id

### **CSV Export**

- GET /api/expenses/export


## 🏗 Project Setup

### 1️⃣ Clone Repository

git clone https://github.com/AsheemRahman/Expense-Tracker-Analytics.git


### 2️⃣ Install Dependencies

Frontend:

      cd frontend
      npm install

Backend:

     cd backend
     npm install


### 3️⃣ Configure Environment Variables

Create `.env` in both **frontend** and **backend**.

Backend `.env` example:

    CLIENT_URL = frontend url
    POSTGRES_URI=postgresql://user:password@host:port/dbname
    JWT_TOKEN_SECRET_KEY = your_jwt_secret
    PORT = your port

Frontend `.env` example:
  
     NEXT_PUBLIC_API_URL=https://your-backend-url.com

### 4️⃣ Run Backend

    cd backend  &&  npm run dev


### 5️⃣ Run Frontend

    cd frontend  &&  npm run dev


## 🚀 Deployment

### Frontend
- Deploy to **Vercel**

### Backend
- Deploy to **Render**

### Database
- Host PostgreSQL on **Neon**
