const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const { QueryType } = require('discord-player');

module.exports = {
    data: new SlashCommandBuilder().setName("play").setDescription("This command plays a given song in the voice channel")
    .addSubcommand(subcommand =>
        subcommand
            .setName("search")
            .setDescription("This subcommand searches for a given song")
            .addStringOption(option =>
                option.setName("search").setDescription("search for keywords").setRequired(true)
            )
    )
    .addSubcommand(subcommand =>
        subcommand
            .setName("playlist")
            .setDescription("This command plays a given playlist based on URL")
            .addStringOption(option => option.setName("url").setDescription("URL of the given playlist").setRequired(true))
    )
    .addSubcommand(subcommand =>
        subcommand
            .setName("song")
            .setDescription("Plays a given song based on URL")
            .addStringOption(option => option.setName("url").setDescription("URL of the given song").setRequired(true))
    ),

    execute: async ({ client, interaction }) => {
        let messageEmbed = new EmbedBuilder();
        if (!interaction.member.voice.channel) {
            return interaction.reply({ embeds: [messageEmbed
                .setColor('#ff0000')
                .setTitle('Error')
                .setDescription('You need to be in a voice channel to use this command!')] });
        }

        const queue = await client.player.createQueue(interaction.guild);
        if (!queue.connection) await queue.connect(interaction.member.voice.channel);

        if (interaction.options.getSubcommand() === 'song') {
            let url = interaction.options.getString('url');

            const resultURL = await client.player.search(url, {
                requestedBy: interaction.user,
                searchEngine: QueryType.YOUTUBE_VIDEO
            });

            if (resultURL.tracks.length < 1) {
                messageEmbed.setColor('#ff0000').setTitle('Error').setDescription('No results found!');
                return interaction.reply({ embeds: [messageEmbed] });
            }

            const foundFirst = resultURL.tracks[0];
            await queue.addTrack(foundFirst);

            messageEmbed.setDescription(`Added -> ${foundFirst.title} - (${foundFirst.url}) to the song queue!`)
                .setColor('#00ff00')
                .setThumbnail(foundFirst.thumbnail)
                .setFooter({text: `Requested by: ${foundFirst.requestedBy.tag}`}, foundFirst.requestedBy.displayAvatarURL({ dynamic: true }));
                
        } else if (interaction.options.getSubcommand() === 'playlist') {
            let playlistURL = interaction.options.getString('url');

            const resultPlaylist = await client.player.search(playlistURL, {
                requestedBy: interaction.user,
                searchEngine: QueryType.YOUTUBE_PLAYLIST
            });

            if (resultPlaylist.tracks.length < 1) {
                messageEmbed.setColor('#ff0000').setTitle('Error').setDescription('No results found! The URL might not be a playlist!');
                return interaction.reply({ embeds: [messageEmbed] });
            }

            const foundPlaylist = resultPlaylist.tracks;
            await queue.addTracks(foundPlaylist);

            messageEmbed.setDescription(`Added -> ${foundPlaylist.length} songs to the song queue!`)
                .setColor('#00ff00')
                .setThumbnail(foundPlaylist[0].thumbnail)
                .setFooter({text: `Requested by: ${foundPlaylist[0].requestedBy.tag}`}, foundPlaylist[0].requestedBy.displayAvatarURL({ dynamic: true }));

        } else if (interaction.options.getSubcommand() === 'search') {
            let searchTerms = interaction.options.getString('searchterms');

            const resultSearch = await client.player.search(searchTerms, {
                requestedBy: interaction.user,
                searchEngine: QueryType.AUTO
            });

            if (resultSearch.tracks.length < 1) {
                messageEmbed.setColor('#ff0000').setTitle('Error').setDescription('No results found!');
                return interaction.reply({ embeds: [messageEmbed] });
            }

            const foundFirstSearch = resultSearch.tracks[0];
            await queue.addTrack(foundFirstSearch);

            messageEmbed.setDescription(`Added -> ${foundFirstSearch.title} (${foundFirstSearch.url}) to the song queue!`)
                .setColor('#00ff00')
                .setThumbnail(foundFirstSearch.thumbnail)
                .setFooter({text: `Requested by: ${foundFirstSearch.requestedBy.tag}`}, foundFirstSearch.requestedBy.displayAvatarURL({ dynamic: true }));

        } else {
            messageEmbed.setColor('#ff0000').setTitle('Error').setDescription('No subcommand was found!');
            await interaction.reply({ embeds: [messageEmbed] });
        }

        if (!queue.playing) await queue.play();
        await interaction.reply({ embeds: [messageEmbed] });
    },
};