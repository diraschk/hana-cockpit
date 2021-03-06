<template>
  <div>
    <ErrorDialog v-model="error.error" :message="error.message" :details="error.details"/>
    <v-dialog v-model="complete" scrollable max-width="300px">
      <v-card>
        <v-card-title>{{apiResults.status}}</v-card-title>
        <v-divider></v-divider>
        <v-card-text>{{apiResults.message}}</v-card-text>
      </v-card>
    </v-dialog>
    <v-dialog v-model="loading" persistent width="300px" >
      <v-card color="primary">
        <v-card-text>
          <span>{{loadingMessage}}</span>
          <v-progress-linear indeterminate color="white" class="mb-0" />
        </v-card-text>
      </v-card>
    </v-dialog>
    <v-list two-line>
      <template v-for="(item,index) in adminOptions">
        <v-list-tile :key="index" @click="openDialog(item)">
          <v-list-tile-content>
            <v-list-tile-title v-html="item.option"></v-list-tile-title>
            <v-list-tile-sub-title v-html="item.description"></v-list-tile-sub-title>
          </v-list-tile-content>
          <v-dialog v-model="item.dialog" width="80%">
          <v-card>
            <v-toolbar flat dark color="primary">
              <v-toolbar-title>{{item.option}}</v-toolbar-title>
            </v-toolbar>
            <v-card-title><span>{{item.description}}</span></v-card-title>
            <v-card-text>
              <component :ref="item.option" v-bind:is="item.component" v-model="item.data"></component>
            </v-card-text>
            <v-card-actions>
              <v-btn color="error" flat @click="item.dialog=false">Close</v-btn>
              <v-spacer />
              <v-btn color="primary" flat @click="saveSomething(item)">Run</v-btn>
            </v-card-actions>
          </v-card>
          </v-dialog>
        </v-list-tile>
      </template>
    </v-list>
  </div>
</template>

<script>
import CreateUser from '@/views/Admin/CreateUser';
import CreateAgent from '@/views/Admin/CreateAgent';
import CreateAdapter from '@/views/Admin/CreateAdapter';
import ResetPassword from '@/views/Admin/ResetPassword';
import GrantRole from '@/views/Admin/GrantRole';
import EnableService from '@/views/Admin/EnableService';
import EnableHDI from '@/views/Admin/EnableHDI';
import MapExternalHost from '@/views/Admin/MapExternalHost';
import AddJWTProvider from '@/views/Admin/AddJWTProvider';
import CreatePSE from '@/views/Admin/CreatePSE';
import CreateCertificate from '@/views/Admin/CreateCertificate';
import MassLockUsers from '@/views/Admin/MassLockUsers';

import ErrorDialog from '@/components/ErrorDialog';

import axios from 'axios';
export default {
  name: 'Admin',
  sockets : {
    connect () {
      console.log("Admin Connection established.");
    },
    createuser (data){
      console.log(data);
    },
    disconnect () {
      console.log("Admin Connection ended.");
    }
  },
  props : { },
  methods : {
    saveSomething(item){
      if(!this.$refs[item.option][0].$refs.form.validate()){
         return;
      }
      if(item.socket){
        this.$socket.emit('createuser',item.data);
        console.log(this.sockets);
        return;
      }
      this.loading=true;
      this.loadingMessage=item.loadingMessage;
      axios.post(`${process.env.VUE_APP_HANA_APP_BACKEND}${item.endpoint}`,item.data).then(res=>{
        item.dialog = false;
        this.loading=false;
        this.complete=true;
        this.apiResults={
          status : "Success",
          message : res.data.message
        }
      }, err=> {
        this.loading=false;
        // this.complete=true;
        this.error.error=true;
        this.error.message = `Could not successfully complete the task '${item.option}.'`;
        this.error.details = (err.response)?(err.response.data)?err.response.data:err.response:err
      });
    },
    openDialog(item){
      this.$refs[item.option][0].$refs.form.resetValidation();
      item.data=JSON.parse(JSON.stringify(item.defaults));
      item.dialog=true;
    }
  },
  mounted () { },
  data () {
    let systemDBNode = this.$store.getters.config.config.systemDbNode || process.env.VUE_APP_HANA_SYSTEMNODE || 'localhost:39017';
    let tenantDBNode = this.$store.getters.config.config.tenantDbNode || process.env.VUE_APP_HANA_TENANTNODE || 'localhost:39041';
    let tenantDBName = this.$store.getters.config.config.tenantDbName || process.env.VUE_APP_HANA_TENANTDBNAME || 'HXE'; 
    let hdiAdminUser = this.$store.getters.config.config.hdiAdminUser || process.env.VUE_APP_HANA_HDIADMINUSER || 'HDI_ADMIN';
    let authUser = this.$store.getters.config.config.authUser || process.env.VUE_APP_HANA_AUTHUSER || 'SYSTEM';  
 
    return {
    loading : false,
    loadingMessage : '',
    apiResults : {},
    complete : false,
    error : {
      error : false,
      message : null,
      details : null
    },    
    adminOptions : [
      {
        option : "Create a User",
        // socket : true,
        description : "Create an SAP HANA DB User",
        loadingMessage : "Creating User...",
        dialog : false,
        component : CreateUser,
        data : { },
        endpoint : '/api/createUser',
        defaults : {
          dbServerNode : tenantDBNode,
          authUser : authUser,
          mustChange : false
        }
      },{
        option : "Reset User Password",
        // socket : true,
        description : "Reset SAP HANA DB User Password",
        loadingMessage : "Resetting User Password...",
        dialog : false,
        component : ResetPassword,
        data : { },
        endpoint : '/api/resetPassword',
        defaults : {
          dbServerNode : tenantDBNode,
          authUser : authUser,
          mustChange : false
        }
      },{
        option : "Grant Repo Role to User",
        // socket : true,
        description : "Grant HANA DB Repo Role to a User",
        loadingMessage : "Granting Role...",
        dialog : false,
        component : GrantRole,
        data : { },
        endpoint : '/api/grantRole',
        defaults : {
          dbServerNode : tenantDBNode,
          authUser : authUser,
          role : 'sap.bc.ina.service.v2.userRole::INA_USER'
        }
      },{
        option : "Enable a database service",
        description : "Enable dpserver, docstore, or scriptserver",
        loadingMessage : "Enabling Service...",
        dialog : false,
        component : EnableService,
        data : { },
        endpoint : '/api/enableService',
        defaults : {
          systemDBServerNode : systemDBNode,
          tenantDB : tenantDBName,
          authUser : authUser,
          tenantAuthUser : authUser,
          service : "dpserver"       
        }
      },{
        option : "Create DP Agent",
        description : "Create a Data Provisioning Agent (requires dpserver service)",
        loadingMessage : "Creating Agent...",
        dialog : false,
        component : CreateAgent,
        data : { },
        endpoint : '/api/createAgent',
        defaults : {
          dbServerNode : tenantDBNode,
          protocol : 'TCP',
          agentName : 'dpagent',
          port : '5050',
          host : 'dpagent.example.com',
          authUser : authUser       
        }
      },{
        option : "Create DP Adapter",
        description : "Create a Data Provisioning Adapter (requires dpserver service, and a DP Agent)",
        loadingMessage : "Creating Adapter...",
        dialog : false,
        component : CreateAdapter,
        data : { },
        endpoint : '/api/createAdapter',
        defaults : {
          dbServerNode : tenantDBNode,
          agentName : 'dpagent',
          adapter : 'OracleLogReaderAdapter',
          authUser : authUser       
        }
      },{
        option : "HDI Enable a Tenant DB",
        description : "Enable an SAP HANA DB for HDI",
        loadingMessage : "Enabling HDI...",
        dialog : false,
        component : EnableHDI,
        data : { },
        endpoint : '/api/enableHDI',
        defaults : {
          systemDBServerNode : systemDBNode,
          dbServerNode : tenantDBNode,
          authUser : authUser,
          tenantAuthUser : authUser,
          hdiAdmin : hdiAdminUser,
          tenantDB : tenantDBName
        }
      },{
        option : "Map External Host",
        description : "Map External Hostname/IP (Useful for Cloud, Docker-Machine Containers, and NATed HANA DBs)",
        loadingMessage : "Mapping...",
        dialog : false,
        component : MapExternalHost,
        data : { },
        endpoint : '/api/mapExternalHost',
        defaults : {
          dbServerNode : systemDBNode,
          authUser : authUser
        }
      },{
        option : "Add JWT Provider",
        description : "Add an external JWT IDP",
        loadingMessage : "Adding...",
        dialog : false,
        component : AddJWTProvider,
        data : { },
        endpoint : '/api/addJWTProvider',
        defaults : {
          dbServerNode : tenantDBNode,
          authUser : authUser,
          name : "MY_JWT_PROVIDER",
          issuer : "http://example.com:8080/uaa/oauth/token",
          claim : "user_name"
        }
      },{
        option : "Create Certificate Collection",
        description : "Create a certificate collection",
        loadingMessage : "Creating...",
        dialog : false,
        component : CreatePSE,
        data : { },
        endpoint : '/api/createPSE',
        defaults : {
          dbServerNode : tenantDBNode,
          authUser : authUser,
          name : "MyCertificateCollection",
          purpose : "JWT"
        }
      },{
        option : "Create Certificate",
        description : "Create a certificate",
        loadingMessage : "Creating...",
        dialog : false,
        component : CreateCertificate,
        data : { },
        endpoint : '/api/createCertificate',
        defaults : {
          dbServerNode : tenantDBNode,
          authUser : authUser,
          comment : "Certificate Comment",
          certificate :
`-----BEGIN CERTIFICATE-----
...
-----END CERTIFICATE-----`
        }
      }/*
      TODO
      ,{
        option : "Lock/Unlock Users",
        description : "Mass Lock or Unlock Users.  You may specify an exclude role.  Will not lock the Authorized User you use.",
        loadingMessage : "Running...",
        dialog : false,
        component : MassLockUsers,
        data : { },
        endpoint : '/api/massLockUsers',
        defaults : {
          dbServerNode : tenantDBNode,
          authUser : authUser,
          method : "unlock"
        }
      }*/
    ]
  };},
  components: {
    ErrorDialog
  }
}
</script>