import {
    ResponseResultCode,
    TaskPriorities,
    TaskStatuses,
    TaskType,
    todolistsAPI,
    UpdateTaskModelType
} from '../../api/todolists-api'
import {Dispatch} from 'redux'
import {AppRootStateType} from '../../app/store'
import {setAppStatusAC,} from '../../app/app-reducer'
import {handleServerAppError, handleServerNetworkError} from '../../utils/error-utils'
import axios from 'axios';
import {createAsyncThunk, createSlice, PayloadAction} from '@reduxjs/toolkit';
import {addTodolistAC, removeTodolistAC, setTodolistsAC} from './todolists-reducer';

const initialState: TasksStateType = {}

export const fetchTasksTC = createAsyncThunk('tasks/fetchTasks', async (todolistId: string, thunkAPI) => {
        thunkAPI.dispatch(setAppStatusAC({status: 'loading'}))
        try {
            const res = await todolistsAPI.getTasks(todolistId)

            const tasks = res.data.items
            thunkAPI.dispatch(setAppStatusAC({status: 'succeeded'}))
            return {tasks, todolistId}
        } catch (e) {
            if (axios.isAxiosError<{ message: string }>(e)) {
                const error = e.response?.data ? e.response?.data.message : e.message
                handleServerNetworkError(error, thunkAPI.dispatch)
            }
        }
    }
)
export const removeTaskTC = createAsyncThunk('tasks/removeTask', async (
    param: { taskId: string, todolistId: string }, thunkAPI) => {
    thunkAPI.dispatch(setAppStatusAC({status: 'loading'}))
    try {
        const res = await todolistsAPI.deleteTask(param.todolistId, param.taskId)

        if (res.data.resultCode === ResponseResultCode.OK) {
            thunkAPI.dispatch(setAppStatusAC({status: 'succeeded'}))
            return {taskId: param.taskId, todolistId: param.todolistId}
        } else {
            handleServerAppError(res.data, thunkAPI.dispatch);
        }
    } catch (e) {
        if (axios.isAxiosError<{ message: string }>(e)) {
            const error = e.response?.data ? e.response?.data.message : e.message
            handleServerNetworkError(error, thunkAPI.dispatch)
        }
    }
})

const slice = createSlice({
    name: 'tasks',
    initialState,
    reducers: {
        addTaskAC(state, action: PayloadAction<TaskType>) {
            state[action.payload.todoListId].unshift(action.payload)
        },
        updateTaskAC(state, action: PayloadAction<{ taskId: string, model: UpdateDomainTaskModelType, todolistId: string }>) {
            const tasks = state[action.payload.todolistId]
            const index = tasks.findIndex(tl => tl.id === action.payload.taskId)
            if (index > -1) {
                tasks[index] = {...tasks[index], ...action.payload.model}
            }
        }
    },
    extraReducers: (builder) => {
        builder.addCase(addTodolistAC, (state, action) => {
            state[action.payload.todolist.id] = []
        });
        builder.addCase(removeTodolistAC, (state, action) => {
            delete state[action.payload.id]
        });
        builder.addCase(setTodolistsAC, (state, action) => {
            action.payload.todolists.forEach(tl => {
                state[tl.id] = []
            })
        });
        builder.addCase(fetchTasksTC.fulfilled, (state, action) => {
            if (action.payload) {
                state[action.payload.todolistId] = action.payload.tasks
            }
        });
        builder.addCase(removeTaskTC.fulfilled, (state, action) => {
            if (action.payload) {
                const tasks = state[action.payload.todolistId]
                const index = tasks.findIndex(tl => {
                    if (action.payload) return tl.id === action.payload.taskId
                })
                if (index > -1) {
                    tasks.splice(index, 1)
                }
            }
        });
    }
})

export const tasksReducer = slice.reducer
export const {addTaskAC, updateTaskAC} = slice.actions

// thunks
export const addTaskTC = (title: string, todolistId: string) => async (dispatch: Dispatch) => {
    dispatch(setAppStatusAC({status: 'loading'}))
    try {
        const res = await todolistsAPI.createTask(todolistId, title)

        if (res.data.resultCode === ResponseResultCode.OK) {
            const task = res.data.data.item
            const action = addTaskAC(task)
            dispatch(action)
            dispatch(setAppStatusAC({status: 'succeeded'}))
        } else {
            handleServerAppError(res.data, dispatch);
        }
    } catch (e) {
        if (axios.isAxiosError<{ message: string }>(e)) {
            const error = e.response?.data ? e.response?.data.message : e.message
            handleServerNetworkError(error, dispatch)
        }
    }
}
export const updateTaskTC = (taskId: string, model: UpdateDomainTaskModelType, todolistId: string) => async (dispatch: Dispatch, getState: () => AppRootStateType) => {
    const state = getState()
    const task = state.tasks[todolistId].find(t => t.id === taskId)
    if (!task) {
        //throw new Error("task not found in the state");
        console.warn('task not found in the state')
        return
    }

    const apiModel: UpdateTaskModelType = {
        deadline: task.deadline,
        description: task.description,
        priority: task.priority,
        startDate: task.startDate,
        title: task.title,
        status: task.status,
        ...model
    }

    try {
        const res = await todolistsAPI.updateTask(todolistId, taskId, apiModel)

        if (res.data.resultCode === ResponseResultCode.OK) {
            const action = updateTaskAC({taskId, model, todolistId})
            dispatch(action)
        } else {
            handleServerAppError(res.data, dispatch);
        }
    } catch (e) {
        if (axios.isAxiosError<{ message: string }>(e)) {
            const error = e.response?.data ? e.response?.data.message : e.message
            handleServerNetworkError(error, dispatch)
        }
    }
}

// types
export type UpdateDomainTaskModelType = {
    title?: string
    description?: string
    status?: TaskStatuses
    priority?: TaskPriorities
    startDate?: string
    deadline?: string
}
export type TasksStateType = {
    [key: string]: Array<TaskType>
}
