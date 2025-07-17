const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('nuke')
		.setDescription('このチャンネル内のメッセージを一括削除します（14日以内、最大100件）')
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

	async execute(client, interaction) {
		try {
			// まずユーザーに応答
			await interaction.reply({ content: '🧹 メッセージを削除中...', ephemeral: true });

			const channel = interaction.channel;

			// 最大100件、14日以内のメッセージを削除
			const deletedMessages = await channel.bulkDelete(100, true);

			await interaction.followUp({
				content: `✅ ${deletedMessages.size} 件のメッセージを削除しました。`,
				ephemeral: false
			});
		} catch (err) {
			console.error('メッセージ削除エラー:', err);

			if (interaction.replied || interaction.deferred) {
				await interaction.followUp({ content: '⚠️ メッセージ削除に失敗しました。', ephemeral: true });
			} else {
				await interaction.reply({ content: '⚠️ メッセージ削除に失敗しました。', ephemeral: true });
			}
		}
	}
};
