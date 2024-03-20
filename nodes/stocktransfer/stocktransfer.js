const reqEngine = require('../../utils/reqEngine');

module.exports = function(RED) {
    function stock_transfer(config) {
        RED.nodes.createNode(this , config);
        let node = this;
        node.on('input', async function(msg) {
            try{
                
                let result = await reqEngine.stock_transfer( node, msg._LY1_Service, msg.payload, config.isRequest);
                node.status({ fill: 'grey', shape: 'dot', text: 'Requesting...' });
                msg.payload = result.data;
                if(msg.payload.success === false) {
                    node.status({ fill: 'red', shape: 'dot', text:`Error: ${msg.payload.reason}` });
                    node.error(msg.payload.reason, msg);
                    node.send(msg);
                }
                else {
                    msg.payload = 'Operation completed successfully';
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
    RED.nodes.registerType("stockTransfer",stock_transfer);
}
