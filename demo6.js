function delay(time){
    return new Promise((resolve,reject)=>{
            setTimeout(resolve,time);
});
}

delay(1000)
    .then(function S1(){
        console.log('S1');
        return delay(500);
    })
    .then(function S2(){
        console.log('S2');
        return delay(300);
    })
    .then(function S3(){
        console.log('S3');
        return delay(100);
    })
    .then(function S4(){
        console.log('S4');
    });