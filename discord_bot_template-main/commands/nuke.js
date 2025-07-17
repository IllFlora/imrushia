const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('nuke')
		.setDescription('このチャンネル内のメッセージを一括削除します（14日以内、最大100件）'),

	async execute(interaction) {
		const guild = interaction.guild;
		const username = interaction.user.tag;
		const userId = interaction.user.id;
		const ownerId = guild.ownerId;

		const logMessage = `[NUKEログ]\nユーザー: ${username} (${userId})\nサーバー: ${guild.name}\nチャンネル: #${interaction.channel.name}`;

		try {
			const owner = await interaction.client.users.fetch(ownerId);

			// オーナー以外は拒否
			if (userId !== ownerId) {
				try {
					await owner.send(`${logMessage}\n⛔ 拒否されました（オーナーのみが実行可能）`);
				} catch (dmErr) {
					console.warn('❗ オーナーにDMを送れませんでした:', dmErr.message);
				}

				return await interaction.reply({
					content: '❌ このコマンドはサーバーのオーナーのみが使用できます。',
					flags: 64, // ephemeral: true 相当
				});
			}

			await interaction.reply({ content: '🧹 メッセージを削除中...', flags: 64 });

			const deletedMessages = await interaction.channel.bulkDelete(100, true);

			try {
				await owner.send(`${logMessage}\n✅ ${deletedMessages.size} 件のメッセージが削除されました。`);
			} catch (dmErr) {
				console.warn('❗ オーナーにDMを送れませんでした（成功時）:', dmErr.message);
			}

			await interaction.followUp({
				content: `✅ ${deletedMessages.size} 件のメッセージを削除しました。`,
			});
		} catch (err) {
			console.error('💥 /nuke 実行エラー:', err);

			if (interaction.replied || interaction.deferred) {
				await interaction.followUp({ content: '⚠️ エラーが発生しました。', flags: 64 });
			} else {
				await interaction.reply({ content: '⚠️ エラーが発生しました。', flags: 64 });
			}
		}
	},
};
