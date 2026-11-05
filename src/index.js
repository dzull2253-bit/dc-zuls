// Memuat variabel rahasia dari file .env (Token Bot, Client ID, dsb)
require('dotenv').config();

// Mengimpor komponen utama dari library discord.js
const { Client, GatewayIntentBits, Collection } = require('discord.js');
// Mengimpor modul pemutar musik discord-player
const { Player } = require('discord-player');
// Mengimpor ekstrak pengunduh lagu otomatis (Spotify, YouTube, SoundCloud, dll)
const { DefaultExtractors } = require('@discord-player/extractor');
// Mengimpor modul Node.js bawaan untuk membaca file dan folder
const fs = require('fs');
const path = require('path');

// Mengimpor pembuat tampilan UI tombol player musik
const { buildPlayerUI } = require('./utils/playerUI');

// Membuat koneksi Client bot ke Discord dengan hak akses (Intents) tertentu
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,             // Akses dasar informasi server
        GatewayIntentBits.GuildVoiceStates,   // Akses ke dalam channel suara (Voice Channel)
        GatewayIntentBits.GuildMessages,      // Akses ke pesan teks server
        GatewayIntentBits.MessageContent,     // Akses membaca isi pesan teks
    ],
});

// Menyediakan wadah penyimpanan perintah (commands) di dalam memory bot
client.commands = new Collection();

// Menginisialisasi sistem utama mesin musik (Player)
const player = new Player(client, {
    ytdlOptions: {
        filter: 'audioonly', // Hanya mengambil aliran audio tanpa video
        highWaterMark: 1 << 25, // Memperbesar buffer agar pemutaran lagu lancar
    },
});

// Memuat extractor lagu default secara otomatis (YouTube, Spotify, SoundCloud)
(async () => {
    await player.extractors.loadMulti(DefaultExtractors);
})();

// === EVENT MESIN PEMUTAR MUSIK ===

// Event ketika lagu baru mulai diputar
player.events.on('playerStart', async (queue, track) => {
    // Jika pesan tombol kontrol lama masih ada di chat, hapus terlebih dahulu
    if (queue.metadata.playerMessage) {
        try {
            await queue.metadata.playerMessage.delete();
        } catch (error) {
            if (error.code !== 10008) console.error('[Error Hapus Pesan]', error);
        }
        queue.metadata.playerMessage = null;
    }

    // Buat tampilan Embed & Tombol baru untuk lagu saat ini
    const uiData = buildPlayerUI(track, queue);
    try {
        // Kirim pesan baru ke channel teks dan simpan statusnya
        const newMessage = await queue.metadata.channel.send(uiData);
        queue.metadata.playerMessage = newMessage;
    } catch (error) {
        console.error('[Error Kirim UI Player]', error);
    }
});

// Event ketika antrean lagu habis atau bot keluar dari channel suara
player.events.on('emptyQueue', async (queue) => {
    if (queue.metadata.playerMessage) {
        try {
            await queue.metadata.playerMessage.delete();
        } catch (error) {
            if (error.code !== 10008) console.error(error);
        }
        queue.metadata.playerMessage = null;
    }
    queue.metadata.channel.send('✅ Semua lagu di antrean selesai diputar.');
});

// Handling kesalahan/error pada player musik agar bot tidak crash
player.events.on('error', (queue, error) => {
    console.error(`[Player Error] ${error.message}`);
});

// === MEMUAT EVENT HANDLER DISCORD ===

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args, client));
    } else {
        client.on(event.name, (...args) => event.execute(...args, client));
    }
}

// Memuat pendaftar perintah slash (Command Handler)
require('./handlers/commandHandler')(client);

// Menghubungkan bot ke server Discord menggunakan Token
client.login(process.env.DISCORD_TOKEN);