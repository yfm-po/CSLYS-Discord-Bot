const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('exit')
        .setDescription('exit the voice channel'),

    execute: async (client, interaction) => {
        const queue = client.player.getQueue(interaction.guild);

        if (queue != null) {
            const currentTrack = queue.current;
            const messageEmbed = new EmbedBuilder();
            queue.destroy();

            await interaction.reply({
                 embeds: [messageEmbed
                    .setDescription(`forever alone :(`)
                    .setColor('#00ff00')
                    .setThumbnail(currentTrack.thumbnail)]
                });
        } else {
            await interaction.reply({ embeds: [messageEmbed
                .setColor('#ff0000')
                .setTitle('Error')
                .setDescription('why are you that lonely?')]
            });
        }
    }
}
