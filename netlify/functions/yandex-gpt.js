const fetch = require('node-fetch').default;

exports.handler = async (event) => {
  // Проверка метода запроса
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Only POST requests allowed' })
    };
  }

  // Ваши актуальные данные (подставлены)
  const FOLDER_ID = "b1g7e9s4l4399vlbig8g";
  const IAM_TOKEN = "t1.9euelZqMm4qTlciQkZGOjpWek8aQme3rnpWazc6Yj8_IipeQzpiQjpHLk8rl8_c7MklA-e8vYjoe_d3z93tgRkD57y9iOh79zef1656VmpaQnYqazpKPj82Wl5aSm5HO7_zF656VmpaQnYqazpKPj82Wl5aSm5HO.4GYtiQPaDuCvOy7he3haxIi7L0Vi5bxtlr0eVuDLX6vgRGAOG9ttEiI4ntBuV8uMR8udZzVjvunTiJF9R3AWCg";

  try {
    // Парсим тело запроса
    const { query } = JSON.parse(event.body);
    if (!query) throw new Error('Missing "query" parameter');

    // Запрос к YandexGPT
    const response = await fetch('https://llm.api.cloud.yandex.net/foundationModels/v1/completion', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${IAM_TOKEN}`,
        'x-folder-id': FOLDER_ID,
      },
      body: JSON.stringify({
        modelUri: `gpt://${FOLDER_ID}/yandexgpt-lite`,
        completionOptions: {
          stream: false,
          temperature: 0.6,
          maxTokens: 2000
        },
        messages: [
          {
            role: 'system',
            text: 'Представь, что ты - аналитик. Твоя задача - матчинг товаров.'
          },
          {
            role: 'user',
            text: `Ты видишь перед собой запрос: "${query}. Пожалуйста, опиши: 1. Ключевые слова для поиска на русском, английском и китайском языках. 2. Как искать этот товар на Alibaba, 1688 и Yuwigo, включая использование фильтров. 3. Как проверить, что найденный товар соответствует запросу?"`
          }
        ]
      }),
      timeout: 10000 // 10 секунд таймаут
    });

    // Обработка ответа
    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`YandexGPT API error: ${response.status} - ${errorData}`);
    }

    const data = await response.json();
    const resultText = data.result?.alternatives?.[0]?.message?.text || "Нет данных в ответе";

    return {
      statusCode: 200,
      body: JSON.stringify({ response: resultText })
    };

  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Internal Server Error',
        details: error.message 
      })
    };
  }
};