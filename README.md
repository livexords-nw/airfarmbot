---

<h1 align="center">Airfarmbot Termux Edition</h1>  

<p align="center">Automate your airdrop bot in Termux with session management powered by tmux!</p>  

---

## 🚀 **About Airfarmbot Termux Edition**  

**Airfarmbot Termux Edition** is a tool designed to automate airdrop bots in Termux while utilizing `tmux` for session management. This tool ensures that the bot remains active, even if the `tmux` session disconnects.  

The latest version introduces **a more user-friendly experience** and **enhanced logger details** for better monitoring, efficiency, and streamlined bot execution.  

---

## 🌟 **Version v2.14.5**  

### **What's New in This Version**  

1. **Enhanced Logger Details**  
   - Improved activity logs for better clarity on bot processes.  
   - Logs now display updates, command executions, and error handling with detailed information.  

2. **More User-Friendly and Efficient**  
   - Optimized bot operations for easier usage.  
   - Enhanced performance to handle multiple sessions seamlessly.  

---

## ⚙️ **Key Features**  

1. **Auto-Run with Delay**  
   Automatically execute bots with a specified time delay to keep sessions active.  

2. **Automatic Repository Updates**  
   Ensures that the bot's code is always up-to-date using `git pull`.  

3. **Detailed Logging**  
   Provides clear and concise logs for activity tracking, command execution, and error monitoring.  

---

## 📥 **Installation Guide in Termux**  

### 1. **Initial Setup**  
Ensure `tmux`, `git`, and `Rust` are installed:  

```bash
pkg install tmux git rust
```  

### 2. **Clone the Repository**  
Download the project code with the following command:  

```bash
git clone https://github.com/livexords-nw/airfarmbot-termux-edition.git
```  

### 3. **Navigate to the Project Directory**  
Move into the project folder:  

```bash
cd airfarmbot-termux-edition
```  

### 4. **Compile the Project**  
Build the project using:  

```bash
cargo build
```  

### 5. **Run the Bot**  
Execute the bot with:  

```bash
cargo run
```  

---

## 🔧 **Configuration in `config_bot.json`**  

Example configuration:  

```json
{
    "update_repos": true,
    "auto_run": true,
    "delay_minutes": 5
}
```  

- **`update_repos`**: Enables automatic repository updates.  
- **`auto_run`**: Enables auto-run feature.  
- **`delay_minutes`**: Time delay between each auto-run in minutes.  

---

## 📂 **Format for `sessions.txt` File**  

Define bot sessions in `sessions.txt` with the following format:  

```
session_name,directory,command
```  

Example:  
```
bot1,/home/user/bot1,python3 bot.py
bot2,/home/user/bot2,python3 bot.py
```  

---

## 📄 **Bot Activity Logging**  

The logger provides detailed information such as:  
- **[INFO]** Starting repository update...  
- **[SUCCESS]** Repository updated successfully.  
- **[RUNNING]** Executing session `bot1`.  
- **[ERROR]** Failed to execute session `bot2`: *File not found.*  

---

## 🤝 **Contributors**  

This script is developed by **livexords**. For suggestions, questions, or contributions, feel free to reach out:  

<div align="center">
  <a href="https://t.me/livexordsscript" target="_blank">
    <img src="https://img.shields.io/static/v1?message=Livexords&logo=telegram&label=&color=2CA5E0&logoColor=white&labelColor=&style=for-the-badge" height="25" alt="telegram logo" />
  </a>
</div>  

---  