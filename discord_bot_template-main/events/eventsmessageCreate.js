// events/messageCreate.js
module.exports = {
	name: 'messageCreate',
	async execute(message) {
		if (message.author.bot) return;

		const content = message.content.trim().toLowerCase(); // 前後の空白を除去して小文字に変換

		// 「野獣先輩」を含む場合（部分一致）
		if (content.includes('野獣先輩')) {
			const url = 'https://www.nicovideo.jp/watch/sm9';
			try {
				await message.reply(`野獣先輩…？こちらをご覧ください👉 ${url}`);
			} catch (err) {
				console.error('⚠️ 野獣先輩URL送信エラー:', err);
			}
			return;
		}

		// 「通信制高校」と完全一致した場合のみ
		if (content === '通信制高校') {
			try {
				await message.reply('恥ずかしくないの？w');
			} catch (err) {
				console.error('⚠️ 通信制高校メッセージ送信エラー:', err);
			}
			return;
		}
	}
};
