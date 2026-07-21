type ExportColumn<T> = { key: keyof T; header: string };

function escapeCsvValue(value: unknown): string {
  const text = String(value ?? "");
  if (text.includes(",") || text.includes('"') || text.includes("\n")) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

export function exportToExcel<T extends Record<string, unknown>>(
  rows: T[],
  columns: ExportColumn<T>[],
  filename: string,
): void {
  const header = columns.map((col) => escapeCsvValue(col.header)).join(",");
  const body = rows
    .map((row) =>
      columns.map((col) => escapeCsvValue(row[col.key])).join(","),
    )
    .join("\n");

  const blob = new Blob([`${header}\n${body}`], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export function exportToPdf<T extends Record<string, unknown>>(
  rows: T[],
  columns: ExportColumn<T>[],
  title: string,
  _filename: string,
): void {
  const tableRows = rows
    .map(
      (row) =>
        `<tr>${columns
          .map(
            (col) =>
              `<td style="border:1px solid #ddd;padding:8px;">${String(
                row[col.key] ?? "",
              )}</td>`,
          )
          .join("")}</tr>`,
    )
    .join("");

  const html = `
    <html>
      <head>
        <title>${title}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 24px; }
          h1 { font-size: 20px; margin-bottom: 16px; }
          table { border-collapse: collapse; width: 100%; font-size: 12px; }
          th { border: 1px solid #ddd; padding: 8px; background: #f5f5f5; text-align: left; }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        <table>
          <thead>
            <tr>${columns
              .map(
                (col) =>
                  `<th>${col.header}</th>`,
              )
              .join("")}</tr>
          </thead>
          <tbody>${tableRows}</tbody>
        </table>
      </body>
    </html>
  `;

  const printWindow = window.open("", "_blank");
  if (!printWindow) return;
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
}
