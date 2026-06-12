import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export function exportScreeningPdf(opts: {
  title: string;
  period: string;
  puskesmas: string;
  summary: { total: number; rendah: number; sedang: number; tinggi: number };
  rows: Array<Record<string, unknown>>;
}) {
  const doc = new jsPDF();
  doc.setFontSize(14);
  doc.text('BALE CERI_BU — ' + opts.title, 14, 16);
  doc.setFontSize(10);
  doc.text(`Puskesmas: ${opts.puskesmas}`, 14, 24);
  doc.text(`Periode: ${opts.period}`, 14, 30);
  doc.text(
    `Total: ${opts.summary.total} | Rendah: ${opts.summary.rendah} | ` +
      `Sedang: ${opts.summary.sedang} | Tinggi: ${opts.summary.tinggi}`,
    14,
    36,
  );

  autoTable(doc, {
    startY: 42,
    head: [['Tanggal', 'No. RM', 'Nama', 'Fase', 'Skor', 'Risiko']],
    body: opts.rows.map((r: any) => [
      new Date(r.created_at).toLocaleDateString('id-ID'),
      r.patients?.no_rm ?? '-',
      r.patients?.full_name ?? '-',
      r.phase,
      r.total_score,
      r.risk_level,
    ]),
    headStyles: { fillColor: [5, 150, 105] },
    styles: { fontSize: 8 },
  });
  doc.save(`laporan-skrining-${Date.now()}.pdf`);
}
