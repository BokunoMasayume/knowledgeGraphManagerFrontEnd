import {requireFactory} from './request';
import Vue from 'vue/dist/vue.esm';
import contextMenuHandler from "./contextMenu";
import forcedgraph from './forcedgraph';


// dynamic bars
//append file bar
window.addFileBar = document.createElement('div')
addFileBar.setAttribute('id','add-file-bar');
addFileBar.classList.add('file-tree-item');
addFileBar.addEventListener('click',function(e){
    e.stopPropagation();
})
let input = document.createElement('input')
input.setAttribute('type' , 'text');
input.setAttribute("placeholder","请输入文件名")
input.addEventListener('change' , function(e){
    app.appendFile(e.target.value.trim());
})
addFileBar.appendChild(input);

//append folder bar
window.addFolderBar = document.createElement('div')
addFolderBar.setAttribute('id','add-folder-bar');
addFolderBar.classList.add('file-tree-item');
addFolderBar.addEventListener('click',function(e){
    e.stopPropagation();
})
let input2 = document.createElement('input')
input2.setAttribute("placeholder","请输入文件夹名")
input2.setAttribute('type' , 'text');
input2.addEventListener('change',function(e){
    app.appendFolder(e.target.value.trim());
})
addFolderBar.appendChild(input2);

//append property bar
window.addPropBar = document.createElement('div')
addPropBar.setAttribute('id','add-prop-bar');
let input3 = document.createElement('input');
input3.setAttribute("placeholder","请输入属性名")
input3.setAttribute('type' , 'text');
input3.addEventListener('change',function(e){
    console.log("changed prop",e.target.value.trim());
    app.appendProp(e.target.value.trim());
})
addPropBar.appendChild(input3);

//append module group bar
window.addModulegroupBar = document.createElement('div');
addModulegroupBar.setAttribute('id','add-modulegroup-bar');
let input4 = document.createElement('input');
input4.setAttribute("placeholder","请输入模板类别名")
input4.setAttribute('type','text');
input4.addEventListener('change', function(e){
    app.postModulegroup(e.target.value.trim());
})
addModulegroupBar.appendChild(input4);

window.app = new Vue({
    el: "#app",

    data: {
        baseURL: "http://localhost:8889",
        visibleHandler:{
            signinbox:false,
            islogin:true,

            nodeModuleTag: true,
            relaModuleTag: true
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
        userModulegroups:[],

        graph:{
            relations:[],
            nodes:[]
        },

        currentFileEle :null,
        // currentFolderEle:null,

        currentProp :null,

        currentFile:null,
        currentFolder:null,
        currentModule:null,
        currentRelation:null,
        currentNode:null,
        current:null,

        // updated 3/14 for module group
        currentRelationModule:null,
        currentModuleGroup:null,

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
        },
        current:function(newcur){
            if(newcur !== this.currentFile && newcur !== this.currentFolder){
                if(addFileBar.parentElement)addFileBar.parentElement.removeChild(addFileBar);
                if(addFolderBar.parentElement)addFolderBar.parentElement.removeChild(addFolderBar);
              
            }
            this.currentProp = null;
        },
        ldrawerContent(){
            if(addFileBar.parentElement)addFileBar.parentElement.removeChild(addFileBar);
            if(addFolderBar.parentElement)addFolderBar.parentElement.removeChild(addFolderBar);
            if(addPropBar.parentElement)addPropBar.parentElement.removeChild(addPropBar);  
        },
        currentRelationName(){
            forcedgraph.updateSimu( this.graphnodes , this.graphrelations,true);
        }
    },

    computed:{
        currentModuleGroupPath:function(){
            let path = [];
            let cur = this.currentModuleGroup;
            while(cur){
                path.push(cur);
                //TODO use filter not very efficient
                cur = this.userModulegroups.filter((el)=>{return el.id === cur.parentId;})[0];
                console.log("cur",cur);
            }
            console.log(path);
            return path.reverse();
        },
        subModuleGroups:function(){
            
            return this.userModulegroups.filter((el)=>{

                return el.parentId===(this.currentModuleGroup?this.currentModuleGroup.id:null);
            })
        },
        currentNodeModules:function(){
            return this.userModules.filter((el)=>{
                return el.node&& el.groupId===(this.currentModuleGroup?this.currentModuleGroup.id:null);
            })
        },
        currentRelaModules:function(){
          return this.userModules.filter((el)=>{
              return !el.node && el.groupId===(this.currentModuleGroup?this.currentModuleGroup.id:null);
          })  
        },

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
        },

        currentRelationName:function(){
            return this.currentRelation?this.currentRelation.relaUnit.relationName:null;
        }
            
    },
    provide:function(){
        return {
            clickFile: this.clickFile,
            clickModule: this.clickModule,
            dragmodule: this.dragmodule,
            appendFile:this.appendFile,
            clickModuleGroup: this.clickModuleGroup
        }
    },
    
    methods:{
        backtoparent:function(){
            let cur = this.currentModuleGroup;
            if(!cur)return;
            cur = this.userModulegroups.filter((el)=>{return el.id === cur.parentId;})[0];
            if(cur)this.currentModuleGroup = cur;
            else this.currentModuleGroup = null;
        },
        clickModuleGroup:function(modulegroupobj){
            this.currentModuleGroup = modulegroupobj;
        },
        clickProp:function(name){
            this.currentProp = name;
        },
        clickNode:function(nodeobj){
            this.currentProp = null;

            this.currentNode = nodeobj;
            this.current = nodeobj;
            // console.log("click node",nodeobj);
        },
        clickRela:function(relaobj){
            this.currentProp = null;

            this.currentRelation = relaobj;
            this.current = relaobj;
        },
        clickLbar:function( btnstr ){
            // alert('click');
            this.ldrawerContent = this.ldrawerContent === btnstr?null:btnstr;            // let ct = event.currentTarget;
            
        },
        clickModule:function(moduleobj){
            this.currentProp = null;

            // console.log(this);
            this.current = moduleobj;
            this.currentModule  = moduleobj;
        },
        clickRelaModule:function(moduleobj){
            this.currentProp = null;
            if(!moduleobj.style)moduleobj.style={};
            console.log("in click rela module",moduleobj);
            this.current = moduleobj;
            this.currentRelationModule = moduleobj;
        },
        clickFile:function(fileobj ,e){
            this.currentProp = null;

            // console.log(this);
            this.current = fileobj;
            this.currentFileEle = e.currentTarget;

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
        scrollmodulegrouptag:function(e){
            console.log("scroll",e);
            let i;
            for(i=0 ;i<e.path.length;i++){
                if(e.path[i].classList.contains("modulegroup-tag-area"))break;
            }
            console.log(e.path[i])
            if(e.wheelDelta>0){
                e.path[i].scrollLeft -=10;
            }else{
                e.path[i].scrollLeft +=10;
            }
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
            //have on-focus file
            if(this.currentFile) forcedgraph.insertNode(node);
            else{alert("请先选择文件")}
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
        },
       
        //TODO upload image function 
        uploadimage:function(e){
            console.log("file",e);
            requireHandler.image.updateModule(this.currentModule.id,e.target.files[0])
            .then((response)=>{
                if(response.data){
                    Vue.set(this.currentModule,"avatarUri",response.data);
                }
            }).catch((err)=>{
                alert("上传文件失败");
            })
        },
        uploadcsv:function(e){
            if(this.currentFile == null){
                alert("请先选择文件");
                return;
            }

            let fr = new FileReader();
            fr.onload = function(e){
                let res = e.target.result.split("\n");
                res = res.map(e=>e.split(","));
                let map = {};
                res.forEach(e=>{
                    if(e.length!=3)return;
                    if(!map[e[0]]){
                        map[e[0]] = forcedgraph.insertNode({
                            id:-1,
                            labels:[e[0]],
                            mainLabel:e[0],
                            properties:{}
                        })
                    } 
                    if(!map[e[1]]){
                        map[e[1]] = forcedgraph.insertNode({
                            id:-1,
                            labels:[e[1]],
                            mainLabel:e[1],
                            properties:{}
                        })
                    } 

                    forcedgraph.insertEdge({
                        source: map[e[0]].id,
                        target: map[e[1]].id,
                        relaUnit:{
                            id:-1,
                            relationName:e[2],
                            properties:{}
                        }
                    })
                });

                
            }
            fr.readAsText(e.target.files[0]);
        },
        exportFile:function(){
            if(!this.currentFile){
                alert("请先选择文件");
                return;
            }
            let csv = "";
            this.graph.relations.forEach(e=>{
                csv += `${e.source.mainLabel},${e.target.mainLabel},${e.relaUnit.relationName}\n`
            });
            let a = document.createElement('a');
            //TODO utf8,\ufeff       ????
            a.href = "data:text/csv;charset=utf-8,"+encodeURIComponent(csv);
            a.download = this.currentFile.fileName+".csv";
            a.click();
        },
        appendNodeLabel:function(e){
            this.currentNode.labels.push(e.target.value);
        },

        /**
         * add file. if current is folder the file's parent the folder,
         * if current is file the files have same parent
         * if current is null , parent is null
         * @param {string} filename - filename of the added file
         */
        appendFile:function(filename){
            console.log('add file' , this.current, filename , addFileBar.parentElement.getAttribute('my-id'));
            requireHandler.file.addOne({
                fileName: filename,
                folder:false,
                // parentId: app.current===null?null:(app.current===app.currentFile?app.currentFile.parentId:app.currentFolder.id)
                parentId: addFileBar.parentElement.parentElement.getAttribute('my-id')?addFileBar.parentElement.parentElement.getAttribute('my-id'):null
            }).then((response)=>{
                if(response.data){
                    this.userFiles.push(response.data);
                }
            }).finally(()=>{
                addFileBar.parentElement.removeChild(addFileBar);

            })
        },
        showFileBar:function(){
            if(addFileBar.parentElement)addFileBar.parentElement.removeChild(addFileBar);
            if(addFolderBar.parentElement)addFolderBar.parentElement.removeChild(addFolderBar);
            
            if(this.currentFileEle===null){
                document.querySelector('.filetree').appendChild(addFileBar);
            }else if(this.current=== this.currentFile){
                //have same parent
                this.currentFileEle.parentElement.parentElement.appendChild(addFileBar);
            }else{
                this.currentFileEle.parentElement.querySelectorAll('div')[1].appendChild(addFileBar);
            }
        },

        /**
         * add folder
         * @param {string} foldername 
         */
        appendFolder:function(foldername){
            requireHandler.file.addOne({
                fileName: foldername,
                folder:true,
                // parentId: app.current===null?null:(app.current===app.currentFile?app.currentFile.parentId:app.currentFolder.id)
                parentId: addFolderBar.parentElement.parentElement.getAttribute('my-id')?addFolderBar.parentElement.parentElement.getAttribute('my-id'):null
            }).then((response)=>{
                if(response.data){
                    this.userFiles.push(response.data);
                }
            }).finally(()=>{
                addFolderBar.parentElement.removeChild(addFolderBar);

            })
        },
        showFolderBar:function(){
            if(addFileBar.parentElement)addFileBar.parentElement.removeChild(addFileBar);
            if(addFolderBar.parentElement)addFolderBar.parentElement.removeChild(addFolderBar);
            
            if(this.current===null){
                document.querySelector('.filetree').appendChild(addFolderBar);
            }else if(this.current=== this.currentFile){
                //have same parent
                this.currentFileEle.parentElement.parentElement.appendChild(addFolderBar);
            }else{
                this.currentFileEle.parentElement.querySelectorAll('div')[1].appendChild(addFolderBar);
            }
        },
        deleteFile:function(){
            if(this.current && (this.current===this.currentFile || this.current=== this.currentFolder)){
                requireHandler.file.deleteOne(this.current.id)
                .then((response)=>{
                    if(response.data && response.data.id){
                        this.userFiles = this.userFiles.filter(f=>f.id!==response.data.id);
                    }
                })
                // .finally(()=>{
                //     addFolderBar.parentElement.removeChild(addFolderBar);

                // })
            }
        },
        requestFiles:function(){
            document.querySelector("#refreshpath").classList.add('refreshing');
            requireHandler.file.getAll().then(response=>{
                if(response.data){
                    this.userFiles = response.data;
                }
            }).finally(()=>{
                document.querySelector("#refreshpath").classList.remove('refreshing');

            });
        },

        showPropBar:function(){
            if(addPropBar.parentElement)addPropBar.parentElement.removeChild(addPropBar);

            if(this.current && this.current ===this.currentModule){
                document.querySelector('.rd-module').querySelector('.user-props').appendChild(addPropBar);

            }else if( this.current && this.current=== this.currentNode){
                document.querySelector('.rd-node').querySelector('.user-props').appendChild(addPropBar);

            }else if(this.current && this.current === this.currentRelation){
                document.querySelector('.rd-rela').querySelector('.user-props').appendChild(addPropBar);
            }else if(this.current && this.current === this.currentRelationModule){
                document.querySelector('.rd-rela-module').querySelector('.user-props').appendChild(addPropBar);

            }
        },
        appendProp:function(propname){
            if(this.current && this.current ===this.currentModule){
                // console.log(">>>",propname)
                if(!this.currentModule.properties)Vue.set(this.currentModule , "properties" ,{});
                Vue.set(this.currentModule.properties, propname, {default:"", contraint:"string"} );
            }else if(this.current && this.current=== this.currentRelationModule){
                if(!this.currentRelationModule.properties)Vue.set(this.currentRelationModule , "properties" ,{});
                Vue.set(this.currentRelationModule.properties, propname, {default:"", contraint:"string"} );
            }else if( this.current && this.current=== this.currentNode){
                if(!this.currentNode.properties)Vue.set(this.currentNode , "properties" ,{});
                
                Vue.set(this.currentNode.properties, propname, null);
            }else if(this.current && this.current === this.currentRelation){
                if(!this.currentRelation.relaUnit.properties)Vue.set(this.currentRelation.relaUnit , "properties" ,{});

                Vue.set(this.currentRelation.relaUnit.properties, propname, null);
            }
            if(addPropBar.parentElement)addPropBar.parentElement.removeChild(addPropBar);

        },
        deleteProp:function(){
            if(addPropBar.parentElement)addPropBar.parentElement.removeChild(addPropBar);
            if(this.current && this.current ===this.currentModule){
                Vue.delete(this.currentModule.properties, this.currentProp );
            }else if(this.current && this.current=== this.currentRelationModule){
                Vue.delete(this.currentRelationModule.properties, this.currentProp );
            }else if( this.current && this.current=== this.currentNode){
                Vue.delete(this.currentNode.properties, this.currentProp);
            }else if(this.current && this.current === this.currentRelation){
                Vue.delete(this.currentRelation.relaUnit.properties, this.currentProp);
            }
        } ,

        postmodule:function(isRela){
            requireHandler.module.addOne({
                labelName:  "tmp"+ new Date().getTime(),
                groupId: this.currentModuleGroup?this.currentModuleGroup.id:null,
                node:isRela?false:true,
                style:{
                    stroke:'rgb(9, 109, 190)',
                    'marker-end':'#arrow'
                }
            }).then((res)=>{
                if(res.data){
                    this.userModules.push(res.data);
                    if(res.data.node)this.current = this.currentModule = res.data;
                    else this.current = this.currentRelationModule = res.data;
                    this.moduleMap[this.current.labelName] = this.current;
                }
            }).catch(()=>{alert('添加模板失败')})
        },
        deletemodule:function(isRela){
            requireHandler.module.deleteOne(isRela?this.currentRelationModule.id:this.currentModule.id)
                .then((res)=>{
                    if(res.data){
                        // console.log("dele mod",res.data);
                        this.userModules= this.userModules.filter((ele)=>{
                            return ele.id !== res.data.id;
                        })
                    }
                })
        },
        patchmodule:function(isRela){
            let mod = isRela?this.currentRelationModule:this.currentModule;
            requireHandler.module.patchOne(isRela?this.currentRelationModule.id:this.currentModule.id, {
                rawMap:{
                    properties:mod.properties,
                    avatarUri : mod.avatarUri,
                    labelName: mod.labelName,
                    describe: mod.describe,
                    // node: this.currentModule.node,
                    abstr: mod.abstr,
                    parentIds: mod.parentIds,
                    style:mod.style
                }
            }).then(res=>{
                if(res.data){
                    this.moduleMap[res.data.labelName] = res.data;
                }else{
                    alert("更新模板失败");

                }
            }).catch(err=>{
                alert("更新模板失败");
            })
        },

        postnode:function(){
            if(this.currentNode.id>=0 || !this.currentFile)return;
            let node  = this.currentNode;
            requireHandler.graph.node.addOne(this.currentFile.id , {
                labels: this.currentNode.labels,
                mainLabel: this.currentNode.mainLabel,
                properties: this.currentNode.properties

            }).then((response)=>{
                if(response.data){
                    node.id = response.data.id;
                }
                else{
                    alert("添加节点失败");
                }
            }).catch(err=>{
                alert("添加节点失败");
            });
        },

        patchnode:function(){
            if(this.currentNode.id<0 || !this.currentFile)return;

            requireHandler.graph.node.patchOne(this.currentFile.id,this.currentNode.id , {
                labels: this.currentNode.labels,
                mainLabel: this.currentNode.mainLabel,
                properties: this.currentNode.properties

            }).then((response)=>{
                if(response.data){
                    // node.id = response.data.id;
                }
                else{
                    alert("更新节点失败");
                }
            }).catch(err=>{
                alert("更新节点失败");
            });
        },

        deletenode:function(){
            if(this.currentNode.id<0){
                this.graph.nodes.splice(this.currentNode.index, 1);
                this.graph.relations = this.graph.relations.filter((ele)=>{
                    return (ele.source.id!==this.currentNode.id && ele.target.id!==this.currentNode.id);
                })
                return;
            }
            if(  !this.currentFile)return;
            let node = this.currentNode;
            requireHandler.graph.node.deleteOne(this.currentFile.id, this.currentNode.id)
            .then(response=>{
                if(response.data){
                    this.graph.nodes.splice(this.currentNode.index, 1);
                    this.graph.relations = this.graph.relations.filter((ele)=>{
                        return (ele.source.id!==this.currentNode.id && ele.target.id!==this.currentNode.id);
                    })
                    //delete attached relations , so refresh
                    // this.clickFile(this.currentFile, {currentTarget:this.currentFileEle});

                }else{
                    alert("删除节点失败")
                }
            }).catch(err=>{
                alert("删除节点失败")
            })
        },
        postrela: function(){
            if(this.currentRelation.relaUnit.id>=0 || !this.currentFile)return;
            if(this.currentRelation.source.id<0 || this.currentRelation.target.id<0){
                alert("请先添加相关节点")
                return;
            }

            let rela = this.currentRelation;
            requireHandler.graph.rela.addOne(this.currentFile.id , {
                source: rela.source.id,
                target: rela.target.id,
                relaUnit: rela.relaUnit
            }).then((response)=>{
                if(response.data){
                    rela.relaUnit.id = response.data.id;
                }
            })
        },

        patchrela:function(){
            if(this.currentRelation.relaUnit.id<0 || !this.currentFile)return;
            let rela = this.currentRelation;
            requireHandler.graph.rela.patchOne(this.currentFile.id , this.currentRelation.relaUnit.id, {
                // source: rela.source.id,
                // target: rela.target.id,
                // relaUnit: rela.relaUnit
                relationName: rela.relaUnit.relationName,
                properties: rela.relaUnit.properties
            })
        },

        deleterela:function(){
            if(this.currentRelation.relaUnit.id<0){
                this.graph.relations.splice(this.currentRelation.index , 1);
                return;

            }
            if( !this.currentFile)return;
            let rela = this.currentRelation;
            requireHandler.graph.rela.deleteOne(this.currentFile.id, this.currentRelation.relaUnit.id )
            .then(response=>{
                if(response.data){
                    this.graph.relations.splice(rela.index , 1);
                }
            })
        },

        addOrUpdateBtn: function(){
            if(this.current === this.currentNode){
                //for node
                if(this.current.id<0){
                    this.postnode();
                }else{
                    this.patchnode();
                }
            }
            if(this.current=== this.currentRelation){
                //for relationship
                if(this.current.relaUnit.id<0){
                    this.postrela();
                }else{
                    this.patchrela();
                }
            }
        },

        saveAll:function(){
            // console.log("in save all" , e.key)

            // if(e.key!='s')return;
            //node
            let nodeprolis = [];
            for(let i=0 ;i<this.graph.nodes.length;i++){
                let node = this.graph.nodes[i];
                if(node.id<0){
                    nodeprolis.push(  requireHandler.graph.node.addOne(this.currentFile.id , {
                        labels: node.labels,
                        mainLabel: node.mainLabel,
                        properties: node.properties
        
                    })  );
                }else{

                    nodeprolis.push( requireHandler.graph.node.patchOne(this.currentFile.id,node.id , {
                        labels: node.labels,
                        mainLabel: node.mainLabel,
                        properties: node.properties
        
                    })  );
                }
            }
            //rela
            Promise.all(nodeprolis).then((responses)=>{
                for(let i=0 ;i<responses.length;i++){
                    this.graph.nodes[i].id = responses[i].data.id;
                    console.log("after node saved ",responses[i].data)
                }

                let relaprolis = [];

                for(let i=0; i<this.graph.relations.length;i++){
                    let rela = this.graph.relations[i];
                    if(rela.relaUnit.id<0){
                        if(rela.source.id<0 || rela.target.id<0){
                            alert("请先添加相关节点")
                            return;
                        }
                        relaprolis.push( requireHandler.graph.rela.addOne(this.currentFile.id , {
                            source: rela.source.id,
                            target: rela.target.id,
                            relaUnit: rela.relaUnit
                        }) );
                    }else{
                        relaprolis.push( requireHandler.graph.rela.patchOne(this.currentFile.id , rela.relaUnit.id, {
                            // source: rela.source.id,
                            // target: rela.target.id,
                            // relaUnit: rela.relaUnit,
                            relationName: rela.relaUnit.relationName,
                            properties: rela.relaUnit.properties
                        })  );
                    }
                }

                return Promise.all(relaprolis);

            }).then(()=>{
                this.clickFile(this.currentFile, {currentTarget:this.currentFileEle});
            }).catch(()=>{
                alert("保存失败")
            });
        },
        showModulegroupBar:function(){
            if(addModulegroupBar.parentElement)addModulegroupBar.parentElement.removeChild(addModulegroupBar);
            document.querySelector('#submodulegroup-area').appendChild(addModulegroupBar);
        },
        postModulegroup:function(modulegroupname){
            requireHandler.module.group.addOne({
                groupName:modulegroupname,
                parentId:this.currentModuleGroup?this.currentModuleGroup.id:null
            }).then(response=>{
                if(response.data){
                    this.userModulegroups.push(response.data);
                }
            }).finally(()=>{
                addModulegroupBar.parentElement.removeChild(addModulegroupBar);
            });
        },
        deleteModulegroup:function(){
            if(!this.currentModuleGroup){
                alert("未选中要删除的分组");
                return;
            }
            requireHandler.module.group.deleteOne(this.currentModuleGroup.id)
            .then(response=>{
                if(response.data){
                    this.userModulegroups = this.userModulegroups.filter(mg=>mg.id!=response.data.id);
                    this.backtoparent();
                }
                else{
                    alert("删除操作未成功，不能删除有子分组的分组");
                }
            }).catch(()=>{
                alert("删除操作不成功，不能删除仍有模板的分组")
            });
        }

    },

    components:{
        "module-group-item":{
            name: "module-group-item",
            template:`
                <div @click.stop="clickModuleGroup(groupobj)" class="module-group-item">
                    <svg viewBox="-100 -100 1024 1024" width="20" height="20">
                        <path  class='foldericon' d="M807.86 256.55H542v-38.56c0-66.17-53.83-120-120-120H131.17c-16.54 0-29.97 13.39-30 29.94l-0.41 203.56c0 1.5 0.11 2.98 0.32 4.43l-0.9 467.44c0 66.17 53.83 120 120 120h587.69c66.17 0 120-53.83 120-120V376.55c-0.01-66.16-53.84-120-120.01-120zM422 157.99c33.08 0 60 26.92 60 60v38.56H160.91l0.2-98.56H422z m445.86 645.37c0 33.08-26.92 60-60 60H220.17c-33.08 0-60-26.92-60-59.94l0.94-486.87h646.75c33.08 0 60 26.92 60 60v426.81z" ></path>                      
                    </svg>
                    {{groupobj.groupName}}  
                </div>
            `,
            props:['groupobj'],
            inject:["clickModuleGroup"]
        },

        "user-prop-item":{
            name: "user-prop-item",
            template:`
            <div>
                <div>
                <label :for="'user-module-prop'+index"><slot></slot></label>
                </div>
                <div>
                <input v-if="selfcont==='number' || !propcontraint&& (typeof objprop ==='number' || objprop instanceof Number) ||( propcontraint && propcontraint==='number')" type="number" :id="'user-module-prop'+index"  :value="objprop" @change="$emit('update:objprop',new Number($event.target.value))">
                <input v-else-if="selfcont==='string' || !propcontraint &&(typeof objprop ==='string' || objprop instanceof String) || ( propcontraint && propcontraint==='string')" :id="'user-module-prop'+index"  :value="objprop" @change="$emit('update:objprop',$event.target.value.trim())"></input>
                
                <div v-else >
                   是<input type='radio' :id="'user-module-prop-true'+index"  :checked="objprop"  @change="$emit('update:objprop',$event.target.checked)"></input>
                    否<input type='radio' :id="'user-module-prop-false'+index"  :checked="!objprop" @change="$emit('update:objprop',!$event.target.checked)"></input>
                </div>
                </div>
                <div>
                <select v-if="propcontraint"  v-model='propcontraint'>
                    <option value='string'>string</option>
                    <option value='boolean'>boolean</option>
                    <option value='number'>number</option>
                </select>
                <select v-else  v-model='propcontraint'>
                    <option  value='string'>string</option>
                    <option value='boolean'>boolean</option>
                    <option value='number'>number</option>
                </select>
                </div>
            </div>
            `,
            data:function(){
                return {
                    selfcont:null
                };
            },
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
                <div @contextmenu="testmenu(moduleobj, $event)" @click.stop="clickModule(moduleobj);" @dragstart="dragmodule(moduleobj,$event)" :class="{'module-item':true, 'focus':$root.currentModule && $root.currentModule.id===moduleobj.id}">
                    <div class='avatar'>
                        <svg width="40" height="40" viewBox="0 0 50 50">
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
                <div :my-id="fileobj.id" :class="{ 'focus':isCurrent(fileobj.id) , 'file-tree-item':true, 'file-tree-folder':fileobj.folder, 'file-tree-file':!fileobj.folder}">
                    <div @click.stop="clickFile(fileobj,$event);foldChildren = !foldChildren" class="file-tree-node">
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
                return Promise.all([ requireHandler.userInfo() , requireHandler.file.getAll() , requireHandler.module.getAll(),requireHandler.module.group.getAll()  ]);
            }).then((responses)=>{
                this.userInfo = responses[0].data;
                this.userFiles = responses[1].data;
                this.userModules = responses[2].data;
                this.userModulegroups = responses[3].data;
            }).catch(()=>{
                alert("获取用户信息失败，请重新登录");
                this.visibleHandler.signinbox = true;
            });

        }else{
            //just request user information
            Promise.all([ requireHandler.userInfo() , requireHandler.file.getAll() , requireHandler.module.getAll() ,requireHandler.module.group.getAll()   ])
            .then((responses)=>{
                this.userInfo = responses[0].data;
                this.userFiles = responses[1].data;
                this.userModules = responses[2].data;
                this.userModulegroups = responses[3].data;

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



document.body.addEventListener('keyup' , function(e){
    console.log("keyup",e)
    if(e.ctrlKey && e.shiftKey && e.code=='KeyS'){
        app.saveAll();
    }
})

document.body.addEventListener('keyup' , function(e){
    console.log("keyup",e)
    if(e.ctrlKey && e.shiftKey && e.code=='KeyE'){
        app.exportFile();
    }
})


