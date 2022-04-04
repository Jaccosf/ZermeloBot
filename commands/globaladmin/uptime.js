const Discord = require("discord.js");
module.exports.commandInfo = {
	name: 'uptime',
	description: "Bekijk hoe lang de bot al draaiende is.",
	globalAdmin: true
};

module.exports.execute = async (client, msg, args) => {
	let totalSeconds = (client.uptime / 1000);
	let days = Math.floor(totalSeconds / 86400);
	let hours = Math.floor(totalSeconds / 3600);
	totalSeconds %= 3600;
	let minutes = Math.floor(totalSeconds / 60);
	let seconds = totalSeconds % 60;

	await msg.channel.send(`${client.user.username} is ${days} dagen, ${hours} uren, ${minutes} minuten, ${parseInt(seconds)} seconden geleden gestart.`)
};