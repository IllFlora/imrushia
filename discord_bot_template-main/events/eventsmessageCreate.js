// events/messageCreate.js
module.exports = {
	name: 'messageCreate',
	async execute(message) {
		if (message.author.bot) return;

		const content = message.content.trim().toLowerCase(); // 前後の空白を除去して小文字に変換

		// 「野獣先輩」を含む場合（部分一致）
		if (content.includes('野獣先輩')) {
			const url = 'https://video.laxd.com/a/content/SQSTQZRQoWtaZ470';
			try {
				await message.reply(`野獣先輩…？ ${url}`);
			} catch (err) {
				console.error('⚠️ 野獣先輩URL送信エラー:', err);
			}
			return;
		}

		// 「通信」を含むメッセージに反応
		if (content.includes('通信')) {
			try {
				await message.reply('縄');
			} catch (err) {
				console.error('⚠️ 通信メッセージ送信エラー:', err);
			}
			return;
		}

	}
