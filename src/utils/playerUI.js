// Mengimpor pembuat tampilan kartu (Embed) dan tombol (Buttons)
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { QueueRepeatMode } = require('discord-player');
const { embedColor } = require('../../config.json');

// Fungsi pembuat tampilan UI Player interaktif
function buildPlayerUI(track, queue) {
    // 1. Tentukan status indikator mode Loop
    let loopLabel = '🔁 Loop: Off';
    let loopStyle = ButtonStyle.Secondary;

    if (queue.repeatMode === QueueRepeatMode.TRACK) {
        loopLabel = '🔂 Loop: Track';
        loopStyle = ButtonStyle.Success;
    } else if (queue.repeatMode === QueueRepeatMode.QUEUE) {
        loopLabel = '🔁 Loop: Queue';
        loopStyle = ButtonStyle.Primary;
    }

    const currentVol = queue.node.volume;

    // 2. Buat Tampilan Kartu Informasi Lagu (Embed)
    const embed = new EmbedBuilder()
        .setColor(embedColor)
        .setTitle('🎶 Now Playing')
        .setDescription(`**[${track.title}](${track.url})**`)
        .setThumbnail(track.thumbnail)
        .addFields(
            { name: '👤 Artis', value: track.author || 'Tidak Diketahui', inline: true },
            { name: '⏱️ Durasi', value: track.duration, inline: true },
            { name: '🔊 Volume', value: `${currentVol}%`, inline: true },
            { name: '🔁 Loop Mode', value: loopLabel.replace(/^[^a-zA-Z0-9]+/, ''), inline: true },
            { name: '📜 Antrean', value: `${queue.tracks.size} lagu tersisa`, inline: true },
            { name: '🙋 Diminta oleh', value: `${track.requestedBy}`, inline: true }
        )
        .setTimestamp();

    const isPaused = queue.node.isPaused();

    // 3. Baris Tombol Pertama: Kontrol Utama (Pause/Resume, Skip, Loop, Stop)
    const row1 = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId(isPaused ? 'btn_resume' : 'btn_pause')
            .setLabel(isPaused ? '▶️ Resume' : '⏸️ Pause')
            .setStyle(isPaused ? ButtonStyle.Success : ButtonStyle.Primary),
        new ButtonBuilder()
            .setCustomId('btn_skip')
            .setLabel('⏭️ Skip')
            .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId('btn_loop')
            .setLabel(loopLabel)
            .setStyle(loopStyle),
        new ButtonBuilder()
            .setCustomId('btn_stop')
            .setLabel('⏹️ Stop')
            .setStyle(ButtonStyle.Danger)
    );

    // 4. Baris Tombol Kedua: Volume dan Fitur Tambahan
    const row2 = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('btn_voldown')
            .setLabel('🔉 Vol -10%')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(currentVol <= 0),
        new ButtonBuilder()
            .setCustomId('btn_volup')
            .setLabel('🔊 Vol +10%')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(currentVol >= 100),
        new ButtonBuilder()
            .setCustomId('btn_shuffle')
            .setLabel('🔀 Shuffle')
            .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId('btn_queue')
            .setLabel('📜 Queue')
            .setStyle(ButtonStyle.Secondary)
    );

    return { embeds: [embed], components: [row1, row2] };
}

module.exports = { buildPlayerUI };