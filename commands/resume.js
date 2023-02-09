const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('resume')
        .setDescription('resume the current song'),

    execute: async (client, interaction) => {
        const queue = client.player.getQueue(interaction.guild);

        if (queue != null) {
            const currentTrack = queue.current;
            const messageEmbed = new EmbedBuilder();
            queue.setPaused(false);

            await interaction.reply({
                 embeds: [messageEmbed
                    .setDescription(`Resumes ${currentTrack.title} [${currentTrack.length}]`)
                    .setColor('#00ff00')
                    .setThumbnail(currentTrack.thumbnail)]
                });
        } else {
            await interaction.reply({ embeds: [messageEmbed
                .setColor('#ff0000')
                .setTitle('Error')
                .setDescription('There is no song playing!')]
            });
        }
    }
}
