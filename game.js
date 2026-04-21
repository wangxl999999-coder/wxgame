// 游戏入口文件
const game = require('./js/game');

// 直接初始化游戏，确保微信小游戏能够正确启动
try {
  console.log('开始初始化游戏...');
  game.init();
  console.log('游戏初始化成功');
} catch (error) {
  console.error('游戏初始化失败:', error);
}
