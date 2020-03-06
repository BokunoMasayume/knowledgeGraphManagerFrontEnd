// import {requestHandler} from './request';
import {requireFactory} from './request';
import Vue from 'vue/dist/vue.esm';

window.app = new Vue({
    el: "#app",

    data: {
        visibleHandler:{
            signinbox:true,
            islogin:true
        },
        input:{
            uname:"1",
            pword:"1",
            pwordrep:""
        },
        content:{
            signWarn:""
        },
        classStatus:{
            isSignboxError:false
        }
       
    },

    computed:{
        isSignboxWarn:function(){
            this.content.signWarn="";
            this.classStatus.isSignboxError = false;
            if(this.input.uname===""){
                this.content.signWarn= "用户名不能为空";
            }else if(this.input.pword===""){
                this.content.signWarn= "密码不能为空";
            }else if(this.visibleHandler.islogin===false){
                if(this.input.pwordrep===""){
                    this.content.signWarn= "请确认密码";
                }else if(this.input.pword !== this.input.pwordrep){
                    this.content.signWarn= "俩次输入密码不相同";
                }
            }
            return this.input.uname==='' || this.input.pword===''||(!this.visibleHandler.islogin &&this.input.pword!==this.input.pwordrep);
        }
            
    },

    methods:{
        canLogin:function(){
            if(this.isSignboxWarn){
                return false;
            }
            return true;
        },
        canSignin:function(){
            if(this.isSignboxWarn){
                return false;
            }
            return true;
        },
        login:function(){
            if(!this.canLogin())return false;
            requireHandler.login({
                username:this.input.uname,
                password:this.input.pword
            }).then((response)=>{
                console.log("got token",response.data);
                this.visibleHandler.signinbox = false;
                this.classStatus.isSignboxError= false;
            })
            .catch((err)=>{
                console.log("error:",err);
                this.classStatus.isSignboxError= true;

                this.content.signWarn = "用户不存在或密码错误";
            });

        },
        signup:function(){
            if(!this.canSignin())return false;

            requireHandler.signup({
                username:this.input.uname,
                password:this.input.pword
            }).then(()=>{
                this.visibleHandler.islogin = true;
                this.classStatus.isSignboxError= false;

            }).catch(()=>{
                this.classStatus.isSignboxError= true;

                this.content.signWarn = "用户名已存在";
            });
        }


    
    },

    created:function(){
        window.requireHandler = requireFactory(function(){
            app.visibleHandler.signinbox = true;
        });
    }
});

