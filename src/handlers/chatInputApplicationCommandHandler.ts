import MyContext from '../types/MyContext';
import { commandMap } from '../commands';
import {
	APIChatInputApplicationCommandInteraction,
	ApplicationCommandOptionType,
	InteractionResponseType,
} from '@discordjs/core/http-only';

export default async function chatInputApplicationCommandHandler(
	c: MyContext,
	interaction: APIChatInputApplicationCommandInteraction
) {
	const name = interaction.data.name.toLowerCase();
	const command = commandMap.get(name);

	if (!command) {
		return c.json({ error: 'Unknown Command' }, 400);
	}

	const invoked_user =
		interaction.member?.user ?? interaction.user;

	if (
		!invoked_user ||
		(command.owner_only &&
			invoked_user.id != c.env.DISCORD_APPLICATION_OWNER_ID)
	) {
		return c.json({
			type: InteractionResponseType.ChannelMessageWithSource,
			data: {
				content: 'Permissions denied!',
			},
		});
	}

	const options = interaction.data.options || [];

	const inputMap = new Map<string, any>();

	for (const opt of options) {
		switch (opt.type) {
			case ApplicationCommandOptionType.Subcommand:
			case ApplicationCommandOptionType.SubcommandGroup:
				// we will never do this
				break;
			default:
				inputMap.set(opt.name, opt.value);
				break;
		}
	}


	if (!command.defer_first) {
		return (await command.run(
			c,
			interaction,
			inputMap
		)) as Response;
	}

	c.executionCtx.waitUntil(
		(async () => {
			while (!c.res.ok) {
				await new Promise<void>((f) => f());
			} // wait for the defer to be finshed

			await command.run(c, interaction, inputMap);
		})()
	);

	return c.json({
		type: InteractionResponseType.DeferredChannelMessageWithSource,
	});
}
