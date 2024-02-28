
const PENDING = 'PENDING'
const FULFILLED = 'FULFILLED'
const REJECTED = 'REJECTED'

class MyPromise {
    constructor(executor) {
        this.status = PENDING
        this.value = undefined
        this.reason = undefined
        this.onFulFilledCb = []
        this.onRejectedCb = []

        const resolve = (value) => {
            if (this.status === PENDING) {
                this.status = FULFILLED
                this.value = value
                // 执行回调
                this.onFulFilledCb.forEach(fn => fn())
            }
        }
        const reject = (reason) => {
            if (this.status === PENDING) {
                this.status = REJECTED
                this.reason = reason
                // 执行回调
                this.onRejectedCb.forEach(fn => fn())
            }
        }
        try {
            executor(resolve, reject)
        } catch (e) {
            reject(e)
        }
    }

    // x有可能是普通值，有可能是promise
    then(onFulFilled, onRejected) {
        onFulFilled = typeof onFulFilled === 'function' ? onFulFilled : value => value
        onRejected = typeof onRejected === 'function' ? onRejected : reason => { throw reason }

        let promise2 = new MyPromise((resolve, reject) => {
            if (this.status === FULFILLED) {
                setTimeout(() => {
                    try {
                        let x = onFulFilled(this.value)
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