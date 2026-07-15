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
- **🤖 vs IA** — três níveis de dificuldade (Fácil, Médio, Difícil)

## Como jogar
1. Escolha um modo de jogo
2. Selecione seu time
3. **Clique e arraste** um botão para apontar e definir a força
4. **Solte** para lançar (direção oposta ao arraste, como um elástico)
5. Quem fizer **3 gols** primeiro vence!

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
│   ├── ai.ts             # IA 3 dificuldades
│   ├── sounds.ts         # Web Audio API
│   └── types.ts
└── data/teams.ts         # Times e jogadores
```
