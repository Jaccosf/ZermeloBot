const Discord = require("discord.js");
const fs = require("fs");
const { sep } = require("path");

module.exports.commandInfo = {
	name: "help",
	description: "Bekijk alle commando's van de bot.",
	usage: "[cmd]",
	aliases: ['cmds']
};

module.exports.execute = async (client, msg, args) => {

	if (args.length > 0 && args[0]) {
		const commandInfo = [];

		const command = client.commands.get(args[0].toLowerCase()) || client.commands.find(cmd => cmd.commandInfo.aliases && cmd.commandInfo.aliases.includes(args[0].toLowerCase()));
		if (!command) return msg.channel.send('No matching commands or aliases found!');

		commandInfo.push(`**${command.commandInfo.name}**`);
		commandInfo.push(`${command.commandInfo.description ? command.commandInfo.description : "No description."}`);
		commandInfo.push(`Basic usage: \`\`${command.commandInfo.name}${command.commandInfo.usage ? " " + command.commandInfo.usage : ""}\`\``);
		if (command.commandInfo.aliases) commandInfo.push(`Command aliases: \`\`${command.commandInfo.aliases.join(', ')}\`\``);

		msg.channel.send(commandInfo)
	} else {
		const embedColor = msg.guild.me.displayColor;

		const embed = new Discord.MessageEmbed()
			.setColor("#" + embedColor.toString(16))
			.setAuthor(client.user.username, client.user.avatarURL())

		const categories = fs.readdirSync("./commands/");
		categories.forEach(category => {
			const cmdList = [];

			const commands = fs.readdirSync(`./commands/${category}${sep}`).filter(files => files.endsWith(".js"));
			const capitalise = category.slice(0, 1).toUpperCase() + category.slice(1);

			for (const file of commands) {
				const command = require(`../../commands/${category}/${file}`);
				cmdList.push(`\`\`${command.commandInfo.name}${command.commandInfo.usage ? " " + command.commandInfo.usage : ""}\`\`${command.commandInfo.description ? " - " + command.commandInfo.description : " - No description."}`);
			}

			embed.addField(`${capitalise.replace("Globaladmin", "Global Admin")} Commands (${cmdList.length})`, cmdList)
		})

		await msg.channel.send(embed);
	}
};
