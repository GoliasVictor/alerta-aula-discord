const Discord = require('discord.js');
const fs = require('fs');
const cron = require('node-cron');
const client = new Discord.Client();

client.once('ready', () => {
	console.log('Alerta Aula iniciado.');
	const classesRawData = fs.readFileSync('classes.json');
	const classes = JSON.parse(classesRawData);
	const embed = new Discord.MessageEmbed();

	cron.schedule('0 0 1-31 * 1-5', () => {
		const day = new Date().getDay();
		for (const cl in classes) {
			const todayClasses = classes[cl][day];
			todayClasses.forEach(c => {
				setTimeout(() => {
					const channel = client.channels.cache.find(channels => channels.name === c.class.toLowerCase());
					embed
						.setTitle(`Aula de ${c.name}`)
						.setColor('#0099ff')
						.setDescription('Informações sobre a aula:')
						.addFields(
							{ name: 'Horário de início:', value: c.startingTime },
							{ name: 'Horário de fim:', value: c.endingTime },
						)
						.setFooter('Alerta baseado no cronograma de aulas oficial');
					channel.send(embed);
				}, c.time);
			});
		}
	});
});

client.login(process.env.BOT_TOKEN);