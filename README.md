# Raycasting
*Repositório de estudo do Tutorial de Raycasting!*

Este repositório acompanha o tutorial de raycasting disponível na página Wiki do [RayCastingTutorial](https://github.com/vinibiavatti1/RayCastingTutorial/wiki).\
O objetivo deste tutorial é fornecer uma introdução prática e detalhada ao conceito de raycasting,\
uma técnica fundamental em computação gráfica e jogos.

## Notas
- Para cada raio lançado temos que calcular a direção do mesmo para iterar as posições deste raio e encontrar alguma parede. A posição inicial do raio começa na posição do jogador e segue adiante em relação ao FOV (campo de visão) do jogador.

![](https://github.com/vinibiavatti1/RayCastingTutorial/raw/master/resources/Raycasting%20projection.png?raw%3Dtrue)

### RayCasting
- Para iniciar nossa lógica, precisamos conhecer alguns conceitos com: **player angle, player FOV e Screen width**.\
 - A primeira coisa que precisamos saber é que cada raio precisa ser lançado em relação ao ângulo do jogador e ao Campo\
de Visão (FOV). O FOV do jogador é 60º, mas o foco do jogador está no meio do FOV. Por isso temos que iniciar o\
RayCasting no -30º ângulo do jogador. Por exemplo, se o ângulo do jogador for 90º, temos que lançar os raios de 60º\
um ângulo para 120º outro. Confira a imagem abaixo para ver a representação do FOV do jogador.

![alt text](https://github.com/vinibiavatti1/RayCastingTutorial/raw/master/resources/FOV2.png?raw%3Dtrue)
- **As primeiras coordenadas do raio são as mesmas das coordenadas do jogador. Criaremos um objeto com esses valores\
para ficar mais organizado.**

- A altura da parede será usada para desenhar as listras. Esta etapa é dividida em três operações.
 - Desenhe o teto (do topo da tela até a meia altura da tela menos a altura da parede)
 - Desenhe a parede (da meia altura da tela menos a altura da parede até a meia altura da tela mais a altura da parede)
 - Desenhe o chão (da meia altura da tela mais a altura da parede até a parte inferior da tela)

Recomendo seguir esta imagem para criar a lógica:

![alt text](https://github.com/vinibiavatti1/RayCastingTutorial/raw/master/resources/stripes.png?raw%3Dtrue)