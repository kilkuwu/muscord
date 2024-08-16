import { Hono, Context } from 'hono';
import verifyDiscordRequest from './middlewares/verifyDiscordRequest';

import apiFromToken from './api';
import {
	APIChatInputApplicationCommandInteraction,
	APIInteraction,
	ApplicationCommandType,
	InteractionResponseType,
	InteractionType,
} from '@discordjs/core/http-only';
import E from './types/Env';
import chatInputApplicationCommandHandler from './handlers/chatInputApplicationCommandHandler';
import modalSubmitHandler from './handlers/modalSubmitHandler';

const app = new Hono<E>();

app.use(async (c, next) => {
	c.set('api', apiFromToken(c.env.DISCORD_TOKEN));
	await next();
});

app.get('/', async (c) => {
	return c.text(`Hello ${c.env.DISCORD_APPLICATION_ID}`);
});

app.get('/test', async (c) => {
	const filters = (await c.env.KV_STORE.get(
		'filters',
		'json'
	)) as any;
	console.log(filters);
	return c.json(filters);
});

app.get('/test2', async (c) => {
	await c.env.KV_STORE.put(
		'filters',
		JSON.stringify({
			basic:
				"-gay* -futa* -anthro*   -interspecies*  -animal* -feline* -comic* -monster* -winx* -size_difference -pokemon_(species) -alicorn* -king_of_the_hill  -cartoon* -male_only  -powerpuff_girls -wind_waker  -nickelodeon -rissma_(maewix1) -hazbin_hotel -furry -idw* -five_nights_at_freddy's -giratina -pseudoregalia -mass_effect -gacha  -tentacle* -ed_edd_n_eddy score:>=100",
		})
	);
	return c.text('Done!');
});

app.post('/', verifyDiscordRequest, async (c) => {
	const interaction: APIInteraction = await c.req.json();
	console.log('Interaction type', interaction.type);

	if (interaction.type == InteractionType.Ping) {
		return c.json({
			type: InteractionResponseType.Pong,
		});
	}

	if (
		interaction.type === InteractionType.ApplicationCommand
	) {
		if (
			interaction.data.type ==
			ApplicationCommandType.ChatInput
		) {
			return await chatInputApplicationCommandHandler(
				c,
				interaction as APIChatInputApplicationCommandInteraction
			);
		}
	} else if (
		interaction.type == InteractionType.ModalSubmit
	) {
		return await modalSubmitHandler(c, interaction);
	}
	return c.json({ error: 'Unknown Type' }, 400);
});

export default app;
