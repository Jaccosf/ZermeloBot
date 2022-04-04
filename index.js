const http = require('http');
const express = require("express");
const app = express();
const config = require('./config.json');

app.get("/", (req, res) => {
	res.sendStatus(200);
});

app.listen(config.port);

const fs = require('fs');
const UtilityClient = require("./lib/client");
const { Zermelo } = require("zermelo.ts");
const moment = require('moment-timezone');

const client = new UtilityClient(config.token);
const notifyTimeout = new Set();

client.on("ready", () => {
	client.user.setActivity('het rooster', {type: 'WATCHING'});
	client.logger.info(`Bot is ready. (${client.guilds.cache.size} Guilds - ${client.channels.cache.size} Channels - ${client.users.cache.size} Users)`);

	if (!client.database.has("knownCancelledLessons")) {
		client.database.set("knownCancelledLessons", []);
		client.logger.info("Created array: knownCancelledLessons");
	}

	client.setInterval(async () => {
		client.database.indexes.filter(name => !(name === "knownCancelledLessons")).forEach(async (uid) => {

			const accessToken = client.database.get(`${uid}`, "accessToken");
			const school = client.database.get(`${uid}`, "school");

			const ZermeloAPI = Zermelo.getAPI(school, accessToken);
			const appointments = await ZermeloAPI.appointments.getParticipations(moment(new Date()).tz("Europe/Amsterdam").format('yyyy'), moment(new Date()).tz("Europe/Amsterdam").format('W'));

      const appointment = appointments.filter(app => moment(new Date(app.start * 1000)).tz("Europe/Amsterdam").toDate() > moment(new Date()).tz("Europe/Amsterdam").toDate() && !app.cancelled)[0];

			if (!appointment) return;

			const difference = moment(new Date(appointment.start * 1000)).tz("Europe/Amsterdam").diff(moment(new Date()).tz("Europe/Amsterdam"));
			const diff = moment.duration(difference);

			let days = diff.days();
			let hours = diff.hours();
			let mins = diff.minutes();

			if (!notifyTimeout.has(uid) && parseInt(days) == 0 && parseInt(hours) == 0 && parseInt(mins) <= 10) {

				try {
					client.users.cache.get(uid).send(`:warning: | Over **${client.constants.parseTimeDifference(appointment.start).days()} dagen, ${client.constants.parseTimeDifference(appointment.start).hours()} uren en ${client.constants.parseTimeDifference(appointment.start).minutes()} minuten** begint de les **${appointment.subjects.join(", ")}** (${appointment.teachers.join(", ")}) in lokaal **${appointment.locations.join(", ")}**.`);
					client.logger.debug("Sended class notify to " + uid)
				} catch (err) {
					console.log(err)
				}

				notifyTimeout.add(uid);
				setTimeout(() => {
					notifyTimeout.delete(uid);
				}, 800000);
			}

		})
	}, 5000);

	client.setInterval(async () => {
		let knownCancelledLessons = client.database.get("knownCancelledLessons");

		client.database.indexes.filter(name => !(name === "knownCancelledLessons")).forEach(async (uid) => {
			let newCancelledLessons = [];

			const accessToken = client.database.get(`${uid}`, "accessToken");
			const school = client.database.get(`${uid}`, "school");

			const ZermeloAPI = Zermelo.getAPI(school, accessToken);
			const appointments = await ZermeloAPI.appointments.getParticipations(moment(new Date()).tz("Europe/Amsterdam").format('yyyy'), moment(new Date()).tz("Europe/Amsterdam").format('W')).catch((err)=>console.log(err));

			appointments.forEach(app => {
				if (app.cancelled && !knownCancelledLessons.includes(app.id)) {
					newCancelledLessons.push(app)
					client.database.push("knownCancelledLessons", app.id);
				}
			});

			if (newCancelledLessons.length >= 1) {
				newCancelledLessons.forEach(app => {
					try {
						client.users.cache.get(uid).send(`:no_entry_sign: | De les **${app.subjects.join(", ")}** (${app.teachers.join(", ")}) op **${client.constants.parseDate(app.start)}** om **${client.constants.parseTime(app.start)}** valt uit!`);
					} catch (err) {
						console.log(err)
					}
				})
			}
		})
	}, 5000);
});

process.on('unhandledException', () => {
	(async () => {
		await client.database.close()
	}).then(() => process.exit(1))
})

client.start();