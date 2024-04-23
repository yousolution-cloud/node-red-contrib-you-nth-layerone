const axios = require("axios");
const convert = require('xml-js');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const ENPOINT_URL = {
    user_login_service: "user_login_service",
    logout_service: "logout_service",
    DI_query_service_r: "query_service_r",
    DI_query_service_w: "query_service_w",
    ADO_query_service_r: "query_service_r_sql",
    ADO_query_service_w: "query_service_w_sql",
    company_service: "company_service",
    companyinfo_service: "companyinfo_service",
    admininfo_service: "admininfo_service",
    document_service: "document_service",
    updateobject_service: "updateobject_service",
    bp_service: "bp_service",
    item_service : "item_service",
    raw_data: "raw_data",
    sbo_object_template: "sbo_object_template",
    pick_service : 'pick_service',
    stocktransfer_service : 'stocktransfer_service',
    inventorytransferrequest_service : 'inventorytransferrequest_service'
}

const TYPE_QUERY = {
    DI_WRITE: "DI_WRITE",
    DI_READ: "DI_READ",
    ADO_WRITE: "ADO_WRITE",
    ADO_READ: "ADO_READ"
}

const TYPE_DOCUMENT_ACTION = {
    ADD: "ADD",
    UPDATE: "UPDATE",
    CLOSE: "CLOSE",
    CANCEL: "CANCEL"
}

const TYPE_MASTERDATA_ACTION = {
    ADD: "ADD",
    UPDATE: "UPDATE",
    REMOVE: "REMOVE",
}


const TYPE_DOCUMENT = {
    Quotations: "Quotations",
    Orders: "Orders",
    DeliveryNotes: "DeliveryNotes",
    Returns: "Returns",
    Invoices: "Invoices",
    CreditNotes: "CreditNotes",
    PurchaseOrders: "PurchaseOrders",
    PurchaseDeliveryNotes: "PurchaseDeliveryNotes",
    PurchaseReturns: "PurchaseReturns",
    PurchaseInvoices: "PurchaseInvoices",
    PurchaseCreditNotes: "PurchaseCreditNotes",
    Draft: "Draft"
}

const GET_BY_KEY_OBJECT_DATA = {
    bussinesPartner: {
        nameSdkObject: 'oBusinessPartners',
        key: "CardCode",
        isDocument: false,
    },
    item: {
        nameSdkObject: 'oItems',
        key: "ItemCode",
        isDocument: false,
    },
    Quotations: {
        nameSdkObject: 'oQuotations',
        key: "DocEntry",
        isDocument: true
    },
    Orders: {
        nameSdkObject: 'oOrders',
        key: "DocEntry",
        isDocument: true
    },
    DeliveryNotes: {
        nameSdkObject: 'oDeliveryNotes',
        key: "DocEntry",
        isDocument: true
    },
    Returns: {
        nameSdkObject: 'oReturns',
        key: "DocEntry",
        isDocument: true
    },
    Invoices: {
        nameSdkObject: 'oInvoices',
        key: "DocEntry",
        isDocument: true
    },
    CreditNotes: {
        nameSdkObject: 'oCreditNotes',
        key: "DocEntry",
        isDocument: true
    },
    PurchaseOrders: {
        nameSdkObject: 'oPurchaseOrders',
        key: "DocEntry",
        isDocument: true
    },
    PurchaseDeliveryNotes: {
        nameSdkObject: 'oPurchaseDeliveryNotes',
        key: "DocEntry",
        isDocument: true
    },
    PurchaseReturns: {
        nameSdkObject: 'oPurchaseReturns',
        key: "DocEntry",
        isDocument: true
    },
    PurchaseInvoices: {
        nameSdkObject: 'oPurchaseInvoices',
        key: "DocEntry",
        isDocument: true
    },
    PurchaseCreditNotes: {
        nameSdkObject: 'oPurchaseCreditNotes',
        key: "DocEntry",
        isDocument: true
    },
    PurchaseQuotations: {
        nameSdkObject: 'oPurchaseQuotations',
        key: "DocEntry",
        isDocument: true
    },
    PurchaseRequest: {
        nameSdkObject: 'oPurchaseRequest',
        key: "DocEntry",
        isDocument: true
    },
    ReturnRequest: {
        nameSdkObject: 'oReturnRequest',
        key: "DocEntry",
        isDocument: true
    },
    InventoryGenExit: {
        nameSdkObject: 'oInventoryGenExit',
        key: "DocEntry",
        isDocument: true
    },
    InventoryGenEntry: {
        nameSdkObject: 'oInventoryGenEntry',
        key: "DocEntry",
        isDocument: true
    },
    Draft: {
        nameSdkObject: 'oDrafts',
        key: "DocEntry",
        isDocument: true
    },
}




async function getCurrentSessionId(node, AUTHObj_id) {
    const context_setting_data = node.context().global;
    let session_id = context_setting_data.get(`_LY1_${AUTHObj_id}.session_id`);

    if (session_id === null || session_id === undefined || session_id === " ") {
        new Error("Not Found a SessionID, Do you effet the login?");
    }
    else {
        return session_id;
    }

}

async function getCurrentUrl(node, AUTHObj_id) {
    const context_setting_data = node.context().global;
    let url = context_setting_data.get(`_LY1_${AUTHObj_id}.url`);

    if (url === null || url === undefined || url === " ") {
        new Error("Not Found a url, Do you effet the login?");
    }
    else {
        return url;
    }

}

async function getCurrentCompDB(node, AUTHObj_id) {
    const context_setting_data = node.context().global;
    let DB = context_setting_data.get(`_LY1_${AUTHObj_id}.comp`);

    if (DB === null || DB === undefined || DB === " ") {
        new Error('Not Found a DB, Do you effet the login?');
        //done(new Error('Not Found a DB, Do you effet the login?'));
    }
    else {
        return DB;
    }

}


function map_document(params) {
    let mapKey = Object.keys(params);
    let head;
    let rows = [];

    if(mapKey.some((key) => key === "obj_t")) {
        if(params["obj_t"].hasOwnProperty("fields")) {
            head = params["obj_t"].fields;
        }
        else {
            head = params["obj_t"];
        }
    }
    else if(mapKey.some((key) => key === "head")) {
        if(params["head"].hasOwnProperty("fields") ) {
            head = params["head"].fields;
        }
        else {
            head = params["head"];
        }
    }
    else {
        head = undefined;
    }

    if(mapKey.hasOwnProperty((key) => key === "obj_r")) {
        if(params["obj_r"].hasOwnProperty("lines")){
            for(let line of params["obj_r"].lines) {
                if(line.hasOwnProperty("fields")) {
                    rows.push(line.fields);
                }
                else {
                    rows.push(line);
                }
            }
        }
        else if(Array.isArray(params["obj_r"])) {
            for(let line of params["obj_r"]) {
                if(line.hasOwnProperty("fields")) {
                    rows.push(line.fields);
                }
                else {
                    rows.push(line);
                }
            }
        }
        else {
            rows.push(params["obj_r"]);
        }
    }
    else if(mapKey.some((key) => key === "rows")) {
        if(params["rows"].hasOwnProperty("lines")){
            for(let line of params["rows"].lines) {
                if(line.hasOwnProperty("fields")) {
                    rows.push(line.fields);
                }
                else {
                    rows.push(line);
                }
            }
        }
        else if(Array.isArray(params["rows"])) {
            for(let line of params["rows"]) {
                if(line.hasOwnProperty("fields")) {
                    rows.push(line.fields);
                }
                else {
                    rows.push(line);
                }
            }
        }
        else {
            rows.push(params["rows"]);
        }
    }
    else {
        rows = undefined;
    }

    return {
        head : head,
        rows : rows
    };

}


async function login(node, AUTHObj) {
    const context_setting_data = node.context().global;

    const prot = context_setting_data.get(`_LY1_${AUTHObj.id}.prot`);
    const host = context_setting_data.get(`_LY1_${AUTHObj.id}.host`);
    const user = context_setting_data.get(`_LY1_${AUTHObj.id}.user`);
    const pass = context_setting_data.get(`_LY1_${AUTHObj.id}.pass`);
    const comp = context_setting_data.get(`_LY1_${AUTHObj.id}.comp`);

    let url = `${prot}://${host.trim()}/LayerOne/${ENPOINT_URL.user_login_service}`;
    node.context().global.set(`_LY1_${node.id}.url`, `${prot}://${host.trim()}/LayerOne/`);

    let bodyLogin = {
        "dbname": comp.trim(),
        "user": user.trim(),
        "password": pass,
    };


    let options = {
        method: 'POST',
        url: url,
        rejectUnauthorized: false,
        data: bodyLogin,
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': JSON.stringify(bodyLogin).length,
        }
    };

    return await axios(options);

}


async function logout(node, AUTHObj) {
    try {
        let session = await getCurrentSessionId(node, AUTHObj.idAuth);
        let url = await getCurrentUrl(node, AUTHObj.idAuth);
        url = `${url}${ENPOINT_URL.logout_service}`;
        let body = {
            "session_id": session
        };
        let options = {
            method: 'POST',
            url: url,
            rejectUnauthorized: false,
            data: body,
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': JSON.stringify(body).length,
            }
        };

        return await axios(options);

    }
    catch (e) {
        node.error(e);
    }

}

async function query(node, AUTHObj, type, query) {
    let session = await getCurrentSessionId(node, AUTHObj.idAuth);
    let url = await getCurrentUrl(node, AUTHObj.idAuth);
    let db = await getCurrentCompDB(node, AUTHObj.idAuth);
    let now = new Date().getTime();
    let contextToken = `${db};${now};${session}`;

    if (!query || query === '') {
        new Error("Not Found a Query");
    }

    let body = {
        "session_id": session,
        "query": query
    };

    let options = {
        method: 'POST',
        url: "",
        rejectUnauthorized: false,
        data: body,
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': JSON.stringify(body).length,
            'PMContextToken': contextToken
        }
    };

    if (type === TYPE_QUERY.ADO_WRITE) {
        options.url = `${url}${ENPOINT_URL.ADO_query_service_w}`;
    } else if (type === TYPE_QUERY.ADO_READ) {
        options.url = `${url}${ENPOINT_URL.ADO_query_service_r}`;
    } else if (type === TYPE_QUERY.DI_READ) {
        options.url = `${url}${ENPOINT_URL.DI_query_service_r}`;
    } else if (type === TYPE_QUERY.DI_WRITE) {
        options.url = `${url}${ENPOINT_URL.DI_query_service_w}`;
    }
    return axios(options);


}

async function company(node, AUTHObj) {
    let session = await getCurrentSessionId(node, AUTHObj.idAuth);
    let url = await getCurrentUrl(node, AUTHObj.idAuth);
    url = `${url}${ENPOINT_URL.company_service}`;
    let body = {
        "session_id": session
    };

    let options = {
        method: 'POST',
        url: url,
        rejectUnauthorized: false,
        data: body,
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': JSON.stringify(body).length,
        }
    };
    return axios(options);
}


async function companyInfo(node, AUTHObj) {
    let session = await getCurrentSessionId(node, AUTHObj.idAuth);
    let url = await getCurrentUrl(node, AUTHObj.idAuth);
    url = `${url}${ENPOINT_URL.companyinfo_service}`;
    let body = {
        "session_id": session
    };

    let options = {
        method: 'POST',
        url: url,
        rejectUnauthorized: false,
        data: body,
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': JSON.stringify(body).length,
        }
    };
    return axios(options);
}



async function companyAdminInfo(node, AUTHObj) {
    let session = await getCurrentSessionId(node, AUTHObj.idAuth);
    let url = await getCurrentUrl(node, AUTHObj.idAuth);
    url = `${url}${ENPOINT_URL.admininfo_service}`;
    let body = {
        "session_id": session
    };

    let options = {
        method: 'POST',
        url: url,
        rejectUnauthorized: false,
        data: body,
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': JSON.stringify(body).length,
        }
    };
    return axios(options);

}

async function document(node, AUTHObj, action, params, fromBuild) {
    let session = await getCurrentSessionId(node, AUTHObj.idAuth);
    let url = await getCurrentUrl(node, AUTHObj.idAuth);
    url = `${url}${ENPOINT_URL.document_service}`;
    let body = {};

    if (fromBuild) {
        body = {
            "session_id": session,
            "action": action,
            "type": params.type,
            "obj_t": {
                "fields": params.header,
            },
            "obj_r": {
                "lines": params.rows
            }
        };
    }
    else {
        try {
            body = {
                "session_id": session,
                "action": action,
                "type": params.type,
                "obj_t": {
                    "fields": params.header,
                },
                "obj_r": {
                    "lines": params.rows
                }
            };
        }
        catch (e) {
            new Error('Error On Creation Object for Request');
        }
    }


    if (action === TYPE_DOCUMENT_ACTION.UPDATE && params.type === TYPE_DOCUMENT.Orders) {
        url = `${url}${ENPOINT_URL.updateobject_service}`;
        body = {
            "session_id": session,
            "type": "oOrders",
            "query_params": params.header.DocEntry,
            "obj_t": {
                "fields": params.header,
            },
            "obj_r": {
                "lines": params.rows
            }
        }
    }

    let options = {
        method: 'POST',
        url: url,
        rejectUnauthorized: false,
        data: body,
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': JSON.stringify(body).length,
        }
    };
    return axios(options);
}


async function pick_service( node, AUTHObj, action, params) {
    let session = await getCurrentSessionId( node, AUTHObj.idAuth);
    let url =await getCurrentUrl(node, AUTHObj.idAuth);
    url = `${url}${ENPOINT_URL.pick_service}`;
    let body = {
        "session_id": session,
    }
    
    if (action === TYPE_DOCUMENT_ACTION.UPDATE) {
        try {
            if(params.absolutEntry) {
                body.action = "Update";
                body.type = "PickLists";
                delete params.Absoluteentry;
                body = Object.assign({}, body , params);
                let options = {
                    method: 'POST',
                    url: url,
                    rejectUnauthorized: false,
                    data: body,
                    headers: {
                        'Content-Type': 'application/json',
                        'Content-Length': JSON.stringify(body).length,
                    }
                };
                return axios(options);
            } 
            else {
                throw "You not set a minimal Props for Update PickList"
            }       
        }
        catch (e) {

           console.log(e);
            throw "Erron on Request"
        }
    }

}



async function businessPartner(node, AUTHObj, action, params) {
    let session = await getCurrentSessionId(node, AUTHObj.idAuth);
    let url = await getCurrentUrl(node, AUTHObj.idAuth);
    url = `${url}${ENPOINT_URL.bp_service}`;

    let body = {
        "session_id": session,
    }

    if (action === TYPE_MASTERDATA_ACTION.ADD) {
        body.action = "Add";
        if (params.CardCode) {
            delete params.CardCode;
            body = Object.assign({}, body, params);
            //body.businesspartner.fields = params.body;
            let options = {
                method: 'POST',
                url: url,
                rejectUnauthorized: false,
                data: body,
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': JSON.stringify(body).length,
                }
            };
            return axios(options);
        }
        else {
            throw "You not set a minimal Props for add Business Partner"
        }
    }
    else if (action === TYPE_MASTERDATA_ACTION.REMOVE) {
        body.action = "Remove";
        if (params.CardCode) {
            delete params.CardCode;
            body = Object.assign({}, body, params);
            let options = {
                method: 'POST',
                url: url,
                rejectUnauthorized: false,
                data: body,
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': JSON.stringify(body).length,
                }
            };
            return axios(options);
        }
        else {
            throw "You not set a minimal Props for Remove Business Partner"
        }
    }
    else if (action === TYPE_MASTERDATA_ACTION.UPDATE) {
        try {
            let tempUrl = await getCurrentUrl(node, AUTHObj.idAuth);
            tempUrl = `${tempUrl}${ENPOINT_URL.sbo_object_template}`;
            let tempBody = {
                "session_id": session,
                "sbo_object": "oBusinessPartners",
                "object_type": "BO"
            }
            let optionsTemp = {
                method: 'POST',
                url: tempUrl,
                rejectUnauthorized: false,
                data: tempBody,
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': JSON.stringify(tempBody).length,
                }
            };
            let template = await axios(optionsTemp).then((res) => {
                return res.data;
            }).catch((err) => { console.log(err) });

            let temp = convert.xml2js(template, {
                compact: true,
                spaces: 4,
                ignoreComment: true,
                alwaysChildren: true,
                ignoreAttributes: true,
                nativeType: true,
                nativeTypeAttributes: true,
                ignoreDeclaration: true,
            }
            );
            //set Mapping 
            let bpKeyName = [
                {
                    name: 'businesspartner',
                    nameMap: 'mapHead',
                    nameXml: 'BusinessPartners',
                    avaibleList: false,
                    match: false,
                },
                {
                    name: 'bpaddress',
                    nameMap: 'mapAddress',
                    nameXml: 'BPAddresses',
                    avaibleList: true,
                    match: false,
                },
                {
                    name: 'bpcontact',
                    nameMap: 'mapContact',
                    nameXml: 'ContactEmployees',
                    avaibleList: true,
                    match: false,
                },
                {
                    name: 'bppaymentmmethods',
                    nameMap: 'mapPayment',
                    nameXml: 'BPPaymentMethods',
                    avaibleList: true,
                    match: false,
                },
            ];

            let mapSchemaBp = temp.BOM.BO;
            let mappingBp = {
                mapHead: mapSchemaBp.BusinessPartners.row,
                mapAddress: mapSchemaBp.BPAddresses.row,
                mapContact: mapSchemaBp.ContactEmployees.row,
                mapPayment: mapSchemaBp.BPPaymentMethods.row,
            }
            let build = {};
            for (let el in mappingBp) {
                let objKeys = Object.keys(mappingBp[el]);
                for (let key of objKeys) {
                    mappingBp[el][key] = null;
                }
            }
            let paramsObject = params;

            if (!paramsObject.CardCode) {
                throw 'You not set a minimal Props for Update Business Partner';
            }

            //SetMap from Params From Object

            for (let [index, translateObject] of bpKeyName.entries()) {
                if (paramsObject[translateObject.name]) {
                    bpKeyName[index].match = true;
                    let updateProps = paramsObject[translateObject.name].fields;
                    if (Array.isArray(updateProps)) {
                        if (translateObject.avaibleList) {
                            let objKey = Object.keys(mappingBp[translateObject.nameMap]);
                            let listElement = [];
                            for (let row of updateProps) {
                                let templateObject = mappingBp[translateObject.nameMap];
                                for (let key of objKey) {
                                    if (row[key]) {
                                        templateObject[key] = row[key];
                                    }
                                }
                                templateObject = Object.fromEntries(Object.entries(templateObject).filter(([_, v]) => v != null))
                                listElement.push(templateObject);
                            }
                            mappingBp[translateObject.nameMap] = listElement;

                            build[translateObject.nameXml] = {
                                row: mappingBp[translateObject.nameMap]
                            };

                        }
                        else {
                            throw `The Prop ${translateObject.name} is not valid, will be is array`;
                        }
                    }
                    else {
                        let objKey = Object.keys(mappingBp[translateObject.nameMap]);
                        for (let key of objKey) {
                            if (updateProps[key]) {
                                mappingBp[translateObject.nameMap][key] = updateProps[key];
                            }
                        }
                        mappingBp[translateObject.nameMap] = Object.fromEntries(Object.entries(mappingBp[translateObject.nameMap]).filter(([_, v]) => v != null));

                        build[translateObject.nameXml] = {
                            row: mappingBp[translateObject.nameMap]
                        };
                    }
                }
                else {
                    mappingBp[translateObject.nameMap] = undefined;
                }
            }

            //Build RowDat
            let rawDataObj = {
                BOM: {
                    BO: {
                        AdmInfo: {
                            Object: 'oBusinessPartners',
                            version: '2'
                        },
                        QueryParams: {
                            CardCode: paramsObject.CardCode,
                        },
                        ...build
                    }
                }
            }

            let rawBuild = convert.json2xml(rawDataObj, {
                compact: true,
                indentCdata: true,
            });

            rawBuild = `<?xml version="1.0" encoding="UTF-8"?><env:Envelope xmlns:env="http://schemas.xmlsoap.org/soap/envelope/"><env:Header><SessionID>${session}</SessionID></env:Header><env:Body><dis:UpdateObject xmlns:dis="http://www.sap.com/SBO/DIS">${rawBuild}</dis:UpdateObject></env:Body></env:Envelope>`;
            let rawUrl = await getCurrentUrl(node, AUTHObj.idAuth);
            rawUrl = `${rawUrl}${ENPOINT_URL.raw_data}`;
            let options = {
                method: 'POST',
                url: rawUrl,
                rejectUnauthorized: false,
                data: rawBuild,
                headers: {
                    'Content-Type': 'application/xml',
                    'Content-Length': rawBuild.length,
                }
            };
            let response = await axios(options).then((res) => {
                return res.data;
            }).catch((err) => {
                return err;
            })
            response = await convert.xml2js(response, {
                compact: true,
                spaces: 4,
                ignoreComment: true,
                alwaysChildren: true,
                ignoreCdata: true,
                ignoreAttributes: true,
                nativeType: true,
                nativeTypeAttributes: true,
                ignoreDeclaration: true,
                ignoreDoctype: true,
                ignoreCdata: true,
            });

            if (response["env:Envelope"]["env:Body"]["env:Fault"]) {
                response = {
                    success: false,
                    reason: response["env:Envelope"]["env:Body"]["env:Fault"]["env:Reason"]["env:Text"]["_text"]
                }
            }
            else {
                response = {
                    success: true,
                }
            }
            return response;
        }
        catch (e) {
            throw "Erron on Request"
        }
    }

}


async function item(node, AUTHObj, action, params) {
    let session = await getCurrentSessionId(node, AUTHObj.idAuth);
    let url = await getCurrentUrl(node, AUTHObj.idAuth);
    url = `${url}${ENPOINT_URL.item_service}`;

    let body = {
        "session_id": session,
    }

    if (action === TYPE_MASTERDATA_ACTION.ADD) {
        body.action = "Add";
        if (params.ItemCode) {
            delete params.ItemCode;
            body = Object.assign({}, body, params);
            let options = {
                method: 'POST',
                url: url,
                rejectUnauthorized: false,
                data: body,
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': JSON.stringify(body).length,
                }
            };
            return axios(options);
        }
        else {
            throw "You not set a minimal Props for add Item"
        }
    }
    else if (action === TYPE_MASTERDATA_ACTION.REMOVE) {
        body.action = "Remove";
        if (params.ItemCode) {
            delete params.ItemCode;
            body = Object.assign({}, body, params);
            let options = {
                method: 'POST',
                url: url,
                rejectUnauthorized: false,
                data: body,
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': JSON.stringify(body).length,
                }
            };
            return axios(options);
        }
        else {
            throw "You not set a minimal Props for Remove Item"
        }
    }
    else if (action === TYPE_MASTERDATA_ACTION.UPDATE) {
        try {
            let tempUrl = await getCurrentUrl(node, AUTHObj.idAuth);
            tempUrl = `${tempUrl}${ENPOINT_URL.sbo_object_template}`;
            let tempBody = {
                "session_id": session,
                "sbo_object": "oItems",
                "object_type": "BO"
            }
            let optionsTemp = {
                method: 'POST',
                url: tempUrl,
                rejectUnauthorized: false,
                data: tempBody,
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': JSON.stringify(tempBody).length,
                }
            };
            let template = await axios(optionsTemp).then((res) => {
                return res.data;
            }).catch((err) => { console.log(err) });

            let temp = convert.xml2js(template, {
                compact: true,
                spaces: 4,
                ignoreComment: true,
                alwaysChildren: true,
                ignoreAttributes: true,
                nativeType: true,
                nativeTypeAttributes: true,
                ignoreDeclaration: true,
            }
            );

            //set Mapping 
            let itemKeyName = [
                {
                    name: 'item',
                    nameMap: 'mapHead',
                    nameXml: 'Items',
                    avaibleList: false,
                    match: false,
                },
                {
                    name: 'uomprices',
                    nameMap: 'mapUoMPrices',
                    nameXml: 'UoMPrices',
                    avaibleList: true,
                    match: false,
                },
                {
                    name: 'ItemWarehouseInfo',
                    nameMap: 'mapItemWarehouseInfo',
                    nameXml: 'ItemWarehouseInfo',
                    avaibleList: true,
                    match: false,
                },
                { 
                    name: 'ItemCycleCount',
                    nameMap: 'mapItemCycleCount',
                    nameXml: 'ItemCycleCount',
                    avaibleList: false,
                    match: false,
                },
                {
                    name: 'ItemPreferredVendors',
                    nameMap: 'mapItemPreferredVendors',
                    nameXml: 'ItemPreferredVendors',
                    avaibleList: true,
                    match: false,
                },
                {
                    name: 'LocalizationInfos',
                    nameMap: 'mapLocalizationInfos',
                    nameXml: 'LocalizationInfos',
                    avaibleList: true,
                    match: false,
                },
                {
                    name: 'ItemProjects',
                    nameMap: 'mapItemProjects',
                    nameXml: 'ItemProjects',
                    avaibleList: true,
                    match: false,
                },
                {
                    name: 'ItemDistributionRule',
                    nameMap: 'mapItemDistributionRule',
                    nameXml: 'ItemDistributionRule',
                    avaibleList: false,
                    match: false,
                },
                {
                    name: 'ItemAttributeGroups',
                    nameMap: 'mapItemAttributeGroups',
                    nameXml: 'ItemAttributeGroups',
                    avaibleList: false,
                    match: false,
                },
                {
                    name: 'ItemDepreciationParam',
                    nameMap: 'mapItemDepreciationParam',
                    nameXml: 'ItemDepreciationParam',
                    avaibleList: false,
                    match: false,
                },
                {
                    name: 'ItemPeriodControl',
                    nameMap: 'mapItemPeriodControl',
                    nameXml: 'ItemPeriodControl',
                    avaibleList: false,
                    match: false,
                },
                {
                    name: 'ItemUnitOfMeasurement',
                    nameMap: 'mapItemUnitOfMeasurement',
                    nameXml: 'ItemUnitOfMeasurement',
                    avaibleList: true,
                    match: false,
                },
                {
                    name: 'ItemUoMPackage',
                    nameMap: 'mapItemUoMPackage',
                    nameXml: 'ItemUoMPackage',
                    avaibleList: true,
                    match: false,
                },
                {
                    name: 'ItemBarCodes',
                    nameMap: 'mapItemBarCodes',
                    nameXml: 'ItemBarCodes',
                    avaibleList: true,
                    match: false,
                },
                
            ];
            let mapSchemaItem = temp.BOM.BO;
            let mappingItem = {
                mapHead: mapSchemaItem.Items.row,
                mapUoMPrices: mapSchemaItem.UoMPrices.row,
                mapItemWarehouseInfo: mapSchemaItem.ItemWarehouseInfo.row,
                mapItemCycleCount: mapSchemaItem.ItemCycleCount.row,
                mapItemPreferredVendors : mapSchemaItem.ItemPreferredVendors.row,
                mapLocalizationInfos : mapSchemaItem.LocalizationInfos.row,
                mapItemProjects : mapSchemaItem.ItemProjects.row,
                mapItemDistributionRule : mapSchemaItem.ItemDistributionRule.row,
                mapItemAttributeGroups : mapSchemaItem.ItemAttributeGroups.row,
                mapItemDepreciationParam : mapSchemaItem.ItemDepreciationParam.row,
                mapItemPeriodControl : mapSchemaItem.ItemPeriodControl.row,
                mapItemUnitOfMeasurement : mapSchemaItem.ItemUnitOfMeasurement.row,
                mapItemUoMPackage : mapSchemaItem.ItemUoMPackage.row,
                mapItemBarCodes : mapSchemaItem.ItemBarCodes.row,
            }
            let build = {};
            for (let el in mappingItem) {
                let objKeys = Object.keys(mappingItem[el]);
                for (let key of objKeys) {
                    mappingItem[el][key] = null;
                }
            }
            let paramsObject = params;
            if (!paramsObject.ItemCode) {
                throw 'You not set a minimal Props for Update Item';
            }
            //SetMap from Params From Object
            for (let [index, translateObject] of itemKeyName.entries()) {
                if (paramsObject[translateObject.name]) {
                    itemKeyName[index].match = true;
                    let updateProps = paramsObject[translateObject.name].fields;
                    if (Array.isArray(updateProps)) {
                        if (translateObject.avaibleList) {
                            let objKey = Object.keys(mappingItem[translateObject.nameMap]);
                            let listElement = [];
                            for (let row of updateProps) {
                                let templateObject = mappingItem[translateObject.nameMap];
                                for (let key of objKey) {
                                    if (row[key]) {
                                        templateObject[key] = row[key];
                                    }
                                }
                                templateObject = Object.fromEntries(Object.entries(templateObject).filter(([_, v]) => v != null))
                                listElement.push(templateObject);
                            }
                            mappingItem[translateObject.nameMap] = listElement;

                            build[translateObject.nameXml] = {
                                row: mappingItem[translateObject.nameMap]
                            };

                        }
                        else {
                            throw `The Prop ${translateObject.name} is not valid, will be is array`;
                        }
                    }
                    else {
                        let objKey = Object.keys(mappingItem[translateObject.nameMap]);
                        for (let key of objKey) {
                            if (updateProps[key]) {
                                mappingItem[translateObject.nameMap][key] = updateProps[key];
                            }
                        }
                        mappingItem[translateObject.nameMap] = Object.fromEntries(Object.entries(mappingItem[translateObject.nameMap]).filter(([_, v]) => v != null));

                        build[translateObject.nameXml] = {
                            row: mappingItem[translateObject.nameMap]
                        };
                    }
                }
                else {
                    mappingItem[translateObject.nameMap] = undefined;
                }
            }
            //Build RowDat
            let rawDataObj = {
                BOM: {
                    BO: {
                        AdmInfo: {
                            Object: 'oItems',
                            version: '2'
                        },
                        QueryParams: {
                            ItemCode: paramsObject.ItemCode,
                        },
                        ...build
                    }
                }
            }
            let rawBuild = convert.json2xml(rawDataObj, {
                compact: true,
                indentCdata: true,
            });
            rawBuild = `<?xml version="1.0" encoding="UTF-8"?><env:Envelope xmlns:env="http://schemas.xmlsoap.org/soap/envelope/"><env:Header><SessionID>${session}</SessionID></env:Header><env:Body><dis:UpdateObject xmlns:dis="http://www.sap.com/SBO/DIS">${rawBuild}</dis:UpdateObject></env:Body></env:Envelope>`;
            let rawUrl = await getCurrentUrl(node, AUTHObj.idAuth);
            rawUrl = `${rawUrl}${ENPOINT_URL.raw_data}`;
            let options = {
                method: 'POST',
                url: rawUrl,
                rejectUnauthorized: false,
                data: rawBuild,
                headers: {
                    'Content-Type': 'application/xml',
                    'Content-Length': rawBuild.length,
                }
            };

            let response = await axios(options).then((res) => {
                return res.data;
            }).catch((err) => {
                return err;
            });
            response = await convert.xml2js(response, {
                compact: true, 
                spaces: 4, 
                ignoreComment: true,
                alwaysChildren: true, 
                ignoreCdata: true, 
                ignoreAttributes:true,
                nativeType : true,
                nativeTypeAttributes : true,
                ignoreDeclaration : true,
                ignoreDoctype : true,
                ignoreCdata : true,
                });
            if (response["env:Envelope"]["env:Body"]["env:Fault"]) {
                response = {
                    success : false,
                    reason :  response["env:Envelope"]["env:Body"]["env:Fault"]["env:Reason"]["env:Text"]["_text"]
                }
            }
            else {
                response = {
                    success : true,
                }
            }

            return response;
        }
        catch (e) {
           console.log(e);
            throw "Erron on Request"
        }
    }
    
}

async function stock_transfer( node, AUTHObj, params, isRequest) {
    let session = await getCurrentSessionId( node, AUTHObj.idAuth);
    let url = await getCurrentUrl(node, AUTHObj.idAuth);
    console.log(url);
    if(isRequest) {
        url = `${url}${ENPOINT_URL.inventorytransferrequest_service}`;
    }
    else {
        url = `${url}${ENPOINT_URL.stocktransfer_service}`;
    }
    
    let body = {
        "session_id": session,
    }

    let { head, rows } = map_document(params);
    
    body.action = "Add";
    if(!head || !rows) {
        throw "Error do you not set a Head o Rows for adding document"
    }

    let listRequiredFiled = {
        head : ["DocDate"],
        rows : [
            "ItemCode",
            "Quantity",
            "FromWarehouseCode",
            "WarehouseCode"
        ]
    }
    let testRes =  [];
    for( let test of listRequiredFiled.head) {
        testRes.push ({
            position : "head",
            row  : 0,
            "test" : test , 
            result : head.hasOwnProperty(test)
        });
    }

    for (let [index ,row] of rows.entries()) {
        for( let test of listRequiredFiled.rows) {
            testRes.push ({
                position : "row",
                row  : index,
                "test" : test , 
                result : row.hasOwnProperty(test)
            });
        }
    }

    if(testRes.some((test_result) => !test_result.result)) {
        let listError = testRes.filter((test_result) => !test_result.result);
        
        let error_response = "Error - you dont set a required value: \n"

        for( let err of listError) {
            error_response = `${error_response} ${err.position} - line ${err.row} - not set ${err.test} \n`
        }
        throw error_response;
    }


    let docRows = rows.map((row) => {
        return {
            fields : row
        }
    })

    body.obj_r = {
        lines : docRows
    }

    body.obj_t = {
        fields : head
    }

        let options = {
            method: 'POST',
            url: url,
            rejectUnauthorized: false,
            data: body,
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': JSON.stringify(body).length,
            }
        };
        return axios(options);
}

async function getByKey(node, AUTHObj, typeObj, keyObj) {
    let session = await getCurrentSessionId(node, AUTHObj.idAuth);
    let url = await getCurrentUrl(node, AUTHObj.idAuth);
    url = `${url}${ENPOINT_URL.raw_data}`;

    let propKey = GET_BY_KEY_OBJECT_DATA[typeObj].key;
    let objectName = GET_BY_KEY_OBJECT_DATA[typeObj].nameSdkObject;

    let isDocument = GET_BY_KEY_OBJECT_DATA[typeObj].isDocument;

    let body = `<?xml version="1.0" encoding="UTF-16"?>
        <env:Envelope xmlns:env="http://schemas.xmlsoap.org/soap/envelope/">
            <env:Header>
              <SessionID>${session}</SessionID>
            </env:Header>
            <env:Body>
                <dis:GetByKey xmlns:dis="http://www.sap.com/SBO/DIS">
                     <Object>${objectName}</Object>
                     <${propKey}>${keyObj}</${propKey}>
            </dis:GetByKey>
        </env:Body>
     </env:Envelope>`;
    let options = {
        method: 'POST',
        url: url,
        rejectUnauthorized: false,
        data: body,
        headers: {
            'Content-Type': 'text/xml',
            'Content-Length': body.length,
        }
    };



    let result = await axios(options).then((e) => { return e.data }).catch((err) => new Error(err));
    let temp = convert.xml2js(result, {
        compact: true,
        spaces: 4,
        ignoreComment: true,
        alwaysChildren: true,
        //ignoreCdata: true, 
        ignoreAttributes: true,
        nativeType: true,
        nativeTypeAttributes: true,
        ignoreDeclaration: true,
        ignoreDoctype: true,
        ignoreCdata: true
        //ignoreText : true
    }
    );


    let objeFroXml;
    try {
        objeFroXml = temp["env:Envelope"]["env:Body"].GetByKeyResponse.BOM.BO || undefined;
    }
    catch (e) {
        throw e;
    }

    if (objeFroXml) {
        if (isDocument) {
            let objectTemplate = {
                type: typeObj,
                document: {
                    Address: {},
                    Tax: {}
                },
                documentLines: [],
            };
            //Testata
            let head = objeFroXml.Documents.row;
            let headKeys = Object.keys(head);

            for (let key of headKeys) {
                objectTemplate.document[key] = head[key]["_text"] || null;
            }
            //Rows
            let rows = objeFroXml.Document_Lines.row;
            for (let row of rows) {
                let rowKey = Object.keys(row);
                let temprow = {};
                for (let key of rowKey) {
                    temprow[key] = row[key]["_text"] || null;
                }

                objectTemplate.documentLines.push(temprow);
            }
            //TaxExtention 
            let tax = objeFroXml.TaxExtension.row;
            let taxKey = Object.keys(tax);
            for (let key of taxKey) {
                objectTemplate.document.Tax[key] = tax[key]["_text"] || null;
            }
            //Address 
            let address = objeFroXml.AddressExtension.row;
            let addressKey = Object.keys(address);
            for (let key of addressKey) {
                objectTemplate.document.Address[key] = address[key]["_text"] || null;
            }
            return objectTemplate;
        }
        else {
            if (typeObj === 'bussinesPartner') {
                let objectTemplate = {
                    type: typeObj,
                    detail: {},
                    addresses: [],
                    contact: [],
                    accountReceivablePayble: [],
                    paymentMethods: [],
                    bankAccounts: [],
                };
                let head = objeFroXml.BusinessPartners.row || null;
                let headKeys = Object.keys(head);
                for (let key of headKeys) {
                    objectTemplate.detail[key] = head[key]["_text"] || null;
                }

                let address = objeFroXml.BPAddresses.row || null;

                if (Array.isArray(address)) {
                    for (let row of address) {
                        let rowKey = Object.keys(row);
                        let temprow = {};
                        for (let key of rowKey) {
                            temprow[key] = row[key]["_text"] || null;
                        }
                        objectTemplate.addresses.push(temprow);
                    }
                }
                else {
                    let addressKeys = Object.keys(address);
                    let obj = {}
                    for (let key of addressKeys) {
                        obj[key] = address[key]["_text"] || null;
                    }
                    objectTemplate.addresses.push(obj);
                }

                let contatct = objeFroXml.ContactEmployees.row || null;


                if (Array.isArray(contatct)) {
                    for (let row of contatct) {
                        let rowKey = Object.keys(row);
                        let temprow = {};
                        for (let key of rowKey) {
                            temprow[key] = row[key]["_text"] || null;
                        }
                        objectTemplate.contact.push(temprow);
                    }
                }
                else {
                    let contatctKeys = Object.keys(contatct);
                    let obj = {}
                    for (let key of contatctKeys) {
                        obj[key] = contatct[key]["_text"] || null;
                    }
                    objectTemplate.contact.push(obj);
                }



                let accountReceivablePayble = objeFroXml.BPAccountReceivablePayble.row || null;

                if (Array.isArray(accountReceivablePayble)) {
                    for (let row of accountReceivablePayble) {
                        let rowKey = Object.keys(row);
                        let temprow = {};
                        for (let key of rowKey) {
                            temprow[key] = row[key]["_text"] || null;
                        }
                        objectTemplate.accountReceivablePayble.push(temprow);
                    }
                }
                else {
                    let accountReceivablePaybleKeys = Object.keys(accountReceivablePayble);
                    let obj = {}
                    for (let key of accountReceivablePaybleKeys) {
                        obj[key] = accountReceivablePayble[key]["_text"] || null;
                    }
                    objectTemplate.accountReceivablePayble.push(obj);
                }

                let paymentMethods = objeFroXml.BPPaymentMethods.row || null;

                if (Array.isArray(paymentMethods)) {
                    for (let row of paymentMethods) {
                        let rowKey = Object.keys(row);
                        let temprow = {};
                        for (let key of rowKey) {
                            temprow[key] = row[key]["_text"] || null;
                        }
                        objectTemplate.paymentMethods.push(temprow);
                    }
                }
                else {
                    let paymentMethodsKeys = Object.keys(paymentMethods);
                    let obj = {}
                    for (let key of paymentMethodsKeys) {
                        obj[key] = paymentMethods[key]["_text"] || null;
                    }
                    objectTemplate.paymentMethods.push(obj);
                }


                let bankAccounts = objeFroXml.BPBankAccounts.row || null;

                if (Array.isArray(bankAccounts)) {
                    for (let row of bankAccounts) {
                        let rowKey = Object.keys(row);
                        let temprow = {};
                        for (let key of rowKey) {
                            temprow[key] = row[key]["_text"] || null;
                        }
                        objectTemplate.bankAccounts.push(temprow);
                    }
                }
                else {
                    let bankAccountsKeys = Object.keys(bankAccounts);
                    let obj = {}
                    for (let key of bankAccountsKeys) {
                        obj[key] = bankAccounts[key]["_text"] || null;
                    }
                    objectTemplate.bankAccounts.push(obj);
                }

                return objectTemplate;
            }
            else if (typeObj === 'item') {
                let objectTemplate = {
                    type: typeObj,
                    detail: {},
                    prices: [],
                    warehouses: [],
                    localization: [],
                };

                let head = objeFroXml.Items.row || null;
                let headKeys = Object.keys(head);
                for (let key of headKeys) {
                    objectTemplate.detail[key] = head[key]["_text"] || null;
                }


                let prices = objeFroXml.Items_Prices.row || null;
                if (Array.isArray(prices)) {
                    for (let row of prices) {
                        let rowKey = Object.keys(row);
                        let temprow = {};
                        for (let key of rowKey) {
                            temprow[key] = row[key]["_text"] || null;
                        }
                        objectTemplate.prices.push(temprow);
                    }
                }
                else {
                    let pricesKeys = Object.keys(prices);
                    let obj = {}
                    for (let key of pricesKeys) {
                        obj[key] = prices[key]["_text"] || null;
                    }
                    objectTemplate.prices.push(obj);
                }

                let warehouses = objeFroXml.ItemWarehouseInfo.row || null;
                if (Array.isArray(warehouses)) {
                    for (let row of warehouses) {
                        let rowKey = Object.keys(row);
                        let temprow = {};
                        for (let key of rowKey) {
                            temprow[key] = row[key]["_text"] || null;
                        }
                        objectTemplate.warehouses.push(temprow);
                    }
                }
                else {
                    let warehousesKeys = Object.keys(warehouses);
                    let obj = {}
                    for (let key of warehousesKeys) {
                        obj[key] = warehouses[key]["_text"] || null;
                    }
                    objectTemplate.warehouses.push(obj);
                }

                let localization = objeFroXml.LocalizationInfos.row || null;
                if (Array.isArray(localization)) {
                    for (let row of localization) {
                        let rowKey = Object.keys(row);
                        let temprow = {};
                        for (let key of rowKey) {
                            temprow[key] = row[key]["_text"] || null;
                        }
                        objectTemplate.localization.push(temprow);
                    }
                }
                else {
                    let localizationKeys = Object.keys(localization);
                    let obj = {}
                    for (let key of localizationKeys) {
                        obj[key] = localization[key]["_text"] || null;
                    }
                    objectTemplate.localization.push(obj);
                }
                return objectTemplate;
            }
            else {
                return null;
            }

        }
    }
    else {
        throw "Not Found Object";
    }

}



module.exports = {
    login: login,
    logout: logout,
    TYPE_QUERY: TYPE_QUERY,
    query: query,
    company: company,
    companyInfo: companyInfo,
    companyAdminInfo: companyAdminInfo,
    document: document,
    getByKey: getByKey,
    businessPartner: businessPartner,
    item : item,
    pick_service : pick_service,
    stock_transfer : stock_transfer
};




