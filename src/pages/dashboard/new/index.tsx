import {ChangeEvent, useState, useContext} from 'react';
import Container from "../../../components/container"
import { DashboardHedaer } from "../../../components/painelheader";
import {FiUpload, FiTrash} from "react-icons/fi";

import {Input} from '../../../components/input';

import {useForm} from 'react-hook-form';
import { z } from 'zod';
import {zodResolver} from '@hookform/resolvers/zod';
import { AuthContext } from '../../../contexts/AuthContext';

// import uuid   e import @types/uuid --save-dev
import {v4 as uuidV4} from 'uuid';

import {storage, db} from '../../../services/firebaseConnection';
import {ref,uploadBytes, getDownloadURL, deleteObject} from 'firebase/storage'; 
import {addDoc, collection} from 'firebase/firestore';

import {toast} from 'react-hot-toast';



const schema = z.object({
    name: z.string().min(1, 'O campo nome é obrigatório'),
    model: z.string().min(1, 'O campo modelo é obrigatório'),
    year: z.string().min(1, 'O ano do carro é obrigatório'),
    km: z.string().min(1, 'O Km do carro é obrigatório'),
    price: z.string().min(1, 'O preço é obrigatório'),
    city: z.string().min(1, 'A cidade é obrigatória'),
    whatsapp: z.string().min(1, 'O telefone é obrigatório').refine((value)=> /^(\d{11,12})$/.test(value), {
        message: 'Número de telefone inválido'
    }),
    description: z.string().min(1, 'A descrição é obrigatória'), 

})

type FormData = z.infer<typeof schema>

interface ImageItemProps{
    uid: string;
    name: string;
    previewURL: string;
    url: string;
}

export default function New(){
    const {user} = useContext(AuthContext);
    const [carImages, setCarImages] = useState<ImageItemProps[]>([]);
    
    const {register, handleSubmit, formState: {errors}, reset, } = useForm<FormData>({
        resolver: zodResolver(schema),
        mode: 'onChange'
    });


    function onSubmit(data: FormData){
        if(carImages.length === 0){
            toast.error('Envie pelo menos uma imagem!', );
            return;
        }

        // Para retirar a PreviewURL e mandar para o firebase
        const carListIamges = carImages.map(car => {
            return{
                uid: car.uid,
                name: car.name,
                url: car.url
            }
        });

        addDoc(collection(db, 'cars'),{
            name: data.name.toUpperCase(),
            model: data.model,
            year: data.year,
            km: data.km,
            price: data.price,
            city: data.city,
            whatsapp: data.whatsapp,
            description: data.description,
            created: new Date(),
            owner: user?.name,
            uid: user?.uid,
            images: carListIamges
        })
        .then(()=>{
            reset();
            setCarImages([]);
            console.log('Cadastrado com sucesso!');
        })
        .catch((error)=>{
            console.log(error);
            console.log('Erro ao cadastrar no banco')
        })
    };

    async function handleFile(e: ChangeEvent<HTMLInputElement>){
        if(e.target.files && e.target.files[0]){
            const image = e.target.files[0];
            
            if(image.type === 'image/jpeg' || image.type === 'image/png'){
                await handleUpload(image);
            }else{
                alert('Envie uma imagem jpeg ou png');
                return;
            }

        }
    }

    async function handleUpload(image: File){
        if(!user?.uid){
            return;
        }

        const currentUid = user?.uid;
        const uidImage = uuidV4();

        const uploadRef = ref(storage,`images/${currentUid}/${uidImage}`);

        uploadBytes(uploadRef, image)
        .then((snapshot)=>{
            getDownloadURL(snapshot.ref).then((downloadURL)=>{
                const imageItem = {
                    name: uidImage,
                    uid: currentUid,
                    previewURL: URL.createObjectURL(image),
                    url: downloadURL
                }

                setCarImages((images) => [...images, imageItem] )
                console.log(imageItem)


            })
        })
    }

    async function handleDeleteImage(item: ImageItemProps){
        const imagePath = `images/${item.uid}/${item.name}`;

        const imageRef = ref(storage, imagePath);

        try{
            
            await deleteObject(imageRef);
            setCarImages(carImages.filter((car)=> car.url !== item.url))


        }catch(err){
            console.log('Erro ao deletar');
        }
    }

    return(
        <Container>
            <DashboardHedaer/>
            <h1>Página de cadastrar novo carro</h1>
            <div className="w-full bg-white p-3 rounded-log flex flex-col sm:flex-row items-center gap-2">
                <button className='border-2 w-48 rounded-lg flex items-center justify-center cursor-pointer border-gray-600 h-40'>
                    <div className="absolute cursor-pointer">
                        <FiUpload size={30}/>
                    </div>
                    <div className="cursor-pointer">
                        <input
                            type="file" accept="image/"
                            className="opacity-0 cursor-pointer"
                            onChange={handleFile}
                        />
                    </div>
                </button>

                {carImages?.map(item => (
                    <div key={item.name}className='w-full h-40 max-w-sm flex items-center justify-center rel'>
                        <button className='absolute'
                            onClick={()=> handleDeleteImage(item)}
                        ><FiTrash size={28} color="#fff"/></button>
                        <img
                            src={item.previewURL}
                            className='rounded-lg w-full h-40 object-cover'
                            alt='Foto do carro'
                        />
                    </div>
                ))}
            </div>

            <div className="w-full bg-white p-3 rounded-lg flex flex-col sm:flex-row items-center gap-2 mt-2">
                
                <form className="w-full " onSubmit={handleSubmit(onSubmit)}>
                    <div className="mb-3">
                        <p className="mb-2 font-medium">Nome do Carro</p>
                        <Input
                            type='text'
                            register={register}
                            name="name"
                            error={errors.name?.message}
                            placheholder="Onix 1.0"

                        />
                    </div>

                    <div className="mb-3">
                        <p className="mb-2 font-medium">Modelo do Carro</p>
                        <Input
                            type='text'
                            register={register}
                            name="model"
                            error={errors.model?.message}
                            placheholder="1.0 Flex PLUS MANUAL"

                        />
                    </div>
                    
                    <div className="flex w-full mb-3 flex-row items-center gap-4">
                        <div className="w-full">
                            <p className="mb-2 font-medium">Ano</p>
                            <Input
                                type='text'
                                register={register}
                                name="year"
                                error={errors.year?.message}
                                placheholder="2016/2016"

                            />
                        </div>
                        <div className="w-full">
                            <p className="mb-2 font-medium">Km rodado</p>
                            <Input
                                type='text'
                                register={register}
                                name="km"
                                error={errors.km?.message}
                                placheholder="23.900"

                            />
                        </div>
                    </div>

                    <div className="flex w-full mb-3 flex-row items-center gap-4">
                        <div className="w-full">
                            <p className="mb-2 font-medium">Cidade</p>
                            <Input
                                type='text'
                                register={register}
                                name="city"
                                error={errors.city?.message}
                                placheholder="Rio de Janeiro"

                            />
                        </div>
                        <div className="w-full">
                            <p className="mb-2 font-medium">Telefone/WhatsApp</p>
                            <Input
                                type='text'
                                register={register}
                                name="whatsapp"
                                error={errors.whatsapp?.message}
                                placheholder="11 40028922"

                            />
                        </div>
                    </div>

                    <div className="mb-3">
                        <p className="mb-2 font-medium">Preço</p>
                        <Input
                            type='text'
                            register={register}
                            name="price"
                            error={errors.price?.message}
                            placheholder="65.000"

                        />
                    </div>

                    <div className="mb-3">
                        <p className="mb-2 font-medium">Descrição</p>
                        <textarea
                            className="border-2 w-full rounded-md h-24 px-2 p-1"
                            {...register('description')}
                            name="description"
                            id="description"
                            placeholder="Digite a descrição completa sobre o carro"
                        />
                        {errors && <p className="mb-1 text-red-600">{errors.description?.message}</p>}
                    </div>

                    <button type="submit"
                        className="rounded-md bg-zinc-900 font-medium text-white h-10 w-full"
                    >
                        Cadastrar
                    </button>
                    
                </form>
                

            </div>
        </Container>
    )
}