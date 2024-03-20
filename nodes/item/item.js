const reqEngine = require('../../utils/reqEngine');

module.exports = function (RED) {
    function item(config) {
        RED.nodes.createNode(this, config);
        let node = this;
        node.on('input', async function (msg) {
            try {
                node.status({ fill: 'grey', shape: 'dot', text: 'Requesting...' });
                let result = await reqEngine.item(node, msg._LY1_Service, config.typeReq, msg.payload);
                msg.payload = result;
                if (!result.success) {
                    node.status({ fill: 'red', shape: 'dot', text: `Error: Not Valid Request` });
                    node.send(msg);
                }
                else {
                    node.send(msg);
                    node.status({ fill: 'green', shape: 'dot', text: 'Success' });
                }
            }
            catch (e) {
                node.error(e, msg);
                node.status({ fill: 'red', shape: 'dot', text: 'Error Generic' });
            }
        });
    }
    RED.nodes.registerType("item", item);
}
