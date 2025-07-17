const { SlashCommandBuilder } = require('discord.js');
const wait = require('node:timers/promises').setTimeout;

module.exports = {
	data: new SlashCommandBuilder()
		.setName('nuke')
		.setDescription('💣 あの頃の躍動をもう一度'),

	async execute(client, interaction) {
		await interaction.reply({ content: '💣 リトルボーイ起動中...', ephemeral: false });

		await wait(1000);
		await interaction.channel.send('3️⃣');
		await wait(1000);
		await interaction.channel.send('2️⃣');
		await wait(1000);
		await interaction.channel.send('1️⃣ 💥');
		await wait(500);

		await interaction.channel.send({
			content: '💣 HIROSHIMA BOOM!!!',
			files: ['./nuke.gif']  // ローカルに置いたGIFを送信
		});
	},
};
