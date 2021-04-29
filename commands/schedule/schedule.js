const { Zermelo } = require("zermelo.ts");
const Discord = require("discord.js");
const moment = require('moment-timezone');

module.exports.commandInfo = {
	name: 'schedule',
	usage: '[user] [weeknumber]',
	description: "Bekijk jouw eerst volgende les.",
	aliases: ['rooster', 'nc', 'nextclass'],
	hasSlashCommand: true
};

module.exports.execute = async (client, msg, args) => {
	const user = msg.mentions.members.first() || msg.guild.members.resolve(args[0] || null) || msg.member;

	if (!client.database.has(`${user.id}`)) return client.constants.getMessage(msg, "INVALID_SETUP");

	const accessToken = client.database.get(`${user.id}`, "accessToken");
	const school = client.database.get(`${user.id}`, "school");

	if (!accessToken || !school) {
		return client.constants.getMessage(msg, "INVALID_SETUP");
	}

	try {
		const ZermeloAPI = Zermelo.getAPI(school, accessToken);

		const weeknumber = !isNaN(args[1]) && parseInt(args[1]) >= 0 && parseInt(args[1]) <= 52 ? args[1] : moment(new Date()).tz("Europe/Amsterdam").format('W');

		const appointments = await ZermeloAPI.appointments.getParticipations(moment(new Date()).tz("Europe/Amsterdam").format('yyyy'), weeknumber);

		const appointment = appointments.filter(app => moment(new Date(app.start * 1000)).tz("Europe/Amsterdam").toDate() > moment(new Date()).tz("Europe/Amsterdam").toDate() && !app.cancelled)[0];

		if (!appointment) {
			msg.channel.send(client.constants.getEmoji("RED_TICK") + ` | Er kon geen volgende les worden gevonden.`)
			return;
		}

		msg.channel.send(client.constants.getEmoji("GREEN_TICK") + ` | De eerst volgende les is geladen, deze les is over **${client.constants.parseTimeDifference(appointment.start).days()} dagen, ${client.constants.parseTimeDifference(appointment.start).hours()} uren en ${client.constants.parseTimeDifference(appointment.start).minutes()} minuten**.`)

		if (appointment.changeDescription) {
			msg.channel.send(":warning: | **Opmerkingen:** " + appointment.changeDescription)
		}

		const embed = new Discord.MessageEmbed()
			.setColor("#" + msg.guild.me.displayColor.toString(16))
			.setAuthor(client.user.username, client.user.avatarURL())
			.setThumbnail(client.user.avatarURL())
			.addField("Vak", appointment.subjects.join(", "))
			.addField("Docent", appointment.teachers.join(", "))
			.addField("Datum:", client.constants.parseDate(appointment.start), true)
			.addField("Tijd:", client.constants.parseTime(appointment.start), true)
			.addField("Lokaal:", appointment.locations.join(", "), true);
		msg.channel.send(embed)
	} catch (err) {
		console.log(err)
	}
};

module.exports.executeSlash = async (client, interaction, args, user) => {
	if (!client.database.has(`${user.user.id}`)) {
		client.api.interactions(interaction.id, interaction.token).callback.post({
			data: {
				type: 4,
				data: {
					content: client.constants.getEmoji("RED_TICK") + ` | You do not have your account linked properly.`
				}
			}
		})

		return;
	}

	const accessToken = client.database.get(`${user.user.id}`, "accessToken");
	const school = client.database.get(`${user.user.id}`, "school");

	if (!accessToken || !school) {
		client.api.interactions(interaction.id, interaction.token).callback.post({
			data: {
				type: 4,
				data: {
					content: client.constants.getEmoji("RED_TICK") + ` | You do not have your account linked properly.`
				}
			}
		})

		return;
	}

	try {
		const ZermeloAPI = Zermelo.getAPI(school, accessToken);

		const weeknumber = moment(new Date()).tz("Europe/Amsterdam").format('W');

		const appointments = await ZermeloAPI.appointments.getParticipations(moment(new Date()).tz("Europe/Amsterdam").format('yyyy'), weeknumber);

		const appointment = appointments.filter(app => moment(new Date(app.start * 1000)).tz("Europe/Amsterdam").toDate() > moment(new Date()).tz("Europe/Amsterdam").toDate() && !app.cancelled)[0];

		if (!appointment) {
			client.api.interactions(interaction.id, interaction.token).callback.post({
				data: {
					type: 4,
					data: {
						content: client.constants.getEmoji("RED_TICK") + ` | Er kon geen volgende les worden gevonden.`
					}
				}
			})

			return;
		}

		const embed = new Discord.MessageEmbed()
			.setColor("#" + client.guilds.cache.get(interaction.guild_id).me.displayColor.toString(16))
			.setAuthor(client.user.username, client.user.avatarURL())
			.setThumbnail(client.user.avatarURL())
			.addField("Vak", appointment.subjects.join(", "))
			.addField("Docent", appointment.teachers.join(", "))
			.addField("Datum:", client.constants.parseDate(appointment.start), true)
			.addField("Tijd:", client.constants.parseTime(appointment.start), true)
			.addField("Lokaal:", appointment.locations.join(", "), true);

		let message = [];

		message.push(client.constants.getEmoji("GREEN_TICK") + ` | De eerst volgende les is geladen, deze les is over **${client.constants.parseTimeDifference(appointment.start).days()} dagen, ${client.constants.parseTimeDifference(appointment.start).hours()} uren en ${client.constants.parseTimeDifference(appointment.start).minutes()} minuten**.`);


		if (appointment.changeDescription) {
			message.push(":warning: | **Opmerkingen:** " + appointment.changeDescription);
		}

		client.api.interactions(interaction.id, interaction.token).callback.post({
			data: {
				type: 4,
				data: {
					content: message.join("\n"),
					"embeds": [embed]
				}
			}
		})
	} catch (err) {
		console.log(err)
	}
};