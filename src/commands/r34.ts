import {
	ActionRowBuilder,
	ButtonBuilder,
	SlashCommandBuilder,
} from '@discordjs/builders';
import { Command } from '.';
import { ButtonStyle } from '@discordjs/core/http-only';

export const r34Command: Command = {
	data: new SlashCommandBuilder()
		.setName('r34')
		.setDescription('Uh oh!')
		.setNSFW(true)
		.addIntegerOption((option) =>
			option
				.setName('times')
				.setDescription(
					'The number of posts to fetch, defaults to 15'
				)
				.setMaxValue(100)
				.setMinValue(1)
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
		),

	defer_first: true,
	run: async (c, interaction, inputMap) => {
		const times: number = inputMap.get('times') ?? 15;
		const tags: string = inputMap.get('tags') ?? '';

		const whiteSpaceRegex = /\s+/;

		const inputTagsList = Array.from(
			new Set(tags.split(whiteSpaceRegex))
		);

		const tagsList = [];

		const filter: string = inputMap.get('filter') ?? '';

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

		await c
			.get('api')
			.interactions.followUp(
				interaction.application_id,
				interaction.token,
				{
					content: `input tags: \`${inputTagsText}\`\nraw tags:\`${
						queryTags.length ? queryTags : 'None'
					}\`\ntimes: \`${times}\``,
				}
			);

		const url =
			baseUrl +
			new URLSearchParams({
				page: 'dapi',
				s: 'post',
				q: 'index',
				json: '1',
				limit: times.toString(),
				tags: queryTags,
			}).toString();

		try {
			const posts = await fetch(url);
			const data = (await posts.json()) as any[];
			for (let i = 0; i < data.length; ) {
				let cnt = 5;
				let content = '';
				let order = 1;
				const row = new ActionRowBuilder<ButtonBuilder>();
				const sendOne =
					new ActionRowBuilder<ButtonBuilder>();
				while (cnt > 0 && i < data.length) {
					const original = `https://rule34.xxx/index.php?page=post&s=view&id=${data[i]['id']}`;
					content += `[flink${order}](`;
					content += data[i]['file_url'];
					content += ')';
					row.addComponents(
						new ButtonBuilder()
							.setURL(original)
							.setLabel(`${order}`)
							.setStyle(ButtonStyle.Link)
					);

					sendOne.addComponents(
						new ButtonBuilder()
							.setStyle(ButtonStyle.Primary)
							.setCustomId('r34-show-one@' + data[i]['id'])
							.setLabel(`${order}`)
					);

					// we need to specify the function that it runs as well
					// customId = it's like the roots
					// we need to specify handlers for
					cnt--;
					if (cnt) content += '        ';
					i++;
					order++;
				}

				await c
					.get('api')
					.interactions.followUp(
						interaction.application_id,
						interaction.token,
						{
							content,
							components: [row.toJSON(), sendOne.toJSON()],
						}
					);
				await new Promise((f) => setTimeout(f, 500));
			}
		} catch (err) {
			if (
				err instanceof SyntaxError &&
				err.message == 'Unexpected end of JSON input'
			) {
				await c
					.get('api')
					.interactions.followUp(
						interaction.application_id,
						interaction.token,
						{
							content: 'No posts found!',
						}
					);
			} else {
				await c
					.get('api')
					.interactions.followUp(
						interaction.application_id,
						interaction.token,
						{
							content: `${err}`,
						}
					);
			}
		}
	},
};
