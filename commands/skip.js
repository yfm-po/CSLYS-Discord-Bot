const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('skip')
        .setDescription('skip the current song'),

    execute: async ({ client, interaction }) => {
        const queue = client.player.getQueue(interaction.guildId);

        if (queue != null) {
            const currentTrack = queue.current;
            const messageEmbed = new EmbedBuilder();
            queue.skip();

            await interaction.reply({
                 embeds: [messageEmbed
                    .setDescription(`Skips ${currentTrack.title} [${currentTrack.length}]`)
                    .setColor('#00ff00').setThumbnail(currentTrack.thumbnail)] 
                });
        } else {
            await interaction.reply({ embeds: [new messageEmbed
                .setColor('#ff0000')
                .setTitle('Error')
                .setDescription('No songs in the queue!')]
            });
        }
    }
}
