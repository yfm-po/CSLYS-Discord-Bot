require('dotenv').config();
const fs = require('fs');
const path = require('path');

const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const { Player } = require('discord-player');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildVoiceStates] });
client.commands = new Collection();

let commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

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
 * @returns {Player} - Discord Audio Player
 * @description - Sets up the audio player
 */
const setUpAudioPlayer = (client, quality, highWaterMark) => {
    const player = new Player(client, {
        ytdlOptions: {
            quality: quality,
            highWaterMark: highWaterMark,
        }
    });
    return player;
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
            rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, id), 
            {body: commands})
            .then(() => console.log('Successfully updated commands for guild ' + id))
            .catch(console.error);
        }
    });
}

/**
 * 
 * @param {Client} client - Discord Client
 * @returns {void}
 * @description - Listener for interactions
 */
const interactionListener = async (client) => {
    client.on('interactionCreate', async (interaction) => {
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
    });
}

setUpCommands(commandFiles, commandsPath, commands);
client.player = setUpAudioPlayer(client, 'highestaudio', 1 << 25);
onClientReadyListener(client);
interactionListener(client);
client.login(process.env.TOKEN);


