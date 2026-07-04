const ADMIN_TOKEN_KEY = 'hms_admin_token';
const STUDENT_TOKEN_KEY = 'hms_student_token';

export function setAdminToken(token: string) {
  localStorage.setItem(ADMIN_TOKEN_KEY, token);
}

export function getAdminToken() {
  return localStorage.getItem(ADMIN_TOKEN_KEY);
}

export function clearAdminToken() {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
}

export function setStudentToken(token: string) {
  localStorage.setItem(STUDENT_TOKEN_KEY, token);
}

export function getStudentToken() {
  return localStorage.getItem(STUDENT_TOKEN_KEY);
}

export function clearStudentToken() {
  localStorage.removeItem(STUDENT_TOKEN_KEY);
}

