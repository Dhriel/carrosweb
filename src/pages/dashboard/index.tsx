import {useEffect, useState, useContext} from 'react';
import {AuthContext} from '../../contexts/AuthContext';
import Container from "../../components/container";
import {DashboardHedaer} from '../../components/painelheader';

import {FiTrash2} from 'react-icons/fi'

import {getDocs, collection, where, query, doc, deleteDoc} from 'firebase/firestore';
import {db, storage} from '../../services/firebaseConnection';
import {ref, deleteObject} from 'firebase/storage';

interface CarProps {
    id: string;
    name: string;
    year: string;
    uid: string;
    price: number | string;
    city: string;
    km: number | string;
    images: CarImageProps[];
}

interface CarImageProps{
    name: string;
    url: string;
    uid: string;
}

export default function Dashboard(){
    const [cars, setCars] = useState<CarProps[]>([]);

    const {user} = useContext(AuthContext);

    useEffect(()=>{

        function loadCars(){

            if(!user?.uid){
                return;
            }

            const carsRef = collection(db, 'cars');
            const queryRef = query(carsRef, where('uid', '==', user.uid));

            getDocs(queryRef)
            .then((snapshot)=>{
                
                let listCars = [] as CarProps[];

                snapshot.forEach((doc)=>{
                    listCars.push({
                        id: doc.id,
                        name: doc.data().name,
                        year: doc.data().year,
                        uid: doc.data().uid,
                        price: doc.data().price,
                        city: doc.data().city,
                        km: doc.data().km,
                        images: doc.data().images
                    })
                });

                setCars(listCars);
            })
            .catch((err)=>{
                console.log(err)
            })


            
        }

        loadCars();

    }, []);

    async function handleDeleteCar(car: CarProps){
        const itemCar = car;

        const docRef = doc(db, 'cars', itemCar.id);
        await deleteDoc(docRef);

        itemCar.images.map( async (image) => {
            const imagePath = `images/${car.uid}/${image.name}`

            const imageRef = ref(storage, imagePath);
            try{
                await deleteObject(imageRef);
                setCars(cars.filter(item => item.id !== itemCar.id));
            }catch(err){
                console.log(`Erro ao excluir essa imagem: ${err}`);
            }
        })
    }

    return(
        <Container>
            <DashboardHedaer/>

            <main className=" grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {cars.map((car)=>(
                    <section className="w-full bg-white rounded-lg relative" key={car.id}>
                        <button className="absolute right-4 top-4 bg-white rounded-full w-10 h-10 flex justify-center items-center drop-shadow-sm"
                            onClick={()=>handleDeleteCar(car)}
                        >
                            <FiTrash2 size={24} color={'#000'}/>
                        </button>
                        <img
                            className="w-full rounded-lg mb-2 max-h-70"
                            src={car.images[0].url}
                        />
                        <p className="font-bold mt-1 px-2 mb-2">{car.name}</p>

                        <div className="flex flex-col px-2">
                            <span className="text-zinc-700">
                                {car.km} | {car.year}
                            </span>
                            <strong className="mt-4 ">
                                R$ {car.price}
                            </strong>

                            <div className="w-full h-px bg-slate-200 my-2">
                                <div className=" pb-2">
                                    <span className="text-black">{car.city}</span>
                                </div>
                            </div>
                        </div>
                    </section>
                ))}
            </main>
        </Container>
    )
}