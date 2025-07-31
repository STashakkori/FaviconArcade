/*
 FaviconPongGame: The world's smallest Pong for all people

 $t@$h
*/
class FaviconPongGame {
  constructor(size = 64) { // 64 x 64
    this.canvasSize = size; // Game area
    this.canvas = document.createElement("canvas");
    this.canvas.width = size;
    this.canvas.height = size;
    this.context = this.canvas.getContext("2d");

    this.faviconLink = document.createElement("link");
    this.faviconLink.rel = "icon";
    document.head.appendChild(this.faviconLink);

    // Game element dimensions
    this.ballRadius = 2;
    this.paddleWidth = 22;
    this.paddleHeight = 6;

    // Player positions. Later set so User on bottom, AI on top
    this.playerPaddleX = size / 2;
    this.aiPaddleX = size / 2;

    // Ball initial position and direction
    this.ballPosition = { x: size / 2, y: size / 2 };
    this.ballVelocity = { x: 1, y: 1 };
    this.ballSpeed = 1.5;

    // Score tracking. Gets written to tab title
    this.playerScore = 0;
    this.aiScore = 0;

    // Game state flags
    this.gameIsPaused = true;
    this.gameStarted = false;
    this.gameOver = false;

    // Used for flashing animation on victory
    this.flashFrameCounter = 0;
    this.flashToggle = false;

    // Bind methods to this instance
    this.handleMouse = this.handleMouse.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.updateGameState = this.updateGameState.bind(this);
  }

  // Start the game loop and input listeners
  start() {
    document.addEventListener("mousemove", this.handleMouse);
    document.addEventListener("click", this.handleClick);
    setInterval(this.updateGameState, 77);
  }

  // Move the player paddle based on horizontal mouse position
  handleMouse(event) {
    if (this.gameIsPaused || this.gameOver || !this.gameStarted) return;
    const positionRatio = event.clientX / window.innerWidth;
    this.playerPaddleX = positionRatio * this.canvasSize * 1.08;
  }

  // Handle click events to start, pause, or reset the game
  handleClick() {
    if (!this.gameStarted) {
      this.gameStarted = true;
      this.gameIsPaused = false;
    } else if (this.gameOver) {
      this.resetGame();
    } else {
      this.gameIsPaused = !this.gameIsPaused;
    }
    this.renderFavicon();
  }

  // Reset ball to center with random direction and base speed
  resetBallPosition() {
    this.ballPosition = {
      x: this.canvasSize / 2,
      y: this.canvasSize / 2
    };
    this.ballVelocity = {
      x: Math.random() < 0.5 ? -1 : 1,
      y: Math.random() < 0.5 ? -1 : 1
    };
    this.ballSpeed = 1.5;
  }

  // Later used to reset game state after a victory
  resetGame() {
    this.playerScore = 0;
    this.aiScore = 0;
    this.gameStarted = false;
    this.gameOver = false;
    this.gameIsPaused = true;
    this.resetBallPosition();
    this.renderFavicon();
  }

  // Determine if User won. Classic pong- First to 11, win by 2
  checkWinCondition() {
    return (
      this.playerScore >= 11 &&
      this.playerScore - this.aiScore >= 2
    );
  }

  // Main game loop: updates positions, collisions, and checks game state
  updateGameState() {
    // If game is paused or over, handle animations only
    if (this.gameIsPaused || this.gameOver) {
      // Animate flashing circle for win screen
      if (this.gameOver) {
        this.flashFrameCounter++;
        if (this.flashFrameCounter % 10 === 0) {
          this.flashToggle = !this.flashToggle;
        }
      }
      this.renderFavicon();
      return;
    }

    // Move the ball based on velocity and speed
    const ball = this.ballPosition;
    ball.x += this.ballVelocity.x * this.ballSpeed;
    ball.y += this.ballVelocity.y * this.ballSpeed;

    // Left and right wall bounce
    if (ball.x < 0 || ball.x > this.canvasSize) {
      this.ballVelocity.x *= -1;
    }

    // User paddle collision
    const bottomY = this.canvasSize - this.paddleHeight;
    const topY = this.paddleHeight;

    const hitBottomPaddle =
      ball.y >= bottomY &&
      ball.x >= this.playerPaddleX - this.paddleWidth / 2 &&
      ball.x <= this.playerPaddleX + this.paddleWidth / 2;

    // AI paddle collision
    const hitTopPaddle =
      ball.y <= topY &&
      ball.x >= this.aiPaddleX - this.paddleWidth / 2 &&
      ball.x <= this.aiPaddleX + this.paddleWidth / 2;

    if (hitBottomPaddle) {
      this.ballVelocity.y *= -1;
      ball.y = bottomY - 1;
    }

    if (hitTopPaddle) {
      this.ballVelocity.y *= -1;
      ball.y = topY + 1;
    }

    // Score
    if (ball.y > this.canvasSize) {
      this.aiScore++;
      this.resetBallPosition();
    } else if (ball.y < 0) {
      this.playerScore++;
      this.resetBallPosition();
    }

    // Winner check
    if (this.checkWinCondition()) {
      this.gameOver = true;
      this.flashFrameCounter = 0;
      this.flashToggle = false;
    }

    // AI tracking. The AI is intentionally a bit slow
    if (ball.x < this.aiPaddleX) this.aiPaddleX -= 1;
    else if (ball.x > this.aiPaddleX) this.aiPaddleX += 1;

    this.renderFavicon(); // Update UI
  }

  renderFavicon() {
    const ctx = this.context;
    const s = this.canvasSize;

    // Background
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, s, s);
    ctx.fillStyle = "white";
    ctx.fillRect(1, 1, s - 2, s - 2);

    // Ball or win animation
    if (!this.gameOver) {
      ctx.fillStyle = "black";
      ctx.beginPath();
      ctx.arc(this.ballPosition.x, this.ballPosition.y, this.ballRadius, 0, 2 * Math.PI);
      ctx.fill();
    } else {
      ctx.fillStyle = this.flashToggle ? "cyan" : "magenta";
      ctx.beginPath();
      ctx.arc(
        Math.random() * s,
        Math.random() * s,
        3 + Math.random() * 2,
        0,
        2 * Math.PI
      );
      ctx.fill();
    }

    // Paddles
    if (!this.gameOver) {
      ctx.fillStyle = "blue";
      ctx.fillRect(
        this.playerPaddleX - this.paddleWidth / 2,
        s - this.paddleHeight,
        this.paddleWidth,
        this.paddleHeight
      );

      ctx.fillStyle = "red";
      ctx.fillRect(
        this.aiPaddleX - this.paddleWidth / 2,
        0,
        this.paddleWidth,
        this.paddleHeight
      );
    }

    // Update favicon
    this.faviconLink.href = this.canvas.toDataURL("image/png");

    // Update title
    if (!this.gameStarted) {
      document.title = "🏓 Click to start";
    } else if (this.gameOver) {
      document.title = "🏆 You win! Click to reset";
    } else {
      document.title = `Blue ${this.playerScore} : ${this.aiScore} Red${this.gameIsPaused ? " (paused)" : ""}`;
    }
  }
}

// Check device
function isSupported() {
  const isMobile = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|Mobile/i.test(navigator.userAgent);

  if (isMobile) {
    document.body.innerHTML = ""; // Wipe page
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
    return true; // Print, exit, inform
  }
  return false;
}

if (!isSupported()) { // No mobile
  const pongGame = new FaviconPongGame();
  pongGame.start();
}
