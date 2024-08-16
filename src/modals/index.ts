import MyContext from '../types/MyContext';
import { APIModalSubmitInteraction } from '@discordjs/core/http-only';
import { r34FiltersDeleteModal } from './r34FiltersDelete';
import { ModalBuilder } from '@discordjs/builders';
import { r34FiltersUpdateModal } from './r34FiltersUpdate';

export interface Modal {
	data: ModalBuilder;
	run: (
		c: MyContext,
		interaction: APIModalSubmitInteraction
	) => Promise<void | Response>;
	defer_first?: boolean;
}
export const modals: Modal[] = [
	r34FiltersDeleteModal,
	r34FiltersUpdateModal,
];

export const modalMap = new Map<string, Modal>();

for (const modal of modals) {
	if (modal.data.data.custom_id) {
		modalMap.set(modal.data.data.custom_id, modal);
	}
}
