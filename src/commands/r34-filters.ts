import {
	ActionRowBuilder,
	ModalBuilder,
	SlashCommandBuilder,
	TextInputBuilder,
} from '@discordjs/builders';
import { Command } from '.';
import { InteractionResponseType } from 'discord-api-types/v10';
import { TextInputStyle } from '@discordjs/core/http-only';

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
				.setMaxValue(3)
				.setRequired(true)
				.addChoices([
					{
						name: 'view',
						value: 0,
					},
					{
						name: 'add',
						value: 1,
					},
					{
						name: 'update',
						value: 2,
					},
					{
						name: 'delete',
						value: 3,
					},
				])
		),

	owner_only: true,
	run: async (c, interaction, inputMap) => {
		const action = inputMap.get('action') || 0;

		const filters = (await c.env.KV_STORE.get(
			'filters',
			'json'
		)) as any;

    console.log(action);

		if (action == 0) {
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

		if (action == 3) {
			const modal = new ModalBuilder()
				.setCustomId('r34FiltersDelete')
				.setTitle('Delete filters');
			const deleteListInput = new TextInputBuilder()
				.setCustomId('r34FiltersDeleteList')
				.setStyle(TextInputStyle.Paragraph)
				.setLabel('Delete List')
				.setPlaceholder(
					'Type in all filter name you want to delete, each on a line'
				);
			const firstRow =
				new ActionRowBuilder<TextInputBuilder>().addComponents(
					deleteListInput
				);
			modal.addComponents(firstRow);

			return c.json({
				type: InteractionResponseType.Modal,
				data: modal.toJSON(),
			});
		}
	},
};
