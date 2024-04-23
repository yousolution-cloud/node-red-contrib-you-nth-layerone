
const reqEngine = require('../../utils/reqEngine');

module.exports = function (RED) {
    function authenticate(config) {
        RED.nodes.createNode(this, config);
        let  node = this;

        const globalContext = node.context().global;
        globalContext.set(`_LY1_${node.id}`, {
            user: node.credentials.user,
            pass : node.credentials.password,
            prot: config.protocol,
            comp : node.credentials.company,
            host : config.host
        });
        if(!node.credentials.user || !node.credentials.password || !node.credentials.company) {
            node.status({ fill: 'red', shape: 'ring', text: 'Missing credentials' });
        }
        node.on('input', async  function (msg, send, done) {
            // If Company setted from msg
            if (node.credentials.companyType == 'msg') {
                const company = msg[node.comp];
                globalContext.set(`_LY1_${node.id}.comp`, company);
            }
            // If User setted from msg
            if (node.credentials.userType == 'msg') {
                const user = msg[node.user];
                globalContext.set(`_LY1_${node.id}.user`, user);
            }
            // If Pass setted from msg
            if (node.credentials.passType == 'msg') {
                const pass = msg[node.pass];
                globalContext.set(`_LY1_${node.id}.pass`, pass);
            }
            // reset status
            node.status({});

            if (!node.credentials.user || !node.credentials.password || !node.credentials.company) {
                node.status({ fill: 'red', shape: 'dot', text: 'Missing credentials' });
                done(new Error('Missing credentials'));
                return;
            }

            const headers = globalContext.get(`_LY1_${node.id}.headers`);

            msg._LY1_Service = {
                idAuth: node.id,
            };

            //console.log(config);
            if (!headers) {
                try {
                    
                    const result = await reqEngine.login(node,  { id : node.id});
                    node.status({ fill: 'grey', shape: 'dot', text: 'Requesting...' });
                    //console.log(result);
                    globalContext.set(`_LY1_${node.id}.headers`, result.headers['set-cookie']);
                    msg.payload = result.data;

                    if(msg.payload.success === false) {
                        node.status({ fill: 'red', shape: 'dot', text:`Error: ${msg.payload.reason}` });
                        node.error(msg.payload.reason, msg);
                        node.send(msg);
                    }
                    else {
                        globalContext.set(`_LY1_${node.id}.session_id`, msg.payload.session_id);
                        node.send(msg);
                        node.status({ fill: 'green', shape: 'dot', text: 'connected' });
                    }

                } catch (error) {
                    msg.payload = error;
                    if (error.response && error.response.data) {
                        msg.statusCode = error.response.status;
                        msg.payload = error.response.data;
                    }
                    node.error('Error On Requesting Login', msg);
                    node.send(msg);
                    node.status({ fill: 'red', shape: 'dot', text: 'disconnected' });
                    done(error);
                    return;
                }
            }
        });
    }

    RED.nodes.registerType('authenticate', authenticate, {
        credentials: {
            company: { type: 'text' },
            companyType: { type: 'text' },
            user: { type: 'text' },
            userType: { type: 'text' },
            password: { type: 'password' },
            passType : { type : 'password'},
            protocol : { type : 'text'},
            protType : {type : 'text'}

        },
    });
}
