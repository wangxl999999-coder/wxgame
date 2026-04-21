// 游戏核心逻辑
const Game2048 = {
  // 游戏状态
  board: [],
  score: 0,
  gameOver: false,
  gameWon: false,
  canvas: null,
  ctx: null,
  windowWidth: 0,
  windowHeight: 0,
  listenersRegistered: false, // 标志位，确保事件监听器只注册一次
  
  // 颜色配置
  colors: {
    2: '#eee4da',
    4: '#ede0c8',
    8: '#f2b179',
    16: '#f59563',
    32: '#f67c5f',
    64: '#f65e3b',
    128: '#edcf72',
    256: '#edcc61',
    512: '#edc850',
    1024: '#edc53f',
    2048: '#edc22e',
    'background': '#bbada0',
    'cell': '#cdc1b4',
    'text': '#776e65'
  },
  
  // 初始化游戏
  init: function() {
    console.log('Game2048.init 开始执行');
    
    try {
      // 获取系统信息
      const systemInfo = wx.getSystemInfoSync();
      this.windowWidth = systemInfo.windowWidth;
      this.windowHeight = systemInfo.windowHeight;
      console.log('系统信息:', this.windowWidth, 'x', this.windowHeight);
      
      // 初始化Canvas（只创建一次）
      if (!this.canvas) {
        this.initCanvas();
      }
      
      // 初始化游戏状态
      this.board = Array(4).fill().map(() => Array(4).fill(0));
      this.score = 0;
      this.gameOver = false;
      this.gameWon = false;
      
      // 添加两个初始数字
      this.addRandomTile();
      this.addRandomTile();
      
      // 渲染游戏
      this.render();
      
      // 监听键盘和触摸事件（只注册一次）
      if (!this.listenersRegistered) {
        this.listenToKeyboard();
        this.listenToTouch();
        this.listenersRegistered = true;
        console.log('事件监听器已注册');
      }
      
      console.log('Game2048.init 执行完成');
    } catch (error) {
      console.error('Game2048.init 出错:', error);
      this.showError(error);
    }
  },
  
  // 初始化Canvas
  initCanvas: function() {
    console.log('初始化Canvas');
    try {
      // 创建Canvas（只创建一次）
      this.canvas = wx.createCanvas();
      this.ctx = this.canvas.getContext('2d');
      
      // 设置Canvas尺寸
      this.canvas.width = this.windowWidth;
      this.canvas.height = this.windowHeight;
      
      console.log('Canvas初始化成功:', this.canvas.width, 'x', this.canvas.height);
    } catch (error) {
      console.error('Canvas初始化失败:', error);
      throw error;
    }
  },
  
  // 显示错误信息
  showError: function(error) {
    try {
      // 绘制错误信息到Canvas
      if (this.ctx) {
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = '#ff0000';
        this.ctx.font = '20px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('错误: ' + error.message, this.canvas.width / 2, this.canvas.height / 2);
      }
    } catch (e) {
      console.error('显示错误信息失败:', e);
    }
  },
  
  // 添加随机数字
  addRandomTile: function() {
    const emptyCells = [];
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (this.board[i][j] === 0) {
          emptyCells.push({row: i, col: j});
        }
      }
    }
    
    if (emptyCells.length > 0) {
      const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
      // 90%概率生成2，10%概率生成4
      this.board[randomCell.row][randomCell.col] = Math.random() < 0.9 ? 2 : 4;
      console.log('添加随机数字:', this.board[randomCell.row][randomCell.col], '位置:', randomCell.row, randomCell.col);
    }
  },
  
  // 移动和合并数字
  move: function(direction) {
    if (this.gameOver || this.gameWon) return;
    
    console.log('移动方向:', direction);
    
    let moved = false;
    const merged = Array(4).fill().map(() => Array(4).fill(false));
    
    // 根据方向处理移动
    switch (direction) {
      case 'up':
        moved = this.moveUp(merged);
        break;
      case 'down':
        moved = this.moveDown(merged);
        break;
      case 'left':
        moved = this.moveLeft(merged);
        break;
      case 'right':
        moved = this.moveRight(merged);
        break;
    }
    
    console.log('是否移动:', moved);
    
    // 如果有移动，添加新数字
    if (moved) {
      this.addRandomTile();
      this.render();
      
      // 检查游戏状态
      this.checkGameState();
    }
  },
  
  // 向上移动
  moveUp: function(merged) {
    let moved = false;
    for (let col = 0; col < 4; col++) {
      const column = [];
      for (let row = 0; row < 4; row++) {
        if (this.board[row][col] !== 0) {
          column.push(this.board[row][col]);
        }
      }
      
      const newColumn = [];
      let i = 0;
      while (i < column.length) {
        if (i + 1 < column.length && column[i] === column[i + 1] && !merged[newColumn.length][col]) {
          const sum = column[i] + column[i + 1];
          newColumn.push(sum);
          this.score += sum;
          if (sum === 2048) {
            this.gameWon = true;
          }
          i += 2;
        } else {
          newColumn.push(column[i]);
          i++;
        }
      }
      
      while (newColumn.length < 4) {
        newColumn.push(0);
      }
      
      for (let row = 0; row < 4; row++) {
        if (this.board[row][col] !== newColumn[row]) {
          this.board[row][col] = newColumn[row];
          moved = true;
        }
      }
    }
    return moved;
  },
  
  // 向下移动
  moveDown: function(merged) {
    let moved = false;
    for (let col = 0; col < 4; col++) {
      const column = [];
      for (let row = 3; row >= 0; row--) {
        if (this.board[row][col] !== 0) {
          column.push(this.board[row][col]);
        }
      }
      
      const newColumn = [];
      let i = 0;
      while (i < column.length) {
        if (i + 1 < column.length && column[i] === column[i + 1] && !merged[3 - newColumn.length][col]) {
          const sum = column[i] + column[i + 1];
          newColumn.push(sum);
          this.score += sum;
          if (sum === 2048) {
            this.gameWon = true;
          }
          i += 2;
        } else {
          newColumn.push(column[i]);
          i++;
        }
      }
      
      while (newColumn.length < 4) {
        newColumn.push(0);
      }
      
      newColumn.reverse();
      
      for (let row = 0; row < 4; row++) {
        if (this.board[row][col] !== newColumn[row]) {
          this.board[row][col] = newColumn[row];
          moved = true;
        }
      }
    }
    return moved;
  },
  
  // 向左移动
  moveLeft: function(merged) {
    let moved = false;
    for (let row = 0; row < 4; row++) {
      const rowArr = [];
      for (let col = 0; col < 4; col++) {
        if (this.board[row][col] !== 0) {
          rowArr.push(this.board[row][col]);
        }
      }
      
      const newRow = [];
      let i = 0;
      while (i < rowArr.length) {
        if (i + 1 < rowArr.length && rowArr[i] === rowArr[i + 1] && !merged[row][newRow.length]) {
          const sum = rowArr[i] + rowArr[i + 1];
          newRow.push(sum);
          this.score += sum;
          if (sum === 2048) {
            this.gameWon = true;
          }
          i += 2;
        } else {
          newRow.push(rowArr[i]);
          i++;
        }
      }
      
      while (newRow.length < 4) {
        newRow.push(0);
      }
      
      for (let col = 0; col < 4; col++) {
        if (this.board[row][col] !== newRow[col]) {
          this.board[row][col] = newRow[col];
          moved = true;
        }
      }
    }
    return moved;
  },
  
  // 向右移动
  moveRight: function(merged) {
    let moved = false;
    for (let row = 0; row < 4; row++) {
      const rowArr = [];
      for (let col = 3; col >= 0; col--) {
        if (this.board[row][col] !== 0) {
          rowArr.push(this.board[row][col]);
        }
      }
      
      const newRow = [];
      let i = 0;
      while (i < rowArr.length) {
        if (i + 1 < rowArr.length && rowArr[i] === rowArr[i + 1] && !merged[row][3 - newRow.length]) {
          const sum = rowArr[i] + rowArr[i + 1];
          newRow.push(sum);
          this.score += sum;
          if (sum === 2048) {
            this.gameWon = true;
          }
          i += 2;
        } else {
          newRow.push(rowArr[i]);
          i++;
        }
      }
      
      while (newRow.length < 4) {
        newRow.push(0);
      }
      
      newRow.reverse();
      
      for (let col = 0; col < 4; col++) {
        if (this.board[row][col] !== newRow[col]) {
          this.board[row][col] = newRow[col];
          moved = true;
        }
      }
    }
    return moved;
  },
  
  // 检查游戏状态
  checkGameState: function() {
    // 检查是否获胜
    if (this.gameWon) {
      this.showGameWon();
      return;
    }
    
    // 检查是否有空格
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (this.board[i][j] === 0) {
          return;
        }
      }
    }
    
    // 检查是否有可合并的数字
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        const current = this.board[i][j];
        // 检查右边
        if (j + 1 < 4 && current === this.board[i][j + 1]) {
          return;
        }
        // 检查下边
        if (i + 1 < 4 && current === this.board[i + 1][j]) {
          return;
        }
      }
    }
    
    // 游戏结束
    this.gameOver = true;
    this.showGameOver();
  },
  
  // 显示游戏胜利
  showGameWon: function() {
    wx.showModal({
      title: '恭喜！',
      content: '你成功合成了2048！',
      showCancel: false,
      confirmText: '再玩一次',
      success: (res) => {
        if (res.confirm) {
          this.init();
        }
      }
    });
  },
  
  // 显示游戏结束
  showGameOver: function() {
    wx.showModal({
      title: '游戏结束',
      content: `最终得分：${this.score}`,
      showCancel: false,
      confirmText: '重新开始',
      success: (res) => {
        if (res.confirm) {
          this.init();
        }
      }
    });
  },
  
  // 渲染游戏
  render: function() {
    console.log('开始渲染游戏');
    try {
      // 使用Canvas来渲染游戏
      this.renderCanvas();
      console.log('游戏渲染完成');
    } catch (error) {
      console.error('游戏渲染失败:', error);
      this.showError(error);
    }
  },
  
  // 使用Canvas渲染
  renderCanvas: function() {
    if (!this.ctx || !this.canvas) {
      console.error('Canvas未初始化');
      return;
    }
    
    // 计算缩放比例，确保游戏在不同屏幕尺寸上都能正常显示
    const gameSize = this.windowWidth - 40; // 两边各留20px边距
    const cellSize = (gameSize - 30) / 4; // 5个间距，每个5px
    const startX = (this.canvas.width - gameSize) / 2;
    const startY = 100; // 顶部留一些空间显示分数
    
    console.log('渲染参数:', {gameSize, cellSize, startX, startY, canvasWidth: this.canvas.width, canvasHeight: this.canvas.height});
    
    // 绘制背景
    this.ctx.fillStyle = '#faf8ef';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // 绘制标题和分数
    this.ctx.fillStyle = '#776e65';
    this.ctx.font = 'bold 40px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('2048', this.canvas.width / 2, 60);
    
    this.ctx.font = '20px Arial';
    this.ctx.fillText(`分数: ${this.score}`, this.canvas.width / 2, 90);
    
    // 绘制游戏板背景
    this.ctx.fillStyle = this.colors.background;
    this.ctx.fillRect(startX, startY, gameSize, gameSize);
    
    // 绘制格子
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        const x = startX + j * (cellSize + 5) + 5;
        const y = startY + i * (cellSize + 5) + 5;
        const value = this.board[i][j];
        
        // 绘制格子背景
        this.ctx.fillStyle = value ? this.colors[value] : this.colors.cell;
        this.ctx.fillRect(x, y, cellSize, cellSize);
        
        // 绘制数字
        if (value) {
          this.ctx.fillStyle = value <= 4 ? this.colors.text : '#f9f6f2';
          this.ctx.font = value < 100 ? 'bold 24px Arial' : value < 1000 ? 'bold 20px Arial' : 'bold 16px Arial';
          this.ctx.textAlign = 'center';
          this.ctx.textBaseline = 'middle';
          this.ctx.fillText(value, x + cellSize / 2, y + cellSize / 2);
        }
      }
    }
    
    // 绘制重新开始按钮
    const btnWidth = 120;
    const btnHeight = 40;
    const btnX = (this.canvas.width - btnWidth) / 2;
    const btnY = startY + gameSize + 20;
    
    this.ctx.fillStyle = '#8f7a66';
    this.ctx.fillRect(btnX, btnY, btnWidth, btnHeight);
    
    this.ctx.fillStyle = '#f9f6f2';
    this.ctx.font = 'bold 16px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText('重新开始', btnX + btnWidth / 2, btnY + btnHeight / 2);
    
    // 保存按钮位置，用于后续点击检测
    this.btnX = btnX;
    this.btnY = btnY;
    this.btnWidth = btnWidth;
    this.btnHeight = btnHeight;
    
    console.log('按钮位置:', {btnX, btnY, btnWidth, btnHeight});
  },
  
  // 监听键盘事件
  listenToKeyboard: function() {
    console.log('监听键盘事件');
    wx.onKeyDown((res) => {
      console.log('键盘事件:', res.keyCode);
      switch (res.keyCode) {
        case 38: // 上
          this.move('up');
          break;
        case 40: // 下
          this.move('down');
          break;
        case 37: // 左
          this.move('left');
          break;
        case 39: // 右
          this.move('right');
          break;
      }
    });
  },
  
  // 监听触摸事件
  listenToTouch: function() {
    console.log('监听触摸事件');
    let startX, startY;
    let isTap = false; // 标记是否是点击（不是滑动）
    
    wx.onTouchStart((res) => {
      console.log('触摸开始:', res.touches[0].clientX, res.touches[0].clientY);
      startX = res.touches[0].clientX;
      startY = res.touches[0].clientY;
      isTap = true; // 初始假设是点击
    });
    
    wx.onTouchMove((res) => {
      // 如果有移动，标记不是点击
      if (isTap) {
        const moveX = res.touches[0].clientX;
        const moveY = res.touches[0].clientY;
        const deltaX = Math.abs(moveX - startX);
        const deltaY = Math.abs(moveY - startY);
        
        // 如果移动距离超过10px，认为是滑动
        if (deltaX > 10 || deltaY > 10) {
          isTap = false;
        }
      }
    });
    
    wx.onTouchEnd((res) => {
      console.log('触摸结束');
      if (!startX || !startY) return;
      
      const endX = res.changedTouches[0].clientX;
      const endY = res.changedTouches[0].clientY;
      
      console.log('结束位置:', endX, endY);
      console.log('是点击:', isTap);
      console.log('按钮位置:', this.btnX, this.btnY, this.btnWidth, this.btnHeight);
      
      // 如果是点击，检查是否点击了重新开始按钮
      if (isTap && this.btnX !== undefined) {
        // 检查点击位置是否在按钮范围内
        if (endX >= this.btnX && endX <= this.btnX + this.btnWidth &&
            endY >= this.btnY && endY <= this.btnY + this.btnHeight) {
          console.log('点击了重新开始按钮');
          // 延迟一点执行，避免触摸事件冲突
          setTimeout(() => {
            this.init();
          }, 50);
          startX = null;
          startY = null;
          return;
        }
      }
      
      // 处理滑动
      const deltaX = endX - startX;
      const deltaY = endY - startY;
      
      console.log('滑动距离:', deltaX, deltaY);
      
      // 确定滑动方向
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // 水平滑动
        if (Math.abs(deltaX) > 30) {
          this.move(deltaX > 0 ? 'right' : 'left');
        }
      } else {
        // 垂直滑动
        if (Math.abs(deltaY) > 30) {
          this.move(deltaY > 0 ? 'down' : 'up');
        }
      }
      
      startX = null;
      startY = null;
    });
  }
};

console.log('Game2048模块加载完成');
module.exports = Game2048;
