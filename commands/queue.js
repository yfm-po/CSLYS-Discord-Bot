import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, MessageEmbed } from 'discord.js';

module.exports = {
    data: setUpSlashCommand('queue', 'This command shows the current queue of songs'),

    execute: async (client, interaction) => {
        const queue = client.player.getQueue(interaction.guild);

        if (queue != null && queue.playing) {
            const queueBuffer = [];
            const messageEmbed = new MessageEmbed();
            const currentTrack = queue.current;

            queue.tracks.forEach((track, index) => {
                queueBuffer.push(`${index + 1}. ${track.title} [${track.length}] requested by -> ${track.requestedBy}\n`);
            });

            await interaction.reply({
                embeds: [messageEmbed
                    .setDescription(`Current Queue:\n${queueBuffer.join('')}`)
                    .setColor('#00ff00')
                    .setThumbnail(currentTrack.thumbnail)]
            });
        } else {
            await interaction.reply({ embeds: [new MessageEmbed()
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