import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardLayout from './components/layout/DashboardLayout';
import DashboardHome from './pages/dashboard/DashboardHome';
import MyLeavePage from './pages/leave/MyLeavePage';
import MyBalancesPage from './pages/leave/MyBalancesPage';
import ApprovalsPage from './pages/leave/ApprovalsPage';
import EmployeesPage from './pages/employees/EmployeesPage';
import LeaveTypesPage from './pages/leave/LeaveTypesPage';
import CalendarPage from './pages/leave/CalendarPage';
import ReportsPage from './pages/reports/ReportsPage';
import PublicHolidaysPage from './pages/holidays/PublicHolidaysPage';
import NotificationsPage from './pages/notifications/NotificationsPage';

import AuditPage            from './pages/audit/AuditPage';
import LeavePoliciesPage    from './pages/policies/LeavePoliciesPage';
import RoleRequestPage      from './pages/roleRequests/RoleRequestPage';
import RoleRequestAdminPage from './pages/roleRequests/RoleRequestAdminPage';

import ForgotPasswordPage   from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage    from './pages/auth/ResetPasswordPage';
import CompanySettingsPage  from './pages/settings/CompanySettingsPage';

const LoadingScreen = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', flexDirection: 'column', gap: '1rem', color: '#6B7280' }}>
    <div className="spinner" style={{ width: 40, height: 40 }} />
    <p>Loading...</p>
  </div>
);

const AccessDenied = () => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '1rem', textAlign: 'center', padding: '2rem' }}>
    <div style={{ width: '80px', height: '80px', background: '#FEE2E2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>
      {'lock'}
    </div>
    <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#111827', margin: 0 }}>
      Access Denied
    </h2>
    <p style={{ color: '#6B7280', fontSize: '0.9375rem', maxWidth: '400px', lineHeight: 1.6, margin: 0 }}>
      You do not have permission to view this page. Please contact your HR admin if you think this is a mistake.
    </p>
    <a href="/dashboard" style={{ background: '#4F46E5', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', fontWeight: '600', fontSize: '0.875rem', textDecoration: 'none', marginTop: '0.5rem' }}>
      Back to Dashboard
    </a>
  </div>
);

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <LoadingScreen />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <LoadingScreen />;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return children;
};

const RoleRoute = ({ roles, children }) => {
  const { user, hasRole } = useAuth();
  if (!user) return <LoadingScreen />;
  if (!hasRole(roles)) return <AccessDenied />;
  return children;
};

const App = () => {
  return (
    <Routes>

      {/* ── Public Routes ─────────────────────────── */}
      {/* These MUST be at the top level             */}
      {/* NOT nested inside /dashboard               */}
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
      
      {/* Forgot password — public */}
        <Route path="/forgot-password" element={
        <PublicRoute>
        <ForgotPasswordPage />
        </PublicRoute>
        } />

      {/* Reset password — public (linked from email) */}
        {/* NOT wrapped in PublicRoute because logged-in
        users should also be able to reset their password */}
        <Route path="/reset-password"
         element={<ResetPasswordPage />}
        />  
      
      {/* ── Protected Dashboard Routes ────────────── */}    
      <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        
        {/* All roles */}
        <Route index element={<DashboardHome />} />
        <Route path="my-leave" element={<MyLeavePage />} />
        <Route path="my-balances" element={<MyBalancesPage />} />
        <Route path="calendar" element={<CalendarPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        
        {/* Role request — all users */}
        <Route path="role-requests"
        element={<RoleRequestPage />}
        />
        
        {/* Company settings — all authenticated users can view */}
        <Route path="settings" element={<CompanySettingsPage />} />

        {/* Manager and above */}
               
        <Route path="approvals" element={<RoleRoute roles={['manager','hr_admin','super_admin']}><ApprovalsPage /></RoleRoute>} />
        <Route path="employees" element={<RoleRoute roles={['manager','hr_admin','super_admin']}><EmployeesPage /></RoleRoute>} />
        <Route path="reports" element={<RoleRoute roles={['manager','hr_admin','super_admin']}><ReportsPage /></RoleRoute>} />
        
        {/* HR admin and super admin only */}
        
        <Route path="leave-types" element={<RoleRoute roles={['hr_admin','super_admin']}><LeaveTypesPage /></RoleRoute>} />

        {/* Leave policies — HR only */}
        <Route path="leave-policies" element={
        <RoleRoute roles={['hr_admin','super_admin']}>
        <LeavePoliciesPage />
        </RoleRoute>
        } />  

        <Route path="holidays" element={<RoleRoute roles={['hr_admin','super_admin']}><PublicHolidaysPage /></RoleRoute>} />

        {/* Audit trail — HR only */}
        <Route path="audit" element={
        <RoleRoute roles={['hr_admin','super_admin']}>
        <AuditPage />
        </RoleRoute>
        } />
                               
       {/* Role requests admin — HR only */}
        <Route path="role-requests-admin" element={
        <RoleRoute roles={['hr_admin','super_admin']}>
        <RoleRequestAdminPage />
        </RoleRoute>
        } />
                                   
      </Route>
      
      {/* Redirects */}
      
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  
  );
};

export default App;