---

<h1 align="center">Airfarmbot</h1>

<p align="center">Automate your airdrop bots with multi‑platform session management powered by tmux and CMD!</p>

---

## 🚀 About Airfarmbot

**Airfarmbot** is a tool designed to automate airdrop bots across multiple platforms including Termux, Linux, and Windows. It features built‑in session management using tmux on Termux/Linux and CMD on Windows, ensuring that your bots remain active and up‑to‑date even if sessions disconnect. This version has been updated to run on Node.js, simplifying installation and usage for JavaScript developers. The tool also boasts a user‑friendly interface with enhanced logging (using colors and emojis) and improved error handling.

---

## 🌟 Version v3.0.0

### What's New in This Version

- **Name Change:**  
  The project name has been updated from **Airfarmbot Termux Edition** to **Airfarmbot**.

- **Multi‑Platform Support:**  
  Airfarmbot now supports three platforms:

  - **Termux**
  - **Linux**
  - **Windows** (session management using CMD)

- **Updated Configuration:**  
  The `config_bot.json` file now includes a `divace` object to specify the target platform. **Only one platform should be selected at a time.**

---

## ⚙️ Key Features

- **Auto‑Run with Delay:**  
  Automatically run your bots at specified intervals to keep sessions active.

- **Automatic Repository Updates:**  
  Keeps your bot's code up‑to‑date using `git pull`.

- **Detailed, User‑Friendly Logging:**  
  Color‑coded logs with emojis provide clear and concise status updates and error messages.

- **Telegram Session Management:**  
  Automatically manages Telegram sessions for multiple accounts by storing session files locally.

- **Raw Query Extraction:**  
  Extracts query data from your bot’s dApp URL, with the option to output raw or decoded data.

- **Improved Error Handling:**  
  Suppresses unnecessary errors to maintain clean logs.

- **Multi‑Platform Compatibility:**  
  Supports Termux, Linux, and Windows for session management and bot automation.

---

## ❗ Important Note

For the Auto Query system to work correctly, the dApp URL **must include "startapp"** in its query string.  
For example, the following URL will work:

```
https://t.me/RewardsHQ_bot/RewardsHQ?startapp=5438209644
```

However, a URL like the one below (using only `start`) will **not** be processed correctly:

```
https://t.me/otterlootbot?start=ref_6778b1d10091b8b33ebec9f9
```

---

## 📥 Installation Guide (Node.js)

### 1. Initial Setup

Ensure that you have [Node.js](https://nodejs.org/) and `git` installed.

### 2. Clone the Repository

Download the project code with the following command:

```bash
git clone https://github.com/livexords-nw/airfarmbot.git
```

### 3. Navigate to the Project Directory

Move into the project folder:

```bash
cd airfarmbot
```

### 4. Install Dependencies

Since this project is implemented in Node.js, install the required Node module using:

```bash
npm install telegram
```

_(Only the `telegram` package is required, as other modules are built‑in.)_

### 5. Run the Bot

Execute your script with:

```bash
node main.js
```

---

## 🔧 Configuration in `config_bot.json`

Example configuration:

```json
{
  "update_repos": true,
  "auto_run": true,
  "delay_minutes": 5,
  "auto_query": true,
  "divace": {
    "termux": true,
    "linux": false,
    "windows": false
  }
}
```

- **`update_repos`**: Enables automatic repository updates via `git pull`.
- **`auto_run`**: Enables the auto‑run feature to periodically execute bot scripts.
- **`delay_minutes`**: Time delay (in minutes) between each auto‑run cycle.
- **`auto_query`**: Enables the auto query system to process dApp URLs and extract query data.
- **`divace`**: Specifies the target platform.  
  **Note:** Choose **only one** platform by setting its value to `true` while keeping the others `false`.

### Configuration Table

| **Name**       | **Description**                                                            | **Default Value** |
| -------------- | -------------------------------------------------------------------------- | ----------------- |
| update_repos   | Enables automatic repository updates via `git pull`.                       | `true`            |
| auto_run       | Enables the auto‑run feature to periodically execute bot scripts.          | `true`            |
| delay_minutes  | Time delay (in minutes) between each auto‑run cycle.                       | `5`               |
| auto_query     | Enables the auto query system to process dApp URLs and extract query data. | `true`            |
| divace.termux  | Enables Termux‑specific features (session management via tmux).            | `true`            |
| divace.linux   | Enables Linux‑specific features (session management via tmux).             | `false`           |
| divace.windows | Enables Windows‑specific features (session management via CMD).            | `false`           |

---

## 📂 Format for `sessions.txt`

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

## 📄 Format for `account.txt` and `script_bot.txt`

- **`account.txt`**  
  Each line should follow this format:

  ```bash
  phone, @BotUsername|dapp_url, @BotUsername|dapp_url, ...
  ```

  **Example:**

  ```bash
  +6212345456, @RewardsHQ_bot|https://rewardshq.shards.tech/?startapp=5438209644, @OtherBot|https://otherdapp.example.com
  ```

  _To output the raw query, add `|raw` after the dApp URL:_

  ```bash
  +6285847103494, @RewardsHQ_bot|https://t.me/RewardsHQ_bot/RewardsHQ?startapp=5438209644|raw
  ```

- **`script_bot.txt`**  
  Each line maps a bot username to an output file:

  ```bash
  @BotUsername,C:\Users\YourName\Documents\airfarmbot\RewardsHQ\query.txt
  ```

---

## 📄 Bot Activity Logging

The logger outputs detailed messages such as:

- **🛑**: Skipping Git updates as per configuration.
- **✅**: Repository updated successfully.
- **🟢**: Session is already running.
- **❌**: Errors with descriptive messages.
- **🚀**: Starting the Auto Query System.
- **😴**: Sleeping between auto‑run cycles.

---

## 🤝 Contributors

This project is developed by **livexords**. For suggestions, questions, or contributions, feel free to reach out:

<div align="center">
  <a href="https://t.me/livexordsscript" target="_blank">
    <img src="https://img.shields.io/static/v1?message=Livexords&logo=telegram&label=&color=2CA5E0&logoColor=white&style=for-the-badge" height="25" alt="Telegram" />
  </a>
</div>
