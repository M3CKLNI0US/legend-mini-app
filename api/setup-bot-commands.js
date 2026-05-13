/**
 * Установка команд Telegram бота
 * Запустить один раз: node api/setup-bot-commands.js
 */

import https from 'https';

const BOT_TOKEN = '8425892844:AAH77_x1DLrlOGF2IIoqRyMFaOHADotlpKo';

const BOT_COMMANDS = [
  {
    command: 'start',
    description: '🚀 Запустить приложение'
  },
  {
    command: 'profile',
    description: '👤 Мой профиль'
  },
  {
    command: 'booking',
    description: '📅 Бронирования'
  },
  {
    command: 'referral',
    description: '🎁 Реферальная программа'
  },
  {
    command: 'settings',
    description: '⚙️ Настройки'
  },
  {
    command: 'help',
    description: '❓ Справка'
  },
  {
    command: 'admin',
    description: '🔑 Админ-панель (только для администраторов)'
  }
];

async function setBotCommands() {
  const payload = JSON.stringify({
    commands: BOT_COMMANDS
  });

  const options = {
    hostname: 'api.telegram.org',
    port: 443,
    path: `/bot${BOT_TOKEN}/setMyCommands`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload)
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(data);

          if (response.ok) {
            console.log('✅ Команды бота успешно установлены:');
            BOT_COMMANDS.forEach(cmd => {
              console.log(`  /${cmd.command} - ${cmd.description}`);
            });
            resolve(response);
          } else {
            console.error('❌ Ошибка при установке команд:', response.description);
            reject(new Error(response.description));
          }
        } catch (error) {
          console.error('❌ Ошибка парсинга ответа:', error.message);
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Ошибка запроса:', error.message);
      reject(error);
    });

    req.write(payload);
    req.end();
  });
}

// Запустить установку
setBotCommands()
  .then(() => {
    console.log('\n✨ Готово! Команды доступны в меню бота.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Ошибка:', error.message);
    process.exit(1);
  });
