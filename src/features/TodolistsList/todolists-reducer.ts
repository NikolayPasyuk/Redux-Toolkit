import {ResponseResultCode, todolistsAPI, TodolistType} from '../../api/todolists-api'
import {Dispatch} from 'redux'
import {RequestStatusType, setAppStatusAC,} from '../../app/app-reducer'
import {handleServerAppError, handleServerNetworkError} from '../../utils/error-utils';
import axios from 'axios';
import {createSlice, PayloadAction} from '@reduxjs/toolkit';

const initialState: Array<TodolistDomainType> = []

const slice = createSlice({
    name: 'todolists',
    initialState: initialState,
    reducers: {
        removeTodolistAC(state, action: PayloadAction<{ id: string }>) {
            const index = state.findIndex(tl => tl.id === action.payload.id)
            if (index > -1) {
                state.splice(index, 1)
            }
        },
        addTodolistAC(state, action: PayloadAction<{ todolist: TodolistType }>) {

        },
        changeTodolistTitleAC(state, action: PayloadAction<{ id: string, title: string }>) {

        },
        changeTodolistFilterAC(state, action: PayloadAction<{ id: string, filter: FilterValuesType }>) {

        },
        changeTodolistEntityStatusAC(state, action: PayloadAction<{ id: string, status: RequestStatusType }>) {

        },
        setTodolistsAC(state, action: PayloadAction<{ todolists: Array<TodolistType> }>) {

        },
    }
})

export const todolistsReducer = slice.reducer
export const {
    removeTodolistAC,
    addTodolistAC,
    changeTodolistTitleAC,
    changeTodolistFilterAC,
    changeTodolistEntityStatusAC,
    setTodolistsAC
} = slice.actions
//     (state: Array<TodolistDomainType> = initialState, action: ActionsType): Array<TodolistDomainType> => {
//     switch (action.type) {
//         case 'REMOVE-TODOLIST':
//             return state.filter(tl => tl.id !== action.id)
//         case 'ADD-TODOLIST':
//             return [{...action.todolist, filter: 'all', entityStatus: 'idle'}, ...state]
//
//         case 'CHANGE-TODOLIST-TITLE':
//             return state.map(tl => tl.id === action.id ? {
//                 ...tl,
//                 title: action.title
//             } : tl)
//         case 'CHANGE-TODOLIST-FILTER':
//             return state.map(tl => tl.id === action.id ? {
//                 ...tl,
//                 filter: action.filter
//             } : tl)
//         case 'CHANGE-TODOLIST-ENTITY-STATUS':
//             return state.map(tl => tl.id === action.id ? {
//                 ...tl,
//                 entityStatus: action.status
//             } : tl)
//         case 'SET-TODOLISTS':
//             return action.todolists.map(tl => ({
//                 ...tl,
//                 filter: 'all',
//                 entityStatus: 'idle'
//             }))
//         default:
//             return state
//     }
// }

//actions

// thunks
export const fetchTodolistsTC = () => async (dispatch: Dispatch) => {
    dispatch(setAppStatusAC({status: 'loading'}))
    try {
        const res = await todolistsAPI.getTodolists()

        dispatch(setTodolistsAC({todolists: res.data}))
        dispatch(setAppStatusAC({status: 'succeeded'}))
    } catch (e) {
        if (axios.isAxiosError<{ message: string }>(e)) {
            const error = e.response?.data ? e.response?.data.message : e.message
            handleServerNetworkError(error, dispatch)
        }
    }
}
export const removeTodolistTC = (todolistId: string) => async (dispatch: Dispatch) => {
    dispatch(setAppStatusAC({status: 'loading'}))
    dispatch(changeTodolistEntityStatusAC({id: todolistId, status: 'loading'}))
    try {
        const res = await todolistsAPI.deleteTodolist(todolistId)

        if (res.data.resultCode === ResponseResultCode.OK) {
            dispatch(removeTodolistAC({id: todolistId}))
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
export const addTodolistTC = (title: string) => async (dispatch: Dispatch) => {
    dispatch(setAppStatusAC({status: 'loading'}))
    try {
        const res = await todolistsAPI.createTodolist(title)

        if (res.data.resultCode === ResponseResultCode.OK) {
            dispatch(addTodolistAC({todolist: res.data.data.item}))
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
export const changeTodolistTitleTC = (id: string, title: string) => async (dispatch: Dispatch) => {
    dispatch(setAppStatusAC({status: 'loading'}))
    try {
        const res = await todolistsAPI.updateTodolist(id, title)

        if (res.data.resultCode === ResponseResultCode.OK) {
            dispatch(changeTodolistTitleAC({id: id, title}))
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

// types
export type AddTodolistActionType = ReturnType<typeof addTodolistAC>;
export type RemoveTodolistActionType = ReturnType<typeof removeTodolistAC>;
export type SetTodolistsActionType = ReturnType<typeof setTodolistsAC>;
type ActionsType =
    | RemoveTodolistActionType
    | AddTodolistActionType
    | ReturnType<typeof changeTodolistTitleAC>
    | ReturnType<typeof changeTodolistFilterAC>
    | SetTodolistsActionType
    | ReturnType<typeof changeTodolistEntityStatusAC>
export type FilterValuesType = 'all' | 'active' | 'completed';
export type TodolistDomainType = TodolistType & {
    filter: FilterValuesType
    entityStatus: RequestStatusType
}
