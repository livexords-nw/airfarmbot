# airfarmbot-termux-edition
**airfarmbot-termux-edition** adalah tool untuk menjalankan bot Airdrop di Termux, dengan pengelolaan sesi otomatis menggunakan `tmux`. Tool ini memastikan bot tetap berjalan, dan jika sesi `tmux` terputus, bot akan membuat sesi baru dan menjalankannya kembali (script harus di run ulang)

## Versi
versi saat ini v 1.11.1

## Update v 1.9.1 -> v 1.11.1
1. Menambahkan 2 Bot baru `babydoge` dan `ageofmars`
2. Menghapus 2 bot di list bot yang bisa dijalankan dengan AIRFARMBOT
 - ChickenPatrol bot ini sudah tidak aktif terbukti dengan akun botnya telah terhapus
 - Tomarket bot saya sarankan tidak menggunakan bot ini karena tomarket sebentar lagi lounching dikhawatirkan akun terkena suspend maupun banned


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

## Bot yang dijalankan AIRFARMBOT

1. Gems Wall
2. Blum 
3. Etherdrop
4. Pumpad
5. Wonton
6. Yescoin
7. Agent301
8. Bird 
9. Fintopia
10. Hi Pin
11. Dawn Validator `[Non Tele]`
12. Get Grass `[Non Tele]`
13. Banana
14. Hashcat
15. Bump
16. Matchquest
17. Fastmin
18. To The Moon
19. cyberfinance
20. babydoge
21. ageofmars

## Kontributor
Script ini dibuat oleh **livexords**