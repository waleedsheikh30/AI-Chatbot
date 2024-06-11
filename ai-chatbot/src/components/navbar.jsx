// Navbar.js

import React from 'react';
import logo from '../assets/enigma2.png'

function Navbar() {
    return (
        <nav className="bg-gray-900 shadow-lg p-3">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex-shrink-0">
                        <h2 className="text-3xl text-white font-serif">Enigma</h2>
                    </div>
                    <div className="flex">
                        <div className="flex space-x-4">
                            <img className="h-[120px] ml-5" src={logo} alt="Enigma Logo" />
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
