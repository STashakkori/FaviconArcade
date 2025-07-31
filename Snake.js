/*
  FaviconSnakeGame - The world's smallest Snake for all people
  
  $t@$h
*/
class FaviconSnakeGame {
  constructor(size = 64) { // 64 x 64
    this.canvasSize = size;
    this.cellSize = 8;
    this.gridCount = size / this.cellSize; // Number of cells per row/column

    // Set up off-screen canvas
    this.canvas = document.createElement("canvas");
    this.canvas.width = size;
    this.canvas.height = size;
    this.context = this.canvas.getContext("2d");

    // Create <link rel="icon"> and add to <head>
    this.faviconLink = document.createElement("link");
    this.faviconLink.rel = "icon";
    document.head.appendChild(this.faviconLink);
    
    // Initialize game state and controls
    this.resetGameState();
    this.bindEvents();
  }

  resetGameState() { // Core game flags
    this.gameStarted = false;
    this.gamePaused = true;
    this.gameOver = false;

    // For flashing game over effect
    this.flashToggle = false;
    this.flashCounter = 0;

    // Movement direction
    this.direction = "right"; // Current direction
    this.nextDirection = "right"; // Queued next direction

    // Snake starts with 3 segments
    this.snake = [
      { x: 3, y: 4 },
      { x: 2, y: 4 },
      { x: 1, y: 4 },
    ];

    this.spawnApple(); // Place first apple
  }

  spawnApple() { // Loop until we find an empty spot not occupied by the snake
    while (true) {
      const x = Math.floor(Math.random() * this.gridCount);
      const y = Math.floor(Math.random() * this.gridCount);
      if (!this.snake.some(seg => seg.x === x && seg.y === y)) {
        this.apple = { x, y };
        break;
      }
    }
  }

  bindEvents() { // Handle arrow key input to change direction
    document.addEventListener("keydown", (e) => {
      if (!this.gameStarted || this.gamePaused || this.gameOver) return;

      const keyMap = {
        ArrowUp: "up",
        ArrowDown: "down",
        ArrowLeft: "left",
        ArrowRight: "right",
      };

      const newDir = keyMap[e.key];
      if (!newDir) return;

      // Prevent reversing directly into itself
      const opposite = {
        up: "down",
        down: "up",
        left: "right",
        right: "left"
      };

      if (newDir !== opposite[this.direction]) {
        this.nextDirection = newDir;
      }
    });

    // Click to start/pause/reset
    document.addEventListener("click", () => {
      if (!this.gameStarted) {
        this.gameStarted = true;
        this.gamePaused = false;
      } else if (this.gameOver) {
        this.resetGameState();
      } else {
        this.gamePaused = !this.gamePaused;
      }
    });
  }

  start() {
    setInterval(() => this.update(), 250); // ms
  }

  update() {
    if (!this.gameStarted || this.gamePaused) {
      this.render();
      return;
    }

    if (this.gameOver) {
      this.flashCounter++;
      if (this.flashCounter % 10 === 0) {
        this.flashToggle = !this.flashToggle;
      }
      this.render(true);
      return;
    }

    // Move head forward
    this.direction = this.nextDirection;
    const head = { ...this.snake[0] };
    if (this.direction === "up") head.y--;
    if (this.direction === "down") head.y++;
    if (this.direction === "left") head.x--;
    if (this.direction === "right") head.x++;

    // Collision detection: wall or self
    if (head.x < 0 || head.x >= this.gridCount ||
        head.y < 0 || head.y >= this.gridCount ||
        this.snake.some(seg => seg.x === head.x && seg.y === head.y)) {
      this.gameOver = true;
      this.flashCounter = 0;
      return this.render(true);
    }

    this.snake.unshift(head); // Add new head to the front

    // Check for apple
    if (head.x === this.apple.x && head.y === this.apple.y) {
      this.spawnApple(); // Keep tail, grow snake
    } else {
      this.snake.pop(); // Move tail, don't grow
    }

    this.render();
  }

  render(isFlashing = false) {
    const ctx = this.context;
    const s = this.canvasSize;

    // Background and border
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, s, s);
    ctx.fillStyle = "white";
    ctx.fillRect(1, 1, s - 2, s - 2);

    if (this.gameOver && isFlashing) { // Flashing when dead
      ctx.fillStyle = this.flashToggle ? "magenta" : "cyan";
      ctx.beginPath();
      ctx.arc(
        Math.random() * s,
        Math.random() * s,
        3 + Math.random() * 2,
        0,
        2 * Math.PI
      );
      ctx.fill();
    } else { // Draw apple
      ctx.fillStyle = "green";
      ctx.fillRect(
        this.apple.x * this.cellSize,
        this.apple.y * this.cellSize,
        this.cellSize,
        this.cellSize
      );

      // Draw snake
      this.snake.forEach((seg, idx) => {
        ctx.fillStyle = idx === 0 ? "yellow" : "orange"; // head vs body
        ctx.fillRect(
          seg.x * this.cellSize,
          seg.y * this.cellSize,
          this.cellSize,
          this.cellSize
        );
      });
    }

    // Push updated canvas to favicon
    this.faviconLink.href = this.canvas.toDataURL("image/png");

    // Update window title
    if (!this.gameStarted) {
      document.title = "🐛 Click to start";
    } else if (this.gameOver) {
      document.title = "☠️ Game Over. Click to Reset";
    } else {
      document.title = `🐛 Length: ${this.snake.length}${this.gamePaused ? " (paused)" : ""}`;
    }
  }
}

// Device check
function isSupported() {
  const isMobile = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|Mobile/i.test(navigator.userAgent);
  if (isMobile) {
    document.body.innerHTML = "";
    document.body.style.background = "black";
    document.body.style.color = "red";
    document.body.style.display = "flex";
    document.body.style.alignItems = "center";
    document.body.style.justifyContent = "center";
    document.body.style.fontFamily = "monospace";
    document.body.style.fontSize = "3.33em";
    document.body.style.textAlign = "center";
    document.title = "No Mobile";
    document.body.textContent = "🚫 Mobile Not Supported";
    return true;
  }
  return false;
}

if (!isSupported()) { // No mobile
  const snakeGame = new FaviconSnakeGame();
  snakeGame.start();
}
