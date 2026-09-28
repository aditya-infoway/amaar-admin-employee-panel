// src/pages/AuthBridge.tsx
import { useEffect } from "react";

export default function AuthBridge() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (!token) {
      window.location.href = "/login";
      return;
    }

    localStorage.setItem("authToken", token);
    localStorage.setItem("companyId", params.get("companyId") || "");
    localStorage.setItem("employeeId", params.get("employeeId") || "");
    localStorage.setItem("department", params.get("department") || "");
    localStorage.setItem("roleId", params.get("roleId") || "");
    localStorage.setItem("roleName", params.get("roleName") || "");
    localStorage.setItem("employeeName", params.get("employeeName") || "");
    localStorage.setItem(
      "user",
      JSON.stringify({
        companyId: params.get("companyId"),
        employeeName: params.get("employeeName"),
      }),
    );
    localStorage.setItem(
      "authExpiresAt",
      String(Date.now() + 2 * 60 * 60 * 1000),
    );

    // Full reload so AuthProvider's init() re-reads localStorage fresh
    window.location.href = "/dashboards/home";
  }, []);

  return null; // or a small "Signing you in..." spinner
}
