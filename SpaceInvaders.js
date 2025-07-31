/*
  FaviconSpaceInvadersGame - The world's smallest Space Invaders for all people.
  
  $t@$h
*/
class FaviconSpaceInvadersGame {
  constructor(size = 64) { // 64 x 64
    this.canvasSize = size; // Game area
    this.cellSize = 8; // Each game cell is 8x8 pixels
    this.gridWidth = size / this.cellSize;
    this.gridHeight = size / this.cellSize;

    // Offscreen canvas for rendering favicon image
    this.canvas = document.createElement("canvas");
    this.canvas.width = size;
    this.canvas.height = size;
    this.context = this.canvas.getContext("2d");

    // Add favicon link to document
    this.faviconLink = document.createElement("link");
    this.faviconLink.rel = "icon";
    document.head.appendChild(this.faviconLink);

    // Set up initial game state
    this.resetGameState();

    // Hook up input events
    this.bindEvents();
  }

  // Resets game variables to starting conditions
  resetGameState() {
    this.gameStarted = false;
    this.gamePaused = true;
    this.gameOver = false;
    this.victory = false;
    this.flashToggle = false; // For visual flashing effect on win/lose
    this.flashCounter = 0;

    // Set player position centered at bottom
    this.player = {
      x: Math.floor(this.gridWidth / 2),
      y: this.gridHeight - 1,
    };

    this.bullet = null;
    this.bulletCooldown = 0;

    // Generate enemy grid (3 rows, every other column)
    this.enemies = [];
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < this.gridWidth; col += 2) {
        this.enemies.push({ x: col, y: row });
      }
    }

    this.enemyDir = 1; // Initial enemy movement direction: right
    this.enemyMoveTimer = 0; // Timer for staggered enemy movement
    this.score = 0;
  }


  bindEvents() {
    document.addEventListener("keydown", (e) => { // Arrow keys + space to shoot
      if (!this.gameStarted || this.gamePaused || this.gameOver) return;

      if (e.key === "ArrowLeft" && this.player.x > 0) {
        this.player.x--;
      } else if (e.key === "ArrowRight" && this.player.x < this.gridWidth - 1) {
        this.player.x++;
      } else if (e.key === " " && (!this.bullet || this.bulletCooldown === 0)) {
        // Shoot bullet if cooldown allows
        this.bullet = { x: this.player.x, y: this.player.y - 1 };
        this.bulletCooldown = 5;
      }
    });

    document.addEventListener("click", () => { // Click to toggle pause/start
      if (!this.gameStarted) {
        this.gameStarted = true;
        this.gamePaused = false;
      } else if (this.gameOver || this.victory) {
        this.resetGameState();
      } else {
        this.gamePaused = !this.gamePaused;
      }
    });
  }

  // Start game loop: runs every 120ms (~8 fps)
  start() {
    setInterval(() => this.update(), 120);
  }

  update() {
    if (!this.gameStarted || this.gamePaused) {
      this.render();
      return;
    }

    if (this.bulletCooldown > 0) this.bulletCooldown--;

    // Show win or loss animation if game ended
    if (this.gameOver || this.victory) {
      this.flashCounter++;
      if (this.flashCounter % 10 === 0) {
        this.flashToggle = !this.flashToggle;
      }
      this.render(true);
      return;
    }

    // Bullet movement and collision
    if (this.bullet) {
      this.bullet.y--;
      if (this.bullet.y < 0) {
        this.bullet = null;
      } else { // Check for enemy hit
        const hitIndex = this.enemies.findIndex(
          (e) => e.x === this.bullet.x && e.y === this.bullet.y
        );
        if (hitIndex !== -1) {
          this.enemies.splice(hitIndex, 1);
          this.bullet = null;
          this.score++;
        }
      }
    }

    // Enemy movement
    this.enemyMoveTimer++;
    if (this.enemyMoveTimer >= 10) {
      this.enemyMoveTimer = 0;

      const leftEdge = Math.min(...this.enemies.map(e => e.x));
      const rightEdge = Math.max(...this.enemies.map(e => e.x));

      // Reverse direction and move down if at edge
      if (
        (this.enemyDir === 1 && rightEdge >= this.gridWidth - 1) ||
        (this.enemyDir === -1 && leftEdge <= 0)
      ) {
        for (let enemy of this.enemies) {
          enemy.y++;
        }
        this.enemyDir *= -1;
      } else {
        for (let enemy of this.enemies) {
          enemy.x += this.enemyDir;
        }
      }
    }

    // End game conditions
    if (this.enemies.some(e => e.y >= this.player.y)) {
      this.gameOver = true;
      this.flashCounter = 0;
    }

    if (this.enemies.length === 0) {
      this.victory = true;
      this.flashCounter = 0;
    }

    this.render();
  }

  // Renders entire scene onto offscreen canvas, then set as favicon
  render(isFlashing = false) {
    const ctx = this.context;
    const s = this.canvasSize;

    // Draw background
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, s, s);
    ctx.fillStyle = "white";
    ctx.fillRect(1, 1, s - 2, s - 2);

    // Show win/loss animation if game ended
    if ((this.gameOver || this.victory) && isFlashing) {
      ctx.fillStyle = this.flashToggle
        ? (this.victory ? "lime" : "red")
        : "cyan";
      ctx.beginPath();
      ctx.arc(
        Math.random() * s,
        Math.random() * s,
        3 + Math.random() * 2,
        0,
        2 * Math.PI
      );
      ctx.fill();
    } else {
      // Draw enemies
      ctx.fillStyle = "magenta";
      this.enemies.forEach((e) => {
        ctx.fillRect(
          e.x * this.cellSize,
          e.y * this.cellSize,
          this.cellSize,
          this.cellSize
        );
      });

      // Draw bullet
      if (this.bullet) {
        ctx.fillStyle = "black";
        ctx.fillRect(
          this.bullet.x * this.cellSize + this.cellSize / 3,
          this.bullet.y * this.cellSize,
          this.cellSize / 3,
          this.cellSize * 0.8
        );
      }

      // Draw player
      ctx.fillStyle = "green";
      ctx.fillRect(
        this.player.x * this.cellSize,
        this.player.y * this.cellSize,
        this.cellSize,
        this.cellSize
      );
    }

    // Set canvas output as favicon
    this.faviconLink.href = this.canvas.toDataURL("image/png");

    // Update browser tab title with game status
    if (!this.gameStarted) {
      document.title = "🛸 Click to start";
    } else if (this.victory) {
      document.title = "🎉 You Win! Click to Restart";
    } else if (this.gameOver) {
      document.title = "💥 Game Over. Click to Reset";
    } else {
      document.title = `Score: ${this.score}${this.gamePaused ? " (paused)" : ""}`;
    }
  }
}

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
  const invadersGame = new FaviconSpaceInvadersGame();
  invadersGame.start();
}
