import {authAPI, ResponseResultCode} from '../api/todolists-api';
import {handleServerAppError, handleServerNetworkError} from '../utils/error-utils';
import axios from 'axios';
import {setIsLoggedInAC} from '../features/Login/auth-reducer';
import {Dispatch} from 'redux';
import {createSlice, PayloadAction} from '@reduxjs/toolkit';

const initialState: InitialStateType = {
    status: 'idle',
    error: null,
    isInitialized: false
}

const slice = createSlice({
    name: 'app',
    initialState: initialState,
    reducers: {
        setAppErrorAC(state, action: PayloadAction<{ error: string | null }>) {
            state.error = action.payload.error
        }
    }
})

export const appReducer = slice.reducer
//     (state: InitialStateType = initialState, action: ActionsType): InitialStateType => {
//     switch (action.type) {
//         case 'APP/SET-STATUS':
//             return {...state, status: action.status}
//         case 'APP/SET-IS-INITIALIZED':
//             return {...state, isInitialized: action.isInitialized}
//         default:
//             return {...state}
//     }
// }

export type RequestStatusType = 'idle' | 'loading' | 'succeeded' | 'failed'
export type InitialStateType = {
    // происходит ли сейчас взаимодействие с сервером
    status: RequestStatusType
    // если ошибка какая-то глобальная произойдёт - мы запишем текст ошибки сюда
    error: string | null,
    isInitialized: boolean
}

export const setAppErrorAC = (error: string | null) => ({
    type: 'APP/SET-ERROR',
    error
} as const)
export const setAppStatusAC = (status: RequestStatusType) => ({
    type: 'APP/SET-STATUS',
    status
} as const)
export const setIsInitializedAC = (isInitialized: boolean) => ({
    type: 'APP/SET-IS-INITIALIZED',
    isInitialized
} as const)


export const initializeAppTC = () => async (dispatch: Dispatch) => {
    dispatch(setAppStatusAC('loading'))
    try {
        const res = await authAPI.me()

        if (res.data.resultCode === ResponseResultCode.OK) {
            dispatch(setIsLoggedInAC({value: true}))
            dispatch(setAppStatusAC('succeeded'))
        } else {
            handleServerAppError(res.data, dispatch);
        }
    } catch (e) {
        if (axios.isAxiosError<{ message: string }>(e)) {
            const error = e.response?.data ? e.response?.data.message : e.message
            handleServerNetworkError(error, dispatch)
        }
    } finally {
        dispatch(setIsInitializedAC(true))
    }
}


export type SetAppErrorActionType = ReturnType<typeof setAppErrorAC>
export type SetAppStatusActionType = ReturnType<typeof setAppStatusAC>
