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
