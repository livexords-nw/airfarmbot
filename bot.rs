use std::process::Command;
use std::env;
use std::path::Path;

fn main() {
    let _ = Command::new("termux-wake-lock").output();

    let sessions = vec![
        ("agent301-claimer", "/data/data/com.termux/files/home/agent301-claimer", "python bot.py"),
        ("BirdxBOT", "/data/data/com.termux/files/home/BirdxBOT", "python bot.py"),
        ("BlumBOT", "/data/data/com.termux/files/home/BlumBOT", "python blum.py"),
        ("ChickenPatrolBOT", "/data/data/com.termux/files/home/ChickenPatrolBOT", "python bot.py"),
        ("Dawn-Validator-bot", "/data/data/com.termux/files/home/Dawn-Validator-bot", "node index.js"),
        ("EtherdropBOT", "/data/data/com.termux/files/home/EtherdropBOT", "python bot.py"),
        ("FintopioBot", "/data/data/com.termux/files/home/FintopioBot", "python fintopio.py"),
        ("GemswallBOT", "/data/data/com.termux/files/home/GemswallBOT", "python bot.py"),
        ("pin-ai", "/data/data/com.termux/files/home/pin-ai", "node index.js"),
        ("PumpadBOT", "/data/data/com.termux/files/home/PumpadBOT", "python bot.py"),
        // ("TomarketBot", "/data/data/com.termux/files/home/TomarketBot", "python main.py"),
        ("WontonBOT", "/data/data/com.termux/files/home/WontonBOT", "python bot.py"),
        ("YescoinBOT", "/data/data/com.termux/files/home/YescoinBOT", "python bot.py"),
        ("grass-bot", "/data/data/com.termux/files/home/grass-bot", "python main.py"),
        ("BananaBOT", "/data/data/com.termux/files/home/BananaBOT", "python main.py"),
        ("hashcats-claimer", "/data/data/com.termux/files/home/hashcats-claimer", "python bot-proxy.py"),
        ("bump-claimer", "/data/data/com.termux/files/home/bump-claimer", "python bot-proxy.txt"),
        ("matchquest-claimer", "/data/data/com.termux/files/home/matchquest-claimer", "python bot-proxy.py"),
        ("FastmintBOT", "/data/data/com.termux/files/home/FastmintBOT", "python bot.py"),
        ("tothemoon", "/data/data/com.termux/files/home/tothemoon", "python bot.py")
    ];

    for (session_name, directory, command) in sessions {
        if let Err(e) = env::set_current_dir(Path::new(directory)) {
            eprintln!("Failed to change directory to '{}': {}", directory, e);
            continue;
        }

        let check_session = Command::new("tmux")
            .arg("has-session")
            .arg("-t")
            .arg(session_name)
            .output();

        if let Ok(output) = check_session {
            if output.status.success() {
                println!("Session '{}' exists.", session_name);
            } else {
                eprintln!(
                    "Error checking session '{}': {}",
                    session_name,
                    String::from_utf8_lossy(&output.stderr)
                );
                println!("Creating session for: {}", session_name);

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
                                "Error creating session '{}': {}",
                                session_name,
                                String::from_utf8_lossy(&create_output.stderr)
                            );
                        } else {
                            println!("Session '{}' created successfully.", session_name);
                        }
                    }
                    Err(e) => eprintln!("Failed to create session '{}': {}", session_name, e),
                }
            }
        }
    }

    let ls_output = Command::new("tmux")
        .arg("ls")
        .output()
        .expect("Failed to list tmux sessions");

    println!("Current tmux sessions:\n{}", String::from_utf8_lossy(&ls_output.stdout));
}
