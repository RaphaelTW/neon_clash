# Changelog

## v3.2.0 — Mobile & PWA

- adiciona controles touchscreen completos para movimento, defesa, golpes, dash, poderes e especiais
- preserva o buffer de comandos no direcional touch
- adiciona controles clicáveis opcionais para mouse no desktop
- otimiza o HUD para celulares em orientação horizontal e áreas seguras de notch
- adiciona aviso de rotação durante lutas em modo retrato
- seleciona qualidade inicial conforme memória, processador, tipo de ponteiro e preferência por movimento reduzido
- reduz automaticamente partículas, afterimages, sombras e taxa visual em dispositivos lentos
- adiciona manifest, service worker, cache offline e ícones PWA dedicados

## v3.1.0 — Elemental Arenas

### Combate e efeitos
- adiciona identidade elemental própria para poderes, especiais e finalizações dos oito lutadores
- diferencia visualmente fogo, vazio, terra, raio, eletricidade cinética, energia psíquica, gelo e magia hexagonal
- adiciona partículas com formas, movimento, brilho e auras específicos por personagem
- redesenha projéteis para comunicar melhor o tipo e a origem de cada ataque

### Arenas
- adiciona Santuário Abissal
- adiciona Torre da Tempestade
- adiciona Ruínas de Gaia
- adiciona Metrô Fantasma
- adiciona Cidadela Psíquica
- expande a seleção e a rotação procedural de três para oito arenas

### Identidade
- adiciona favicon próprio ao jogo
- atualiza o README com o novo logo oficial

## v3.0.0 — Pixel Arcade Edition

### Interface
- nova tela inicial pixel-art com `PRESS START`
- novo logo pixel-art animado
- novo cenário pixel-art de abertura
- novo menu principal estilo arcade
- navegação de menu por teclado e gamepad
- tela Como Jogar
- tela de Opções
- suporte a tela cheia

### Modos
- adiciona Modo Arena com rota de 8 lutas
- adiciona mirror match como oitavo desafio
- adiciona tela `GAME CLEAR`
- adiciona Modo Treino com DUMMY MK-I
- adiciona reset de treino com `R`
- mantém Versus 1P vs CPU
- mantém Versus 2P local
- adiciona Survival
- adiciona recorde de Survival via localStorage
- aumenta progressivamente a IA no Arena e Survival

### Lutadores
- elenco aumentado de 6 para 8 lutadores
- adiciona Orion Frost
- adiciona Sable Hex
- adiciona DUMMY MK-I para treino
- Orion recebe ataques de gelo e congelamento
- Sable recebe projéteis hexagonais e drenagem de mana
- total de 90 spritesheets de personagens/dummy

### Configurações
- áudio on/off
- volume geral
- screen shake on/off
- câmera dinâmica on/off
- hitbox debug persistente
- dificuldade padrão persistente
- configurações salvas via localStorage

### Gamepad
- navegação de menu com controle
- PRESS START por controle
- suporte a Xbox/PlayStation mantido no combate
- status do gamepad exibido no menu

### Inicialização
- `START_GAME.bat` atualizado para iniciar servidor localhost
- adiciona `START_GAME.ps1`
- fallback para Python, Node/NPX ou abertura direta

## v2.2.0 — Combat Core

- hurtboxes independentes
- pushboxes
- attack boxes por golpe
- startup / active frames / recovery
- hit-stop
- recoil de parede
- câmera dinâmica
- animação `fall`
- debug de colisões

## v2.0.0 — Arcade Evolution

- seis lutadores originais
- especiais
- finalizações
- gamepad
- três arenas
- IA
- spritesheets
