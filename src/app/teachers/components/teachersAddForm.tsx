
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
        const newErrors : Partial<Record<keyof TeacherData, string>> = {};

        if(!formData.teacherName){
            newErrors.teacherName ='Teacher name is required';
            
        }
        else if(formData.teacherName.length < 3){
            newErrors.teacherName= 'Teacher name must be at least 3 charaxhetrs';
        }

        if(!formData.teacherPhone){
            newErrors.teacherPhone ='Teacher phone must be exactly 10 digits';
        }
        else if(!/^\d{10}$/.test(formData.teacherPhone)){
            newErrors.teacherPhone = 'Teacher phone must be exactly 10 digits';
        }

        if(!formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Invalid email address';
        }

        if(!formData.board){
            newErrors.board = 'Board is required' 
        }

     }

    
    return(<>
    
    </>)



}