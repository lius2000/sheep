import { spawn } from 'child_process';
import fs from 'fs';
import util from 'util';

function getTopic() {
  return new Promise(resolve => {
    let child = spawn('node', ['util/get', 'topic'])
    child.stdout.on('data', d => {
      console.log(d.toString().trim())
    })
    child.on('exit', c => {
      resolve(c)
    })
  })
}

function step1() {
  return new Promise((resolve) => {
    let child = spawn('node', ['step1', '0']);
    console.log('start step1  执行第一步');
    child.stdout.on('data', (d) => {
      let line = d.toString().trim();
    });
    child.on('exit', (c) => {
      if (c === 99) {
        console.log('success 第一步进度百分比达成');
        // process.exit()
      }
      resolve(c);
    });
  });
}

function step2Out2() {
  return new Promise((resolve) => {
    let child = spawn('node', ['step2-out2']);
    console.log('start step2  执行第二步 (使用两次移出）');
    child.stdout.on('data', (d) => {
      let line = d.toString().trim();
      if (line === '99') {
        resolve(99);
      }
    });
    child.on('exit', (c) => {
      if (c === 99) {
        console.log('success 线程一完成求解，请等待');
        // process.exit();
      }
      resolve(c);
    });
  });
}

function step1Plus(num) {
  return new Promise((resolve) => {
    let child = spawn('node', ['step1', 0, num]);
    console.log('start step1  返回第一步');
    child.stdout.on('data', (d) => {
      let line = d.toString().trim();
    });
    child.on('exit', (c) => {
      if (c === 101) {
        console.log('>>>第一步num未完成');
        // process.exit()
      }
      resolve(c);
    });
  });
}

function send() {
  return new Promise((resolve) => {
    let child = spawn('node', ['util/sendtopic', 'game2.json', 'topic']);
    console.log('准备发送数据至服务器...请等待');
    child.stdout.on('data', (d) => {
      let line = d.toString().trim();
      console.log(line);
    });
    child.on('exit', (c) => {
      console.log('数据发送完毕');
      process.exit();
    });
  });
}


function step1Shuffle() {
  return new Promise((resolve) => {
    let child = spawn('node', ['step1Shuffle', 0]);
    console.log('start step1  执行第一步洗牌');
    child.stdout.on('data', (d) => {
      let line = d.toString().trim();
    });
    child.on('exit', (c) => {
      if (c === 99) {
        console.log('success 第一步洗牌进度百分比达成');
        // process.exit()
      }
      resolve(c);
    });
  });
}

function step2Shuffle() {
  return new Promise((resolve) => {
    let child = spawn('node', ['step2-out2Shuffle']);
    console.log('start step2  执行第二步洗牌 (使用两次移出）');
    child.stdout.on('data', (d) => {
      let line = d.toString().trim();
      if (line === '99') {
        resolve(99);
      }
    });
    child.on('exit', (c) => {
      if (c === 99) {
        console.log('success 线程二洗牌完成求解，请等待');
        // process.exit();
      }
      resolve(c);
    });
  });
}

function step1ShufflePlus(num) {
  return new Promise((resolve) => {
    let child = spawn('node', ['step1Shuffle', 0, num]);
    console.log('start step1  返回第一步（洗牌）');
    child.stdout.on('data', (d) => {
      let line = d.toString().trim();
    });
    child.on('exit', (c) => {
      if (c === 101) {
        console.log('>>>第一步洗牌num未完成');
        // process.exit()
      }
      resolve(c);
    });
  });
}

function sendShuffle() {
  return new Promise((resolve) => {
    let child = spawn('node', ['util/sendtopic', 'game2Shuffle.json', 'topic']);
    console.log('准备发送数据至服务器...请等待');
    child.stdout.on('data', (d) => {
      let line = d.toString().trim();
      console.log(line);
    });
    child.on('exit', (c) => {
      console.log('数据发送完毕');
      process.exit();
    });
  });
}

const readFile = util.promisify(fs.readFile);

async function main() {
  let round = 1;
  while (1) {
    console.clear();
    console.log('>>>以下是本次批量的个人信息');
    const meContent = await readFile('./data/me', { encoding: 'utf8' });
    const blacklistContent = await readFile('./blacklist.txt', { encoding: 'utf8' });
    const blacklist = blacklistContent.split('\n').map(line => line.trim());
    const meLines = meContent.trim().split('\n');
    for (let i = 0; i < meLines.length; i++) {
      const line = meLines[i];
      const { nick_name, uid } = JSON.parse(line).data;
      if (blacklist.includes(uid)) {
        continue;
      }
      console.log(`${i + 1} {"账号昵称":"${nick_name}","账号UID":"${uid}"}`);
    }
    console.log('--------------------------------------------------------------');
    console.log('>>> ---羊羊大世界', '第', round, '次试解');
    await getTopic();
    let startTime = new Date().getTime();
    let currentTime = new Date(startTime).toLocaleString();
    console.log('当前时间:', currentTime);
    const responses = await readFile('./responses.json', { encoding: 'utf8' });
    const parsedResponses = JSON.parse(responses);
    const firstMapSeed = parsedResponses[0].data.map_seed;
    const firstMapSeed2 = parsedResponses[0].data.map_seed_2;
    const isMapSeedSame = parsedResponses.every((response) =>
      response.data.map_seed.every((seed, index) => seed === firstMapSeed[index])
    );
    const isMapSeed2Same = parsedResponses.every((response) =>
      response.data.map_seed_2 === firstMapSeed2
    );
    if (!isMapSeedSame || !isMapSeed2Same) {
      console.log('>>> 检测到多个账号地图数据不一致，本轮无法求解，等待8秒重新获取地图数据');
      await new Promise(resolve => setTimeout(resolve, 8000));
      continue;
    }
    console.log(`已确认所有地图数据一致（羊羊大世界）`)
    console.log(`>>>求解<<<`)
    let thread1Promise = thread1(startTime);
    let thread2Promise = thread2(startTime);
    let code1 = await thread1Promise;
    let code2 = await thread2Promise;
    if (code1 === 99 || code2 === 99) {
      console.log('>>>线程已完成求解，本次算法结束，请等待数据发送');
      if (code1 === 99) {
        await thread1Promise;
        await send();
      } else if (code2 === 99){
        await thread2Promise;
        await sendShuffle();
      }
    } else if (code1 === 101 && code2 === 101) {
      console.log('>>>两个线程都超时或者第一步未完成，进入下一轮');
    }
    round++;
  }
}

async function thread1(startTime) {
  let round = 1;
  while (1) {
    let code = await step1();
    if (code === 99) {
      let num = 1;
      while (1) {
        let code2 = await step2Out2();
        if (code2 === 99) {
          console.log('>>>线程一已经成功解决本次求解（羊羊大世界），退出线程一');
          return code2;
        } else if (code2 === 101) {
          console.log('线程一未完成，退出线程一');
          return code2;
        }
        let code3 = await step1Plus(num++);
        if (code3 === 101) {
          console.log('>>>线程一第一步未完成，退出线程一，请等待其他线程结束');
          return code3;
        }
        let currentTime = new Date().getTime();
        if (currentTime - startTime > 100000) {
          console.log('>>>线程一已超时100秒，退出线程一');
          return 101;
        }
      }
    } else if (code === 101) {
      console.log('线程一第一步未完成，退出线程一，请等待其他线程结束');
      return code;
    }
    round++;
  }
}

async function thread2(startTime) {
  let round = 1;
  while (1) {
    let code = await step1Shuffle();
    if (code === 99) {
      let num = 1;
      while (1) {
        let code2 = await step2Shuffle();
        if (code2 === 99) {
          console.log('>>>线程二洗牌已经成功解决本次求解（羊羊大世界），退出线程二');
          return code2;
        } else if (code2 === 101) {
          console.log('线程二洗牌未完成，退出线程二');
          return code2;
        }
        let code3 = await step1ShufflePlus(num++);
        if (code3 === 101) {
          console.log('>>>线程二洗牌第一步未完成，退出线程二，请等待其他线程结束');
          return code3;
        }
        let currentTime = new Date().getTime();
        if (currentTime - startTime > 100000) {
          console.log('>>>线程二洗牌已超时100秒，退出线程二');
          return 101;
        }
      }
    } else if (code === 101) {
      console.log('>>>线程二洗牌第一步未完成，退出线程二，请等待其他线程结束');
      return code;
    }
    round++;
  }
}

main();