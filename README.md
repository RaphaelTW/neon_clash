# NEON CLASH v2

**NEON CLASH** é um jogo de luta 2D arcade para navegador, desenvolvido em HTML5 Canvas, CSS e JavaScript puro.

Não utiliza personagens, sprites ou propriedades intelectuais de jogos comerciais. Os seis lutadores e todos os sprites do projeto são originais.

## O que existe nesta versão

- Tela de abertura estilo arcade
- Seleção cinematográfica de personagem
- 6 lutadores com visual próprio
- 54 spritesheets PNG
- 9 animações por lutador
  - idle
  - walk
  - jump
  - punch
  - kick
  - hurt
  - KO
  - special
  - finisher
- 3 arenas
- 1P vs CPU
- 2P local
- IA Fácil / Normal / Difícil
- Melhor de 3 ou melhor de 5
- Vida
- Mana
- Stamina
- Barra de especial
- Defesa e Guard Break
- Pulo
- Dash com pequena janela de invulnerabilidade
- Soco
- Chute
- Poder
- Golpe especial de comando
- Super especial
- Combos
- Projéteis
- Roubo de vida para Morvane
- Teleporte para Nyx
- Raios verticais para Aiko
- Screen shake
- Partículas
- Afterimages
- Efeitos de impacto
- SFX sintetizados pelo Web Audio API
- Pausa
- Revanche
- Sistema de finalização `FINALIZE!`
- Finalização própria de cada personagem
- Suporte a controles Xbox e PlayStation via Gamepad API

## Lutadores

| Lutador | Arquétipo | Especial | Finalização |
|---|---|---|---|
| Kael Ignis | Brawler | Supernova | Sol Absoluto |
| Nyx Vesper | Assassin | Eclipse | Zero Lunar |
| Bront Titan | Tank | Tremor Ômega | Núcleo de Titã |
| Aiko Raijin | Caster | Tempestade Raijin | Deusa do Trovão |
| Volt Rex | Rushdown | Overdrive | Velocidade Terminal |
| Morvane | Drain | Pacto de Sangue | Trono Carmesim |

## Teclado

### Player 1

| Ação | Tecla |
|---|---|
| Mover | A / D |
| Pular | W |
| Defender | S |
| Soco | J |
| Chute | K |
| Poder | L |
| Especial | U |
| Dash | I |

### Player 2

| Ação | Tecla |
|---|---|
| Mover | ← / → |
| Pular | ↑ |
| Defender | ↓ |
| Soco | 1 |
| Chute | 2 |
| Poder | 3 |
| Especial | 4 |
| Dash | 5 |

## Comandos de luta

O motor possui um buffer de comandos.

### Quarter Circle Forward

```text
↓ → + SOCO
```

O sentido de `→` é relativo à direção para a qual o lutador está olhando.

Cada personagem executa um golpe diferente:

- Kael: **Onda Solar**
- Nyx: **Corte Fantasma**
- Bront: **Onda Sísmica**
- Aiko: **Arco Elétrico**
- Volt: **Ruptura Cinética**
- Morvane: **Orbe Hemático**

## Gamepad

Mapeamento padrão:

| Ação | Xbox | PlayStation |
|---|---|---|
| Soco | A | X |
| Chute | B | ○ |
| Poder | X | □ |
| Especial / Finalização | Y | △ |
| Defesa | LB | L1 |
| Dash | RB | R1 |
| Movimento | D-Pad / Analógico | D-Pad / Analógico |
| Pular | ↑ | ↑ |
| Pausa | Menu | Options |

Dois controles conectados podem ser usados no modo 2P Local.

## Finalizações

No round que pode decidir a partida, reduzir o adversário a zero ativa:

```text
FINALIZE!
```

O vencedor recebe alguns segundos para pressionar o botão de **Especial**.

Cada personagem possui uma animação e um nome de finalização próprios.

## Executar

A forma mais simples é abrir:

```text
index.html
```

Também pode utilizar um servidor local:

```bash
python -m http.server 8080
```

Depois acesse `http://localhost:8080`.

## Estrutura

```text
neon_clash_v2/
├── index.html
├── styles.css
├── game.js
├── README.md
├── LICENSE
├── START_GAME.bat
└── assets/
    ├── fighters.json
    ├── ui/
    │   └── emblem.png
    └── fighters/
        ├── kael/
        ├── nyx/
        ├── bront/
        ├── aiko/
        ├── volt/
        └── morvane/
```

Cada pasta de personagem contém nove spritesheets PNG.

## Tecnologia

- HTML5
- Canvas 2D
- CSS3
- JavaScript ES6+
- Web Audio API
- Gamepad API

Nenhum framework ou instalação de dependência é necessária.

## Licença

MIT.
