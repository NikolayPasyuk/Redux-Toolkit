import {
    appActions
} from '../features/CommonActions/App'
import {Dispatch} from 'redux'
import {ResponseType} from '../api/types';

export const handleServerNetworkError = (error: string, dispatch: Dispatch, showError = true) => {
    if (showError) {
        dispatch(appActions.setAppError({error: error ? error : 'Some error occurred'}))
    }
    dispatch(appActions.setAppStatus({status: 'failed'}))
}

type thunkAPIType = {
    dispatch: (action: any) => any
    rejectWithValue: Function
}

export const handleAsyncServerAppError = <D>(data: ResponseType<D>, thunkAPI: thunkAPIType, showError = true) => {
    if (showError) {
        thunkAPI.dispatch(appActions.setAppError({
            error: data.messages.length ? data.messages[0] :
                'Some error occurred'
        }))
    }
    thunkAPI.dispatch(appActions.setAppStatus({status: 'failed'}))

    return thunkAPI.rejectWithValue({
        errors: data.messages,
        fieldsErrors: data.fieldsErrors
    })
}
