# Rencana Implementasi: Auth (Verifikasi Email) & Payment (Midtrans)

## 📌 Kesimpulan Diskusi Awal
*   **Email Provider:** Kita akan menggunakan standar **SMTP (Nodemailer)**. 
    *   *Perbandingan:* **Resend** sangat disukai *developer* Next.js, tapi untuk daftar *free tier*, Anda diwajibkan memiliki *domain* aktif yang sudah divakidasi DNS-nya untuk mengirim email ke alamat selain email Anda sendiri. **Brevo (dulu Sendinblue)** memberikan 300 email/hari gratis dan bisa mengirim via SMTP biasa tanpa *strict domain verification* di awal rancangan. Karena kita pakai SMTP, Anda bebas menukar *credentials* antara Resend atau Brevo kapan saja.
*   **Verifikasi Email:** Menggunakan *Link Verification* via email.
*   **Akses:** Pengguna belum verifikasi bisa masuk *dashboard*, tapi akan melihat *Alert Notification* dan tombol "Create PRD" di non-aktifkan (API di-*block*).
*   **Payment Gateway:** **Midtrans**. *Catatan Penting*: Midtrans untuk metode pembayaran populer Indonesia (QRIS, VA, E-Wallet) tidak me-mendukung sistem penagihan otomatis (*auto-debit*) seperti kartu kredit di Stripe. Format "Langganan" yang lumrah di Indonesia akan kita buat berupa **Pembelian Paket 30 Hari**. Jika masa 30 hari habis, status kembali menjadi "Free", dan pengguna harus membeli lagi secara manual.
*   **Free Tier Limit:**
    *   Maksimal 1 PRD.
    *   Tidak bisa menggunakan Rekomendasi/Insight AI di step-step PRD.
    *   Tidak ada akses fitur Chat Assistant untuk revisi PRD.

---

## 🛠 Fase 1: Persiapan Database (Schema)
Kita perlu memperbarui `lib/db/schema.ts` untuk merekam data verifikasi dan status langganan pengguna.
1.  Memastikan validitas field `emailVerified` (Biasanya sudah jadi bawaan standar jika pakai Auth.js/NextAuth Adapter).
2.  Membuat tabel / relasi baru: `subscriptions` untuk melacak:
    *   `userId`
    *   `planType` (FREE, PLUS, PRO)
    *   `status` (ACTIVE, EXPIRED)
    *   `midtransOrderId` (Untuk *tracking* ke Midtrans)
    *   `activeUntil` (Tanggal kedaluwarsa akses PLUS/PRO)

## ✉️ Fase 2: Implementasi Verifikasi Email
1.  **Konfigurasi Nodemailer & NextAuth:** Mengatur ulang *provider auth* dengan menambahkan `EmailProvider`.
2.  **Kustomisasi Template Email:** Membuat desain HTML rapi untuk email yang berisi link `[Verify My Account]`.
3.  **UI Dashboard / Banner:** Menambahkan *alert banner* statis di atas menu `/dashboard` (warna kuning/merah) yang menyuruh pengguna mengecek email.
4.  **API Guard:** Menyuntikkan validasi baru di fungsi `verifyUserVerification()` sebelum proses insert tabel ke `prdDocument`.

## 📦 Fase 3: Batasan Akses (Roles & Limits) ✅
1.  ✅ **Validasi Kuota PRD:** Saat *user* klik "Buat PRD Baru", cek jumlah PRD mereka di database. Jika `tier === 'FREE'` dan `PRD count >= 1`, luncurkan *modal/popup upgrade*.
2.  ✅ **Pemblokiran AI Builder/Rekomendasi:** Menyembunyikan/menonaktifkan tombol AI pada komponen "Generate With AI".
3.  ✅ **Pemblokiran Fitur Chat (Revisi PRD):** Mengunci antarmuka sidebar chat jika paket yang diakses tipe "Free". Menampilkan UI *Paywall* transparan di atas komponen obrolan.

## 💳 Fase 4: Integrasi Midtrans ✅
1.  ✅ **Checkout API (`/api/checkout`):** Membuat *endpoint* yang menggunakan Node SDK Midtrans (`midtrans-client`) untuk menghasilkan *Snap Token*.
2.  ✅ **Midtrans Snap UI:** Halaman `/dashboard/pricing` dengan Snap Pop-up saat *user* menekan tombol langganan `PLUS` atau `PRO`.
3.  ✅ **Webhook Handler (`/api/webhooks/midtrans`):** Membuat endpoint publik yang menerima sinyal dari server Midtrans (Contoh: `settlement`, `pending`, `expired`) untuk memperbarui status langganan di database secara *real-time*.

## 🧪 Fase 5: Testing (Sandbox)
1.  Pengujian pembuatan akun murni hingga penerimaan email verifikasi via Brevo/Resend.
2.  Pengujian simulasi pembayaran MIDTRANS menggunakan *simulator endpoint* (Gopay Mock / BCA Klikpay Mock).
3.  Memastikan sistem kembali ke status FREE ketika melewati waktu *Active Until*.
