import dotenv from 'dotenv'; dotenv.config();
import fs from 'node:fs';
import path from 'node:path';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import { Client, Intents, Collection } from 'discord.js';
import { Player } from 'discord-player';

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_MESSAGES] });
client.commands = new Collection();

let commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

this.setUpCommands(commandFiles, commandsPath, commands);
this.setUpAudioPlayer(client, 'highestaudio', 1 << 25);
this.onClientReadyListener(client);
this.interactionListener(client, interaction);
client.login(process.env.TOKEN);

/**
 * 
 * @param {Array} commandFiles - Array of command files
 * @param {String / Path} commandsPath - Path to commands folder
 * @param {Array} commands - Array of commands
 * @returns {void}
 * @description - Sets up commands
 */
const setUpCommands = (commandFiles, commandsPath, commands) => {
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
    
        client.commands.set(command.data.name, command);
        commands.push(command);
    }
}

/**
 * 
 * @param {Client} client - Discord Client
 * @param {String} quality - Quality of audio
 * @param {Number} highWaterMark - High Water Mark
 * @returns {void}
 * @description - Sets up the audio player
 */
const setUpAudioPlayer = (client, quality, highWaterMark) => {
    client.player = new Player(client, {
        ytdlOptions: {
            quality: quality,
            highWaterMark: highWaterMark,
        }
    });
}

/**
 * 
 * @param {Client} client - Discord Client
 * @returs {void}
 * @description - Registers commands to all guilds the bot is in 
 */
const onClientReadyListener = (client) => {
    client.on("ready", () => {
        logger.info(`Logged in as ${client.user.tag}!`);
        client.user.setActivity("with your mom", { type: "PLAYING" });
    
        const IDs = client.guilds.cache.map(guild => guild.id);
        const rest = new REST({ version: '9' }).setToken(process.env.TOKEN);
    
        for (const id of IDs) {
            rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, id), { body: commands }).then(() => {
                logger.info(`Successfully registered application commands for ${id}`).catch(console.error);
            });
        }
    });
}

/**
 * 
 * @param {Interaction} interaction - Interaction object
 * @returns {void}
 * @description - Listener for interactions
 */
const interactionListener = async (client, interaction) => {
    if (interaction.isCommand()) {
        const command = client.commands.get(interaction.commandName);

        if (command != null) {
            try {
                await command.execute(client, interaction);
            } catch (error) {
                console.error(error);
                await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
            }
        }
    }
}


