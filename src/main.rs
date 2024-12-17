use chrono::Local;
use serde::Deserialize;
use std::fs::File;
use std::io::{self, BufRead};
use std::path::Path;
use std::process::Command;
use std::env;

#[derive(Deserialize)]
struct Config {
    update_repos: bool,
    auto_run: bool,
    delay_minutes: u64,
}

fn log(message: &str, color: &str) {
    let timestamp = Local::now().format("[%Y-%m-%d %H:%M:%S] ~").to_string();
    println!("\x1b[90m{}\x1b[0m {}{}", timestamp, color, message);
}

fn read_config(file_path: &str) -> Config {
    let file = File::open(file_path).expect("Failed to open config file");
    serde_json::from_reader(file).expect("Failed to parse config file")
}

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

fn read_lines<P>(filename: P) -> io::Result<io::Lines<io::BufReader<File>>>
where
    P: AsRef<Path>,
{
    let file = File::open(filename)?;
    Ok(io::BufReader::new(file).lines())
}

fn auto_git_pull(sessions: &Vec<(String, String, String)>, update_repos: bool) {
    if !update_repos {
        log("[INFO] Skipping Git updates as per configuration.", "\x1b[93m");
        return;
    }

    for (_, directory, _) in sessions {
        log(
            &format!("[INFO] Updating repository in '{}'.", directory),
            "\x1b[94m",
        );

        let pull_output = Command::new("git")
            .arg("-C")
            .arg(directory)
            .arg("pull")
            .output();

        match pull_output {
            Ok(output) => {
                if output.status.success() {
                    log(
                        &format!("[INFO] Git repository in '{}' updated successfully.", directory),
                        "\x1b[92m",
                    );
                    log(
                        &format!("[OUTPUT] {}", String::from_utf8_lossy(&output.stdout)),
                        "\x1b[94m",
                    );
                } else {
                    log(
                        &format!("[ERROR] Failed to update Git repository in '{}'.", directory),
                        "\x1b[91m",
                    );
                    log(
                        &format!("[STDERR] {}", String::from_utf8_lossy(&output.stderr)),
                        "\x1b[94m",
                    );
                }
            }
            Err(e) => log(
                &format!("[ERROR] Error running git pull in '{}': {}", directory, e),
                "\x1b[91m",
            ),
        }
    }
}

fn manage_sessions(sessions: &[(String, String, String)]) {
    for (session_name, directory, command) in sessions {
        if let Err(e) = env::set_current_dir(Path::new(&directory)) {
            log(
                &format!("[ERROR] Failed to change directory to '{}': {}", directory, e),
                "\x1b[91m",
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
                log(
                    &format!("[INFO] Session '{}' is already running.", session_name),
                    "\x1b[92m",
                );
            } else {
                log(
                    &format!("[WARNING] Creating new session for: '{}'", session_name),
                    "\x1b[93m",
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
                            log(
                                &format!(
                                    "[ERROR] Failed to create session '{}': {}",
                                    session_name,
                                    String::from_utf8_lossy(&create_output.stderr)
                                ),
                                "\x1b[91m",
                            );
                        } else {
                            log(
                                &format!("[INFO] Session '{}' created successfully.", session_name),
                                "\x1b[92m",
                            );
                        }
                    }
                    Err(e) => log(
                        &format!("[ERROR] Failed to create session '{}': {}", session_name, e),
                        "\x1b[91m",
                    ),
                }
            }
        }
    }
}

fn main() {
    let _ = Command::new("termux-wake-lock").output();

    let config = read_config("config_bot.json");

    let sessions = read_sessions("sessions.txt");

    auto_git_pull(&sessions, config.update_repos);

    loop {
        if config.auto_run {
            manage_sessions(&sessions);
        } else {
            log("[INFO] Auto-run is disabled. Exiting.", "\x1b[93m");
            break;
        }

        log(
            &format!("[INFO] Sleeping for {} minutes.", config.delay_minutes),
            "\x1b[94m",
        );
        std::thread::sleep(std::time::Duration::from_secs(config.delay_minutes * 60));
    }
}
