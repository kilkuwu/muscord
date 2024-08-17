import { modalMap } from '../modals';
import MyContext from '../types/MyContext';
import {
	APIModalSubmitInteraction,
	InteractionResponseType,
} from '@discordjs/core/http-only';

export default async function modalSubmitHandler(
	c: MyContext,
	interaction: APIModalSubmitInteraction
) {
	const modal = modalMap.get(interaction.data.custom_id);

	if (!modal) {
		return c.json({ error: 'Unknown Modal' }, 400);
	}

	if (!modal.defer_first) {
		return await modal.run(c, interaction);
	}

	c.executionCtx.waitUntil(
		(async () => {
			while (!c.res.ok) {
				await new Promise<void>((f) => f());
			} // wait for the defer to be finshed

			await modal.run(c, interaction);
		})()
	);
	return c.json({
		type: InteractionResponseType.DeferredChannelMessageWithSource,
	});
}
