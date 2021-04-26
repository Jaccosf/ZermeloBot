const Discord = require("discord.js");
module.exports.commandInfo = {
	name: 'uptime',
	description: "View the uptime of the bot.",
	globalAdmin: true
};

module.exports.execute = async (client, msg, args) => {
	let totalSeconds = (client.uptime / 1000);
	let days = Math.floor(totalSeconds / 86400);
	let hours = Math.floor(totalSeconds / 3600);
	totalSeconds %= 3600;
	let minutes = Math.floor(totalSeconds / 60);
	let seconds = totalSeconds % 60;

	await msg.channel.send(`${client.user.username} was started ${days} days, ${hours} hours, ${minutes} minutes, ${parseInt(seconds)} seconds ago.`)
};