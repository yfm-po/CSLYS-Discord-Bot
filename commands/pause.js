import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, MessageEmbed } from 'discord.js';

module.exports = {
    data: setUpSlashCommand('pause', 'This command pauses the current song in the queue'),

    execute: async (client, interaction) => {
        const queue = client.player.getQueue(interaction.guild);

        if (queue != null) {
            const currentTrack = queue.current;
            const messageEmbed = new MessageEmbed();
            queue.setPaused(true);

            await interaction.reply({
                 embeds: [messageEmbed
                    .setDescription(`Pauses ${currentTrack.title} [${currentTrack.length}]`)
                    .setColor('#00ff00')
                    .setThumbnail(currentTrack.thumbnail)]
                });
        } else {
            await interaction.reply({ embeds: [new messageEmbed
                .setColor('#ff0000')
                .setTitle('Error')
                .setDescription('There is no song playing!')]
            });
        }
    }
}

/**
 * 
 * @param {String} name 
 * @param {String} description 
 * @returns {SlashCommandBuilder}
 * @description Sets up a slash command using SlashCommandBuilder with the given name and description
 */
const setUpSlashCommand = (name, description) => {
    return new SlashCommandBuilder().setName(name).setDescription(description);
}
