// 游戏核心逻辑
const Game2048 = {
  // 游戏状态
  board: [],
  score: 0,
  gameOver: false,
  gameWon: false,
  
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
    this.board = Array(4).fill().map(() => Array(4).fill(0));
    this.score = 0;
    this.gameOver = false;
    this.gameWon = false;
    
    // 添加两个初始数字
    this.addRandomTile();
    this.addRandomTile();
    
    // 渲染游戏
    this.render();
    
    // 监听键盘事件
    this.listenToKeyboard();
    
    // 监听触摸事件（移动端）
    this.listenToTouch();
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
    }
  },
  
  // 移动和合并数字
  move: function(direction) {
    if (this.gameOver || this.gameWon) return;
    
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
    // 这里我们使用Canvas来渲染游戏
    this.renderCanvas();
  },
  
  // 使用Canvas渲染
  renderCanvas: function() {
    // 创建Canvas上下文
    const canvas = wx.createCanvas();
    const ctx = canvas.getContext('2d');
    
    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 计算缩放比例，确保游戏在不同屏幕尺寸上都能正常显示
    const windowWidth = wx.getSystemInfoSync().windowWidth;
    const gameSize = windowWidth - 40; // 两边各留20px边距
    const cellSize = (gameSize - 30) / 4; // 5个间距，每个5px
    const startX = (canvas.width - gameSize) / 2;
    const startY = 100; // 顶部留一些空间显示分数
    
    // 绘制背景
    ctx.fillStyle = '#faf8ef';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 绘制标题和分数
    ctx.fillStyle = '#776e65';
    ctx.font = 'bold 40px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('2048', canvas.width / 2, 60);
    
    ctx.font = '20px Arial';
    ctx.fillText(`分数: ${this.score}`, canvas.width / 2, 90);
    
    // 绘制游戏板背景
    ctx.fillStyle = this.colors.background;
    ctx.fillRect(startX, startY, gameSize, gameSize);
    
    // 绘制格子
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        const x = startX + j * (cellSize + 5) + 5;
        const y = startY + i * (cellSize + 5) + 5;
        const value = this.board[i][j];
        
        // 绘制格子背景
        ctx.fillStyle = value ? this.colors[value] : this.colors.cell;
        ctx.fillRect(x, y, cellSize, cellSize);
        
        // 绘制数字
        if (value) {
          ctx.fillStyle = value <= 4 ? this.colors.text : '#f9f6f2';
          ctx.font = value < 100 ? 'bold 24px Arial' : value < 1000 ? 'bold 20px Arial' : 'bold 16px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(value, x + cellSize / 2, y + cellSize / 2);
        }
      }
    }
    
    // 绘制重新开始按钮
    const btnWidth = 120;
    const btnHeight = 40;
    const btnX = (canvas.width - btnWidth) / 2;
    const btnY = startY + gameSize + 20;
    
    ctx.fillStyle = '#8f7a66';
    ctx.fillRect(btnX, btnY, btnWidth, btnHeight);
    
    ctx.fillStyle = '#f9f6f2';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('重新开始', btnX + btnWidth / 2, btnY + btnHeight / 2);
    
    // 保存Canvas引用，用于后续点击检测
    this.canvas = canvas;
    this.btnX = btnX;
    this.btnY = btnY;
    this.btnWidth = btnWidth;
    this.btnHeight = btnHeight;
  },
  
  // 监听键盘事件
  listenToKeyboard: function() {
    wx.onKeyDown((res) => {
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
    let startX, startY;
    
    wx.onTouchStart((res) => {
      startX = res.touches[0].clientX;
      startY = res.touches[0].clientY;
      
      // 检查是否点击了重新开始按钮
      if (this.canvas) {
        const canvasRect = this.canvas.getBoundingClientRect();
        const touchX = res.touches[0].clientX - canvasRect.left;
        const touchY = res.touches[0].clientY - canvasRect.top;
        
        if (touchX >= this.btnX && touchX <= this.btnX + this.btnWidth &&
            touchY >= this.btnY && touchY <= this.btnY + this.btnHeight) {
          this.init();
        }
      }
    });
    
    wx.onTouchEnd((res) => {
      if (!startX || !startY) return;
      
      const endX = res.changedTouches[0].clientX;
      const endY = res.changedTouches[0].clientY;
      
      const deltaX = endX - startX;
      const deltaY = endY - startY;
      
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

module.exports = Game2048;
