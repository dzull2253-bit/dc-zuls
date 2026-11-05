const { Events, ActivityType } = require('discord.js');

// Event ketika bot berhasil login dan siap digunakan
module.exports = {
    name: Events.ClientReady,
    once: true,
    execute(client) {
        console.log(`🤖 Bot online sebagai ${client.user.tag}`);
        // Mengatur status aktivitas bot
        client.user.setActivity('Spotify & YouTube | /play', { type: ActivityType.Listening });
    },
};