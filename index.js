const Discord = require('discord.js');
const fs = require('fs');
const cron = require('node-cron');
const client = new Discord.Client();
const day = new Date().getDay();


client.once('ready', () => {
	console.log('Alerta Aula iniciado.');
	const classesRawData = fs.readFileSync('classes.json');
	const classes = JSON.parse(classesRawData);

	cron.schedule('0 0 0 * * *', () => {
		for (const cl in classes) {
			console.log(classes[cl][day]);
			const todayClasses = classes[cl][day];
			todayClasses.forEach(c => {
				cron.schedule(c.time, () => {
					const channel = client.channels.cache.find(channels => channels.name === c.class.toLowerCase());
					channel.send(`A aula de ${c.name} está prestes a começar!`);
				});
			});
		}
	});
});

client.login(process.env.BOT_TOKEN);