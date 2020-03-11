
let menus = {};
let currentobj = null;
let totalWrap = document.createElement('div');
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

function registeMenu(menuname, menugen, clickcallback){
    menus[menuname] = menugen(currentobj , clickcallback);
}


function moduleMenugen(){
    let menuWrap = document.createElement('div');
    menuWrap.classList.add("menu-wrap");
    let menuDeleItem = document.createElement('div');
    menuDeleItem.classList.add('menu-item');
    menuDeleItem.innerText = "删除模板";
    menuWrap.appendChild(menuDeleItem);

    menuDeleItem.onclick = function(){
        //@todo function scope is? 'this' is ?
        console.log("in real will delete ",currentobj);
    }
    menuWrap.onmouseleave = function(){
        totalWrap.innerHTML = "";
    }
    return menuWrap;
}

menus.modulemenu = moduleMenugen();

export default {setCurrentObj , menuhandler,registeMenu};