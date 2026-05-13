'use client';

import { GoogleOAuthProvider } from '@react-oauth/google';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import StepOneCompany from './StepOneCompany';
import StepTwoAdmin from './StepTwoAdmin';
import { toast } from 'sonner';

export default function RegisterForm() {
    const searchParams = useSearchParams();
    const initialPlan = searchParams.get('plan') || 'standard';
    const paymentError = searchParams.get('error');

    const [step, setStep] = useState(1);
    const [plans, setPlans] = useState([]);
    const [isCloudManaged, setIsCloudManaged] = useState(true);

    const [formData, setFormData] = useState({
        tenant_name: '', vat_number: '', subdomain: '', db_type: 'hosted', plan_name: initialPlan,
        province: '', city: '', street: '', suite: '', primary_color: '#3B82F6', logo: '',
        admin_firstname: '', admin_lastname: '', admin_email: '', admin_password: '', admin_profile_picture: ''
    });

    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});

    const reservedSubdomains = ['www', 'api', 'admin', 'master', 'app', 'test'];

    useEffect(() => {
        async function fetchPlans() {
            try {
                const PHP_API_URL = 'http://localhost/ANH-PROJECT/API/plans';
                const res = await fetch(PHP_API_URL);
                const json = await res.json();

                if (json.code === 200 || json.status === 'OK') {
                    const sortedPlans = json.data.sort((a, b) => parseFloat(a.Price) - parseFloat(b.Price));
                    setPlans(sortedPlans);
                }
            } catch (error) {
                console.error("Errore fetch piani: ", error);
            }
        }

        fetchPlans();
    }, []);

    useEffect(() => {
        const selectedPlan = plans.find(p => p.Name.toLowerCase() === formData.plan_name.toLowerCase());
        
        if (selectedPlan) {
            // Caso A: I piani sono stati caricati dal DB
            const cloudAllowed = selectedPlan.Cloud_Managed == 1;
            setIsCloudManaged(cloudAllowed);

            if (!cloudAllowed && formData.db_type !== 'private') {
                setFormData(prev => ({ ...prev, db_type: 'private'}));
            }
        } else {
            // Caso B (Fallback): L'API non ha risposto, usiamo le option statiche
            const cloudAllowed = formData.plan_name !== 'basic'; // Solo il basic non ha il cloud
            setIsCloudManaged(cloudAllowed);
            
            if (!cloudAllowed && formData.db_type !== 'private') {
                setFormData(prev => ({ ...prev, db_type: 'private'}));
            }
        }
    }, [formData.plan_name, plans]); 

    useEffect(() => {
        if (paymentError === 'payment_cancelled') {
            toast.error("Hai annullato il pagamento. Non ti è stato addebitato nulla.");
        }
    }, [paymentError]);

    const validateField = (id, value) => {
        let error = '';

        switch (id) {
            case 'tenant_name':
                if (!value.trim()) error = 'Il nome dell\'azienda è obbligatorio';
                else if (value.length > 255) error = "Massimo 255 caratteri";
                break;
            case 'vat_number': 
                const vatClean = value.replace(/[^A-Za-z0-9]/g, '');
                if (!vatClean) error = 'La partita IVA è obbligatoria';
                else if (/^[A-Za-z]{2}/.test(vatClean)) {
                    if (!/^[A-Za-z]{2}[A-Za-z0-9]{8,12}$/.test(vatClean)) error = 'Formato VIES non valido';
                } else {
                    if (!/^[0-9]{11}$/.test(vatClean)) error = 'La Partita IVA deve avere 11 numeri';
                }
                break;
            case 'subdomain': 
                if(!value) error = 'Il sottodominio è obbligatorio';
                else if (!/^[a-z0-9-]+$/.test(value)) error = 'Solo lettere minuscole, numeri e trattini';
                else if (reservedSubdomains.includes(value)) error = 'Sottodominio riservato';
                break;
            case 'province':
                if (value && !/^[A-Za-z]{2}$/.test(value)) error = 'La provincia deve essere una sigla di 2 lettere';
                break;
            case 'primary_color':
                const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
                if (!hexRegex.test(value)) error = 'Formato colore esadecimale non valido';
                break;
            case 'admin_firstname':
                if(!value.trim()) error = 'Il nome è obbligatorio';
                break;
            case 'admin_lastname':
                if(!value.trim()) error = 'Il cognome è obbligatorio';
                break;
            case 'admin_email': 
                if(!value.trim()) error = 'L\'email è obbligatoria';
                else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = 'Formato email non valido';
                break;
            case 'admin_password': 
                if (!value) error = "La password è obbligatoria";
                else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(value))
                    error = 'Minimo 8 caratteri, 1 maiuscola, 1 numero e 1 carattere speciale';
                break;
            default: 
                break;
        }

        setErrors(prev => ({ ...prev, [id]: error}));
        return error === '';
    };

    const handleChange = (e) => {
        const { id, value } = e.target;

        if (id === 'tenant_name' && !touched.subdomain) {
            const generatedSubdomain = value.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
            setFormData(prev => ({ ...prev, tenant_name: value, subdomain: generatedSubdomain.substring(0, 32) }));
        } else {
            setFormData(prev => ({ ...prev, [id]: value}));
        }

        if (touched[id]) validateField(id, value);
    };

    const handleBlur = (e) => {
        const { id, value } = e.target;
        setTouched(prev => ({ ...prev, [id]: true }));
        validateField(id, value);
    };

    const handleImageUpload = (e, fieldName) => {
        const file = e.target.files[0];
        if (!file) return;

        // Controllo sul tipo 
        const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            toast.error('Formato non supportato. Si accettano solo JPG, PNG o WEBP');
            e.target.value = '';
            return;
        }

        // Controllo sul peso (Massimo 2MB)
        const maxSizeInBytes = 2 * 1024 * 1024;
        if (file.size > maxSizeInBytes) {
            toast.error('L\'immagine è troppo pesante. Limite massimo di 2MB');
            e.target.value = '';
            return;
        }

        // Controlli superati
        const reader = new FileReader();
        reader.onloadend = () => {
            setFormData(prev => ({ ...prev, [fieldName]: reader.result }));
        };
        reader.readAsDataURL(file);
    }

    const handleNextStep = () => {
        const firstStepFields = ['tenant_name', 'vat_number', 'subdomain', 'province', 'primary_color'];
        let isValid = true; 
        const newTouched = { ...touched };

        firstStepFields.forEach(field => {
            newTouched[field] = true;
            if (!validateField(field, formData[field])) isValid = false;
        });

        setTouched(newTouched);
        if (isValid) setStep(2);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const secondStepFields = ['admin_firstname', 'admin_lastname', 'admin_email', 'admin_password'];
        let isValid = true;
        const newTouched = { ...touched };

        secondStepFields.forEach(field => {
            newTouched[field] = true;
            if (!validateField(field, formData[field])) isValid = false;
        });

        setTouched(newTouched);

        if (isValid) {
            try {
                const PHP_API_URL = 'http://localhost/ANH-PROJECT/API/auth/register';
                const response = await fetch(PHP_API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });

                const data = await response.json();

                if (response.ok || data.code === 201) {
                    if (data.data && data.data.checkout_url) {
                        toast.loading("Reindirizzamento al pagamento sicuro...");
                        
                        window.location.href = data.data.checkout_url; 
                        return; 
                    }
                } else {
                    toast.error('Errore: ' + (data.message || 'Si è verificato un errore durante la registrazione'));
                }
            } catch (error) {
                console.error('Errore di rete: ', error);
                toast.error('Si è verificato un errore di connessione con il server');
            }
        }
    };

    const handleGoogleLogin = async (googleToken) => {
        try {
            toast.loading("Verifica con Google in corso...");

            const payload = {
                tenant_name: formData.tenant_name,
                subdomain: formData.subdomain,
                vat_number: formData.vat_number,
                plan_name: formData.plan_name,
                db_type: formData.db_type,
                google_token: googleToken
            }

            if (formData.province) payload.province = formData.province;
            if (formData.city) payload.city = formData.city;
            if (formData.street) payload.street = formData.street;
            if (formData.suite) payload.suite = formData.suite;
            if (formData.primary_color) payload.primary_color = formData.primary_color;
            if (formData.logo) payload.logo = formData.logo;

            const res = await fetch("http://localhost/ANH-PROJECT/API/auth/google", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            const json = await res.json();
            toast.dismiss();

            if (res.ok) {
                toast.success("Workspace creato con Google! Benvenuto.");
            } else {
                toast.error(json.message || "Errore durante la registrazione con Google")
            }
        } catch (error) {
            toast.dismiss();
            toast.error("Errore di rete durante la connessione ai server");
        }
    }

    const propsForChildren = {
        formData, errors, touched, plans, isCloudManaged, handleChange, handleBlur, handleImageUpload, onNext: handleNextStep, setStep, onSubmit: handleSubmit, onGoogleLogin: handleGoogleLogin
    };

    return (
        <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}>
            <div className="max-w-xl w-full bg-white dark:bg-[#0f1623] p-8 sm:p-10 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-xl relative z-10">
                {step === 1 ? (
                    <StepOneCompany {...propsForChildren} />
                ) : (
                    <StepTwoAdmin {...propsForChildren} />
                )}
            </div>
        </GoogleOAuthProvider>
    );
}