client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	// ✅ /talk のみ特定チャンネル制限
	const allowedChannelIds = ['123456789012345678']; // ← 許可したいチャンネルIDをここに設定

	if (
		interaction.commandName === 'talk' &&
		!allowedChannelIds.includes(interaction.channelId)
	) {
		await interaction.reply({
			content: '⚠️ このチャンネルでは /talk コマンドは使えません。',
			ephemeral: true,
		});
		return;
	}

	try {
		await command.execute(interaction); // ← interactionのみ渡す
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'コマンドがありません', ephemeral: true });
	}
});
