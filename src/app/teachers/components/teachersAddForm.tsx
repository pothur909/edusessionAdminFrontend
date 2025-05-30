
'use client';

import { useState } from 'react';

export default function TeacherForm({onSuccess}){
    
    interface TeacherData{
        teacherName: string;
        teacherPhone: string;
        email: string;
        board: string;
        class: string;
        subjects: string [];
        experience: string;
        city: string;
        qualification: string;
        resume: string;
        note: string;
        passport: string;
        educationStatus: string;
        dayAvailablity: string;
        timeAvailability: string;
        equipmentOwn: string;
    }

     const [formData, setFormData] = useState<TeacherData>({
         teacherName: '',
        teacherPhone: '',
        email: '',
        board: '',
        class: '',
        subjects:  [],
        experience: '',
        city: '',
        qualification: '',
        resume: '',
        note: '',
        passport: '',
        educationStatus: '',
        dayAvailablity: '',
        timeAvailability: '',
        equipmentOwn: '',
     })
      
     const [errors, setErrors]= useState<Partial<Record<keyof TeacherData, string>>>({};

     const handleChange =(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>{
        const {name, value, type} = e.target;
    //    setFormData(prev =>{
    //     let newFormData;

    //     if
    //    })

     }

     const validate =()=>{
        const newErrors : Partial<Record<keyoof TeacherData, string>> = {}
     }

    
    return(<>
    
    </>)



}