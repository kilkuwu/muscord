import {
	ActionRowBuilder,
	ButtonBuilder,
	SlashCommandBuilder,
} from '@discordjs/builders';
import { Command } from '.';
import { APIApplicationCommandStringOption } from 'discord-api-types/v10';
import { ButtonStyle } from '@discordjs/core/http-only';

export const rule34Command: Command = {
	data: new SlashCommandBuilder()
		.setName('rule34')
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

		const filters = new Map<string, string>([
			[
				'basic',
				"-gay* -futa* -anthro*   -interspecies*  -animal* -feline* -comic* -monster* -winx* -size_difference -pokemon_(species) -alicorn* -king_of_the_hill  -cartoon* -male_only  -powerpuff_girls -wind_waker  -nickelodeon -rissma_(maewix1) -hazbin_hotel -furry -idw* -five_nights_at_freddy's -giratina -pseudoregalia -mass_effect -gacha  -tentacle* -ed_edd_n_eddy score:>=100",
			],
		]);

		for (const appliedFilter of filter.split(
			whiteSpaceRegex
		)) {
			const toAppend = filters.get(appliedFilter);
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
