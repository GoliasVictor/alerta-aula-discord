const Discord = require('discord.js');
const fs = require('fs');
const cron = require('node-cron');
const client = new Discord.Client();

client.once('ready', () => {
	console.log('Alerta Aula iniciado.');
	const classesRawData = fs.readFileSync('classes.json');
	const classes = JSON.parse(classesRawData);

	for (const cl in classes) {
		console.log(cl);
		for (let day = 1; day < 6; day++) {
			classes[cl][day].forEach(c => {
				const time = c.startingTime.split(':');
				const hour = time[0];
				const minutes = time[1];
				let cronRunning = false;
				cron.schedule(`${minutes} ${hour} * * ${c.day}`, () => {
					if (cronRunning) { return; }
					cronRunning = true;
					const channel = client.channels.cache.find(channels => channels.name === c.class.toLowerCase());
					const embed = new Discord.MessageEmbed()
						.setTitle(`Aula de ${c.name}`)
						.setColor('#0099ff')
						.setDescription('Informações sobre a aula:')
						.addFields(
							{ name: 'Horário de início:', value: c.startingTime },
							{ name: 'Horário de fim:', value: c.endingTime },
						)
						.setFooter('Alerta baseado nos horários oficiais da ETEC.');
					channel.send(`<@&${c.classId}>`);
					channel.send(embed);
					setTimeout(() => {
						cronRunning = false;
					}, 5000);
				}, {
					scheduled: true,
					timezone: 'America/Sao_Paulo',
				});
			});
		}
	}
});
client.login(process.env.BOT_TOKEN);