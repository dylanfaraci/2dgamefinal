const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const scoreDisplay = document.getElementById('score');
    const gameOverText = document.getElementById('gameOver');
    const restartBtn = document.getElementById('restartBtn');

    let fruits = [];
    let particles = [];
    let score = 0;
    let spawnTimer = 0;
    let spawnInterval = 40;
    let difficulty = 1;
    let difficultyTimer = 0;
    let gameOver = false;

   
    const fruitImages = {
      apple: 'https://cdn-icons-png.flaticon.com/512/415/415682.png',
      banana: 'https://cdn-icons-png.flaticon.com/512/1514/1514933.png',
      orange: 'https://cdn-icons-png.flaticon.com/512/1728/1728765.png',
      bomb: 'https://cdn-icons-png.flaticon.com/512/394/394532.png'
    };

    const images = {};
    const fruitTypes = ['apple', 'banana', 'orange', 'bomb'];

    function preloadImages(callback) {
      let loaded = 0;
      fruitTypes.forEach(type => {
        const img = new Image();
        img.src = fruitImages[type];
        img.onload = () => {
          images[type] = img;
          if (++loaded === fruitTypes.length) callback();
        };
      });
    }

    class Fruit {
      constructor(type) {
        this.radius = 35;
        this.x = Math.random() * (canvas.width - this.radius * 2) + this.radius;
        this.y = canvas.height + this.radius;
        this.vx = (Math.random() - 0.5) * 2 * difficulty;
        this.vy = -Math.random() * 4 * difficulty - 4;
        this.gravity = 0.15 * difficulty;
        this.clicked = false;
        this.type = type;
        this.image = images[this.type];
      }

      update() {
        this.vy += this.gravity;
        this.x += this.vx;
        this.y += this.vy;
      }

      draw(ctx) {
        if (!this.clicked && this.image) {
          ctx.drawImage(this.image, this.x - this.radius, this.y - this.radius, this.radius * 2, this.radius * 2);
        }
      }

      isClicked(mouseX, mouseY) {
        const dx = this.x - mouseX;
        const dy = this.y - mouseY;
        return Math.sqrt(dx * dx + dy * dy) < this.radius;
      }
    }

    class Particle {
      constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 6;
        this.vy = (Math.random() - 0.5) * 6;
        this.radius = 5;
        this.life = 30;
        this.color = color;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life--;
      }

      draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
      }
    }

    function spawnFruit() {
      const isBomb = Math.random() < 0.1;
      if (isBomb) {
        fruits.push(new Fruit('bomb'));
      } else {
        const options = ['apple', 'banana', 'orange'];
        const type = options[Math.floor(Math.random() * options.length)];
        fruits.push(new Fruit(type));
      }
    }

    function createClickEffect(x, y, color) {
      for (let i = 0; i < 8; i++) {
        particles.push(new Particle(x, y, color));
      }
    }

    function updateGame() {
      if (gameOver) return;

      difficultyTimer++;
      if (difficultyTimer % (60 * 5) === 0) {
        difficulty += 0.1;
        spawnInterval = Math.max(10, spawnInterval - 1);
      }

      spawnTimer++;
      if (spawnTimer >= spawnInterval) {
        spawnFruit();
        spawnTimer = 0;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = fruits.length - 1; i >= 0; i--) {
        const fruit = fruits[i];
        fruit.update();
        fruit.draw(ctx);
        if (fruit.y > canvas.height + 50 || fruit.clicked) {
          fruits.splice(i, 1);
        }
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.update();
        p.draw(ctx);
        if (p.life <= 0) particles.splice(i, 1);
      }

      requestAnimationFrame(updateGame);
    }

    canvas.addEventListener('click', function (e) {
      if (gameOver) return;

      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      for (let fruit of fruits) {
        if (fruit.isClicked(mouseX, mouseY) && !fruit.clicked) {
          fruit.clicked = true;
          createClickEffect(fruit.x, fruit.y, '#fff'); // white splash

          if (fruit.type === 'bomb') {
            endGame();
          } else {
            score++;
            scoreDisplay.textContent = `Score: ${score}`;
          }
          break;
        }
      }
    });

    function endGame() {
      gameOver = true;
      gameOverText.style.display = 'block';
      restartBtn.style.display = 'inline-block';
    }

    function restartGame() {
      fruits = [];
      particles = [];
      score = 0;
      spawnTimer = 0;
      spawnInterval = 40;
      difficulty = 1;
      difficultyTimer = 0;
      gameOver = false;
      scoreDisplay.textContent = 'Score: 0';
      gameOverText.style.display = 'none';
      restartBtn.style.display = 'none';
      updateGame();
    }

    restartBtn.addEventListener('click', restartGame);

    
    preloadImages(() => {
      updateGame();
    });