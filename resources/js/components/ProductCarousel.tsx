import { Swiper, SwiperSlide } from 'swiper/react';
// Modul Autoplay sudah diimpor, kita akan menggunakannya di kedua Swiper
import { Autoplay, Pagination, Navigation } from 'swiper/modules';

// Import CSS Swiper
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

// Asumsi route() dari Ziggy sudah tersedia secara global
declare function route(name: string, params?: any): string;

// Definisikan tipe data product yang lebih lengkap
export interface Product {
    id: number;
    name:string;
    price: number;
    stock: number;
    sku: string;
    images: { image_path: string }[];
}

// Definisikan props untuk komponen
interface Props {
    products: Product[];
    onProductClick: (product: Product) => void;
}

export default function ProductCarousel({ products, onProductClick }: Props) {
    return (
        <div className="w-full relative">
            <Swiper
                modules={[Autoplay, Pagination, Navigation]}
                spaceBetween={16}
                slidesPerView={2}
                breakpoints={{
                    640: { slidesPerView: 2, spaceBetween: 16 },
                    768: { slidesPerView: 3, spaceBetween: 20 },
                    1024: { slidesPerView: 4, spaceBetween: 24 },
                    1280: { slidesPerView: 5, spaceBetween: 24 },
                }}
                autoplay={{
                    delay: 5000,
                    disableOnInteraction: true,
                }}
                navigation
                pagination={{ clickable: true }}
                className="py-2"
            >
                {products.map((product) => {
                    const isOutOfStock = product.stock === 0;

                    return (
                        <SwiperSlide key={product.id} className="select-none">
                            <div
                                onClick={() => !isOutOfStock && onProductClick(product)}
                                className={`
                                    relative border rounded-lg overflow-hidden shadow-sm bg-card text-card-foreground
                                    transition-transform duration-200 ease-in-out
                                    ${isOutOfStock
                                        ? 'cursor-not-allowed'
                                        : 'cursor-pointer hover:-translate-y-1 hover:shadow-md hover:border-primary'
                                    }
                                `}
                            >
                                {/* Overlay Stok Habis */}
                                {isOutOfStock && (
                                    <div className="absolute inset-0 bg-red-700/60 flex items-center justify-center z-20">
                                        <span className="text-white font-bold text-xl uppercase tracking-wider">Habis</span>
                                    </div>
                                )}

                                {/* Gambar Produk */}
                                <div className="w-full h-50 bg-background">
                                    {product.images.length > 0 ? (
                                        <Swiper
                                            modules={[Pagination, Autoplay]}
                                            pagination={{ clickable: true, dynamicBullets: true }}
                                            loop={true}
                                            autoplay={{
                                                delay: 3000,
                                                disableOnInteraction: false,
                                                pauseOnMouseEnter: true
                                            }}
                                            className="w-full h-full"
                                            onMouseDown={(e) => e.stopPropagation()}
                                            onTouchStart={(e) => e.stopPropagation()}
                                        >
                                            {product.images.map((image, index) => (
                                                <SwiperSlide key={index}>
                                                    <img
                                                        src={
                                                            image.image_path.startsWith('http')
                                                                ? image.image_path
                                                                : `/storage/${image.image_path}`
                                                        }
                                                        alt={`${product.name} - ${index + 1}`}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </SwiperSlide>
                                            ))}
                                        </Swiper>
                                    ) : (
                                        <img
                                            src={'https://via.placeholder.com/150'}
                                            alt={product.name}
                                            className="w-full h-full object-cover"
                                        />
                                    )}
                                </div>

                                {/* Detail Produk */}
                                <div className="p-3">
                                    <h3 className="font-semibold truncate" title={product.name}>
                                        {product.name}
                                    </h3>
                                    {/* --- BARIS INI YANG DIUBAH --- */}
                                    <p className="text-sm text-muted-foreground">
                                        {new Intl.NumberFormat('id-ID', {
                                            style: 'currency',
                                            currency: 'IDR',
                                            minimumFractionDigits: 0
                                        }).format(product.price)}
                                    </p>
                                     <p className="text-sm text-muted-foreground">
                                        {product.sku}
                                     </p>
                                    <div className={`text-xs font-medium mt-1 ${isOutOfStock ? 'text-destructive font-bold' : 'text-green-500 font-semibold'}`}>
                                        {isOutOfStock ? 'Habis' : 'Available'}
                                    </div>
                                </div>
                            </div>
                        </SwiperSlide>
                    );
                })}
            </Swiper>
        </div>
    );
}