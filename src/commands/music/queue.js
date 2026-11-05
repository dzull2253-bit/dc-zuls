const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const { useQueue } = require('discord-player');
const { embedColor } = require('../../config.json');

module.exports = {
    data: new SlashCommandBuilder().setName('queue').setDescription('Menampilkan antrean lagu dengan halaman'),
    async execute(interaction) {
        const queue = useQueue(interaction.guildId);
        if (!queue || !queue.isPlaying()) return interaction.reply({ content: '❌ Antrean kosong.', ephemeral: true });

        const tracks = queue.tracks.toArray();
        const perPage = 5;
        const totalPages = Math.ceil(tracks.length / perPage) || 1;
        let page = 0;

        const getPage = (p) => {
            const start = p * perPage;
            const current = tracks.slice(start, start + perPage);
            let desc = `**🎶 Sedang Diputar:**\n[${queue.currentTrack.title}](${queue.currentTrack.url})\n\n**📜 Antrean:**\n`;
            desc += current.map((t, idx) => `**${start + idx + 1}.** [${t.title}](${t.url})`).join('\n') || '*Kosong*';

            const embed = new EmbedBuilder()
                .setColor(embedColor)
                .setTitle(`📋 Antrean Server`)
                .setDescription(desc)
                .setFooter({ text: `Halaman ${p + 1} dari ${totalPages}` });

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('prev').setLabel('◀️ Prev').setStyle(ButtonStyle.Primary).setDisabled(p === 0),
                new ButtonBuilder().setCustomId('next').setLabel('Next ▶️').setStyle(ButtonStyle.Primary).setDisabled(p === totalPages - 1)
            );
            return { embeds: [embed], components: totalPages > 1 ? [row] : [] };
        };

        const msg = await interaction.reply({ ...getPage(page), fetchReply: true });
        if (totalPages <= 1) return;

        const col = msg.createMessageComponentCollector({ componentType: ComponentType.Button, time: 60000 });
        col.on('collect', async i => {
            if (i.user.id !== interaction.user.id) return i.reply({ content: '❌ Bukan milik Anda.', ephemeral: true });
            if (i.customId === 'prev') page--;
            if (i.customId === 'next') page++;
            await i.update(getPage(page));
        });
    },
};