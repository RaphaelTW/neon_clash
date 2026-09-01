# Changelog

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
