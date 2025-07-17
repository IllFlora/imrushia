const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');
const { weather_api_key } = require('../config.json');

const locationMap = {
    Sapporo: { name: '札幌', lat: 43.0667, lon: 141.35 },
    Sendai: { name: '仙台', lat: 38.2688, lon: 140.8721 },
    Fukushima: { name: '福島', lat: 37.75, lon: 140.4678 },
    Tokyo: { name: '東京', lat: 35.6895, lon: 139.6917 },
    Yokohama: { name: '横浜', lat: 35.4437, lon: 139.638 },
    Nagano: { name: '長野', lat: 36.6513, lon: 138.181 },
    Nagoya: { name: '名古屋', lat: 35.1815, lon: 136.9066 },
    Kanazawa: { name: '金沢', lat: 36.5613, lon: 136.6562 },
    Shizuoka: { name: '静岡', lat: 34.9756, lon: 138.3828 },
    Osaka: { name: '大阪', lat: 34.6937, lon: 135.5023 },
    Kyoto: { name: '京都', lat: 35.0116, lon: 135.7681 },
    Kobe: { name: '神戸', lat: 34.6901, lon: 135.1955 },
    Okayama: { name: '岡山', lat: 34.6551, lon: 133.9195 },
    Hiroshima: { name: '広島', lat: 34.3853, lon: 132.4553 },
    Yamaguchi: { name: '山口', lat: 34.1859, lon: 131.4714 },
    Takamatsu: { name: '高松', lat: 34.3402, lon: 134.0434 },
    Matsuyama: { name: '松山', lat: 33.8392, lon: 132.7657 },
    Fukuoka: { name: '福岡', lat: 33.5902, lon: 130.4017 },
    Kitakyushu: { name: '北九州', lat: 33.883, lon: 130.8753 },
    Kumamoto: { name: '熊本', lat: 32.7898, lon: 130.7417 },
    Oita: { name: '大分', lat: 33.2396, lon: 131.6093 },
    Miyazaki: { name: '宮崎', lat: 31.9111, lon: 131.4239 },
    Kagoshima: { name: '鹿児島', lat: 31.5602, lon: 130.5581 },
    Naha: { name: '那覇', lat: 26.2124, lon: 127.6809 },
    Morioka: { name: '盛岡', lat: 39.7036, lon: 141.1527 }
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('weather')
        .setDescription('指定した都市の天気を表示します')
        .addStringOption(option =>
            option.setName('city')
                .setDescription('都市を選択してください')
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

            const now = new Date();
            const todayStr = now.toISOString().split('T')[0];
            const tomorrowStr = new Date(now.setDate(now.getDate() + 1)).toISOString().split('T')[0];

            const today = list.find(f => f.dt_txt.includes(`${todayStr} 09:00:00`));
            const tomorrow = list.find(f => f.dt_txt.includes(`${tomorrowStr} 09:00:00`));

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
                .setColor(0x00bfff)
                .setFooter({ text: '提供：OpenWeatherMap' });

            await interaction.reply({ embeds: [embed] });
        } catch (err) {
            console.error(err);
            await interaction.reply({ content: '⚠️ 天気情報の取得に失敗しました。', ephemeral: true });
        }
    }
};
