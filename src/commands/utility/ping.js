const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { embedColor } = require('../../config.json');

module.exports = {
    // Definisi nama dan deskripsi perintah slash
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Menampilkan kecepatan respon bot dan API'),
    async execute(interaction, client) {
        const pingEmbed = new EmbedBuilder()
            .setColor(embedColor)
            .setTitle('🏓 Pong!')
            .addFields(
                { name: 'Bot Latency', value: `${Date.now() - interaction.createdTimestamp}ms`, inline: true },
                { name: 'API Latency', value: `${Math.round(client.ws.ping)}ms`, inline: true }
            )
            .setTimestamp();

        await interaction.reply({ embeds: [pingEmbed] });
    },
};