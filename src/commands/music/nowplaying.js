const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { useQueue } = require('discord-player');
const { embedColor } = require('../../config.json');

module.exports = {
    data: new SlashCommandBuilder().setName('nowplaying').setDescription('Menampilkan durasi dan progress bar lagu'),
    async execute(interaction) {
        const queue = useQueue(interaction.guildId);
        if (!queue || !queue.isPlaying()) return interaction.reply({ content: '❌ Tidak ada musik diputar.', ephemeral: true });

        const track = queue.currentTrack;
        const progress = queue.node.createProgressBar({ queue: false, length: 15, line: '▬', indicator: '🔘' });
        const time = queue.node.getTimestamp();

        const embed = new EmbedBuilder()
            .setColor(embedColor)
            .setTitle('🎶 Now Playing')
            .setDescription(`**[${track.title}](${track.url})**\n\n${progress}`)
            .addFields({ name: 'Waktu', value: `${time.current.label} / ${time.total.label}`, inline: true });

        return interaction.reply({ embeds: [embed] });
    },
};