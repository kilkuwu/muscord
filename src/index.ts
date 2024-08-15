import { Hono, Context } from 'hono';
import verifyDiscordRequest from './middlewares/verifyDiscordRequest';

import { commandMap } from './commands';
import apiFromToken from './api';
import {
	APIChatInputApplicationCommandInteraction,
	APIInteraction,
	InteractionResponseType,
	InteractionType,
} from 'discord-api-types/v10';
import E from './types/Env';

const app = new Hono<E>();

app.use(async (c, next) => {
	c.set('api', apiFromToken(c.env.DISCORD_TOKEN));
	await next();
});

app.get('/', async (c) => {
	return c.text(`Hello ${c.env.DISCORD_APPLICATION_ID}`);
});

app.post('/', verifyDiscordRequest, async (c) => {
	const interaction: APIInteraction = await c.req.json();

	if (interaction.type == InteractionType.Ping) {
		return c.json({
			type: InteractionResponseType.Pong,
		});
	}

	if (
		interaction.type === InteractionType.ApplicationCommand
	) {
		const name = interaction.data.name.toLowerCase();
		const command = commandMap.get(name);

		if (!command) {
			return c.json({ error: 'Unknown Command' }, 400);
		}

		const options =
			(
				interaction as APIChatInputApplicationCommandInteraction
			).data.options || [];

		const inputMap = new Map<string, any>();

		for (const opt of options) {
			const option = opt as {
				name: string;
				type: number;
				value: any;
			};
			if (option.value) {
				inputMap.set(option.name, option.value);
			}
		}

		c.executionCtx.waitUntil(
			(async () => {
				while (c.res.status != 200) {
					await new Promise<void>((f) => f());
				} // wait for the defer to be finshed

				await command.run(
					c,
					interaction as APIChatInputApplicationCommandInteraction,
					inputMap
				);
			})()
		);

		return c.json({
			type: InteractionResponseType.DeferredChannelMessageWithSource,
		});
	}

	return c.json({ error: 'Unknown Type' }, 400);
});

export default app;
