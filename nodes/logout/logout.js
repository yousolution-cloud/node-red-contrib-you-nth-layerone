
const reqEngine = require('../../utils/reqEngine');

module.exports = function(RED) {
    function logout(config) {
        RED.nodes.createNode(this,config);
        let node = this;

        node.on('input', async function(msg) {

            if(!msg._LY1_Service.idAuth) {
                node.status({ fill: 'red', shape: 'dot', text: 'Error, not get Auth rif!' });
                node.error('Not Found a Auth, Do you effet the login?', msg);

            }
            else {
                try{
                    await reqEngine.logout(node, msg._LY1_Service);
                    node.status({ fill: 'grey', shape: 'ring', text: 'Requesting....' });

                    const globalContext = node.context().global;
                    globalContext.set(`_LY1_${msg._LY1_Service.idAuth}.headers`, undefined);
                    globalContext.set(`_LY1_${msg._LY1_Service.idAuth}.session_id`, undefined);
                    node.send(msg);
                    node.status({ fill: 'green', shape: 'ring', text: 'Success' });
                }
                catch (e) {
                    node.error(e, msg);
                    node.status({ fill: 'red', shape: 'dot', text: 'Error Generic' });
                }
            }

        });
    }
    RED.nodes.registerType("logout", logout);
}
