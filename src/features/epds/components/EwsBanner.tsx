import { FiAlertTriangle } from 'react-icons/fi';

export function EwsBanner() {
  return (
    <div role="alert" className="rounded-2xl border-2 border-red-300 bg-red-50 text-red-800 p-4 flex gap-3">
      <FiAlertTriangle className="size-6 shrink-0 mt-0.5" />
      <div>
        <p className="font-semibold">Peringatan Dini (Early Warning System)</p>
        <p className="text-sm">
          Jawaban menunjukkan risiko tinggi atau indikasi menyakiti diri sendiri. Setelah disimpan,
          alert otomatis dikirim ke Dokter/Psikolog dan rujukan disarankan. Jangan tinggalkan pasien
          sendirian bila ada krisis akut.
        </p>
      </div>
    </div>
  );
}
