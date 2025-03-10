/**
 * Final User-Friendly Node.js Script for Auto Query, Repository, and TMUX Management
 * APP_ID dan APP_HASH disediakan secara langsung (plain text).
 */

"use strict";

// Global error handler untuk mengabaikan error TIMEOUT
process.on('uncaughtException', (err) => {
  if (err.message && err.message.includes("TIMEOUT")) {
    // Abaikan error TIMEOUT
  } else {
    console.error("Uncaught Exception:", err);
  }
});

process.on('unhandledRejection', (reason, promise) => {
  if (reason && reason.message && reason.message.includes("TIMEOUT")) {
    // Abaikan error TIMEOUT
  } else {
    console.error("Unhandled Rejection:", reason);
  }
});

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { exec } = require('child_process');
const { promisify } = require('util');
const execPromise = promisify(exec);

const { TelegramClient, Api } = require('telegram');
const { StringSession } = require('telegram/sessions');

// =================== APP CREDENTIALS ===================
const APP_ID = 17709774; // APP_ID Anda
const APP_HASH = "ecb718e2f356a062fce2bbd7af4ac76b"; // APP_HASH Anda

// =================== CONFIG & LOGGING ===================
function log(message, color = "") {
  const timestamp = new Date().toISOString().replace('T', ' ~ ').split('.')[0];
  console.log(`\x1b[90m[${timestamp}]\x1b[0m ${color}${message}\x1b[0m`);
}

function readConfig(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

// =================== FILE READING UTILS ===================
function readLines(filePath) {
  return fs.readFileSync(filePath, "utf8")
           .split("\n")
           .filter(line => line.trim() !== "");
}

// =================== REPOSITORY & TMUX SESSION MANAGEMENT ===================
function readSessions(filePath) {
  const sessions = [];
  for (const line of readLines(filePath)) {
    const parts = line.split(",").map(p => p.trim());
    if (parts.length === 3) {
      sessions.push({ sessionName: parts[0], directory: parts[1], command: parts[2] });
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
      const { stdout, stderr } = await execPromise(`git -C "${directory}" pull`);
      if (stderr) {
        log(`❌ Failed to update repository in '${directory}': ${stderr}`, "\x1b[91m");
      } else {
        log(`✅ Repository in '${directory}' updated successfully.`, "\x1b[92m");
        log(`📤 ${stdout}`, "\x1b[94m");
      }
    } catch (err) {
      log(`❌ Error running git pull in '${directory}': ${err}`, "\x1b[91m");
    }
  }
}

async function manageSessions(sessions) {
  for (const { sessionName, directory, command } of sessions) {
    try {
      process.chdir(directory);
    } catch (e) {
      log(`❌ Failed to change directory to '${directory}': ${e}`, "\x1b[91m");
      continue;
    }
    try {
      await execPromise(`tmux has-session -t ${sessionName}`);
      log(`🟢 Session '${sessionName}' is already running.`, "\x1b[92m");
    } catch (err) {
      log(`🟡 Starting session: '${sessionName}'`, "\x1b[93m");
      try {
        const { stderr } = await execPromise(`tmux new-session -d -s ${sessionName} sh -c "${command}"`);
        if (stderr) {
          log(`❌ Failed to create session '${sessionName}': ${stderr}`, "\x1b[91m");
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
// (Jika "raw" ditambahkan setelah URL, maka query akan ditampilkan secara mentah.)
function readAccountFile(filePath) {
  const entries = [];
  for (const line of readLines(filePath)) {
    const parts = line.split(",").map(p => p.trim());
    if (parts.length < 2) continue;
    const phone = parts[0];
    const queries = [];
    for (let i = 1; i < parts.length; i++) {
      const pipeParts = parts[i].split("|").map(p => p.trim());
      if (pipeParts.length >= 2) {
         const username = pipeParts[0];
         const dapp_url = pipeParts[1];
         const raw = (pipeParts.length >= 3 && pipeParts[2].toLowerCase() === "raw");
         queries.push({ username, dapp_url, raw });
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
  return new Promise(resolve => rl.question(question, ans => {
    rl.close();
    resolve(ans.trim());
  }));
}

// =================== TELEGRAM SESSION MANAGEMENT ===================
async function loginForAccount(phone) {
  log(`🔑 Session for ${phone} not found. Starting login process...`, "\x1b[93m");
  const stringSession = new StringSession("");
  // Create client WITHOUT disableUpdates option
  const client = new TelegramClient(stringSession, APP_ID, APP_HASH, { connectionRetries: 5 });
  await client.start({
    phoneNumber: () => phone,
    phoneCode: () => prompt("📝 Please enter the code you received: "),
    password: () => prompt("🔐 Please enter your password (if required): "),
    onError: (err) => { console.error(err); }
  });
  log(`✅ Signed in as ${client.session.userId}; please follow the ToS.`, "\x1b[92m");
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
// Jika bot.raw adalah false, hasilnya didecode agar "=" muncul dengan benar.
async function requestQueryForAccount(client, bot) {
  try {
    let botEntity = await client.getInputEntity(bot.username);
    if (botEntity.className === 'inputPeerChannel' || botEntity.className === 'InputPeerChannel') {
      const entity = await client.getEntity(bot.username);
      if (entity.bot) {
        botEntity = new Api.InputPeerUser({
          userId: entity.id,
          accessHash: entity.accessHash
        });
      } else {
        throw new Error("Entity is a channel and not a bot user");
      }
    }
    const result = await client.invoke(new Api.messages.RequestWebView({
      peer: botEntity,
      bot: botEntity,
      fromBotMenu: false,
      url: bot.dapp_url,
      platform: "android"
    }));
    log(`📥 Response for ${bot.username}: ${JSON.stringify(result)}`, "\x1b[94m");
    if (result.url) {
      const urlObj = new URL(result.url);
      const fragment = urlObj.hash;
      if (fragment) {
        const fragContent = fragment.substring(1);
        const prefix = "tgWebAppData=";
        const idx = fragContent.indexOf(prefix);
        if (idx !== -1) {
          let valueStr = fragContent.substring(idx + prefix.length);
          const ampIndex = valueStr.indexOf('&');
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
  const accountEntries = readAccountFile("account.txt");
  const scriptMap = readScriptFile("script_bot.txt");
  const firstForBot = {};
  for (const entry of accountEntries) {
    const sessionStr = await ensureSessionForAccount(entry.phone);
    // Create Telegram client WITHOUT disableUpdates, but attach error handler.
    const client = new TelegramClient(new StringSession(sessionStr), APP_ID, APP_HASH, { connectionRetries: 5 });
    await client.connect();
    client.on('error', (err) => {
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

// =================== MAIN PROGRAM ===================
async function main() {
  const config = readConfig("config_bot.json");

  if (config.termux) {
    try {
      await execPromise("termux-wake-lock");
    } catch (e) {
      log(`⚠️  Warning: termux-wake-lock failed: ${e}`, "\x1b[93m");
    }
  } else {
    log("📴 Termux mode disabled.", "\x1b[93m");
  }

  if (config.auto_query) {
    log("🚀 Running Auto Query System...", "\x1b[96m");
    await autoQuerySystem();
  }

  const sessions = readSessions("sessions.txt");
  await autoGitPull(sessions, config.update_repos);

  if (config.termux) {
    while (config.auto_run) {
      await manageSessions(sessions);
      log(`😴 Sleeping for ${config.delay_minutes} minutes...`, "\x1b[94m");
      await new Promise(resolve => setTimeout(resolve, config.delay_minutes * 60 * 1000));
    }
  } else {
    log("🛑 TMUX session management disabled since Termux mode is disabled.", "\x1b[93m");
  }
}

main().catch(err => {
  log(`❌ ${err}`, "\x1b[91m");
});
