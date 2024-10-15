module.exports = function (RED) {
  function NextLinkNode(config) {
    RED.nodes.createNode(this, config);
    const node = this;

    node.on('input', async (msg) => {
      let nextLink = msg[config.nextLink];

      /*  check Next Link*/

      if (nextLink) {
        node.log('NextLink Check for LayerOne SL');
      
        if (nextLink.includes('/b1s/v2/')) {
          msg.nextLink = nextLink.replace('/b1s/v2/', "").trim();
          node.log('NextLink Replace SL SetUp /b1s/v2/');
        } else if (nextLink.includes('/b1s/v1/')) {
          msg.nextLink = nextLink.replace('/b1s/v1/', "").trim();
          node.log('NextLink Replace SL SetUp /b1s/v1/');
        } else {
          node.log('NextLink OK for LayerOne');
        }
      }

      if (!nextLink) {
        node.send([null, msg]);
        return;
      }

      node.send([msg, null]);
    });
  }
  RED.nodes.registerType('nextLinkLayerOneSL', NextLinkNode, {});
};
