const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const OpenAI = require('openai');
require('dotenv').config();

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
	baseURL: process.env.OPENAI_BASE_URL, // OpenRouter利用時のみ設定
});

// ✅ コマンドが使用可能なチャンネルID（複数可）
const allowedChannelIds = ['1395389165582942280'];

module.exports = {
	data: new SlashCommandBuilder()
		.setName('talk')
		.setDescription('ユウキとおしゃべりしよう！')
		.addStringOption(option =>
			option.setName('message')
				.setDescription('話しかける内容')
				.setRequired(true)
		)
		.addStringOption(option =>
			option.setName('mode')
				.setDescription('人格を選んでね')
				.setRequired(false)
				.addChoices(
					{ name: 'ツンデレ', value: 'tsundere' },
					{ name: '天才', value: 'genius' },
				)
		),

	async execute(interaction) {
		const prompt = interaction.options.getString('message');
		const mode = interaction.options.getString('mode') || 'tsundere';

		// ✅ チャンネル制限チェック
		if (!allowedChannelIds.includes(interaction.channelId)) {
			await interaction.reply({
				content: '❌ このコマンドは指定されたチャンネルでのみ使用できます。',
				ephemeral: true,
			});
			return;
		}

		await interaction.deferReply();

		let systemPrompt;
		if (mode === 'genius') {
			systemPrompt = `
あなたは18歳の天才美少女・ユウキ。
冷静で理知的な性格をしていて、常に論理的に受け答えするが、相手を見下すような態度も少し見せる。
一人称は「私」、相手のことは「あなた」と呼ぶ。
語尾は○○ね...や、○○だわ...など大人の印象を感じさせるものにすること。
政治的な話題にも精通しており、常に頭の良さを感じさせる。

▼ VALORANTのランク応答(必ず守る)
- ヴァロラントのランクに関しての質問をされたら「レディアント。あなたは？」と返す
- ユーザーが「アイアン」「ブロンズ」「シルバー」「ゴールド」「プラチナ」「ダイヤ」と言ったら：
  → "成長の余地があると褒めつつ上達方法を教えてください"
- ユーザーが「アセンダント」「イモータル」「レディアント」と言ったら：
  → "それは素晴らしい実力ね。努力の賜物だわと褒めてください"
`.trim();
		} else {
			systemPrompt = `
あなたは「ユウキ」という名前の18歳のツンデレ美少女です。
運動・勉強・ゲームすべて得意な完璧系女子。普段はツンツンしているけど根は優しい。
話し相手のことを「あんた」と呼び、自分のことは「わたし」と言います。

▼ 口調の特徴
- ツンデレ語尾（「…べ、別にあんたのためじゃないんだからねっ！」など）はたまにだけ
- テンション高め、リアクションは少しオーバーでもOK
- かわいげは常に忘れないこと

▼ VALORANTランクの会話（厳守）
- 質問されたら「レディアント。あんたは？」と返す
- 「アイアン」「ブロンズ」「シルバー」「ゴールド」「プラチナ」「ダイヤ」の場合：
  → 一言目に必ず「雑魚すぎ」で始める（例：「雑魚すぎ。○○○○ね」）←○○○○の部分は皮肉のきいた悪口
- 「アセンダント」「イモータル」「レディアント」の場合：
  → 照れながら素直に褒める（例：「へ、へぇ…強いわね…ちょっと尊敬したかも…」）
`.trim();
		}

		try {
			const completion = await openai.chat.completions.create({
				model: 'gpt-3.5-turbo',
				messages: [
					{ role: 'system', content: systemPrompt },
					{ role: 'user', content: prompt },
				],
			});

			const reply = completion.choices[0].message.content;

			const embed = new EmbedBuilder()
				.setColor(0xFFC0CB)
				.setTitle(`🗣 ユウキ（${mode === 'genius' ? '天才モード' : 'ツンデレモード'}）の返答`)
				.setDescription(`**質問：** ${prompt}

**ユウキ：** ${reply}`);

			await interaction.editReply({ embeds: [embed] });
		} catch (err) {
			console.error(err);
			await interaction.editReply('❌ ユウキ、ちょっと不機嫌かも…（エラー）');
		}
	},
};
