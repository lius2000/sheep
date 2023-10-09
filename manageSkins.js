import fs from 'fs';
import readline from 'readline';
import { getSkinName } from './data/skins.js';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const promptOptions = () => {
  console.log("输入1以添加皮肤，输入2以删除皮肤，输入3以查询皮肤");
}

promptOptions();

rl.on('line', (input) => {
  switch (input) {
    case '1':
      addSkin();
      break;
    case '2':
      removeSkin();
      break;
    case '3':
      querySkin();
      break;
    default:
      console.log("无效的输入");
      promptOptions();
  }
});

const addSkin = () => {
  rl.question("(增加皮肤)请输入皮肤的ID: ", (id) => {
    rl.question("(增加皮肤)请输入皮肤的名称: ", (name) => {
      rl.question("(增加皮肤)请输入皮肤介绍 (可选): ", (desc) => {
        const newSkin = {
          clothesId: Number(id),
          name,
          desc,
          isTopic: 0,
          platform: 1,
        };
        const fileContent = fs.readFileSync('./data/skins.js', 'utf8');
        const indexOfArrayEnd = fileContent.lastIndexOf(']');
        const newContent = fileContent.slice(0, indexOfArrayEnd) + ',' + JSON.stringify(newSkin) + fileContent.slice(indexOfArrayEnd);
        fs.writeFileSync('./data/skins.js', newContent);
        console.log("皮肤已添加");
        promptOptions();
      });
    });
  });
};

const removeSkin = () => {
  rl.question("(删除皮肤)请输入皮肤的ID或名称: ", (identifier) => {
    const fileContent = fs.readFileSync('./data/skins.js', 'utf8');
    let skins = fileContent.substring(fileContent.indexOf('['), fileContent.lastIndexOf(']') + 1);
    skins = JSON.parse(skins);
    let skinToRemove;

    if (!isNaN(identifier)) {
      skinToRemove = skins.find(skin => skin.clothesId === Number(identifier));
    } else {
      skinToRemove = skins.find(skin => skin.name.includes(identifier) || skin.desc.includes(identifier));
    }

    if (!skinToRemove) {
      console.log("没有找到对应的皮肤");
      promptOptions();
      return;
    }

    console.log("找到的皮肤:", skinToRemove);
    rl.question("确认删除这个皮肤吗? (回车或者输入1确认删除, 输入其他任何内容取消删除)", (confirmation) => {
      if (confirmation === '' || confirmation === '1') {
        const newSkins = skins.filter(skin => skin !== skinToRemove);
        const newContent = fileContent.replace(/\[.*\]/s, JSON.stringify(newSkins));
        fs.writeFileSync('./data/skins.js', newContent);
        console.log("皮肤已删除");
      } else {
        console.log("取消删除");
      }
      promptOptions();
    });
  });
};

const querySkin = () => {
  rl.question("(搜索)请输入皮肤的ID、名称或描述: ", (query) => {
    const fileContent = fs.readFileSync('./data/skins.js', 'utf8');
    let skins = fileContent.substring(fileContent.indexOf('['), fileContent.lastIndexOf(']') + 1);
    skins = JSON.parse(skins);
    let foundSkins;

    if (!isNaN(query)) {
      foundSkins = skins.filter(skin => skin.clothesId === Number(query));
    } else {
      foundSkins = skins.filter(skin =>
        skin.name.includes(query) ||
        skin.desc.includes(query)
      );
    }

    console.log("找到的皮肤:", foundSkins);
    promptOptions();
  });
};