const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('nuke')
		.setDescription('このチャンネル内のメッセージを一括削除します（14日以内、最大100件）'),

	async execute(client, interaction) {
		const guild = interaction.guild;
		const username = interaction.user.tag;
		const userId = interaction.user.id;
		const ownerId = guild.ownerId;

		const logMessage = `[NUKEログ]\nユーザー: ${username} (${userId})\nサーバー: ${guild.name}\nチャンネル: #${interaction.channel.name}`;

		// サーバーオーナーのUserオブジェクトを取得
		const owner = await client.users.fetch(ownerId);

		try {
			// ログ：オーナーのDMに送信（まず試みる）
			await owner.send(`${logMessage}\n⛔ 拒否されました（オーナーのみが実行可能）`);
		} catch (dmErr) {
			console.warn('❗ オーナーにDMを送れませんでした:', dmErr.message);
		}

		if (userId !== ownerId) {
			return await interaction.reply({
				content: '❌ このコマンドはサーバーのオーナーのみが使用できます。',
				ephemeral: true
			});
		}

		try {
			await interaction.reply({ content: '🧹 メッセージを削除中...', ephemeral: true });

			const deletedMessages = await interaction.channel.bulkDelete(100, true);

			// ログをオーナーにDMで送信（成功時）
			try {
				await owner.send(`${logMessage}\n✅ ${deletedMessages.size} 件のメッセージが削除されました。`);
			} catch (dmErr) {
				console.warn('❗ オーナーにDMを送れませんでした（成功時）:', dmErr.message);
			}

			await interaction.followUp({
				content: `✅ ${deletedMessages.size} 件のメッセージを削除しました。`,
				ephemeral: false
			});
		} catch (err) {
			console.error('💥 /nuke 実行エラー:', err);

			if (interaction.replied || interaction.deferred) {
				await interaction.followUp({ content: '⚠️ エラーが発生しました。', ephemeral: true });
			} else {
				await interaction.reply({ content: '⚠️ エラーが発生しました。', ephemeral: true });
			}
		}
	}
};
