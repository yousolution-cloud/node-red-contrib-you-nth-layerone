const reqEngine = require('../../utils/reqEngine');

module.exports = function(RED) {
    function company(config) {
        RED.nodes.createNode(this,config);
        let node = this;
        node.on('input', async function(msg) {
            try{
                let result = await reqEngine.company(node, msg._LY1_Service);
                node.status({ fill: 'grey', shape: 'dot', text: 'Requesting...' });
                msg.payload = result.data;
                if(!msg.payload.data) {
                    node.status({ fill: 'red', shape: 'dot', text:`Error: File Company` });
                    node.error('File Company on This Instance of LayerOne it\'s not correctly configured');
                    node.send(msg);
                }
                else {
                    msg.payload = msg.payload.data;
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
    RED.nodes.registerType("company",company);
}
