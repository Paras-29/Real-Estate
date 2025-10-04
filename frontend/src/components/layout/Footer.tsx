
import { Link } from "react-router-dom";
import { Facebook, Instagram, Linkedin, Twitter } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-estate-gray text-white">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div>
          <div className="w-64 h-32">
            <Link to="/">
              <img src="/kamaupoot logo.webp" className="w-full h-full " alt="Kamaaupoot Logo" />
            </Link>

            
          </div>
            <p className="text-sm text-black mb-4">
              Your platform for real estate team building and commission management.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-black hover:text-estate-gold transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-black hover:text-estate-gold transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-black hover:text-estate-gold transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-black hover:text-estate-gold transition-colors">
                <Linkedin size={20} />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg text-black font-semibold mb-4">For Agents</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/register" className="text-black hover:text-estate-gold transition-colors">
                  Join Kaamupoot
                </Link>
              </li>
              <li>
                <Link to="/commissions" className="text-black hover:text-estate-gold transition-colors">
                  Commission Structure
                </Link>
              </li>
              <li>
                <Link to="/team" className="text-black hover:text-estate-gold transition-colors">
                  Team Building
                </Link>
              </li>
              <li>
                <Link to="/properties" className="text-black hover:text-estate-gold transition-colors">
                  Properties
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg text-black font-semibold mb-4">For Companies</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/register" className="text-black hover:text-estate-gold transition-colors">
                  Register Company
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-black hover:text-estate-gold transition-colors">
                  Admin Dashboard
                </Link>
              </li>
              <li>
                <a href="#" className="text-black hover:text-estate-gold transition-colors">
                  Broker Solutions
                </a>
              </li>
              <li>
                <a href="#" className="text-black hover:text-estate-gold transition-colors">
                  Integration
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg text-black font-semibold mb-4">Contact</h3>
            <ul className="space-y-2 text-black">
              <li>Email: info@Kamaaupoot.com</li>
              <li>Phone: +1 (555) 123-4567</li>
              <li>123 Real Estate Avenue</li>
              <li>New York, NY 10001</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-12 pt-6 flex flex-col md:flex-row justify-between items-center text-sm text-black">
          <p>© 2025 Kamaaupoot. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-estate-gold transition-colors">Terms</a>
            <a href="#" className="hover:text-estate-gold transition-colors">Privacy</a>
            <a href="#" className="hover:text-estate-gold transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
