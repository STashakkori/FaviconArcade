/*
 FaviconFroggerGame: The world's smallest Frogger for all people
 
 $t@$h
*/
class FaviconFroggerGame {
  constructor(size = 64) { // 64 x 64
    this.canvasSize = size; // Game area
    this.canvas = document.createElement("canvas");
    this.canvas.width = size;
    this.canvas.height = size;
    this.context = this.canvas.getContext("2d");

    // Create a link element to update favicon dynamically
    this.faviconLink = document.createElement("link");
    this.faviconLink.rel = "icon";
    document.head.appendChild(this.faviconLink);

    this.cellSize = 8; // Grid
    this.rows = size / this.cellSize;

    this.resetGameState(); // Initialize state
    this.bindEvents(); // Bind input
  }

  // Initialize game state variables
  resetGameState() {
    this.gameStarted = false;
    this.gamePaused = true;
    this.gameOver = false;
    this.victory = false;
    this.flashToggle = false;
    this.flashCounter = 0;
    this.lives = 3;

    this.frog = { // Frog starts at bottom center
      x: Math.floor(this.canvasSize / 2 / this.cellSize),
      y: this.rows - 1,
    };

    this.cars = this.generateCars(); // Per lane
  }

  generateCars() { // Direction, speed, and spacing
    const lanes = [2, 3, 4, 5];
    return lanes.map((lane, i) => {
      const dir = i % 2 === 0 ? 1 : -1; // Alternate directions per lane
      const speed = 0.15 + 0.05 * i; // Each lane moves a bit faster
      const isTruck = i % 3 === 0; // Every 3rd lane is a truck lane
      const carCount = isTruck ? 2 : 3; // Fewer trucks than cars

      return {
        y: lane,
        dir, // +1 is right, -1 is left
        speed, // Movement per frame
        cars: Array.from({ length: carCount }, (_, j) => ({
          x: (j * 20 + (i * 10)) % this.rows,
          size: isTruck ? (Math.random() < 0.5 ? 2 : 3) : 1,
        })),
      };
    });
  }

  bindEvents() { // Arrow keys to move
    document.addEventListener("keydown", (e) => { // Movement
      if (!this.gameStarted || this.gamePaused || this.gameOver) return;

      if (e.key === "ArrowUp") this.frog.y--;
      else if (e.key === "ArrowDown") this.frog.y++;
      else if (e.key === "ArrowLeft") this.frog.x--;
      else if (e.key === "ArrowRight") this.frog.x++;

      // Clamp the frog so it stays in bounds
      this.frog.x = Math.max(0, Math.min(this.rows - 1, this.frog.x));
      this.frog.y = Math.max(0, Math.min(this.rows - 1, this.frog.y));
    });

    // Mouse to start/pause/reset
    document.addEventListener("click", () => {
      if (!this.gameStarted) {
        this.gameStarted = true; // First click
        this.gamePaused = false;
      } else if (this.gameOver) {
        this.resetGameState();
      } else {
        this.gamePaused = !this.gamePaused;
      }
    });
  }

  start() { // Game loop
    setInterval(() => this.update(), 77); // ms
  }

  update() { // Movement, collisions, win/loss check
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

    // Move cars/trucks
    for (const lane of this.cars) {
      for (const car of lane.cars) {
        car.x += lane.dir * lane.speed;
        if (car.x + car.size < -1) car.x = this.rows;
        if (car.x > this.rows) car.x = -car.size;
      }
    }

    // Collision detection
    for (const lane of this.cars) {
      if (lane.y === this.frog.y) {
        for (const car of lane.cars) {
          const cx = Math.round(car.x);
          if (
            this.frog.x >= cx &&
            this.frog.x < cx + car.size
          ) {
            this.lives--;
            if (this.lives <= 0) {
              this.gameOver = true;
              this.victory = false;
              this.flashCounter = 0;
              return;
            }
            // Reset frog position
            this.frog.y = this.rows - 1;
            this.frog.x = Math.floor(this.rows / 2);
          }
        }
      }
    }

    // Win check
    if (this.frog.y === 0) {
      this.gameOver = true;
      this.victory = true;
      this.flashCounter = 0;
    }

    this.render();
  }

  render(clearOnly = false) {
    const ctx = this.context;
    const s = this.canvasSize;

    // Full background
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, s, s);
    ctx.fillStyle = "white";
    ctx.fillRect(1, 1, s - 2, s - 2);

    if (this.gameOver) { // Clear vehicles if game is over
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
    } else { // Draw vehicles
      for (const lane of this.cars) {
        ctx.fillStyle = "red";
        for (const car of lane.cars) {
          const cx = Math.round(car.x);
          ctx.fillRect(
            cx * this.cellSize,
            lane.y * this.cellSize,
            car.size * this.cellSize,
            this.cellSize
          );
        }
      }

      // Frog information
      ctx.fillStyle = "green";
      ctx.fillRect(
        this.frog.x * this.cellSize,
        this.frog.y * this.cellSize,
        this.cellSize,
        this.cellSize
      );
    }

    this.faviconLink.href = this.canvas.toDataURL("image/png");

    if (!this.gameStarted) {
      document.title = "🐸 Click to start";
    } else if (this.gameOver) {
      document.title = this.victory
        ? "🏆 You win! Click to reset"
        : "☠️ Game Over. Click to reset";
    } else {
      document.title = `Frogger 🐸 Lives: ${this.lives}${this.gamePaused ? " (paused)" : ""}`;
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
  const frogger = new FaviconFroggerGame();
  frogger.start();
}
