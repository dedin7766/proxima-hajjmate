// resources/js/Pages/Customers/Create.tsx

import AppLayout from '@/layouts/app-layout';
import { type PageProps, type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import Tesseract from 'tesseract.js';
import { cn } from '@/lib/utils'; // -> Import cn utility untuk menggabungkan kelas dengan aman

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Customers', href: route('customers.index') },
    { title: 'Create', href: route('customers.create'), isCurrent: true },
];

export default function Create({ auth }: PageProps) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        nik: '',
        tempat_lahir: '',
        tanggal_lahir: '',
        jenis_kelamin: '',
        address: '',
        rt: '',
        rw: '',
        kel_desa: '',
        kecamatan: '',
        agama: '',
        status_perkawinan: '',
        pekerjaan: '',
        phone: '',
        ktp_photo: null as File | null,
    });

    const [isOcrLoading, setIsOcrLoading] = useState(false);
    const [ocrProgress, setOcrProgress] = useState(0);
    const [ocrStatus, setOcrStatus] = useState('Idle...');
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [autoFilledFields, setAutoFilledFields] = useState<string[]>([]);

    useEffect(() => {
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    const handleOcrProcess = async (e: React.ChangeEvent<HTMLInputElement>) => {
        // ... (Logika handleOcrProcess tetap sama persis seperti sebelumnya)
        if (!e.target.files || e.target.files.length === 0) return;

        const file = e.target.files[0];
        setIsOcrLoading(true);
        setPreviewUrl(null);
        setAutoFilledFields([]);
        reset('ktp_photo');
        setData('ktp_photo', file);

        try {
            const worker = await Tesseract.createWorker('ind', 1, { logger: m => {
                setOcrStatus(m.status);
                if (m.status === 'recognizing text') setOcrProgress(Math.round(m.progress * 100));
            }});
            const { data: { text } } = await worker.recognize(file);
            await worker.terminate();
            setOcrStatus('Parsing data...');

            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
            setPreviewUrl(URL.createObjectURL(file));

            const extractedData: { [key: string]: string } = {};
            const patterns = {
                nik: /NIK\s*[:]?\s*(\d{16})/i,
                name: /Nama\s*[:]?\s*([^\n]+)/i,
                ttl: /Tempat.(?:Tgl|Tgi) Lahir\s*[:]?\s*([^,]+,\s*\d{2}-\d{2}-\d{4})/i,
                gender: /Jenis Kelamin\s*[:]?\s*([^\n]+)/i,
                address: /Alamat\s*[:]?\s*([^\n]+)/i,
                rt_rw: /RT\/RW\s*[:]?\s*([^\n]+)/i,
                village: /(?:Kel.Desa|KellDesa)\s*[-—:\s]*([^\n]+)/i,
                district: /Kecamatan\s*[:]?\s*([^\n]+)/i,
                religion: /Agama\s*[:]?\s*([^\n]+)/i,
                marital_status: /Status Perkawinan\s*[:]?\s*([^\n]+)/i,
                occupation: /Pekerjaan\s*[:]?\s*([^\n]+)/i,
            };

            const newAutoFilledFields: string[] = [];
            for (const [key, regex] of Object.entries(patterns)) {
                const match = text.match(regex);
                if (match && match[1]) {
                    extractedData[key] = match[1].replace(/:/g, '').trim();
                    newAutoFilledFields.push(key);
                }
            }

            if (extractedData.ttl) {
                const ttlParts = extractedData.ttl.split(',');
                if (ttlParts.length > 1) {
                    extractedData.tempat_lahir = ttlParts[0].trim();
                    newAutoFilledFields.push('tempat_lahir');
                    const dateParts = ttlParts[1].trim().match(/(\d{2})-(\d{2})-(\d{4})/);
                    if (dateParts) {
                        extractedData.tanggal_lahir = `${dateParts[3]}-${dateParts[2]}-${dateParts[1]}`;
                        newAutoFilledFields.push('tanggal_lahir');
                    }
                }
                delete extractedData.ttl;
            }

            if (extractedData.rt_rw) {
                const cleanRtRw = extractedData.rt_rw.split(' ')[0];
                const rtRwParts = cleanRtRw.split('/');
                if (rtRwParts.length > 1) {
                    extractedData.rt = rtRwParts[0].trim();
                    extractedData.rw = rtRwParts[1].trim();
                    newAutoFilledFields.push('rt', 'rw');
                }
                delete extractedData.rt_rw;
            }

            if (extractedData.gender) {
                extractedData.jenis_kelamin = extractedData.gender.split('Gol')[0].trim();
                newAutoFilledFields.push('jenis_kelamin');
            }

            if (extractedData.village) {
                extractedData.kel_desa = extractedData.village.split(' ')[0].trim();
                newAutoFilledFields.push('kel_desa');
                delete extractedData.village;
            }
            if (extractedData.religion) {
                extractedData.agama = extractedData.religion.split(' ')[0].trim();
                newAutoFilledFields.push('agama');
            }
            if (extractedData.marital_status) {
                extractedData.status_perkawinan = extractedData.marital_status;
                newAutoFilledFields.push('status_perkawinan');
                delete extractedData.marital_status;
            }
            if (extractedData.occupation) {
                extractedData.pekerjaan = extractedData.occupation;
                newAutoFilledFields.push('pekerjaan');
                delete extractedData.occupation;
            }
            if(extractedData.district) {
                extractedData.kecamatan = extractedData.district;
                newAutoFilledFields.push('kecamatan');
                delete extractedData.district;
            }

            setData(prevData => ({ ...prevData, ...extractedData }));
            setAutoFilledFields(Array.from(new Set(newAutoFilledFields))); // Pastikan unik

        } catch (error) {
            console.error("Tesseract OCR Error:", error);
            setData('ktp_photo', null);
        } finally {
            setIsOcrLoading(false);
            setOcrStatus('Idle...');
        }
    };

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/[^a-zA-Z\s'.]/g, ''); // Izinkan spasi, titik, dan apostrof
        setData('name', value);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('customers.store'));
    };
    
    // Helper untuk menambahkan kelas ring secara dinamis
    const autoFillClass = (fieldName: keyof typeof data) => {
        return autoFilledFields.includes(fieldName as string) ? 'ring-2 ring-green-500' : '';
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs} user={auth.user}>
            <Head title="Add Customer" />
            <Card>
                <CardHeader>
                    <CardTitle>Add New Customer</CardTitle>
                    <CardDescription>Fill the form below or upload a KTP image to autofill the form.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="mb-6 p-4 border-dashed border-2 rounded-lg text-center">
                        <Label htmlFor="ktp-upload" className="font-semibold text-lg">Scan KTP</Label>
                        <p className="text-sm text-muted-foreground mb-2">Upload KTP image to autofill the form.</p>
                        <Input id="ktp-upload" type="file" accept="image/*" onChange={handleOcrProcess} disabled={isOcrLoading} className="mx-auto block w-fit" />
                        {isOcrLoading && (
                            <div className="mt-2 flex items-center justify-center text-sm text-muted-foreground">
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                {ocrStatus} {ocrStatus === 'recognizing text' && `(${ocrProgress}%)`}
                            </div>
                        )}
                    </div>

                    <form onSubmit={submit} className="space-y-4">
                        
                        {previewUrl && (
                            <div className="mb-4">
                                <Label>KTP Photo Preview</Label>
                                <div className="mt-2">
                                    <img src={previewUrl} alt="KTP Preview" className="rounded-lg border max-w-sm w-full h-auto" />
                                </div>
                                {errors.ktp_photo && <p className="text-red-500 text-xs mt-1">{errors.ktp_photo}</p>}
                            </div>
                        )}

                        <div><Label htmlFor="nik">NIK</Label><Input id="nik" value={data.nik} onChange={e => setData('nik', e.target.value)} className={autoFillClass('nik')} />{errors.nik && <p className="text-red-500 text-xs mt-1">{errors.nik}</p>}</div>
                        <div><Label htmlFor="name">Name</Label><Input id="name" value={data.name} onChange={handleNameChange} className={autoFillClass('name')} />{errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}</div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div><Label htmlFor="tempat_lahir">Tempat Lahir</Label><Input id="tempat_lahir" value={data.tempat_lahir} onChange={e => setData('tempat_lahir', e.target.value)} className={autoFillClass('tempat_lahir')} />{errors.tempat_lahir && <p className="text-red-500 text-xs mt-1">{errors.tempat_lahir}</p>}</div>
                            <div><Label htmlFor="tanggal_lahir">Tanggal Lahir</Label><Input id="tanggal_lahir" type="date" value={data.tanggal_lahir} onChange={e => setData('tanggal_lahir', e.target.value)} className={autoFillClass('tanggal_lahir')} />{errors.tanggal_lahir && <p className="text-red-500 text-xs mt-1">{errors.tanggal_lahir}</p>}</div>
                        </div>

                        <div>
                            <Label htmlFor="jenis_kelamin">Jenis Kelamin</Label>
                            <Select
                                value={data.jenis_kelamin}
                                onValueChange={(value) => setData('jenis_kelamin', value)}
                            >
                                <SelectTrigger id="jenis_kelamin" className={cn("w-full", autoFillClass('jenis_kelamin'))}>
                                    <SelectValue placeholder="Pilih jenis kelamin..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="LAKI-LAKI">LAKI-LAKI</SelectItem>
                                    <SelectItem value="PEREMPUAN">PEREMPUAN</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.jenis_kelamin && <p className="text-red-500 text-xs mt-1">{errors.jenis_kelamin}</p>}
                        </div>
                        
                        <div><Label htmlFor="address">Alamat Jalan</Label><Textarea id="address" value={data.address} onChange={e => setData('address', e.target.value)} className={autoFillClass('address')} />{errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}</div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div><Label htmlFor="rt">RT</Label><Input id="rt" value={data.rt} onChange={e => setData('rt', e.target.value)} className={autoFillClass('rt')} />{errors.rt && <p className="text-red-500 text-xs mt-1">{errors.rt}</p>}</div>
                            <div><Label htmlFor="rw">RW</Label><Input id="rw" value={data.rw} onChange={e => setData('rw', e.target.value)} className={autoFillClass('rw')} />{errors.rw && <p className="text-red-500 text-xs mt-1">{errors.rw}</p>}</div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div><Label htmlFor="kel_desa">Kel/Desa</Label><Input id="kel_desa" value={data.kel_desa} onChange={e => setData('kel_desa', e.target.value)} className={autoFillClass('kel_desa')} />{errors.kel_desa && <p className="text-red-500 text-xs mt-1">{errors.kel_desa}</p>}</div>
                            <div><Label htmlFor="kecamatan">Kecamatan</Label><Input id="kecamatan" value={data.kecamatan} onChange={e => setData('kecamatan', e.target.value)} className={autoFillClass('kecamatan')} />{errors.kecamatan && <p className="text-red-500 text-xs mt-1">{errors.kecamatan}</p>}</div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div><Label htmlFor="agama">Agama</Label><Input id="agama" value={data.agama} onChange={e => setData('agama', e.target.value)} className={autoFillClass('agama')} />{errors.agama && <p className="text-red-500 text-xs mt-1">{errors.agama}</p>}</div>
                            <div>
                                <Label htmlFor="status_perkawinan">Status Perkawinan</Label>
                                <Select
                                    value={data.status_perkawinan}
                                    onValueChange={(value) => setData('status_perkawinan', value)}
                                >
                                    <SelectTrigger id="status_perkawinan" className={cn("w-full", autoFillClass('status_perkawinan'))}>
                                        <SelectValue placeholder="Pilih status perkawinan..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="BELUM KAWIN">BELUM KAWIN</SelectItem>
                                        <SelectItem value="KAWIN">KAWIN</SelectItem>
                                        <SelectItem value="CERAI HIDUP">CERAI HIDUP</SelectItem>
                                        <SelectItem value="CERAI MATI">CERAI MATI</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.status_perkawinan && <p className="text-red-500 text-xs mt-1">{errors.status_perkawinan}</p>}
                            </div>
                        </div>
                        
                        <div><Label htmlFor="pekerjaan">Pekerjaan</Label><Input id="pekerjaan" value={data.pekerjaan} onChange={e => setData('pekerjaan', e.target.value)} className={autoFillClass('pekerjaan')} />{errors.pekerjaan && <p className="text-red-500 text-xs mt-1">{errors.pekerjaan}</p>}</div>
                        <div><Label htmlFor="phone">Phone</Label><Input id="phone" value={data.phone} onChange={e => setData('phone', e.target.value)} />{errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}</div>
                        
                        <Button type="submit" disabled={processing || isOcrLoading}>Save Customer</Button>
                    </form>
                </CardContent>
            </Card>
        </AppLayout>
    );
}