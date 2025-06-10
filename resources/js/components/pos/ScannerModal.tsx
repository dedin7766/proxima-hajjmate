import React, { useState, useRef, useEffect } from 'react';
import Webcam from 'react-webcam';
import { BrowserMultiFormatReader, NotFoundException } from '@zxing/library';
import { X, Camera, Upload } from 'lucide-react';

interface ScannerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onScan: (barcode: string) => void;
    codeReader: BrowserMultiFormatReader | null;
}

export default function ScannerModal({ isOpen, onClose, onScan, codeReader }: ScannerModalProps) {
    const webcamRef = useRef<Webcam>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [error, setError] = useState<string | null>(null);
    const [isCameraActive, setCameraActive] = useState(false);

    const handleClose = () => {
        setCameraActive(false);
        setError(null);
        codeReader?.reset();
        onClose();
    };

    const startScanner = () => {
        setError(null);
        if (!webcamRef.current?.video || !codeReader) {
            setTimeout(startScanner, 200);
            return;
        }
        codeReader.decodeFromVideoDevice(undefined, webcamRef.current.video, (result, err) => {
            if (result) {
                onScan(result.getText());
                handleClose();
            }
            if (err && !(err instanceof NotFoundException)) {
                setError('Gagal memindai barcode. Coba lagi.');
            }
        }).catch(() => setError('Kamera tidak ditemukan atau akses ditolak.'));
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !codeReader) return;
        setError(null);
        const imageUrl = URL.createObjectURL(file);
        try {
            const result = await codeReader.decodeFromImageUrl(imageUrl);
            if (result) {
                onScan(result.getText());
                handleClose();
            } else {
                setError('Tidak ada barcode yang terdeteksi.');
            }
        } catch (err) {
            setError('Gagal membaca barcode dari gambar.');
        } finally {
            URL.revokeObjectURL(imageUrl);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    useEffect(() => {
        if (isOpen && isCameraActive) {
            startScanner();
        } else {
            codeReader?.reset();
        }
        return () => {
            codeReader?.reset();
        };
    }, [isOpen, isCameraActive, codeReader]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-card rounded-xl p-6 w-full max-w-lg relative border">
                <button onClick={handleClose} className="absolute top-3 right-3 text-muted-foreground hover:text-foreground">
                    <X size={24} />
                </button>
                <h3 className="text-xl font-semibold mb-4 text-center text-foreground">Pindai barcode booking</h3>
                {isCameraActive ? (
                    <>
                        <div className='bg-muted rounded-md w-full h-[300px] flex items-center justify-center overflow-hidden'>
                            <Webcam audio={false} ref={webcamRef} screenshotFormat="image/jpeg" videoConstraints={{ facingMode: 'environment' }} className="object-cover w-full h-full" />
                        </div>
                        <button onClick={() => setCameraActive(false)} className="w-full mt-4 bg-secondary text-secondary-foreground py-2 rounded-lg hover:bg-secondary/80 font-semibold">Kembali</button>
                    </>
                ) : (
                    <div className="flex flex-col gap-4 mt-6">
                        <button onClick={() => setCameraActive(true)} className="w-full bg-primary text-primary-foreground py-4 rounded-lg hover:bg-primary/90 text-lg font-semibold flex items-center justify-center gap-3"><Camera size={22} /> Gunakan Kamera</button>
                        <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
                        <button onClick={() => fileInputRef.current?.click()} className="w-full bg-green-600 text-white py-4 rounded-lg hover:bg-green-700 text-lg font-semibold flex items-center justify-center gap-3"><Upload size={22} /> Unggah Gambar</button>
                    </div>
                )}
                {error && <p className="text-destructive mt-3 text-center text-sm">Error: {error}</p>}
            </div>
        </div>
    );
}