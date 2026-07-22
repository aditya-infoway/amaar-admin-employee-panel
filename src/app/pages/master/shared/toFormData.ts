// File/boolean/string sab ko safely FormData me daalne ke liye
export function buildFormData(fields: Record<string, unknown>): FormData {
  const formData = new FormData();

  Object.entries(fields).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;

    if (value instanceof File) {
      formData.append(key, value);
    } else if (typeof value === "boolean") {
      formData.append(key, value ? "true" : "false");
    } else {
      formData.append(key, String(value));
    }
  });

  return formData;
}