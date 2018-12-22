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

  addInputEventSource = (name: string, el: HTMLInputElement) => {
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

// const ec = new EventChannel();

// ec.dispatch({ type: 'nothin', payload: 'nothing should happen' })

// ec.subscribe('funevent', (payload) => console.log(payload));
// ec.subscribe('funevent', (payload) => console.log(payload + ' +extra thing'));
// ec.subscribe('btnUndo', (payload) => console.log(payload, ' btn Action Recieved'));
// ec.subscribe(['funevent', 'boringevent'], (payload) => console.log(payload + ' +extra thing'));


// ec.dispatch({ type: 'funevent', payload: 'PAYLOAD FUN' })
// ec.dispatch({ type: 'boringevent', payload: 'PAYLOAD BORING' })

// const inputSpeed = document.getElementById('editor-option-speed') as HTMLInputElement;
// const btnUndo = document.getElementById('editor-option-undo') as HTMLButtonElement;

// ec.addButtonEventSource('btnUndo', btnUndo);
// ec.addInputEventSource('inputSpeed', inputSpeed);

// ec.subscribe('inputSpeed', (payload) => console.log(payload, ' speed Action Recieved'));

export default EventChannel;