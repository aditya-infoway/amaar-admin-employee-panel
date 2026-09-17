// Import Dependencies
import { useNavigate } from "react-router";
import { EnvelopeIcon, LockClosedIcon } from "@heroicons/react/24/outline";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";

// Local Imports
import { Button, Card, Checkbox, Input, InputErrorMsg } from "@/components/ui";
import { useAuthContext } from "@/app/contexts/auth/context";
import { APP_LOGO } from "@/constants/app";
import { AuthFormValues, schema } from "./schema";
import { Page } from "@/components/shared/Page";
import { Get, toasterrormsg } from "@/ApiHelper";

// ----------------------------------------------------------------------

// ✅ CHANGE — roleId NUMBER hai (jaisa useNavigation.tsx / RoleRoutes.tsx me
// dikha — 1, 14, 6 waghera), isliye ye array bhi numbers ka hi hona chahiye,
// warna "6" !== 6 wali type-mismatch se check silently fail ho jata.
// 👉 Cutting Manager = 6 (confirmed cuttingmanager route/nav se). Baaki 7
// roles (Welding/Fitting/Blasting/Paint/Washing/QC/Production Manager) ke
// actual numeric roleId apni DB se daal dena — abhi placeholder rakhe hain.
const DIRECT_DASHBOARD_ROLE_IDS = [
  6, // Cutting Manager
  7, // Welding Manager — TODO: actual roleId daalo
  8, // Fitting Manager — TODO: actual roleId daalo
  9, // Blasting Manager — TODO: actual roleId daalo
  10, // Paint Manager — TODO: actual roleId daalo
  11, // Washing Manager — TODO: actual roleId daalo
  12, // QC Manager — TODO: actual roleId daalo
  13,
  // Production Manager — TODO: actual roleId daalo
];

// ✅ CHANGE — same shape jo select-company.tsx me hai, taaki wahi API response
// yaha bhi directly use ho sake
interface FinancialYearRow {
  financialYearId: number;
  companyDetailsId: number;
  companyId: number;
  startDate: string;
  endDate: string;
  companyName: string;
}

export default function SignIn() {
  const { login, completeAuth, errorMessage } = useAuthContext();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AuthFormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
// Local Imports ke baad, DIRECT_DASHBOARD_ROLE_IDS se pehle ya import section mein:
const getCurrentLocation = (): Promise<{ latitude: number; longitude: number } | null> => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      () => {
        resolve(null);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  });
};
  const onSubmit = async (data: AuthFormValues) => {
    try {
          const location = await getCurrentLocation();
      const result = await login({ email: data.email, password: data.password, latitude: location?.latitude,
        longitude: location?.longitude, });

      // ✅ CHANGE — ab roleId check hota hai (Number cast safe comparison ke liye)
      if (result && DIRECT_DASHBOARD_ROLE_IDS.includes(Number(result.roleId))) {
        // ✅ NEW — select-company.tsx jaisi hi API call — hardcoded ID ki jagah
        // real companyId/financialYearId server se lete hain
        try {
          const response = await Get("employee/financial-years", {}, false);
          const rows: FinancialYearRow[] = response.data?.success
            ? response.data.data || []
            : [];

          if (rows.length > 0) {
            // in roles ke employee ki ek hi company/FY hoti hai, isliye pehla row lo
            const row = rows[0];

            localStorage.setItem("financialYearId", String(row.financialYearId));
            localStorage.setItem("companyDetailsId", String(row.companyDetailsId));

            completeAuth(String(row.companyId), {
              user: {
                companyId: row.companyId,
                companyName: row.companyName,
                email: data.email,
              } as any,
            });

            navigate("/dashboards/home"); // select-company.tsx wala hi sahi path
            return;
          }

          // ✅ NEW — agar kisi wajah se company/FY nahi mila, to safety net ke
          // taur pe normal select-company page pe bhej do (crash nahi hoga)
          toasterrormsg("Company details not found. Please select manually.");
        } catch (fyErr) {
          toasterrormsg("Something went wrong while fetching your company.");
        }
      }

      // baaki sab roles (aur upar wala fallback) ke liye — company select/create page
      navigate("/select-company");
    } catch (err) {
      // error handled by context
    }
  };

  return (
    <Page title="Login">
      <main className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 overflow-hidden min-h-screen">
            {/* Left Side - Form */}
            <div className="p-6 sm:p-8 lg:p-10 bg-white flex items-center justify-center">
              <Card className="rounded-lg p-5 lg:p-7 bg-transparent w-full" style={{ overflow: "visible" }}>
                <div className="mb-8 flex justify-start">
                  <img
                    src={APP_LOGO}
                    alt="Autobook ERP"
                    className="h-12 w-auto object-contain sm:h-14"
                  />
                </div>
                <div
                  style={{
                    borderTop: "6px solid #1a2fa8",
                    borderBottom: "6px solid #1a2fa8",
                    borderRadius: "40px",
                    width: "100%",
                  }}
                ></div>

                <div className="mt-6 text-left">
                  <h2 className="text-2xl sm:text-3xl font-bold text-primary">
                    Welcome to <span className="text-main">Autobook</span> ERP
                  </h2>
                  <p className="mt-1 text-gray-700 leading-relaxed">
                    Streamline your business operations with a powerful and easy-to-use ERP platform.
                  </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} autoComplete="off">
                  <div className="space-y-4 mt-6">
                    <Input
                      label="Email"
                      placeholder="Enter Email"
                      prefix={
                        <EnvelopeIcon
                          className="size-5 text-gray-500"
                          strokeWidth="1"
                        />
                      }
                      className="focus:border-primary border-gray-300 bg-white text-gray-800"
                      {...register("email")}
                      error={errors?.email?.message}
                    />
                    <Input
                      label="Password"
                      placeholder="Enter Password"
                      type="password"
                      prefix={
                        <LockClosedIcon
                          className="size-5 text-gray-500"
                          strokeWidth="1"
                        />
                      }
                      className="focus:border-primary border-gray-300 bg-white text-gray-800"
                      {...register("password")}
                      error={errors?.password?.message}
                    />
                  </div>

                  <div className="mt-2">
                    <InputErrorMsg when={(errorMessage && errorMessage !== "") as boolean}>
                      {errorMessage}
                    </InputErrorMsg>
                  </div>

                  <div className="mt-4 flex items-center justify-between space-x-2">
                    <Checkbox label="Remember me" />
                  </div>

                  <Button type="submit" className="mt-5 w-full" color="primary">
                    Sign In
                  </Button>
                </form>
              </Card>
            </div>

            {/* Right Side - Image */}
            <div className="relative hidden lg:flex items-center justify-center">
              <img
                src="images/ammar/login.jpeg"
                alt="Login Banner"
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </main>
    </Page>
  );
}