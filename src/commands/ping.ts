import { SlashCommandBuilder } from '@discordjs/builders';
import { Command } from '.';
import { InteractionResponseType } from '@discordjs/core/http-only';

export const pingCommand: Command = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Pong!'),
	defer_first: true,
	run: async (c, interaction) => {
		await c
			.get('api')
			.interactions.followUp(
				interaction.application_id,
				interaction.token,
				{
					content: 'Pong!',
				}
			);
	},
};
