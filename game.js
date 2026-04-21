// 游戏入口文件
const game = require('./js/game');

GameGlobal.onLaunch = function() {
  console.log('游戏启动');
  game.init();
};

GameGlobal.onShow = function() {
  console.log('游戏显示');
};

GameGlobal.onHide = function() {
  console.log('游戏隐藏');
};
