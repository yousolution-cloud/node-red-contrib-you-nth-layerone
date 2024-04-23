const reqEngine = require('../../utils/reqEngine');

module.exports = function(RED) {
    function document(config) {
        RED.nodes.createNode(this,config);
        let node = this;
        node.on('input', async function(msg) {
            try{
                let params = {
                    action : config.typeReq,
                    type : config.objdt,
                    header : msg.payload.obj_t.fields,
                    rows : msg.payload.obj_r.lines,
                    query_params : msg.payload.query_params,
                    completeObject : msg.payload
                }

                let result = await reqEngine.document(node, msg._LY1_Service, config.typeReq, params, config.fb);
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
    RED.nodes.registerType("document",document);
}
