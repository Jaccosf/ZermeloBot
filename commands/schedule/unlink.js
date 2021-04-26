const { Zermelo } = require("zermelo.ts");
const Discord = require("discord.js");

module.exports.commandInfo = {
	name: 'unlink',
	description: "Unlink jouw account."
};

module.exports.execute = async (client, msg, args) => {
	if (client.database.has(msg.author.id)) {
		client.database.delete(msg.author.id)
		msg.channel.send(client.constants.getEmoji("GREEN_TICK") + " | Succesfully removed your Zermelo data.")
	} else {
		msg.channel.send(client.constants.getEmoji("RED_TICK") + " | You do not have any Zermelo data linked.")
	}
};