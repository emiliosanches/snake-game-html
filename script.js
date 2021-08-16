class Snake {
  onMove = () => {};
  onSelfCollision = () => {};
  gameContainer = null;
  hasNewPoint = false;

  constructor() {
    this.snakeParts = [document.createElement('div')]
    this.snakeParts[0].classList.add('snake-part')
  }

  setSnakeDirection(direction) {
    this.snakeDirection = direction
  }

  moveSnakeParts(positions) {
    let currentPartPosition = [this.snakeParts[0].offsetLeft, this.snakeParts[0].offsetTop]

    this.snakeParts[0].style.left = `${positions[0]}px`
    this.snakeParts[0].style.top = `${positions[1]}px`

    for (let partIndex in this.snakeParts) {
      if (partIndex == 0) continue
      let tmpPosition = [this.snakeParts[partIndex].offsetLeft, this.snakeParts[partIndex].offsetTop]

      this.snakeParts[partIndex].style.left = `${currentPartPosition[0]}px`
      this.snakeParts[partIndex].style.top = `${currentPartPosition[1]}px`

      currentPartPosition = tmpPosition
    }

    if (this.hasNewPoint) {
      this.addNewSnakePart(currentPartPosition)
      this.hasNewPoint = false
    }

    if (this.onMove) this.onMove(positions)

    this.detectSelfCollision()
  }

  renderSnakeParts() {
    this.snakeParts.forEach(snakePart => {
      this.gameContainer.appendChild(snakePart)
    })
  }

  moveSnake() {
    let newStartPosition = [];

    switch (this.snakeDirection) {
      case 1:
        newStartPosition = [this.snakeParts[0].offsetLeft, this.snakeParts[0].offsetTop - 16];
        break;
      case -2:
        newStartPosition = [this.snakeParts[0].offsetLeft - 16, this.snakeParts[0].offsetTop];
        break;
      case -1:
        newStartPosition = [this.snakeParts[0].offsetLeft, this.snakeParts[0].offsetTop + 16];
        break;
      case 2:
        newStartPosition = [this.snakeParts[0].offsetLeft + 16, this.snakeParts[0].offsetTop];
        break;
    }

    this.moveSnakeParts(newStartPosition)
  }

  addNewSnakePart(position) {
    const newSnakePart = document.createElement('div')
    newSnakePart.classList.add('snake-part')
    newSnakePart.style.left = `${position[0]}px`
    newSnakePart.style.top = `${position[1]}px`

    this.snakeParts.push(newSnakePart)
    this.renderSnakeParts()
  }

  detectSelfCollision() {
    if (this.snakeParts.slice(1).some(part => part.offsetTop === this.snakeParts[0].offsetTop && part.offsetLeft === this.snakeParts[0].offsetLeft)) this.onSelfCollision()
  }
}

class Game {
  capturePoints = [];
  moveInterval = null;
  moveIntervalTime = 350;
  score = 0;

  constructor(gameContainer, snake) {
    this.snake = snake
    this.gameContainer = gameContainer
    this.snake.gameContainer = this.gameContainer;
    this.snake.renderSnakeParts()
    this.spawnNewCapturePoints()
  }

  start() {
    document.addEventListener('keydown', e => {
      const directions = {
        ArrowUp: 1,
        ArrowRight: 2,
        ArrowDown: -1,
        ArrowLeft: -2
      }

      console.log(this.snake.snakeDirection)
      console.log(directions[e.code])

      if (this.snake.snakeDirection * -1 === directions[e.code]) return

      this.snake.setSnakeDirection(directions[e.code])
    })

    this.snake.onMove = this.onSnakeMove.bind(this)

    this.snake.onSelfCollision = this.gameOver.bind(this)

    this.addScore(0)

    this.moveInterval = setInterval(() => this.snake.moveSnake(), this.moveIntervalTime)
  }

  spawnNewCapturePoints() {
    while (this.capturePoints.length < 5) {
      const positions = [Math.floor(Math.random() * 39) * 16, Math.floor(Math.random() * 39) * 16]

      const capturePoint = document.createElement('div')
      capturePoint.classList.add('capture-point')
      capturePoint.style.left = `${positions[0]}px`
      capturePoint.style.top = `${positions[1]}px`

      this.capturePoints.push(capturePoint)
    }

    this.renderCapturePoints()
  }

  renderCapturePoints() {
    for (let capturePoint of this.capturePoints) {
      this.gameContainer.appendChild(capturePoint)
    }
  }

  takeCapturePoint(capturePointIndex) {
    this.gameContainer.removeChild(this.capturePoints[capturePointIndex])
    this.capturePoints.splice(capturePointIndex, 1)
    this.snake.hasNewPoint = true
    this.addScore(Math.floor(5 + this.score * 0.05))
    clearInterval(this.moveInterval)
    this.moveIntervalTime /= 1.05
    this.moveInterval = setInterval(() => this.snake.moveSnake(), this.moveIntervalTime)
  }

  onSnakeMove(snakeHeadPosition) {
    const isGameOver = snakeHeadPosition[0] >= 640 || snakeHeadPosition[0] < 0 || snakeHeadPosition[1] >= 640 || snakeHeadPosition[1] < 0

    if (isGameOver) this.gameOver()

    const capturePoint = this.capturePoints.findIndex(capturePoint => {
      return parseInt(capturePoint.style.left.slice(0, -2)) === snakeHeadPosition[0] && parseInt(capturePoint.style.top.slice(0, -2)) === snakeHeadPosition[1]
    })


    if (capturePoint > -1) {
      this.takeCapturePoint(capturePoint)
      this.spawnNewCapturePoints()
    }
  }

  gameOver() {
    document.querySelector('body').style.background = 'red'
    clearInterval(this.moveInterval)
  }

  addScore(amount) {
    this.score += amount;
    document.getElementById('score-marker').innerText = this.score;
  }
}

window.onload = () => {
  const snake = new Snake();
  const game = new Game(document.getElementById('game-container'), snake)
  game.start()
}