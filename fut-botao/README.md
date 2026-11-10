# ⚽ Futebol de Botão Online

O clássico jogo de futebol de botão agora no navegador, com suporte a multiplayer online, local e contra a IA!

## Times disponíveis
- 🔴 Athletico Paranaense
- 🟢 Coritiba
- 🔴⚫ Flamengo
- 🔴⚫⚪ São Paulo
- 🔵⚫⚪ Grêmio
- ⚫⚪ Vasco da Gama

## Modos de jogo
- **🌐 Online** — crie uma sala, compartilhe o código com um amigo
- **👥 Local** — dois jogadores no mesmo dispositivo
- **🤖 vs IA** — quatro níveis de dificuldade (Fácil, Médio, Difícil, Lendário)

## Como jogar
1. Escolha um modo de jogo
2. Selecione seu time
3. **Clique e arraste** um botão para apontar e definir a força
4. **Solte** para lançar (direção oposta ao arraste, como um elástico)
5. Quem fizer **3 gols** primeiro vence!

## IA por simulação
A IA não chuta mais "no olho". A cada jogada ela:
1. gera centenas de lançamentos candidatos (chutes mirados, tabelas na parede, varredura radial para carambolas, bloqueios, armação de jogada, busca de power-ups);
2. **simula cada um com a física real do jogo** (incluindo bumpers, lama, aceleradores, portais e poderes);
3. pontua a posição resultante (gol, avanço da bola, perigo no próprio gol, linhas de chute, goleiro em casa, poderes coletados);
4. nos níveis Difícil e Lendário, refina os melhores com micro-variações de ângulo/força e **simula a resposta do adversário**, descartando jogadas que entregam gol.

O raciocínio roda em fatias de ~12 ms (gerador `aiDecisionSteps`), então a tela não trava; o campo mostra "🤖 analisando N jogadas", depois a mira e a intenção da IA ("🎯 Finalização", "🧱 Tabela", "🛡️ Fecha o gol"...).

| Nível | Simulações/jogada | Prevê a resposta | Erro de mira |
|---|---|---|---|
| 😊 Fácil | ~55 | não | alto, escolhe entre as 4 melhores |
| 😐 Médio | ~280 | não | pequeno |
| 😈 Difícil | ~350 | 4 melhores jogadas | mínimo |
| 👑 Lendário | ~750 | 8 melhores jogadas | zero |

## Mecânicas
- **⚡ Super Chute** — cada time tem uma barra que enche 25% por jogada (+30% ao sofrer gol). Cheia, clique em *Ativar Super Chute* ou aperte **Espaço** e lance: força ×1,6 e botão mais pesado.
- **🎯 Mira com previsão** — ao arrastar, pontos mostram o início da trajetória do botão (branco) e da bola (amarelo).
- **🎪 Arena Maluca** (modificador) — uma arena sorteada por partida: *Pinball* (bumpers), *Pista Turbo* (aceleradores + lama), *Portais*, *Caos Total*.
- **✨ Poderes** (modificador) — a cada 2 jogadas surge um power-up; o botão que encostar primeiro leva para o seu time: ⚡ Turbo (enche a barra), 🧊 Gelo (congela um adversário por uma jogada), 🐘 Gigante (botão maior e mais pesado por 4 jogadas), 🔁 Jogada Extra.
- **Gols especiais** — "Golaço de tabela", "Super gol" e "Gol contra" são reconhecidos; há câmera lenta quando a bola chega forte na boca do gol, rastro, partículas e tremida de tela.
- Arena Maluca e Poderes valem para Local e vs IA (no Online ficam desligados, pois dependem de sorteio local). O Super Chute funciona em todos os modos.

## Rodando localmente

```bash
npm install
npm run dev
```

Acesse `http://localhost:3000`

## Deploy no Vercel

1. Faça push do projeto para GitHub
2. Acesse [vercel.com](https://vercel.com) e importe o repositório
3. O Vercel detecta Next.js automaticamente — clique em Deploy

## Stack
- **Next.js 16** (App Router) + TypeScript
- **Canvas HTML5** — renderização e física 2D custom
- **Web Audio API** — sons gerados sem arquivos externos
- **Tailwind CSS** — interface

## Estrutura
```
src/
├── app/page.tsx          # Orquestrador de telas
├── components/
│   ├── GameCanvas.tsx    # Canvas + física + input
│   ├── GameHUD.tsx       # Placar
│   ├── TeamSelect.tsx    # Seleção de times
│   ├── RoomModal.tsx     # Sala online
│   └── VictoryScreen.tsx # Tela final
├── game/
│   ├── physics.ts        # Colisão, fricção, gol
│   ├── ai.ts             # IA por simulação (4 dificuldades)
│   ├── mechanics.ts      # Arenas, poderes, Super Chute, simulador
│   ├── sounds.ts         # Web Audio API
│   └── types.ts
└── data/teams.ts         # Times e jogadores
```
