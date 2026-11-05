const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { useQueue } = require('discord-player');
const { embedColor } = require('../../config.json');
const { buildPlayerUI } = require('../../utils/playerUI');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('volume')
        .setDescription('Mengatur volume suara musik (0-100)')
        .addIntegerOption(opt => opt.setName('amount').setDescription('Tingkat volume').setMinValue(0).setMaxValue(100).setRequired(true)),
    async execute(interaction) {
        const queue = useQueue(interaction.guildId);
        if (!queue || !queue.isPlaying()) return interaction.reply({ content: '❌ Tidak ada musik diputar.', ephemeral: true });

        const amount = interaction.options.getInteger('amount');
        queue.node.setVolume(amount);

        if (queue.metadata.playerMessage) {
            try {
                await queue.metadata.playerMessage.edit(buildPlayerUI(queue.currentTrack, queue));
            } catch (e) {}
        }

        return interaction.reply({ content: `🔊 Volume diubah ke **${amount}%**.` });
    },
};