// Data (Struct of values)
let data = {
	screen: {
		width: 640,
		height: 480,
		halfWidth: null,
		halfHeight: null,
		scale: 1
	},
	projection: {
		width: null,
		height: null,
		halfWidth: null,
		halfHeight: null
	},
	render: {
		delay: 30
	},
	rayCasting: {
		incrementAngle: null,
		precision: 64
	},
	player: {
		fov: 60,
		halfov: null,
		x: 2,
		y: 2,
		angle: 90,
		radius: 10, // para detectar colisões 
		// moves
		speed: {
			moviment: 0.5,
			rotation: 5.0
			}
		},
	map: [
		[1,1,1,1,1,1,1,1,1,1],
		[1,0,0,0,0,0,0,0,0,1],
		[1,0,0,1,1,0,1,0,0,1],
		[1,0,0,1,0,0,1,0,0,1],
		[1,0,0,1,0,0,1,0,0,1],
		[1,0,0,1,0,0,1,0,0,1],
		[1,0,0,1,1,0,1,0,0,1],
		[1,0,0,0,0,0,0,0,0,1],
		[1,0,0,0,0,0,0,0,0,1],
		[1,1,1,1,1,1,1,1,1,1],
	],
	key: {
		up: "KeyW",
		down: "KeyS",
		left: "KeyA",
		right: "KeyD"
	}
}

// Calculate data
data.screen.halfWidth = data.screen.width /2;
data.screen.halfHeight = data.screen.height /2;
data.rayCasting.incrementAngle = data.player.fov / data.screen.width;
data.player.halfov = data.player.fov / 2;
// projection
data.projection.width = data.screen.width / data.screen.scale;
data.projection.height = data.screen.height / data.screen.scale;
data.projection.halfWidth = data.projection.width / 2;
data.projection.halfHeight = data.projection.height / 2;
data.rayCasting.incrementAngle = data.player.fov / data.projection.width;

// Creating screen (canvas)
const screen = document.createElement('canvas');
screen.width = data.screen.width;
screen.height = data.screen.height;
screen.style.border = '1px solid black';
document.body.appendChild(screen);

// Canvas context
const screenContext = screen.getContext('2d');
screenContext.scale(data.screen.scale, data.screen.scale);
screenContext.translate(0.5, 0.5);

// Estamos usando valores de graus nos atributos, portanto, precisamos
// criar uma função que converta valores de graus em valores de radianos.
// Formula: radianos = graus * PI / 180

/**
 * Cast degree to radian
 * @param {Number} degree
 */
function degreeToRadian(degree) {
	let pi = Math.PI;
	return degree * pi / 180;
}

/**
 * Draw line into screen
 * @param {Number} x1
 * @param {Number} y1
 * @param {Number} x2
 * @param {Number} y2
 * @param {String} cssColor
 */
function drawLine(x1, y1, x2, y2, cssColor) {
	screenContext.strokeStyle = cssColor;
	screenContext.beginPath();
	screenContext.moveTo(x1, y1);
	screenContext.lineTo(x2, y2);
	screenContext.stroke();
}

// Start game
main();

/**
 * Main loop
 */
function main() {
	setInterval(function() {
		clearScreen();
		rayCasting();
	}, data.render.delay);
}

/**
 * RayCasting logic
 * Para iniciar nossa lógica, precisamos conhecer alguns conceitos com:
 * player angle, player FOV e Screen width. 
 * A primeira coisa que precisamos saber é que
 * cada raio precisa ser lançado em relação ao ângulo do jogador e ao Campo de
 * Visão (FOV). O FOV do jogador é 60º, mas o foco do jogador está no meio do FOV. 
 * Por isso temos que iniciar o RayCasting no -30º ângulo do jogador. Por exemplo,
 * se o ângulo do jogador for 90º, temos que lançar os raios de 60º um ângulo para
 * 120º outro. Confira a imagem abaixo para ver a representação do FOV do jogador.
 */
function rayCasting() {
	// Dentro da nossa rayCasting() função, podemos obter 
	// o ângulo real do raio com este código:
	let rayAngle = data.player.angle - data.player.halfov;
	/**
	 * Lançamento dos raios: 
	 * Temos que iterar todas as fatias da tela, portanto usaremos a largura da tela
	 * para fazer isso. Para cada iteração, a rayAngle variável precisa ser
	 * incrementada para iterar todo o FOV do jogador. 
	 * Usaremos o data.rayCasting.incrementAngle para fazer isso.
	 */
	for (let rayCount = 0; rayCount < data.projection.width; rayCount++) {
/**
 * Ray data
 * As primeiras coordenadas do raio são as mesmas das coordenadas do jogador.
 * Criaremos um objeto com esses valores para ficar mais organizado.
 */
	let ray = {
		x: data.player.x,
		y: data.player.y
	}

/**
 * Ray path incrementers
 * Para descobrir as próximas coordenadas do raio real, temos que calcular-las
 * com base no ângulo do raio. Para esta etapa, usaremos as funções Math.sin()
 * e Math.cos(). Essas funções nos darão os valores de incremento para o raio
 * a seguir. Nesta etapa usaremos também o atributo precisão, para controlar
 * o intervalo de cada posição do raio. Os sin e cosn os fornecem valores
 * flutuantes, mas podemos dividir esses valores com a precisão para
 * torná-los menores.
 *
 * Nota: Quanto maior o valor da precisão, mais verificações serão realizadas
 * e mais posições o raio terá. Não usaremos um algoritmo DDA que é usado para 
 * encontrar apenas as interseções na grade, para focar da maneira mais simples.
 * 
 * Nota: precisamos usar a degreeToRadians() porque as funções 
 * trigonométricas nestas funcionam com valores do tipo radianos.
 */
	let rayCos = Math.cos(degreeToRadian(rayAngle)) / data.rayCasting.precision;
	let raySin = Math.sin(degreeToRadian(rayAngle)) / data.rayCasting.precision;

/**
 * Wall checking
 * O próximo passo é a verificação da parede. Temos que incrementar as 
 * coordenadas rayCos e raySin para x e y do raio até encontrar uma parede
 * no mapa. Então, nesta etapa precisamos de um loop.

 * Nota: Lembre-se de que as posições da matriz são representadas em regiões 
 * inteiras. As posições dos raios incrementados cos serão sin valores 
 * flutuantes e precisamos converter esses valores para o tipo inteiro. 
 * A função usada para isso é Math.floor()
 */
	let wall = 0;
	while (wall == 0) {
		ray.x += rayCos;
		ray.y += raySin;
		wall = data.map[Math.floor(ray.y)][Math.floor(ray.x)];
/**
 * Quando o raio colidir com alguma parede, o loop será interrompido e teremos 
 * as coordenadas do raio atualizados com a posição da parede. A distância do 
 * RayCasting é calculada nesta etapa, para saber o tamanho da tira que 
 * precisaremos desenhar. Se a parede estiver próxima, a distância será menor 
 * e a linha desenhada será maior. Se a parede estiver longa, a distância 
 * será maior e a linha desenhada será menor.
 */
	}

/**
 * Pythagoras theorem
 * Esta fórmula será utilizada com as coordenadas do jogador e as coordenadas 
 * dos raios da parede.
 * Teorema de Pitágoras: a² + b² = c²
 * Fórmula: distance² = (player x - ray x)² + (player y - ray y)²
 * Código: Math.sqrt(Math.pow(data.player.x - ray.x, 2) + Math.pow(data.player.y - ray.y, 2));
 */
	let distance = Math.sqrt(Math.pow(data.player.x - ray.x, 2) + Math.pow(data.player.y - ray.y, 2));

/**
 * Fish eye fix
 */
	distance = distance * Math.cos(degreeToRadian(rayAngle - data.player.angle));

/**
 * wall height
 * Com a distância que temos que definir a altura da parede, a altura da parede 
 * será utilizada para desenhar a faixa na tela. Não podemos usar a distância 
 * diretamente porque precisamos do valor invertido. Para distância maior, 
 * faixa menor. Para reverter o valor podemos dividir o valor da distância 
 * por data.screen.halfHeight. Este valor definirá o mesmo tamanho para 
 * largura, altura e comprimento.

 * Nota: O wallHeightvalor será utilizado para desenhar a faixa na tela. 
 * As coordenadas da tela são representadas com um tipo inteiro para o nosso 
 * caso, portanto, precisamos converter o valor com Math.floor().
 */
	let wallHeight = Math.floor(data.projection.halfHeight / distance);

/**
 * Draw
 * A altura da parede será usada para desenhar as listras. 
 * Esta etapa é dividida em três operações.

 * Desenhe o teto (do topo da tela até a meia altura da tela menos a altura da parede)
 * Desenhe a parede (da meia altura da tela menos a altura da parede até a meia altura da tela mais a altura da parede)
 * Desenhe o chão (da meia altura da tela mais a altura da parede até a parte inferior da tela)
 */
	drawLine(rayCount, 0, rayCount, data.projection.halfHeight - wallHeight, "darkslateblue");
	drawLine(rayCount, data.projection.halfHeight - wallHeight, rayCount, data.projection.halfHeight + wallHeight, "darkred");
	drawLine(rayCount, data.projection.halfHeight + wallHeight, rayCount, data.projection.height, "gray");

		// Increment
		rayAngle += data.rayCasting.incrementAngle;
	}
}

/**
 * Clear screen
 */
function clearScreen() {
	screenContext.clearRect(0, 0, data.projection.width, data.projection.height);
}

/**
 * Moviment Event
 * W(up)	Obtenha o sin e cos do ângulo do jogador para incrementar as coordenadas do jogador
 * S(down)	Obtenha o sin e cos do ângulo do jogador para diminuir as coordenadas do jogador
 * A(left)	Diminuir o ângulo do jogador
 * D(right) Aumente o ângulo do jogador
 * 
 * Nota: Para direções para cima e para baixo, precisamos obter os valores 
 * sin e cos do ângulo do jogador para descobrir qual é o valor que precisamos 
 * aumentar/diminuir para as coordenadas do jogador. Se apenas incrementarmos 
 * as coordenadas sem verificar o ângulo, o jogador não irá para a posição de 
 * visualização em relação ao ângulo, indo sempre na mesma direção.
 */
document.addEventListener('keydown', (event) => {
	let keyCode = event.code;

	if(keyCode == data.key.up) {
		let playerCos = Math.cos(degreeToRadian(data.player.angle)) * data.player.speed.moviment;
		let playerSin = Math.sin(degreeToRadian(data.player.angle)) * data.player.speed.moviment;
		let newX = data.player.x += playerCos;
		let newY = data.player.y += playerSin;
		// Melhoria na detecção de colisão
		let checkX = Math.floor(newX + playerCos * data.player.radius);
		let checkY = Math.floor(newY + playerSin * data.player.radius);

		// Collision test (this not DDA algorithm, is simple test)
		if(data.map[checkY][Math.floor(data.player.x)] == 0) {
			data.player.y = newY;
		}
		if(data.map[Math.floor(data.player.y)][checkX] == 0) {
			data.player.x = newX;
		}

	} else if(keyCode == data.key.down) {
		let playerCos = Math.cos(degreeToRadian(data.player.angle)) * data.player.speed.moviment;
		let playerSin = Math.sin(degreeToRadian(data.player.angle)) * data.player.speed.moviment;
		let newX = data.player.x -= playerCos;
		let newY = data.player.y -= playerSin;
		// Melhoria na detecção de colisão
		let checkX = Math.floor(newX - playerCos * data.player.radius);
		let checkY = Math.floor(newY - playerSin * data.player.radius);

		// Collision test (this not DDA algorithm, is simple test)
		if(data.map[checkY][Math.floor(data.player.x)] == 0) {
			data.player.y = newY;
		}
		if(data.map[Math.floor(data.player.y)][checkX] == 0) {
			data.player.x = newX;
		}
/**
 * Para o movimento para a esquerda e para a direita, simplesmente aumentamos 
 * ou diminuímos o ângulo do jogador com a velocidade de rotação do jogador.
 */
	} else if(keyCode == data.key.left) {
		data.player.angle -= data.player.speed.rotation;
		data.player.angle %= 360;
	} else if(keyCode == data.key.right) {
		data.player.angle += data.player.speed.rotation;
		data.player.angle %= 360;
	}
});
