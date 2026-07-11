const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

function loadFile(name) {
    const filePath = path.join(DATA_DIR, `${name}.json`);
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, '{}');
        return {};
    }
    try {
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch {
        return {};
    }
}

function saveFile(name, data) {
    const filePath = path.join(DATA_DIR, `${name}.json`);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// ---------- نظام الاقتصاد ----------
function getUserEconomy(userId) {
    const db = loadFile('economy');
    if (!db[userId]) {
        db[userId] = { balance: 100, bank: 0, lastDaily: 0, lastWork: 0 };
        saveFile('economy', db);
    }
    return db[userId];
}

function updateUserEconomy(userId, updates) {
    const db = loadFile('economy');
    if (!db[userId]) db[userId] = { balance: 100, bank: 0, lastDaily: 0, lastWork: 0 };
    db[userId] = { ...db[userId], ...updates };
    saveFile('economy', db);
    return db[userId];
}

function getAllEconomy() {
    return loadFile('economy');
}

// ---------- نظام المستويات ----------
function getUserLevel(userId) {
    const db = loadFile('levels');
    if (!db[userId]) {
        db[userId] = { xp: 0, level: 1, lastMessage: 0 };
        saveFile('levels', db);
    }
    return db[userId];
}

function updateUserLevel(userId, updates) {
    const db = loadFile('levels');
    if (!db[userId]) db[userId] = { xp: 0, level: 1, lastMessage: 0 };
    db[userId] = { ...db[userId], ...updates };
    saveFile('levels', db);
    return db[userId];
}

// ---------- اعدادات السيرفر (تفعيل البوت بقناة معينة) ----------
function getGuildConfig(guildId) {
    const db = loadFile('guildConfig');
    if (!db[guildId]) {
        db[guildId] = { activeChannelId: null };
        saveFile('guildConfig', db);
    }
    return db[guildId];
}

function setActiveChannel(guildId, channelId) {
    const db = loadFile('guildConfig');
    db[guildId] = { ...(db[guildId] || {}), activeChannelId: channelId };
    saveFile('guildConfig', db);
    return db[guildId];
}

function clearActiveChannel(guildId) {
    const db = loadFile('guildConfig');
    db[guildId] = { ...(db[guildId] || {}), activeChannelId: null };
    saveFile('guildConfig', db);
    return db[guildId];
}

module.exports = {
    getUserEconomy,
    updateUserEconomy,
    getAllEconomy,
    getUserLevel,
    updateUserLevel,
    getGuildConfig,
    setActiveChannel,
    clearActiveChannel
};
