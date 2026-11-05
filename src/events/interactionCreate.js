const { Events } = require('discord.js');
const { useQueue, QueueRepeatMode } = require('discord-player');
const { buildPlayerUI } = require('../utils/playerUI');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction, client) {
        // === MENGELOLA COMMAND SLASH ===
        if (interaction.isChatInputCommand()) {
            const command = client.commands.get(interaction.commandName);
            if (!command) return;

            try {
                await command.execute(interaction, client);
            } catch (error) {
                console.error(error);
                const replyData = { content: '❌ Terjadi kesalahan saat menjalankan perintah!', ephemeral: true };
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp(replyData);
                } else {
                    await interaction.reply(replyData);
                }
            }
            return;
        }

        // === MENGELOLA INTERAKSI TOMBOL ===
        if (interaction.isButton()) {
            const queue = useQueue(interaction.guildId);

            // Validasi apakah ada lagu yang diputar
            if (!queue || !queue.isPlaying()) {
                return interaction.reply({ content: '❌ Tidak ada musik yang sedang diputar!', ephemeral: true });
            }

            // Validasi keberadaan user di channel suara yang sama dengan bot
            const voiceChannel = interaction.member.voice.channel;
            if (!voiceChannel || voiceChannel.id !== queue.channel.id) {
                return interaction.reply({ content: '❌ Anda harus berada di channel suara yang sama dengan bot!', ephemeral: true });
            }

            // Logika berdasarkan ID tombol yang diklik
            switch (interaction.customId) {
                case 'btn_pause':
                    queue.node.pause();
                    await interaction.deferUpdate();
                    await interaction.editReply(buildPlayerUI(queue.currentTrack, queue));
                    break;

                case 'btn_resume':
                    queue.node.resume();
                    await interaction.deferUpdate();
                    await interaction.editReply(buildPlayerUI(queue.currentTrack, queue));
                    break;

                case 'btn_skip':
                    const current = queue.currentTrack;
                    queue.node.skip();
                    await interaction.reply({ content: `⏭️ **${current.title}** dilewati oleh ${interaction.user}.` });
                    break;

                case 'btn_stop':
                    queue.delete();
                    await interaction.reply({ content: `⏹️ Pemutaran dihentikan oleh ${interaction.user}.` });
                    break;

                case 'btn_loop':
                    let nextMode = queue.repeatMode === QueueRepeatMode.OFF ? QueueRepeatMode.TRACK :
                                   queue.repeatMode === QueueRepeatMode.TRACK ? QueueRepeatMode.QUEUE : QueueRepeatMode.OFF;
                    queue.setRepeatMode(nextMode);
                    await interaction.deferUpdate();
                    await interaction.editReply(buildPlayerUI(queue.currentTrack, queue));
                    break;

                case 'btn_voldown':
                    queue.node.setVolume(Math.max(0, queue.node.volume - 10));
                    await interaction.deferUpdate();
                    await interaction.editReply(buildPlayerUI(queue.currentTrack, queue));
                    break;

                case 'btn_volup':
                    queue.node.setVolume(Math.min(100, queue.node.volume + 10));
                    await interaction.deferUpdate();
                    await interaction.editReply(buildPlayerUI(queue.currentTrack, queue));
                    break;

                case 'btn_shuffle':
                    if (queue.tracks.size < 2) {
                        return interaction.reply({ content: '❌ Antrean butuh minimal 2 lagu untuk diacak!', ephemeral: true });
                    }
                    queue.tracks.shuffle();
                    await interaction.deferUpdate();
                    await interaction.editReply(buildPlayerUI(queue.currentTrack, queue));
                    await interaction.followUp({ content: '🔀 Antrean berhasil diacak!', ephemeral: true });
                    break;

                case 'btn_queue':
                    const tracks = queue.tracks.toArray();
                    if (!tracks.length) return interaction.reply({ content: '📜 Antrean saat ini kosong.', ephemeral: true });
                    const list = tracks.slice(0, 5).map((t, i) => `${i + 1}. **${t.title}** - *${t.author}*`).join('\n');
                    await interaction.reply({ content: `**📜 5 Lagu Berikutnya:**\n${list}`, ephemeral: true });
                    break;
            }
        }
    },
};