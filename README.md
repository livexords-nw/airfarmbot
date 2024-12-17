---

<h1 align="center">Airfarmbot Termux Edition</h1>  

<p align="center">Otomatisasi bot airdrop di Termux dengan sesi yang dikelola menggunakan tmux!</p>  

---

## 🚀 **Tentang Airfarmbot Termux Edition**

**Airfarmbot Termux Edition** adalah tool yang dirancang untuk menjalankan bot airdrop secara otomatis di Termux dengan pengelolaan sesi menggunakan `tmux`. Tool ini memastikan bot tetap aktif, bahkan jika sesi `tmux` terputus.  

Fitur terbaru menambahkan **logger yang lebih jelas**, memungkinkan Anda memantau proses, update repositori, dan eksekusi perintah secara lebih detail.  

---

## 🌟 **Versi v2.14.4**  

### **Pembaruan pada Versi Ini**:  

1. **Logger Lebih Jelas**:  
   - Ditambahkan peningkatan pada logger untuk menampilkan detail aktivitas bot.  
   - Proses update, eksekusi perintah, dan error log kini tampil lebih informatif.  

---

## ⚙️ **Fitur Utama**  

1. **Auto-Run dengan Delay**  
   Bot dapat dijalankan otomatis dengan jeda waktu tertentu untuk memastikan sesi tetap aktif.  

2. **Update Repositori Otomatis**  
   Secara otomatis memperbarui kode repositori bot menggunakan `git pull`.  

3. **Logger yang Lebih Informatif**  
   Log kini lebih mudah dipantau dengan detail aktivitas, eksekusi perintah, dan error handling.  

---

## 📥 **Cara Install di Termux**  

### 1. **Persiapan Awal**  
Pastikan **tmux**, **git**, dan **Rust** sudah terinstal:  

```bash
pkg install tmux git rust
```  

### 2. **Clone Repository**  
Unduh kode proyek dengan perintah:  

```bash
git clone https://github.com/livexords-nw/airfarmbot-termux-edition.git
```  

### 3. **Masuk ke Direktori Proyek**  
Pindah ke direktori proyek:  

```bash
cd airfarmbot-termux-edition
```  

### 4. **Compile Proyek**  
Gunakan perintah berikut untuk meng-compile proyek:  

```bash
cargo build
```  

### 5. **Jalankan Bot**  
Eksekusi bot dengan perintah:  

```bash
cargo run
```  

---

## 🔧 **Konfigurasi di `config_bot.json`**  

Berikut contoh konfigurasi bot:  

```json
{
    "update_repos": true,
    "auto_run": true,
    "delay_minutes": 5
}
```  

- **`update_repos`**: Memperbarui repositori bot secara otomatis.  
- **`auto_run`**: Mengaktifkan fitur auto-run.  
- **`delay_minutes`**: Jeda waktu antar eksekusi auto-run dalam menit.  

---

## 📂 **Format File `sessions.txt`**  

`Sessions.txt` digunakan untuk mendefinisikan daftar sesi bot:  

```
nama_sesi,direktori,perintah
```  

Contoh:  
```
bot1,/home/user/bot1,python3 bot.py
bot2,/home/user/bot2,python3 bot.py
```  

---

## 📄 **Log Aktivitas Bot**  

Logger akan menampilkan aktivitas seperti berikut:  
- **[INFO]** Memulai update repositori...  
- **[SUCCESS]** Repositori berhasil diperbarui.  
- **[RUNNING]** Menjalankan sesi `bot1`.  
- **[ERROR]** Gagal menjalankan sesi `bot2`: *File tidak ditemukan.*  

---

## 🤝 **Kontributor**  

Script ini dikembangkan oleh **livexords**.  
- [![Telegram](https://img.shields.io/badge/Telegram-2CA5E0?style=flat&logo=telegram&logoColor=white)](https://t.me/livexordsscript)  

---