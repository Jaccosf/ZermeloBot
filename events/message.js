const Discord = require("discord.js");
const fs = require("fs");
const { sep } = require("path");

module.exports = async (client, msg) => {

	if (msg.author.bot) return;

	const args = msg.content.trim().split(/ +/);
	const command = args.shift().toLowerCase();

  const finalCmd = client.commands.get(command) || client.commands.find(cmd => cmd.commandInfo.aliases && cmd.commandInfo.aliases.includes(command));

  if (!finalCmd) return;

  if (finalCmd.commandInfo.globalAdmin && !client.admins.includes(msg.author.id)) return client.constants.getMessage(msg, "NO_PERMISSION");
  
  finalCmd.execute(client, msg, args);
	client.logger.debug(`${msg.author.tag} (${msg.author.id}) ran command ${finalCmd.commandInfo.name}.`)
}