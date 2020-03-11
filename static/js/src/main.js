// import {requestHandler} from './request';
import {requireFactory} from './request';
import Vue from 'vue/dist/vue.esm';
import contextMenuHandler from "./contextMenu";
import forcedgraph from './forcedgraph';

// forcedgraph.genforceSimu('#main' [],[]),

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

        currentFileEle :null,


        currentFile:null,
        currentFolder:null,
        currentModule:null,
        currentRelation:null,
        currentNode:null,
        current:null,

        moduleMap:{},
        

        //the value is the template name
        ldrawerContent:"filetree"//or module or search or null
    },
    watch:{
        graphnodes:function(newnodes){
            forcedgraph.genforceSimu('#main' , newnodes , this.graph.relations);
            console.log("graph node changed");
        },
        graphrelations:function(newrelas){
            forcedgraph.genforceSimu('#main' , this.graph.nodes , newrelas);
            console.log("graph node changed");
        },
        userModules:function(module){
            module.forEach((e)=>{
                this.moduleMap[e.labelName] = e;
            })
        }
    },

    computed:{
        graphnodes:function(){
            return this.graph.nodes;
        },
        graphrelations:function(){
            return this.graph.relations;
        },
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
            clickFile: this.clickFile,
            clickModule: this.clickModule,
            dragmodule: this.dragmodule
        }
    },
    
    methods:{
        clickNode:function(nodeobj){
            this.currentNode = nodeobj;
            this.current = nodeobj;
            // console.log("click node",nodeobj);
        },
        clickRela:function(relaobj){
            this.currentRelation = relaobj;
            this.current = relaobj;
        },
        clickLbar:function( btnstr ){
            // alert('click');
            this.ldrawerContent = this.ldrawerContent === btnstr?null:btnstr;            // let ct = event.currentTarget;
            
        },
        clickModule:function(moduleobj){
            // console.log(this);
            this.current = moduleobj;
            this.currentModule  = moduleobj;
        },
        clickFile:function(fileobj){
            // console.log(this);
            this.current = fileobj;

            if(fileobj.folder){
                this.currentFolder = fileobj;
                return;
            }
            this.currentFile = fileobj;
            
            Promise.all([requireHandler.graph.rela.getAll(fileobj.id) , requireHandler.graph.node.getAll(fileobj.id)])
            .then(responses=>{
                // console.log("click file this", this);
                this.graph.relations = responses[0].data;
                this.graph.nodes = responses[1].data;
            }).catch(()=>{
                alert("点文件不好使的");
            }) 
        },
        dragmodule:function(moduleobj, e){
            console.log("drag", moduleobj);
            e.dataTransfer.setData('text/plain' , JSON.stringify(moduleobj));
        },
        canvasdragover:function(e){
            e.preventDefault();
        },
        canvasdrop:function(e){
            e.preventDefault();
            let moduleobj =JSON.parse(e.dataTransfer.getData('text/plain'));
            let node = {
                x:e.offsetX,
                y:e.offsetY,
                id:-1,
                //TODO covert module 's parent id to labelname and add it into labels
                labels:[moduleobj.labelName],
                mainLabel:moduleobj.labelName,
                properties:{}
            }
            for(let prop in moduleobj.properties){
                node.properties[prop] = moduleobj.properties[prop].default;
            }
            //have on focus file
            if(this.currentFile) forcedgraph.insertNode(node);
            console.log("drop",node);
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
        "user-prop-item":{
            name: "user-prop-item",
            template:`
            <div>
                <label :for="'user-module-prop'+index"><slot></slot></label>
                <input v-if=" propcontraint==='number' || typeof objprop ==='number' || objprop instanceof Number" type="number" :id="'user-module-prop'+index"  :value="objprop" @change="$emit('update:objprop',new Number($event.target.value))">
                <div v-else-if="propcontraint==='boolean' || typeof objprop ==='boolean' || objprop instanceof Boolean" >
                    <input type='radio' :id="'user-module-prop-true'+index"  :checked="objprop"  @change="$emit('update:objprop',$event.target.checked)"></input>
                    <input type='radio' :id="'user-module-prop-false'+index"  :checked="!objprop" @change="$emit('update:objprop',!$event.target.checked)"></input>
                </div>
                <input v-else :id="'user-module-prop'+index"  :value="objprop" @change="$emit('update:objprop',$event.target.value)"></input>
                <select v-if="propcontraint" v-model='propcontraint'>
                    <option>string</option>
                    <option>boolean</option>
                    <option>number</option>
                </select>
            </div>
            `,
            props:['objprop' , 'index','propcontraint'],
            watch:{
                propcontraint:function(newval){
                    this.$emit("update:propcontraint",newval);
                }
            }
        },

        "module-item":{
            name:"module-item",
            template:`
                <div @contextmenu="testmenu(moduleobj, $event)" @click="clickModule(moduleobj);" @dragstart="dragmodule(moduleobj,$event)" :class="{'module-item':true, 'focus':$root.currentModule && $root.currentModule.id===moduleobj.id}">
                    <div class='avatar'>
                        <svg width="30" height="30" viewBox="0 0 50 50">
                            <image :xlink:href="moduleobj.avatarUri?$root.baseURL+'/image/'+moduleobj.avatarUri:'./static/moduleavatar.png'" width="50" height="50" />
                            <circle r="24" cx="25"  cy="25" class="circleclippath" /> 
                        </svg>
                    </div>
                    <div class='labelname'>
                        {{moduleobj.labelName}}
                    </div>
                </div>
            `,
            inject:['clickModule' ,'dragmodule'],
            props:['moduleobj'],
            methods:{
                testmenu:function(obj , e){
                    contextMenuHandler.setCurrentObj(obj);
                    contextMenuHandler.menuhandler("modulemenu",e);
                    e.preventDefault();
                }
            }

        },
        
        "file-tree-item":{
            name:"file-tree-item",
            template:`
                <div :class="{ 'focus':isCurrent(fileobj.id) , 'file-tree-item':true, 'file-tree-folder':fileobj.folder, 'file-tree-file':!fileobj.folder}">
                    <div @click.stop="clickFile(fileobj);foldChildren = !foldChildren" class="file-tree-node">
                        <svg viewBox="-100 -100 1024 1024" width="20" height="20">
<path v-if='!fileobj.folder' class='fileicon' d="M733.6228025 357.50476098L604.7119751 228.65325904V357.50476098h128.9108274zM542.89904809 419.30285644V203.00952125h-247.19238329c-8.68634009 0-16.01806641 2.98608422-21.96551513 8.96319604-5.96228028 5.97216773-8.92858886 13.28411842-8.92858888 21.93585205v556.18286133c0 8.65173364 2.96630859 16.06750512 8.92858888 21.94079613 5.94250464 5.97216773 13.27917504 8.95825195 21.96057176 8.95825195h432.59655714c8.71105981 0 16.02795386-2.98608422 21.98034668-8.96319604 5.92272973-5.86834693 8.90881324-13.28411842 8.90881396-21.93585204v-370.78857422H542.89904809zM295.72149634 141.21142578h308.99047876L820.99047875 357.50476098v432.58666968c0 25.54486108-9.04724122 47.48071313-27.14172363 65.50598122-18.10931396 18.1290896-39.9462893 27.19116234-65.55541992 27.19116234h-432.5866704c-25.56958008 0-47.42633033-9.06207276-65.5356443-27.19116234C212.06170654 837.57214379 203.00952125 815.63629174 203.00952125 790.09143067V233.90856933C203.00952125 208.36370826 212.06170654 186.53167701 230.1710205 168.40258813S270.13708472 141.21142578 295.7066648 141.21142578h0.01977563z" ></path>
<path v-if='fileobj.folder' class='foldericon' d="M807.86 256.55H542v-38.56c0-66.17-53.83-120-120-120H131.17c-16.54 0-29.97 13.39-30 29.94l-0.41 203.56c0 1.5 0.11 2.98 0.32 4.43l-0.9 467.44c0 66.17 53.83 120 120 120h587.69c66.17 0 120-53.83 120-120V376.55c-0.01-66.16-53.84-120-120.01-120zM422 157.99c33.08 0 60 26.92 60 60v38.56H160.91l0.2-98.56H422z m445.86 645.37c0 33.08-26.92 60-60 60H220.17c-33.08 0-60-26.92-60-59.94l0.94-486.87h646.75c33.08 0 60 26.92 60 60v426.81z" ></path>
                        
                        </svg>
                    {{fileobj.fileName}}</div>
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
                },
                isCurrent:function(fileid){
                    return app.currentFile && app.currentFile.id===fileid;
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
        /**
         * user login signup
         */
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
        
        /**
         * @todo registe shortcuts
         */

        
    }
});

//@todo patch post delete methods relate to btn
//      drag drop create graph
//      props show and enable to change


