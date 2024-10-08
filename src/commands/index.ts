import { APIChatInputApplicationCommandInteraction } from '@discordjs/core/http-only';
import MyContext from '../types/MyContext';
import { SlashCommandOptionsOnlyBuilder } from '@discordjs/builders';
import { pingCommand } from './ping';
import { dictCommand } from './dict';
import { r34Command } from './r34';
import { timerCommand } from './timer';
import { r34FiltersComamnd } from './r34-filters';
import { r34ShowOneCommand } from './r34-show-one';

export interface Command {
	data: SlashCommandOptionsOnlyBuilder;
	run: (
		c: MyContext,
		interaction: APIChatInputApplicationCommandInteraction,
		inputMap: Map<string, any>
	) => Promise<void | Response>;
	owner_only?: boolean;
	defer_first?: boolean;
}

export const commandMap = new Map<string, Command>();

export const commands: Command[] = [
	pingCommand,
	dictCommand,
	r34Command,
	timerCommand,
	r34FiltersComamnd,
	r34ShowOneCommand,
];

for (const command of commands) {
	commandMap.set(command.data.name, command);
}
