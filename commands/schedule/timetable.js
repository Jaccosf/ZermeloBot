const { Zermelo } = require("zermelo.ts");
const Discord = require("discord.js");
const moment = require('moment-timezone');
const table = require('markdown-table');

module.exports.commandInfo = {
	name: 'timetable',
	usage: '[user] [weeknumber]',
	description: "Bekijk jouw volledige rooster voor deze week.",
	aliases: ['fullschedule'],
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
		const userInfo = await ZermeloAPI.users.get();

		const weeknumber = !isNaN(args[1]) && parseInt(args[1]) >= 0 && parseInt(args[1]) <= 52 ? args[1] : moment(new Date()).tz("Europe/Amsterdam").format('W');

		const appointments = await ZermeloAPI.appointments.getParticipations(moment(new Date()).tz("Europe/Amsterdam").format('yyyy'), weeknumber);

		const tableArray = [];
		tableArray.push(["Vak", "Docent", "Datum", "Tijd", "Lokaal"])

		appointments.forEach(appointment => {
			if (!appointment.cancelled) 
        tableArray.push([
          appointment.subjects.join(", "),
          appointment.teachers.join(", "),
          client.constants.parseDate(appointment.start),
          client.constants.parseTime(appointment.start),
          appointment.locations.join(", ")
        ]);
		});

		msg.channel.send(
      client.constants.getEmoji("GREEN_TICK") +
      " | Volledige rooster voor leerling **" +
      userInfo.firstName +
      "** (Week " + weeknumber + ") geladen."
    );
		msg.channel.send(table(tableArray, { delimiterStart: false, delimitedEnd: false }), { code: true, split: true });
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
		const userInfo = await ZermeloAPI.users.get();

		const weeknumber = moment(new Date()).tz("Europe/Amsterdam").format('W');

		const appointments = await ZermeloAPI.appointments.getParticipations(moment(new Date()).tz("Europe/Amsterdam").format('yyyy'), weeknumber);

		const tableArray = [];
		tableArray.push(["Vak", "Docent", "Datum", "Tijd", "Lokaal"])

		appointments.forEach(appointment => {
			if (!appointment.cancelled) 
        tableArray.push([
          appointment.subjects.join(", "),
          appointment.teachers.join(", "),
          client.constants.parseDate(appointment.start),
          client.constants.parseTime(appointment.start),
          appointment.locations.join(", ")
        ]);
		});

		client.api.interactions(interaction.id, interaction.token).callback.post({
			data: {
				type: 4,
				data: {
					content: client.constants.getEmoji("GREEN_TICK") + ` | Volledige rooster voor leerling **${userInfo.firstName}** (Week ${weeknumber}) geladen.\n\`\`\`${table(tableArray, { delimiterStart: false, delimitedEnd: false })}\`\`\``
				}
			}
		})
	} catch (err) {
		console.log(err)
	}
};