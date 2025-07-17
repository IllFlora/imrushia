const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Ping値を計測します'),

	async execute(interaction) {
		const ping = Math.round(interaction.client.ws.ping);
		await interaction.reply({ content: `計算中...`, ephemeral: true });
		await interaction.editReply({ content: `🏓 Pong! APIレイテンシ: ${ping}ms` });
	},
};
