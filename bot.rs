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

// Function to handle session creation and management
fn manage_sessions(sessions: Vec<(String, String, String)>) {
    for (session_name, directory, command) in sessions {
        if let Err(e) = env::set_current_dir(Path::new(&directory)) {
            eprintln!("\x1b[31mFailed to change directory to '{}': {}\x1b[0m", directory, e);
            continue;
        }

        let check_session = Command::new("tmux")
            .arg("has-session")
            .arg("-t")
            .arg(&session_name)
            .output();

        if let Ok(output) = check_session {
            if output.status.success() {
                println!("\x1b[32mSession '{}' exists.\x1b[0m", session_name);
            } else {
                println!("\x1b[33mCreating session for: {}\x1b[0m", session_name);

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
                                "\x1b[31mError creating session '{}': {}\x1b[0m",
                                session_name,
                                String::from_utf8_lossy(&create_output.stderr)
                            );
                        } else {
                            println!("\x1b[32mSession '{}' created successfully.\x1b[0m", session_name);
                        }
                    }
                    Err(e) => eprintln!("\x1b[31mFailed to create session '{}': {}\x1b[0m", session_name, e),
                }
            }
        }
    }

    let ls_output = Command::new("tmux")
        .arg("ls")
        .output()
        .expect("Failed to list tmux sessions");

    println!("\x1b[34mCurrent tmux sessions:\x1b[0m\n{}", String::from_utf8_lossy(&ls_output.stdout));
}

fn main() {
    let _ = Command::new("termux-wake-lock").output();

    // Read sessions from external file
    let sessions = read_sessions("sessions.txt");
    manage_sessions(sessions);
}
