import { APIChatInputApplicationCommandInteraction } from 'discord-api-types/v10';
import MyContext from '../types/MyContext';
import { SlashCommandOptionsOnlyBuilder } from '@discordjs/builders';
import { pingCommand } from './ping';
import { dictCommand } from './dict';
import { r34Command } from './r34';
import { timerCommand } from './timer';
import { r34FiltersComamnd } from './r34-filters';

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
];

for (const command of commands) {
	commandMap.set(command.data.name, command);
}
