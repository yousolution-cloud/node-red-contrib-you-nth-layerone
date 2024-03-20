process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const Support = require('./support');

module.exports = function (RED) {
  function AuthenticateSapNode(config) {
    RED.nodes.createNode(this, config);
    const node = this;

    // reset status
    node.status({});

    const globalContext = node.context().global;

    globalContext.set(`_YOU_LY1_${node.id}`, {
      host: config.host,
      port: config.port,
      protocol: config.typeReq,
      credentials: {
        CompanyDB: node.credentials.company,
        UserName: node.credentials.user,
        Password: node.credentials.password,
      },
    });

    if (!node.credentials.user || !node.credentials.password || !node.credentials.company) {
      node.status({ fill: 'gray', shape: 'ring', text: 'Missing credentials' });
    }

    node.on('input', async (msg, send, done) => {
      // If Company setted from msg
      if (node.credentials.companyType == 'msg') {
        const company = msg[node.credentials.company];
        globalContext.set(`_YOU_LY1_${node.id}.credentials.CompanyDB`, company);
      }

      // If User setted from msg
      if (node.credentials.userType == 'msg') {
        const user = msg[node.credentials.user];
        globalContext.set(`_YOU_LY1_${node.id}.credentials.UserName`, user);
      }

      // reset status
      node.status({});

      if (!node.credentials.user || !node.credentials.password || !node.credentials.company) {
        node.status({ fill: 'red', shape: 'dot', text: 'Missing credentials' });
        done(new Error('Missing credentials'));
        return;
      }
      let currentDate = new Date();
      const headers = globalContext.get(`_YOU_LY1_${node.id}.headers`);
      const exipiredTime = globalContext.get(`_YOU_LY1_${node.id}.exp`);
      let validToken = true;
      msg._YOU_LY1_ = {
        idAuth: node.id,
      };

      if(headers && exipiredTime) {
        let providedDate = new Date(exipiredTime);
        let timeDifference = currentDate - providedDate;
        let minutesDifference = timeDifference / (1000 * 60);
        validToken = minutesDifference > 25 ? false : true;
      }

      if (!headers || !validToken) {
        try {
          const result = await Support.login(node, node.id);
          if(result.data.hasOwnProperty("error")) {
            node.error( result.data.error , msg);
            node.status({ fill: 'red', shape: 'dot', text: 'disconnected' });
          }
          else {
            globalContext.set(`_YOU_LY1_${node.id}.headers`, result.headers['set-cookie']);
            globalContext.set(`_YOU_LY1_${node.id}.exp`, currentDate.toISOString());
            node.send(msg);
            node.status({ fill: 'green', shape: 'dot', text: 'connected' });
          }
          
        } catch (error) {
          msg.payload = error;
          if (error.response && error.response.data) {
            msg.statusCode = error.response.status;
            msg.payload = error.response.data;
          }
          node.error( error , msg);
          node.status({ fill: 'red', shape: 'dot', text: 'disconnected' });
          done(error);
        }
      }else {
        node.status({ fill: 'green', shape: 'dot', text: 'connected' });
        node.send(msg);
      }

    });
  }
  RED.nodes.registerType('authenticateLayerOneSL', AuthenticateSapNode, {
    credentials: {
      company: { type: 'text' },
      companyType: { type: 'text' },
      user: { type: 'text' },
      userType: { type: 'text' },
      password: { type: 'password' },
      typeReq : { type: 'text'}
    },
  });
};
