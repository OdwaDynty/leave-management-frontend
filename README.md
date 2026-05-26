# LeaveSync Dashboard

> Enterprise Leave Management SaaS — React Frontend

A professional, fully mobile-responsive React dashboard for the LeaveSync platform. Built for South African companies to manage employee leave, approvals, policies, and HR administration through a clean role-based interface.

---

## 🚀 Live Demo

**App URL:** https://leave-management-frontend-beige.vercel.app

Test Credentials:
Company:  DigitSkillSolution Pty Ltd
Email:    odwa@dss.co.za
Password: Password123
Role:     super_admin

---

## ✨ Features

- 🔐 **Role-Based UI** — 4 roles with different pages and permissions
- 📱 **Fully Mobile Responsive** — phones, tablets, desktops
- 🌗 **Mobile Sidebar Drawer** — hamburger menu on small screens
- 📊 **Interactive Charts** — bar, pie, and line charts via Recharts
- 🗓️ **Leave Calendar** — monthly grid with colour-coded leave entries
- 🔔 **Notification Centre** — real-time read/unread management
- 📋 **Audit Trail** — filterable log of all sensitive actions
- 🏆 **Role Requests** — self-service promotion workflow
- 📐 **Leave Policies** — configure role-based entitlements per year
- 🔑 **Password Reset** — email link with password strength indicator
- 🏢 **Company Settings** — profile management with plan information
- 💳 **Billing Page** — PayFast subscription plan management
- 🛡️ **Route Guards** — role-based URL access protection

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + Vite |
| Routing | React Router DOM v6 |
| HTTP Client | Axios with JWT interceptors |
| Charts | Recharts |
| Icons | Lucide React |
| Dates | date-fns |
| Notifications | react-hot-toast |
| Styling | Plain CSS with CSS variables |
| Deployment | Vercel |

---

## 📱 Pages and Access

| Page | Route | Access |
|---|---|---|
| Login | /login | Public |
| Register | /register | Public |
| Forgot Password | /forgot-password | Public |
| Reset Password | /reset-password | Public |
| Dashboard | /dashboard | All roles |
| My Leave | /dashboard/my-leave | All roles |
| My Balances | /dashboard/my-balances | All roles |
| Calendar | /dashboard/calendar | All roles |
| Notifications | /dashboard/notifications | All roles |
| Role Request | /dashboard/role-requests | All roles |
| Company Settings | /dashboard/settings | All roles |
| Billing | /dashboard/billing | All roles |
| Approvals | /dashboard/approvals | Manager+ |
| Employees | /dashboard/employees | Manager+ |
| Reports | /dashboard/reports | Manager+ |
| Leave Types | /dashboard/leave-types | HR Admin+ |
| Leave Policies | /dashboard/leave-policies | HR Admin+ |
| Public Holidays | /dashboard/holidays | HR Admin+ |
| Audit Trail | /dashboard/audit | HR Admin+ |
| Role Requests Admin | /dashboard/role-requests-admin | HR Admin+ |

---

## 📁 Project Structure

leave-management-frontend/
├── src/
│   ├── api/
│   │   ├── axios.js          # Base client + JWT interceptors
│   │   ├── auth.js
│   │   ├── employees.js
│   │   ├── leaveTypes.js
│   │   ├── leaveBalances.js
│   │   ├── leaveRequests.js
│   │   ├── notifications.js
│   │   ├── reports.js
│   │   ├── holidays.js
│   │   ├── audit.js
│   │   ├── leavePolicies.js
│   │   ├── roleRequests.js
│   │   ├── company.js
│   │   └── billing.js
│   ├── components/
│   │   ├── layout/
│   │   │   ├── DashboardLayout.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   └── Header.jsx
│   │   └── ui/
│   │       └── Avatar.jsx
│   ├── context/
│   │   └── AuthContext.jsx
│   ├── hooks/
│   │   └── useWindowSize.js
│   ├── pages/
│   │   ├── auth/
│   │   ├── audit/
│   │   ├── billing/
│   │   ├── dashboard/
│   │   ├── employees/
│   │   ├── holidays/
│   │   ├── leave/
│   │   ├── notifications/
│   │   ├── policies/
│   │   ├── reports/
│   │   ├── roleRequests/
│   │   └── settings/
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── .env.example
├── .env.production
├── .gitignore
├── vercel.json
├── package.json
└── README.md

---

## ⚙️ Getting Started

### Prerequisites

- Node.js 20.x or higher
- LeaveSync API running (see leave-management-api repo)

### Installation

```bash
# Clone the repository
git clone https://github.com/OdwaDynty/leave-management-frontend.git

# Navigate into the project
cd leave-management-frontend

# Install dependencies
npm install
```

### Environment Variables

Create a `.env` file:

```bash
# Local development
VITE_API_URL=http://localhost:3000/api
```

### Run Locally

```bash
npm run dev
```

Visit `http://localhost:5173`

### Build for Production

```bash
npm run build
```

---

## 🎨 Design System

CSS variables in `src/index.css`:

```css
--primary:       #4F46E5   /* Indigo */
--success:       #10B981   /* Green  */
--warning:       #F59E0B   /* Amber  */
--danger:        #EF4444   /* Red    */
--sidebar-width: 260px
```

---

## 📱 Responsive Breakpoints

| Screen | Behaviour |
|---|---|
| Desktop 1280px+ | Full sidebar, multi-column layouts |
| Tablet 768–1024px | Narrower sidebar, adjusted grids |
| Mobile 375–768px | Drawer sidebar, stacked layouts |

---

## 🚀 Deployment

Deployed on **Vercel** with automatic deploys from the `main` branch on GitHub.

Environment variable required on Vercel:

VITE_API_URL = https://leavesync-api.onrender.com/api

---

## 🔒 Security

- JWT stored in localStorage
- Axios interceptor attaches token to every request
- 401 responses automatically log out the user
- Role-based route guards on every protected page
- Access denied page for unauthorised URL access

---

## 👤 Author

**Odwa Dyantyi**
Master's in Information Systems — University of the Western Cape
IT Educator | Full-Stack Developer | SaaS Builder

---

## 📄 License

MIT License