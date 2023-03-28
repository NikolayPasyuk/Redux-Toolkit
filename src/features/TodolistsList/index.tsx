import {
    slice as todolistsSlice,
    asyncActions as todolistsAsyncActions
} from './todolists-reducer'
import {asyncActions as tasksAsyncActions, slice as taskSlice} from './tasks-reducer'
import {TodolistsList} from './TodolistsList'

const todolistsActions = {
    ...todolistsAsyncActions,
    ...todolistsSlice.actions
}
const tasksActions = {
    ...tasksAsyncActions,
    ...taskSlice.actions
}

const todolistsReducer = todolistsSlice.reducer
const tasksReducer = taskSlice.reducer

export {
    tasksActions,
    todolistsActions,
    TodolistsList,
    todolistsReducer,
    tasksReducer
}