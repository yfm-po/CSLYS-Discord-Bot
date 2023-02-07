import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, MessageEmbed } from 'discord.js';

module.exports = {
    data: setUpSlashCommand('skip', 'This command skips the current song in the queue'),

    execute: async (client, interaction) => {
        const queue = client.player.getQueue(interaction.guild);

        if (queue != null) {
            const currentTrack = queue.current;
            const messageEmbed = new MessageEmbed();
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
