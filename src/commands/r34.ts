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
				.setMaxValue(50)
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
				.addChoices({
					name: 'basic',
					value: 'basic',
				})
		),

	defer_first: true,
	run: async (c, interaction, inputMap) => {
		const times: number = inputMap.get('times') || 15;
		const tags: string = inputMap.get('tags') || '';

		const whiteSpaceRegex = /\s+/;

		const inputTagsList = Array.from(
			new Set(tags.split(whiteSpaceRegex))
		);

		let tagsList = [...inputTagsList];

		const filter: string =
			inputMap.get('filter') || 'basic';

		const filters: any =
			(await c.env.KV_STORE.get('filters', 'json')) || {};

		for (const appliedFilter of filter.split(
			whiteSpaceRegex
		)) {
			const toAppend = filters[appliedFilter];
			if (toAppend) {
				tagsList = tagsList.concat(
					toAppend.split(whiteSpaceRegex)
				);
			}
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
				const row = new ActionRowBuilder<ButtonBuilder>();
				while (cnt > 0 && i < data.length) {
					content += data[i]['file_url'];
					const original = `https://rule34.xxx/index.php?page=post&s=view&id=${data[i]['id']}`;
					cnt--;
					if (cnt) content += '\n';

					row.addComponents(
						new ButtonBuilder()
							.setURL(original)
							.setLabel(`[${6 - cnt}]`)
							.setStyle(ButtonStyle.Link)
					);
					i++;
				}

				await c
					.get('api')
					.interactions.followUp(
						interaction.application_id,
						interaction.token,
						{
							content,
							components: [row.toJSON()],
						}
					);
				await new Promise((f) => setTimeout(f, 2000));
			}
		} catch (err) {
			await c
				.get('api')
				.interactions.followUp(
					interaction.application_id,
					interaction.token,
					{
						content: 'No posts found!',
					}
				);
		}
	},
};
