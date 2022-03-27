
export interface IPubSubFunction
{
    (...args: any[]): void;
}

export function createChannel(): { subscribe: IPubSubFunction, publish: IPubSubFunction } {
  let subscriptions: { [key: string]: { [key: string]: IPubSubFunction } } = {};
  let getNextUniqueId = getIdGenerator();
  
  function getIdGenerator() {
    let lastId = 0
    
    return function getNextUniqueId() {
        lastId += 1
        return lastId
    }
  }

  function subscribe(eventType: string, callback: (...args: any[]) => void): {unsubscribe: IPubSubFunction} {
    const id = getNextUniqueId()

    if(!subscriptions[eventType]) {
      let event: { [key: number]: IPubSubFunction } = {}
      subscriptions[eventType] = event;
    }

    subscriptions[eventType][id] = callback

    return { 
      unsubscribe: () => {
          delete subscriptions[eventType][id]
          if(Object.keys(subscriptions[eventType]).length === 0) delete subscriptions[eventType]
      }
    }
  }

  function publish(eventType: string, ...args: any[]): void {
    if(!subscriptions[eventType])
        return

    Object.keys(subscriptions[eventType]).forEach(key => subscriptions[eventType][key](...args))
  }

  return {
    subscribe: subscribe,
    publish: publish
  }
}
