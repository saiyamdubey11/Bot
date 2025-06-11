const express = require('express');
function keepAlive() {
  const app = express();
  app.get('/', (req, res) => res.send('Bot is alive!'));
  app.listen(3000, () => console.log('KeepAlive server started'));
}
module.exports = { keepAlive };
