use chrono::Local;
use serde::Deserialize;
use std::fs::File;
use std::io::{self, BufRead, Write};
use std::path::Path;
use std::process::Command;
use std::{env, thread, time};

// Struct untuk membaca file konfigurasi
#[derive(Deserialize)]
struct Config {
    update_repos: bool,
    auto_run: bool,
    delay_minutes: u64,
}

// Fungsi untuk membaca konfigurasi dari file JSON
fn read_config(file_path: &str) -> Config {
    let file = File::open(file_path).expect("Failed to open config file");
    serde_json::from_reader(file).expect("Failed to parse config file")
}

// Fungsi untuk membaca file sessions.txt
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

// Helper untuk membaca baris dari file
fn read_lines<P>(filename: P) -> io::Result<io::Lines<io::BufReader<File>>>
where
    P: AsRef<Path>,
{
    let file = File::open(filename)?;
    Ok(io::BufReader::new(file).lines())
}

// Fungsi untuk menjalankan auto git pull
fn auto_git_pull(sessions: &[(String, String, String)]) {
    for (_, folder, _) in sessions {
        if let Err(e) = env::set_current_dir(folder) {
            eprintln!(
                "{} \x1b[91m[ERROR]\x1b[0m Failed to change directory to '{}': {}",
                get_timestamp(),
                folder,
                e
            );
            continue;
        }

        let pull_output = Command::new("git").arg("pull").output();

        match pull_output {
            Ok(output) => {
                if !output.stderr.is_empty() {
                    eprintln!(
                        "{} \x1b[91m[ERROR]\x1b[0m Failed to git pull in '{}': {}",
                        get_timestamp(),
                        folder,
                        String::from_utf8_lossy(&output.stderr)
                    );
                } else {
                    println!(
                        "{} \x1b[92m[INFO]\x1b[0m Successfully updated repo in '{}'.",
                        get_timestamp(),
                        folder
                    );
                }
            }
            Err(e) => eprintln!(
                "{} \x1b[91m[ERROR]\x1b[0m Failed to execute git pull in '{}': {}",
                get_timestamp(),
                folder,
                e
            ),
        }
    }
}

// Fungsi untuk mendapatkan timestamp saat ini
fn get_timestamp() -> String {
    Local::now().format("%Y-%m-%d %H:%M:%S").to_string()
}

// Fungsi untuk mengelola sesi bot
fn manage_sessions(sessions: &[(String, String, String)]) {
    for (session_name, directory, command) in sessions {
        if let Err(e) = env::set_current_dir(Path::new(&directory)) {
            eprintln!(
                "{} \x1b[91m[ERROR]\x1b[0m Failed to change directory to '{}': {}",
                get_timestamp(),
                directory,
                e
            );
            continue;
        }

        let check_session = Command::new("tmux")
            .arg("has-session")
            .arg("-t")
            .arg(session_name)
            .output();

        if let Ok(output) = check_session {
            if output.status.success() {
                println!(
                    "{} \x1b[92m[INFO]\x1b[0m Session '{}' is already running.",
                    get_timestamp(),
                    session_name
                );
            } else {
                println!(
                    "{} \x1b[93m[WARNING]\x1b[0m Creating new session for: '{}'",
                    get_timestamp(),
                    session_name
                );

                let create_session = Command::new("tmux")
                    .arg("new-session")
                    .arg("-d")
                    .arg("-s")
                    .arg(session_name)
                    .arg("sh")
                    .arg("-c")
                    .arg(command)
                    .output();

                match create_session {
                    Ok(create_output) => {
                        if !create_output.stderr.is_empty() {
                            eprintln!(
                                "{} \x1b[91m[ERROR]\x1b[0m Failed to create session '{}': {}",
                                get_timestamp(),
                                session_name,
                                String::from_utf8_lossy(&create_output.stderr)
                            );
                        } else {
                            println!(
                                "{} \x1b[92m[INFO]\x1b[0m Session '{}' created successfully.",
                                get_timestamp(),
                                session_name
                            );
                        }
                    }
                    Err(e) => eprintln!(
                        "{} \x1b[91m[ERROR]\x1b[0m Failed to create session '{}': {}",
                        get_timestamp(),
                        session_name,
                        e
                    ),
                }
            }
        }
    }
}

fn main() {
    let config = read_config("config_bot.json");
    let sessions = read_sessions("sessions.txt");

    if config.update_repos {
        println!("{} \x1b[94m[INFO]\x1b[0m Running auto git pull...", get_timestamp());
        auto_git_pull(&sessions);
    }

    loop {
        println!("{} \x1b[94m[INFO]\x1b[0m Managing bot sessions...", get_timestamp());
        manage_sessions(&sessions);

        if !config.auto_run {
            break;
        }

        let delay = time::Duration::from_secs(config.delay_minutes * 60);
        println!(
            "{} \x1b[94m[INFO]\x1b[0m Waiting for {} minutes before next run...",
            get_timestamp(),
            config.delay_minutes
        );
        thread::sleep(delay);
    }
}
