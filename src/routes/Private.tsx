import {ReactNode, useContext} from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

import Container from '../components/container';

interface PrivateProps{
    children: ReactNode;
}

export function Private({children} : PrivateProps) : any {

    const {loadingAuth, signed}  = useContext(AuthContext);

    if(loadingAuth){
        return (
            <Container>
                <div className='div-2xl font-medium'>Carregando...</div>
            </Container>
        )
    }

    if(!signed){
        return <Navigate to='/login' />
    }

    return children;
}