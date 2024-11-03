# airfarmbot-termux-edition
**airfarmbot-termux-edition** adalah tool untuk menjalankan bot Airdrop di Termux, dengan pengelolaan sesi otomatis menggunakan `tmux`. Tool ini memastikan bot tetap berjalan, dan jika sesi `tmux` terputus, bot akan membuat sesi baru dan menjalankannya kembali (script harus di run ulang)

## Versi
versi saat ini v 1.8.1

## Update v 1.6.1 -> v 1.8.1
1. Sekarang kamu bisa menambahkan path jauh lebih mudah dengan sessions.txt
    **Example**
    ```bash
    agent301-claimer,/data/data/com.termux/files/home/agent301-claimer,python bot.py,
    BirdxBOT,/data/data/com.termux/files/home/BirdxBOT,python bot.py,
    BlumBOT,/data/data/com.termux/files/home/BlumBOT,python blum.py,
2. Penambahan warna untuk setiap respon

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
2. Chicken Patrol
3. Tomarket
4. Blum 
5. Etherdrop
6. Pumpad
7. Wonton
8. Yescoin
9. Agent301
10. Bird 
11. Fintopia
12. Hi Pin
13. Dawn Validator `[Non Tele]`
14. Get Grass `[Non Tele]`
15. Banana
16. Hashcat
17. Bump
18. Matchquest
19. Fastmin
20. To The Moon

## Kontributor
Script ini dibuat oleh **livexords**