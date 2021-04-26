const Discord = require("discord.js");

module.exports.commandInfo = {
	name: 'eval',
	usage: '<string>',
	description: "Evaluate code.",
	globalAdmin: true
};

module.exports.execute = async (client, msg, args) => {
	try {
		const code = args.join(" ");
		const evaled = eval(code);
		const clean = await codeclean(client, evaled);

		if (!code) return await msg.channel.send("Unable to convert " + "``" + `${args.join(" ") ? args.join(" ") : "null"}` + "`` to ``string``.");

		msg.channel.send(clean, { code: 'js' });
	} catch (err) {
		msg.channel.send(await codeclean(client, err), { code: 'xl' });
	}
};

const codeclean = async (client, text) => {
	if (text && text.constructor.name == "Promise")
		text = await text;
	if (typeof evaled !== "string")
		text = require("util").inspect(text, {
			depth: 0
		});
	text = text
		.replace(/`/g, "`" + String.fromCharCode(8203))
		.replace(/@/g, "@" + String.fromCharCode(8203))
		.replace(client.token, "null");
	return text;
};