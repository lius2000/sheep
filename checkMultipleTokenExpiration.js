import readline from "readline";

// 解析JWT令牌中的过期时间并返回格式化后的日期字符串
const parseToken = (token) => {
  return JSON.parse(Buffer.from(token.split(".")[1], "base64").toString());
};

const getExpirationDateFromToken = (token) => {
  const { exp } = parseToken(token);
  const date = new Date(+exp * 1000);
  return date.toLocaleString();
};

let tokens = [];

const askToken = () => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question("请输入token，输入1结束: ", (token) => {
    rl.close();
    if (token === "1") {
      // 如果输入1，则查询所有token的过期时间并输出
      tokens.forEach((token) => {
        const expirationDate = getExpirationDateFromToken(token);
        console.log(`--------------------------------------------`);
        console.log(`${token}过期时间为: ${expirationDate}`);
      });

      // 清空tokens数组，准备下一轮输入
      tokens = [];

      // 继续询问
      askToken();
    } else {
      tokens.push(token);
      // 继续询问
      askToken();
    }
  });
};

askToken();