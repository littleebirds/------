var p=Promise.resolve(42)
var p2=Promise.resolve(21)
p.then((v)=>{
    console.log(v);
}).then(()=>{
    return p2;
}).then((v)=>{
    console.log(v);
}).then(()=>{
    bar();
}).catch((err)=>{
    console.log('error '+err);
})