// 保证effect执行的时候可以存储正确的关系
const effectStack: Array<any> = [];
// 当前激活的effect
let activeEffect: any;

class ReactiveEffect {
  active = true; // this.active = true;
  // 让属性记录依赖了哪些effect
  // 让effect记录依赖哪些属性
  deps = [];
  constructor(public fn: Function) {}
  // 调用run执行fn
  run() {
    // 非激活状态默认执行fn函数
    if (!this.active) {
      this.fn();
    }
    // 屏蔽同一个effect
    if (!effectStack.includes(this)) {
      try {
        // 一开始执行默认把effect放入栈中，同时表示activeEffect = 该effect
        effectStack.push((activeEffect = this));
        return this.fn(); // 这里会走到Proxy.get() ----> 到 proxy.get 做依赖收集
      } finally {
        // 删除最后一个
        effectStack.pop();
        activeEffect = effectStack[effectStack.length - 1];
      }
    }
  }
}
// { 对象：{ 属性：[effect,effect] } }
const targetMap = new WeakMap();
// 这个函数主要用在判断你是不是在effect中调用proxy.get
export function isTracking() {
  return activeEffect !== undefined;
}
// 收集依赖 => 放到 proxy.get上 对应effect和proxy的属性
export function track(target: object, key: any) {
  if (!isTracking()) {
    // 属性没有依赖于effect直接跳出
    return;
  }
  let depsMap = targetMap.get(target);
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()));
  }
  let dep = depsMap.get(key);
  if (!dep) {
    depsMap.set(key, (dep = new Set()));
  }
  let shouldTrack = !dep.has(activeEffect);
  if (shouldTrack) {
    dep.add(activeEffect);
  }
}
export function trigger(target: object, key: any) {
  let desMap = targetMap.get(target);
  // 修改的属性没有依赖任何的effect
  if (!desMap) {
    return;
  }
  let deps = [];
  if (key !== undefined) {
    deps.push(desMap.get(key));
  }
  let effect = [];

  for (const dep of deps) {
    effect.push(...dep);
  }
  effect.forEach((effect) => {
    // 需要判断当前的effect执行 和 要执行的effect是同一个，就不执行 防止循环
    if (effect !== activeEffect) {
      effect.run();
    }
  });
}
export function effect(fn: Function) {
  const _effect = new ReactiveEffect(fn);
  // 默认执行一次
  _effect.run();
}
