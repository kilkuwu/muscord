import { SlashCommandBuilder } from '@discordjs/builders';
import { Command } from '.';
import { InteractionResponseType } from '@discordjs/core/http-only';
import { r34FiltersDeleteModal } from '../modals/r34FiltersDelete';
import { r34FiltersUpdateModal } from '../modals/r34FiltersUpdate';

export const r34FiltersComamnd: Command = {
	data: new SlashCommandBuilder()
		.setName('r34-filters')
		.setDescription('Manipulate rule34 filters of the bot')
		.addIntegerOption((option) =>
			// view, add, delete, update
			option
				.setName('action')
				.setDescription('The action to do with filters')
				.setMinValue(0)
				.setMaxValue(2)
				.setRequired(true)
				.addChoices([
					{
						name: 'view',
						value: 0,
					},
					{
						name: 'update',
						value: 1,
					},
					{
						name: 'delete',
						value: 2,
					},
				])
		),

	owner_only: true,
	run: async (c, interaction, inputMap) => {
		const action = inputMap.get('action') || 0;

		if (action == 0) {
			const filters = (await c.env.KV_STORE.get(
				'filters',
				'json'
			)) as any;
			return c.json({
				type: InteractionResponseType.ChannelMessageWithSource,
				data: {
					content: `\`\`\`${JSON.stringify(
						filters,
						null,
						2
					)}\`\`\``,
				},
			});
		}

		if (action == 2) {
			return c.json({
				type: InteractionResponseType.Modal,
				data: r34FiltersDeleteModal.data.toJSON(),
			});
		}

		if (action == 1) {
			return c.json({
				type: InteractionResponseType.Modal,
				data: r34FiltersUpdateModal.data.toJSON(),
			});
		}
	},
};
