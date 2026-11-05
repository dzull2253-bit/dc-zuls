// Memuat variabel rahasia dari file .env
require('dotenv').config();

// Mengimpor REST API dan Routes dari library discord.js
const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

const commands = [];
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

// Membaca semua berkas perintah yang ada di folder commands
for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        if ('data' in command && 'execute' in command) {
            commands.push(command.data.toJSON());
        }
    }
}

// Menyiapkan REST Module menggunakan Token Bot
const rest = new REST().setToken(process.env.DISCORD_TOKEN);

// Mendaftarkan perintah Slash ke API Discord
(async () => {
    try {
        console.log(`Mengirim ${commands.length} perintah slash ke Discord...`);
        await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
            { body: commands },
        );
        console.log('✅ Perintah slash berhasil terdaftar!');
    } catch (error) {
        console.error('❌ Terjadi kesalahan saat registrasi command:', error);
    }
})();