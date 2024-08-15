import { APIChatInputApplicationCommandInteraction } from 'discord-api-types/v10';
import MyContext from '../types/MyContext';
import { SlashCommandOptionsOnlyBuilder } from '@discordjs/builders';
import { pingCommand } from './ping';
import { dictCommand } from './dict';
import { rule34Command } from './rule34';
import { timerCommand } from './timer';

export interface Command {
	data: SlashCommandOptionsOnlyBuilder;
	run: (
		c: MyContext,
		interaction: APIChatInputApplicationCommandInteraction,
		inputMap: Map<string, any>
	) => Promise<void>;
}

export const commandMap = new Map<string, Command>();

export const commands: Command[] = [
	pingCommand,
	dictCommand,
	rule34Command,
  timerCommand
];

for (const command of commands) {
	commandMap.set(command.data.name, command);
}
