# Airfarmbot Termux Edition
**Airfarmbot Termux Edition** adalah sebuah tool yang dirancang untuk menjalankan bot airdrop secara otomatis di Termux dengan pengelolaan sesi menggunakan `tmux`. Tool ini memastikan bot tetap aktif, bahkan jika sesi `tmux` terputus. Dalam versi terbaru, tool ini mendukung fitur auto-run untuk memantau dan menjalankan kembali bot secara otomatis tanpa perlu menjalankan ulang script secara manual.

---

## Versi
**Versi Saat Ini**: `v2.14.3`

---

## Perubahan dari v1.14.3 ke v2.14.3
1. **Auto-Run**:  
   - Ditambahkan fitur auto-run yang memungkinkan bot berjalan otomatis setiap beberapa menit sekali sesuai pengaturan.
   - Konfigurasi auto-run dapat dilakukan melalui file `config_bot.json`.

2. **Update Repositori Otomatis**:  
   - Bot kini dapat secara otomatis melakukan `git pull` untuk memperbarui kode repositori sebelum menjalankan sesi.

---

## Fitur Utama
- **Auto-Run dengan Delay**:  
  Bot dapat dijalankan secara otomatis dengan jeda waktu tertentu untuk memastikan sesi tetap aktif tanpa intervensi manual.

- **Update Otomatis untuk Repositori Bot**:  
  Secara otomatis memperbarui kode repositori bot dengan menggunakan `git pull`, memastikan bot berjalan dengan versi terbaru.

---

## Bahasa Pemrograman
Tool ini ditulis menggunakan bahasa **Rust**, yang dikenal untuk performanya yang cepat dan efisien.

---

## Cara Install di Termux

Ikuti langkah-langkah berikut untuk menginstal dan menjalankan **Airfarmbot Termux Edition**:

### 1. Persiapan Awal
Pastikan Anda telah menginstal **tmux**, **git**, dan **Rust** di Termux:
```bash
pkg install tmux git rust
```

### 2. Clone Repositori
Unduh kode sumber dengan perintah:
```bash
git clone https://github.com/livexords-nw/airfarmbot-termux-edition.git
```

### 3. Masuk ke Direktori Proyek
Pindah ke direktori proyek:
```bash
cd airfarmbot-termux-edition
```

### 4. Compile Proyeck
Gunakan Command ini untuk mengcompile proyek
```bash
cargo build
```

### 4. Jalankan Bot
Jalankan bot dengan perintah:
```bash
cargo run 
```

---

## Konfigurasi
Semua pengaturan bot dapat dilakukan melalui file `config_bot.json`. Berikut adalah contoh isi file konfigurasi:

```json
{
    "update_repos": true,
    "auto_run": true,
    "delay_minutes": 5
}
```

- **`update_repos`**:  
  Jika disetel ke `true`, bot akan secara otomatis melakukan pembaruan kode repositori sebelum menjalankan sesi.

- **`auto_run`**:  
  Mengaktifkan fitur auto-run. Jika diatur ke `true`, bot akan terus memantau dan menjalankan sesi sesuai interval yang ditentukan.

- **`delay_minutes`**:  
  Mengatur interval waktu dalam menit untuk fitur auto-run.

---

## Contoh `sessions.txt`
File `sessions.txt` digunakan untuk mendefinisikan daftar bot yang akan dijalankan. Format file:
```
nama_sesi,direktori,perintah
```

Contoh:
```
bot1,/home/user/bot1,python3 bot.py
bot2,/home/user/bot2,python3 bot.py
```

---

## Kontributor
Script ini dikembangkan oleh **livexords**.  
- Telegram: [@livexordsscript](https://t.me/livexordsscript)

---