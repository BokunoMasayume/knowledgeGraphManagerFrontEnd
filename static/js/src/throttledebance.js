function throttle(fn ,delay){
    let timer = null ;

    return function(){
        let args = arguments;
        if(timer)return;

        timer = setTimeout(()=>{
            fn.apply(this , args);
            timer = null;
        }  ,delay);

    }
}
export  {throttle};