class Logger {
	static log(content, type = "info") {
		switch (type) {
			case "info": {
				return console.log(`[INFO] ${content}`);
			}
			case "warn": {
				return console.log(`[WARN] ${content}`);
			}
			case "error": {
				return console.log(`[ERROR] ${content}`);
			}
			case "debug": {
				return console.log(`[DEBUG] ${content}`);
			}
			default: throw new TypeError("Logger type must be either info, warn, debug, or error.");
		}
	}

	static error(content) {
		return this.log(content, "error");
	}

	static warn(content) {
		return this.log(content, "warn");
	}

	static debug(content) {
		return this.log(content, "debug");
	}

	static info(content) {
		return this.log(content, "info");
	}
}

module.exports = Logger;
