import MyContext from '../types/MyContext';
import {
	APIModalSubmitInteraction,
	InteractionResponseType,
} from 'discord-api-types/v10';

export interface Modal {
	customId: string;
	run: (
		c: MyContext,
		interaction: APIModalSubmitInteraction
	) => Promise<void | Response>;
	defer_first?: boolean;
}

const modals: Modal[] = [
	{
		customId: 'r34FiltersDelete',
		run: async (c, interaction) => {},
	},
];

const modalMap = new Map<string, Modal>();

for (const modal of modals) {
	modalMap.set(modal.customId, modal);
}

export default async function modalSubmitHandler(
	c: MyContext,
	interaction: APIModalSubmitInteraction
) {
	const modal = modalMap.get(interaction.data.custom_id);

	if (!modal) {
		return c.json({ error: 'Unknown Modal' }, 400);
	}

	return c.json({
		type: InteractionResponseType.DeferredChannelMessageWithSource,
	});
}
