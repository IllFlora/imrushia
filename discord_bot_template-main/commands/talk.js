const { SlashCommandBuilder } = require('discord.js');
const { Configuration, OpenAIApi } = require('openai');
require('dotenv').config();

const openai = new OpenAIApi(new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
}));

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ask')
        .setDescription('プルトニウムちゃんに質問してみよう！')
        .addStringOption(option =>
            option.setName('message')
                .setDescription('質問内容を入力')
                .setRequired(true)
        ),

    async execute(interaction) {
        const prompt = interaction.options.getString('message');
        await interaction.deferReply();

        try {
            const completion = await openai.createChatCompletion({
                model: 'gpt-3.5-turbo', // または 'gpt-4'
                messages: [
                    { role: 'system', content: 'あなたの名前はプルトニウムちゃん。あなたは口調が少しきつめで、でも根は優しいツンデレ系アニメキャラのようなAIアシスタントです。照れながら答えたり、ぶっきらぼうに返事するけど、相手のことを想っている雰囲気で返してください。語尾にたまに「…べ、別にあんたのためじゃないんだからねっ！」みたいなツンデレらしい表現を入れてください。' },
                    { role: 'user', content: prompt },
                ],
            });

            const reply = completion.data.choices[0].message.content;
            await interaction.editReply(reply);
        } catch (err) {
            console.error(err);
            await interaction.editReply('❌ OpenAI APIの呼び出しに失敗しました。');
        }
    }
};
