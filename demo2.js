var p=new Promise(function (resolve,reject) {
    foo.bar();  //foo未定义，这里会出错
    resolve(42)
});
p.then(function fulfilled() {
    //永远不会到达这里
},function rejected(err) {
    console.log('sddd'+err)//捕捉err来自  foo.bar()这一行
})