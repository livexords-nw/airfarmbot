use chrono::Local;
use serde::Deserialize;
use std::{env, fs::File, io::{self, BufRead}, path::Path, process::Command, thread, time};

// Struct untuk membaca config_bot.json
#[derive(Deserialize)]
struct Config {
    update_repos: bool,
    auto_run: bool,
    delay_minutes: u64,
}

// Function untuk membaca file JSON konfigurasi
fn read_config(file_path: &str) -> Config {
    let config_data = std::fs::read_to_string(file_path)
        .unwrap_or_else(|_| panic!("Failed to read {}", file_path));
    serde_json::from_str(&config_data).expect("Failed to parse config JSON")
}

// Function untuk membaca sesi dari sessions.txt
fn read_sessions(file_path: &str) -> Vec<(String, String, String)> {
    let mut sessions = Vec::new();
    if let Ok(lines) = read_lines(file_path) {
        for line in lines {
            if let Ok(record) = line {
                let parts: Vec<&str> = record.split(',').map(|s| s.trim()).collect();
                if parts.len() == 3 {
                    sessions.push((
                        parts[0].to_string(),
                        parts[1].to_string(),
                        parts[2].to_string(),
                    ));
                }
            }
        }
    }
    sessions
}

// Helper function untuk membaca baris dari file
fn read_lines<P>(filename: P) -> io::Result<io::Lines<io::BufReader<File>>>
where
    P: AsRef<Path>,
{
    let file = File::open(filename)?;
    Ok(io::BufReader::new(file).lines())
}

// Function untuk memperbarui repositori
fn update_repository(directory: &str) {
    if let Err(e) = env::set_current_dir(Path::new(directory)) {
        eprintln!(
            "{} [ERROR] Failed to change directory to '{}': {}",
            get_timestamp(),
            directory,
            e
        );
        return;
    }

    let git_pull = Command::new("git").arg("pull").output();

    if let Ok(output) = git_pull {
        if !output.stderr.is_empty() {
            eprintln!(
                "{} [ERROR] Failed to update '{}': {}",
                get_timestamp(),
                directory,
                String::from_utf8_lossy(&output.stderr)
            );
        }
    }
}

// Function untuk membuat sesi baru jika tidak ada
fn manage_sessions(sessions: Vec<(String, String, String)>, update_repos: bool) {
    for (session_name, directory, command) in &sessions {
        if update_repos {
            update_repository(directory);
        }

        if let Err(_) = Command::new("tmux").arg("has-session").arg("-t").arg(&session_name).output() {
            // Membuat sesi baru
            let _ = Command::new("tmux")
                .arg("new-session")
                .arg("-d")
                .arg("-s")
                .arg(&session_name)
                .arg("sh")
                .arg("-c")
                .arg(&command)
                .output();
        }
    }
}

// Function untuk menampilkan sesi dalam format minimalis
fn list_sessions() {
    if let Ok(output) = Command::new("tmux").arg("ls").output() {
        let session_list = String::from_utf8_lossy(&output.stdout);
        for (i, line) in session_list.lines().enumerate() {
            println!("{} {}", i + 1, line);
        }
    } else {
        println!("No active tmux sessions found.");
    }
}

// Function untuk mendapatkan timestamp saat ini
fn get_timestamp() -> String {
    Local::now().format("%Y-%m-%d %H:%M:%S").to_string()
}

fn main() {
    let _ = Command::new("termux-wake-lock").output();

    // Membaca konfigurasi dari config_bot.json
    let config = read_config("config_bot.json");

    // Membaca sesi dari sessions.txt
    let sessions = read_sessions("sessions.txt");

    // Fungsi auto-run
    if config.auto_run {
        loop {
            manage_sessions(sessions.clone(), config.update_repos);
            list_sessions();
            thread::sleep(time::Duration::from_secs(config.delay_minutes * 60));
        }
    } else {
        manage_sessions(sessions, config.update_repos);
        list_sessions();
    }
}
