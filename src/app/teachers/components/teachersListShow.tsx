'use client';

import { use, useState } from "react";


interface Teachers{
    _id : string;
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

export default function TeachersList(){
    const [teachersList, setTeachersList] = useState<Teachers[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError]= useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [teacherEditForm, setTeacherEditForm] = useState<Teachers | null> (null);
    const [showTeacherEditForm, setShowTeacherEditForm] = useState(false);

     


    return(
    <>
    
    </>)
    
}
