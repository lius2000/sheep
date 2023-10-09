import fs from 'fs';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function search() {
  rl.question('请输入要搜索的内容信息（如token或者报错信息，支持任意关键字及部分内容）：', (keyword) => {
    if (keyword === 'exit') {
      rl.close();
      return;
    }

    const stream = fs.createReadStream('./data.txt');
    const rl = readline.createInterface({ input: stream });

    let found = false; // 

    rl.on('line', (line) => {
      if (line.includes(keyword)) {
        console.log('-'.repeat(40)); // 
        console.log(line);
        found = true;
      }
    });

    rl.on('close', () => {
      if (!found) {
        console.log('未找到匹配结果');
      }
      console.log('-'.repeat(40)); // 
      console.log('搜索完毕'); // 
      search(); 
    });
  });
}

search(); // 开始搜索