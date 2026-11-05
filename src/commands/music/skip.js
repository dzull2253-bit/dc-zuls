const { SlashCommandBuilder } = require('discord.js');
const { useQueue } = require('discord-player');

module.exports = {
    data: new SlashCommandBuilder().setName('skip').setDescription('Melewati lagu saat ini'),
    async execute(interaction) {
        const queue = useQueue(interaction.guildId);
        if (!queue || !queue.isPlaying()) return interaction.reply({ content: '❌ Tidak ada musik yang diputar.', ephemeral: true });

        const track = queue.currentTrack;
        queue.node.skip();
        return interaction.reply(`⏭️ Melewati **${track.title}**`);
    },
};