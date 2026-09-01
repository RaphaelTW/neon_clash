# NEON CLASH

Jogo de luta 2D para navegador, feito com HTML5 Canvas, CSS e JavaScript puro.

## Recursos

- 6 lutadores originais
- 3 arenas
- 1 jogador contra CPU
- 2 jogadores local
- Barra de vida
- Mana
- Stamina
- Barra de especial
- Defesa e quebra de guarda
- Dash com invulnerabilidade curta
- Soco e chute
- Poder à distância
- Especial exclusivo por personagem
- Combos
- Partículas e screen shake
- Melhor de 3 rounds
- Pausa, revanche e troca de personagens
- Layout responsivo

## Personagens

1. **Kael Ignis** — brawler / Supernova
2. **Nyx Vesper** — assassina / Eclipse
3. **Bront Titan** — tanque / Tremor Ômega
4. **Aiko Raijin** — caster / Tempestade Raijin
5. **Volt Rex** — rushdown / Overdrive
6. **Morvane** — drain / Pacto de Sangue

## Controles

### Player 1
- `A / D` — mover
- `W` — pular
- `S` — defender
- `J` — soco
- `K` — chute
- `L` — poder
- `U` — especial
- `I` — dash

### Player 2
- `← / →` — mover
- `↑` — pular
- `↓` — defender
- `1` — soco
- `2` — chute
- `3` — poder
- `4` — especial
- `5` — dash

## Como executar

Abra `index.html` diretamente no navegador.

Para desenvolvimento, também pode usar:

```bash
npx serve .
```

ou a extensão Live Server do VS Code.

## Estrutura

```text
neon_clash/
├─ index.html
├─ styles.css
├─ game.js
└─ README.md
```

## Observação

Todos os lutadores e efeitos visuais são desenhados proceduralmente pelo Canvas, sem dependência de sprites protegidos por direitos autorais.
