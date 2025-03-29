---

<h1 align="center">Airfarmbot</h1>

<p align="center">Automate your airdrop bots with multi‑platform session management powered by tmux and CMD! 🚀</p>

---

## 🚀 About Airfarmbot

**Airfarmbot** is a tool designed to automate airdrop bots across multiple platforms including Termux, Linux, and Windows. This Node.js‑based version simplifies installation and usage for JavaScript developers while offering robust session management (using tmux on Termux/Linux and CMD on Windows). Enjoy enhanced logging with colors and emojis, improved error handling, and flexible configuration options.

---

## 🌟 Update (v4.1.0)

- **Updated Execution Flow:**  
  The loop now starts from the very beginning with the Auto Query process and continues through the session management update.  
  **Note:** The session management update is applicable only to Linux-based systems.

- **Extended Delay:**  
  The default delay between cycles has been increased to **360 minutes (6 hours)**.

---

## ⚙️ Configuration in `config_bot.json`

The configuration file controls key behaviors of Airfarmbot. Below is a table describing each option:

| **Name**       | **Description**                                                            | **Default Value** |
| -------------- | -------------------------------------------------------------------------- | ----------------- |
| update_repos   | Enables automatic repository updates via `git pull`.                       | `true`            |
| auto_run       | Enables the auto‑run feature to periodically execute bot scripts.          | `true`            |
| delay_minutes  | Time delay (in minutes) between each auto‑run cycle.                       | `360`               |
| auto_query     | Enables the auto query system to process dApp URLs and extract query data. | `true`            |
| divace.termux  | Enables Termux‑specific features (session management via tmux).            | `true`            |
| divace.linux   | Enables Linux‑specific features (session management via tmux).             | `false`           |
| divace.windows | Enables Windows‑specific features (session management via CMD).            | `false`           |

Example configuration:

```json
{
  "update_repos": true,
  "auto_run": true,
  "delay_minutes": 360,
  "auto_query": true,
  "divace": {
    "termux": true,
    "linux": false,
    "windows": false
  }
}
```

---

## 📂 File Formats and Their Functions

### 1. `account.txt` – Your Account Entries 📱

Each line in **account.txt** should follow this format:

```bash
phone, @BotUsername|dapp_url, @BotUsername|dapp_url, ...
```

- **phone**: Your account's phone number.
- **@BotUsername|dapp_url**: (Optional) Define a bot and its corresponding dApp URL.  
  If omitted, the system will automatically apply defaults from **link_bot.txt**.

**Example:**

```bash
+6212345456, @RewardsHQ_bot|https://rewardshq.shards.tech/?startapp=5438209644, @OtherBot|https://otherdapp.example.com
+628987654321
```

**Important:**  
If a bot in **account.txt** is listed with a link that uses only `start` (instead of `startapp`), query extraction might not work properly. In some cases, such as with **animix**, even when using `startapp`, auto query extraction does not work as expected. To ensure reliable query extraction, use the API server link instead.  
**For example:**  
- For **@animix_game_bot**, use:  
  ```
  @animix_game_bot|https://pro-api.animix.tech
  ```  
- For **@otterlootbot**, use:  
  ```
  @otterlootbot|https://otter-game-service.otterloot.io
  ```

---

### 2. `link_bot.txt` – Default Bot Links 🔗

Use **link_bot.txt** to define your default bot links. This file allows you to specify each bot’s dApp URL once, which is then applied to all accounts that do not explicitly list the bot in **account.txt**.

**Format:**  
Each entry should be in the form:

```
@BotUsername|dapp_url
```

You can separate entries by **newlines** or **commas**.

**Examples:**

_Newline-separated:_

```
@animix_game_bot|https://pro-api.animix.tech
@RewardsHQ_bot|https://rewardshq.shards.tech/?startapp=5438209644
@CryptoAirdrop_bot|https://cryptoairdrop.example.com/start?app=9876543210
@AirdropKing_bot|https://king.airdrop.example.com/?startapp=1234567890
```

_Comma-separated:_

```
@animix_game_bot|https://pro-api.animix.tech, @RewardsHQ_bot|https://rewardshq.shards.tech/?startapp=5438209644, @CryptoAirdrop_bot|https://cryptoairdrop.example.com/start?app=9876543210, @AirdropKing_bot|https://king.airdrop.example.com/?startapp=1234567890
```

_Note:_ If an account in **account.txt** already specifies a bot (by username), then the default entry from **link_bot.txt** for that bot will be skipped.

---

### 3. `script_bot.txt` – Output File Mapping 📄

Map each bot username to an output file where query data will be saved.

**Format:**

```bash
@BotUsername,C:\Path\To\OutputFile\query.txt
```

**Example:**

```bash
@RewardsHQ_bot,C:\Users\YourName\Documents\airfarmbot\RewardsHQ\query.txt
```

---

### 4. `sessions.txt` – Session Management Setup 💻

Define your session configurations in **sessions.txt** with the following format:

```
session_name,directory,command
```

**Example:**

```bash
bot1,/home/user/bot1,python3 bot.py
bot2,/home/user/bot2,python3 bot.py
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

Install the required Node module using:

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

## 📄 Bot Activity Logging

Airfarmbot provides detailed logging with clear status messages and emojis:

- **🛑**: Skipping Git updates as per configuration.
- **✅**: Repository updated successfully.
- **🟢**: Session is already running.
- **❌**: Error messages with detailed information.
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

---
