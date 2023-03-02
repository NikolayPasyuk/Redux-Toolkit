import {
    setAppErrorAC,
    setAppStatusAC
} from '../app/app-reducer'
import {ResponseType} from '../api/todolists-api'
import {Dispatch} from 'redux'

export const handleServerAppError = <D>(data: ResponseType<D>, dispatch: Dispatch) => {
    if (data.messages.length) {
        dispatch(setAppErrorAC({error: data.messages[0]}))
    } else {
        dispatch(setAppErrorAC({error: 'Some error occurred'}))
    }
    dispatch(setAppStatusAC({status: 'failed'}))
}

export const handleServerNetworkError = (error: string, dispatch: Dispatch) => {
    dispatch(setAppErrorAC({error: error ? error : 'Some error occurred'}))
    dispatch(setAppStatusAC({status: 'failed'}))
}
