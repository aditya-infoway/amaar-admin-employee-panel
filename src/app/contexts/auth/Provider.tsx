import { useEffect, useReducer, ReactNode } from "react";
import { Post, toastsuccessmsg, toasterrormsg } from "@/ApiHelper";
import { isTokenValid, setSession } from "@/utils/jwt";
import { AuthProvider as AuthContext, AuthContextType } from "./context";
import { User } from "@/@types/user";

interface AuthAction {
  type:
    | "INITIALIZE"
    | "LOGIN_REQUEST"
    | "LOGIN_SUCCESS"
    | "LOGIN_ERROR"
    | "LOGOUT"
    | "SESSION_ESTABLISHED";
  payload?: Partial<AuthContextType>;
}

const initialState: AuthContextType = {
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,
  errorMessage: null,
  user: null,
  pendingToken: null,
  pendingEmail: null,
  login: async () => {},
  completeAuth: () => {},
  logout: async () => {},
};

const EXPIRES_AT_KEY = "authExpiresAt";
const SESSION_DURATION_MS = 2 * 60 * 60 * 1000; // 2 hours inactivity

const isSessionExpired = () => {
  const expiresAt = window.localStorage.getItem(EXPIRES_AT_KEY);
  if (!expiresAt) return true;
  return Date.now() > Number(expiresAt);
};

// call this on login AND on every user activity to slide the window
const resetExpiry = () => {
  window.localStorage.setItem(
    EXPIRES_AT_KEY,
    String(Date.now() + SESSION_DURATION_MS),
  );
};

const reducerHandlers: Record<
  AuthAction["type"],
  (state: AuthContextType, action: AuthAction) => AuthContextType
> = {
  INITIALIZE: (state, action) => ({
    ...state,
    isAuthenticated: action.payload?.isAuthenticated ?? false,
    isInitialized: true,
    user: action.payload?.user ?? null,
  }),

  LOGIN_REQUEST: (state) => ({
    ...state,
    isLoading: true,
    errorMessage: null,
  }),

  LOGIN_SUCCESS: (state, action) => ({
    ...state,
    isAuthenticated: false,
    isLoading: false,
    errorMessage: null,
    pendingToken: action.payload?.pendingToken ?? null,
    pendingEmail: action.payload?.pendingEmail ?? null,
    user: action.payload?.user ?? null,
  }),

  LOGIN_ERROR: (state, action) => ({
    ...state,
    errorMessage: action.payload?.errorMessage ?? "An error occurred",
    isLoading: false,
  }),

  LOGOUT: (state) => ({
    ...state,
    isAuthenticated: false,
    user: null,
    pendingToken: null,
    pendingEmail: null,
  }),

  SESSION_ESTABLISHED: (state, action) => ({
    ...state,
    isAuthenticated: true,
    isLoading: false,
    errorMessage: null,
    user: action.payload?.user ?? state.user,
    pendingToken: null,
  }),
};

const reducer = (
  state: AuthContextType,
  action: AuthAction,
): AuthContextType => {
  const handler = reducerHandlers[action.type];
  return handler ? handler(state, action) : state;
};

const PENDING_TOKEN_KEY = "pendingToken";
const PENDING_EMAIL_KEY = "pendingEmail";
const COMPANY_ID_KEY = "companyId";
const EMPLOYEE_ID_KEY = "employeeId";
const FINANCIAL_YEAR_ID_KEY = "financialYearId"; // ✅ NEW — project me already isi key se FY read hoti hai localStorage se

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const init = async () => {
      try {
        const authToken = window.localStorage.getItem("authToken");
        const companyId = window.localStorage.getItem(COMPANY_ID_KEY);
        const employeeId = window.localStorage.getItem(EMPLOYEE_ID_KEY);

        if (
          authToken &&
          isTokenValid(authToken) &&
          companyId &&
          employeeId &&
          !isSessionExpired()
        ) {
          setSession(authToken);
          const userStr = window.localStorage.getItem("user");
          const user = userStr ? JSON.parse(userStr) : null;
          dispatch({
            type: "INITIALIZE",
            payload: { isAuthenticated: true, user },
          });
        } else {
          // clear stale/expired session
          clearAuthStorage();
          dispatch({
            type: "INITIALIZE",
            payload: { isAuthenticated: false, user: null },
          });
        }
      } catch (err) {
        console.error(err);
        dispatch({
          type: "INITIALIZE",
          payload: { isAuthenticated: false, user: null },
        });
      }
    };
    init();
  }, []);

  useEffect(() => {
    const handleForceLogout = () => {
      logout();
    };

    window.addEventListener("force-logout", handleForceLogout);

    return () => {
      window.removeEventListener("force-logout", handleForceLogout);
    };
  }, []);

  useEffect(() => {
    if (!state.isAuthenticated) return;

    let timer: ReturnType<typeof setTimeout>;

    const scheduleCheck = () => {
      clearTimeout(timer);
      const expiresAt = Number(window.localStorage.getItem(EXPIRES_AT_KEY));
      const msLeft = expiresAt - Date.now();

      if (msLeft <= 0) {
        logout();
        toasterrormsg("Session expired due to inactivity.");
        return;
      }
      timer = setTimeout(scheduleCheck, msLeft);
    };

    const handleActivity = () => {
      resetExpiry();
    };

    const events = ["mousedown", "keydown", "scroll", "touchstart"];
    events.forEach((e) => window.addEventListener(e, handleActivity));

    scheduleCheck();

    return () => {
      clearTimeout(timer);
      events.forEach((e) => window.removeEventListener(e, handleActivity));
    };
  }, [state.isAuthenticated]);

  // STEP 1: login validate — OTP nahi
  const login = async (credentials: { email: string; password: string }) => {
    dispatch({ type: "LOGIN_REQUEST" });
    try {
      const response = await Post(
        "employee/login",
        { email: credentials.email, password: credentials.password },
        false,
      );
      const result = response.data;

      if (result.status !== 200) {
        throw new Error(result.message || "Login failed");
      }

      const {
        token,
        email,
        employeeId,
        department,
        roleId,
        roleName,
        employeeName,
        companyId,
        companyName,
      } = result.data;

      window.localStorage.setItem(PENDING_TOKEN_KEY, token);
      window.localStorage.setItem(PENDING_EMAIL_KEY, email);
      setSession(token); // axios Authorization header set karega

      window.localStorage.setItem("employeeId", employeeId);
      window.localStorage.setItem("department", department);
      window.localStorage.setItem("roleId", roleId);
      window.localStorage.setItem("roleName", roleName);
      window.localStorage.setItem("employeeName", employeeName);

      toastsuccessmsg(result.message);

      dispatch({
        type: "LOGIN_SUCCESS",
        payload: {
          pendingToken: token,
          pendingEmail: email,
          user: { companyId, companyName, email } as unknown as User,
        },
      });

      // ✅ NEW — SignIn page ko roleName + companyId wapas do, taaki wo decide
      // kar sake ki select-company page dikhana hai ya seedha dashboard bhejna hai
      return { companyId, companyName, roleId, roleName, employeeName, department };
    } catch (err: any) {
      const message =
        err?.response?.data?.message || err.message || "Login failed";
      toasterrormsg(message);
      dispatch({ type: "LOGIN_ERROR", payload: { errorMessage: message } });
      throw err;
    }
  };

  // STEP 2: company select/create hone ke baad final auth
  // ✅ CHANGE — optional `options` add kiya:
  //   - user: login() ke turant baad (same handler me) completeAuth call
  //     karna ho to state.user abhi tak React dispatch se update nahi hua
  //     hota (stale closure) — isliye caller directly user object de sakta hai.
  //   - financialYearId: jab company+FY dono default set karne ho (select
  //     company page skip karke), caller yaha default FY id pass kar dega.
  const completeAuth = (
    companyId: string,
    options?: { user?: User; financialYearId?: string },
  ) => {
    const token =
      state.pendingToken || window.localStorage.getItem(PENDING_TOKEN_KEY);

    if (!token) {
      toasterrormsg("Session expired. Please login again.");
      return;
    }

    const user = options?.user ?? state.user;

    setSession(token);
    window.localStorage.setItem("authToken", token);
    window.localStorage.setItem(COMPANY_ID_KEY, companyId);
    window.localStorage.setItem("user", JSON.stringify(user));

    // ✅ NEW — agar financialYearId diya gaya hai (default-set flow), to save karo
    if (options?.financialYearId) {
      window.localStorage.setItem(FINANCIAL_YEAR_ID_KEY, options.financialYearId);
    }

    resetExpiry();
    window.localStorage.removeItem(PENDING_TOKEN_KEY);
    window.localStorage.removeItem(PENDING_EMAIL_KEY);

    dispatch({ type: "SESSION_ESTABLISHED", payload: { user } });
  };

  const logout = async () => {
    setSession(null);
    clearAuthStorage();
    dispatch({ type: "LOGOUT" });
  };

  if (!children) return null;

  return (
    <AuthContext value={{ ...state, login, completeAuth, logout }}>
      {children}
    </AuthContext>
  );
}

// sab auth-related localStorage keys ek jagah clear karne ke liye
function clearAuthStorage() {
  window.localStorage.removeItem("authToken");
  window.localStorage.removeItem(COMPANY_ID_KEY);
  window.localStorage.removeItem(EMPLOYEE_ID_KEY);
  window.localStorage.removeItem("user");
  window.localStorage.removeItem(PENDING_TOKEN_KEY);
  window.localStorage.removeItem(PENDING_EMAIL_KEY);
  window.localStorage.removeItem(EXPIRES_AT_KEY);
  window.localStorage.removeItem(FINANCIAL_YEAR_ID_KEY);
  window.localStorage.removeItem("department");
  window.localStorage.removeItem("roleId");
  window.localStorage.removeItem("roleName");
  window.localStorage.removeItem("employeeName");
}