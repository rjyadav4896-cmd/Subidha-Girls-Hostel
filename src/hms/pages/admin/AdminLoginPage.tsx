import { AuthLoginCard } from '../../components/AuthLoginCard';
import { setAdminToken } from '../../lib/storage';

export function AdminLoginPage() {
  return (
    <AuthLoginCard
      role="admin"
      title="Admin sign in"
      eyebrow="Admin access"
      description="Open the operations dashboard for applications, students, leave, payments, and hostel settings."
      usernameLabel="Admin username"
      usernamePlaceholder="admin"
      endpoint="/api/auth/admin/login"
      dashboardPath="/admin"
      alternatePath="/student/login"
      alternateLabel="Student login"
      setToken={setAdminToken}
      helper="Only authorized hostel staff should use this portal."
    />
  );
}
