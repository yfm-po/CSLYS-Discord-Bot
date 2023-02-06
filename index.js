import dotenv from 'dotenv'; dotenv.config();
import fs from 'node:fs';
import path from 'node:path';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import { Client, Intents, Collection } from 'discord.js';
import { Player } from 'discord-player';

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_MESSAGES] });

const commands = [];
client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = await import(filePath);

    client.commands.set(command.data.name, command);
    commands.push(command.data.toJSON());
}

client.player = new Player(client, {
    ytdlOptions: {
        quality: 'highestaudio',
        highWaterMark: 1 << 25,
    }
});

client.on("ready", () => {
    logger.info(`Logged in as ${client.user.tag}!`);
    const IDs = client.guilds.cache.map(guild => guild.id);
    const rest = new REST({ version: '9' }).setToken(process.env.TOKEN);

    for (const id of IDs) {
        rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, id), { body: commands }).then(() => {
            logger.info(`Successfully registered application commands for ${id}`).catch(console.error);
        });
    }
});

client.on("interactionCreate", async (interaction) => {
    if (interaction.isCommand()) {
        const command = client.commands.get(interaction.commandName);

        if (!command) return;

        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
    }
});

client.login(process.env.TOKEN);

