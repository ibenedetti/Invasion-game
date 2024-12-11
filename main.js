const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');

canvas.width = innerWidth;
canvas.height = innerHeight;

let game = {
    over: false,
    active: true
}
const scoreElement = document.querySelector('#scoreElement');
const gameOverMessage = document.querySelector('#gameOverMessage');

let score = 0;

class Player {
    constructor() {   

        this.velocity = {
            x: 0,
            y: 0
        }

        const image = new Image();
        image.src = './spaceship.png';

        image.onload = () => {
            const scale = 1.5;
            this.image = image;
            this.width = image.width * scale;
            this.height = image.height * scale;         
            this.position = {
                x: canvas.width / 2 - this.width / 2,
                y: canvas.height - this.height - 20
            }
         }

    }

    draw() {
        // c.fillStyle = 'red';
        // c.fillRect(this.position.x, this.position.y, this.width, this.height);
        
        c.drawImage(
            this.image, 
            this.position.x, 
            this.position.y, 
            this.width, 
            this.height
        );
    }

    update() {
        if (this.image) {
            this.draw();
            const nextPosition = this.position.x + this.velocity.x;

        if (nextPosition < 0) {
            this.position.x = 0;
        }
        else if (nextPosition + this.width > canvas.width) {
            this.position.x = canvas.width - this.width;
        }
        else {
            this.position.x = nextPosition;
        }
    }
        
    }
}

class Projectile {
    constructor({ position, velocity }) {
        this.position = position;
        this.velocity = velocity;

        this.radius = 3;

    }

    draw() {
        c.beginPath();
        c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        c.fillStyle = 'cyan';
        c.fill();
        c.closePath();
    }

    update() {
        this.draw();
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
    }
}

class Invader {
    constructor({ position }) {   
        this.velocity = {
            x: 0,
            y: 0
        }

        const image = new Image();
        image.src = './invader.png';

        // Set default dimensions that will be used before image loads
        this.width = 30;  // Default width
        this.height = 30; // Default height
        this.position = {
            x: position.x,
            y: position.y
        }

        image.onload = () => {
            const scale = 0.07;
            this.image = image;
            this.width = image.width * scale;
            this.height = image.height * scale;
        }
    }

    draw() {        
        if (this.image) {
            c.drawImage(
                this.image, 
                this.position.x, 
                this.position.y, 
                this.width, 
                this.height
            );
        } else {
            // Draw placeholder rectangle while image loads
            c.fillStyle = 'red';
            c.fillRect(this.position.x, this.position.y, this.width, this.height);
        }
    }

    update({velocity}) {
        this.draw();
        this.position.x += velocity.x;
        this.position.y += velocity.y;
    }
}

class Grid {
    constructor() {
        this.position = {
            x: 0,
            y: 0
        }

        this.velocity = {
            x: 3,
            y: 0
        }

        this.invaders = [];
        const rows = Math.floor(Math.random() * 5 + 2);
        const columns = Math.floor(Math.random() * 5 + 5);

        // Use fixed spacing values based on expected invader size
        const INVADER_SPACING_X = 50;
        const INVADER_SPACING_Y = 50;
        
        this.width = columns * INVADER_SPACING_X;

        for (let y = 0; y < rows; y++) {          
            for (let x = 0; x < columns; x++) {   
                this.invaders.push(new Invader({
                    position: {
                        x: x * INVADER_SPACING_X,                
                        y: y * INVADER_SPACING_Y                 
                    }
                }));
            }
        }
    }
    
    update() {
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;

        this.velocity.y = 0;

        if (this.position.x + this.width >= canvas.width + 30 || this.position.x <= 0) {
            this.velocity.x = -this.velocity.x;
            this.velocity.y = 30;
        }
    }
}

class Particle {
    constructor({ position, velocity, radius, color, fades }) {
        this.position = position;
        this.velocity = velocity;

        this.radius = radius;
        this.color = color;
        this.opacity = 1;
        this.fades = fades;

    }

    draw() {
        c.save();
        c.globalAlpha = this.opacity;
        c.beginPath();
        c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        c.fillStyle = this.color;
        c.fill();
        c.closePath();
        c.restore();
    }

    update() {
        this.draw();
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;

        if (this.fades) this.opacity -= 0.01;
    }
}


const player = new Player();
// player.draw();
const projectiles = [];
const grids = [new Grid()];
const particles = [];


let frames = 0;

function endGame(message) {
    const reloadSvg = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
           <path d="M17.65 6.35A7.958 7.958 0 0012 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0112 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" fill="white"/>
        </svg>
    `;
    gameOverMessage.innerHTML = `
        ${message}
        <a href="#" onclick="window.location.reload(); return false;">
            ${reloadSvg}
        </a>
    `;
    gameOverMessage.style.display = 'block';
    game.active = false;
    grids.length = 0;
}


function animate () {
    if (!game.active) {
        requestAnimationFrame(animate);
        c.fillStyle = 'black';
        c.fillRect(0, 0, canvas.width, canvas.height);
        player.update();
        particles.forEach((particle, i) => {
            if (particle.opacity <= 0) {
                setTimeout(() => {
                    particles.splice(i, 1);
                }, 0)
            }
            particle.update();
        });
        return;
    }

    requestAnimationFrame(animate);
    c.fillStyle = 'black';

    c.fillRect(0, 0, canvas.width, canvas.height);
    player.update();

    // UPDATE SCORE
    scoreElement.innerHTML = `Score: ${score}`;

    if (score >= 50000) {
        endGame('You Win!');
        return;
    }

    particles.forEach((particle, i) => {
        if (particle.position.y - particle.radius >= canvas.height) {
            setTimeout(() => {
                particle.position.x = Math.random() * canvas.width;
                particle.position.y = -particle.radius;
            }, 0)
        }
        if (particle.opacity <= 0) {
            setTimeout(() => {
                particles.splice(i, 1);
            }, 0)
        }
        particle.update();
    })
    projectiles.forEach((projectile, index) => {
        if (projectile.position.y + projectile.radius <= 0) {
            setTimeout(() => {
                projectiles.splice(index, 1);
            }, 0)
        } else {
            projectile.update();            
        }
    })
    
    grids.forEach(grid => {
        grid.update();
        grid.invaders.forEach((invader, i) => {
            invader.update({
                velocity: grid.velocity});

                // lose condition
                if (invader.position.y + invader.height >= canvas.height) {
                    endGame('Game Over');
                    return;
                }
    

                // Check collision between projectile and invader
                projectiles.forEach((projectile, j) => {
                    if (projectile.position.y - projectile.radius <= 
                        invader.position.y + invader.height && 
                        projectile.position.x + projectile.radius >=
                        invader.position.x && 
                        projectile.position.x - projectile.radius <= invader.position.x){
                        
                        for (let i = 0; i < 15; i++) {
                            particles.push(new Particle({
                                position: {
                                    x: invader.position.x + invader.width / 2,
                                    y: invader.position.y + invader.height / 2
                                },
                                velocity: {
                                    x: (Math.random() - 0.5) * 2,
                                    y: (Math.random() - 0.5) * 2
                                },
                                radius: Math.random() * 3,
                                color: 'yellow',
                                fades: true
                            }))
                        }
                       
                        setTimeout(() => {
                            grid.invaders.splice(i, 1);
                            projectiles.splice(j, 1);
                            score += 100;
                            console.log(score);
                        }, 0);
                    }
                })
        })
    })

    if (frames % 1000 === 0) {
        grids.push(new Grid());
    }

    frames++;
}

animate()

addEventListener('keydown', ({key}) => {
    console.log(key);
    switch (key) {
        case 'a':
            player.velocity.x = -5;
            break;
        case 'd':
            player.velocity.x = 5;
            break;
        case ' ':
            console.log('shoot');
            projectiles.push(
                new Projectile({ 
                    position: { 
                        x: player.position.x + player.width / 2, 
                        y: player.position.y
                    },
                     velocity: { 
                        x: 0, 
                        y: - 10 
                    } 
                })
            )
            break;
    }
});

for (let i = 0; i < 100; i++) {
    particles.push(new Particle({
        position: {
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height
        },
        velocity: {
            x: 0,
            y: 1
        },
        radius: Math.random() * 3,
        color: 'white'
    }))
}

canvas.addEventListener('click', () => {
    projectiles.push(
        new Projectile({ 
            position: { 
                x: player.position.x + player.width / 2, 
                y: player.position.y
            },
            velocity: { 
                x: 0, 
                y: -10 
            } 
        })
    )
})

addEventListener('keyup', ({key}) => {
    switch (key) {
        case 'a':
        case 'd':
            player.velocity.x = 0;
            break;
    }
});