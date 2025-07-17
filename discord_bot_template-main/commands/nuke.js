const { SlashCommandBuilder } = require('discord.js');
const wait = require('node:timers/promises').setTimeout;

module.exports = {
	data: new SlashCommandBuilder()
		.setName('nuke')
		.setDescription('💣 爆破演出をします（メッセージは削除しません）'),

	async execute(client, interaction) {
		await interaction.reply({ content: '💣 起爆装置起動中...', ephemeral: false });

		await wait(1000);
		await interaction.channel.send('3️⃣');
		await wait(1000);
		await interaction.channel.send('2️⃣');
		await wait(1000);
		await interaction.channel.send('1️⃣ 💥');
		await wait(500);

		await interaction.channel.send({
			content: '💣 BOOM!!!\nhttps://media.tenor.com/MfYkVGGrdbkAAAAd/gord%C3%A3o-bomba-nuclear.gif'
		});

	},
};
