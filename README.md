# Christmas Pictionary | Draw and Guess at a Holiday Party

![Christmas Pictionary game preview](https://crazy3d.org/images/h/christmas_pictionary_screenshot.png)

**[Play Christmas Pictionary on Crazy3D](https://crazy3d.org/christmas-pictionary)** · [中文介绍](#中文介绍) · [Christmas Movie Emoji Quiz](https://crazy3d.org/christmas-movie-emoji)

**Christmas Pictionary** is a browser-based drawing and guessing game for a shared-screen holiday party. One player draws a secret Christmas word while their teammates call out guesses. The app supplies the canvas, a 60-second timer, editable word lists and team scores; the people playing decide whether a guess is correct.

Use a laptop or tablet as the drawing board, or connect the host device to a larger screen. It is a turn-taking group game, not a synchronized online multiplayer room.

## How to play

1. Open the [Crazy3D game page](https://crazy3d.org/christmas-pictionary). Start with the two default teams, rename them, and add teams if needed.
2. In Game Settings, choose the number of turns per team and review the word library. Add your own words or remove unwanted prompts.
3. Let the current artist privately reveal the secret word. Keep the display out of the guessers' view until the drawing starts.
4. Start the **60-second turn** and draw using the colored pen, eraser, Undo and Clear Board controls.
5. Teammates guess aloud. When they get it right, select the correct-guess control to award the team a point. Giving up or running out of time ends the turn without a point.
6. Continue through the scheduled turns, then compare the final standings and optionally save or share the result.

For a traditional drawing challenge, agree beforehand not to write the answer or say the word aloud. The app does not automatically enforce those house rules.

## Features

- **Shared-device team play:** enter team names, take turns drawing, and track each team's score.
- **Christmas word library:** characters, decorations, food, winter activities and holiday objects, with custom words saved in the current browser.
- **Editable rounds:** adjust the number of turns per team to fit the group and available time.
- **Digital canvas:** six pen colors, an eraser, stroke undo and a clear-board button, with mouse and touch input handlers.
- **Timed rounds:** a 60-second countdown and sound feedback, with a mute control.
- **Result sharing:** a final scoreboard image, browser-native sharing where supported, and link-sharing controls.
- **Embedded layout:** a compact header when the game runs inside an iframe.

Correct guesses are confirmed by the host or players. The current gameplay does **not** use AI to judge drawings, transcribe spoken answers or recognize guesses automatically.

## Party tips

Choose familiar words before the game starts, especially when children and adults play together. Start drawings with a large silhouette, then add the detail that makes a reindeer different from an ordinary animal. Rotate the artist so the same confident drawer does not take every turn.

A bigger display helps the audience see the canvas, but hide the secret-word reveal from them. Screen mirroring or video-call screen sharing is handled by your device or meeting app, not a built-in casting service. The game does not give remote participants their own synchronized drawing canvases.

## Frequently asked questions

### How many people can play?
People form teams around one host device. The lobby starts with two teams and allows more to be added; team size is a group choice, not a separate online player account.

### Can I make my own Christmas word list?
Yes. Game Settings supports adding, removing and resetting words. A playable list needs at least five words. Custom words are stored locally, not in a cloud account.

### Can I play on a phone?
The canvas includes touch input and responsive layout. A tablet or larger screen gives the artist and guessers more space. Exact behavior depends on the device and browser; rotate or resize before a turn rather than during a drawing.

### Does it save the entire match?
Custom word preferences are saved in the browser. Do not rely on refreshing or leaving the page to preserve an in-progress match.

### Is the interface bilingual?
The current game interface is English. The Chinese description below explains the same rules; it does not add an in-game language switch.

## Player page and embedded game

Use this **Crazy3D player page** when sharing the game:

https://crazy3d.org/christmas-pictionary

The game itself is hosted separately for iframe use:

`https://christmas-pictionary.crazy3d.org/`

Keep the player-page URL for recommendations and the subdomain for game loading. The preview image above remains an image-resource URL, not a game-page link.

## 中文介绍

**[在 Crazy3D 玩圣诞你画我猜](https://crazy3d.org/christmas-pictionary)**

这是一款适合同屏聚会的圣诞画画猜词游戏。大家分成队伍，轮到的画手查看秘密词语，在 60 秒内画出来，队友出声猜答案。游戏提供画板、计时和记分，是否猜对由现场玩家确认，并不是 AI 自动识画或语音识别。

### 玩法与特色

- 默认有两支队伍，可以改队名、添加队伍，并设置每队轮次。
- 词库包含圣诞人物、装饰、食物和冬日物品，可增删自定义词语；至少保留五个词才能开始。
- 画板提供六种颜色、橡皮擦、撤销和清空，支持鼠标及触控操作。
- 每轮 60 秒，猜对后由玩家点击确认得分；放弃或超时不得分。
- 最后显示队伍成绩，可保存结果图片或使用浏览器支持的分享功能。

建议先筛选大家熟悉的词，再轮换画手。投到大屏时不要让其他人提前看到秘密词语。多人围绕同一台设备玩即可，不需要把它理解成异地联机房间。自定义词库保存在当前浏览器；游戏界面目前是英文，中文说明不等于已有中文界面。

想换成文字竞猜，可以试试 **[圣诞电影 Emoji 猜谜](https://crazy3d.org/christmas-movie-emoji)**。

## Development

Built with **React 19, TypeScript 5.8 and Vite 6**, Tailwind utility styling, Lucide React icons, an HTML canvas, Web Audio and `html2canvas`.

```bash
git clone https://github.com/AshinTop/game_christmas_pictionary.git
cd game_christmas_pictionary
npm install
npm run dev
```

The Vite development server is configured for port 3000; use the address printed in the terminal.

```bash
npm run build
npm run preview
```

The production output is `dist/`.

- `components/GameLobby.tsx`: teams, settings and local custom-word storage.
- `components/Gameplay.tsx`: turn sequence, timer and player-confirmed outcomes.
- `components/CanvasBoard.tsx`: drawing, touch/mouse input and canvas tools.
- `constants.ts`: default Christmas words and team colors.
- `App.tsx`: app flow, score updates, result sharing and embedded layout.

A legacy Gemini service exists in the repository, but it is not part of the current human-judged drawing flow. Do not put private API keys into a public frontend build. Contributions can improve word choices, accessibility and device support without misrepresenting unimplemented online or AI features.

## Credits and licensing

Made with ❤️ and Christmas spirit for the holidays. Hosted for players by [Crazy3D](https://crazy3d.org/).

The previous README identified the project as MIT-licensed. A standalone `LICENSE` file is not present in the current repository; confirm the intended license with the maintainer before redistributing it. Third-party dependencies retain their own licenses.
