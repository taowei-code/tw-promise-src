
const PENDING = 'PENDING'
const FULFILLED = 'FULFILLED'
const REJECTED = 'REJECTED'

class MyPromise {
  constructor(executor) {
    // 初始状态
    this.status = PENDING
    this.value = undefined
    this.reason = undefined
    // 存储异步回调，存储 then 方法传递的参数
    this.onFulFilledCb = []
    this.onRejectedCb = []


    
    // resolve 函数的参数我们一般传入异步的结果
    // 如
    // const promise = new MyPromise((resolve, reject) => {
    //   setTimeout(() => {
    //     resolve(2);
    //   }, 1000);
    // });
    const resolve = (value) => {
      if (this.status === PENDING) {
        // 通过修改状态的方式，在合适的时机触发相应状态的回调来达到处理异步的目的
        this.status = FULFILLED

        // 存储异步结果，调用 then 方法需要使用
        this.value = value

        // 执行存储的回调
        this.onFulFilledCb.forEach(fn => fn())
      }
    }
    const reject = (reason) => {
      if (this.status === PENDING) {
        // 通过修改状态的方式，在合适的时机触发相应状态的回调来达到处理异步的目的
        this.status = REJECTED
        this.reason = reason
        // 执行回调
        this.onRejectedCb.forEach(fn => fn())
      }
    }
    try {
      // 创建promise实例的时候，参数方法会立即执行, 如 new Promise(()=>{console.log(1111)})
      executor(resolve, reject)
    } catch (e) {
      reject(e)
    }
  }

  // x有可能是普通值，有可能是promise
  then(onFulFilled, onRejected) {
    onFulFilled = typeof onFulFilled === 'function' ? onFulFilled : value => value
    onRejected = typeof onRejected === 'function' ? onRejected : reason => { throw reason }

    // then 方法可以链式调用，所以返回的也是一个 Promise 实例
    let promise2 = new MyPromise((resolve, reject) => {
      if (this.status === FULFILLED) {
        setTimeout(() => {
          try {
            // 执行成功回调，this.value 存储了异步成功后的结果，传递给 then 函数

            // 保存 x 的原因，x 有可能是一个普通值如 1 '1'，也有可能是一个 Promise
            let x = onFulFilled(this.value)

            // resolvePromise 函数处理 x
            this.resolvePromise(promise2, x, resolve, reject)
          } catch (e) {
            reject(e)
          }
        }, 0)

      }
      if (this.status === REJECTED) {
        setTimeout(() => {
          try {
            let x = onRejected(this.reason)
            this.resolvePromise(promise2, x, resolve, reject)
          } catch (e) {
            reject(e)
          }
        }, 0);

      }
      if (this.status === PENDING) {
        // 异步操作，收集回调
        this.onFulFilledCb.push(() => {
          setTimeout(() => {
            try {
              let x = onFulFilled(this.value)
              this.resolvePromise(promise2, x, resolve, reject)
            } catch (e) {
              reject(e)
            }
          }, 0);
        })
        this.onRejectedCb.push(() => {
          setTimeout(() => {
            try {
              let x = onRejected(this.reason)
              this.resolvePromise(promise2, x, resolve, reject)
            } catch (e) {
              reject(e)
            }
          }, 0);
        })
      }
    })
    return promise2
  }

  // catch实际上是then的语法糖
  catch(errorCallback) {
    return this.then(null, errorCallback)
  }

  resolvePromise(promise2, x, resolve, reject) {
    if (promise2 === x) {
      // 防止套娃
      return reject(new TypeError('TypeError: Chaining cycle detected for promise #<Promise>'))
    }
    // 如果已经调用过resolve或reject，再次调用则忽略
    let called = false
    
    if ((x !== null && typeof x === 'object') || typeof x === 'function') {
      try {
        // 取then可能抛出异常2，比如劫持了then属性的getter，需要使用trycatch捕获
        let then = x.then
        if (typeof then === 'function') {
          // 认为返回了一个promise
          then.call(x, y => {
            if (called) return
            called = true
            this.resolvePromise(promise2, y, resolve, reject)
          }, r => {
            if (called) return
            called = true
            reject(r)
          })
        } else {
          // 认为返回了一个普通值
          resolve(x)
        }
      } catch (e) {
        if (called) return
        called = true
        reject(e)
      }
    } else {
      // 认为返回了一个普通值
      resolve(x)
    }
  }
}

MyPromise.deferred = function () {
  var result = {};
  result.promise = new MyPromise(function (resolve, reject) {
    result.resolve = resolve;
    result.reject = reject;
  });

  return result;
}

module.exports = MyPromise