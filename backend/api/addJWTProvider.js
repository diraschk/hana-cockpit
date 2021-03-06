const express = require('express');
const router = express.Router();
const cors = require('cors');
const hana = require('@sap/hana-client');
const bodyParser = require('body-parser');

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({extended:true}));
router.options('*',cors());

router.post('/',cors(),(req,res)=>{
    var pass = true;
    var missing = [];
    `dbServerNode,authUser,authPassword,name,issuer,claim`.split(',').map(e=>{
        if(!req.body || !req.body[e]) {
            pass = false;
            missing.push(e);
        }
    })
    if(!pass){
        res.status(400);
        res.json({
            success : false,
            message : `The following require parameters are missing: ${missing.join(',')}`
        });
        res.end();
        return;
    }
    let conn = hana.createConnection();
    new Promise((resolve,reject)=>{
        conn.connect({
            serverNode  : req.body.dbServerNode,
            uid         : req.body.authUser,
            pwd         : req.body.authPassword
        }, function(err) {
            if (err) return reject(err);
            resolve();
        });
    }).then(()=>{
        console.log(`Adding JWT Provider ${req.body.name}...`);
        return `CREATE JWT PROVIDER ${req.body.name} WITH ISSUER '${req.body.issuer}' CLAIM '${req.body.claim}' AS EXTERNAL IDENTITY;`
        .split('\n').reduce( async (previousPromise, nextStatement) => {
            await previousPromise;
            return new Promise((resolve,reject)=>{
                console.log(`Running:\t${nextStatement}...`);
                conn.exec(nextStatement,null,(err,results)=>{
                    if(err && err.code != 331) {
                        console.log(`Failed on command ${nextStatement} with error: ${JSON.stringify(err)}`);
                        return reject(err);
                    }else{
                        resolve(results);
                    }
                });
            });
        }, Promise.resolve());
    }).then(()=>{
        console.log(`Done adding JWT Provider ${req.body.name}.`);
        res.status(200);
        res.json({
            success : true,
            message : `Done adding JWT Provider ${req.body.name}.`
        });
        res.end();
    }).catch((err)=>{
        console.log(`An error occured while trying to add JWT Provider:\n${JSON.stringify(err)}`);
        res.status(500);
        res.json(err);
        console.log(err);
        res.end();
    });
});

module.exports = router;