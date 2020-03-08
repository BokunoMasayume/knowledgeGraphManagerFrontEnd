// import {requestHandler} from './request';
import {requireFactory} from './request';
import Vue from 'vue/dist/vue.esm';

window.app = new Vue({
    el: "#app",

    data: {
        baseURL: "http://localhost:8889",
        visibleHandler:{
            signinbox:false,
            islogin:true
        },
        input:{
            uname:"",
            pword:"",
            pwordrep:""
        },
        content:{
            signWarn:""
        },
        classStatus:{
            isSignboxError:false
        },

        userInfo:{

        },

        userFiles:[],

        userModules:[],

        graph:{
            relations:[],
            nodes:[]
        },

        
        currentFile:null,
        currentModule:null,
        currentRelation:null,
        currentNode:null,

        //the value is the template name
        ldrawerContent:"file-tree"//or module or search
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
    provide:function(){
        return {
            clickFile: this.clickFile
        }
    },
    methods:{
        clickLbar:function(b ){
            this.ldrawerContent = this.ldrawerContent===btnname?null:btnname;

        },
        clickFile:function(fileobj){
            this.currentFile = fileobj;
            if(fileobj.folder){
                return;
            }
            Promise.all([requireHandler.graph.rela.getAll(fileobj.id) , requireHandler.graph.node.getAll(fileobj.id)])
            .then(responses=>{
                // console.log("click file this", this);
                this.graph.relations = responses[0].data;
                this.graph.nodes = responses[1].data;
            }).catch(()=>{
                alert("点文件不好使的");
            }) 
        },
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

                return Promise.all([ requireHandler.userInfo() , requireHandler.file.getAll() , requireHandler.module.getAll()  ])
                
            })
            .then((responses)=>{
                this.userInfo = responses[0].data;
                this.userFiles = responses[1].data;
                this.userModules = responses[2].data;
            })
            .catch((err)=>{
                console.log("error:",err);
                this.classStatus.isSignboxError= true;

                this.content.signWarn = "用户不存在或密码错误";
            });

            //request other messages

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
        },

        getFileChildren:function(fileid){
            return this.userFiles.filter((ele)=>{
                return ele.parentId === fileid;
            });
        }


    
    },

    components:{
        
        "file-tree-item":{
            name:"file-tree-item",
            template:`
                <div :class="{'file-tree-item':true, 'file-tree-folder':fileobj.folder, 'file-tree-file':!fileobj.folder}">
                    <div @click="clickFile(fileobj);foldChildren = !foldChildren" class="file-tree-node">{{fileobj.fileName}}</div>
                    <div v-if="fileobj.folder" v-show="foldChildren">
                        <file-tree-item v-for="file in getChildren(fileobj.id)" :fileobj="file"></file-tree-item>
                    </div>
                </div>
            `,
            data:function(){
                return { foldChildren:false };
            },
            props:['fileobj'],
            inject:['clickFile'],
            methods:{
                getChildren:function(fileid){
                    return app.userFiles.filter((ele)=>{
                        return ele.parentId === fileid;
                    });
                }
            }
            
        }
    },

    created:function(){
        window.requireHandler = requireFactory(function(){
            app.visibleHandler.signinbox = true;
        });
    },

    mounted:function(){
        let gap = new Date().getTime() - window.localStorage.getItem('tokenissuedate');
        if( !window.localStorage.getItem('token') || !window.localStorage.getItem('tokenissuedate') || gap >= 3*24*60*60*1000){
            //more than 3 days or never login, needs login
            //and then request user information

            this.visibleHandler.signinbox = true;
        }else if(gap >= 24*60*60*1000){
            //more than 1 day , need refresh token
            //and then request user information , userinfo , userfiles and usermodules

            requireHandler.refreshToken().then(()=>{
                return Promise.all([ requireHandler.userInfo() , requireHandler.file.getAll() , requireHandler.module.getAll()  ]);
            }).then((responses)=>{
                this.userInfo = responses[0].data;
                this.userFiles = responses[1].data;
                this.userModules = responses[2].data;
            }).catch(()=>{
                alert("fail to refresh token and get your info");
                this.visibleHandler.signinbox = true;
            });

        }else{
            //just request user information
            Promise.all([ requireHandler.userInfo() , requireHandler.file.getAll() , requireHandler.module.getAll()  ])
            .then((responses)=>{
                this.userInfo = responses[0].data;
                this.userFiles = responses[1].data;
                this.userModules = responses[2].data;
            }).catch(()=>{
                alert("fail to refresh token and get your info");
                this.visibleHandler.signinbox = true;
            });
        }
        
        
        
    }
});

