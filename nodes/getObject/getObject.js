const reqEngine = require('../../utils/reqEngine');

module.exports = function(RED) {
    function getObject(config) {
        RED.nodes.createNode(this,config);
        let node = this;
        node.on('input', async function(msg) {
            try{
                
                let entry;
                if (config.typeEntryKey === 'msg') {

                    entry = msg[config.entryKey];

                }
                else  {
                    entry = config.entryKey;
                }

                let result = await reqEngine.getByKey(node, msg._LY1_Service, config.typeGettingObject, entry);
                node.status({ fill: 'grey', shape: 'dot', text: 'Requesting...' });
                msg.payload = result;
                if(!msg.payload) {
                    node.status({ fill: 'red', shape: 'dot', text:`Error: Getting Object` });
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
    RED.nodes.registerType("getObject",getObject);
}
