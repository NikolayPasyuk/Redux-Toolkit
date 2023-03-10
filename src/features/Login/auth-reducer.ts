import {Dispatch} from 'redux'
import {setAppStatusAC} from '../../app/app-reducer'
import {authAPI, LoginParamsType, ResponseResultCode} from '../../api/todolists-api';
import {handleServerAppError, handleServerNetworkError} from '../../utils/error-utils';
import axios from 'axios';
import {createAsyncThunk, createSlice, PayloadAction} from '@reduxjs/toolkit';


export const loginTC = createAsyncThunk('auth/login', async (param: LoginParamsType, thunkAPI) => {
    thunkAPI.dispatch(setAppStatusAC({status: 'loading'}))
    try {
        const res = await authAPI.login(param)

        if (res.data.resultCode === ResponseResultCode.OK) {
            thunkAPI.dispatch(setAppStatusAC({status: 'succeeded'}))
            return {isLoggedIn: true}
        } else {
            handleServerAppError(res.data, thunkAPI.dispatch);
            return {isLoggedIn: false}
        }
    } catch (e) {
        if (axios.isAxiosError<{ message: string }>(e)) {
            const error = e.response?.data ? e.response?.data.message : e.message
            handleServerNetworkError(error, thunkAPI.dispatch)
        }
        return {isLoggedIn: false}
    }
})

const slice = createSlice({
    name: 'auth',
    initialState: {
        isLoggedIn: false
    },
    reducers: {
        setIsLoggedInAC(state, action: PayloadAction<{ value: boolean }>) {
            state.isLoggedIn = action.payload.value
        }
    },
    extraReducers: (builder) => {
        builder.addCase(loginTC.fulfilled, (state, action) => {
            state.isLoggedIn = action.payload.isLoggedIn
        })
    }
})

export const authReducer = slice.reducer
export const {setIsLoggedInAC} = slice.actions

// thunks
export const logoutTC = () => async (dispatch: Dispatch) => {
    dispatch(setAppStatusAC({status: 'loading'}))
    try {
        const res = await authAPI.logout()

        if (res.data.resultCode === ResponseResultCode.OK) {
            dispatch(setIsLoggedInAC({value: false}))
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
