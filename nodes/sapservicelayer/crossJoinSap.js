process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const axios = require('axios');
const Support = require('./support');
const { VerifyErrorLayerOneSL } = require('../../utils/manageErrorLayerOneSL');

module.exports = function (RED) {
  function CrossJoinSapNode(config) {
    RED.nodes.createNode(this, config);
    const node = this;

    // reset status
    node.status({});

    node.on('input', async (msg, send, done) => {
      // reset status
      node.status({});

      try {
        const options = { method: 'GET', hasRawQuery: true, hasEntityId: false, isCrossJoin: true };
        const login = Support.login;
        const result = await Support.sendRequest({ node, msg, config, axios, login, options });
        msg.payload = VerifyErrorLayerOneSL(result.data);
        msg.statusCode = result.status;
        msg.nextLink = result.data['odata.nextLink'] || result.data['@odata.nextLink'];
        if(msg.payload) {
          node.status({ fill: 'green', shape: 'dot', text: 'success' });
          node.send(msg);
        }
      } catch (error) {
        node.status({ fill: 'red', shape: 'dot', text: 'Error' });
        done(error);
      }
    });
  }
  RED.nodes.registerType('crossJoinLayerOneSL', CrossJoinSapNode, {});
};
