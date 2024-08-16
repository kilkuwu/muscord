import { SlashCommandBuilder } from '@discordjs/builders';
import { Command } from '.';

export const dictCommand: Command = {
	data: new SlashCommandBuilder()
		.setName('dict')
		.setDescription('Finds definitions of a word!')
		.addStringOption((option) =>
			option
				.setName('word')
				.setDescription('The word to find definitions for')
		),
	defer_first: true,
	run: async (c, interaction) => {
		await c
			.get('api')
			.interactions.followUp(
				interaction.application_id,
				interaction.token,
				{
					content: 'Dictionary called!',
				}
			);
	},
};
