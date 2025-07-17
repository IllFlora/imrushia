const { SlashCommandBuilder } = require('discord.js');
const path = require('path');
const wait = require('node:timers/promises').setTimeout;

module.exports = {
	data: new SlashCommandBuilder()
		.setName('nuke')
		.setDescription('💣 爆破演出をします（メッセージは削除しません）'),

	async execute(client, interaction) {
		try {
			// 最初に1回だけ reply
			await interaction.reply({ content: '💣 起爆装置起動中...', ephemeral: false });

			await wait(1000);
			await interaction.channel.send('3️⃣');
			await wait(1000);
			await interaction.channel.send('2️⃣');
			await wait(1000);
			await interaction.channel.send('1️⃣ 💥');
			await wait(500);

			const gifPath = path.join(__dirname, 'nuke.gif');

			await interaction.channel.send({
				content: '💣 BOOM!!!',
				files: [gifPath]
			});

		} catch (err) {
			console.error('nukeコマンドエラー:', err);

			// すでにreply済みなら followUp で対応
			if (interaction.replied || interaction.deferred) {
				await interaction.followUp({ content: 'エラーが発生しました。', ephemeral: true });
			} else {
				await interaction.reply({ content: 'エラーが発生しました。', ephemeral: true });
			}
		}
	},
};
