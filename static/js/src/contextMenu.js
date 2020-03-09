
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


function testmoduleMenugen(){
    let menuWrap = document.createElement('div');
    menuWrap.classList.add("menu-wrap");
    let menuItem = document.createElement('div');
    menuItem.classList.add('menu-item');
    menuItem.innerText = "mmmmmmmmm";
    menuWrap.appendChild(menuItem);

    menuItem.onclick = function(){
    console.log("module menu", currentobj);//@todo function scope is? this is ?
    }
    menuWrap.onmouseleave = function(){
        totalWrap.innerHTML = "";
    }
    return menuWrap;
}

menus.modulemenu = testmoduleMenugen();

export default {setCurrentObj , menuhandler,registeMenu};