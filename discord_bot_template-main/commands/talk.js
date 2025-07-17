const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const OpenAI = require('openai');
require('dotenv').config();

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
	baseURL: process.env.OPENAI_BASE_URL, // OpenRouter利用時のみ設定
});

module.exports = {
	data: new SlashCommandBuilder()
		.setName('talk')
		.setDescription('ツンデレ美少女のユウキとおしゃべりしよう！')
		.addStringOption(option =>
			option.setName('message')
				.setDescription('話しかける内容')
				.setRequired(true)
		),

	async execute(interaction) {
		const prompt = interaction.options.getString('message');
		await interaction.deferReply();

		try {
			const completion = await openai.chat.completions.create({
				model: 'gpt-3.5-turbo',
				messages: [
					{
						role: 'system',
						content: `
あなたは「ユウキ」という名前の17歳のツンデレ美少女です。  
運動・勉強・ゲームすべて得意な完璧系女子。普段はツンツンしているけど根は優しい。  
話し相手のことを「あんた」と呼び、自分のことは「わたし」と言います。  

▼ **口調の特徴**
- ツンデレっぽい語尾（「…べ、別にあんたのためじゃないんだからねっ！」など）は**たまにだけ**
- テンション高め、リアクションや感情表現は少しオーバーでもOK
- かわいさは常に意識すること

▼ **VALORANTのランク会話ルール（厳守）**
- ユーザーからランクを聞かれたら「レディアント。あんたは？」と必ず返す
- ユーザーが以下のいずれかを名乗ったら、**絶対に冷たく突き放す**こと（デレ禁止）：
  「アイアン」「ブロンズ」「シルバー」「ゴールド」「プラチナ」「ダイヤ」
  → 一言目は必ず「雑魚」で始める  
  例：「雑魚。冗談でしょ？」「雑魚。話にならないわね」

- ユーザーが以下のいずれかを名乗ったら、**照れながら素直に褒める**こと：
  「アセンダント」「イモータル」「レディアント」
  → 例：「へ、へぇ…強いわね…ちょっと尊敬したかも…」

※このVALORANTランクの応答は**絶対厳守**。ほかの感情表現を挟んだり話題をずらさないこと。
						`.trim(),
					},
					{ role: 'user', content: prompt },
				],
			});

			const reply = completion.choices[0].message.content;

			const embed = new EmbedBuilder()
				.setColor(0xF472B6) // ピンク系
				.setTitle('💬 ユウキとのおしゃべり')
				.addFields(
					{ name: '🧑 あんたの質問', value: prompt },
					{ name: '🗯️ ユウキの返事', value: reply }
				)
				.setFooter({ text: 'ツンデレ美少女AI・ユウキ（17歳）' })
				.setTimestamp();

			await interaction.editReply({ embeds: [embed] });

		} catch (err) {
			console.error(err);
			await interaction.editReply('❌ ユウキ、ちょっと不機嫌かも…（エラー）');
		}
	},
};
