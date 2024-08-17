import {
	APIInteractionResponseChannelMessageWithSource,
	ButtonStyle,
	InteractionResponseType,
} from '@discordjs/core/http-only';
import MyContext from '../types/MyContext';
import {
	ActionRowBuilder,
	ButtonBuilder,
	EmbedBuilder,
} from '@discordjs/builders';

export const respondWithOneR34Post = async (
	c: MyContext,
	data: any
) => {
	const { id, file_url, tags, rating, score } = data;
	const original = `https://rule34.xxx/index.php?page=post&s=view&id=${id}`;

	let content = '```tags: ' + tags + '\n';
	content += `score: ${score}\nrating: ${rating}`;
	content += '```';
	content += `[link](${file_url})\n`;
	const row = new ActionRowBuilder<ButtonBuilder>();
	// const sendOne = new ActionRowBuilder<ButtonBuilder>();
	row.addComponents(
		new ButtonBuilder()
			.setURL(original)
			.setLabel(`Source`)
			.setStyle(ButtonStyle.Link)
	);

	// sendOne.addComponents(
	// 	new ButtonBuilder()
	// 		.setStyle(ButtonStyle.Primary)
	// 		.setCustomId('r34-show-one@' + data[i]['id'])
	// 		.setLabel(`${order}`)
	// );
	const responseData: APIInteractionResponseChannelMessageWithSource =
		{
			type: InteractionResponseType.ChannelMessageWithSource,
			data: {
				content,
				components: [row.toJSON()],
				// embeds: [
				// 	new EmbedBuilder()
				// 		.setTitle(id.toString())
				// 		.setDescription(tags.toString())
				// 		.addFields(
				// 			{
				// 				name: 'Score',
				// 				value: score.toString(),
				// 				inline: true,
				// 			},
				// 			{
				// 				name: 'Rating',
				// 				value: rating.toString(),
				// 				inline: true,
				// 			}
				// 		)
				// 		.toJSON(),
				// ],
			},
		};
	return c.json(responseData);
};
