import { config } from 'dotenv';
config({ path: '.dev.vars' });

import { commands } from './commands';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v10';

/**
 * Register all commands globally.  This can take o(minutes), so wait until
 * you're sure these are the commands you want.
 */

async function registerCommands(guildId: string = '') {
	const token = process.env.DISCORD_TOKEN;
	const applicationId = process.env.DISCORD_APPLICATION_ID;

	if (!token) {
		throw new Error(
			'The DISCORD_TOKEN environment variable is required.'
		);
	}
	if (!applicationId) {
		throw new Error(
			'The DISCORD_APPLICATION_ID environment variable is required.'
		);
	}

	const rest = new REST().setToken(token);

	try {
		console.log(
			`Started refreshing ${commands.length} application (/) commands.`
		);

		// The put method is used to fully refresh all commands in the guild with the current set
		const route =
			guildId.length != 0
				? Routes.applicationGuildCommands(
						applicationId,
						guildId
				  )
				: Routes.applicationCommands(applicationId);
		const data = await rest.put(route, {
			body: commands.map((command) =>
				command.data.toJSON()
			),
		});
		console.log(
			`Successfully reloaded application (/) commands.`
		);
		console.log(data);
	} catch (error) {
		// And of course, make sure you catch and log any errors!
		console.error(error);
	}
}

registerCommands(process.env.DISCORD_GUILD_ID);
