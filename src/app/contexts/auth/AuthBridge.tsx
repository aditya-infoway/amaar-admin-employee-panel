import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { useAuthContext } from "@/app/contexts/auth/context";
import { Get, toasterrormsg } from "@/ApiHelper";

interface FinancialYearRow {
  financialYearId: number;
  companyDetailsId: number;
  companyId: number;
  companyName: string;
}

export default function AuthBridge() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { completeAuth } = useAuthContext();
  const [status, setStatus] = useState("Signing you in...");

  useEffect(() => {
    const run = async () => {
      const token = searchParams.get("token");
      const role = searchParams.get("role") || "Employee";
      const employeeId = searchParams.get("employeeId");
      const employeeName = searchParams.get("employeeName") || "";
      const roleId = searchParams.get("roleId");
      const roleName = searchParams.get("roleName") || "";
      const email = searchParams.get("email") || "";
      const department = searchParams.get("department") || "";

      if (!token) {
        setStatus("Missing token. Redirecting to login...");
        navigate("/login", { replace: true });
        return;
      }

      localStorage.setItem("authToken", token);
      localStorage.setItem("pendingToken", token);

      // Required for RoleRoutes / getEffectiveRoleId()
      if (roleId) {
        localStorage.setItem("roleId", String(roleId));
      }

      try {
        const response = await Get("employee/financial-years", {}, false);
        const rows: FinancialYearRow[] = response.data?.success
          ? response.data.data || []
          : [];

        if (rows.length === 0) {
          toasterrormsg("No company found for this employee.");
          navigate("/login", { replace: true });
          return;
        }

        const row = rows[0];

        localStorage.setItem("financialYearId", String(row.financialYearId));
        localStorage.setItem("companyDetailsId", String(row.companyDetailsId));

        completeAuth(String(row.companyId), {
          role,
          companyId: row.companyId,
          employeeId: employeeId ? Number(employeeId) : undefined,
          employeeName,
          email,
          roleId: roleId ? Number(roleId) : undefined,
          roleName,
          department,
        } as any);

        setStatus("Success! Redirecting...");
        // RoleRoutes handles path "* — do not use /dashboards/home
        navigate("/", { replace: true });
      } catch {
        toasterrormsg("Session invalid. Please login again.");
        localStorage.removeItem("authToken");
        navigate("/login", { replace: true });
      }
    };

    run();
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-lg text-gray-600">{status}</p>
    </div>
  );
}
