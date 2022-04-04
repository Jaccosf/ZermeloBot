class Constants {
	static get preEmbedPadding() { return "\u200b" + "\n" }
	static get defaultImage() { return "https://discord.com/assets/322c936a8c8be1b803cd94861bdfa868.png" }

	static getEmoji(string) {
		if (string === "GREEN_TICK") return "✅";
		if (string === "RED_TICK") return "❌";
	}

	static getMessage(msg, string) {
		const utils = require("../lib/constants");
		let MESSAGE;

		switch (string) {
			case "NO_PERMISSION":
				MESSAGE = "You're not allowed to use that command.";
			break;
			case "CANT_USE_HERE":
				MESSAGE = "You cannot use that command in this channel, please use this command in the bot's DM.";
			break;
			case "INVALID_SETUP":
				MESSAGE = "You do not have your account linked properly.";
			break;
			case "INVALID_TOKEN":
				MESSAGE = "You have provided an invalid access token or school.";
			break;
			default: throw new TypeError("This is not a valid message type.");
		}

		return msg.channel.send(`${utils.getEmoji("RED_TICK")} | ${msg.author}: ${MESSAGE}`);
	}

	static async argumentValidator(_this, msg) {
		if (!_this.commandInfo.usage) return msg.channel.send(":no_entry_sign: Something went wrong.");
		return msg.channel.send(`This command requires at least ${_this.commandInfo.usage ? _this.commandInfo.usage.match(/</g).length : 0} argument${_this.commandInfo.usage.match(/</g).length == 1 ? "" : "s"}${_this.commandInfo.usage ? " (``" + _this.commandInfo.usage + "``)" : "" }.`);
	}

	static getTime() {
		const moment = require('moment-timezone');
		
		const result = moment(new Date()).tz("Europe/Amsterdam").format("HH:mm:ss")
		return "\`\`[" + result + "]\`\` ";
	}

	static parseTime(time) {
		const moment = require('moment-timezone');
		
		const result = moment(new Date(time * 1000)).tz("Europe/Amsterdam").format("HH:mm")
		return result;
	}

	static parseTimeDifference(time) {
		const moment = require('moment-timezone');
		
		const diff = moment(new Date(time * 1000)).tz("Europe/Amsterdam").diff(moment(new Date()).tz("Europe/Amsterdam"))

		const result = moment.duration(diff)//.format("DD [dagen] HH [uren] mm [minuten]")
		return result;
	}

	static parseDate(time) {
		const moment = require('moment-timezone');
		
		const result = moment(new Date(time * 1000)).tz("Europe/Amsterdam").format("DD-MM-yyyy")
		return result;
	}

	static getUptime(client) {
		let totalSeconds = (client.uptime / 1000);
		let days = Math.floor(totalSeconds / 86400);
		let hours = Math.floor(totalSeconds / 3600);
		totalSeconds %= 3600;
		let minutes = Math.floor(totalSeconds / 60);
		let seconds = totalSeconds % 60;
		return `${days} days, ${hours} hours, ${minutes} minutes, ${parseInt(seconds)} seconds`;
	}
}

module.exports = Constants;
