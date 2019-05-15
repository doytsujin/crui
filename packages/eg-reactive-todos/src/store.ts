import { runAll } from '@crui/core/utils/combine';
import { noop } from '@crui/core/utils/noop';
import { StreamBox } from '@crui/reactive/rx/box';
import { StreamList } from '@crui/reactive/rx/list';
import { $filter } from '@crui/reactive/rx/list/filter';
import { Predicate } from '@crui/reactive/rx/list/filter/types';
import { keepSynced } from '@crui/reactive/rx/list/keepSynced';
import { Unsubscribe } from '@crui/reactive/rx/stream';

export type Todo = {
    done: StreamBox<boolean>,
    text: string,
}

export type TodoList = StreamList<Todo>
export enum Visibility {
    ALL,
    DONE,
    TODO,
}
export class TodoStore {
    public readonly input: StreamBox<string>
    public readonly visibility: StreamBox<Visibility>

    private readonly todos: TodoList
    private readonly visibleTodos: TodoList

    private unsubVisibleTodos: Unsubscribe
    private unsubFilteredList: Unsubscribe
    private unsubListByVisibility: Unsubscribe

    constructor() {
        this.input = new StreamBox('')
        this.todos = new StreamList<Todo>([])
        this.visibleTodos = new StreamList<Todo>([])
        this.visibility = new StreamBox<Visibility>(Visibility.ALL)

        this.unsubVisibleTodos = noop
        this.unsubFilteredList = noop
        this.unsubListByVisibility = 
            this.visibility.subscribe(
                this.setListByVisibility
            )

        this.setListByVisibility(Visibility.ALL)
    }

    getTodos() {
        return this.visibleTodos
    }

    private setListByVisibility = (v: Visibility) => {
        this.unsubVisibleTodos()
        this.unsubVisibleTodos = keepSynced(
            this.getTodoByVisibility(v),
            this.visibleTodos
        )
    }

    private getTodoByVisibility(v: Visibility) {
        switch (v) {
            case Visibility.ALL:
                return this.todos
            case Visibility.DONE:
                return this.getCompleted()
            case Visibility.TODO:
                return this.getUncompleted()
        }
    }

    private getCompleted(): TodoList {
        return this.makeFiltered((todo) => todo.done.get())
    }

    private getUncompleted(): TodoList {
        return this.makeFiltered((todo) => !todo.done.get())
    }

    addTodo(todo: string): void {
        this.todos.push({
            text: todo,
            done: new StreamBox<boolean>(false)
        })
    }

    private makeFiltered(p: Predicate<Todo>) {
        this.unsubFilteredList()

        const { unsub, list } = $filter(this.todos, p)
        this.unsubFilteredList = unsub

        return list
    }

    dispose() {
        runAll([
            this.unsubVisibleTodos,
            this.unsubFilteredList,
            this.unsubListByVisibility
        ])
    }
}