// resources/js/Components/MyUi/Navbar.tsx

// Tentukan tipe props untuk Navbar
interface NavbarProps {
    collapsed: boolean;
}

export default function Navbar({ collapsed }: NavbarProps) {
    // Tentukan padding kiri secara dinamis
    const paddingLeft = collapsed ? 'pl-20' : 'pl-64';

    return (
        <header
            className={`w-full h-16 bg-white shadow-md flex items-center px-4 fixed top-0 z-10 transition-all duration-300 ease-in-out ${paddingLeft}`}
        >
            <h1 className="text-xl font-semibold text-gray-800">Dashboard</h1>
        </header>
    );
}