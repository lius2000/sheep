import axios from 'axios';
import fs from 'fs';

const url = 'https://biechuyangwang.github.io/ylgySkin/skins_orig.json';
const filePath = 'data/skins.js';

console.log('正在更新皮肤数据...');

axios.get(url)
  .then(response => {
    const skins = response.data;
    const fileContent = `const skins = ${JSON.stringify(skins)};\n\n const getSkinName = (id) => {
      const skin = skins.find((sk) => sk.clothesId === id);
      if (skin) return skin.name;
      return id;
    };\n\nexport { getSkinName };`;
    fs.writeFile(filePath, fileContent, (err) => {
      if (err) throw err;
      console.log('皮肤数据更新成功！');
    });
  })
  .catch(error => {
    console.error(error);
  });