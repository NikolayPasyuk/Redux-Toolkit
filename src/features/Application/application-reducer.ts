import {authAPI} from '../../api/todolists-api';
import {
    handleAsyncServerAppError,
    handleServerNetworkError
} from '../../utils/error-utils';
import axios from 'axios';
import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import {authActions} from '../Auth';
import {ResponseResultCode} from '../../api/types';
import {appActions} from '../CommonActions/App';

const initializeApp = createAsyncThunk('application/initializeApp', async (param, thunkAPI) => {
    thunkAPI.dispatch(appActions.setAppStatus({status: 'loading'}))
    try {
        const res = await authAPI.me()

        if (res.data.resultCode === ResponseResultCode.OK) {
            thunkAPI.dispatch(authActions.setIsLoggedIn({value: true}))
            thunkAPI.dispatch(appActions.setAppStatus({status: 'succeeded'}))
        } else {
            handleAsyncServerAppError(res.data, thunkAPI);
        }
    } catch (e) {
        if (axios.isAxiosError<{ message: string }>(e)) {
            const error = e.response?.data ? e.response?.data.message : e.message
            handleServerNetworkError(error, thunkAPI.dispatch)
        }
        return thunkAPI.rejectWithValue({})
    } finally {
        thunkAPI.dispatch(appActions.setIsInitialized({isInitialized: true}))
    }
})

export const asyncActions = {
    initializeApp
}

export const slice = createSlice({
    name: 'app',
    initialState: {
        status: 'idle',
        error: null,
        isInitialized: false
    } as InitialStateType,
    reducers: {},
    extraReducers: builder => {
        builder
            .addCase(initializeApp.fulfilled, (state) => {
                state.isInitialized = true
            })
            .addCase(appActions.setAppStatus, (state, action) => {
                state.status = action.payload.status
            })
            .addCase(appActions.setAppError, (state, action) => {
                state.error = action.payload.error
            })
            .addCase(appActions.setIsInitialized, (state, action) => {
                state.isInitialized = action.payload.isInitialized
            });
    }
})

export type InitialStateType = {
    status: RequestStatusType,
    error: string | null,
    isInitialized: boolean
}

export type RequestStatusType = 'idle' | 'loading' | 'succeeded' | 'failed'