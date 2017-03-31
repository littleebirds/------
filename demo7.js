// function foo() {
//     setTimeout(()=>{
//         baz.bar()
//     },1000)
// }
//
// try{
//     foo()
// }
// catch(err) {
//     console.log('ee+ '+err)
// }

var p=new Promise((resolve,reject)=>{

   resolve()
});
p.then(()=>{
    return new Promise((resolve,reject)=>{
        foo();  //出错未定义
        resolve()
    },1000)
}).catch((err)=>{
    console.log(' '+err)
})