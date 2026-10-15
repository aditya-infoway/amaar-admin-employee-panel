// Production department ke employees ka roleId 0 hota hai (role nahi, process hota hai).
// Employee panel navigation / routes roleId se chalte hain, isliye Production employee
// ko uske process ke hisaab se existing manager panel ka roleId map kar dete hain.
//
// Key = processName (lowercase) jo Settings > Production > Main Process me bana hai.
const PROCESS_ROLE_MAP: Record<string, number> = {
  "material cutting": 6, // cuttingmanager
  cutting: 6,
  welding: 7, // weldingmanager
  fitting: 8, // fittingmanager
  blasting: 9, // blastingmanager
  paint: 10, // paintmanager
  washing: 11, // washingmanager
  qc: 12, // QCmanager
};

export const isProductionUser = (): boolean =>
  String(window.localStorage.getItem("department") || "").toLowerCase() ===
  "production";

// Navigation aur Routes dono isi ko use karenge
export const getEffectiveRoleId = (): number => {
  if (isProductionUser()) {
    const processName = (window.localStorage.getItem("processName") || "")
      .trim()
      .toLowerCase();

    return PROCESS_ROLE_MAP[processName] ?? 0;
  }

  return Number(window.localStorage.getItem("roleId"));
};