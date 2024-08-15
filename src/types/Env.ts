import { Env } from 'hono';
import { API } from '@discordjs/core/http-only';
import { WorkerEntrypoint } from 'cloudflare:workers';

interface Myself extends WorkerEntrypoint {
  niceFunction: (arg: any) => Promise<any>;
}

export default interface E extends Env {
	Bindings: {
		DISCORD_APPLICATION_ID: string;
		DISCORD_PUBLIC_KEY: string;
		DISCORD_TOKEN: string;
    MYSELF: Myself
	};
	Variables: {
		api: API;
	};
}
