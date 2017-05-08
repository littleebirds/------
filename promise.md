#### promise的信任问题（调用时间）

###### 调用过早    

###### 调用过晚  

 ```javascript

     p.then(function(){
         p.then(function(){
         console.log('C')
         })   
         console.log('A')
      })
      p.then(function(){
         console.log('B')
      })
     //结果输出：A B C
```

+ 因为在一个promise决议之后，这个promise上所有的注册的then        
回调都会*异步*的依次被立即执行    

 ```javascript
            var  p3=new Promise(function(resolve,reject){
                       resolve('B')
            })
            var p1=new Promise(function(resolve,reject){
                       resolve(p3)
            })
            var p2=new Promise(function(resolve,reject){
                       resolve('A')
            })
            p1.then(function(v){
                console.log(v)
            })
            p2.then(function(v){
                console.log(v)
            })

            //结果输出：A B
```
+ p1的回调和 p2的回调是相对独立的，但由于p1的决议传给了p3也使得速度相对p2落后
  所以会先输出A，在输出B
  
  
###### 回调未调用    


+ 首先没有任何东西能阻止promise的决议    

```javascript
        //用于超时一个promise的工具
        function timeoutPromise(delay){
            return new Promise(function(resolve,reject){
                setTimeout(function(){
                    reject('Timeout')
                },delay)
            })
        }

        //设置foo()超时
        Promise.race([
            foo(),
            timeoutPromise(3000)
        ])
        then(function(){
                //foo(..)及时完成
         },function(err){
            //foo()或是未在3000ms内及时完成，或是被拒绝
            //查看err来了解哪种情况
         })
```     
        
###### 调用次数过少或者过度    

   回调被调用正确次数为1次，‘过少’ 的此时就是0次，没调用。    
   过多调用：由于Promise 的定义方式使得它只能被决议一次，如果多次调用promise只会接受第一次    
   调用，后面的调用则会被忽略并以异步的方式自行运行。因为then返回的是一个新的promise而非原来的promise    
   
   
###### 未能传递参数/环境值
   promise至多只能有一个决议值，完成或者拒绝。   
   
   如果没任何显示决议（未显式的传递参数）则这个值就为undefined    

   如果需要传递多个值，则需要封装为单个值，数组或者对象    
   
###### 吞掉错误或异常
 ```javascript   
    var p=new Promise(function (resolve,reject) {
        foo.bar();  //foo未定义，这里会出错
        resolve(42)
    });
    p.then(function fulfilled() {
        //永远不会到达这里
    },function rejected(err) {
        console.log('error'+err)//捕捉err来自  foo.bar()这一行
    })
 ```
    
+ 另一个问题
    
```javascript    
        var p=new Promise(function (resolve,reject) {
            resolve(42)
        });
        p.then(function fulfilled(msg) {
            foo.bar();  //foo未定义，这里会出错
            console.log(msg)  //永远不会到这里
        },function rejected(err) {
            console.log('error'+err)//捕捉err来自  foo.bar()这一行
        })
 ```   
   回调里产生了错误（foo.bar() foo未定义），这里的错误不是被吞掉了，而是会被返回的新的promise所捕捉到
   
###### 是可信任的Promise吗？
   如果向promise.resolve()传递一个非promise，就会得到一个用这个值填充的promise
```javascript   
        var p1=new Promise(function(resolve,reject){
            resolve(42)
        })
        var p2=Promise.resolve(42)
        console.log(42);     //Promise {42}
        console.log(42);    //Promise {42}
        console.log(p1==p2);    //false

       如果向Promise.resolve()传递一个真正的promise，就会返回同一个promise

         var p1=Promise.resolve(42);
         var p2=Promise.resolve(p1);

        console.log(42);     //Promise {42}
        console.log(42);    //Promise {42}
        console.log(p1==p2);    //true

       thenable是不可信任的

        var p={
            then:function (cb) {
                cb(42)
            }
        };

        p.then(
            function fulfilled(val) {
                console.log('www '+val)
            },function rejected(err) {
                console.log(err)
            }
        );

        //能运行，没出错
   
        ------------分割线------------

        var p={
            then:function (cb,error) {
                cb(42)
                error('error_msg')
            }
        };
       
        p.then(
            function fulfilled(val) {
                console.log('www '+val)
            },function rejected(err) {
                console.log(err)   //这里本不该运行可却运行了
            }
        );
        //所以 thenable 并不是一个真正的promise,所以是不能信任的
```        
###### 建立信任



#### 链式流
    
+ 每次调用then(),都会创建并返回一个新的promise,我们可以将其链接起来；
+ 不管从then()调用的完成回调（第一个参数）返回的值是什么，它都会自动设置为被链接  
  Promise(第一点中的)完成
  
```javascript
         var p=Promise.resolve(21);

         var p2=p.then(function (v) {
            console.log(v);  //21
            return v*2;   //返回值作为参数传入新的promise  p2
         });

         p2.then(function (v) {
            console.log(v)  //42
         });

         --------分割线--------
         var p=Promise.resolve(21);
         p.then(function(v){
            console.log(v)  //21

            return new Promise(function(resolve,reject){
                    resolve(v*2);  返回新promise对象，并决议resolve(v*2)传递
                })
         })
         .then(function(v){
                console.log(v)  //42
         })
        ---------分割线--------
        var p=Promise.resolve(21);

        p.then(function(v){
            console.log(v);
            return new Promise(function(resolve,reject){
                setTimeout(()=>resolve(v*2),1000)
            })
        })
        .then(function(v){
            console.log(v)  //在前一步中的1000ms延迟后打印42
        })
        --------分割线---------
        //构建多次延迟序列
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

        --------分割线--------
        function request(){
            return new Promise((resolve,reject)=>{
                ajax(url,resolve)
            })
        }

        request('http://www.wwww.2/')
            .then((response)=>{
                return request('http://www.wwww.2/')
            })
            .then((response2)=>{
                console.log(response2)
            })
```    
#### 错误处理
```javascript
    function foo() {
        setTimeout(()=>{
            baz.bar()
        },1000)
    }
    
    try{
        foo()
    }
    catch(err) {
        console.log('ee+ '+err) //由于异步性， 所以错误始终不会收集到
    }
    
    --------分割线---------
    //解决办法 非promise
    function foo(cb){
        setTimeout(()=>{
            try{
                var x=baz.bar()
                cb(null,x);
            }catch(err){
                cb(err)
            }
        })
    }
    foo((err,val)=>{
        if(err){
            console.log('error:'+err)
        }else{
            console.log(val)
        }
    })
    
    --------分割线--------
    var p=Promise.reject('Oops');
    
    p.then(function fulfilled(){
        //不会到达这里
    },function rejected(err){
        console.log(err)   //'Oops'
        }
    )      
        //较合理的错误处理机制
    --------分割线--------
    var p=Promise.resolve(42)
    p.then(function fulfilled(v){
        console.log(v.toLowerCase());   //数字没有String函数，会报错
    },function rejected(err){
        //用元不会到达这里
    })
```    
###### 绝望的陷阱

+ 使用catch捕捉错误

```javascript
        var p=Promise.resolve(42)
        p.then(function fulfilled(v){
            console.log(v.toLowerCase());   //数字没有String函数，会报错
        },function rejected(err){
            //用元不会到达这里
        }).catch((err)=>{
            console.log('error: '+err);    //捕捉到错误
        })

        //或者也可以在后面的写个then，可以捕捉到错误
```
###### 处理未捕获的情况
    
    
###### 成功的坑



#### promise模式
    
###### Promise.all
    
+ 同时执行多个操作，不论顺序如何，全部完成之后进行下一步操作

```javascript
        eg.
           //假设request是个promise-awar Ajax工具
           var p1=request('http://some.url.1/');
           var p2=request('http://some.url.2/');

           Promise.all([p1,p2])
           .then((msg)=>{
                //这里作为p1,p2都完成后的回调
                //msg为p1,p2传递过来的消息
                return request(
                    'http://some.url.3'
                )
           })
           .then((msg)=>{
                console.log(msg);
           })
 ```
 Promise.all([..]) 需要一个参数，是一个数组，通常由promise组成
 
 ######Promise.race([])
 
 + 也称为竞态，尽管Promise.race([]) 协调多个并发的promise的运行，并假定所有Promise    
 都需要完成，但有时候你会想只想赢‘第一个跨过终点线的Promise’,而抛弃其他的Promise
 
```javascript     
        var p1=request('http://some.url.1/');
        var p2=request('http://some.url.2/');

        Promise.race([p1,p2])
        .then((msg)=>{
            //p1或者p2将赢得这场竞赛
            return request('http://some.url.3/');
        })
        .then((msg)=>{
            console.log(msg)
        })
```
 + 超时竞赛
    
```javascript
        Promise.race([
            foo(),
            timeoutPromise()
        ])
        .then(()=>{
            //foo(按时完成)
        },(err)=>{
            //或者foo()被拒绝，或者未按时完成
            //故查看err是哪种错误
        })
 ```   
 + finally
    
有些开发者提出Promise 需要一个finally的回调注册，在Promise决议后总是会被调用，并且允许执行任何必要的清理工作
 ```javascript   
    //类似这样
    var p=Promise.resolve(42);
    
    p.then(something)
     .finally(cleanup)
     .then(something)
     .finally(cleanup)
```
###### all()和race()的变体

+ none([])  所有的promise被拒绝后，才转化为完成值
+ any([])    忽略拒绝，只需要完成一个而不是全部
+ first([])   只要第一个promise完成，就会忽略后续的任何拒绝或者完成
+ last([])    最后一个完成胜出

###### 并发迭代

有时候会需要在一列Promise中迭代，并对所有的promise都执行某个任务，类似于数组的（forEach,map,some,every）
```javascript
    if(!Promise.map){
        Promise.map=function(value,cb){
            return Promise.all(
                value.map((val)=>{
                    return new Promise((resolve)=>{
                        cb(val,resolve)
                    })
                })
            )
        }
    }
 
    //应用
    var p1=Promise.resolve(21);
    var p2=Promise.resolve(42);
    var p3=Promise.rejected('Oops');
    
    Promise.map([p1,p2,p3],function(pr,done){
        Promise.resolve(pr)
        .then(
            function(v){
                done(v*2)
            },done
        );
    })
    .then(function(val){
        console.log(val)
    })
  ```  
#### Promise局限性

###### 顺序错误处理
    
错误容易被忽略

###### 单一值
