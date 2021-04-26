const { Zermelo } = require("zermelo.ts");
const Discord = require("discord.js");

module.exports.commandInfo = {
	name: 'link',
	usage: '<Schoolnaam> <Koppel_code>',
	description: "Link jouw account voor jouw rooster."
};

module.exports.execute = async (client, msg, args) => {
	if (msg.guild) {
		return client.constants.getMessage(msg, "CANT_USE_HERE");
	}
	
	const school = args[0];
	const code = args[1];

	if (school && code) {
		try {
			const accessToken = await Zermelo.getAccessToken(school, code);
			const userData = {
				school: school,
				accessToken: accessToken,
			}

			await client.database.set(`${msg.author.id}`, userData);
			msg.channel.send(client.constants.getEmoji("GREEN_TICK") + " | Succesfully saved your Zermelo data.")
		} catch (err) {
			console.log(err);
			return client.constants.getMessage(msg, "INVALID_TOKEN");
		}
	} else {
		return client.constants.argumentValidator(this, msg);
	}
};