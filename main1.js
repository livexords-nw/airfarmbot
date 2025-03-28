/**
 * Final User-Friendly Node.js Script for Auto Query, Repository, and TMUX Management
 * APP_ID and APP_HASH are provided directly (plain text).
 */

"use strict";

// Global error handlers to suppress TIMEOUT errors
process.on("uncaughtException", (err) => {
  if (err && err.message && err.message.includes("TIMEOUT")) {
    // Ignore TIMEOUT errors
  } else {
    console.error("Uncaught Exception:", err);
  }
});

process.on("unhandledRejection", (reason, promise) => {
  if (reason && reason.message && reason.message.includes("TIMEOUT")) {
    // Ignore TIMEOUT errors
  } else {
    console.error("Unhandled Rejection:", reason);
  }
});

const fs = require("fs");
const path = require("path");
const readline = require("readline");
const { exec } = require("child_process");
const { promisify } = require("util");
const execPromise = promisify(exec);

const { TelegramClient, Api } = require("telegram");
const { StringSession } = require("telegram/sessions");

// =================== APP CREDENTIALS ===================
const APP_ID = 17709774; // Your APP_ID
const APP_HASH = "ecb718e2f356a062fce2bbd7af4ac76b"; // Your APP_HASH

// =================== CONFIG & LOGGING ===================
function log(message, color = "") {
  const timestamp = new Date().toISOString().replace("T", " ~ ").split(".")[0];
  console.log(`\x1b[90m[${timestamp}]\x1b[0m ${color}${message}\x1b[0m`);
}

function readConfig(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

// =================== FILE READING UTILS ===================
function readLines(filePath) {
  return fs
    .readFileSync(filePath, "utf8")
    .split("\n")
    .filter((line) => line.trim() !== "");
}

// =================== REPOSITORY & TMUX SESSION MANAGEMENT ===================
function readSessions(filePath) {
  const sessions = [];
  for (const line of readLines(filePath)) {
    const parts = line.split(",").map((p) => p.trim());
    if (parts.length === 3) {
      sessions.push({
        sessionName: parts[0],
        directory: parts[1],
        command: parts[2],
      });
    }
  }
  return sessions;
}

async function autoGitPull(sessions, updateRepos) {
  if (!updateRepos) {
    log("🛑 Skipping Git updates as per configuration.", "\x1b[93m");
    return;
  }
  for (const { directory } of sessions) {
    log(`📂 Updating repository in '${directory}'.`, "\x1b[94m");
    try {
      const { stdout, stderr } = await execPromise(
        `git -C "${directory}" pull`
      );
      if (stderr && !stderr.includes("TIMEOUT")) {
        log(
          `❌ Failed to update repository in '${directory}': ${stderr}`,
          "\x1b[91m"
        );
      } else {
        log(
          `✅ Repository in '${directory}' updated successfully.`,
          "\x1b[92m"
        );
        log(`📤 ${stdout}`, "\x1b[94m");
      }
    } catch (err) {
      if (!err.message.includes("TIMEOUT")) {
        log(`❌ Error running git pull in '${directory}': ${err}`, "\x1b[91m");
      }
    }
  }
}

async function manageSessions(sessions) {
  for (const { sessionName, directory, command } of sessions) {
    // Change to the specified directory.
    try {
      process.chdir(directory);
    } catch (e) {
      log(`❌ Failed to change directory to '${directory}': ${e}`, "\x1b[91m");
      continue;
    }

    // Check if the tmux session already exists.
    try {
      await execPromise(`tmux has-session -t ${sessionName}`);
      log(`🟢 Session '${sessionName}' is already running.`, "\x1b[92m");
    } catch (err) {
      log(`🟡 Starting session: '${sessionName}'`, "\x1b[93m");
      // If the session doesn't exist, create a new tmux session.
      try {
        const { stderr } = await execPromise(
          `tmux new-session -d -s ${sessionName} sh -c "${command}"`
        );
        if (stderr) {
          log(
            `❌ Failed to create session '${sessionName}': ${stderr}`,
            "\x1b[91m"
          );
        } else {
          log(`✅ Session '${sessionName}' created successfully.`, "\x1b[92m");
        }
      } catch (e) {
        log(`❌ Failed to create session '${sessionName}': ${e}`, "\x1b[91m");
      }
    }
  }
}

async function manageSessionsWin(sessions) {
  for (const { sessionName, directory, command } of sessions) {
    // Change to the specified directory.
    try {
      process.chdir(directory);
    } catch (e) {
      log(`❌ Failed to change directory to '${directory}': ${e}`, "\x1b[91m");
      continue;
    }

    // Attempt to check if a CMD window with the session title is already running.
    try {
      const checkCmd = `tasklist /v | findstr /I "${sessionName}"`;
      await execPromise(checkCmd);
      log(`🟢 Session '${sessionName}' is already running.`, "\x1b[92m");
    } catch (err) {
      log(`🟡 Starting session: '${sessionName}'`, "\x1b[93m");
      // Open a new CMD window with the specified session title and command.
      // - "cmd.exe /C" executes the command and then terminates.
      // - "start" opens a new window with the provided title (sessionName).
      // - "cmd.exe /K" runs the command and keeps the window open.
      try {
        const spawnCmd = `cmd.exe /C start "${sessionName}" cmd.exe /K "${command}"`;
        const { stderr } = await execPromise(spawnCmd);
        if (stderr) {
          log(
            `❌ Failed to create session '${sessionName}': ${stderr}`,
            "\x1b[91m"
          );
        } else {
          log(`✅ Session '${sessionName}' created successfully.`, "\x1b[92m");
        }
      } catch (e) {
        log(`❌ Failed to create session '${sessionName}': ${e}`, "\x1b[91m");
      }
    }
  }
}

// =================== AUTO QUERY SYSTEM ===================
// account.txt format:
//   phone, @BotUsername|dapp_url, @BotUsername|dapp_url, ...[, raw]
// (If "raw" is provided after the URL, then the query will be output as raw.)
// Fungsi untuk membaca file link_bot.txt dengan format:
//   @BotUsername|dapp_url
// (Bisa juga dipisahkan dengan koma atau baris baru)
function readLinkBotFile(filePath) {
  const mapping = {};
  const content = fs.readFileSync(filePath, "utf8");
  // Pisahkan berdasarkan koma atau newline
  const parts = content.split(/[\n,]+/).map(p => p.trim()).filter(p => p);
  for (const part of parts) {
    const pipeParts = part.split("|").map(p => p.trim());
    if (pipeParts.length >= 2) {
      const username = pipeParts[0];
      const dapp_url = pipeParts[1];
      mapping[username.toLowerCase()] = dapp_url;
    }
  }
  return mapping;
}

// Fungsi untuk membaca account.txt dengan format:
//   phone, @BotUsername|dapp_url, @BotUsername|dapp_url, ...[, raw]
// Jika query untuk bot tertentu tidak disediakan, tambahkan default dari link_bot.txt.
// Perhatikan: Jika account.txt sudah mencantumkan bot yang sama seperti di link_bot.txt,
// maka query default untuk bot tersebut tidak akan ditambahkan ulang.
function readAccountFile(filePath, linkBotMapping = {}) {
  const entries = [];
  for (const line of readLines(filePath)) {
    const parts = line.split(",").map(p => p.trim()).filter(p => p);
    if (parts.length < 1) continue; // minimal harus ada nomor
    const phone = parts[0];
    const queries = [];

    // Jika ada query yang ditulis secara eksplisit di account.txt
    if (parts.length > 1) {
      for (let i = 1; i < parts.length; i++) {
        const pipeParts = parts[i].split("|").map(p => p.trim());
        if (pipeParts.length >= 2) {
          const username = pipeParts[0];
          const dapp_url = pipeParts[1];
          const raw = pipeParts.length >= 3 && pipeParts[2].toLowerCase() === "raw";
          queries.push({ username, dapp_url, raw });
        }
      }
    }
    // Buat set username yang sudah ada (dikonversi ke lowercase untuk perbandingan)
    const existingBots = new Set(queries.map(q => q.username.toLowerCase()));
    // Tambahkan query default dari link_bot.txt untuk bot yang belum ada di account.txt
    for (const [username, dapp_url] of Object.entries(linkBotMapping)) {
      if (!existingBots.has(username)) {
        queries.push({ username, dapp_url, raw: false });
      }
    }
    entries.push({ phone, queries });
  }
  return entries;
}

// script_bot.txt format:
//   @BotUsername, output_file_path
function readScriptFile(filePath) {
  const mapping = {};
  for (const line of readLines(filePath)) {
    if (line.includes(",")) {
      const [username, location] = line.split(",", 2);
      mapping[username.trim()] = location.trim();
    }
  }
  return mapping;
}

function sanitizePhone(phone) {
  return phone.replace(/\D/g, "");
}

// =================== USER PROMPT ===================
function prompt(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) =>
    rl.question(question, (ans) => {
      rl.close();
      resolve(ans.trim());
    })
  );
}

// =================== TELEGRAM SESSION MANAGEMENT ===================
async function loginForAccount(phone) {
  log(
    `🔑 Session for ${phone} not found. Starting login process...`,
    "\x1b[93m"
  );
  const stringSession = new StringSession("");
  const client = new TelegramClient(stringSession, APP_ID, APP_HASH, {
    connectionRetries: 5,
  });
  await client.start({
    phoneNumber: () => phone,
    phoneCode: () => prompt("📝 Please enter the code you received: "),
    password: () => prompt("🔐 Please enter your password (if required): "),
    onError: (err) => {
      console.error(err);
    },
  });
  log(
    `✅ Signed in as ${client.session.userId}; please follow the ToS.`,
    "\x1b[92m"
  );
  const sessionStr = client.session.save();
  await client.disconnect();
  return sessionStr;
}

async function ensureSessionForAccount(phone) {
  const sanitized = sanitizePhone(phone);
  const sessionDir = path.join("telegram", "sessions", sanitized);
  const sessFile = path.join(sessionDir, "session.txt");
  if (!fs.existsSync(sessFile)) {
    fs.mkdirSync(sessionDir, { recursive: true });
    const sessionStr = await loginForAccount(phone);
    fs.writeFileSync(sessFile, sessionStr, "utf8");
    return sessionStr;
  } else {
    return fs.readFileSync(sessFile, "utf8");
  }
}

// =================== REQUEST QUERY ===================
// Extracts the raw value from the URL fragment after "tgWebAppData=".
// If bot.raw is false, the value is decoded so "=" appears properly.
async function requestQueryForAccount(client, bot) {
  try {
    let botEntity = await client.getInputEntity(bot.username);
    if (
      botEntity.className === "inputPeerChannel" ||
      botEntity.className === "InputPeerChannel"
    ) {
      const entity = await client.getEntity(bot.username);
      if (entity.bot) {
        botEntity = new Api.InputPeerUser({
          userId: entity.id,
          accessHash: entity.accessHash,
        });
      } else {
        throw new Error("Entity is a channel and not a bot user");
      }
    }
    const result = await client.invoke(
      new Api.messages.RequestWebView({
        peer: botEntity,
        bot: botEntity,
        fromBotMenu: false,
        url: bot.dapp_url,
        platform: "android",
      })
    );
    log(
      `📥 Response for ${bot.username}: ${JSON.stringify(result)}`,
      "\x1b[94m"
    );
    if (result.url) {
      const urlObj = new URL(result.url);
      const fragment = urlObj.hash;
      if (fragment) {
        const fragContent = fragment.substring(1);
        const prefix = "tgWebAppData=";
        const idx = fragContent.indexOf(prefix);
        if (idx !== -1) {
          let valueStr = fragContent.substring(idx + prefix.length);
          const ampIndex = valueStr.indexOf("&");
          if (ampIndex !== -1) {
            valueStr = valueStr.substring(0, ampIndex);
          }
          if (!bot.raw) {
            return decodeURIComponent(valueStr);
          } else {
            return valueStr;
          }
        }
      }
    }
    return "Query not found";
  } catch (e) {
    log(`❌ Request query failed for ${bot.username}: ${e}`, "\x1b[91m");
    return "Query not found";
  }
}

// =================== AUTO QUERY SYSTEM ===================
// For each account, ensure a session exists, create a Telegram client,
// perform the request query for each bot, and save the query to the output file.
// The output file is cleared only for the first account per bot.
async function autoQuerySystem() {
  const linkBotMapping = readLinkBotFile("link_bot.txt");
  const accountEntries = readAccountFile("account.txt", linkBotMapping);
  const scriptMap = readScriptFile("script_bot.txt");
  const firstForBot = {};
  for (const entry of accountEntries) {
    const sessionStr = await ensureSessionForAccount(entry.phone);
    const client = new TelegramClient(
      new StringSession(sessionStr),
      APP_ID,
      APP_HASH,
      { connectionRetries: 5 }
    );
    await client.connect();
    client.on("error", (err) => {
      if (!err.message.includes("TIMEOUT")) {
        log(`Client error: ${err}`, "\x1b[91m");
      }
    });
    for (const bot of entry.queries) {
      const queryValue = await requestQueryForAccount(client, bot);
      if (scriptMap[bot.username]) {
        const queryFile = scriptMap[bot.username];
        if (!firstForBot[bot.username]) {
          fs.writeFileSync(queryFile, "", "utf8");
          firstForBot[bot.username] = true;
        }
        fs.appendFileSync(queryFile, `${queryValue}\n`, "utf8");
        log(`💾 Query for ${bot.username} saved to ${queryFile}`, "\x1b[92m");
      }
    }
    await client.disconnect();
  }
}

async function displayBanner() {
  const cyan = "\x1b[36m";
  const reset = "\x1b[0m";

  try {
    log(`${cyan}============================================${reset}`, cyan);
    log(`${cyan}           🎉 AirfarmBot`, cyan);
    log(`${cyan}   🚀 Created by LIVEXORDS`, cyan);
    log(`${cyan}   📢 Channel: t.me/livexordsscript`, cyan);
    log(`${cyan}📢 Management Bot for Script Bots`, cyan);
    log(`${cyan}    (Prepares queries, launches bots,`, cyan);
    log(`${cyan}     and restarts them if they crash)`, cyan);
    log(`${cyan}============================================${reset}`, cyan);
  } catch (e) {
    log(`Error displaying banner: ${e}`, "\x1b[91m");
  }
}

// =================== MAIN PROGRAM ===================
async function main() {
  displayBanner()
  const config = readConfig("config_bot.json");

  // Activate Termux wake lock if Termux mode is enabled.
  if (config.divace.termux) {
    try {
      await execPromise("termux-wake-lock");
      log("🔒 Termux wake lock activated.", "\x1b[92m");
    } catch (e) {
      log(`⚠️  Warning: termux-wake-lock failed: ${e}`, "\x1b[93m");
    }
  } else {
    log("📴 Termux mode is disabled.", "\x1b[93m");
  }

  // Execute the Auto Query System if enabled.
  if (config.auto_query) {
    log("🚀 Running Auto Query System...", "\x1b[96m");
    await autoQuerySystem();
    // Ensure that all Telegram client connections are disconnected after auto query.
    log(
      "✅ All Telegram connections have been disconnected after auto query.",
      "\x1b[92m"
    );
  }

  // Read sessions and perform automatic Git pull if updates are enabled.
  const sessions = readSessions("sessions.txt");
  await autoGitPull(sessions, config.update_repos);

  // Manage sessions based on the active platform.
  if (config.divace.termux || config.divace.linux) {
    log("🌐 Initiating session management for Termux/Linux mode.", "\x1b[96m");
    while (config.auto_run) {
      await manageSessions(sessions);
      log(`😴 Pausing for ${config.delay_minutes} minutes...`, "\x1b[94m");
      await new Promise((resolve) =>
        setTimeout(resolve, config.delay_minutes * 60 * 1000)
      );
    }
  } else if (config.divace.windows) {
    log("🌐 Initiating session management for Windows mode.", "\x1b[96m");
    while (config.auto_run) {
      await manageSessionsWin(sessions);
      log(`😴 Pausing for ${config.delay_minutes} minutes...`, "\x1b[94m");
      await new Promise((resolve) =>
        setTimeout(resolve, config.delay_minutes * 60 * 1000)
      );
    }
  } else {
    log(
      "🛑 Session management disabled. No supported platform mode is enabled.",
      "\x1b[93m"
    );
  }
}

main().catch((err) => {
  log(`❌ ${err}`, "\x1b[91m");
});
