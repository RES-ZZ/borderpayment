const { getDataConnect, validateArgs } = require('firebase/data-connect');

const connectorConfig = {
  connector: 'default',
  service: 'my-hackathon-project',
  location: 'us-central1'
};
exports.connectorConfig = connectorConfig;

