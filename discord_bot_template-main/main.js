const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
require('dotenv').config();

// ✅ Client 初期化
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildVoiceStates,
    ],
});

// ✅ スラッシュコマンド登録用（起動時に毎回登録）
require("./deploy-commands.js");

// ✅ コマンド読み込み
client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
        console.log(`-> [Loaded Command] ${file}`);
    } else {
        console.warn(`⚠️ コマンド ${file} は正しい構造を持っていません。`);
    }
}

// ✅ イベント読み込み
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
    console.log(`-> [Loaded Event] ${file}`);
}

// ✅ スラッシュコマンド実行処理
client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) {
        console.error(`❌ コマンドが見つかりません: ${interaction.commandName}`);
        return;
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(`💥 ${interaction.commandName} 実行中にエラー:`, error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: '❌ エラーが発生しました。', ephemeral: true });
        } else {
            await interaction.reply({ content: '❌ コマンドの実行に失敗しました。', ephemeral: true });
        }
    }
});

// ✅ ログイン
client.login(process.env.TOKEN);
