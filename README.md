# 🔧 FixoServ

### Professional Home Service Booking Platform

FixoServ is a web-based home service booking platform that connects customers with professional service providers. Users can explore available services, create an account, book services, and manage their bookings easily.

The platform also includes an **Admin Panel** for managing customers, bookings, services, and booking status.

---

## 🚀 Features

### 👤 Customer Features

- User Registration
- User Login
- Firebase Authentication
- Password visibility toggle
- Forgot Password support
- Customer profile
- Browse available services
- Book a service
- Select service date and time
- View booking details
- View booking history
- Track booking status
- Cancel bookings
- Contact FixoServ
- Call support
- WhatsApp support
- Email support

---

### 🛠️ Admin Features

- Admin Login
- Admin Dashboard
- View total bookings
- View pending bookings
- View completed bookings
- View cancelled bookings
- Manage customer bookings
- Accept bookings
- Reject bookings
- Add cancellation/rejection reason
- Send booking updates through WhatsApp
- View customer information
- Manage application settings
- Export booking/customer data
- Admin logout

---

## 🔐 Authentication

FixoServ uses **Firebase Authentication** for secure user authentication.

Authentication includes:

- Email & Password Registration
- Email & Password Login
- Password Reset
- Secure Firebase user accounts

User information is stored in **Cloud Firestore**.

---

## 🗄️ Database

FixoServ uses **Firebase Firestore** to store application data.

Main collections include:

```text
users
bookings
notifications
