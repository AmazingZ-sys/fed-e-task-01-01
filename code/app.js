// 1.使用promise改写一下代码
/**
 * setTimeout(function() {
    var a = 'hello';
    setTimeout(function() {
        var b = 'lagou';
        setTimeout(function() {
            var c = 'I ❤ U';
            console.log(a + b + c);
        }, 10);
    }, 10);
}, 10);
 * 
 */

 let promise = new Promise(resolve => {
    resolve('hello')
 }).then(a => {
    let b = 'lagou'
    return a + b
 }).then((b) => {
    let c = 'I 💕 U'
    console.log(b + c)
 })


 /***
  * 2.
  * 
  * 
 */
const fp = require('lodash/fp')
const cars = [
    {
        name: 'Ferrari FF', horsepower: 660, dollar_value: 700000, in_stock: true
    },
    {
        name: 'Spyker C12 Zagato', horsepower: 650, dollar_value: 648000, in_stock: false
    },
    {
        name: 'Jaguar XKR-S', horsepower: 550, dollar_value: 132000, in_stock: false
    },
    {
        name: 'Audi R8', horsepower: 525, dollar_value: 114200, in_stock: false
    },
    {
        name: 'Aston Martin One-77', horsepower: 750, dollar_value: 1850000, in_stock: true
    },
    {
        name: 'Pagani Huayra', horsepower: 700, dollar_value: 1300000, in_stock: false
    }
]
/***
 * 练习1
 * ***/
let isLastInStock = fp.flowRight(fp.prop('in_stock'),fp.last)
console.log(isLastInStock(cars))

/***
 * 练习2
 * ***/
let firstName = fp.flowRight(fp.prop('name'),fp.first)
console.log(firstName(cars))

/***
 * 练习3
 * ***/
let _average = function(a) {
    return fp.reduce(fp.add, 0, a) / a.length
}

let averageDollarValue = fp.flowRight(_average, fp.map(car => car.dollar_value))
console.log(averageDollarValue(cars))

/****
 * 练习4
 * **/
let _underscore = fp.replace(/\W+/g, '_')
let sanitizeNames = fp.flowRight(fp.split(','),fp.toLower,fp.join(','),fp.map(car => _underscore(car.name)))
console.log(sanitizeNames(cars))

/***
 * 作业3
 * **/

class Container {
    static of(value) {
        return new Container(value)
    }
    constructor(value) {
        this._value = value
    }
    map(fn) {
        return Container.of(fn(this._value))
    }
}

class Maybe {
    static of(value) {
        return new Maybe(value)
    }
    
    constructor(value) {
        this._value = value
    }

    isNothing() {
        return this._value === null || this._value === undefined
    }

    map(fn) {
        return this.isNothing() ? this : Maybe.of(fn(this._value))
    }
}

/***
 * 练习1
 * ***/
let maybe = Maybe.of([5, 6, 1])
let ex1 = (x) => {
    return fp.map(value => {
        return fp.add(value, x)
    }, maybe._value)
}
console.log(ex1(3))

/***
 * 练习2
 * ***/
let xs = Container.of(['do', 'ray', 'me', 'fa', 'so', 'la', 'ti', 'do'])
console.log(xs._value)
let ex2 = () => {
    return fp.first(xs._value)
}
console.log(ex2())

/***
 * 练习3
 * ***/
let safeProp = fp.curry(function (x, o){
    return Maybe.of(o[x])
})
let user = { id: 2, name: 'Albert'}
let ex3 = (o) => {
    return fp.first(safeProp('name')(o)._value)
}
console.log(ex3(user))

/***
 * 练习4
 * ***/
let ex4 = (n) => {
    return Maybe.of(n).map((v) => parseInt(v))._value
}
console.log(ex4('3.0'))

/***
 * 作业4
 * ***/
const PADDING = 'padding'   // 等待状态
const FULFILLED = 'fulfilled'    // 成功状态
const REJECTED = 'rejected'     // 失败状态

class MyPromise {
    // 实例化时传入执行器，立即执行
    constructor(executor) {
        // 捕获执行器中的错误
        try {
            executor(this.resolve, this.reject)
        } catch (e) {
            this.reject(e)
        }
    }
    // 初始化状态
    status =  PADDING
    // 成功之后的值
    value = undefined
    // 失败之后的值
    reason = undefined
    // 执行成功回调，需要能多次调用，所以存储为数组
    successCallback = []
    // 执行失败回调
    errorCallback = []
    // 成功回调
    resolve = (value) => {
        // 状态不是等待时不往下执行
        if(this.status !== PADDING) {
            return
        }
        // 修改状态为成功
        this.status = FULFILLED
        // 保存成功之后的值
        this.value = value
        // 判断成功回调是否存在，存在就调用（处理异步状态）
        // this.successCallback && this.successCallback(this.value)
        while(this.successCallback.length) {
            this.successCallback.shift()()
        }
    }
    // 失败回调
    reject = (reason) => {
        // 状态不是等待时不往下执行
        if(this.status !== PADDING) {
            return
        }
        // 修改状态为失败
        this.status = REJECTED
        // 保存失败之后的值
        this.reason = reason
        // 判断失败回调是否存在，存在就调用（处理异步状态）
        // this,errorCallback && this.errorCallback(this.reason)
        while(this.errorCallback.length) {
            this.errorCallback.shift()()
        }
    }

    then = (successCallback, errorCallback) => {
        // 有参数就传递参数，没有参数的时候返回一个函数将值传递下去
        successCallback = successCallback ? successCallback : value => value
        errorCallback = errorCallback ? errorCallback : reason => { throw reason }
        // 返回一个promise对象来实现链式调用
        let promise2 = new MyPromise((resolve, reject) => {
            // 判断状态，执行相应回调
            if(this.status == FULFILLED) {
                // 避免取不到promise2
                setTimeout(() => {
                    // 捕获错误并抛给下一个 then
                    try {
                        let x = successCallback(this.value)
                        // 判断 x 是普通值还是promise对象
                        // 如果是普通值直接调用 resolve 返回
                        // 如果是 promise 需要查看这个 promise 对象的返回结果
                        // 根据这个 promise 对象的返回结果来决定调用 resolve 还是 reject
                        resolvePromise(x, resolve, reject, promise2)
                    } catch(err) {
                        reject(err)
                    }
                },0)
            }else if(this.status == REJECTED){
                setTimeout(() => {
                    // 捕获错误并抛给下一个 then
                    try {
                        let x = errorCallback(this.reason)
                        // 判断 x 是普通值还是promise对象
                        // 如果是普通值直接调用 resolve 返回
                        // 如果是 promise 需要查看这个 promise 对象的返回结果
                        // 根据这个 promise 对象的返回结果来决定调用 resolve 还是 reject
                        resolvePromise(x, resolve, reject, promise2)
                    } catch(err) {
                        reject(err)
                    }
                },0)
            } else {
                // 处理异步执行情况，将成功回调和失败回调存储起来
                this.successCallback.push(() => {
                    // successCallback()
                    setTimeout(() => {
                        // 捕获错误并抛给下一个 then
                        try {
                            let x = successCallback(this.value)
                            // 判断 x 是普通值还是promise对象
                            // 如果是普通值直接调用 resolve 返回
                            // 如果是 promise 需要查看这个 promise 对象的返回结果
                            // 根据这个 promise 对象的返回结果来决定调用 resolve 还是 reject
                            resolvePromise(x, resolve, reject, promise2)
                        } catch(err) {
                            reject(err)
                        }
                    },0)
                })
                this.errorCallback.push(() => {
                    // errorCallback()
                    setTimeout(() => {
                        // 捕获错误并抛给下一个 then
                        try {
                            let x = errorCallback(this.reason)
                            // 判断 x 是普通值还是promise对象
                            // 如果是普通值直接调用 resolve 返回
                            // 如果是 promise 需要查看这个 promise 对象的返回结果
                            // 根据这个 promise 对象的返回结果来决定调用 resolve 还是 reject
                            resolvePromise(x, resolve, reject, promise2)
                        } catch(err) {
                            reject(err)
                        }
                    },0)
                })
            }
        })
        // then 方法返回一个 promise 对象完成链式调用
        return promise2
    }
    // 是否成功都会执行一次
    finily = (callback) => {
        this.then((value) => {
            console.log(callback(),"====>caa")
            // 成功拿到执行结果包装为 promise 对象抛出
            return MyPromise.resolve(callback()).then(() => value)
        }, (reason) => {
            // 失败拿到执行结果包装为 promise 对象抛出
            return MyPromise.resolve(callback()).then(() => { throw reason })
        })
        // this.then((value) => {
        //     callback()
        //     return value
        // }, reason => {
        //     callback()
        //     throw reason
        // })
    }
    // 捕获 promise 的执行异常然后抛出
    catch = (failCallback) => {
        return this.then(undefined, failCallback)
    }
    // 静态方法 all
    static all (arr) {
        let results = []
        let index = 0
        return new MyPromise((resolve, reject) => {
            function addData(key,value) {
                results[key] = value
                index++
                // 等待异步操作完成之后一起返回
                if(index === arr.length) {
                    resolve(results)
                }
            }
            for(let i = 0; i < arr.length; i++) {
                let current = arr[i]
                if(current instanceof MyPromise) {
                    // promise 对象
                    current.then(value => {
                        addData(i, value)
                    }, reason => {
                        reject(reason)
                    })
                }else{
                    // 普通值
                    addData(i, current)
                }
            }
        })
    }

    // 静态方法race
    static race(arr) {
        // 谁最快返回就是这个promise的结果
        return new MyPromise((resolve, reject) => {
            for (let i = 0; i < arr.length; i++) {
                arr[i].then(resolve, reject)
            }
        })
    }

    static resolve (value) {
        // 是 promise 对象直接返回
        console.log(value instanceof MyPromise,"=====>bool")
        if(value instanceof MyPromise) return value
        // 是普通值包装为 promise 对象再返回
        return new MyPromise(resolve => resolve(value))
    }

    static reject (value) {
        // 是 promise 对象直接返回
        console.log(value instanceof MyPromise,"=====>bool")
        if(value instanceof MyPromise) return value
        // 是普通值包装为 promise 对象再返回
        return new MyPromise(undefined, reject => reject(value))
    }
}

// 判断返回值是否是 promise 对象 是不是返回了自身对象
function resolvePromise(x, resolve, reject, promise2) {
    // 避免循环引用报错(自己返回自己)
    if(x === promise2) {
        return reject(new TypeError('xxxxxxx'))
    }
    if(x instanceof MyPromise) {
        // promise 对象
        // x.then(value => {resolve(value), reason => reject(reason))})
        x.then(resolve, reject)
    }else {
        // 普通值
        resolve(x)
    }
}