# airfarmbot-termux-edition
**airfarmbot-termux-edition** adalah tool untuk menjalankan bot Telegram di Termux, dengan pengelolaan sesi otomatis menggunakan `tmux`. Tool ini memastikan bot tetap berjalan, dan jika sesi `tmux` terputus, bot akan membuat sesi baru dan menjalankannya kembali.

## Fitur
- **Pengecekan Sesi Otomatis**: Mendukung deteksi otomatis apakah sesi `tmux` bot sedang aktif atau tidak. Jika tidak aktif, bot akan membuat sesi baru dan menjalankannya.
  
## Bahasa Pemrograman
Tool ini ditulis menggunakan bahasa **Rust**.

## Cara Install di Termux

1. Clone repositori:
   ```bash
   git clone https://github.com/livexords-nw/airfarmbot-termux-edition.git
2. Masuk kedalam direktori proyek:
    ```bash
    cd airfarmbot-termux-edition
3. Kompilasi file rust
    ```bash
    rustc bot.rs -o botstart
4. Jalankan bot:
    ```bash
    ./botstart

## Kontributor
Script ini dibuat oleh **livexords**