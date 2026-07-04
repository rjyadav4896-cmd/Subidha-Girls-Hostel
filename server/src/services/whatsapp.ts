type ApplicationForWhatsapp = {
  _id: unknown;
  fullName: string;
  phone: string;
  email: string;
  roomNumber: string;
  bedType: string;
  school: string;
  address: string;
  guardianName: string;
  localGuardianName: string;
  collegeOrWorkTiming: string;
  dateOfEntry: Date;
};

function normalizePhone(phone: string) {
  return phone.replace(/[^\d]/g, '');
}

export function buildApplicationWhatsappUrl(args: {
  adminPhone?: string;
  appOrigin: string;
  publicBaseUrl: string;
  actionToken: string;
  application: ApplicationForWhatsapp;
}) {
  if (!args.adminPhone) return null;

  const phone = normalizePhone(args.adminPhone);
  if (!phone) return null;

  const app = args.application;
  const adminReviewUrl = `${args.appOrigin.replace(/\/$/, '')}/admin/applications`;
  const actionBase = `${args.publicBaseUrl.replace(/\/$/, '')}/api/applications/action?token=${encodeURIComponent(args.actionToken)}`;
  const message = [
    'New Subidha Girls Hostel application needs review.',
    '',
    `Name: ${app.fullName}`,
    `Phone: ${app.phone}`,
    `Email: ${app.email}`,
    `Room: ${app.roomNumber}`,
    `Bed: ${app.bedType}`,
    `School/College: ${app.school}`,
    `Address: ${app.address}`,
    `Guardian: ${app.guardianName}`,
    `Local guardian: ${app.localGuardianName}`,
    `College/Work timing: ${app.collegeOrWorkTiming}`,
    `Entry date: ${app.dateOfEntry.toDateString()}`,
    `Application ID: ${String(app._id)}`,
    '',
    `Accept: ${actionBase}&action=accept`,
    `Reject: ${actionBase}&action=reject`,
    '',
    `Admin dashboard: ${adminReviewUrl}`
  ].join('\n');

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

export function buildAcceptedStudentWhatsappUrl(args: {
  adminPhone?: string;
  appOrigin: string;
  reportPdfUrl?: string;
  student: ApplicationForWhatsapp & { username: string; temporaryPassword: string };
}) {
  if (!args.adminPhone) return null;

  const phone = normalizePhone(args.adminPhone);
  if (!phone) return null;

  const student = args.student;
  const studentLoginUrl = `${args.appOrigin.replace(/\/$/, '')}/student/login`;
  const adminStudentsUrl = `${args.appOrigin.replace(/\/$/, '')}/admin/students`;
  const message = [
    'Subidha Girls Hostel student accepted.',
    '',
    `Name: ${student.fullName}`,
    `Phone: ${student.phone}`,
    `Email: ${student.email}`,
    `Room: ${student.roomNumber}`,
    `Bed: ${student.bedType}`,
    `School/College: ${student.school}`,
    `Address: ${student.address}`,
    `Guardian: ${student.guardianName}`,
    `Local guardian: ${student.localGuardianName}`,
    `College/Work timing: ${student.collegeOrWorkTiming}`,
    `Entry date: ${student.dateOfEntry.toDateString()}`,
    '',
    'Student login credentials:',
    `Username: ${student.username}`,
    `Temporary password: ${student.temporaryPassword}`,
    `Student login: ${studentLoginUrl}`,
    ...(args.reportPdfUrl ? ['', `PDF report: ${args.reportPdfUrl}`] : []),
    '',
    `Admin students: ${adminStudentsUrl}`
  ].join('\n');

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

export function buildStudentCredentialsWhatsappUrl(args: {
  studentPhone?: string;
  appOrigin: string;
  student: { fullName: string; username: string; temporaryPassword: string };
}) {
  if (!args.studentPhone) return null;

  const phone = normalizePhone(args.studentPhone);
  if (!phone) return null;

  const studentLoginUrl = `${args.appOrigin.replace(/\/$/, '')}/student/login`;
  const message = [
    `Namaste ${args.student.fullName}, your Subidha Girls Hostel account has been approved.`,
    '',
    `Username: ${args.student.username}`,
    `Temporary password: ${args.student.temporaryPassword}`,
    `Login: ${studentLoginUrl}`
  ].join('\n');

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
