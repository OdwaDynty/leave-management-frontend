# LeaveSync Dashboard

> Enterprise Leave Management SaaS — React Frontend

A professional, mobile-responsive React dashboard for the LeaveSync platform. Enables employees, managers, and HR admins to manage leave requests, approvals, policies, and company settings through a clean role-based interface.

---

## 🚀 Live Demo

- **App URL:** Coming soon
- **Backend API:** https://github.com/YOUR_USERNAME/leave-management-api

---

## ✨ Features

- 🔐 **Role-Based UI** — different pages and features per role
- 📱 **Fully Mobile Responsive** — works on phones, tablets, desktops
- 🌗 **Smart Navigation** — sidebar drawer on mobile, fixed on desktop
- 📊 **Interactive Charts** — bar, pie, and trend charts via Recharts
- 🗓️ **Leave Calendar** — monthly grid + list view with colour coding
- 🔔 **Notification Centre** — real-time read/unread management
- 📋 **Audit Trail** — filterable log of all sensitive actions
- 🏆 **Role Requests** — self-service promotion submissions
- 📐 **Leave Policies** — configure role-based entitlements
- 🔑 **Password Reset** — email link with strength indicator
- 🏢 **Company Settings** — profile management with plan info
- 🛡️ **Route Guards** — direct URL access blocked per role

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + Vite |
| Routing | React Router DOM v6 |
| HTTP Client | Axios with interceptors |
| Charts | Recharts |
| Icons | Lucide React |
| Dates | date-fns |
| Notifications | react-hot-toast |
| Styling | Plain CSS with CSS variables |

---

## 📁 Project Structure

leave-management-frontend/
├── src/
│   ├── api/                    # Axios API call functions
│   │   ├── axios.js            # Base client with interceptors
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
│   │   └── company.js
│   ├── components/
│   │   ├── layout/
│   │   │   ├── DashboardLayout.jsx  # Shell with sidebar + header
│   │   │   ├── Sidebar.jsx          # Navigation + mobile drawer
│   │   │   └── Header.jsx           # Top bar + hamburger menu
│   │   └── ui/
│   │       └── Avatar.jsx           # User initials avatar
│   ├── context/
│   │   └── AuthContext.jsx          # Global auth state
│   ├── hooks/
│   │   └── useWindowSize.js         # Responsive breakpoint hook
│   ├── pages/
│   │   ├── auth/                    # Login, Register, Forgot/Reset Password
│   │   ├── dashboard/               # Home with stats and charts
│   │   ├── employees/               # Employee management
│   │   ├── leave/                   # Leave requests, balances, types, calendar
│   │   ├── notifications/           # Notification centre
│   │   ├── reports/                 # Analytics and reports
│   │   ├── holidays/                # Public holiday management
│   │   ├── audit/                   # Audit trail
│   │   ├── policies/                # Leave policies
│   │   ├── roleRequests/            # Role change requests
│   │   └── settings/                # Company settings
│   ├── App.jsx                      # Router with role guards
│   ├── main.jsx                     # App entry point
│   └── index.css                    # Global styles + CSS variables
├── .env.example
├── .gitignore
├── package.json
└── README.md

## 📱 Pages

| Page | Route | Roles |
|---|---|---|
| Login | /login | Public |
| Register | /register | Public |
| Forgot Password | /forgot-password | Public |
| Reset Password | /reset-password | Public |
| Dashboard Home | /dashboard | All |
| My Leave Requests | /dashboard/my-leave | All |
| My Leave Balances | /dashboard/my-balances | All |
| Leave Calendar | /dashboard/calendar | All |
| Notifications | /dashboard/notifications | All |
| Role Change Request | /dashboard/role-requests | All |
| Company Settings | /dashboard/settings | All |
| Pending Approvals | /dashboard/approvals | Manager+ |
| Employees | /dashboard/employees | Manager+ |
| Reports | /dashboard/reports | Manager+ |
| Leave Types | /dashboard/leave-types | HR Admin+ |
| Leave Policies | /dashboard/leave-policies | HR Admin+ |
| Public Holidays | /dashboard/holidays | HR Admin+ |
| Audit Trail | /dashboard/audit | HR Admin+ |
| Role Requests Admin | /dashboard/role-requests-admin | HR Admin+ |

---

## ⚙️ Getting Started

### Prerequisites

- Node.js v18 or higher
- LeaveSync API running on `http://localhost:3000`

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/leave-management-frontend.git

# Navigate into the project
cd leave-management-frontend

# Install all dependencies
npm install
```

### Environment Variables

Create a `.env` file in the root:

```bash
# URL of the LeaveSync API
VITE_API_URL=http://localhost:3000/api
```

**Note:** The current implementation uses a hardcoded base URL in `src/api/axios.js`. Update that file when deploying to production.

### Run the App

```bash
# Development server
npm run dev
```

Visit `http://localhost:5173` to open the app.

### Build for Production

```bash
npm run build
```

The built files are in the `dist/` folder ready for deployment to Vercel, Netlify or any static host.

---

## 🎨 Design System

The app uses a CSS variable-based design system defined in `src/index.css`:

```css
--primary:       #4F46E5   /* Indigo brand colour */
--success:       #10B981   /* Green */
--warning:       #F59E0B   /* Amber */
--danger:        #EF4444   /* Red */
--sidebar-width: 260px     /* Sidebar width */
```

All components use these variables so the entire theme can be changed by editing one file.

---

## 📱 Mobile Responsive

The app is fully responsive across all screen sizes:

| Screen | Behaviour |
|---|---|
| Desktop 1280px+ | Full sidebar, 4-column grids, side-by-side layouts |
| Tablet 768–1024px | Narrower sidebar, 2-column grids |
| Mobile 375–768px | Hidden sidebar with drawer, stacked layouts, no left panels on auth pages |

---

## 🔒 Security

- JWT token stored in localStorage
- Axios interceptor attaches token to every request
- 401 responses automatically log out the user
- Role-based route guards on every protected page
- Access denied page for direct URL navigation attempts

---

## 🧪 Test Accounts

Admin:    odwa@acme.com   / Password123  (super_admin)
Employee: thabo@acme.com  / Password123  (employee)

---

## 📄 License

MIT License — free to use, modify and distribute.

## 👤 Author

**Odwa Dyantyi**
Master's in Information Systems — University of the Western Cape

