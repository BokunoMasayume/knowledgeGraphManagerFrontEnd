// const {sayhi} = require('./sayhi');
import {sayhi} from './sayhi';
import Vue from 'vue/dist/vue.esm.js';

sayhi();

let app = new Vue({
    el:"#app",
    data:{
        fuck:"fuck the whole world"
    }
});