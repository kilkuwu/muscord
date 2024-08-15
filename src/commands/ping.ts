import { SlashCommandBuilder } from '@discordjs/builders';
import { Command } from '.';

export const pingCommand: Command = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Pong!'),
	run: async (c, interaction) => {
		const response = await c
			.get('api')
			.interactions.followUp(
				interaction.application_id,
				interaction.token,
				{
					content: 'Pong!',
				}
			);
		console.log(response);
	},
};
