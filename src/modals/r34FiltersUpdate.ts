import {
	ActionRowBuilder,
	ModalBuilder,
	TextInputBuilder,
} from '@discordjs/builders';
import { Modal } from '.';
import {
	InteractionResponseType,
	TextInputStyle,
} from '@discordjs/core/http-only';

export const r34FiltersUpdateModal: Modal = {
	data: (() => {
		const modal = new ModalBuilder()
			.setCustomId('r34FiltersUpdate')
			.setTitle('Update A Filter');
		const keyInput = new TextInputBuilder()
			.setCustomId('r34FiltersUpdateKey')
			.setStyle(TextInputStyle.Short)
			.setLabel('Filter Key')
			.setPlaceholder(
				'(New key will be added to filter list)'
			);
		const valueInput = new TextInputBuilder()
			.setCustomId('r34FiltersUpdateValue')
			.setStyle(TextInputStyle.Paragraph)
			.setLabel('Filter Value');

		modal.addComponents(
			new ActionRowBuilder<TextInputBuilder>().addComponents(
				keyInput
			),
			new ActionRowBuilder<TextInputBuilder>().addComponents(
				valueInput
			)
		);
		return modal;
	})(),
	run: async (c, interaction) => {
		const filters = ((await c.env.KV_STORE.get(
			'filters',
			'json'
		)) || {}) as any;

		const key =
			interaction.data.components[0].components[0].value;
		const value =
			interaction.data.components[1].components[0].value;

		if (
			!filters.hasOwnProperty(key) ||
			value != filters[key]
		) {
			filters[key] = value;
			await c.env.KV_STORE.put(
				'filters',
				JSON.stringify(filters)
			);
		}

		const content =
			'Updated `' + key + '` to `' + value + '`.';

		return c.json({
			type: InteractionResponseType.ChannelMessageWithSource,
			data: {
				content,
			},
		});
	},
};
