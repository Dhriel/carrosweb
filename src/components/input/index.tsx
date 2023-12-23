import { RegisterOptions, UseFormRegister } from "react-hook-form";

interface InputProps {
    type: string;
    placheholder: string;
    name: string;
    register: UseFormRegister<any>;
    error?: string;
    rules?: RegisterOptions
}


export function Input({name, placheholder, type, register, rules, error}: InputProps){
    return(
        <div>
            <input
                className="w-full border-2 rounded-md h-11 p-2"
                type={type}
                placeholder={placheholder}
                {...register(name, rules)}
                id={name}
            />

            {error && <p className="mb-1 text-red-600">{error}</p>}
        </div>
    )
}