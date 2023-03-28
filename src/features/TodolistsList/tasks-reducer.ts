import {todolistsAPI} from '../../api/todolists-api'
import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import {appActions} from '../CommonActions/App';
import axios from 'axios';
import {
    handleAsyncServerAppError,
    handleServerNetworkError
} from '../../utils/error-utils';
import {asyncActions as asyncTodolistsActions} from './todolists-reducer';
import {AppRootStateType, ThunkError} from '../../utils/types';
import {
    ResponseResultCode,
    TaskPriorities,
    TaskStatuses,
    TaskType,
    UpdateTaskModelType
} from '../../api/types';

const initialState: TasksStateType = {}

export const fetchTasks = createAsyncThunk('tasks/fetchTasks', async (todolistId: string, thunkAPI) => {
    thunkAPI.dispatch(appActions.setAppStatus({status: 'loading'}))
    try {
        const res = await todolistsAPI.getTasks(todolistId)

        const tasks = res.data.items
        thunkAPI.dispatch(appActions.setAppStatus({status: 'succeeded'}))
        return {tasks, todolistId}
    } catch (e) {
        if (axios.isAxiosError<{ message: string }>(e)) {
            const error = e.response?.data ? e.response?.data.message : e.message
            handleServerNetworkError(error, thunkAPI.dispatch)
        }
    }
})
export const removeTask = createAsyncThunk('tasks/removeTask', async (
    param: { taskId: string, todolistId: string }, thunkAPI) => {
    thunkAPI.dispatch(appActions.setAppStatus({status: 'loading'}))
    try {
        const res = await todolistsAPI.deleteTask(param.todolistId, param.taskId)
        if (res.data.resultCode === ResponseResultCode.OK) {
            thunkAPI.dispatch(appActions.setAppStatus({status: 'succeeded'}))
            return {taskId: param.taskId, todolistId: param.todolistId}
        } else {
            handleAsyncServerAppError(res.data, thunkAPI);
        }
    } catch (e) {
        if (axios.isAxiosError<{ message: string }>(e)) {
            const error = e.response?.data ? e.response?.data.message : e.message
            handleServerNetworkError(error, thunkAPI.dispatch)
        }
    }
})
export const addTask = createAsyncThunk<TaskType, { title: string, todolistId: string },
    ThunkError>('tasks/addTask', async (
    param, thunkAPI) => {
    thunkAPI.dispatch(appActions.setAppStatus({status: 'loading'}))
    try {
        const res = await todolistsAPI.createTask(param.todolistId, param.title)
        if (res.data.resultCode === ResponseResultCode.OK) {
            thunkAPI.dispatch(appActions.setAppStatus({status: 'succeeded'}))
            return res.data.data.item
        } else {
            return handleAsyncServerAppError(res.data, thunkAPI)
        }
    } catch (e) {
        if (axios.isAxiosError<{ message: string }>(e)) {
            const error = e.response?.data ? e.response?.data.message : e.message
            handleServerNetworkError(error, thunkAPI.dispatch, false)

            return thunkAPI.rejectWithValue({
                errors: [e.message],
                fieldsErrors: undefined
            })
        }
    }
})
export const
    updateTask = createAsyncThunk('tasks/ updateTask', async (
        param: { taskId: string, model: UpdateDomainTaskModelType, todolistId: string }, thunkAPI) => {
        thunkAPI.dispatch(appActions.setAppStatus({status: 'loading'}))
        const state = thunkAPI.getState() as AppRootStateType
        const task = state.tasks[param.todolistId].find(t => t.id === param.taskId)
        if (!task) {
            return thunkAPI.rejectWithValue('task not found in the state')
        }

        const apiModel: UpdateTaskModelType = {
            deadline: task.deadline,
            description: task.description,
            priority: task.priority,
            startDate: task.startDate,
            title: task.title,
            status: task.status,
            ...param.model
        }
        try {
            const res = await todolistsAPI.updateTask(param.todolistId, param.taskId, apiModel)

            if (res.data.resultCode === ResponseResultCode.OK) {
                thunkAPI.dispatch(appActions.setAppStatus({status: 'succeeded'}))
                return param
            } else {
                return handleAsyncServerAppError(res.data, thunkAPI);
            }
        } catch (e) {
            if (axios.isAxiosError<{ message: string }>(e)) {
                const error = e.response?.data ? e.response?.data.message : e.message
                handleServerNetworkError(error, thunkAPI.dispatch)
            }
            return thunkAPI.rejectWithValue(null)
        }
    })
export const asyncActions = {
    fetchTasks,
    removeTask,
    addTask,
    updateTask
}


export const slice = createSlice({
    name: 'tasks',
    initialState,
    reducers: {},
    extraReducers: builder => {
        builder
            .addCase(asyncTodolistsActions.addTodolistTC.fulfilled, (state, action) => {
                state[action.payload.todolist.id] = []
            })
            .addCase(asyncTodolistsActions.removeTodolistTC.fulfilled, (state, action) => {
                delete state[action.payload.id]
            })
            .addCase(asyncTodolistsActions.fetchTodolistsTC.fulfilled, (state, action) => {
                action.payload.todolists.forEach((tl) => {
                    state[tl.id] = []
                })
            })
            .addCase(fetchTasks.fulfilled, (state, action) => {
                if (action.payload) {
                    state[action.payload.todolistId] = action.payload.tasks
                }
            })
            .addCase(removeTask.fulfilled, (state, action) => {
                if (action.payload) {
                    const tasks = state[action.payload.todolistId]
                    const index = tasks.findIndex(t => {
                        if (action.payload) return t.id === action.payload.taskId
                    })
                    if (index > -1) {
                        tasks.splice(index, 1)
                    }
                }
            })
            .addCase(addTask.fulfilled, (state, action) => {
                state[action.payload.todoListId].unshift(action.payload)
            })
            .addCase(updateTask.fulfilled, (state, action) => {
                const tasks = state[action.payload.todolistId]
                const index = tasks.findIndex(t => t.id === action.payload.taskId)
                if (index > -1) {
                    tasks[index] = {...tasks[index], ...action.payload.model}
                }
            });
    }
})

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
