const axios = require('axios');

function requireFactory(showcallback) {
    let APIaxios = axios.create({
        baseURL: "http://localhost:8889"
        // headers:{
        //     common:{//for all methods ,others like post get e.g.
        //         // 'Authorization':null
        //     },
        //     // post:{
        //     // }
        // }
    });

    function setAuthor(token) {
        APIaxios.defaults.headers.common['Authorization'] = 'Bearer ' + token;
    }

    setAuthor(window.localStorage.getItem('token'));

    APIaxios.interceptors.response.use(function (response) {
        if (response.data.token && (response.config.url == "/auth/login" || response.config.url == "auth/refresh")) {
            setAuthor(response.data.token);
            window.localStorage.setItem('token',response.data.token);
            window.localStorage.setItem('tokenissuedate' , new Date().getTime());
        }
        return response;

    },function(error){
        if(error.response.status ===403  || error.response.status===401){
            showcallback();
        }
        return Promise.reject(error);
    });




    function test(user) {
        let para = new URLSearchParams();
        para.append('username', user.username);
        para.append('password', user.password);
        return APIaxios.post('/auth/login', para, {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        });
    }

    function login(user) {
        let para = new URLSearchParams();
        para.append('username', user.username);
        para.append('password', user.password);

        return APIaxios.post('/auth/login', para, {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        });
    }

    function signup(user) {
        return APIaxios.post('/auth/register', user, {
            headers: {
                "Content-Type": "application/json"
            }
        });
    }

    function refreshToken() {
        return APIaxios.get('/auth/refresh');
    }

    function getUserInfo(){
        return APIaxios.get('/auth/selfinfo');
    }

    /**
     * for file api 
     */
    function getfiles() {
        return APIaxios.get('/file');
    }

    function addfile(file) {
        return APIaxios.post('/file', file);
    }

    function deletefile(fileid) {
        return APIaxios.delete(`/file/${fileid}`);
    }

    function patchfile(fileid, file) {
        return APIaxios.patch(`/file/${fileid}`, file);
    }

    /**
     * for module api
     */

    function getmodules() {
        return APIaxios.get('/module');
    }

    function addmodule(module) {
        return APIaxios.post('/module', module);
    }

    function deletemodule(moduleid) {
        return APIaxios.delete(`/module/${moduleid}`);
    }

    function patchmodule(moduleid, module) {
        return APIaxios.patch(`/module/${moduleid}`, module);
    }

    /**
     * for graph node api
     */

    function getnodesByFile(fileid){
        return APIaxios.get(`/graph/node/${fileid}`);
    }

    function deletenodesByFile(fileid){
        return APIaxios.delete(`/graph/node/${fileid}`);
    }

    function getnode(fileid, nodeid){
        return APIaxios.get(`/graph/node/${fileid}/${nodeid}`);
    }

    function deletenode(fileid, nodeid){
        return APIaxios.delete(`/graph/node/${fileid}/${nodeid}`);
    }

    function addnode(fileid , node){
        return APIaxios.post(`/graph/node/${fileid}` , node) ;
    }

    function patchnode(fileid , nodeid , node){
        return APIaxios.patch(`/graph/node/${fileid}/${nodeid}` , node);
    }

    /**
     * for graph relationship api
     */

     function getrelasByFile(fileid){
         return APIaxios.get(`/graph/relation/${fileid}`);
     }

     function deleterelasByFile(fileid){
         return APIaxios.delete(`/graph/relation/${fileid}`);
     }

     function getrela(fileid , relaid){
         return APIaxios.get(`/graph/relation/${fileid}/${relaid}`);
     }

     function deleterela(fileid , relaid){
         return APIaxios.delete(`/graph/relation/${fileid}/${relaid}`);
     }

     function addrela(fileid , rela){
         return APIaxios.post(`/graph/relation/${fileid}` , rela);
     }

     function patchrela(fileid, relaid , rela){
         return APIaxios.patch(`/graph/relation/${fileid}/${relaid}` , rela);
     }

     /**
      * for image api
      * new FormData().append('image', target.files[0])
      * 
      * file: target.files[0]
      */
     function updateuseravatar(file){
        let data = new FormData();
        data.append('image', file );

        return APIaxios.post('/image/useravatar',data,{
            headers:{
                "Content-Type":"multipart/form-data"
            }
        });
     }

     function updatemoduleavatar(moduleid , file){
         let data = new FormData();
         data.append('image', file);

         return APIaxios.post(`/image/moduleavatar/${moduleid}` , data , {
             headers:{
                "Content-Type":"multipart/form-data"
             }
         })
     }

    


    return {
        test: test,
        login: login,
        signup: signup,
        refreshToken: refreshToken,
        userInfo: getUserInfo,

        file: {
            getAll: getfiles,
            addOne: addfile,
            deleteOne: deletefile,
            patchOne: patchfile
        },

        module: {
            getAll: getmodules,
            addOne: addmodule,
            deleteOne: deletemodule,
            patchOne: patchmodule
        },

        graph: {
            rela: {
                getAll:getrelasByFile,
                deleteAll:deleterelasByFile,

                getOne:getrela,
                patchOne: patchrela,
                deleteOne:deleterela,
                addOne:addrela
            },
            node: {
                getAll:getnodesByFile,
                deleteAll:deletenodesByFile,

                getOne:getnode,
                patchOne:patchnode,
                deleteOne:deletenode,
                addOne:addnode
            }
        },
        image: {
            updateUser: updateuseravatar,

            updateModule: updatemoduleavatar
        }
    }

}

// let requestHandler = requireFactory();

// export { requestHandler };

export {requireFactory};