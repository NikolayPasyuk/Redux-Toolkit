import React, {useEffect} from 'react'
import './App.css'
import {TodolistsList} from '../features/TodolistsList'
import {appActions} from '../features/Application'
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import LinearProgress from '@mui/material/LinearProgress';
import {Menu} from '@mui/icons-material';
import {ErrorSnackbar} from '../components/ErrorSnackbar/ErrorSnackbar';
import {Navigate, Route, Routes} from 'react-router-dom';
import CircularProgress from '@mui/material/CircularProgress';
import {authActions, authSelectors, Login} from '../features/Auth';
import {selectIsInitialized, selectStatus} from './selectors';
import {useActions} from '../utils/redux-utils';
import {useAppSelector} from '../utils/types';

function App() {
    const status = useAppSelector(selectStatus)
    const isInitialized = useAppSelector(selectIsInitialized)
    const isLoggedIn = useAppSelector(authSelectors.selectIsLoggedIn)

    const {logout} = useActions(authActions)
    const {initializeApp} = useActions(appActions)

    const onClickLogoutHandler = (() => logout())

    useEffect(() => {
        initializeApp()
    }, [])

    if (!isInitialized) {
        return <div
            style={{position: 'fixed', top: '30%', textAlign: 'center', width: '100%'}}>
            <CircularProgress/>
        </div>
    }


    return (
        <div className="App">
            <ErrorSnackbar/>
            <AppBar position="static">
                <Toolbar>
                    <IconButton edge="start" color="inherit" aria-label="menu">
                        <Menu/>
                    </IconButton>
                    <Typography variant="h6">
                        News
                    </Typography>
                    {isLoggedIn &&
                        <Button color="inherit" onClick={onClickLogoutHandler}>Log
                            out</Button>}
                </Toolbar>
                {status === 'loading' && <LinearProgress/>}
            </AppBar>
            <Container fixed>
                <Routes>
                    <Route path="" element={<TodolistsList/>}/>
                    <Route path="login" element={<Login/>}/>
                    <Route path="404"
                           element={<h1 style={{textAlign: 'center'}}>
                               404: PAGE NOT FOUND</h1>}/>
                    <Route path="*" element={<Navigate to={'404'}/>}/>
                </Routes>
            </Container>
        </div>
    )
}

export default App
