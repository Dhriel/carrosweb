import {useContext} from 'react';
import {AuthContext} from '../../contexts/AuthContext';
import logoImg from '../../assets/logo.svg';
import { Link } from 'react-router-dom';
import {FiUser, FiLogIn} from 'react-icons/fi'

export default function Header(){
    const {signed,  loadingAuth} = useContext(AuthContext);

    return(
        <div className='w-full flex item-center justfy-center h16 bg-white drop-shadow mb-4'>
            <header className='flex w-full max-w-7xl items-center justify-between px-4 mx-auto'>
                <Link to='/'>
                    <img src={logoImg} alt='Logo do site'/>
                </Link>

               {!loadingAuth && signed && (
                <Link to='/dashboard'>
                    <div className='border-2 rounded-full p-1 border-gray-500'>
                        <FiUser size={22} color={'#000'}/>
                    </div>
                </Link>
               )}

                {!loadingAuth && !signed && (
                <Link to='/login'>
                    <FiLogIn size={22} color={'#000'}/>
                </Link>
               )}

            </header>
        </div>
    )
}