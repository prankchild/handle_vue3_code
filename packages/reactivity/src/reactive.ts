import { isObject } from "@vue/shared";
import { track, trigger } from "./effect";

const enum ReactiveFlags {
  IS_REACTIVE = "_v_isReactive",
}

const mutableHandlers: ProxyHandler<Record<any, any>> = {
  get(target, key, receiver) {
    if (key === ReactiveFlags.IS_REACTIVE) {
      return true;
    }
    // 收集依赖
    track(target, key);
    // 收集在哪个effect当中
    return Reflect.get(target, key, receiver);
  },
  set(target, key, value, receiver) {
    let oldValue = target[key as string];
    if (oldValue !== value) {
      // 触发effect更新
      trigger(target, key);
    }
    return Reflect.set(target, key, value, receiver);
  },
};
// WeakMap 弱引用
const reactiveMap = new WeakMap<Record<any, any>>();
function createReactiveObject(target: object) {
  // 解决代理过的对象再次代理的问题
  // 默认认为target是代理过的属性
  if ((target as any)[ReactiveFlags.IS_REACTIVE]) {
    // 当获取target[ReactiveFlags.IS_REACTIVE]会走到get属性，如果代理过则返回true
    return target;
  }
  // 判断是否对象
  if (!isObject(target)) {
    return target;
  }
  const existingProxy = reactiveMap.get(target);
  // 解决同一对象代理多次的问题
  // 判断target是否已经被代理过，如若被代理过直接返回target的代理
  if (existingProxy) {
    return existingProxy;
  }
  const proxy = new Proxy(target, mutableHandlers);
  // 将原对象和代理对象进行存储、做成映射表
  reactiveMap.set(target, proxy);
  return proxy;
}

export function reactive(target: object) {
  return createReactiveObject(target);
}

export function readonly() {}

export function shallowReactive() {}

export function shallowReadonly() {}
