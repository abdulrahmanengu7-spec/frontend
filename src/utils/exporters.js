import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

export function exportRowsExcel(rows, filename = "export.xlsx") {
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Data");
  XLSX.writeFile(wb, filename);
}

export function exportRowsPDF(rows, columns, title = "Report") {
  const doc = new jsPDF({ orientation: "landscape" });
  doc.text(title, 14, 14);
  autoTable(doc, {
    startY: 20,
    head: [columns.map(c => c.label)],
    body: rows.map(r => columns.map(c => r[c.key] ?? "")),
    styles: { fontSize: 7 },
  });
  doc.save(`${title}.pdf`);
}
