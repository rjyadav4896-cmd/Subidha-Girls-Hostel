import { AuthLoginCard } from '../../components/AuthLoginCard';
import { setStudentToken } from '../../lib/storage';

export function StudentLoginPage() {
  return (
    <AuthLoginCard
      role="student"
      title="Student sign in"
      eyebrow="Student portal"
      description="View your dashboard, payment status, due dates, leave history, and online payment options."
      usernameLabel="Student username"
      usernamePlaceholder="Your hostel username"
      endpoint="/api/auth/student/login"
      dashboardPath="/student"
      alternatePath="/admin/login"
      alternateLabel="Admin login"
      setToken={setStudentToken}
      helper="Ask the hostel office if you need your username reset."
    />
  );
}
