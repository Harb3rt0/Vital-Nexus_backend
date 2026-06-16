const { Client } = require('@elastic/elasticsearch');

const elasticURL =
  process.env.ELASTIC_URL ||
  'http://server2.vitalnexus.local:9200';

const esClient = new Client({
  node: elasticURL,
  requestTimeout: 60000
});

const conectarElastic = async()=>{

  try{

    await esClient.ping();

    console.log(
      `Elasticsearch conectado: ${elasticURL}`
    );

  }catch(error){

    console.error(
      'Error conectando a Elasticsearch:',
      error.message
    );

  }

};

conectarElastic();

module.exports = esClient;
