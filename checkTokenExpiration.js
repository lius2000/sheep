import readline from "readline";
import axios from 'axios';
import { getSkinName } from './data/skins.js';

// 解析JWT令牌中的过期时间并返回格式化后的日期字符串
const parseToken = (token) => {
  return JSON.parse(Buffer.from(token.split(".")[1], "base64").toString());
};

const getExpirationDateFromToken = (token) => {
  const { exp } = parseToken(token);
  const date = new Date(+exp * 1000);
  return date.toLocaleString();
};

// 将时间戳转换为格式化的日期时间字符串
const formatDate = (timestamp) => {
  const date = new Date(timestamp * 1000);
  return date.toLocaleString();
};

// 获取输入的token并查询过期时间
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const askToken = () => {
  rl.question("请输入token: ", (token) => {
    // 解析token并获取过期时间
    const expirationDate = getExpirationDateFromToken(token);
    console.log(`--------------------------------------------`);
    console.log(`该token的过期时间为: ${expirationDate}`);

    // 发送HTTP GET请求并打印响应数据
    const headers = {
      'Host': 'cat-match.easygame2021.com',
      'Connection': 'keep-alive',
      'xweb_xhr': '1',
      't': token,
      'b':   '394',
      'user-agent': 'Mozilla/5.0 (Linux; Android 9; MI 9 Build/PQ3A.190705.003; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/91.0.4472.114 Safari/537.36 MicroMessenger/8.0.2.1860(0x28000234) Process/appbrand1 WeChat/arm32 Weixin Android Tablet NetType/WIFI Language/zh_CN ABI/arm64 MiniProgramEnv/android',
      'Content-Type': 'application/json',
      'Accept': '*/*',
      'Sec-Fetch-Site': 'cross-site',
      'Sec-Fetch-Mode': 'cors',
      'Sec-Fetch-Dest': 'empty',
      'Referer': 'https://servicewechat.com/wx141bfb9b73c970a9/34/page-frame.html',
      'Accept-Language': 'en-us,en',
      'Accept-Encoding': 'gzip, deflate',
    };

    axios.get(`https://cat-match.easygame2021.com/sheep/v1/game/personal_info?t=${token}`, { headers })
      .then(response => {
        const data = response.data.data;
        console.log(`--------------------------------------------`);
        console.log(`该账号个人信息如下`);
        console.log(`注册时间: ${formatDate(data.register_time)}`);
        console.log(`用户昵称: ${data.nick_name}`);
        console.log(`用户UID: ${data.uid}`);
        console.log(`日常挑战总次数: ${data.win_count}`);
        console.log(`活动挑战总次数: ${data.topic_count}`);
        console.log(`今天日常挑战次数: ${data.daily_count}`);
        console.log(`今天日常挑战失败次数: ${data.today_fail_count}`);
        if (data.today_state === 0) {
          console.log("今天每日挑战状态:没有过关");
        } else if (data.today_state === 1) {
          console.log("今天每日挑战状态:已过关");
        } else {
          console.log("今天每日挑战状态:无法获取");
        }
        console.log(`今天日常挑战时间: ${formatDate(data.today_ts)}`);
        console.log(`今天日常用时: ${data.today_time}`);
        console.log(`当前皮肤: ${getSkinName(data.skin)}`);
        console.log(`当前地区ID: ${data.area_id}`);
        console.log(`--------------------------------------------`);

        axios.get(`https://cat-match.easygame2021.com/sheep/v1/game/skin/info?t=${token}`, { headers })
          .then(response => {
            const skins = response.data.data.skin_list;
            if (skins && skins.length > 0) {
              console.log(`已取得的皮肤共有 ${skins.length} 个:`);
              for (let i = 0; i < skins.length; i += 12) {
                const chunk = skins.slice(i, i + 12);
                console.log(chunk.map((s) => getSkinName(s.id)).join(", "));
              }
            } else {
              console.log("没有取得任何皮肤");
            }
            console.log(`--------------------------------------------`);

            axios.get(`https://cat-match.easygame2021.com/sheep/v1/game/race/info?t=${token}`, { headers })
              .then(response => {
                const raceInfo = response.data.data;
                const currentRank = raceInfo.current_rank;
                console.log(`个人竞赛信息: `);
                console.log(`当前赛季ID: ${raceInfo.current_season_id}`);
                console.log(`本赛季结束时的段位: ${raceInfo.end_division}`);
                if (raceInfo.end_state === 0) {
                  console.log("本赛季状态: 没有结束");
                } else if (raceInfo.end_state === 1) {
                  console.log("本赛季状态: 已结束");
                } else {
                  console.log("本赛季状态: 无法获取");
                }
                console.log(`当前排名: `);
                console.log(`  段位: ${currentRank.division}`);
                console.log(`  萝卜: ${currentRank.exp}`);
                console.log(`  结束时间: ${new Date(currentRank.end_time * 1000).toLocaleString()}`);
                console.log(`--------------------------------------------`);

                axios.get(`https://cat-match.easygame2021.com/sheep/v1/game/race/rank_list?detail=1&t=${token}`, { headers })
                  .then(response => {
                    const data = response.data.data;
                    console.log(`今日竞赛排行榜信息: `);
                    console.log(`请求时间：${new Date().toLocaleString()}`);
                    console.log(`比赛ID：${data.race_id}`);
                    console.log(`过期时间：${new Date(data.expire * 1000).toLocaleString()}`);
                    console.log(`今日排行榜列表：`);
                    data.list.forEach((item, index) => {
                      console.log(`排名：${item.rank}`, `昵称：${item.nick_name}`, `地区ID：${item.area_id}`, `获得萝卜：${item.exp}`, `皮肤：${getSkinName(item.skin_id)}`, `UID：${item.uid}`, `进度：${item.percent}%`);
                    });
                    if (data.level_up_award_list) {
                      console.log(`升级奖励列表：`);
                      data.level_up_award_list.forEach((award, index) => {
                        console.log(`  第${index + 1}个：`);
                        console.log(`    ID：${award.id}`);
                        console.log(`    数量：${award.count}`);
                        console.log(`    类型：${award.type}`);
                        console.log(`    原因：${award.reason}`);
                      });
                    }
                    console.log(`--------------------------------------------`);
                    askToken();
                  })
                  .catch(error => {
                    console.log(`请求出错: ${error}`);
                    console.log(`--------------------------------------------`);
                    askToken();
                  });
              })
              .catch(error => {
                console.log(`请求出错: ${error}`);
                console.log(`--------------------------------------------`);
                askToken();
              });
          })
          .catch(error => {
            console.log(`请求出错: ${error}`);
            console.log(`--------------------------------------------`);
            askToken();
          });
      })
      .catch(error => {
        console.log(`请求出错: ${error}`);
        console.log(`--------------------------------------------`);
        askToken();
      });
  });
};

askToken();