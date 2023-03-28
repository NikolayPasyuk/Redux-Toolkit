import React, {useCallback, useEffect} from 'react'
import {
    AddItemForm,
    AddItemFormSubmitHelperType
} from '../../../components/AddItemForm/AddItemForm'
import {EditableSpan} from '../../../components/EditableSpan/EditableSpan'
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import {Delete} from '@mui/icons-material';
import {Task} from './Task/Task'
import {FilterValuesType, TodolistDomainType} from '../todolists-reducer'
import {tasksActions, todolistsActions} from '../index';
import Paper from '@mui/material/Paper';
import {useActions, useAppDispatch} from '../../../utils/redux-utils';
import {TaskStatuses, TaskType} from '../../../api/types';

type PropsType = {
    todolist: TodolistDomainType
    tasks: Array<TaskType>
}

export const Todolist = React.memo(function ({...props}: PropsType) {

    const {
        changeTodolistFilter,
        removeTodolistTC,
        changeTodolistTitleTC,
    } = useActions(todolistsActions)
    const {fetchTasks} = useActions(tasksActions)

    const dispatch = useAppDispatch()

    useEffect(() => {
        fetchTasks(props.todolist.id)
    }, [])

    const addTaskCallback = useCallback(async (title: string, helper: AddItemFormSubmitHelperType) => {
        let thunk = tasksActions.addTask({title, todolistId: props.todolist.id})
        const resultAction = await dispatch(thunk)

        if (tasksActions.addTask.rejected.match(resultAction)) {
            if (resultAction.payload?.errors?.length) {
                const errorMessage = resultAction.payload?.errors[0]
                helper.setError(errorMessage)
            } else {
                helper.setError('Some error occurred')
            }
        } else {
            helper.setTitle('')
        }
    }, [props.todolist.id])

    const removeTodolist = () => {
        removeTodolistTC(props.todolist.id)
    }
    const changeTodolistTitle = useCallback((title: string) => {
        changeTodolistTitleTC({id: props.todolist.id, title})
    }, [props.todolist.id])

    const onFilterButtonClickHandler = useCallback((filter: FilterValuesType) => changeTodolistFilter({
        filter: filter,
        id: props.todolist.id
    }), [props.todolist.id])

    let tasksForTodolist = props.tasks

    if (props.todolist.filter === 'active') {
        tasksForTodolist = props.tasks.filter(t => t.status === TaskStatuses.New)
    }
    if (props.todolist.filter === 'completed') {
        tasksForTodolist = props.tasks.filter(t => t.status === TaskStatuses.Completed)
    }

    const renderFilterButton = (
        buttonFilter: FilterValuesType,
        color: ButtonColor,
        text: string) => {
        return <Button
            variant={props.todolist.filter === buttonFilter ? 'outlined' : 'text'}
            onClick={() => onFilterButtonClickHandler(buttonFilter)}
            color={color}
        >{text}
        </Button>
    }

    return <Paper style={{padding: '10px', position: 'relative'}}>
        <IconButton
            size={'small'}
            onClick={removeTodolist}
            disabled={props.todolist.entityStatus === 'loading'}
            style={{position: 'absolute', right: '5px', top: '5px'}}
        >
            <Delete  fontSize={'small'}/>
        </IconButton>
        <h3>
            <EditableSpan value={props.todolist.title} onChange={changeTodolistTitle}/>
        </h3>
        <AddItemForm addItem={addTaskCallback}
                     disabled={props.todolist.entityStatus === 'loading'}/>
        <div>
            {
                tasksForTodolist.map(t => <Task key={t.id} task={t}
                                                todolistId={props.todolist.id}
                />)
            }
            {!tasksForTodolist.length && <div style={{padding: '10px', color: 'grey'}}>
                No tasks</div>}
        </div>
        <div style={{paddingTop: '10px'}}>
            {renderFilterButton('all', 'inherit', 'All')}
            {renderFilterButton('active', 'primary', 'Active')}
            {renderFilterButton('completed', 'secondary', 'Completed')}
        </div>
    </Paper>
})


type ButtonColor =
    'inherit'
    | 'primary'
    | 'secondary'
    | 'success'
    | 'error'
    | 'info'
    | 'warning'