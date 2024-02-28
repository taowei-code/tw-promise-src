const MyPromise = require("./MyPromise");

let p = new MyPromise((resolve, reject) => {
    // resolve('1111');
    // reject('2222');
    // throw new Error('3333')
    setTimeout(() => {
        resolve('success')
    }, 2000);


})
p.then((res) => {
    console.log(res)
})
p.then((res) => {
    console.log(res)
})
p.then((res) => {
    console.log(res)
})
p.then((res) => {
    console.log(res)
})




// let p2 = p.then((value) => {
//     console.log('111111111:', value)
//     return new MyPromise((resolve, reject) => {
//         resolve(new MyPromise((resolve, reject) => {
//             resolve(111222333)
//         }))
//     })
// }, (reason) => {
//     console.log('111111111err:', reason)
// })

// p2.then().then().then().then((value) => {
//     throw Error('999')
//     console.log('22222222:', value)
// }, (reason) => {
//     console.log('22222222err:', reason)
// }).then((value) => {
//     console.log('333333333:', value)
// }, (reason) => {
//     console.log('333333333err:', reason)
// }).then((value) => {
//     console.log('444444444:', value)
// }, (reason) => {
//     console.log('444444444err:', reason)
// }).catch((e) => {
//     console.log('---', e)
// })