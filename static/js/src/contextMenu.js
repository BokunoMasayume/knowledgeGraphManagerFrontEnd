
let menus = {};
let currentobj = null;
let totalWrap = document.createElement('div');
totalWrap.style.zIndex = 1999;
totalWrap.style.backgroundColor = "white";
totalWrap.style.color="blue";
document.body.appendChild(totalWrap);

function setCurrentObj(obj){
    currentobj = obj;
}

function menuhandler(menuname,e){
    totalWrap.innerHTML = "";

    menus[menuname].style.position = "fixed";
    menus[menuname].style.top = e.clientY+"px";
    menus[menuname].style.left = e.clientX+"px";

    totalWrap.appendChild(menus[menuname]);
    
}

// function registeMenu(menuname, menugen, clickcallback){
//     menus[menuname] = menugen(currentobj , clickcallback);
// }


function nodeMenugen(){
    let menuWrap = document.createElement('div');
    menuWrap.classList.add("menu-wrap");

    let menuDeleItem = document.createElement('div');
    menuDeleItem.classList.add('menu-item');
    menuDeleItem.innerText = "删除节点";
    menuWrap.appendChild(menuDeleItem);

    menuDeleItem.onclick = function(){
        if(!currentobj)return;

        //@todo function scope is? 'this' is ?
        console.log("in real will delete ",currentobj);
        app.deletenode();
        
    }

    let menuFixItem = document.createElement('div');
    menuFixItem.classList.add('menu-item');
    
    menuFixItem.innerText = "固定/移动节点";
    
    menuWrap.appendChild(menuFixItem);
    menuFixItem.onclick = function(){
        if(!currentobj)return;
        console.log("fix", currentobj);
        if(!currentobj.fx || !currentobj.fy){
            currentobj.fx = currentobj.x;
            currentobj.fy = currentobj.y;
        }else{
            currentobj.fx = null;
            currentobj.fy = null;
        }
    }



    menuWrap.onmouseleave = function(){
        totalWrap.innerHTML = "";
    }
    return menuWrap;
}




function edgeMenugen(){
    let menuWrap = document.createElement('div');
    menuWrap.classList.add("menu-wrap");

    let menuDeleItem = document.createElement('div');
    menuDeleItem.classList.add('menu-item');
    menuDeleItem.innerText = "删除关系";
    menuWrap.appendChild(menuDeleItem);

    menuDeleItem.onclick = function(){
        if(!currentobj)return;

        console.log("in real will delete ",currentobj);
        app.deleterela();
        
    }

    menuWrap.onmouseleave = function(){
        totalWrap.innerHTML = "";
    }
    return menuWrap;
}



menus.nodemenu = nodeMenugen();

menus.edgemenu = edgeMenugen();

export default {setCurrentObj , menuhandler};