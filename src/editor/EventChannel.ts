export type UIInputSubscriber = (newValue: string) => void;
export type UIButtonSubscriber = () => void;
export type UIControlSubscriber = UIInputSubscriber | UIButtonSubscriber;

export interface Action {
  type: string;
  payload?: any;
}

export type ActionHandler = (payload: any) => void;
export interface ActionSubscriber {
  type: string;
  handler: ActionHandler;
}

class EventChannel {
  subscribers: ActionSubscriber[];


  constructor() {
    this.subscribers = [];
    this.addKeyEventSources();
  }

  subscribe = (actionType: string | string[], handler: ActionHandler) => {
    if (typeof actionType === 'string') {
      this.subscribers.push({ type: actionType, handler });
    } else {
      actionType.forEach(type => this.subscribers.push({ type, handler }));
    }
  }

  subscribeAll = (actionHandler: { action: string, handler: ActionHandler }[]) => {
    actionHandler.forEach(actionHandler => this.subscribe(actionHandler.action, actionHandler.handler));
  }

  dispatch = (action: Action) => {
    // console.log(action);
    this.subscribers.forEach(subscriber => {
      if (action.type === subscriber.type) {
        subscriber.handler(action.payload);
      }
    })
  }

  addInputEventSource = (name: string, el: HTMLInputElement | HTMLSelectElement) => {
    el.onchange = (event: any) => {
      const value = event.target.value;
      this.dispatch({ type: name, payload: { value, element: el } });
    }
  }

  addButtonEventSource = (name: string, el: HTMLElement) => {
    el.onclick = () => this.dispatch({ type: name, payload: { element: el } });
  }

  private addKeyEventSources = () => {
    document.onkeypress = (e) => {
      this.dispatch({ type: `keypress_${e.key.toLowerCase()}` });
    }

    document.onkeydown = (e) => {
      this.dispatch({ type: `keydown_${e.key.toLowerCase()}` });
    }

    document.onkeyup = (e) => {
      this.dispatch({ type: `keyup_${e.key.toLowerCase()}` });
    }
  }
}

export default EventChannel;