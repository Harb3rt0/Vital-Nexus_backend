const { Client } = require('@elastic/elasticsearch');

const esClient = new Client({
  node: process.env.ELASTIC_URL
});

(async () => {
  try {
    await esClient.ping();
    console.log('Conectado a Elasticsearch');
  } catch (error) {
    console.error('Error conectando a Elasticsearch:', error.message);
  }
})();

module.exports = esClient;
