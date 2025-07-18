// events/messageCreate.js
module.exports = {
	name: 'messageCreate',
	async execute(message) {
		// BOT自身のメッセージは無視
		if (message.author.bot) return;

		// 「野獣先輩」が含まれているかどうか（大文字・小文字問わず）
		if (message.content.toLowerCase().includes('野獣先輩')) {
			// 送信するURL
			const url = 'https://video.laxd.com/a/content/SQSTQZRQoWtaZ470&suggest'; // 例：sm9など有名なネタ動画

			try {
				await message.reply(`野獣先輩…？こちらをご覧ください👉 ${url}`);
			} catch (err) {
				console.error('⚠️ 野獣先輩URL送信エラー:', err);
			}
		}
	}
};
