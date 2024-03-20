const reqEngine = require('../../utils/reqEngine');

module.exports = function(RED) {
    function query(config) {
        RED.nodes.createNode(this,config);
        var node = this;
        node.on('input', async function(msg) {

            const globalContext = node.context().global;

            if(!config){ //(node.sett === undefined || node.sett === null)
                node.status({ fill: 'red', shape: 'dot', text: 'Error Generic' });
                node.error('ERROR Generic', msg);
            }
            else  {
                try {
                    let otherDB = false;
                    if(config.otherDB !== undefined || config.otherDB !== null) {
                        otherDB = parseInt(config.otherDB) > 0;
                    }

                    let query = config.query;
                    if(otherDB) {
                        let dbName = config.dbName;
                        if (config.dbNameType === 'msg') {
                            dbName = msg[node.dbName];
                        }
                        if(!dbName) {
                            node.status({ fill: 'red', shape: 'dot', text: 'Error, not set DB!' });
                            node.error('Do You not set a new DB name for execution this query!', msg);
                        }
                        globalContext.set(`_LY1_${msg._LY1_Service.idAuth}.comp`, dbName.trim());
                    }
                    if (config.queryType === 'msg') {
                        query = msg[config.query];
                    }

                    try{
                        const result = await reqEngine.query(node, msg._LY1_Service, config.typeReq,query );
                        node.status({ fill: 'grey', shape: 'dot', text: 'Requesting...' });
                        msg.payload = result.data;
                        if(msg.payload.success === false) {
                            node.status({ fill: 'red', shape: 'dot', text:`Error: ${msg.payload.reason}` });
                            node.error(msg.payload.reason, msg);
                            node.send(msg);
                        }
                        else {
                            msg.payload = msg.payload.result_set;
                            node.send(msg);
                            node.status({ fill: 'green', shape: 'dot', text: 'Success' });
                        }
                    }
                    catch (e) {
                        node.error(e, msg);
                        node.status({ fill: 'red', shape: 'dot', text: 'Error Generic' });
                    }
                }  catch (e) {
                    node.error(e, msg);
                    node.status({ fill: 'red', shape: 'dot', text: 'Error Generic' });
                }

            }

            //node.status({ fill: 'red', shape: 'ring', text: 'Missing credentials' });
            //node.send(msg);
        });
    }
    RED.nodes.registerType("query",query);
}
