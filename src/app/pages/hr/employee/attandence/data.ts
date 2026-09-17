export interface Attendance {
  id: string;
  employeeId: string;
  employeeName: string;
  checkinDate: string;
  checkinTime: string;
  checkinPhoto: string;
  checkinLatitude: string;
  checkinLongitude: string;
  checkoutTime: string;
  checkoutPhoto: string;
  checkoutLatitude: string;
  checkoutLongitude: string;
  countTime: string;
  status: string;
}

// ---- Map backend response (attendanceId, numeric ids) to frontend Attendance shape ----
export function mapApiAttendanceToAttendance(apiAttendance: any): Attendance {
  return {
    id: String(apiAttendance.attendanceId),
    employeeId: String(apiAttendance.employeeId ?? ""),
    employeeName: apiAttendance.employeeName ?? "",
    checkinDate: apiAttendance.checkinDate ?? "",
    checkinTime: apiAttendance.checkinTime ?? "",
    checkinPhoto: apiAttendance.checkinPhoto ?? "",
    checkinLatitude: apiAttendance.checkinLatitude ?? "",
    checkinLongitude: apiAttendance.checkinLongitude ?? "",
    checkoutTime: apiAttendance.checkoutTime ?? "",
    checkoutPhoto: apiAttendance.checkoutPhoto ?? "",
    checkoutLatitude: apiAttendance.checkoutLatitude ?? "",
    checkoutLongitude: apiAttendance.checkoutLongitude ?? "",
    countTime: apiAttendance.countTime != null ? String(apiAttendance.countTime) : "",
    status: apiAttendance.status ?? "",
  };
}

// ---- countTime (seconds) ko "Hh Mm" jaisa readable format me dikhana ----
export function formatCountTime(seconds: string): string {
  const total = Number(seconds);
  if (!total || Number.isNaN(total)) return "-";

  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);

  return `${hours}h ${minutes}m`;
}