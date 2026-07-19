import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

type RankingData = {
  ranking: number;
  nis: string;
  nama: string;
  kelas: string;
  nilaiS: number;
  nilaiV: number;
  status: string;
};

/**
 * Mengambil gambar dari URL dan mengubahnya ke base64 data URL
 */
function loadImageAsBase64(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Cannot get canvas context"));
        return;
      }
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = reject;
    img.src = url;
  });
}

export async function exportRankingPDF(
  data: RankingData[],
  tahunAjaran: string,
  kelas: string
) {
  const doc = new jsPDF();
  const title = "LAPORAN HASIL PERANKINGAN SISWA TERBAIK";
  const foundationName = "YAYASAN PENDIDIKAN AL-AMIEN";
  const schoolName = "SEKOLAH MENENGAH KEJURUAN (SMK) KARYA GUNA BHAKTI 2";
  const schoolDetails = "Teknik Komputer dan Jaringan | Manajemen Perkantoran | Akuntansi";
  const nssNpsn = "NSS. 347028904072          NPSN. 20223112";
  const statusAkreditasi = "STATUS TERAKREDITASI A";
  const schoolAddress1 = "Kampus A: Jl. Anggrek 1 RT. 05/016 Duren Jaya Kota Bekasi Telp. (021) 88352551";
  const schoolAddress2 = "Kampus B: Jl. H. Djole RT. 05/07 Duren Jaya Kota Bekasi Telp. 081211925018";
  const emailWebsite = "Email: info@smkkgb2.sch.id          Website: www.smkkgb2.sch.id";

  // Load logo
  let logoBase64: string | null = null;
  try {
    logoBase64 = await loadImageAsBase64("/logo-smk.png");
  } catch {
    console.warn("Logo tidak dapat dimuat, PDF akan dicetak tanpa logo.");
  }

  // === Kop Surat / Letterhead ===
  const kopStartY = 10;
  const logoSize = 22;

  // Logo di kiri
  if (logoBase64) {
    doc.addImage(logoBase64, "PNG", 15, kopStartY, logoSize, logoSize);
  }

  // Informasi sekolah (center, setelah logo)
  const textCenterX = logoBase64 ? 115 : 105;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text(foundationName, textCenterX, kopStartY + 3, { align: "center" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text(schoolName, textCenterX, kopStartY + 8, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.text(schoolDetails, textCenterX, kopStartY + 12, { align: "center" });

  doc.setFontSize(7);
  doc.text(nssNpsn, textCenterX, kopStartY + 16, { align: "center" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.text(statusAkreditasi, textCenterX, kopStartY + 20, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.text(schoolAddress1, textCenterX, kopStartY + 24, { align: "center" });
  doc.text(schoolAddress2, textCenterX, kopStartY + 27.5, { align: "center" });

  doc.setFontSize(6.5);
  doc.text(emailWebsite, textCenterX, kopStartY + 31, { align: "center" });

  // Garis pemisah (double line seperti di laporan)
  const lineY = kopStartY + 34;
  doc.setLineWidth(0.5);
  doc.line(15, lineY, 195, lineY);
  doc.setLineWidth(1.2);
  doc.line(15, lineY + 1.2, 195, lineY + 1.2);

  // === Document Title ===
  const titleY = lineY + 10;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text(title, 105, titleY, { align: "center" });
  doc.setFontSize(9);
  doc.text(`Metode SPK: Weighted Product (WP)`, 105, titleY + 5, { align: "center" });

  // === Metadata ===
  const metaY = titleY + 14;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(`Kelas: ${kelas === "all" ? "Semua Kelas" : kelas}`, 15, metaY);
  doc.text(`Tanggal Cetak: ${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}`, 195, metaY, { align: "right" });

  // Garis dashed di bawah metadata
  doc.setLineDashPattern([2, 1], 0);
  doc.setLineWidth(0.3);
  doc.line(15, metaY + 3, 195, metaY + 3);
  doc.setLineDashPattern([], 0);

  // === Table ===
  const tableColumn = ["Peringkat", "NIS", "Nama Siswa", "Kelas", "Vektor S", "Vektor V", "Status"];
  const tableRows = data.map((item) => [
    item.ranking.toString(),
    item.nis,
    item.nama,
    item.kelas,
    item.nilaiS.toFixed(2),
    item.nilaiV.toFixed(4),
    item.status,
  ]);

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: metaY + 7,
    theme: "grid",
    headStyles: {
      fillColor: [240, 240, 240],
      textColor: [0, 0, 0],
      fontStyle: "bold",
      lineColor: [180, 180, 180],
      lineWidth: 0.3,
    },
    bodyStyles: {
      lineColor: [180, 180, 180],
      lineWidth: 0.3,
      textColor: [0, 0, 0],
    },
    styles: { fontSize: 8, cellPadding: 2.5 },
    columnStyles: {
      0: { halign: "center", cellWidth: 18, fontStyle: "bold" },
      1: { fontStyle: "bold", cellWidth: 24 },
      4: { halign: "right", fontStyle: "normal" },
      5: { halign: "right", fontStyle: "bold" },
      6: { halign: "center" },
    },
    alternateRowStyles: {
      fillColor: [250, 250, 250],
    },
  });

  // === Signature / Tanda Tangan Kepala Sekolah ===
  const finalY = (doc as any).lastAutoTable.finalY || 200;
  const signatureY = finalY + 15;

  // Cek apakah tanda tangan muat di halaman saat ini
  if (signatureY + 45 > 280) {
    // Pindah ke halaman baru jika tidak muat
    doc.addPage();
    const newPageSignatureY = 30;
    drawSignature(doc, newPageSignatureY);
  } else {
    drawSignature(doc, signatureY);
  }

  doc.save(`Laporan_Ranking_WP_${tahunAjaran.replace("/", "-")}_Kelas_${kelas}.pdf`);
}

/**
 * Menggambar tanda tangan Kepala Sekolah
 */
function drawSignature(doc: jsPDF, y: number) {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);

  const xPos = 140;

  doc.text(
    "Bekasi, " +
      new Date().toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
    xPos,
    y
  );

  doc.setFont("helvetica", "bold");
  doc.text("Kepala Sekolah,", xPos, y + 5);

  doc.setFont("helvetica", "normal");
  doc.text("SMK Karya Guna Bhakti 2", xPos, y + 10);

  // Spasi untuk tanda tangan
  // (kosong 25mm untuk area tanda tangan)

  // Nama Kepala Sekolah dengan garis bawah
  doc.setFont("helvetica", "bold");
  const namaKepsek = "Yulia Venny Susanti, S.E., M.M.";
  doc.text(namaKepsek, xPos, y + 35);

  // Garis bawah di bawah nama
  const namaWidth = doc.getTextWidth(namaKepsek);
  doc.setLineWidth(0.3);
  doc.line(xPos, y + 36, xPos + namaWidth, y + 36);
}
