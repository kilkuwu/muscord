import MyContext from '../types/MyContext';
import {
	APIMessageComponentButtonInteraction,
	InteractionResponseType,
} from '@discordjs/core/http-only';
import { respondWithOneR34Post } from '../utils';

export interface Button {
	name: string;
	run: (
		c: MyContext,
		interaction: APIMessageComponentButtonInteraction
	) => Promise<void | Response>;
	defer_first?: boolean;
}

export const buttons: Button[] = [
	{
		name: 'r34-show-one',
		run: async (c, interaction) => {
			const id = interaction.data.custom_id
				.split('@')
				.at(1);
			if (id) {
				// we can do this
				const baseUrl =
					'https://api.rule34.xxx/index.php?page=dapi&s=post&q=index';

				const searchParams = new URLSearchParams({
					page: 'dapi',
					s: 'post',
					q: 'index',
					json: '1',
					limit: '1',
					// tags: queryTags,
				});

				searchParams.append('id', id);
				const url = baseUrl + searchParams.toString();

				try {
					const posts = await fetch(url);
					const data = ((await posts.json()) as any[])[0];
					return respondWithOneR34Post(c, data);
				} catch (err) {
					if (
						err instanceof SyntaxError &&
						err.message == 'Unexpected end of JSON input'
					) {
						return c.json({
							type: InteractionResponseType.ChannelMessageWithSource,
							data: {
								content: 'No posts found!',
							},
						});
					} else {
						return c.json({
							type: InteractionResponseType.ChannelMessageWithSource,
							data: {
								content: `${err}`,
							},
						});
					}
				}
			}
		},
	},
];

export const buttonMap = new Map<string, Button>();

for (const button of buttons) {
	buttonMap.set(button.name, button);
}
