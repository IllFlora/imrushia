const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');
const { weather_api_key } = require('../config.json');

const locationMap = {
    Nagano: { name: '長野', lat: 36.6513, lon: 138.181 },
    Fukushima: { name: '福島', lat: 37.75, lon: 140.4678 },
    Tokyo: { name: '東京', lat: 35.6895, lon: 139.6917 },
    Kanagawa: { name: '神奈川', lat: 35.4478, lon: 139.6425 },
    Hiroshima: { name: '広島', lat: 34.3853, lon: 132.4553 },
    Ibaraki: { name: '茨城', lat: 36.3418, lon: 140.4468 },
    Osaka: { name: '大阪', lat: 34.6937, lon: 135.5023 },
    Yamaguchi: { name: '山口', lat: 34.1859, lon: 131.4714 }
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('weather')
        .setDescription('指定した都市の今日と明日の天気を表示します')
        .addStringOption(option =>
            option.setName('city')
                .setDescription('都市を選んでください')
                .setRequired(true)
                .addChoices(
                    ...Object.entries(locationMap).map(([key, value]) => ({
                        name: value.name,
                        value: key
                    }))
                )
        ),

    async execute(client, interaction) {
        const cityKey = interaction.options.getString('city');
        const loc = locationMap[cityKey];
        const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${loc.lat}&lon=${loc.lon}&appid=${weather_api_key}&units=metric&lang=ja`;

        try {
            const res = await axios.get(url);
            const list = res.data.list;

            // 日付の準備
            const now = new Date();
            const todayStr = now.toISOString().split('T')[0];
            const tomorrowStr = new Date(now.setDate(now.getDate() + 1)).toISOString().split('T')[0];

            // 各日の午前9時のデータを抽出
            const today = list.find(f => f.dt_txt.includes(`${todayStr} 09:00:00`));
            const tomorrow = list.find(f => f.dt_txt.includes(`${tomorrowStr} 09:00:00`));

            if (!today || !tomorrow) {
                return await interaction.reply({
                    content: '⚠️ 今日または明日の天気データが見つかりませんでした。',
                    flags: 64
                });
            }

            const format = (data, label) => {
                const temp = data.main.temp.toFixed(1);
                const humid = data.main.humidity;
                const pop = (data.pop * 100).toFixed(0);
                const weather = data.weather[0].description;

                return `**${label}**（${weather}）\n🌡 気温: ${temp}℃\n💧 湿度: ${humid}%\n☔ 降水確率: ${pop}%`;
            };

            const embed = new EmbedBuilder()
                .setTitle(`${loc.name}の天気予報`)
                .setDescription([
                    format(today, '今日'),
                    format(tomorrow, '明日')
                ].join('\n\n'))
                .setColor(0x1e90ff)
                .setFooter({ text: '提供：OpenWeatherMap' });

            await interaction.reply({ embeds: [embed] });

        } catch (err) {
            console.error('❌ 天気APIエラー:', err);

            try {
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp({
                        content: '⚠️ 天気情報の取得に失敗しました。',
                        flags: 64
                    });
                } else {
                    await interaction.reply({
                        content: '⚠️ 天気情報の取得に失敗しました。',
                        flags: 64
                    });
                }
            } catch (innerErr) {
                console.error('⚠️ エラーレスポンス送信失敗:', innerErr);
            }
        }
    }
};
