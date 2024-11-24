use chrono::Local;
use std::fs::File;
use std::io::{self, BufRead};
use std::path::Path;
use std::process::Command;
use std::env;

// Function to read sessions from sessions.txt
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

// Helper function to read lines from a file
fn read_lines<P>(filename: P) -> io::Result<io::Lines<io::BufReader<File>>>
where
    P: AsRef<Path>,
{
    let file = File::open(filename)?;
    Ok(io::BufReader::new(file).lines())
}

// Function to get current timestamp in the format of "YYYY-MM-DD HH:MM:SS"
fn get_timestamp() -> String {
    Local::now().format("%Y-%m-%d %H:%M:%S").to_string()
}

// Function to handle session creation and management
fn manage_sessions(sessions: Vec<(String, String, String)>) {
    for (session_name, directory, command) in &sessions {
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
            .arg(&session_name)
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
                    .arg(&session_name)
                    .arg("sh")
                    .arg("-c")
                    .arg(&command)
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

    let ls_output = Command::new("tmux")
        .arg("ls")
        .output()
        .expect("Failed to list tmux sessions");

    let session_list = String::from_utf8_lossy(&ls_output.stdout);

    // Parse the tmux ls output, add numbers, titles, and dividers
    let mut numbered_sessions = String::new();
    let mut count = 1;
    for session in session_list.lines() {
        numbered_sessions.push_str(&format!(
            "\x1b[36m#{} \x1b[97mSession\x1b[0m: \x1b[96m{}\x1b[0m\n",
            count, session
        ));
        numbered_sessions.push_str("\x1b[90m────────────────────────────────────────\x1b[0m\n");
        count += 1;
    }

    println!("\x1b[94m═══════════════════════════════════════════════\x1b[0m");
    println!("\x1b[94m           Active tmux Sessions \x1b[0m");
    println!("\x1b[94m═══════════════════════════════════════════════\x1b[0m\n{}", numbered_sessions);
}

fn main() {
    let _ = Command::new("termux-wake-lock").output();

    // Read sessions from external file
    let sessions = read_sessions("sessions.txt");
    manage_sessions(sessions);
}