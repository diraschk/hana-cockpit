<template>
    <v-dialog v-model="value" persistent :width="width">
        <v-card>
            <v-card-title primary-title>
                <h3 class="headline mb-0" style="color:red;">{{title}}</h3>
            </v-card-title>
            <v-card-text>
                <span>{{message}}</span>
            </v-card-text>
            <v-card-text v-if="showDetails">
                <json-viewer theme="errDialog" v-if="isJson==true" :value="details"></json-viewer>
                <span v-if="isJson==false">{{details}}</span>
            </v-card-text>
            <v-card-actions>
                <v-btn v-if="allowClose" flat color="primary" @click="clickHandler">OK</v-btn>
                <v-btn flat color="error" @click="toggleHandler" primary v-if="this.details">{{this.btnShowDetails}}</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>
<script>
import JsonViewer from 'vue-json-viewer';
export default {
    name : 'ErrorDialog',
    components : { JsonViewer },
    methods : {
      toggleHandler() {
        this.showDetails = !this.showDetails;
      },
      clickHandler () {
          // v-model listening for 'input' event
          this.$emit('input', false);
      }
    },
    watch : {
        value () {
            // Hide the Show Details by default
            this.showDetails = false;
        }
    },
    computed : { 
      btnShowDetails(){
        if(this.showDetails){
            return "Hide Details";
        }else{
            return "Show Details";
        }
      },
      errorDetails (){
          if(typeof this.details == "object") return JSON.stringify(this.details);
          return this.details;
      },
      isJson (){
          return (typeof this.details == "object");
      }  
    },
    data () {
        return {
            showDetails : false
        }
    },
    props : {
        width : {
            type : [Number, String],
            default : "70%"
        },
        details : {
            type : [Error,Object,String],
            default : null
        },
        allowClose : {
            type : [Boolean],
            default : true
        },
        message : {
            type : [String],
            default : "An error occurred."
        },
        title : {
            type : [String],
            default : "Error"
        },
        value : {
            type : Boolean,
            default : false
        }
    }
}
</script>
<style scoped>
    .errDialog {
        background-color : clear;
    }
</style>