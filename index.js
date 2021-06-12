const Discord = require('discord.js');
const fs = require('fs');
const cron = require('node-cron');
const client = new Discord.Client();
const OpcoesCronograma =  {
	scheduled: true,
	timezone: 'America/Sao_Paulo',
};
 
function CriarEmbedAula(Nome, Comeco,Fim){
	return {
		title:`Aula de ${Nome}`,
		color:0x0099ff,
		description:'Informações sobre a aula:',
		fields:[
			{ name: 'Horário de início:', value: Comeco , inline: true},
			{ name: 'Horário de fim:', value: Fim , inline: true},
		],
		footer: {
			text: 'Alerta baseado nos horários oficiais da ETEC', 
		},
	} 
}
function EnviarNotificacaoAula(Classe,Aula){ 
	const channel = client.channels.cache.get(Classe.Canal);
	const embed = CriarEmbedAula(Aula.name,Aula.startingTime,Aula.endingTime)
	setTimeout(() => {
		channel.send(`<@&${Classe.classId}>`);
		channel.send({embed:embed});
	}, 10000);
} 
function EnviarAulasDoDia(Classe, Aulas){ 
	const channel = client.channels.cache.get(Classe.Canal);
	const embed = {
		title:`Aula de Hoje`,
		color:0x0099ff,
		description: "Cronograma das aulas",
		fields:Aulas.map((A) =>{return { name: `${A.startingTime} até ${A.endingTime}:`, value: "  "+A.name}}),
		footer: {
			text: 'Alerta baseado nos horários oficiais da ETEC', 
		},
	}
	setTimeout(() => {
		//channel.send(`<@&${c.classId}>`);
		channel.send({embed:embed});
	}, 10000);
} 
function MomentoToNum(Momento){
	const [hour,minutes] = Momento.split(':'); 
	return hour*60+minutes;
}
function ComparacaoMomento( a, b ){ 
	NA = MomentoToNum( a.startingTime);
	NB = MomentoToNum(b.startingTime)
	return NA < NB? -1 :  NA > NB? 1 : 0;
} 
function Marcar(Dia,Momento, Funcao){
	const [hour,minutes] = Momento.split(':'); 
	cron.schedule(`${minutes} ${hour} * * ${Dia}`, Funcao,OpcoesCronograma);
}
client.once('ready', () => {
	console.log('Alerta Aula iniciado.');
	const classesRawData = fs.readFileSync('classes.json');
	const classes = JSON.parse(classesRawData); 
	console.log(now = new Date(Date.now()));
	for (const cl in classes) {
		for (let day = 1; day < 6; day++) { 
			classes[cl][day][0].startingTime = `${now.getHours()}:${now.getMinutes()+1}`;  
			classes[cl][day].sort(ComparacaoMomento);  
			Marcar(day,classes[cl][day][0].startingTime,() =>  EnviarAulasDoDia(classes[cl],classes[cl][day]))
			classes[cl][day].forEach(c => { 
				Marcar(day,c.startingTime,() =>  EnviarNotificacaoAula(classes[cl],c))
			});
		}
	}
});
client.login(""); 