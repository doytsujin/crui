# @crui/transactions

Add transactions to CRUI components.

## cssTx
CSS Transitions allow simple micro-transitions, so they can be easily setup through `cssTx`:
```typescript
import { cssTx } from '@crui/transitions/cssTx'
import { mount } from '@crui/core/dom/browser'

const SlideLeft = cssTx(
    { transform: 500, opacity: 500 },
    { transform: 'translateX(-1em)', opacity: 0 },
    { transform: 'translateX(0)', opacity: 1 },
)

const comp = SlideLeft(ht('div', 'Enter from the left, exit from the right'))
const r = mount(
    document.getElementById('root'),
    comp,
    {}
)
setTimeout(() => r.onUnmount(), 5000)
```
This code will create a div that will enter from the left and, after 5 seconds, will exit from where it came.

Let's analyze the type signature, simplified for explanation purposes
```typescript
type cssTx = (transitions: Milliseconds<Style>, from: Style, to: Style) => Component => Component
type Milliseconds<T> = {[K in keyof T]: T[K]}
```
The first argument `transitions` represents the transition duration for each property.

The second argument `from` will set the initial style, before the node enter the DOM. This will be also used during the unmount phase.

The third and last argument `to` will set the style just after the node is inserted in the DOM and will trigger the animation.

Initial rendering would be equivalent to:
```html
<div style="transition: transform 500ms, opacity: 500ms; opacity: 0; transform: translateX('-1em')">
    Enter from the left, exit from the right
</div>
```
But just after adding it to the DOM, it will become:
```html
<div style="transition: transform 500ms, opacity: 500ms; opacity: 1; transform: translateX(0)">
    Enter from the left, exit from the right
</div>
```

### Transitions and children
Let's apply the newly created SlideLeft transition on each item of the classic Todo list example:
```typescript
import { hc, ht } from '@crui/core'

const TodoList = hc('div', [
    SlideLeft(ht('div', 'A')),
    SlideLeft(ht('div', 'B')),
    SlideLeft(ht('div', 'C')),
])
```
All slide transitions will trigger as soon as TodoList component is mounted in the DOM, so from a visual point of view it will be equivalent to:
```typescript
const TodoList = SlideLeft(
    hc('div', [
        text('A'),
        text('B'),
        text('C'),
    ])
)
```
Let's make it a little bit more interesting by adding a slight delay to each element:
```typescript
const TodoList = hc('div', [
    SlideLeft(0)(ht('div', 'A')),
    SlideLeft(500)(ht('div', 'B')),
    SlideLeft(1000)(ht('div', 'C')),
])
```
In this case SlideLeft receives a `delay`, so know we will have a staggered effect, ie: it will look like as if each element enters (or exits) the DOM one after the other.

Same goes for the `outro`: all exit transitions are triggered at the same time when the parent DOM element is scheduled for unmount.
Please note that the parent element will be removed only once all children `outro` are done, so our delayed version will work as expected.

It doesn't matter how deep in the tree transitions are injected, it will work as expected:
```typescript
const TodoApp = hc('div', [
    ht('h1', 'My Todo App'),
    TodoLisit
])
```

### Transition Flow
In case both parent and child have a transition, the parent one will perform:
* Before the child intro
* After the child outro

```typescript
const TodoApp = Fade(
    hc('div', [
        ht('h1', 'My Todo App'),
        hc('div', [
            SlideLeft(0)(ht('div', 'A')),
            SlideLeft(500)(ht('div', 'B')),
            SlideLeft(1000)(ht('div', 'C')),
        ])
    ])
)
```
In this example we suppose to have a `Fade` transition already in place which will just fade in and out the element.

What will happen visually is that first TodoApp will fade in and then all todo items will slide in.  
On the other end, upon unmount all the todo items will slide out first and once done TodoApp will fade out.

### Higher Abstraction
Given that everything is a simple function, we can easily abstract the Staggered concept and make code more reusable and cleaner to use:
```typescript
type Millisec = number
type DelayedTransition = (delay: number) => (c: Component) => Component

type StaggeredTx = (delay: Millisec, tx: DelayedTransition, children: Component[]) => Component[]
const Staggered: StaggeredTx = (delay, tx, children) => (
    children.map((c, i) => (
        tx(i * delay)(c)
    ))
)

const TodoList = hc('div', 
    Staggered(500, SlideLeft, [
        ht('div', 'A'),
        ht('div', 'B'),
        ht('div', 'C'),
    ])
)
```

## TX - The base building block
TX in this case stands for "transition" and it enhances an element with animation on both intro (when the element enters the DOM) and outro (when the element exits the DOM).

The first thing we need to understand is `tx` type signature:
```typescript
tx = (TransitionMaker) => (Component) => Component
```
The result of `tx` is similar to React's Higher Order Component: it receives a Component and returns yet another Component with applied the transition generated by TransitionMaker.

A TransitionMaker is:
```typescript
type TransitionMaker = (node: HTMLElement, dom: DOM<HTMLElement>) => Transition
```
For explanation purposes, we simplified the type a little bit and removed a layer of abstraction. This is anyway what you will get when it's rendered in the Browser DOM.

All in all, it is quite simple, it receives an HTMLElement and returns a Transition:
```typescript
type Transition = {
    intro: () => Ro
    outro: () => RO
}
```
Given that animations are time-sensitive, we need to know when the they are done to properly clean up the DOM and orchestrate them, but also the ability to cancel them. That's what `Ro` models:
```typescript
type Ro = {
    run: () => Promise<void>,
    cancel: () => void
}
```

An important aspect to note is that TransitionMaker is called only once, **before mounting** the element into the DOM, hence any measure (ie: `node.getBoundingClientRect()`) will not work.
On the other hand, `intro` is triggered just **after mounting** and is therefore able to properly measure our node.

Please note that `tx` is just the basic building block to allow element transition and that is meant to be used in combination with a proper Animation library (eg: [GreenSock](https://greensock.com/)) or other abstractions.