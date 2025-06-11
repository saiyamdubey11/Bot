const mineflayer = require('mineflayer');
const { keepAlive } = require('./keep_alive');

const bot = mineflayer.createBot({
  host: 'keosmos.aternos.me',
  port: 59291,
  username: 'BotKeosmos',
  version: false,
});

let mining = false;
let goalPos = null;

bot.once('spawn', () => {
  bot.chat('Bot is online and ready!');
  startCircleMovement();
});

function startCircleMovement() {
  const radius = 5;
  let angle = 0;
  setInterval(() => {
    if (!mining) {
      angle += Math.PI / 8;
      const x = bot.entity.position.x + radius * Math.cos(angle);
      const z = bot.entity.position.z + radius * Math.sin(angle);
      const y = bot.entity.position.y;
      bot.lookAt({ x, y, z });
      bot.setControlState('forward', true);
      setTimeout(() => bot.setControlState('forward', false), 300);
    }
  }, 2000);
}

bot.on('chat', async (username, message) => {
  if (username === bot.username) return;

  if (message.startsWith('Go')) {
    const coords = message.match(/-?\d+/g);
    if (coords && coords.length === 3) {
      const [x, y, z] = coords.map(Number);
      goalPos = { x, y, z };
      mining = true;
      bot.chat(`Going to ${x}, ${y}, ${z}`);
      bot.pathfinder.setGoal(new mineflayer.pathfinder.goals.GoalBlock(x, y, z));
    }
  }
});

bot.on('goal_reached', () => {
  if (mining && goalPos) {
    bot.chat(`Reached ${goalPos.x}, ${goalPos.y}, ${goalPos.z}, starting to mine.`);
    mineDown(goalPos);
  }
});

function mineDown(pos) {
  const targetY = pos.y - 5;
  const interval = setInterval(() => {
    const below = bot.blockAt(bot.entity.position.offset(0, -1, 0));
    if (bot.entity.position.y <= targetY || !below || !bot.canDigBlock(below)) {
      clearInterval(interval);
      mining = false;
      bot.chat('Mining complete.');
      return;
    }
    bot.dig(below);
  }, 1500);
}

const { pathfinder, Movements, goals } = require('mineflayer-pathfinder');
bot.loadPlugin(pathfinder);
bot.once('spawn', () => {
  const defaultMove = new Movements(bot);
  bot.pathfinder.setMovements(defaultMove);
});

keepAlive();
