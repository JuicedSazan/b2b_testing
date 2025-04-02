const fetch = require("node-fetch");

exports.handler = async (event) => {
  const { query } = JSON.parse(event.body);

  const folderId = "b1g7e9s4l4399vlbig8g";
  const iamToken = "t1.9euelZrOk86YzsuUlZrLls7ImZqPlu3rnpWazc6Yj8_IipeQzpiQjpHLk8rl8_dfK0pA-e88VSUk_t3z9x9aR0D57zxVJST-zef1656VmpGbypHGzI3GzZualpXOnYnP7_zF656VmpGbypHGzI3GzZualpXOnYnP.V0vmIQo_O71w0h0Jd7S6BwYTRLPEAi4Mex35tvaEAQj9OHmFWTS2zXnKTIUUyYYKNZ3XPQSW5-8g2e8kYJE3Cg"; 
  const apiUrl = "https://llm.api.cloud.yandex.net/foundationModels/v1/completion";

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${iamToken}`,
        "x-folder-id": folderId,
      },
      body: JSON.stringify({
        modelUri: `gpt://${folderId}/yandexgpt-lite`,
        completionOptions: {
          stream: false,
          temperature: 0.6,
          maxTokens: 2000,
        },
        messages: [
          {
            role: "system",
            text: "Ты — помощник по поиску товаров. Дай подсказку для поиска на Alibaba, 1688 и YiwuGo.",
          },
          {
            role: "user",
            text: `Дай подсказку для поиска товара: "${query}". Укажи ключевые слова на русском, английском и китайском.`,
          },
        ],
      }),
    });

    const data = await response.json();
    return {
      statusCode: 200,
      body: JSON.stringify(data.result?.alternatives[0]?.message?.text || "Ошибка"),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify("Ошибка сервера"),
    };
  }
};