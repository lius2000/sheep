import axios from 'axios';
import fs from 'fs';

const fileName = 'blacklist.txt';

const readBlackList = () => {
  const data = fs.readFileSync(fileName, 'utf-8');
  const lines = data.split(/\r?\n/);
  return lines;
};

const printBlackList = () => {
  const lines = readBlackList();
  console.log(`以下是当前黑名单：`);
  lines.forEach((line, index) => {
    console.log(`${index + 1}. ${line}`);
  });
};

const writeBlackList = (id) => {
  fs.appendFileSync(fileName, `${id}\n`);
  console.log(`"${id}"已添加到黑名单中`);
  printBlackList();
  console.log('请输入uid或者token添加，输入行号删除对应的uid，或者输入exit退出');
};

const deleteBlackList = (index) => {
  const lines = readBlackList();
  lines.splice(index - 1, 1);
  fs.writeFileSync(fileName, lines.join('\n'));
  console.log(`"${index}"已从黑名单中删除`);
  printBlackList();
  console.log('请输入uid或者token添加，输入行号删除对应的uid，或者输入exit退出');
};

printBlackList();

process.stdin.setEncoding('utf8');
console.log('请输入uid或者token添加，输入行号删除对应的uid，或者输入exit退出');
process.stdin.on('readable', () => {
  let chunk;
  while ((chunk = process.stdin.read()) !== null) {
    const input = chunk.trim();
    if (input === 'exit') {
      console.log('程序已退出');
      process.exit();
    } else if (/^\d{1,2}$/.test(input)) {
      deleteBlackList(parseInt(input));
    } else if (/^eyJhb/.test(input)) {
      const url = `https://cat-match.easygame2021.com/sheep/v1/game/personal_info?t=${input}`;
      const headers = {
        'Host': 'cat-match.easygame2021.com',
        'Connection': 'keep-alive',
        'xweb_xhr': '1',
        't': input,
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
      axios.get(url, { headers })
        .then(response => {
          const { nick_name, uid } = response.data.data;
          console.log(`昵称: ${nick_name}, uid: ${uid}`);
          writeBlackList(uid);
        })
        .catch(error => {
          console.log(error.message);
        });
    } else {
      writeBlackList(input);
    }
  }
});