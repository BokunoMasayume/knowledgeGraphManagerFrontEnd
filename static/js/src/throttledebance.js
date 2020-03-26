//节流，函数体写成防抖了
function throttle(fn ,delay){
    let timer = null ;

    return function(){
        let args = arguments;
        if(timer){
            // cancleTimeout(timer);
            // timer = setTimeout(ddd)
            return;
        }

        timer = setTimeout(()=>{
            fn.apply(this , args);
            timer = null;
        }  ,delay);

    }
}

//防抖，函数体写成节流了
function debounce(fn,delay){
    let timer = null;
    return function(){
        let args = arguments;
        if(timer)return;
        fn.apply(this,args);
        timer = setTimeout(()=>{timer = null} , delay);
    }
}


export  {throttle ,debounce };