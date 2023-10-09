import fs from 'fs';
import path from 'path';

const dataDir = './data';
const blacklistFile = './blacklists.txt';

// 读取blacklist文件内容，获取需要删除的token序号
const blacklist = fs.existsSync(blacklistFile) ? fs.readFileSync(blacklistFile, 'utf-8').split('|') : [];

if (blacklist.length > 0) {
  // 遍历data目录下所有的token序号.txt文件
  fs.readdirSync(dataDir)
    .filter(file => file.endsWith('.txt'))
    .forEach(file => {
      const tokenNum = file.replace('.txt', '');
      if (blacklist.includes(tokenNum)) {
        // 如果当前文件的token序号在blacklist中，则删除该文件
        fs.unlinkSync(path.join(dataDir, file));
        console.log(`已删除 ${tokenNum}.txt`);
      }
    });
}

// 重新命名剩余的token序号文件
let i = 1;
console.log(`正在执行黑名单检测机制......`);
fs.readdirSync(dataDir)
  .filter(file => file.endsWith('.txt'))
  .forEach(file => {
    const tokenNum = file.replace('.txt', '');
    const newTokenNum = `token${i}`;
    fs.renameSync(path.join(dataDir, file), path.join(dataDir, `${newTokenNum}.txt`));
    console.log(`已将 ${tokenNum}.txt 重命名为 ${newTokenNum}.txt`);
    i++;
  });