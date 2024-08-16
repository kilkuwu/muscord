import {
	ActionRowBuilder,
	ModalBuilder,
	TextInputBuilder,
} from '@discordjs/builders';
import { Modal } from '.';
import { InteractionResponseType, TextInputStyle } from '@discordjs/core/http-only';

export const r34FiltersDeleteModal: Modal = {
	data: (() => {
		const modal = new ModalBuilder()
			.setCustomId('r34FiltersDelete')
			.setTitle('Delete filters');
		const deleteListInput = new TextInputBuilder()
			.setCustomId('r34FiltersDeleteList')
			.setStyle(TextInputStyle.Paragraph)
			.setLabel('Delete List')
			.setPlaceholder(
				'All filter keys you want to delete, each on a seperate line'
			);
		const firstRow =
			new ActionRowBuilder<TextInputBuilder>().addComponents(
				deleteListInput
			);
		modal.addComponents(firstRow);
		return modal;
	})(),
	run: async (c, interaction) => {
		const deleted: string[] = [];

		const filters = (await c.env.KV_STORE.get(
			'filters',
			'json'
		)) as any;

		const deleteList =
			interaction.data.components[0].components[0].value.split(
				'\n'
			);


		if (filters) {
			for (const toDelete of deleteList) {
				if (filters.hasOwnProperty(toDelete)) {
					if (delete filters[toDelete]) {
						deleted.push(toDelete);
					}
				}
			}
		}

		if (deleted.length) {
			await c.env.KV_STORE.put(
				'filters',
				JSON.stringify(filters)
			);
		}

		const content = deleted.length
			? 'These keys were deleted successfully: `' +
			  deleted.join('`, `') +
			  '`.'
			: 'Nothing was deleted.';

		return c.json({
			type: InteractionResponseType.ChannelMessageWithSource,
			data: {
				content,
			},
		});
	},
};
