import { createMiddleware } from 'hono/factory';
import Bindings from '../bindings';
import { verifyKey } from 'discord-interactions';
import { HTTPException } from 'hono/http-exception';

const verifyDiscordRequest = createMiddleware<{ Bindings: Bindings }>(async (c, next) => {
	const signature = c.req.header('x-signature-ed25519');
	const timestamp = c.req.header('x-signature-timestamp');
	const body = await c.req.text();
	const isValidRequest = signature && timestamp && (await verifyKey(body, signature, timestamp, c.env.DISCORD_PUBLIC_KEY));
	if (!isValidRequest) {
		throw new HTTPException(401, { message: 'Bad request signature.' });
	}
	await next();
});

export default verifyDiscordRequest;
