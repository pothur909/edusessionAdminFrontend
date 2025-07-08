import * as XLSX from 'xlsx';

interface ExportOptions {
  filename?: string;
  sheetName?: string;
  headerStyle?: {
    fill?: { fgColor: { rgb: string } };
    font?: { bold: boolean; color?: { rgb: string } };
  };
}

export const exportToExcel = (
  data: any[],
  columns: { key: string; label: string }[],
  options: ExportOptions = {}
) => {
  const {
    filename = 'export.xlsx',
    sheetName = 'Sheet1',
    headerStyle = {
      fill: { fgColor: { rgb: '4F81BD' } },
      font: { bold: true, color: { rgb: 'FFFFFF' } },
    },
  } = options;

  // Transform data to match column structure
  const transformedData = data.map(item => {
    const row: any = {};
    columns.forEach(col => {
      row[col.label] = item[col.key];
    });
    return row;
  });

  // Create worksheet
  const ws = XLSX.utils.json_to_sheet(transformedData);

  // Apply header style
  const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
  for (let C = range.s.c; C <= range.e.c; ++C) {
    const address = XLSX.utils.encode_cell({ r: 0, c: C });
    if (!ws[address]) continue;

    ws[address].s = headerStyle;
  }

  // Create workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);

  // Save file
  XLSX.writeFile(wb, filename);
}; 