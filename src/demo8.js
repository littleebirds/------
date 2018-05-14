
var p=Promise.resolve(42)
p.then(function fulfilled(v){
    console.log(v.toLowerCase());   //数字没有String函数，会报错
},function rejected(err){
    //用元不会到达这里
}).then(function (){
        //不会到达这里
},function (err) {
    console.log('error'+err)   //错误到达这里
})