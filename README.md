# vehicle_booking
# 🚗 Car Booking System

A robust, role-based car rental platform built with **Node.js**, **Express**, **PostgreSQL**, and **EJS**. This application provides a seamless experience for both administrators to manage their fleet and customers to book vehicles.

---

## 🌟 Features

### 👤 Customer Features
- **Secure Authentication**: Register and login with encrypted passwords.
- **Advanced Filtering**: Search for cars by brand, model, fuel type, seating capacity, location, and price range.
- **Booking Management**: 
  - Submit booking requests with custom dates and messages.
  - Track real-time status of booking requests (Pending, Approved, Rejected).
  - View personal booking history.

### 🛡️ Admin Features
- **Fleet Management**: 
  - Full CRUD operations for vehicles.
  - Image upload support for car listings.
  - Track vehicle availability and status.
- **Booking Oversight**: 
  - Centralized dashboard to view all customer bookings.
  - Approve or reject requests with a single click.
- **Role-Based Security**: Protected routes ensuring only authorized personnel can access management tools.

---

## 🛠️ Tech Stack

- **Backend**: Node.js (ES Modules)
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Templating**: EJS (Embedded JavaScript)
- **Styling**: CSS3
- **Authentication**: Bcrypt.js & Express-Session
- **File Handling**: Multer (for car images)
- **Environment**: Dotenv

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v16.x or higher recommended)
- [PostgreSQL](https://www.postgresql.org/) database

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Booking
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env` file in the root directory and add your PostgreSQL credentials:
   ```env
   PORT=3000
   PG_USER=your_postgres_user
   PG_HOST=localhost
   PG_DATABASE=car_booking
   PG_PASSWORD=your_password
   PG_PORT=5432
   SESSION_SECRET=your_secret_key
   ```

4. **Initialize the Database**
   Run the following command to set up the tables and seed initial data:
   ```bash
   npm run init-db
   ```

5. **Start the Application**
   ```bash
   # Development mode with auto-reload
   npm run dev

   # Production mode
   npm start
   ```

Visit `http://localhost:3000` in your browser.

---

## 🔐 Demo Accounts

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@example.com` | `password` |

---

## 📂 Project Structure

```text
├── config/             # Database connection & helpers
├── public/             # Static assets (CSS, Uploads)
├── routes/             # Express routes (Auth, Admin, Customer)
├── scripts/            # Database utility scripts
├── views/              # EJS templates
│   ├── admin/          # Admin dashboard views
│   ├── customer/       # Customer browsing & booking views
│   └── partials/       # Reusable UI components
├── app.js              # Application entry point
└── postgres_schema.sql # Database schema definition
```

---

## 🤝 Contributing

1. Fork the project.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
