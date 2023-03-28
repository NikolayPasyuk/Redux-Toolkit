import {ActionCreatorsMapObject, bindActionCreators} from 'redux';
import {useMemo} from 'react';
import {useDispatch} from 'react-redux';
import {AppThunkDispatch} from './types';

export const useAppDispatch = () => useDispatch<AppThunkDispatch>();

export function useActions<T extends ActionCreatorsMapObject>(actions: T) {
    const dispatch = useAppDispatch()

    const boundActions = useMemo(() => {
        return bindActionCreators(actions, dispatch)
    }, [])
    return boundActions
}