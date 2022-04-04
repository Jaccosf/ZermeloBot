const { Collection, Client } = require("discord.js");
const fs = require("fs");
const { sep } = require("path");
const Enmap = require("enmap");
const config = require("../config.json");

class UtilityClient extends Client {
	constructor(_token) {
		super({
			ws: {
				intents: 32767,
			}
		});

		this.logger = require("./logger");
		this.constants = require("./constants");
		this.admins = config.admins;
		this.database = new Enmap({ name: 'database' });

		this.logger.info(`Connected to database.`);

		this.commands = new Collection();
		this.slashcommands = new Collection();

		this.start = (async () => {
			fs.readdirSync("./commands/").forEach(dirs => {
				const commands = fs.readdirSync(`./commands/${sep}${dirs}${sep}`).filter(files => files.endsWith(".js"));
				for (const file of commands) {
					const command = require(`../commands/${dirs}/${file}`);
					this.commands.set(command.commandInfo.name, command);
				}
			});

			fs.readdirSync("./commands/").forEach(dirs => {
				const commands = fs.readdirSync(`./commands/${sep}${dirs}${sep}`).filter(files => files.endsWith(".js"));
				for (const file of commands) {
					const command = require(`../commands/${dirs}/${file}`);
					if (command.commandInfo.hasSlashCommand) {
						this.slashcommands.set(command.commandInfo.name, command);
					}
				}
			});

			fs.readdirSync("./events/").forEach(file => {
				const eventName = file.split(".")[0];
				const event = require(`../events/${file}`);

				this.on(eventName, event.bind(null, this));
			});

			await this.login(_token);
		});
	}
}

module.exports = UtilityClient;