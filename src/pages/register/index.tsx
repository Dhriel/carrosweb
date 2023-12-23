import {useEffect, useContext} from 'react';
import {AuthContext} from '../../contexts/AuthContext';

import logoImg from '../../assets/logo.svg';
import Container from '../../components/container';
import {Link, useNavigate} from 'react-router-dom';

import { Input } from '../../components/input';

import {useForm} from 'react-hook-form';
import {z} from 'zod';
import {zodResolver} from '@hookform/resolvers/zod';

import { auth } from '../../services/firebaseConnection';
import { createUserWithEmailAndPassword, updateProfile, signOut } from 'firebase/auth';

import {toast} from 'react-hot-toast';


const schema = z.object({
    name: z.string().min(1,'O campo nome não pode estar vázio.'),
    email: z.string().email("Insira um e-mail válido").nonempty('O campo e-mail é obrigatório'),
    password: z.string().min(6, 'A senha deve conter no mínimo 6 caracteres').nonempty('O campo senha é obrigatório'),
});

type FormData = z.infer<typeof schema>

export default function Register(){
    const navigate = useNavigate();

    const { handleInfoUser } = useContext(AuthContext);

    const {register, handleSubmit, formState: {errors }} = useForm<FormData>({
        resolver: zodResolver(schema),
        mode: 'onChange'
    });

    useEffect(()=>{
        
        async function handleLogout(){
            await signOut(auth);
        }

        handleLogout();

    },[])

    async function onSubmit(data: FormData){
        createUserWithEmailAndPassword(auth, data.email, data.password)
        .then(async (user) =>{

            await updateProfile(user.user, {
                displayName: data.name
            })

            handleInfoUser({
                name: data.name,
                email: data.email,
                uid: user.user.uid
            })
            
            toast.success('Bem-vindo ao WebCarros!');
            navigate('/', {replace: true});

        })
        .catch((err)=>{
            console.log('Erro ao cadastrar usuário: ' + err)
        })
    }

    return(
        <Container>
            <div className='w-full min-h-screen flex justify-center items-center flex-col gap-4'>
                <Link to='/' className='mb-6 max-w-sm w-full'>
                    <img
                        src={logoImg}
                        alt='Logo do Site'
                        className='w-full'
                    />
                </Link>

                <form className='bg-white max-w-xl w-full rounded-lg p-4'
                    onSubmit={handleSubmit(onSubmit)}
                >

                <div className='mb-3'>
                    <Input
                        type='text'
                        placheholder= 'Digite seu nome completo'
                        name="name"
                        error={errors.name?.message}
                        register={register}
                    />
                </div>

                <div className='mb-3'>
                    <Input
                        type='email'
                        placheholder= 'Digite seu e-mail...'
                        name="email"
                        error={errors.email?.message}
                        register={register}
                    />
                </div>

                <div className='mb-3'>
                    <Input
                        type='password'
                        placheholder= '********'
                        name="password"
                        error={errors.password?.message}
                        register={register}
                    />
                </div>

                    <button type='submit'
                     className='bg-zinc-900 w-full rounded-md text-white h-10 font-medium'>
                        Cadastrar
                    </button>
                </form>
                <Link className='-mt-4' to='/login'>Já possui uma conta?</Link>
            </div>
        </Container>
    )
}