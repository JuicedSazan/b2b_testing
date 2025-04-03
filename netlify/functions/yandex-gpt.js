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
  const IAM_TOKEN = "t1.9euelZrPi5eNj86Jz5uSjpKemZPNm-3rnpWazc6Yj8_IipeQzpiQjpHLk8rl8_cBFEdA-e8IKWZT_d3z90FCRED57wgpZlP9zef1656VmsqSkJmdzZiOy42PmcyRicjP7_zF656VmsqSkJmdzZiOy42PmcyRicjP.ZztwRQzXjxeb21ca841oim_DYu8eKXnogRPrApClyv_uiyBl_6JkoacPU76sIfqxJvZEcOVr9U28tJjv7pl_AA";

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
          maxTokens: 3000
        },
        messages: [
          {
            role: 'system',
            text: 'Ты помощник для поиска товаров. Формируй ответ в строгом JSON-формате:
                {
                    "keywords": {
                        "main": [],
                        "additional": [],
                        "combinations": []
                    },
                    "criteria": [{"name": "", "value": ""}],
                    "platforms": [{
                        "name": "",
                        "searchQuery": "",
                        "filters": [{"name": "", "value": ""}]
                    }]
                }
                Площадки: [{"alibaba.com", "1688.com", "en.yiwugo.com"}]. Будь конкретным.'
          },
          {
            role: 'user',
            text: `Ты видишь перед собой запрос: "${query}. Сгенерируй: 
                1) Ключевые слова (основные, дополнительные, комбинации) 
                2) Критерии поиска 
                3) Фильтры для указанных площадок`
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