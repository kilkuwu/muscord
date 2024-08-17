import {
	ActionRowBuilder,
	ButtonBuilder,
	SlashCommandBuilder,
} from '@discordjs/builders';
import { Command } from '.';
import {
	ButtonStyle,
	InteractionResponseType,
} from '@discordjs/core/http-only';
import { respondWithOneR34Post } from '../utils';

export const r34ShowOneCommand: Command = {
	data: new SlashCommandBuilder()
		.setName('r34-show-one')
		.setDescription('Uh oh!')
		.setNSFW(true)
		.addStringOption((option) =>
			option
				.setName('id')
				.setDescription(
					'The id of the post, random post if not set'
				)
		)
		.addStringOption((option) =>
			option
				.setName('tags')
				.setDescription(
					'The tags to filter posts, seperated by a space'
				)
		)
		.addStringOption((option) =>
			option
				.setName('filter')
				.setDescription(
					'List of predefined filters to apply to the tag list, seperated by a space'
				)
				.addChoices({
					name: 'basic',
					value: 'basic',
				})
		),

	run: async (c, interaction, inputMap) => {
		const id: string = inputMap.get('id') ?? '';

		const tags: string = inputMap.get('tags') ?? '';

		const whiteSpaceRegex = /\s+/;

		const inputTagsList = Array.from(
			new Set(tags.split(whiteSpaceRegex))
		);

		const tagsList = ['sort:random'];

		const filter: string =
			inputMap.get('filter') || 'basic';

		const filters: any =
			(await c.env.KV_STORE.get('filters', 'json')) || {};

		for (const appliedFilter of filter.split(
			whiteSpaceRegex
		)) {
			const toAppend = filters[appliedFilter];
			if (toAppend) {
				for (const item of toAppend.split(
					whiteSpaceRegex
				)) {
					tagsList.push(item);
				}
			}
		}

		for (const item of inputTagsList) {
			tagsList.push(item);
		}

		const uniqueTagsList = Array.from(new Set(tagsList));

		const queryTags = uniqueTagsList.join(' ');

		const baseUrl =
			'https://api.rule34.xxx/index.php?page=dapi&s=post&q=index';

		const inputTagsText = inputTagsList.join(' ').length
			? inputTagsList.join(' ')
			: 'None';

		const searchParams = new URLSearchParams({
			page: 'dapi',
			s: 'post',
			q: 'index',
			json: '1',
			limit: '1',
			// tags: queryTags,
		});

		if (id) {
			searchParams.append('id', id);
		} else {
			searchParams.append('tags', queryTags);
		}
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
	},
};
