import {createAction} from '@reduxjs/toolkit';
import {RequestStatusType} from '../Application/application-reducer';

const setAppStatus = createAction<{ status: RequestStatusType }>('app/setAppStatus')
const setAppError = createAction<{ error: string | null }>('app/setAppError')
const setIsInitialized = createAction<{ isInitialized: boolean }>('app/setIsInitialized')

export const appActions = {
    setAppStatus,
    setAppError,
    setIsInitialized
}