import * as XLSX from "xlsx";

type RankingData = {
  ranking: number;
  nis: string;
  nama: string;
  kelas: string;
  nilaiS: number;
  nilaiV: number;
  status: string;
};

export function exportRankingExcel(
  data: RankingData[],
  tahunAjaran: string,
  kelas: string
) {
  // Convert list to excel-friendly format
  const rows = data.map((item) => ({
    "Ranking": item.ranking,
    "NIS": item.nis,
    "Nama Siswa": item.nama,
    "Kelas": item.kelas,
    "Nilai Vektor S": Number(item.nilaiS.toFixed(2)),
    "Nilai Vektor V (Hasil WP)": Number(item.nilaiV.toFixed(4)),
    "Status Kelayakan": item.status,
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Ranking Siswa Terbaik");

  // Adjust column widths
  const max_widths = [
    { wch: 10 }, // Ranking
    { wch: 15 }, // NIS
    { wch: 30 }, // Nama Siswa
    { wch: 15 }, // Kelas
    { wch: 18 }, // Nilai Vektor S
    { wch: 25 }, // Nilai Vektor V
    { wch: 22 }, // Status Kelayakan
  ];
  worksheet["!cols"] = max_widths;

  XLSX.writeFile(
    workbook,
    `Ranking_Siswa_Terbaik_${tahunAjaran.replace("/", "-")}_Kelas_${kelas}.xlsx`
  );
}
