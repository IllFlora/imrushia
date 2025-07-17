require('dotenv').config(); // ← .env 読み込み

const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const { getUserTweets } = require('./twikit'); // ローカルの twikit モジュールを使用

// 🔐 環境変数からトークンとチャンネルIDを取得
const botToken = process.env.TOKEN;
const channelId = process.env.CHANNEL_ID || '1395346272071979048'; // .env に指定してもOK

// 🧠 X から取得した認証情報（ブラウザ開発者ツールで取得）
const headers = {
    'x-guest-token': '175274674445321902',
    'authorization': 'Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA',
    'cookie': 'kdt=WcFe6E0Nv7h4xkBd2B3Lmq8LneObPSzOCSfTICCR; dnt=1; _ga=GA1.1.372027386.1752132592; _ga_BLY4P7T5KW=GS2.1.s1752165442$o2$g0$t1752165451$j51$l0$h0; g_state={"i_l":0}; personalization_id="v1_ZRWZaun+i9fSZ2UWM8PsHQ=="; lang=ja; __cf_bm=tA851SQ.OScywHEm5yb.Vp3v1TO65gVrIfdp0_wgqsQ-1752745962-1.0.1.1-U.Q_jkvCUUhRUpnKKsctRan8_Jomz7yIEPkVbQAp2wKaXW4CTpqVmoFP68KWk2kLvpB6VamcFVfMLL2ZIizYXF4Mhwp4HsZAW7oC8qe_COQ; auth_multi="1912391809952874496:3c8b5351ea8a66387d5db1df187a769570cc710d"; auth_token=c51e895a896e3d4101e0aa3ca62e2c6d33c18900; guest_id_ads=v1%3A175274674445321902; guest_id_marketing=v1%3A175274674445321902; guest_id=v1%3A175274674445321902; twid=u%3D1930615106070863872; ct0=9e2e702f1a58e552b342eca71a2c2eec82af382fd23ff5f8336a0deb6334345648b204c7b96179ac0e6998b248ce22ed320dc9246bed4cabfbe68fbf3747f34e837b0aa45bdc0cd488232539bc115f89'
};

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages]
});

let lastTweetId = null;

client.once('ready', async () => {
    console.log(`✅ Bot起動完了: ${client.user.tag}`);
    const channel = await client.channels.fetch(channelId);
    if (!channel) {
        console.error('❌ 指定チャンネルが見つかりません');
        return;
    }

    console.log(`📡 通知チャンネル: #${channel.name}`);

    // 初回チェック＋5分ごとに定期実行
    await checkHikakin(channel);
    setInterval(() => checkHikakin(channel), 5 * 60 * 1000);
});

async function checkHikakin(channel) {
    try {
        const tweets = await getUserTweets('hikakin', { headers });
        const latest = tweets[0];
        if (!latest || latest.id_str === lastTweetId) return;

        lastTweetId = latest.id_str;
        const tweetUrl = `https://x.com/hikakin/status/${latest.id_str}`;

        const embed = new EmbedBuilder()
            .setTitle('🆕 ヒカキンの新着ポスト')
            .setDescription(latest.full_text || '(本文なし)')
            .setURL(tweetUrl)
            .setColor(0x1da1f2)
            .setTimestamp(new Date(latest.created_at))
            .setFooter({ text: '提供：twikit / X.com' })
            .setThumbnail('https://pbs.twimg.com/profile_images/1440226141105582081/UHgxXGPw_400x400.jpg');

        await channel.send({ embeds: [embed] });
        console.log(`✅ 投稿通知完了: ${tweetUrl}`);
    } catch (err) {
        console.error('❌ 投稿取得または通知中にエラー:', err);
    }
}

client.login(botToken);
