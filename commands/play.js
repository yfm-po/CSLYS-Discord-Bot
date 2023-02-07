import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, MessageEmbed } from 'discord.js';
import { QueryType } from 'discord-player';

let slashCommand;

module.exports = {
    data: setUpSlashCommand('play', 'This command plays a given song in the voice channel').addSubcommand(subcommand => {
        subcommand.setName('search').setDescription('this subcommand searches for a given song').addStringOption(option => {
            option.setName('searchterms').setDescription('search keywords').setRequired(true);
        })
    }).addSubcommand(subcommand => {
        subcommand.setName('playlist').setDescription('plays a given playlist based on URL').addStringOption(option => {
            option.setName('URL').setDescription('playlist url').setRequired(true);
        })
    }).addSubcommand(subcommand => {
        subcommand.setName('song').setDescription('plays a given song based on URL').addStringOption(option => {
            option.setName('URL').setDescription('URL of the given song').setRequired(true);
        })
    }),

    const execute = async (client, interaction) => {
        if (interaction.member.voice.channel) {
            const queue = await client.player.createQueue(interaction.guild);
            if (!queue.connection) await queue.connect(interaction.member.voice.channel);

            let messageEmbed = new MessageEmbed();

            switch (interaction.options.getSubcommand()) {
                case 'song':
                    let url = interaction.options.getString('URL');

                    const resultURL = await client.player.search(url, {
                        requestedBy: interaction.user,
                        searchEngine: QueryType.YOUTUBE_VIDEO
                    });

                    if (resultURL.tracks.length < 1) {
                        messageEmbed.setColor('#ff0000').setTitle('Error').setDescription('No results found!');
                        await interaction.reply({ embeds: [messageEmbed] });
                        return;
                    }

                    const foundFirst = resultURL.tracks[0];
                    await queue.addTrack(foundFirst);

                    messageEmbed.setDescription(`Added ${foundFirst.title} [${foundFirst.length}] to the song queue!`)
                        .setColor('#00ff00')
                        .setThumbnail(foundFirst.thumbnail)
                        .setFooter(`Requested by ${foundFirst.requestedBy.tag}`, foundFirst.requestedBy.displayAvatarURL({ dynamic: true }));
                
                case 'playlist':
                    let playlistURL = interaction.options.getString('URL');

                    const resultPlaylist = await client.player.search(playlistURL, {
                        requestedBy: interaction.user,
                        searchEngine: QueryType.YOUTUBE_PLAYLIST
                    });

                    if (resultPlaylist.tracks.length < 1) {
                        messageEmbed.setColor('#ff0000').setTitle('Error').setDescription('No results found!');
                        await interaction.reply({ embeds: [messageEmbed] });
                        return;
                    }

                    const foundPlaylist = resultPlaylist.tracks;
                    await queue.addTracks(foundPlaylist);

                    messageEmbed.setDescription(`Added ${foundPlaylist.length} songs to the song queue!`)
                        .setColor('#00ff00')
                        .setThumbnail(foundPlaylist[0].thumbnail)
                        .setFooter(`Requested by ${foundPlaylist[0].requestedBy.tag}`, foundPlaylist[0].requestedBy.displayAvatarURL({ dynamic: true }));

                case 'search':
                    let searchTerms = interaction.options.getString('searchterms');

                    const resultSearch = await client.player.search(searchTerms, {
                        requestedBy: interaction.user,
                        searchEngine: QueryType.AUTO
                    });

                    if (resultSearch.tracks.length < 1) {
                        messageEmbed.setColor('#ff0000').setTitle('Error').setDescription('No results found!');
                        await interaction.reply({ embeds: [messageEmbed] });
                        return;
                    }

                    const foundFirstSearch = resultSearch.tracks[0];
                    await queue.addTrack(foundFirstSearch);

                    messageEmbed.setDescription(`Added ${foundFirstSearch.title} [${foundFirstSearch.length}] to the song queue!`)
                        .setColor('#00ff00')
                        .setThumbnail(foundFirstSearch.thumbnail)
                        .setFooter(`Requested by ${foundFirstSearch.requestedBy.tag}`, foundFirstSearch.requestedBy.displayAvatarURL({ dynamic: true }));

                default:
                    messageEmbed.setColor('#ff0000').setTitle('Error').setDescription('No subcommand was found!');
                    await interaction.reply({ embeds: [messageEmbed] });
            }

            if (!queue.playing) await queue.play();
            await interaction.reply({ embeds: [messageEmbed] });
        }
            
        await interaction.reply({ embeds: [embed = new MessageEmbed()
            .setColor('#ff0000')
            .setTitle('Error')
            .setDescription('You need to be in a voice channel to use this command!')] });
    }
};

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

