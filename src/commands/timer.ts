import { SlashCommandBuilder } from '@discordjs/builders';
import { Command } from '.';

export const timerCommand: Command = {
	data: new SlashCommandBuilder()
		.setName('countdown')
		.setDescription('Count down seconds...')
		.addIntegerOption((option) =>
			option
				.setName('seconds')
				.setDescription('Number of seconds to count down')
				.setRequired(true)
				.setMaxValue(25)
				.setMinValue(1)
		),
	run: async (c, interaction, inputMap) => {
		const seconds = inputMap.get('seconds') || 10;

		for (let i = seconds; i >= 1; i--) {
			await c
				.get('api')
				.interactions.editReply(
					interaction.application_id,
					interaction.token,
					{
						content: `${i} seconds remaining...`,
					}
				);
			await new Promise((f) => setTimeout(f, 1000));
		}

		await c
			.get('api')
			.interactions.editReply(
				interaction.application_id,
				interaction.token,
				{
					content: `Countdown finished!`,
				}
			);
	},
};
