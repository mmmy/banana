export function triggerTap(el) {
  // 创建自定义事件
  const event = document.createEvent("Events")
  // 初始化事件，可冒泡，可取消
  event.initEvent("tap", true, true)
  // 分发事件
  el.dispatchEvent(event)
}

export function triggerTouchEvent(el, eventType) {
  // 获取目标元素的坐标、大小
  const rect = el.getBoundingClientRect()
  // 构建touch对象
  const touch = new Touch({
    identifier: Date.now(),
    target: el,
    clientX: rect.left + rect.width / 2,
    clientY: rect.top + rect.height / 2,
    // 下面的都是W3C实验性质的API
    radiusX: 2.5,
    radiusY: 2.5,
    rotationAngle: 10,
    force: 0.5
  })
  // 构建TouchEvent
  const touchEvent = new TouchEvent(eventType, {
    cancelable: true,
    bubbles: true,
    touches: [touch],
    targetTouches: [],
    changedTouches: [touch]
  })
  el.dispatchEvent(touchEvent)
}
