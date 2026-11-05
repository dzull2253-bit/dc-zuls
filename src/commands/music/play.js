const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { useMainPlayer } = require('discord-player');
const { embedColor } = require('../../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Memutar lagu dari YouTube atau Spotify')
        .addStringOption(opt => opt.setName('query').setDescription('Judul lagu atau URL').setRequired(true)),
    async execute(interaction) {
        const player = useMainPlayer();
        const query = interaction.options.getString('query');
        const voiceChannel = interaction.member.voice.channel;

        if (!voiceChannel) {
            return interaction.reply({ content: '❌ Anda harus masuk ke voice channel dulu!', ephemeral: true });
        }

        await interaction.deferReply();

        try {
            const result = await player.play(voiceChannel, query, {
                nodeOptions: {
                    metadata: { channel: interaction.channel, requestedBy: interaction.user },
                    leaveOnEmpty: true,
                    leaveOnEmptyCooldown: 30000,
                },
            });

            const embed = new EmbedBuilder()
                .setColor(embedColor)
                .setTitle('🎶 Lagu Berhasil Ditambahkan')
                .setDescription(`**[${result.track.title}](${result.track.url})**`)
                .setThumbnail(result.track.thumbnail)
                .addFields(
                    { name: 'Durasi', value: result.track.duration, inline: true },
                    { name: 'Artis', value: result.track.author || 'Tidak Diketahui', inline: true }
                );

            return interaction.editReply({ embeds: [embed] });
        } catch (error) {
            return interaction.editReply(`❌ Gagal memutar lagu: ${error.message}`);
        }
    },
};